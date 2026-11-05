"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { randomSuffix, slugify } from "@/lib/articles";
import { fetchFeed } from "@/lib/rss";
import { createClient } from "@/lib/supabase/server";

const back = (kind: "ok" | "error", message: string) => redirect(`/admin/scrap?${kind}=${encodeURIComponent(message)}`);

/**
 * Pulls headline, summary, lead image and the original link from a source's RSS feed.
 * Results are stored as DRAFT with attribution; an admin decides what gets published.
 * The full article text is never copied.
 */
export async function runScrape(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const sourceId = String(formData.get("source_id") ?? "all");

  let query = supabase.from("scrape_sources").select("id, name, feed_url, category_id").eq("active", true);
  if (sourceId !== "all") query = query.eq("id", sourceId);
  const { data: sources } = await query;
  if (!sources?.length) back("error", "Tidak ada sumber aktif untuk di-scrap.");

  let added = 0;
  const failures: string[] = [];

  for (const source of sources!) {
    try {
      const items = await fetchFeed(source.feed_url);
      if (items.length) {
        const rows = items.map((item) => ({
          title: item.title,
          slug: `${slugify(item.title) || "berita"}-${randomSuffix()}`,
          excerpt: item.excerpt,
          body: "",
          cover_image_url: item.image,
          category_id: source.category_id,
          author_id: null,
          author_name: source.name,
          status: "draft",
          is_scraped: true,
          source_name: source.name,
          source_url: item.link,
          created_at: item.publishedAt ?? undefined,
        }));
        const { data: inserted, error } = await supabase
          .from("articles")
          .upsert(rows, { onConflict: "source_url", ignoreDuplicates: true })
          .select("id");
        if (error) throw new Error(error.message);
        added += inserted?.length ?? 0;
      }
      await supabase.from("scrape_sources").update({ last_scraped_at: new Date().toISOString() }).eq("id", source.id);
    } catch (error) {
      failures.push(`${source.name}: ${error instanceof Error ? error.message : "gagal"}`);
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/scrap");

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
