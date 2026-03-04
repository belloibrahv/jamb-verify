"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Sparkles,
  Zap,
  TrendingUp
} from "lucide-react";

const feeKobo = 50000;

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
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
        await new Promise((resolve) => setTimeout(resolve, 2000));

        let verifySuccess = false;
        let verifyError = null;
        
        for (let i = 0; i < 3; i++) {
          try {
            console.log(`[PAYMENT] Verify attempt ${i + 1}/3 for reference:`, reference);
            const verifyRes = await fetch(
              `/api/paystack/verify?reference=${reference}`,
              { cache: "no-store" }
            );
            
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

        console.log("[PAYMENT] Starting balance refresh...");
        let updated = false;
        let finalBalance = previousBalance;
        
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        for (let i = 0; i < 6; i++) {
          try {
            console.log(`[PAYMENT] Balance fetch attempt ${i + 1}/6`);
            const res = await fetch("/api/wallet/balance", {
              cache: "no-store",
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
              }
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
          
          if (i < 5) {
            console.log(`[PAYMENT] Waiting 1s before next balance check...`);
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }

        if (!verifySuccess) {
          console.error("[PAYMENT] Verification failed after 3 attempts. Error:", verifyError);
          
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

        if (updated || finalBalance > previousBalance) {
          console.log("[PAYMENT] Payment flow completed successfully!");
          setResult({
            status: "success",
            message: `Wallet funded successfully! New balance: ${formatNaira(finalBalance)}`
          });
        } else {
          console.warn("[PAYMENT] Verification succeeded but balance didn't update");
          setResult({
            status: "success",
            message: `Payment verified successfully! If balance doesn't update in a moment, please refresh the page.`
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
      
      setNin("");
      setConsent(false);
      
      setResult({
        status: "success",
        message: "NIN verified successfully! Your verification details are ready.",
        verificationId: data.verificationId
      });
      
      loadBalance();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setResult({
        status: "error",
        message: errorMessage
      });
      
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

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Balance Overview Card */}
      <motion.div variants={fadeIn}>
        <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-white to-emerald-50 shadow-lg hover:shadow-glow transition-shadow">
          {/* Animated background orb */}
          <motion.div
            className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <CardContent className="relative p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-600 text-white shadow-lg"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Wallet className="h-8 w-8" />
                </motion.div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Wallet Balance
                  </p>
                  <motion.p
                    className="text-3xl font-bold sm:text-4xl bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent"
                    key={balance}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    {balance === null ? (
                      <span className="animate-pulse">Loading...</span>
                    ) : (
                      formatNaira(balance)
                    )}
                  </motion.p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleRefreshBalance} 
                disabled={refreshing}
                className="w-full sm:w-auto hover:scale-105 transition-transform"
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
            
            <AnimatePresence>
              {hasInsufficientBalance && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900"
                >
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <p>
                    Insufficient balance. You need at least {formatNaira(feeKobo)} to verify a NIN. 
                    Please fund your wallet below.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Action Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Wallet Funding Card */}
        <motion.div variants={fadeIn}>
          <Card className="group relative overflow-hidden border-border/70 bg-white shadow-md hover:shadow-glow transition-all duration-300 h-full">
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <CardHeader className="relative space-y-2 pb-4">
              <div className="flex items-center gap-3">
                <motion.div
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-blue-500 text-white shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <CreditCard className="h-6 w-6" />
                </motion.div>
                <div>
                  <CardTitle className="text-xl">Fund Wallet</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Add money to verify NINs instantly
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative space-y-5">
              <div className="space-y-3">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Amount (₦)
                </label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="500"
                  inputMode="numeric"
                  className="text-xl font-semibold h-14 border-2 focus:border-primary transition-colors"
                  min="500"
                />
                <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>Minimum ₦500. Pay with card or bank transfer via Paystack.</p>
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-3 gap-3">
                {[500, 1000, 2000].map((quickAmount, i) => (
                  <motion.div
                    key={quickAmount}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setAmount(String(quickAmount))}
                      className="w-full hover:bg-primary/10 hover:border-primary hover:scale-105 transition-all"
                    >
                      ₦{quickAmount}
                    </Button>
                  </motion.div>
                ))}
              </div>

              <Button 
                onClick={handleFundWallet} 
                disabled={loading || amountInvalid}
                size="lg"
                className="w-full h-14 text-base hover:scale-105 transition-transform shadow-lg"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    Opening Paystack...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    Fund Wallet Now
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* NIN Verification Card */}
        <motion.div variants={fadeIn}>
          <Card className="group relative overflow-hidden border-border/70 bg-white shadow-md hover:shadow-glow transition-all duration-300 h-full">
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <CardHeader className="relative space-y-2 pb-4">
              <div className="flex items-center gap-3">
                <motion.div
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 text-white shadow-lg"
                  whileHover={{ scale: 1.1, rotate: -10 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Fingerprint className="h-6 w-6" />
                </motion.div>
                <div>
                  <CardTitle className="text-xl">Verify NIN</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Instant NIMC verification for JAMB
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative space-y-5">
              <div className="space-y-3">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  11-digit NIN
                </label>
                <Input
                  value={formattedNin}
                  onChange={(event) => setNin(normalizeNin(event.target.value))}
                  placeholder="123 4567 8901"
                  inputMode="numeric"
                  maxLength={13}
                  className="text-xl font-semibold tracking-wider h-14 border-2 focus:border-primary transition-colors"
                />
                <div className="flex items-center justify-between text-sm bg-muted/50 rounded-lg p-3">
                  <span className="text-muted-foreground">
                    {nin.length}/11 digits
                  </span>
                  <span className="font-bold text-primary">
                    Fee: {formatNaira(feeKobo)}
                  </span>
                </div>
              </div>

              {/* Consent Checkbox */}
              <motion.label
                className="flex cursor-pointer items-start gap-4 rounded-2xl border-2 border-border/70 bg-muted/30 p-5 text-sm transition-all hover:bg-muted/50 hover:border-primary/50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Checkbox
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                  className="mt-0.5"
                />
                <span className="flex-1 leading-relaxed">
                  I consent to an identity verification check against NIMC records for this NIN.
                </span>
              </motion.label>

              <Button 
                onClick={handleVerify} 
                disabled={!canVerify}
                size="lg"
                className="w-full h-14 text-base hover:scale-105 transition-transform shadow-lg"
              >
                {verifying ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-5 w-5" />
                    Verify NIN Now
                  </>
                )}
              </Button>

              <AnimatePresence>
                {!canVerify && nin.length === 11 && !consent && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-sm text-amber-600 flex items-center gap-2 bg-amber-50 rounded-lg p-3"
                  >
                    <AlertCircle className="h-4 w-4" />
                    Please provide consent to continue
                  </motion.p>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Result Message */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Card 
              className={`border-2 ${
                result.status === "success"
                  ? "border-emerald-300 bg-gradient-to-br from-emerald-50 to-emerald-100/50"
                  : "border-red-300 bg-gradient-to-br from-red-50 to-red-100/50"
              } shadow-lg`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: 360 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    {result.status === "success" ? (
                      <CheckCircle2 className="h-8 w-8 shrink-0 text-emerald-600" />
                    ) : (
                      <AlertCircle className="h-8 w-8 shrink-0 text-red-600" />
                    )}
                  </motion.div>
                  <div className="flex-1 space-y-3">
                    <p className={`text-lg font-bold ${
                      result.status === "success" ? "text-emerald-900" : "text-red-900"
                    }`}>
                      {result.message}
                    </p>
                    {result.verificationId && (
                      <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="bg-white hover:bg-emerald-100 hover:scale-105 transition-all shadow-md"
                      >
                        <Link href={`/dashboard/receipts/${result.verificationId}`}>
                          <Sparkles className="h-5 w-5" />
                          View Verification Details
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Cards */}
      <motion.div
        variants={staggerContainer}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {[
          {
            icon: ShieldCheck,
            title: "Instant Verification",
            description: "Real-time NIMC data with name, DOB, and phone number",
            gradient: "from-blue-50 to-blue-100/50",
            iconBg: "bg-blue-500/10 text-blue-600"
          },
          {
            icon: RefreshCw,
            title: "Auto Refund",
            description: "Invalid NINs trigger instant wallet refunds",
            gradient: "from-amber-50 to-amber-100/50",
            iconBg: "bg-amber-500/10 text-amber-600"
          },
          {
            icon: Sparkles,
            title: "JAMB Ready",
            description: "Download receipt with verified identity data",
            gradient: "from-emerald-50 to-emerald-100/50",
            iconBg: "bg-emerald-500/10 text-emerald-600"
          }
        ].map((item, i) => (
          <motion.div key={i} variants={fadeIn}>
            <Card className={`group border-border/50 bg-gradient-to-br ${item.gradient} hover:shadow-lg transition-all duration-300 cursor-pointer`}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <motion.div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.iconBg}`}
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <item.icon className="h-6 w-6" />
                  </motion.div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold group-hover:text-primary transition-colors">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
