import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const wallet = await db.query.wallets.findFirst({
    where: (wallets, { eq }) => eq(wallets.userId, session.userId)
  });

  if (!wallet) {
    return NextResponse.json({ message: "Wallet not found" }, { status: 404 });
  }

  return NextResponse.json({ balance: wallet.balance, currency: wallet.currency });
}
