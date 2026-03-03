export default function SupportPage() {
  return (
    <div className="container py-16">
      <div className="space-y-10">
        <header className="rounded-3xl border border-border/70 bg-white/90 p-8 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">
            Help & Support
          </p>
          <h1 className="mt-3 font-heading text-3xl font-semibold">Support</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            We&apos;re here to keep your JAMB verification workflow smooth. Reach out with
            account issues, billing questions, or verification concerns and we&apos;ll guide
            you through the next steps.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="rounded-full bg-muted px-3 py-1">Primary: Email support</span>
            <span className="rounded-full bg-muted px-3 py-1">Coverage: WAT</span>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-border/60 bg-white/80 p-6 shadow-card">
            <h2 className="text-lg font-semibold">Contact support</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Email is the fastest way to get help. Please include your account email
              and any relevant transaction references.
            </p>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">Email:</span>{" "}
                support@jambverify.com
              </p>
              <p>
                <span className="font-semibold text-foreground">Phone:</span>{" "}
                +234 800 000 0000
              </p>
              <p>
                <span className="font-semibold text-foreground">WhatsApp:</span>{" "}
                +234 800 000 0000
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-border/60 bg-white/80 p-6 shadow-card">
            <h2 className="text-lg font-semibold">Support hours & response targets</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Hours: Monday-Saturday, 8:00-18:00 WAT.</li>
              <li>High priority verification failures: reply within 4 business hours.</li>
              <li>Billing and account inquiries: reply within 1 business day.</li>
            </ul>
          </section>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-3xl border border-border/60 bg-white/80 p-6 shadow-card">
            <h2 className="text-lg font-semibold">Before you contact us</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Your account email and phone number.</li>
              <li>The masked NIN or verification ID from your receipt.</li>
              <li>Transaction reference for wallet funding or refunds.</li>
              <li>Screenshots of any error messages.</li>
            </ul>
          </section>

          <section className="rounded-3xl border border-border/60 bg-white/80 p-6 shadow-card">
            <h2 className="text-lg font-semibold">Security guidance</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Never send your full NIN or password by email or chat.</li>
              <li>Only share the masked NIN shown in your transaction history.</li>
              <li>Our team will never ask for your OTP or Paystack PIN.</li>
            </ul>
          </section>

          <section className="rounded-3xl border border-border/60 bg-white/80 p-6 shadow-card">
            <h2 className="text-lg font-semibold">Common questions</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Verification results are returned instantly in most cases.</li>
              <li>
                Invalid NINs trigger an automatic wallet refund; check your wallet
                history for the refund entry.
              </li>
              <li>
                Receipts are available in your dashboard and can be downloaded anytime.
              </li>
              <li>Wallet top-ups are processed via Paystack and may take a few minutes.</li>
            </ul>
          </section>

          <section className="rounded-3xl border border-border/60 bg-white/80 p-6 shadow-card">
            <h2 className="text-lg font-semibold">Compliance requests</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              For data access, deletion, or data protection-related requests, email our
              Data Protection Officer with your account email and a brief description of
              the request.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">DPO:</span>{" "}
              dpo@jambverify.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
