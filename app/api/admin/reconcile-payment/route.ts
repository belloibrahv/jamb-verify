import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { walletTransactions, wallets } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";
import { verifyPaystackPayment } from "@/lib/paystack";
import { logPaymentEvent, logAPIError } from "@/lib/audit-log";

export const runtime = "nodejs";

/**
 * ADMIN ONLY: Manual payment reconciliation endpoint
 * Use this to manually credit users whose payments were successful
 * on Paystack but didn't update their wallet
 * 
 * SECURITY: In production, add proper admin authentication
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // TODO: Add admin role check
  // For now, using environment variable as simple admin key
  const adminKey = request.headers.get("x-admin-key");
  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    console.error("[ADMIN-RECONCILE] Invalid admin key");
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  console.log("[ADMIN-RECONCILE] Admin reconciliation initiated by:", session.userId);

  try {
    const body = await request.json();
    const { reference, userId } = body;

    if (!reference || !userId) {
      return NextResponse.json(
        { message: "Both reference and userId are required" },
        { status: 400 }
      );
    }

    console.log("[ADMIN-RECONCILE] Reconciling payment:", { reference, userId });

    // Verify payment with Paystack
    const paystackData = await verifyPaystackPayment(reference);

    if (!paystackData.status || !paystackData.data) {
      throw new Error("Invalid response from Paystack");
    }

    const txData = paystackData.data;

    if (txData.status !== "success") {
      console.log("[ADMIN-RECONCILE] Payment not successful:", txData.status);
      return NextResponse.json({
        message: "Payment was not successful on Paystack",
        paystackStatus: txData.status,
        reference
      }, { status: 400 });
    }

    const amountInKobo = txData.amount;
    console.log("[ADMIN-RECONCILE] Payment verified. Amount:", amountInKobo);

    // Check if transaction already exists
    const existingTx = await db.query.walletTransactions.findFirst({
      where: (transactions, { eq }) => eq(transactions.reference, reference)
    });

    if (existingTx && existingTx.status === "completed") {
      console.log("[ADMIN-RECONCILE] Transaction already completed");
      return NextResponse.json({
        message: "Payment already processed",
        reference,
        amount: amountInKobo,
        alreadyProcessed: true
      });
    }

    // Get user's wallet
    const wallet = await db.query.wallets.findFirst({
      where: (wallets, { eq }) => eq(wallets.userId, userId)
    });

    if (!wallet) {
      throw new Error(`Wallet not found for user: ${userId}`);
    }

    if (existingTx) {
      // Update existing transaction
      console.log("[ADMIN-RECONCILE] Updating existing transaction");
      
      await db
        .update(walletTransactions)
        .set({ 
          status: "completed",
          amount: amountInKobo,
          metadata: sql`jsonb_set(
            COALESCE(metadata, '{}'::jsonb),
            '{adminReconciled}',
            'true'::jsonb
          )`
        })
        .where(eq(walletTransactions.id, existingTx.id));
    } else {
      // Create new transaction
      console.log("[ADMIN-RECONCILE] Creating new transaction");
      
      await db.insert(walletTransactions).values({
        id: reference,
        userId: userId,
        type: "credit",
        status: "completed",
        amount: amountInKobo,
        provider: "paystack",
        reference: reference,
        description: "Wallet funding via Paystack (admin reconciled)",
        metadata: { 
          adminReconciled: true, 
          reconciledBy: session.userId,
          reconciledAt: new Date().toISOString() 
        }
      });
    }

    // Update wallet balance
    console.log("[ADMIN-RECONCILE] Updating wallet balance");
    
    const updatedWallet = await db
      .update(wallets)
      .set({
        balance: sql`${wallets.balance} + ${amountInKobo}`,
        updatedAt: sql`now()`
      })
      .where(eq(wallets.id, wallet.id))
      .returning();

    console.log("[ADMIN-RECONCILE] Reconciliation complete. New balance:", updatedWallet[0].balance);

    // Log admin reconciliation
    await logPaymentEvent(
      "payment.success",
      userId,
      amountInKobo,
      reference,
      "success",
      { 
        adminReconciled: true,
        reconciledBy: session.userId,
        method: "admin_manual"
      }
    );

    return NextResponse.json({
      message: "Payment reconciled successfully",
      reference,
      userId,
      amount: amountInKobo,
      newBalance: updatedWallet[0].balance,
      reconciledBy: session.userId
    });
  } catch (error) {
    console.error("[ADMIN-RECONCILE] Error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    await logAPIError("/api/admin/reconcile-payment", error, session.userId);

    return NextResponse.json(
      {
        message: "Failed to reconcile payment",
        error: errorMessage
      },
      { status: 500 }
    );
  }
}
