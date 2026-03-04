"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { formatNaira } from "@/lib/format";
import { normalizeNin } from "@/lib/nin";
import { getFriendlyErrorMessage } from "@/lib/utils";
import Link from "next/link";
import { 
  Wallet, 
  Fingerprint, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  CreditCard,
  ShieldCheck,
  Info,
  Sparkles
} from "lucide-react";

const feeKobo = 50000;

export function DashboardClient() {
  const [balance, setBalance] = useState<number | null>(null);
  const [amount, setAmount] = useState("500");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [nin, setNin] = useState("");
  const [consent, setConsent] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<{
    status: "success" | "error";
    message: string;
    verificationId?: string;
  } | null>(null);

  const loadBalance = async () => {
    try {
      const res = await fetch("/api/wallet/balance", {
        cache: "no-store"
      });
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance);
        return true;
      } else {
        console.error("Failed to load balance:", res.status);
        return false;
      }
    } catch (error) {
      console.error("Failed to load balance:", error);
      return false;
    }
  };

  const handleRefreshBalance = async () => {
    setRefreshing(true);
    try {
      const success = await loadBalance();
      if (!success) {
        setResult({
          status: "error",
          message: "Failed to refresh balance. Please try again."
        });
      }
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBalance();
  }, []);

  const amountNumber = Number(amount);
  const amountInvalid = !Number.isFinite(amountNumber) || amountNumber < 500;

  const handleFundWallet = async () => {
    setLoading(true);
    setResult(null);
    try {
      // Dynamically import Paystack only when needed (client-side only)
      const { default: Paystack } = await import("@paystack/inline-js");
      
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountNumber })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Unable to initialize payment");
      }

      const popup = new Paystack();
      const previousBalance = balance ?? 0;

      const verifyAndRefresh = async (reference: string) => {
        console.log("[PAYMENT] Starting verification for reference:", reference);
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for webhook

        let verifySuccess = false;
        let verifyError = null;
        
        for (let i = 0; i < 3; i++) {
          try {
            console.log(`[PAYMENT] Verify attempt ${i + 1}/3 for reference:`, reference);
            const verifyRes = await fetch(
              `/api/paystack/verify?reference=${reference}`,
              { cache: "no-store" }
            );
            
            // Handle non-JSON responses
            const contentType = verifyRes.headers.get("content-type");
            let verifyData;
            
            if (contentType && contentType.includes("application/json")) {
              verifyData = await verifyRes.json();
            } else {
              const text = await verifyRes.text();
              console.error(`[PAYMENT] Non-JSON response (attempt ${i + 1}):`, text.substring(0, 200));
              throw new Error("Invalid response from server. Please try again.");
            }
            
            console.log(`[PAYMENT] Verify response (attempt ${i + 1}):`, {
              status: verifyRes.status,
              ok: verifyRes.ok,
              data: verifyData
            });
            
            if (verifyRes.ok) {
              console.log("[PAYMENT] Verification successful");
              verifySuccess = true;
              break;
            } else {
              verifyError = verifyData.message || `HTTP ${verifyRes.status}`;
              console.warn(`[PAYMENT] Verify failed (attempt ${i + 1}):`, verifyError);
            }
          } catch (error) {
            verifyError = error instanceof Error ? error.message : String(error);
            console.error(`[PAYMENT] Verify attempt ${i + 1} threw error:`, error);
          }
          
          if (i < 2) {
            console.log(`[PAYMENT] Waiting 1s before retry ${i + 2}...`);
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }

        // Refresh balance regardless of verify status
        console.log("[PAYMENT] Starting balance refresh...");
        let updated = false;
        let finalBalance = previousBalance;
        
        for (let i = 0; i < 5; i++) {
          try {
            console.log(`[PAYMENT] Balance fetch attempt ${i + 1}/5`);
            const res = await fetch("/api/wallet/balance", {
              cache: "no-store"
            });
            
            if (res.ok) {
              const balanceData = await res.json();
              console.log(`[PAYMENT] Balance fetched (attempt ${i + 1}):`, {
                current: balanceData.balance,
                previous: previousBalance,
                increased: balanceData.balance > previousBalance
              });
              
              setBalance(balanceData.balance);
              finalBalance = balanceData.balance;
              
              if (balanceData.balance > previousBalance) {
                console.log("[PAYMENT] Balance increased! Update successful.");
                updated = true;
                break;
              }
            } else {
              console.warn(`[PAYMENT] Balance fetch failed with status:`, res.status);
            }
          } catch (error) {
            console.error(`[PAYMENT] Balance fetch attempt ${i + 1} threw error:`, error);
          }
          
          if (i < 4) {
            console.log(`[PAYMENT] Waiting 800ms before next balance check...`);
            await new Promise((resolve) => setTimeout(resolve, 800));
          }
        }

        // Determine final result
        if (!verifySuccess) {
          console.error("[PAYMENT] Verification failed after 3 attempts. Error:", verifyError);
          
          // Still update balance if it increased
          if (finalBalance > previousBalance) {
            console.log("[PAYMENT] Balance increased despite verification failure");
            setResult({
              status: "success",
              message: `Wallet funded successfully! New balance: ${formatNaira(finalBalance)}`
            });
            return;
          }
          
          setResult({
            status: "error",
            message: `Payment completed, but verification failed: ${verifyError}. Please refresh your balance or contact support with reference: ${reference}`
          });
          return;
        }

        if (!updated) {
          console.warn("[PAYMENT] Verification succeeded but balance didn't increase yet");
          
          // Force one more balance check
          try {
            const finalRes = await fetch("/api/wallet/balance", { cache: "no-store" });
            if (finalRes.ok) {
              const finalData = await finalRes.json();
              setBalance(finalData.balance);
              finalBalance = finalData.balance;
              
              if (finalData.balance > previousBalance) {
                updated = true;
              }
            }
          } catch (e) {
            console.error("[PAYMENT] Final balance check failed:", e);
          }
        }

        if (updated || finalBalance > previousBalance) {
          console.log("[PAYMENT] Payment flow completed successfully!");
          setResult({
            status: "success",
            message: `Wallet funded successfully! New balance: ${formatNaira(finalBalance)}`
          });
        } else {
          setResult({
            status: "error",
            message: "Payment verified but balance not updated yet. Please refresh your balance in a moment."
          });
        }
      };

      popup.resumeTransaction(data.accessCode, {
        onSuccess: async (transaction: { reference?: string }) => {
          const reference = transaction?.reference || data.reference;
          await verifyAndRefresh(reference);
        },
        onCancel: () => {
          setResult({
            status: "error",
            message: "Payment cancelled. No funds were added."
          });
        },
        onError: (error: { message?: string }) => {
          setResult({
            status: "error",
            message: error?.message || "Payment could not be completed."
          });
        }
      });
    } catch (error) {
      setResult({
        status: "error",
        message: getFriendlyErrorMessage(
          error,
          "We couldn't start the payment. Please try again."
        )
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    setResult(null);
    try {
      const res = await fetch("/api/nin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nin, consent })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Verification failed");
      }
      
      // Clear NIN input and consent after successful verification
      setNin("");
      setConsent(false);
      
      setResult({
        status: "success",
        message: "NIN verified successfully! Your verification details are ready.",
        verificationId: data.verificationId
      });
      
      // Refresh balance to show deduction
      loadBalance();
    } catch (error) {
      setResult({
        status: "error",
        message: getFriendlyErrorMessage(
          error,
          "We couldn't complete the verification. Please try again."
        )
      });
    } finally {
      setVerifying(false);
    }
  };

  const formattedNin = normalizeNin(nin)
    .replace(/(\d{3})(\d{4})(\d{0,4})/, "$1 $2 $3")
    .trim();

  const hasInsufficientBalance = balance !== null && balance < feeKobo;
  const canVerify = nin.length === 11 && consent && !hasInsufficientBalance && !verifying;

  return (
    <div className="space-y-6">
      {/* Balance Overview Card - Mobile Optimized */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Wallet Balance
                </p>
                <p className="text-2xl font-bold sm:text-3xl">
                  {balance === null ? (
                    <span className="animate-pulse">Loading...</span>
                  ) : (
                    formatNaira(balance)
                  )}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefreshBalance} 
              disabled={refreshing}
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
          
          {hasInsufficientBalance && (
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>
                Insufficient balance. You need at least {formatNaira(feeKobo)} to verify a NIN. 
                Please fund your wallet below.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Action Cards - Responsive Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Wallet Funding Card */}
        <Card className="border-border/70 bg-white shadow-sm">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <CreditCard className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg">Fund Wallet</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Add money to verify NINs instantly
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (₦)</label>
              <Input
                type="number"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="500"
                inputMode="numeric"
                className="text-lg"
                min="500"
              />
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Info className="h-3 w-3 shrink-0 mt-0.5" />
                <p>Minimum ₦500. Pay with card or bank transfer via Paystack.</p>
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-3 gap-2">
              {[500, 1000, 2000].map((quickAmount) => (
                <Button
                  key={quickAmount}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(String(quickAmount))}
                  className="text-xs"
                >
                  ₦{quickAmount}
                </Button>
              ))}
            </div>

            <Button 
              onClick={handleFundWallet} 
              disabled={loading || amountInvalid}
              size="lg"
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Opening Paystack...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Fund Wallet
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* NIN Verification Card */}
        <Card className="border-border/70 bg-white shadow-sm">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Fingerprint className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg">Verify NIN</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Instant NIMC verification for JAMB
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">11-digit NIN</label>
              <Input
                value={formattedNin}
                onChange={(event) => setNin(normalizeNin(event.target.value))}
                placeholder="123 4567 8901"
                inputMode="numeric"
                maxLength={13}
                className="text-lg tracking-wider"
              />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {nin.length}/11 digits
                </span>
                <span className="font-medium text-primary">
                  Fee: {formatNaira(feeKobo)}
                </span>
              </div>
            </div>

            {/* Consent Checkbox */}
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/70 bg-muted/30 p-4 text-sm transition-colors hover:bg-muted/50">
              <Checkbox
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                className="mt-0.5"
              />
              <span className="flex-1">
                I consent to an identity verification check against NIMC records for this NIN.
              </span>
            </label>

            <Button 
              onClick={handleVerify} 
              disabled={!canVerify}
              size="lg"
              className="w-full"
            >
              {verifying ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Verify NIN
                </>
              )}
            </Button>

            {!canVerify && nin.length === 11 && !consent && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Please provide consent to continue
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Result Message */}
      {result && (
        <Card 
          className={`border-2 ${
            result.status === "success"
              ? "border-emerald-200 bg-emerald-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {result.status === "success" ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
              )}
              <div className="flex-1 space-y-2">
                <p className={`font-semibold ${
                  result.status === "success" ? "text-emerald-900" : "text-red-900"
                }`}>
                  {result.message}
                </p>
                {result.verificationId && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="bg-white hover:bg-emerald-100"
                  >
                    <Link href={`/dashboard/receipts/${result.verificationId}`}>
                      <Sparkles className="h-4 w-4" />
                      View Verification Details
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Cards - Responsive Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border/50 bg-gradient-to-br from-blue-50 to-blue-100/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold">Instant Verification</p>
                <p className="text-xs text-muted-foreground">
                  Real-time NIMC data with name, DOB, and phone number
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-amber-50 to-amber-100/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold">Auto Refund</p>
                <p className="text-xs text-muted-foreground">
                  Invalid NINs trigger instant wallet refunds
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-emerald-50 to-emerald-100/50 sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold">JAMB Ready</p>
                <p className="text-xs text-muted-foreground">
                  Download receipt with verified identity data
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
