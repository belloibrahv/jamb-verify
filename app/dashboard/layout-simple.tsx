import Link from "next/link";
import type { ReactNode } from "react";
import { getSession } from "@/lib/auth";
import { ShieldCheck, Wallet, History, LogOut } from "lucide-react";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="font-bold text-lg">JAMB Verify</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 text-sm font-medium hover:text-primary"
              >
                <Wallet className="h-4 w-4" />
                Dashboard
              </Link>
              <Link 
                href="/dashboard/transactions" 
                className="flex items-center gap-2 text-sm font-medium hover:text-primary"
              >
                <History className="h-4 w-4" />
                History
              </Link>
            </nav>

            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 py-3">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 text-sm font-medium hover:text-primary"
            >
              <Wallet className="h-4 w-4" />
              Dashboard
            </Link>
            <Link 
              href="/dashboard/transactions" 
              className="flex items-center gap-2 text-sm font-medium hover:text-primary"
            >
              <History className="h-4 w-4" />
              History
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* User Info */}
        <div className="mb-6 p-4 bg-white rounded-lg border">
          <p className="text-sm text-muted-foreground">Signed in as</p>
          <p className="font-medium">{session.fullName || session.email}</p>
        </div>

        {children}
      </main>
    </div>
  );
}
