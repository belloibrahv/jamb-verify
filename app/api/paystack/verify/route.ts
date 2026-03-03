import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { walletTransactions, wallets } from "@/db/schema";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { eq, sql } from "drizzle-orm";

export const runtime = "nodejs";

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.json({ message: "Reference is required" }, { status: 400 });
  }

  console.log("Verifying payment with reference:", reference);

  let verification;
  try {
    verification = await verifyPaystackTransaction(reference);
    console.log("Paystack verification response:", JSON.stringify(verification, null, 2));
  } catch (error) {
    console.error("Paystack verification failed:", error);
    return NextResponse.json({ message: "Payment verification failed" }, { status: 400 });
  }

  if (!verification.status || verification.data.status !== "success") {
    console.log("Payment not successful. Status:", verification.data.status);
    return NextResponse.json({ message: "Payment not successful" }, { status: 400 });
  }

  const amount = verification.data.amount;
  console.log("Payment verified. Amount:", amount);

  try {
    await queryWithRetry(() =>
      db.transaction(async (tx) => {
        console.log("Looking for transaction with reference:", reference);
        
        const txn = await tx.query.walletTransactions.findFirst({
          where: (table, { eq }) => eq(table.reference, reference)
        });

        console.log("Found transaction:", txn ? { id: txn.id, userId: txn.userId, status: txn.status } : "NOT FOUND");

        if (!txn) {
          console.error("Transaction not found for reference:", reference);
          throw new Error(`Transaction not found for reference: ${reference}`);
        }

        if (txn.status === "completed") {
          console.log("Transaction already completed, skipping update");
          return;
        }

        console.log("Updating transaction status to completed");
        await tx
          .update(walletTransactions)
          .set({ status: "completed" })
          .where(eq(walletTransactions.id, txn.id));

        console.log("Updating wallet balance for user:", txn.userId, "Amount:", amount);
        await tx
          .update(wallets)
          .set({ 
            balance: sql`${wallets.balance} + ${amount}`,
            updatedAt: sql`now()`
          })
          .where(eq(wallets.userId, txn.userId));

        console.log("Wallet updated successfully");
      })
    );
  } catch (error) {
    console.error("Paystack verify error:", error);
    return NextResponse.json({ message: "Failed to update wallet", error: String(error) }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
