import type { Metadata } from "next";
import { StaffShell } from "@/components/StaffShell";
import { requireRole } from "@/lib/auth";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole(["admin"]);
  return <StaffShell profile={profile}>{children}</StaffShell>;
}
