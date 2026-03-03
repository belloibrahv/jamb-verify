import { SectionTitle } from "@/components/atoms/section-title";
import { Card } from "@/components/ui/card";
import { ArrowRight, CreditCard, Fingerprint, FileCheck2 } from "lucide-react";

const steps = [
  {
    title: "Create account + fund wallet",
    description: "Sign up once, then fund your wallet with Paystack card or transfer.",
    icon: CreditCard
  },
  {
    title: "Enter your 11-digit NIN",
    description: "Consent is mandatory before we request your NIMC record.",
    icon: Fingerprint
  },
  {
    title: "Instant NIN confirmation",
    description: "₦500 is deducted, and a receipt downloads in seconds.",
    icon: FileCheck2
  }
];

export function HowItWorksSection() {
  return (
    <section id="how" className="py-20">
      <div className="container space-y-10">
        <SectionTitle
          eyebrow="How it works"
          title="Three steps to a verified JAMB profile"
          description="Keep the flow simple and predictable for candidates and staff supporting them."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={step.title} className="relative space-y-4 border-border/60 bg-white/80">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
                <step.icon className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
              {index < steps.length - 1 ? (
                <span className="absolute -right-3 top-10 hidden h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm md:flex">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </span>
              ) : null}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
