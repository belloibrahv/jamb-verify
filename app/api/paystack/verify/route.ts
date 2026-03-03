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

  const verification = await verifyPaystackTransaction(reference);

  if (!verification.status || verification.data.status !== "success") {
    return NextResponse.json({ message: "Payment not successful" }, { status: 400 });
  }

  const amount = verification.data.amount;

  await queryWithRetry(() =>
    db.transaction(async (tx) => {
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
        .set({ balance: sql`${wallets.balance} + ${amount}` })
        .where(eq(wallets.userId, txn.userId));
    })
  );

  return NextResponse.json({ success: true });
}
