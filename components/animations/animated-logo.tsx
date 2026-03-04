"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

export function AnimatedLogo({ size = "default" }: { size?: "default" | "large" }) {
  const dimensions = size === "large" ? "h-16 w-16" : "h-11 w-11";
  const iconSize = size === "large" ? "h-8 w-8" : "h-5 w-5";

  return (
    <motion.div
      className={`relative flex ${dimensions} items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-600 text-white shadow-glow`}
      whileHover={{ scale: 1.05, rotate: 5 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {/* Animated background pulse */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-primary/30"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0, 0.5]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Shield icon with animation */}
      <motion.div
        animate={{
          y: [0, -2, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <ShieldCheck className={iconSize} />
      </motion.div>
    </motion.div>
  );
}
