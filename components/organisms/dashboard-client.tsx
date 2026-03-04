"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Fingerprint,
  History,
  Info,
  Plus,
  RefreshCw,
  Shield,
  Sparkles,
  Wallet,
  Zap
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatNaira } from "@/lib/format";
import { normalizeNin } from "@/lib/nin";
import { getFriendlyErrorMessage } from "@/lib/utils";

const feeKobo = 50000;

const fadeInUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } }
};

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
      const res = await fetch("/api/wallet/balance", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to load balance:", error);
      return false;
    }
  };

  const handleRefreshBalance = async () => {
    setRefreshing(true);
    await loadBalance();
    setRefreshing(false);
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
        await new Promise((resolve) => setTimeout(resolve, 2000));

        for (let i = 0; i < 3; i++) {
          try {
            const verifyRes = await fetch(`/api/paystack/verify?reference=${reference}`, {
              cache: "no-store"
            });
            const contentType = verifyRes.headers.get("content-type");

            if (contentType && contentType.includes("application/json")) {
              await verifyRes.json();
              if (verifyRes.ok) break;
            }
          } catch (error) {
            console.error("Verify error:", error);
          }
          if (i < 2) await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        await new Promise((resolve) => setTimeout(resolve, 1500));

        for (let i = 0; i < 6; i++) {
          const res = await fetch("/api/wallet/balance", { cache: "no-store" });
          if (res.ok) {
            const balanceData = await res.json();
            setBalance(balanceData.balance);
            if (balanceData.balance > previousBalance) {
              setResult({
                status: "success",
                message: `Wallet funded! New balance: ${formatNaira(balanceData.balance)}`
              });
              return;
            }
          }
          if (i < 5) await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        setResult({
          status: "success",
          message: "Payment verified! Refresh if balance doesn't update."
        });
      };

      popup.resumeTransaction(data.accessCode, {
        onSuccess: async (transaction: { reference?: string }) => {
          await verifyAndRefresh(transaction?.reference || data.reference);
        },
        onCancel: () => {
          setResult({ status: "error", message: "Payment cancelled." });
        },
        onError: (error: { message?: string }) => {
          setResult({ status: "error", message: error?.message || "Payment failed." });
        }
      });
    } catch (error) {
      setResult({
        status: "error",
        message: getFriendlyErrorMessage(error, "Couldn't start payment. Try again.")
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
      if (!res.ok) throw new Error(data?.message || "Verification failed");

      setNin("");
      setConsent(false);
      setResult({
        status: "success",
        message: "NIN verified successfully!",
        verificationId: data.verificationId
      });
      loadBalance();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setResult({ status: "error", message: errorMessage });
      loadBalance();
    } finally {
      setVerifying(false);
    }
  };

  const formattedNin = normalizeNin(nin)
    .replace(/(\d{3})(\d{4})(\d{0,4})/, "$1 $2 $3")
    .trim();
  const hasInsufficientBalance = balance !== null && balance < feeKobo;
  const canVerify = nin.length === 11 && consent && !hasInsufficientBalance && !verifying;
  const verificationsLeft = balance === null ? null : Math.floor(balance / feeKobo);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6">
      <motion.section variants={fadeInUp}>
        <Card className="relative overflow-hidden border-border/70 bg-white/90 shadow-card">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-16 left-10 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
          </div>

          <CardContent className="relative z-10 p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">
                  Wallet overview
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Wallet className="h-4 w-4 text-primary" />
                  Available balance
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-4xl font-heading font-semibold">
                    {balance === null ? "—" : formatNaira(balance)}
                  </p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      hasInsufficientBalance
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {hasInsufficientBalance ? "Low balance" : "Ready"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Refresh to sync your latest wallet balance.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshBalance}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    document.getElementById("fund-section")?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  <Plus className="h-4 w-4" />
                  Add money
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    document.getElementById("verify-section")?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  <Fingerprint className="h-4 w-4" />
                  Verify NIN
                </Button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-border/70 bg-white/80 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  <Zap className="h-4 w-4 text-secondary" />
                  Verifications left
                </div>
                <p className="mt-3 text-2xl font-semibold">
                  {verificationsLeft === null ? "—" : verificationsLeft.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  Based on {formatNaira(feeKobo)} per NIN.
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-white/80 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Verification fee
                </div>
                <p className="mt-3 text-2xl font-semibold">{formatNaira(feeKobo)}</p>
                <p className="text-xs text-muted-foreground">
                  Charged per verification attempt.
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-white/80 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  <Shield className="h-4 w-4 text-emerald-600" />
                  Security
                </div>
                <p className="mt-3 text-lg font-semibold text-emerald-800">Privacy forward</p>
                <p className="text-xs text-muted-foreground">
                  Sensitive details are masked in history and receipts.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/transactions">
                  <History className="h-4 w-4" />
                  View transaction history
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      <AnimatePresence>
        {hasInsufficientBalance && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="border-0 bg-amber-50 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-amber-900 mb-1">Low Balance</p>
                    <p className="text-sm text-amber-800">
                      You need at least {formatNaira(feeKobo)} to verify a NIN. Add money to
                      continue.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.section
        variants={fadeInUp}
        className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]"
      >
        <div className="space-y-6">
          <Card
            id="verify-section"
            className="border-border/70 bg-white/90 shadow-card"
          >
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fingerprint className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Verify NIN</h2>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Primary action
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <Input
                    value={formattedNin}
                    onChange={(e) => setNin(normalizeNin(e.target.value))}
                    placeholder="Enter 11-digit NIN"
                    maxLength={13}
                    className="h-12 text-lg tracking-wider"
                  />
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>{nin.length}/11 digits</span>
                    <span className="font-medium">Fee: {formatNaira(feeKobo)}</span>
                  </div>
                </div>

                <label className="flex items-start gap-3 rounded-2xl border border-border/70 bg-white/70 p-4 cursor-pointer transition hover:bg-muted/60">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1"
                  />
                  <span className="text-sm">
                    I consent to identity verification against NIMC records
                  </span>
                </label>

                <Button onClick={handleVerify} disabled={!canVerify} className="w-full h-12">
                  {verifying ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify NIN"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card
                className={`border-0 ${
                  result.status === "success" ? "bg-emerald-50" : "bg-red-50"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {result.status === "success" ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          result.status === "success" ? "text-emerald-900" : "text-red-900"
                        }`}
                      >
                        {result.message}
                      </p>
                      {result.verificationId && (
                        <Link
                          href={`/dashboard/receipts/${result.verificationId}`}
                          className="inline-flex items-center text-sm font-medium text-emerald-700 hover:text-emerald-800 mt-2"
                        >
                          View Details <ArrowRight className="h-4 w-4 ml-1" />
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <Card className="border-border/70 bg-white/90 shadow-card">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Recent activity</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Track your last verifications and wallet top-ups in one place.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/transactions">
                  View transactions
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card id="fund-section" className="border-border/70 bg-white/90 shadow-card">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Fund Wallet</h2>
              </div>

              <div className="space-y-3">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="h-12 text-lg"
                  min="500"
                />

                <div className="flex gap-2">
                  {[500, 1000, 2000].map((amt) => (
                    <Button
                      key={amt}
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(String(amt))}
                      className="flex-1"
                    >
                      ₦{amt}
                    </Button>
                  ))}
                </div>

                <Button onClick={handleFundWallet} disabled={loading || amountInvalid} className="w-full h-12">
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Fund Wallet"
                  )}
                </Button>

                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Minimum ₦500 via Paystack
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-white/90 shadow-card">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-secondary" />
                <h3 className="text-lg font-semibold">Verification flow</h3>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    1
                  </span>
                  Fund your wallet to cover verification fees.
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    2
                  </span>
                  Submit the NIN and consent to run the check.
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    3
                  </span>
                  Download the receipt for JAMB registration.
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-white/90 shadow-card">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-600" />
                <h3 className="text-lg font-semibold">Data protection</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                NIN values are masked in transaction history and receipts for privacy.
              </p>
              <p className="text-xs text-muted-foreground">Need help? Reach out via support.</p>
            </CardContent>
          </Card>
        </div>
      </motion.section>
    </motion.div>
  );
}
