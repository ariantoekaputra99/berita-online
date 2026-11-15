"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { HTTPS_URL, PUBLISHER_ID } from "@/lib/ads";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const back = (kind: "ok" | "error", message: string, anchor = "") =>
  redirect(`/admin/iklan?${kind}=${encodeURIComponent(message)}${anchor ? `#${anchor}` : ""}`);
const text = (formData: FormData, name: string) => String(formData.get(name) ?? "").trim();
const size = (value: string, min: number, max: number, fallback: number) => {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? Math.min(Math.max(n, min), max) : fallback;
};

function refresh() {
  revalidatePath("/", "layout");
  revalidatePath("/ads.txt");
}

/** Master switch, AdSense publisher id, anti-adblock notice and extra ads.txt lines. */
export async function saveAdConfig(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const publisherId = text(formData, "publisher_id");
  if (publisherId && !PUBLISHER_ID.test(publisherId)) back("error", "ID penerbit AdSense tidak valid. Contoh: ca-pub-1234567890123456.");
  const { error } = await supabase
    .from("ad_config")
    .update({
      enabled: formData.get("enabled") === "on",
      anti_adblock: formData.get("anti_adblock") === "on",
      publisher_id: publisherId || null,
      ads_txt_extra: text(formData, "ads_txt_extra").slice(0, 4000) || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", true);
  if (error) back("error", `Gagal menyimpan: ${error.message}`);
  refresh();
  back("ok", "Pengaturan umum iklan disimpan.");
}

/** One ad position: on/off, banner (image + link) or ad code, for desktop and an optional phone version. */
export async function saveAdSlot(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const key = text(formData, "slot_key");
  const { data: row } = await supabase.from("ad_slots").select("slot_key, label").eq("slot_key", key).maybeSingle();
  if (!row) back("error", "Posisi iklan tidak ditemukan.");

  const kind = text(formData, "kind") === "code" ? "code" : "banner";
  const image = text(formData, "image");
  const mobileImage = text(formData, "mobile_image");
  const link = text(formData, "link");
  const code = text(formData, "code");
  const mobileCode = text(formData, "mobile_code");
  const label = row!.label;
  if ([image, mobileImage, link].some((url) => url && !HTTPS_URL.test(url))) back("error", `Gambar dan tautan "${label}" harus diawali https://.`, key);
  if (code.length > 8000 || mobileCode.length > 8000) back("error", `Kode iklan "${label}" terlalu panjang (maks 8000 karakter).`, key);

  const { error } = await supabase
    .from("ad_slots")
    .update({
      enabled: formData.get("enabled") === "on",
      kind,
      banner_image_url: image || null,
      mobile_banner_image_url: mobileImage || null,
      banner_link_url: link || null,
      code: code || null,
      mobile_code: mobileCode || null,
      width: size(text(formData, "width"), 50, 2000, 728),
      height: size(text(formData, "height"), 30, 1500, 90),
      mobile_width: size(text(formData, "mobile_width"), 50, 800, 320),
      mobile_height: size(text(formData, "mobile_height"), 30, 1500, 100),
    })
    .eq("slot_key", key);
  if (error) back("error", `Gagal menyimpan: ${error.message}`, key);
  refresh();
  back("ok", `"${label}" disimpan.`, key);
}
