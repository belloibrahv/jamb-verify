import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { walletTransactions, wallets } from "@/db/schema";
import { verifyPaystackSignature } from "@/lib/paystack";
import { eq, sql } from "drizzle-orm";

export const runtime = "nodejs";

async function updateWalletWithRetry(reference: string, amount: number, retries = 3) {
  let lastError: unknown;
  for (let i = 0; i <= retries; i++) {
    try {
      await db.transaction(async (tx) => {
        const txn = await tx.query.walletTransactions.findFirst({
          where: (table, { eq }) => eq(table.reference, reference)
        });

        if (!txn || txn.status === "completed") {
          return;
        }

        await tx
          .update(walletTransactions)
          .set({ status: "completed" })
          .where(eq(walletTransactions.id, txn.id));

        await tx
          .update(wallets)
          .set({ 
            balance: sql`${wallets.balance} + ${amount}`,
            updatedAt: sql`now()`
          })
          .where(eq(wallets.userId, txn.userId));
      });
      return;
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
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyPaystackSignature(rawBody, signature)) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const reference = event.data?.reference as string | undefined;
  const amount = event.data?.amount as number | undefined;

  if (!reference || !amount) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  try {
    await updateWalletWithRetry(reference, amount);
  } catch (error) {
    console.error("Webhook wallet update failed:", error);
    return NextResponse.json({ message: "Failed to update wallet" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
