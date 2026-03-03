import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="relative overflow-hidden rounded-[36px] border border-border/60 bg-gradient-to-br from-primary/90 via-primary to-emerald-700 p-10 text-white shadow-card">
          <div className="absolute right-10 top-10 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-8 left-12 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
          <div className="relative space-y-6">
            <h2 className="font-heading text-3xl font-semibold md:text-4xl">
              Ready for a stress-free JAMB registration?
            </h2>
            <p className="max-w-2xl text-base text-white/80">
              Register once, fund your wallet, and verify any candidate NIN instantly. Every
              receipt is ready for upload during UTME registration.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="secondary" size="lg" asChild>
                <Link href="/register">Create your account</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/dashboard">Go to dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
