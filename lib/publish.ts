import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Drafts that were rewritten by AI and have a body: the ones "Terbitkan semua" publishes. */
export async function countReadyAiDrafts(supabase: SupabaseClient): Promise<number> {
  const { count } = await supabase
    .from("articles")
    .select("id", { count: "exact", head: true })
    .eq("status", "draft")
    .eq("ai_generated", true)
    .neq("body", "");
  return count ?? 0;
}

export function refreshPublicPages(slug?: string) {
  revalidatePath("/");
  revalidatePath("/kategori/[slug]", "page");
  revalidatePath("/tag/[slug]", "page");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/berita/${slug}`);
  revalidatePath("/admin");
}

/**
 * Publishes every AI-rewritten draft. The oldest gets the earliest timestamp so the
 * homepage keeps the original order. `supabase` must be signed in as an admin.
 */
export async function publishAllAiDrafts(supabase: SupabaseClient): Promise<{ published: number; failed: number; error?: string }> {
  const { data: drafts, error } = await supabase
    .from("articles")
    .select("id, published_at")
    .eq("status", "draft")
    .eq("ai_generated", true)
    .neq("body", "")
    .order("created_at", { ascending: true });
  if (error) return { published: 0, failed: 0, error: error.message };
  if (!drafts?.length) return { published: 0, failed: 0 };

  const base = Date.now() - drafts.length * 1000;
  let published = 0;
  for (let start = 0; start < drafts.length; start += 20) {
    const results = await Promise.all(
      drafts.slice(start, start + 20).map((draft, offset) =>
        supabase
          .from("articles")
          .update({ status: "published", published_at: draft.published_at ?? new Date(base + (start + offset) * 1000).toISOString() })
          .eq("id", draft.id)
          .eq("status", "draft"),
      ),
    );
    published += results.filter((result) => !result.error).length;
  }
  refreshPublicPages();
  return { published, failed: drafts.length - published };
}
