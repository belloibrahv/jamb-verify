"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Wallet, History, User, LogOut, Menu, X } from "lucide-react";
import { AnimatedLogo } from "@/components/animations/animated-logo";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Wallet & Verify", icon: Wallet },
  { href: "/dashboard/transactions", label: "Transaction History", icon: History }
];

export default function DashboardLayoutClient({
  children,
  session
}: {
  children: ReactNode;
  session: { fullName?: string; email?: string } | null;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50/30 to-orange-50/30 relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div
        className="absolute top-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />

      <div className="container relative z-10 grid min-h-screen gap-6 py-6 lg:grid-cols-[280px_1fr]">
        {/* Desktop Sidebar */}
        <motion.aside
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:flex flex-col gap-6 rounded-3xl border border-border/70 bg-white/90 backdrop-blur-sm p-6 shadow-card h-fit sticky top-6"
        >
          <Link href="/" className="flex items-center gap-3 group">
            <AnimatedLogo />
            <div>
              <p className="text-lg font-bold group-hover:text-primary transition-colors">
                JAMB Verify
              </p>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Dashboard
              </p>
            </div>
          </Link>

          <nav className="space-y-2">
            {navItems.map((item, i) => {
              const isActive = pathname === item.href;
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-medium transition-all ${
                      isActive
                        ? "bg-primary text-white shadow-lg scale-105"
                        : "text-foreground hover:bg-muted/60 hover:scale-105"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-auto space-y-4 rounded-2xl border border-border/70 bg-gradient-to-br from-muted/40 to-muted/20 p-5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {session?.fullName ?? "Candidate"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {session?.email ?? ""}
                </p>
              </div>
            </div>
            <form action="/api/auth/logout" method="POST">
              <motion.button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </motion.button>
            </form>
          </motion.div>
        </motion.aside>

        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-border/70 shadow-sm">
          <div className="container flex items-center justify-between py-4">
            <Link href="/" className="flex items-center gap-2">
              <AnimatedLogo size="default" />
              <span className="font-bold">JAMB Verify</span>
            </Link>
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"
              whileTap={{ scale: 0.95 }}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden fixed top-[73px] left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-border/70 shadow-lg"
          >
            <div className="container py-4 space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-medium transition-all ${
                      isActive
                        ? "bg-primary text-white"
                        : "text-foreground hover:bg-muted/60"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
              <div className="pt-4 border-t border-border/70">
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {session?.fullName ?? "Candidate"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {session?.email ?? ""}
                    </p>
                  </div>
                </div>
                <form action="/api/auth/logout" method="POST" className="px-4 pt-2">
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6 lg:mt-0 mt-20"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
