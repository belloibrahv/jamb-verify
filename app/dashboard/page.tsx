"use client";

import { motion } from "framer-motion";
import { DashboardClient } from "@/components/organisms/dashboard-client-enhanced";
import { ShieldCheck, Sparkles } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-white to-accent/5 p-8 shadow-lg"
      >
        {/* Animated background orb */}
        <motion.div
          className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <div className="relative flex items-start gap-5">
          <motion.div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-600 text-white shadow-lg"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <ShieldCheck className="h-8 w-8" />
          </motion.div>
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-heading text-3xl font-bold sm:text-4xl bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
                NIN Verification Hub
              </h1>
              <motion.span
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary"
                animate={{
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Sparkles className="h-4 w-4" />
                JAMB Ready
              </motion.span>
            </div>
            <p className="text-base text-muted-foreground leading-relaxed sm:text-lg">
              Fund your wallet and complete instant NIMC identity checks with downloadable receipts for your JAMB registration.
            </p>
          </div>
        </div>
      </motion.div>
      <DashboardClient />
    </div>
  );
}
