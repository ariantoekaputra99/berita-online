import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleImage } from "@/components/ArticleImage";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { formatDate, getArticleBySlug } from "@/lib/articles";
import { renderBody } from "@/lib/markdown";
import { createPublicClient } from "@/lib/supabase/public";

export const revalidate = 60;

// Pre-build the newest articles; any other slug is rendered on first visit and then cached (ISR).
export async function generateStaticParams() {
  const { data } = await createPublicClient().from("articles").select("slug").eq("status", "published").order("published_at", { ascending: false }).limit(30);
  return (data ?? []).map((row) => ({ slug: row.slug as string }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/berita/${slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      publishedTime: article.published_at ?? undefined,
      images: article.cover_image_url ? [article.cover_image_url] : undefined,
    },
    twitter: { card: "summary_large_image", title: article.title, description: article.excerpt },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const hasBody = article.body.trim().length > 0;
  const summaryOnly = article.is_scraped && !hasBody;

  return (
    <>
      <SiteHeader />
      <main id="konten" className="page-shell article-page">
        <article>
          <header className="article-header">
            {article.category && (
              <Link className="eyebrow" href={`/kategori/${article.category.slug}`}>{article.category.name.toUpperCase()}</Link>
            )}
            <h1>{article.title}</h1>
            <p className="article-lede">{article.excerpt}</p>
            <p className="article-byline">
              {summaryOnly ? `Sumber: ${article.source_name}` : `Oleh ${article.author_name}`} · {formatDate(article.published_at)}
            </p>
          </header>

          {article.cover_image_url && (
            <div className="article-cover">
              <ArticleImage alt={article.title} priority sizes="(max-width: 900px) 100vw, 900px" src={article.cover_image_url} />
              {article.is_scraped && article.source_name && !article.cover_image_url.includes("/storage/v1/object/public/article-images/") && (
                <p className="photo-credit">Foto: {article.source_name}</p>
              )}
            </div>
          )}

          {summaryOnly ? (
            <div className="article-body">
              <p className="source-box">
                Ringkasan ini bersumber dari <strong>{article.source_name}</strong>. Baca berita lengkap di situs aslinya.
              </p>
              {article.source_url && (
                <a className="btn" href={article.source_url} rel="noopener noreferrer nofollow" target="_blank">
                  Baca selengkapnya di {article.source_name} ↗
                </a>
              )}
            </div>
          ) : (
            <div className="article-body">
              {renderBody(article.body)}
              {article.is_scraped && article.source_url && (
                <p className="source-box">
                  Sumber:{" "}
                  <a href={article.source_url} rel="noopener noreferrer" target="_blank">{article.source_name}</a>
                </p>
              )}
            </div>
          )}

          {article.tags.length > 0 && (
            <ul className="tag-list" aria-label="Tag">
              {article.tags.map((tag) => (
                <li key={tag.slug}><Link href={`/tag/${tag.slug}`}>#{tag.name}</Link></li>
              ))}
            </ul>
          )}
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
