"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function setUserRole(formData: FormData) {
  const admin = await requireRole(["admin"]);
  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "");
  if (!id || !["reader", "writer", "admin"].includes(role)) return;
  // Prevent an admin from locking themselves out.
  if (id === admin.id) return;

  const supabase = await createClient();
  await supabase.from("profiles").update({ role }).eq("id", id);
  revalidatePath("/admin/pengguna");
}
