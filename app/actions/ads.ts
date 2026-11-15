"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PUBLISHER_ID, UNIT_ID } from "@/lib/ads";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const back = (kind: "ok" | "error", message: string) => redirect(`/admin/iklan?${kind}=${encodeURIComponent(message)}`);

export async function saveAdSettings(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await createClient();

  const publisherId = String(formData.get("publisher_id") ?? "").trim();
  if (publisherId && !PUBLISHER_ID.test(publisherId)) back("error", "ID penerbit tidak valid. Contoh: ca-pub-1234567890123456.");
  const enabled = formData.get("enabled") === "on";
  if (enabled && !publisherId) back("error", "Isi ID penerbit AdSense dulu sebelum mengaktifkan iklan.");

  const { data: slots } = await supabase.from("ad_slots").select("slot_key");
  const updates = [];
  for (const { slot_key } of slots ?? []) {
    const unit = String(formData.get(`unit_${slot_key}`) ?? "").trim();
    if (unit && !UNIT_ID.test(unit)) back("error", `ID unit iklan untuk "${slot_key}" harus berupa angka (6–20 digit).`);
    updates.push(
      supabase.from("ad_slots").update({ enabled: formData.get(`enabled_${slot_key}`) === "on", unit_id: unit || null }).eq("slot_key", slot_key),
    );
  }
  const results = await Promise.all([
    supabase.from("ad_config").update({ enabled, publisher_id: publisherId || null, updated_at: new Date().toISOString() }).eq("id", true),
    ...updates,
  ]);
  const failed = results.find((result) => result.error);
  if (failed?.error) back("error", `Gagal menyimpan: ${failed.error.message}`);

  revalidatePath("/", "layout");
  revalidatePath("/ads.txt");
  back("ok", enabled ? "Pengaturan iklan disimpan dan iklan aktif." : "Pengaturan iklan disimpan (iklan belum aktif).");
}
