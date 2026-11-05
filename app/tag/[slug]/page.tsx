import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleList } from "@/components/ArticleList";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { getArticlesByTag } from "@/lib/articles";
import { createPublicClient } from "@/lib/supabase/public";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

async function getTag(slug: string) {
  const { data } = await createPublicClient().from("tags").select("id, name, slug").eq("slug", slug).maybeSingle();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTag(slug);
  if (!tag) return {};
  return {
    title: `Tag: ${tag.name}`,
    description: `Berita bertag ${tag.name} di Noncof Media.`,
    alternates: { canonical: `/tag/${slug}` },
  };
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params;
  const tag = await getTag(slug);
  if (!tag) notFound();

  const articles = await getArticlesByTag(tag.id);

  return (
    <>
      <SiteHeader />
      <main id="konten" className="page-shell listing-page">
        <p className="eyebrow">TAG</p>
        <h1 className="listing-title">#{tag.name}</h1>
        <ArticleList articles={articles} empty={`Belum ada berita dengan tag ${tag.name}.`} />
      </main>
      <SiteFooter />
    </>
  );
}
