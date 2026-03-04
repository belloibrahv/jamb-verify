import type { ReactNode } from "react";
import { getSession } from "@/lib/auth";
import DashboardLayoutClient from "./layout-enhanced";

export default async function DashboardLayout({
  children
}: {
  children: ReactNode;
}) {
  const session = await getSession();

  return (
    <DashboardLayoutClient session={session}>
      {children}
    </DashboardLayoutClient>
  );
}
