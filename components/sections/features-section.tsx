import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionTitle } from "@/components/atoms/section-title";
import {
  CreditCard,
  FileCheck2,
  Fingerprint,
  RefreshCcw,
  ShieldCheck,
  Wallet
} from "lucide-react";

const features = [
  {
    title: "Wallet funding with Paystack",
    description: "Add ₦500 or more via card or bank transfer with instant confirmation.",
    icon: Wallet
  },
  {
    title: "11-digit NIN formatting",
    description: "Smart input keeps the NIN readable and validates before submission.",
    icon: Fingerprint
  },
  {
    title: "Consent-first verification",
    description: "NDPR-compliant consent capture before every identity check.",
    icon: ShieldCheck
  },
  {
    title: "YouVerify instant lookup",
    description: "Real-time NIMC data response for name, DOB, and phone number.",
    icon: FileCheck2
  },
  {
    title: "Auto-refund on failure",
    description: "No charge for invalid NINs; wallet refunds happen instantly.",
    icon: RefreshCcw
  },
  {
    title: "Receipt ready",
    description: "Download a JAMB-ready receipt with verified identity data.",
    icon: CreditCard
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20">
      <div className="container space-y-12">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <SectionTitle
            eyebrow="Features"
            title="Built for high-volume JAMB registration"
            description="Every feature mirrors the JAMB workflow: wallet funding, NIN validation, and instant receipts with the right data fields."
          />
          <Badge variant="warning">₦500 per verification</Badge>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="space-y-3 border-border/60 bg-white/80">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <feature.icon className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
