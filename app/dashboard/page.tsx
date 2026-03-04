import { DashboardClient } from "@/components/organisms/dashboard-client";
import { ShieldCheck } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-white to-accent/5 p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-2xl font-bold sm:text-3xl">
                NIN Verification Hub
              </h1>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                JAMB Ready
              </span>
            </div>
            <p className="text-sm text-muted-foreground sm:text-base">
              Fund your wallet and complete instant NIMC identity checks with downloadable receipts for your JAMB registration.
            </p>
          </div>
        </div>
      </div>
      <DashboardClient />
    </div>
  );
}
