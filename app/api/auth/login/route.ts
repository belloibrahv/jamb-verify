import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/db/client";
import { setSessionCookie } from "@/lib/auth";
import { getFriendlyErrorMessage } from "@/lib/utils";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, data.email)
    });

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
