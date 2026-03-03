import Link from "next/link";
import type { ReactNode } from "react";
import { getSession } from "@/lib/auth";
import { ShieldCheck, Wallet } from "lucide-react";
import { LogoutButton } from "@/components/organisms/logout-button";

export default async function DashboardLayout({
  children
}: {
  children: ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50 to-orange-50">
      <div className="container grid min-h-screen gap-6 py-8 lg:grid-cols-[240px_1fr]">
        <aside className="flex flex-col gap-6 rounded-3xl border border-border/70 bg-white/80 p-6 shadow-card">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-base font-semibold">JAMB Verify</p>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Dashboard
              </p>
            </div>
          </Link>

          <nav className="space-y-2 text-sm">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-2xl border border-transparent px-3 py-2 font-medium text-foreground hover:border-border/70 hover:bg-muted/60"
            >
              <Wallet className="h-4 w-4" />
              Wallet & Verify
            </Link>
            <Link
              href="/dashboard/transactions"
              className="flex items-center gap-2 rounded-2xl border border-transparent px-3 py-2 font-medium text-foreground hover:border-border/70 hover:bg-muted/60"
            >
              Transaction History
            </Link>
          </nav>

          <div className="mt-auto space-y-4 rounded-2xl border border-border/70 bg-muted/40 p-4 text-sm">
            <p className="font-semibold">Signed in as</p>
            <p className="text-muted-foreground">{session?.fullName ?? "Candidate"}</p>
            <LogoutButton />
          </div>
        </aside>

        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}
