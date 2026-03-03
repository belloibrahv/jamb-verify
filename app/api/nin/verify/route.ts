import { NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { db } from "@/db/client";
import { ninVerifications, walletTransactions, wallets } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { isValidNin, maskNin, normalizeNin } from "@/lib/nin";
import { verifyNinWithYouVerify } from "@/lib/youverify";
import { getFriendlyErrorMessage } from "@/lib/utils";
import { eq, sql } from "drizzle-orm";

export const runtime = "nodejs";

const schema = z.object({
  nin: z.string(),
  consent: z.boolean()
});

const VERIFICATION_FEE = 50000; // kobo

async function queryWithRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < retries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 100));
      }
    }
  }
  throw lastError;
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { nin, consent } = schema.parse(body);

    if (!consent) {
      return NextResponse.json(
        { message: "Consent is required for NIN verification" },
        { status: 400 }
      );
    }

    const cleanNin = normalizeNin(nin);
    if (!isValidNin(cleanNin)) {
      return NextResponse.json(
        { message: "Please enter a valid 11-digit NIN" },
        { status: 400 }
      );
    }

    const wallet = await queryWithRetry(() =>
      db.query.wallets.findFirst({
        where: (wallets, { eq }) => eq(wallets.userId, session.userId)
      })
    );

    if (!wallet || wallet.balance < VERIFICATION_FEE) {
      return NextResponse.json(
        { message: "Insufficient wallet balance" },
        { status: 402 }
      );
    }

    const verificationId = nanoid();
    const debitId = nanoid();
    const masked = maskNin(cleanNin);

    await queryWithRetry(() =>
      db.transaction(async (tx) => {
        await tx.insert(ninVerifications).values({
          id: verificationId,
          userId: session.userId,
          ninMasked: masked,
          consent,
          status: "pending"
        });

        await tx.insert(walletTransactions).values({
          id: debitId,
          userId: session.userId,
          type: "debit",
          status: "pending",
          amount: VERIFICATION_FEE,
          provider: "wallet",
          description: "NIN verification",
          ninMasked: masked
        });

        await tx
          .update(wallets)
          .set({ balance: sql`${wallets.balance} - ${VERIFICATION_FEE}` })
          .where(eq(wallets.id, wallet.id));
      })
    );

    let response;
    try {
      response = await verifyNinWithYouVerify(cleanNin);
      console.log("YouVerify response:", JSON.stringify(response, null, 2));
    } catch (error) {
      console.error("YouVerify API error:", error);
      await handleRefund({
        verificationId,
        debitId,
        userId: session.userId,
        masked,
        reason: "Verification provider error"
      });
      const message = getFriendlyErrorMessage(
        error,
        "We couldn't reach the verification provider. Your wallet has been refunded."
      );
      return NextResponse.json({ message }, { status: 502 });
    }

    const status = response.data?.status?.toLowerCase();
    const details = response.data?.response;

    console.log("Verification check - Status:", status, "Has details:", !!details);

    if (status === "found" && details) {
      const fullName = [details.first_name, details.middle_name, details.last_name]
        .filter(Boolean)
        .join(" ")
        .trim();

      await db
        .update(ninVerifications)
        .set({
          status: "success",
          fullName: fullName || null,
          dateOfBirth: details.dob || null,
          phone: details.mobile || null,
          providerReference: response.data?.reference_id || null,
          rawResponse: response as unknown as Record<string, unknown>
        })
        .where(eq(ninVerifications.id, verificationId));

      await db
        .update(walletTransactions)
        .set({ status: "completed" })
        .where(eq(walletTransactions.id, debitId));

      return NextResponse.json({
        status: "success",
        verificationId,
        data: {
          fullName,
          dateOfBirth: details.dob,
          phone: details.mobile
        }
      });
    }

    console.log("NIN verification failed - refunding");
    await handleRefund({
      verificationId,
      debitId,
      userId: session.userId,
      masked,
      reason: "NIN not found"
    });

    return NextResponse.json(
      { message: "NIN not found. Wallet refunded." },
      { status: 404 }
    );
  } catch (error) {
    console.error("NIN verification error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    const message = getFriendlyErrorMessage(
      error,
      "We couldn't complete the verification. Please try again in a few minutes."
    );
    return NextResponse.json({ message }, { status: 500 });
  }
}

async function handleRefund(params: {
  verificationId: string;
  debitId: string;
  userId: string;
  masked: string;
  reason: string;
}) {
  let lastError: unknown;
  for (let i = 0; i <= 2; i++) {
    try {
      await db.transaction(async (tx) => {
        await tx
          .update(ninVerifications)
          .set({ status: "failed", errorMessage: params.reason })
          .where(eq(ninVerifications.id, params.verificationId));

        await tx
          .update(walletTransactions)
          .set({ status: "refunded" })
          .where(eq(walletTransactions.id, params.debitId));

        await tx.insert(walletTransactions).values({
          id: nanoid(),
          userId: params.userId,
          type: "refund",
          status: "completed",
          amount: VERIFICATION_FEE,
          provider: "system",
          description: "NIN verification refund",
          ninMasked: params.masked
        });

        await tx
          .update(wallets)
          .set({ balance: sql`${wallets.balance} + ${VERIFICATION_FEE}` })
          .where(eq(wallets.userId, params.userId));
      });
      return;
    } catch (error) {
      lastError = error;
      console.error("Refund attempt failed:", error);
      if (i < 2) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 100));
      }
    }
  }
  console.error("Refund failed after retries:", lastError);
  throw lastError;
}
