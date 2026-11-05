import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Role = "reader" | "writer" | "admin";

export type CurrentProfile = {
  id: string;
  full_name: string;
  role: Role;
  email: string;
};

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .single();
  if (!data) return null;

  return { id: data.id, full_name: data.full_name, role: data.role as Role, email: user.email ?? "" };
}

/** Redirects to /login when signed out and to /dashboard when the role is not allowed. */
export async function requireRole(allowed: Role[]): Promise<CurrentProfile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!allowed.includes(profile.role)) redirect("/dashboard");
  return profile;
}
