import { createPublicClient } from "@/lib/supabase/public";

export type Category = { id: string; name: string; slug: string };
export type Tag = { id: string; name: string; slug: string };

export type ArticleStatus = "draft" | "pending" | "published" | "rejected";

export type ArticleCardData = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image_url: string | null;
  author_name: string;
  published_at: string | null;
  is_scraped: boolean;
  source_name: string | null;
  category: { name: string; slug: string } | null;
};

const CARD_FIELDS =
  "id, title, slug, excerpt, cover_image_url, author_name, published_at, is_scraped, source_name, category:categories(name, slug)";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 8);
}

export function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(1, Math.round(diff / 60000));
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

type RawCard = Omit<ArticleCardData, "category"> & {
  category: { name: string; slug: string } | { name: string; slug: string }[] | null;
};

function normalize(rows: RawCard[] | null): ArticleCardData[] {
  return (rows ?? []).map((row) => ({
    ...row,
    category: Array.isArray(row.category) ? (row.category[0] ?? null) : row.category,
  }));
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await createPublicClient()
    .from("categories")
    .select("id, name, slug")
    .order("sort_order");
  return data ?? [];
}

export async function getLatestArticles(limit = 12, categoryId?: string): Promise<ArticleCardData[]> {
  let query = createPublicClient()
    .from("articles")
    .select(CARD_FIELDS)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);
  if (categoryId) query = query.eq("category_id", categoryId);
  const { data } = await query;
  return normalize(data as RawCard[] | null);
}

export async function getArticlesByTag(tagId: string, limit = 30): Promise<ArticleCardData[]> {
  const { data } = await createPublicClient()
    .from("article_tags")
    .select(`article:articles!inner(${CARD_FIELDS})`)
    .eq("tag_id", tagId)
    .eq("article.status", "published")
    .limit(limit);
  const rows = (data ?? []).flatMap((row) => (Array.isArray(row.article) ? row.article : [row.article]));
  return normalize(rows as RawCard[]);
}

export async function getArticleBySlug(slug: string) {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("articles")
    .select(`${CARD_FIELDS}, body, source_url, article_tags(tag:tags(name, slug))`)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (!data) return null;

  const [card] = normalize([data as unknown as RawCard]);
  const tags = ((data as { article_tags?: { tag: { name: string; slug: string } | { name: string; slug: string }[] }[] }).article_tags ?? [])
    .flatMap((row) => (Array.isArray(row.tag) ? row.tag : [row.tag]))
    .filter(Boolean);

  return {
    ...card,
    body: (data as { body: string }).body,
    source_url: (data as { source_url: string | null }).source_url,
    tags,
  };
}
