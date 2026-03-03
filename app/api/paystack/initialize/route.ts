import { NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { db } from "@/db/client";
import { walletTransactions } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { initializePaystackTransaction } from "@/lib/paystack";

const schema = z.object({
  amount: z.number().min(500)
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { amount } = schema.parse(body);
    const amountKobo = amount * 100;
    const reference = `jv_${nanoid(10)}`;

    await db.insert(walletTransactions).values({
      id: nanoid(),
      userId: session.userId,
      type: "credit",
      status: "pending",
      amount: amountKobo,
      provider: "paystack",
      reference,
      description: "Wallet funding"
    });

    const init = await initializePaystackTransaction({
      email: session.email,
      amount: amountKobo,
      reference,
      metadata: { userId: session.userId },
      channels: ["card", "bank_transfer"]
    });

    return NextResponse.json({
      accessCode: init.data.access_code,
      reference: init.data.reference
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Initialization failed";
    return NextResponse.json({ message }, { status: 400 });
  }
}
