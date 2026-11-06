import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { getCategories, getLatestArticles, timeAgo, type ArticleCardData } from "@/lib/articles";

export const revalidate = 60;

export default async function Home() {
  const categories = await getCategories();
  const [latest, ...perCategory] = await Promise.all([
    getLatestArticles(12),
    ...categories.map((category) => getLatestArticles(5, category.id)),
  ]);

  const [lead, ...rest] = latest;
  const secondary = rest.slice(0, 2);
  const shownIds = new Set([lead, ...secondary].filter(Boolean).map((article) => (article as ArticleCardData).id));

  const sections = categories
    .map((category, index) => ({
      category,
      articles: perCategory[index].filter((article) => !shownIds.has(article.id)).slice(0, 4),
    }))
    .filter((section) => section.articles.length > 0);

  return (
    <>
      <SiteHeader />

      <main className="page-shell" id="konten">
        {!lead ? (
          <p className="empty-state">Belum ada berita yang diterbitkan. Silakan kembali beberapa saat lagi.</p>
        ) : (
          <section aria-label="Berita utama" className="front">
            <div className="front-main">
              <ArticleCard article={lead} priority variant="lead" />
              {secondary.length > 0 && (
                <div className="front-pair">
                  {secondary.map((article) => (
                    <ArticleCard article={article} key={article.id} />
                  ))}
                </div>
              )}
            </div>

            <aside aria-labelledby="terbaru" className="rail">
              <h2 className="rail-title" id="terbaru">Terbaru</h2>
              <ol className="rail-list">
                {latest.slice(0, 8).map((article) => (
                  <li key={article.id}>
                    <p className="rail-meta">
                      {article.category?.name && <span className="kicker">{article.category.name}</span>}
                      <time dateTime={article.published_at ?? undefined}>{timeAgo(article.published_at)}</time>
                    </p>
                    <Link href={`/berita/${article.slug}`}>{article.title}</Link>
                  </li>
                ))}
              </ol>
            </aside>
          </section>
        )}

        {sections.map(({ category, articles }) => (
          <section aria-labelledby={`rubrik-${category.slug}`} className="block" key={category.id}>
            <div className="block-head">
              <h2 id={`rubrik-${category.slug}`}>{category.name}</h2>
              <Link href={`/kategori/${category.slug}`}>Lihat semua</Link>
            </div>
            <div className="story-grid story-grid-4">
              {articles.map((article) => (
                <ArticleCard article={article} key={article.id} />
              ))}
            </div>
          </section>
        ))}
      </main>

      <SiteFooter />
    </>
  );
}
