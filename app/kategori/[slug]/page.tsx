import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleList } from "@/components/ArticleList";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { getCategories, getLatestArticles } from "@/lib/articles";

export const revalidate = 60;

export async function generateStaticParams() {
  return (await getCategories()).map((category) => ({ slug: category.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = (await getCategories()).find((item) => item.slug === slug);
  if (!category) return {};
  return {
    title: `Berita ${category.name}`,
    description: `Kumpulan berita ${category.name} terbaru dari Noncof Media.`,
    alternates: { canonical: `/kategori/${slug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = (await getCategories()).find((item) => item.slug === slug);
  if (!category) notFound();

  const articles = await getLatestArticles(30, category.id);

  return (
    <>
      <SiteHeader />
      <main id="konten" className="page-shell listing-page">
        <p className="kicker">Rubrik</p>
        <h1 className="listing-title">{category.name}</h1>
        <ArticleList articles={articles} empty={`Belum ada berita di rubrik ${category.name}.`} />
      </main>
      <SiteFooter />
    </>
  );
}
