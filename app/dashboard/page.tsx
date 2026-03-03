import { DashboardClient } from "@/components/organisms/dashboard-client";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border/70 bg-white/90 p-6 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">
          Wallet & Verification
        </p>
        <h1 className="font-heading text-3xl font-semibold">Verify NIN for JAMB</h1>
        <p className="text-sm text-muted-foreground">
          Fund your wallet and complete NIMC checks with instant receipts.
        </p>
      </div>
      <DashboardClient />
    </div>
  );
}
