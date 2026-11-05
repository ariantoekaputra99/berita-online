import type { SupabaseClient } from "@supabase/supabase-js";
import { randomSuffix, slugify } from "@/lib/articles";
import { fetchFeed } from "@/lib/rss";

export type ScrapeResult = { sources: number; added: number; failures: string[] };

/**
 * Pulls headline, summary, lead image and the original link from active RSS sources.
 * Results are stored as DRAFT with attribution; an admin decides what gets published.
 * The full article text is never copied. `supabase` must be signed in as an admin.
 */
export async function scrapeSources(supabase: SupabaseClient, sourceId = "all"): Promise<ScrapeResult> {
  let query = supabase.from("scrape_sources").select("id, name, feed_url, category_id").eq("active", true);
  if (sourceId !== "all") query = query.eq("id", sourceId);
  const { data: sources } = await query;

  let added = 0;
  const failures: string[] = [];

  for (const source of sources ?? []) {
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

  return { sources: sources?.length ?? 0, added, failures };
}
