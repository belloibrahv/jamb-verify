"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, CheckCircle2, Sparkles, Zap, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedLogo } from "@/components/animations/animated-logo";
import { FloatingShapes } from "@/components/animations/floating-shapes";

const staggerContainer = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const staggerItem = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export function HeroSection() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative overflow-hidden pb-20 pt-6">
      <FloatingShapes />
      
      <div className="container relative z-10">
        {/* Navigation */}
        <motion.nav
          initial={{ y: 0, opacity: 1 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap items-center justify-between gap-6"
        >
          <Link href="/" className="flex items-center gap-3 group">
            <AnimatedLogo />
            <div>
              <p className="text-lg font-semibold group-hover:text-primary transition-colors">
                JAMB Verify
              </p>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                NIN ID HUB
              </p>
            </div>
          </Link>
          
          <div className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            {["Features", "How it works", "Privacy"].map((item, i) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="hover:text-foreground transition-colors relative group"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
              </motion.a>
            ))}
          </div>
          
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 1, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button variant="outline" size="sm" asChild className="hover:scale-105 transition-transform">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild className="hover:scale-105 transition-transform">
              <Link href="/register">
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </motion.nav>

        {/* Hero Content */}
        <div className="mt-20 grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="space-y-8"
            style={{ y, opacity }}
          >
            <motion.div variants={staggerItem}>
              <Badge variant="success" className="animate-pulse">
                <Zap className="h-3 w-3 mr-1" />
                Instant JAMB NIN Verification
              </Badge>
            </motion.div>
            
            <motion.h1
              variants={staggerItem}
              className="font-heading text-5xl font-bold leading-tight md:text-6xl lg:text-7xl bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent"
            >
              Verify your NIN in{" "}
              <span className="bg-gradient-to-r from-primary via-emerald-500 to-primary bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]">
                seconds
              </span>
            </motion.h1>
            
            <motion.p
              variants={staggerItem}
              className="text-xl text-muted-foreground max-w-2xl leading-relaxed"
            >
              Fund your wallet, verify instantly, and finish JAMB registration without queues. 
              Powered by YouVerify with automatic ₦500 deductions and UTME-ready receipts.
            </motion.p>
            
            <motion.div variants={staggerItem} className="flex flex-wrap gap-4">
              <Button size="lg" asChild className="group hover:shadow-glow transition-all">
                <Link href="/register">
                  Start verification
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="hover:bg-primary/5">
                <Link href="#how">See how it works</Link>
              </Button>
            </motion.div>
            
            <motion.div
              variants={staggerContainer}
              className="flex flex-wrap gap-6 text-sm"
            >
              {[
                { icon: Shield, text: "NDPR consent captured" },
                { icon: Zap, text: "Paystack card + transfer" },
                { icon: Clock, text: "Auto-refund on failure" }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={staggerItem}
                  className="flex items-center gap-2 text-muted-foreground group"
                >
                  <item.icon className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                  <span className="group-hover:text-foreground transition-colors">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Animated Card */}
          <motion.div
            initial={{ opacity: 1, x: 0, rotateY: 0 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="relative perspective-1000"
          >
            {/* Floating orbs */}
            <motion.div
              className="absolute -left-8 -top-8 h-40 w-40 rounded-full bg-primary/20 blur-3xl"
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
            <motion.div
              className="absolute -bottom-10 -right-6 h-40 w-40 rounded-full bg-accent/20 blur-3xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            />
            
            <motion.div
              className="glass relative space-y-6 rounded-[32px] p-8 shadow-card hover:shadow-glow transition-shadow"
              whileHover={{ scale: 1.02, rotateY: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <motion.p
                    className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    NIMC Snapshot
                  </motion.p>
                  <p className="text-xl font-bold mt-1">Verification Receipt</p>
                </div>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Sparkles className="h-6 w-6 text-secondary" />
                </motion.div>
              </div>
              
              <div className="grid gap-4">
                <motion.div
                  className="rounded-2xl border border-border/70 bg-gradient-to-br from-white/90 to-white/70 p-5"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <p className="text-xs text-muted-foreground mb-2">Candidate</p>
                  <p className="text-lg font-bold">Aisha Olumide Yusuf</p>
                  <p className="text-sm text-muted-foreground mt-1">DOB: 12 Nov 2006</p>
                </motion.div>
                
                <motion.div
                  className="flex items-center gap-4 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-emerald-500/5 p-5"
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <CheckCircle2 className="h-6 w-6" />
                  </motion.div>
                  <div>
                    <p className="text-sm font-bold">NIN matched successfully</p>
                    <p className="text-xs text-muted-foreground">Receipt ready for JAMB profile</p>
                  </div>
                </motion.div>
              </div>
              
              <motion.div
                className="relative h-48 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-xs font-semibold">Verified Student</p>
                  <p className="text-sm opacity-90">Ready for JAMB Registration</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
