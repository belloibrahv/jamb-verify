"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { formatNaira } from "@/lib/format";
import { normalizeNin } from "@/lib/nin";
import { getFriendlyErrorMessage } from "@/lib/utils";
import Link from "next/link";

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
            
            const verifyData = await verifyRes.json();
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
          setResult({
            status: "error",
            message: `Payment completed, but verification failed: ${verifyError}. Please contact support with reference: ${reference}`
          });
          return;
        }

        if (!updated) {
          console.warn("[PAYMENT] Verification succeeded but balance didn't increase");
          setResult({
            status: "error",
            message: "Payment verified but balance not updated yet. Please refresh in a moment."
          });
          return;
        }

        console.log("[PAYMENT] Payment flow completed successfully!");
        setResult({
          status: "success",
          message: `Wallet funded successfully! New balance: ${formatNaira(finalBalance)}`
        });
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
      setResult({
        status: "success",
        message: "Verification successful",
        verificationId: data.verificationId
      });
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

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/70 bg-white/90">
          <CardHeader>
            <CardTitle>Wallet funding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-muted/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Current balance
              </p>
              <p className="text-2xl font-semibold">
                {balance === null ? "--" : formatNaira(balance)}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount to fund (₦)</label>
              <Input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                inputMode="numeric"
              />
              <p className="text-xs text-muted-foreground">
                Minimum wallet funding is ₦500. Use card or bank transfer via Paystack.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleFundWallet} disabled={loading || amountInvalid}>
                {loading ? "Opening Paystack..." : "Fund wallet"}
              </Button>
              <Button variant="outline" onClick={handleRefreshBalance} disabled={refreshing}>
                {refreshing ? "Refreshing..." : "Refresh balance"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-white/90">
          <CardHeader>
            <CardTitle>NIN verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Enter 11-digit NIN</label>
              <Input
                value={formattedNin}
                onChange={(event) => setNin(normalizeNin(event.target.value))}
                placeholder="123 4567 8901"
                inputMode="numeric"
              />
              <p className="text-xs text-muted-foreground">
                Verification fee: {formatNaira(feeKobo)} per request.
              </p>
            </div>
            <label className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/40 p-4 text-sm">
              <Checkbox
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
              />
              <span>
                I consent to an identity check against NIMC records for this NIN.
              </span>
            </label>
            <Button onClick={handleVerify} disabled={verifying}>
              {verifying ? "Verifying..." : "Verify NIN"}
            </Button>
            {result ? (
              <div
                className={`rounded-2xl border p-4 text-sm ${
                  result.status === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                <p className="font-semibold">{result.message}</p>
                {result.verificationId ? (
                  <Link
                    href={`/dashboard/receipts/${result.verificationId}`}
                    className="mt-2 inline-flex text-sm font-semibold text-emerald-900"
                  >
                    View receipt
                  </Link>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 bg-white/90">
        <CardHeader>
          <CardTitle>Verification status guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Successful verifications show the candidate name, date of birth, and phone
            number exactly as returned by NIMC.
          </p>
          <p>
            Invalid NINs trigger an instant wallet refund. Your transaction history will
            show masked NIN values only.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge>Wallet deduction</Badge>
            <Badge>Auto refund</Badge>
            <Badge>Receipt download</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
