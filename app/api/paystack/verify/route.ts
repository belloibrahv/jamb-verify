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
    console.error("[VERIFY] No reference provided");
    return NextResponse.json({ message: "Reference is required" }, { status: 400 });
  }

  console.log("[VERIFY] Starting verification for reference:", reference);

  // Step 1: Verify with Paystack API
  let verification;
  try {
    verification = await verifyPaystackTransaction(reference);
    console.log("[VERIFY] Paystack API response:", {
      status: verification.status,
      paymentStatus: verification.data.status,
      amount: verification.data.amount,
      reference: verification.data.reference
    });
  } catch (error) {
    console.error("[VERIFY] Paystack API call failed:", error);
    return NextResponse.json({ 
      message: "Payment verification failed", 
      error: String(error) 
    }, { status: 400 });
  }

  if (!verification.status || verification.data.status !== "success") {
    console.log("[VERIFY] Payment not successful. Status:", verification.data.status);
    return NextResponse.json({ 
      message: "Payment not successful", 
      status: verification.data.status 
    }, { status: 400 });
  }

  const amount = verification.data.amount;
  console.log("[VERIFY] Payment confirmed successful. Amount:", amount);

  // Step 2: Update database without transactions (neon-http doesn't support them)
  try {
    await queryWithRetry(async () => {
      console.log("[VERIFY] Looking for transaction with reference:", reference);
      
      // Find the transaction record
      const txn = await db.query.walletTransactions.findFirst({
        where: (table, { eq }) => eq(table.reference, reference)
      });

      if (!txn) {
        console.error("[VERIFY] Transaction record not found in database for reference:", reference);
        throw new Error(`Transaction record not found for reference: ${reference}. This indicates the payment was initialized outside our system or the database record was not created.`);
      }

      console.log("[VERIFY] Found transaction:", {
        id: txn.id,
        userId: txn.userId,
        status: txn.status,
        amount: txn.amount,
        type: txn.type
      });

      // Check if already completed (idempotency)
      if (txn.status === "completed") {
        console.log("[VERIFY] Transaction already marked as completed. Skipping update.");
        return { alreadyCompleted: true, userId: txn.userId };
      }

      // Update transaction status
      console.log("[VERIFY] Updating transaction status to completed");
      await db
        .update(walletTransactions)
        .set({ status: "completed" })
        .where(eq(walletTransactions.id, txn.id));

      // Update wallet balance
      console.log("[VERIFY] Updating wallet balance for user:", txn.userId, "Adding amount:", amount);
      const updateResult = await db
        .update(wallets)
        .set({ 
          balance: sql`${wallets.balance} + ${amount}`,
          updatedAt: sql`now()`
        })
        .where(eq(wallets.userId, txn.userId))
        .returning();

      if (updateResult.length === 0) {
        console.error("[VERIFY] Wallet update returned no rows. Wallet may not exist for user:", txn.userId);
        throw new Error(`Wallet not found for user: ${txn.userId}`);
      }

      console.log("[VERIFY] Wallet updated successfully. New balance:", updateResult[0].balance);
      return { success: true, newBalance: updateResult[0].balance, userId: txn.userId };
    }, 3);

    console.log("[VERIFY] Verification completed successfully");
    return NextResponse.json({ success: true, message: "Payment verified and wallet updated" });

  } catch (error) {
    console.error("[VERIFY] Database update failed:", error);
    console.error("[VERIFY] Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json({ 
      message: "Failed to update wallet", 
      error: String(error),
      reference 
    }, { status: 500 });
  }
}
