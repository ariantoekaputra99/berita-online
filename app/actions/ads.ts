"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { HTTPS_URL, PUBLISHER_ID, UNIT_ID } from "@/lib/ads";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const back = (kind: "ok" | "error", message: string) => redirect(`/admin/iklan?${kind}=${encodeURIComponent(message)}`);
const text = (formData: FormData, name: string) => String(formData.get(name) ?? "").trim();

export async function saveAdSettings(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await createClient();

  const publisherId = text(formData, "publisher_id");
  if (publisherId && !PUBLISHER_ID.test(publisherId)) back("error", "ID penerbit AdSense tidak valid. Contoh: ca-pub-1234567890123456.");
  const adsTxtExtra = text(formData, "ads_txt_extra");
  const enabled = formData.get("enabled") === "on";

  const { data: slots } = await supabase.from("ad_slots").select("slot_key, label");
  const updates = [];
  for (const { slot_key: key, label } of slots ?? []) {
    const kind = text(formData, `kind_${key}`);
    if (!["adsense", "code", "banner"].includes(kind)) back("error", `Jenis iklan "${label}" tidak valid.`);
    const unit = text(formData, `unit_${key}`);
    const code = text(formData, `code_${key}`);
    const image = text(formData, `image_${key}`);
    const link = text(formData, `link_${key}`);
    if (kind === "adsense" && unit && !UNIT_ID.test(unit)) back("error", `ID unit AdSense "${label}" harus berupa angka (6–20 digit).`);
    if (kind === "adsense" && unit && !publisherId) back("error", `Isi ID penerbit AdSense dulu untuk memakai AdSense di "${label}".`);
    if (code.length > 8000) back("error", `Kode iklan "${label}" terlalu panjang (maks 8000 karakter).`);
    if (kind === "banner" && ((image && !HTTPS_URL.test(image)) || (link && !HTTPS_URL.test(link)))) {
      back("error", `Gambar dan tautan banner "${label}" harus diawali https://.`);
    }
    const width = Number.parseInt(text(formData, `width_${key}`), 10);
    const height = Number.parseInt(text(formData, `height_${key}`), 10);
    updates.push(
      supabase
        .from("ad_slots")
        .update({
          enabled: formData.get(`enabled_${key}`) === "on",
          kind,
          unit_id: unit || null,
          code: code || null,
          banner_image_url: image || null,
          banner_link_url: link || null,
          width: Number.isFinite(width) ? Math.min(Math.max(width, 50), 2000) : 300,
          height: Number.isFinite(height) ? Math.min(Math.max(height, 30), 1500) : 250,
        })
        .eq("slot_key", key),
    );
  }

  const results = await Promise.all([
    supabase
      .from("ad_config")
      .update({ enabled, publisher_id: publisherId || null, ads_txt_extra: adsTxtExtra || null, anti_adblock: formData.get("anti_adblock") === "on", updated_at: new Date().toISOString() })
      .eq("id", true),
    ...updates,
  ]);
  const failed = results.find((result) => result.error);
  if (failed?.error) back("error", `Gagal menyimpan: ${failed.error.message}`);

  revalidatePath("/", "layout");
  revalidatePath("/ads.txt");
  back("ok", enabled ? "Pengaturan iklan disimpan dan iklan aktif." : "Pengaturan iklan disimpan (iklan belum aktif).");
}
