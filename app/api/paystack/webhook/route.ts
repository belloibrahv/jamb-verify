import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { walletTransactions, wallets } from "@/db/schema";
import { verifyPaystackSignature } from "@/lib/paystack";
import { eq, sql } from "drizzle-orm";

export const runtime = "nodejs";

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
      .set({ balance: sql`${wallets.balance} + ${amount}` })
      .where(eq(wallets.userId, txn.userId));
  });

  return NextResponse.json({ received: true });
}
