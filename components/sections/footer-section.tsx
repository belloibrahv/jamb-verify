import Link from "next/link";

export function FooterSection() {
  return (
    <footer className="border-t border-border/70 bg-white/70 py-10">
      <div className="container flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">JAMB Verify</p>
          <p className="text-xs text-muted-foreground">
            © 2026 JAMB Verify. All rights reserved.
          </p>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms
          </Link>
          <Link href="/support" className="hover:text-foreground">
            Support
          </Link>
        </div>
      </div>
    </footer>
  );
}
