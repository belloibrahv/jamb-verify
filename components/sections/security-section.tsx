import { SectionTitle } from "@/components/atoms/section-title";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, ShieldCheck, Smartphone } from "lucide-react";

const safeguards = [
  {
    title: "Consent-driven requests",
    description: "Every verification requires explicit consent recorded per request.",
    icon: ShieldCheck
  },
  {
    title: "Masked NIN history",
    description: "Transaction logs only store masked NIN values for privacy.",
    icon: Lock
  },
  {
    title: "Receipt access on any device",
    description: "Download receipts securely from mobile or desktop dashboards.",
    icon: Smartphone
  }
];

export function SecuritySection() {
  return (
    <section id="security" className="py-20">
      <div className="container space-y-12">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <SectionTitle
            eyebrow="Privacy"
            title="NDPR-aligned safeguards for candidate data"
            description="NIN verification handles sensitive identity data. Every piece of information is stored minimally and securely."
          />
          <Badge variant="success">NDPR aware</Badge>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {safeguards.map((item) => (
            <Card key={item.title} className="space-y-3 border-border/60 bg-white/80">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
