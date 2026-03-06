import { notFound } from "next/navigation";
import { db } from "@/db/client";
import { getSession } from "@/lib/auth";
import { PrintButton } from "@/components/organisms/print-button";
import { CheckCircle2, Calendar, Phone, User, MapPin, Shield } from "lucide-react";
import Image from "next/image";

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

  // Extract data from rawResponse
  const rawData = verification.rawResponse as Record<string, unknown> | null;
  const details = (rawData?.data as Record<string, unknown>) || {};
  const address = (details.address as Record<string, unknown>) || {};
  
  const fullName = verification.fullName || "-";
  const dateOfBirth = verification.dateOfBirth || "-";
  const phone = verification.phone || "-";
  const gender = (details.gender as string) || "-";
  const imageUrl = (details.image as string) || null;
  const addressLine = [
    address.addressLine as string,
    address.town as string,
    address.lga as string,
    address.state as string
  ].filter(Boolean).join(", ") || "-";
  
  const verificationDate = verification.createdAt 
    ? new Date(verification.createdAt).toLocaleDateString("en-NG", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : "-";

  return (
    <div className="space-y-6 print:space-y-0">
      {/* Header - Hidden on print */}
      <div className="rounded-3xl border border-border/70 bg-white/90 p-6 shadow-card print:hidden">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">
          Verification Document
        </p>
        <h1 className="font-heading text-3xl font-semibold">NIN Verification Result</h1>
        <p className="text-sm text-muted-foreground">
          Official verification document for JAMB registration and other purposes.
        </p>
      </div>

      {/* Professional Document */}
      <div className="bg-white shadow-lg print:shadow-none">
        {/* Document Header */}
        <div className="border-b-4 border-primary bg-gradient-to-r from-primary/5 to-accent/5 p-8 print:border-b-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-primary print:text-3xl">
                JAMB Verify
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                National Identity Number Verification Service
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Document ID: {verification.id}
              </p>
            </div>
            <div className="print:hidden">
              <PrintButton />
            </div>
          </div>
        </div>

        {/* Verification Status Banner */}
        <div className="bg-emerald-50 px-8 py-4 print:bg-emerald-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 print:bg-emerald-200">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="font-bold text-emerald-900">VERIFICATION SUCCESSFUL</p>
              <p className="text-sm text-emerald-700">
                This NIN has been verified against NIMC records
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 print:p-12">
          {/* Candidate Information */}
          <div className="mb-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
              <User className="h-5 w-5 text-primary" />
              Candidate Information
            </h2>
            
            <div className="grid gap-6 md:grid-cols-[auto_1fr] print:grid-cols-[auto_1fr]">
              {/* Photo */}
              {imageUrl && (
                <div className="flex justify-center md:justify-start">
                  <div className="relative h-40 w-32 overflow-hidden rounded-lg border-2 border-border shadow-sm print:h-48 print:w-36">
                    <Image
                      src={imageUrl}
                      alt="Candidate Photo"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>
              )}
              
              {/* Details Grid */}
              <div className="grid gap-4 sm:grid-cols-2 print:grid-cols-2">
                <div className="rounded-lg border border-border/70 bg-muted/30 p-4 print:bg-gray-50">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Full Name
                  </p>
                  <p className="text-base font-semibold text-foreground print:text-lg">
                    {fullName}
                  </p>
                </div>

                <div className="rounded-lg border border-border/70 bg-muted/30 p-4 print:bg-gray-50">
                  <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    Date of Birth
                  </p>
                  <p className="text-base font-semibold text-foreground print:text-lg">
                    {dateOfBirth}
                  </p>
                </div>

                <div className="rounded-lg border border-border/70 bg-muted/30 p-4 print:bg-gray-50">
                  <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    Phone Number
                  </p>
                  <p className="text-base font-semibold text-foreground print:text-lg">
                    {phone}
                  </p>
                </div>

                <div className="rounded-lg border border-border/70 bg-muted/30 p-4 print:bg-gray-50">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Gender
                  </p>
                  <p className="text-base font-semibold capitalize text-foreground print:text-lg">
                    {gender}
                  </p>
                </div>

                <div className="rounded-lg border border-border/70 bg-muted/30 p-4 print:bg-gray-50 sm:col-span-2 print:col-span-2">
                  <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    Address
                  </p>
                  <p className="text-base font-semibold text-foreground print:text-lg">
                    {addressLine}
                  </p>
                </div>

                <div className="rounded-lg border border-border/70 bg-muted/30 p-4 print:bg-gray-50 sm:col-span-2 print:col-span-2">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    NIN (Masked for Privacy)
                  </p>
                  <p className="font-mono text-base font-semibold tracking-wider text-foreground print:text-lg">
                    {verification.ninMasked}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Details */}
          <div className="mb-8 rounded-lg border border-border/70 bg-muted/20 p-6 print:bg-gray-50">
            <h3 className="mb-4 flex items-center gap-2 font-bold text-foreground">
              <Shield className="h-5 w-5 text-primary" />
              Verification Details
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 print:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Verification Date</p>
                <p className="mt-1 font-semibold">{verificationDate}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Verification Status</p>
                <p className="mt-1 font-semibold text-emerald-600">
                  {verification.status === "success" ? "VERIFIED" : "FAILED"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Provider Reference</p>
                <p className="mt-1 font-mono text-sm font-semibold">
                  {verification.providerReference || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Document ID</p>
                <p className="mt-1 font-mono text-sm font-semibold">{verification.id}</p>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="rounded-lg border-l-4 border-primary bg-primary/5 p-4 print:bg-blue-50">
            <p className="text-sm font-semibold text-primary">Important Notice</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              This document serves as proof of NIN verification. It has been verified against the
              National Identity Management Commission (NIMC) database. This document is valid for
              JAMB registration and other official purposes. Keep this document safe and do not
              share with unauthorized persons.
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 border-t border-border/70 pt-6 text-center print:mt-12">
            <p className="text-xs text-muted-foreground">
              Generated by JAMB Verify • {new Date().toLocaleDateString("en-NG")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              For support, visit our website or contact support@jambverify.com
            </p>
            <p className="mt-2 text-xs font-semibold text-primary">
              This is an official verification document
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
