"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { scrapeSources } from "@/lib/scrape";
import { createClient } from "@/lib/supabase/server";

const back = (kind: "ok" | "error", message: string) => redirect(`/admin/scrap?${kind}=${encodeURIComponent(message)}`);

export async function runScrape(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const result = await scrapeSources(supabase, String(formData.get("source_id") ?? "all"));

  if (!result.sources) back("error", "Tidak ada sumber aktif untuk di-scrap.");

  revalidatePath("/admin");
  revalidatePath("/admin/scrap");

  const { added, failures } = result;
  if (failures.length && !added) back("error", `Scrap gagal. ${failures.join("; ")}`);
  const note = failures.length ? ` (sebagian gagal: ${failures.join("; ")})` : "";
  back("ok", `${added} berita baru masuk sebagai draft${note}.`);
}

function validFeedUrl(raw: string): string | null {
  try {
    const url = new URL(raw);
    const host = url.hostname;
    const isIp = /^[\d.]+$/.test(host) || host.includes(":");
    if (url.protocol !== "https:" || !host.includes(".") || isIp || host.endsWith(".local") || host.endsWith(".internal")) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

export async function addSource(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const name = String(formData.get("name") ?? "").trim();
  const feedUrl = validFeedUrl(String(formData.get("feed_url") ?? "").trim());
  const categoryId = String(formData.get("category_id") ?? "") || null;

  if (name.length < 2) back("error", "Nama sumber wajib diisi.");
  if (!feedUrl) back("error", "URL feed harus berupa alamat https:// yang valid.");

  const { error } = await supabase.from("scrape_sources").insert({ name, feed_url: feedUrl, category_id: categoryId });
  if (error) back("error", "Sumber gagal ditambahkan (mungkin URL sudah ada).");

  revalidatePath("/admin/scrap");
  back("ok", "Sumber ditambahkan.");
}

export async function toggleSource(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "true";
  await supabase.from("scrape_sources").update({ active: !active }).eq("id", id);
  revalidatePath("/admin/scrap");
}

export async function deleteSource(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await createClient();
  await supabase.from("scrape_sources").delete().eq("id", String(formData.get("id") ?? ""));
  revalidatePath("/admin/scrap");
}
