"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  ArrowRight,
  Info
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
            const verifyRes = await fetch(`/api/paystack/verify?reference=${reference}`, { cache: "no-store" });
            const contentType = verifyRes.headers.get("content-type");
            
            if (contentType && contentType.includes("application/json")) {
              await verifyRes.json(); // Parse but don't use
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

  const formattedNin = normalizeNin(nin).replace(/(\d{3})(\d{4})(\d{0,4})/, "$1 $2 $3").trim();
  const hasInsufficientBalance = balance !== null && balance < feeKobo;
  const canVerify = nin.length === 11 && consent && !hasInsufficientBalance && !verifying;

  return (
    <div className="space-y-6">
      {/* Balance Card - Clean & Simple */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Wallet Balance</p>
              <p className="text-3xl font-bold">
                {balance === null ? "..." : formatNaira(balance)}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleRefreshBalance} 
              disabled={refreshing}
              className="h-10 w-10 p-0"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          {hasInsufficientBalance && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-amber-900">
                Need at least {formatNaira(feeKobo)} to verify. Fund your wallet below.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fund Wallet - Simplified */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
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

            <Button 
              onClick={handleFundWallet} 
              disabled={loading || amountInvalid}
              className="w-full h-12"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
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

      {/* Verify NIN - Simplified */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Fingerprint className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Verify NIN</h2>
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

            <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
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

            <Button 
              onClick={handleVerify} 
              disabled={!canVerify}
              className="w-full h-12"
            >
              {verifying ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                "Verify NIN"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Result Message */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className={`border-0 ${
            result.status === "success" ? "bg-emerald-50" : "bg-red-50"
          }`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {result.status === "success" ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${
                    result.status === "success" ? "text-emerald-900" : "text-red-900"
                  }`}>
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
    </div>
  );
}
