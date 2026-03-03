import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Sora, Space_Grotesk } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap"
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

export const metadata: Metadata = {
  title: "NIN Verify for JAMB | Instant Identity Check",
  description:
    "Instantly verify your NIN against NIMC records, fund your wallet via Paystack, and download your JAMB-ready receipt in seconds.",
  metadataBase: new URL("https://example.com")
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className={`${sora.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
