"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pb-16 pt-10">
      <div className="container">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-glow">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-lg font-semibold">JAMB Verify</p>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                NIN ID HUB
              </p>
            </div>
          </Link>
          <div className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">
              Features
            </a>
            <a href="#how" className="hover:text-foreground">
              How it works
            </a>
            <a href="#security" className="hover:text-foreground">
              Privacy
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-6">
            <Badge variant="success">Instant JAMB NIN Verification</Badge>
            <h1 className="font-heading text-4xl font-semibold leading-tight md:text-5xl">
              Verify your NIN in seconds, fund your wallet, and finish JAMB registration
              without queues.
            </h1>
            <p className="text-lg text-muted-foreground">
              Seamless NIMC checks powered by YouVerify, automatic ₦500 wallet deductions,
              and a downloadable receipt built exactly for UTME registration.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/register">
                  Start verification <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="#how">See the flow</Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                NDPR consent captured
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Paystack card + transfer
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Auto-refund on failure
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute -left-8 -top-8 h-36 w-36 rounded-full bg-primary/10 blur-2xl" />
            <div className="absolute -bottom-10 -right-6 h-36 w-36 rounded-full bg-accent/20 blur-2xl" />
            <div className="glass relative space-y-5 rounded-[32px] p-6 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    NIMC Snapshot
                  </p>
                  <p className="text-lg font-semibold">Verification Receipt</p>
                </div>
                <Sparkles className="h-5 w-5 text-secondary" />
              </div>
              <div className="grid gap-4">
                <div className="rounded-2xl border border-border/70 bg-white/70 p-4">
                  <p className="text-xs text-muted-foreground">Candidate</p>
                  <p className="text-base font-semibold">Aisha Olumide Yusuf</p>
                  <p className="text-sm text-muted-foreground">DOB: 12 Nov 2006</p>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-white/70 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">NIN matched successfully</p>
                    <p className="text-xs text-muted-foreground">Receipt ready for JAMB profile</p>
                  </div>
                </div>
              </div>
              <Image
                src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80"
                alt="Student verifying identity"
                width={800}
                height={500}
                className="h-40 w-full rounded-2xl object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
