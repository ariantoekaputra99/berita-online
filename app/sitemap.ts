import type { MetadataRoute } from "next";
import { createPublicClient } from "@/lib/supabase/public";

export const revalidate = 3600;

const siteUrl = "https://noncofmedia.my.id";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicClient();
  const [{ data: articles }, { data: categories }] = await Promise.all([
    supabase.from("articles").select("slug, updated_at").eq("status", "published").order("published_at", { ascending: false }).limit(1000),
    supabase.from("categories").select("slug"),
  ]);

  return [
    { url: siteUrl, changeFrequency: "hourly", priority: 1 },
    ...(categories ?? []).map((c) => ({ url: `${siteUrl}/kategori/${c.slug}`, changeFrequency: "hourly" as const, priority: 0.7 })),
    ...(articles ?? []).map((a) => ({ url: `${siteUrl}/berita/${a.slug}`, lastModified: a.updated_at, priority: 0.8 })),
  ];
}
