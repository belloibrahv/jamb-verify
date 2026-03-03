import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { db } from "@/db/client";
import { users, wallets } from "@/db/schema";
import { setSessionCookie } from "@/lib/auth";
import { getFriendlyErrorMessage } from "@/lib/utils";

export const runtime = "nodejs";

const schema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(8),
  password: z.string().min(6)
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    const existing = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, data.email)
    });

    if (existing) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const userId = nanoid();
    const walletId = nanoid();

    await db.transaction(async (tx) => {
      await tx.insert(users).values({
        id: userId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        passwordHash
      });
      await tx.insert(wallets).values({
        id: walletId,
        userId,
        balance: 0,
        currency: "NGN"
      });
    });

    await setSessionCookie({
      userId,
      email: data.email,
      fullName: data.fullName
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Register error:", error);
    const message = getFriendlyErrorMessage(
      error,
      "We couldn’t create your account. Please try again in a few minutes."
    );
    return NextResponse.json({ message }, { status: 500 });
  }
}
