import { notFound } from "next/navigation";
import { db } from "@/db/client";
import { getSession } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { PrintButton } from "@/components/organisms/print-button";

export default async function ReceiptPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    return notFound();
  }

  const verification = await db.query.ninVerifications.findFirst({
    where: (table, { eq, and }) =>
      and(eq(table.id, id), eq(table.userId, session.userId))
  });

  if (!verification) {
    return notFound();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border/70 bg-white/90 p-6 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">
          Receipt
        </p>
        <h1 className="font-heading text-3xl font-semibold">NIN verification result</h1>
        <p className="text-sm text-muted-foreground">
          Keep this receipt for your JAMB profile completion.
        </p>
      </div>

      <Card className="border-border/70 bg-white/95 p-8 print:border-none print:shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">JAMB Verify Receipt</h2>
            <p className="text-sm text-muted-foreground">
              Verification ID: {verification.id}
            </p>
          </div>
          <PrintButton />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border/70 bg-muted/40 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Candidate name
            </p>
            <p className="text-lg font-semibold">{verification.fullName ?? "-"}</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/40 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Date of birth
            </p>
            <p className="text-lg font-semibold">{verification.dateOfBirth ?? "-"}</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/40 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Phone number
            </p>
            <p className="text-lg font-semibold">{verification.phone ?? "-"}</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/40 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              NIN (masked)
            </p>
            <p className="text-lg font-semibold">{verification.ninMasked}</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          Status: {verification.status === "success" ? "Verified" : "Failed"}
        </div>
      </Card>
    </div>
  );
}
