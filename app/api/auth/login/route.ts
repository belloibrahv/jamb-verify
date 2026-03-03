import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/db/client";
import { setSessionCookie } from "@/lib/auth";
import { getFriendlyErrorMessage } from "@/lib/utils";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

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
  try {
    const body = await request.json();
    const data = schema.parse(body);

    const user = await queryWithRetry(() =>
      db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, data.email)
      })
    );

    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      fullName: user.fullName
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    const message = getFriendlyErrorMessage(
      error,
      "We couldn’t log you in. Please try again in a few minutes."
    );
    return NextResponse.json({ message }, { status: 500 });
  }
}
