import { DashboardSimple } from "@/components/organisms/dashboard-simple";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">NIN Verification</h1>
        <p className="text-muted-foreground">
          Fund your wallet and verify NINs for JAMB registration
        </p>
      </div>
      <DashboardSimple />
    </div>
  );
}
