import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

async function queryWithRetry(fn: () => Promise<any>, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 100));
    }
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const wallet = await queryWithRetry(() =>
    db.query.wallets.findFirst({
      where: (wallets, { eq }) => eq(wallets.userId, session.userId)
    })
  );

  if (!wallet) {
    return NextResponse.json({ message: "Wallet not found" }, { status: 404 });
  }

  return NextResponse.json({ balance: wallet.balance, currency: wallet.currency });
}
