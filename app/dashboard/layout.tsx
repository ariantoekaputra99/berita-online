import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { StaffShell } from "@/components/StaffShell";
import { getCurrentProfile } from "@/lib/auth";

export const metadata: Metadata = { title: "Ruang redaksi", robots: { index: false, follow: false } };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  return <StaffShell profile={profile}>{children}</StaffShell>;
}
