import { ArticleImage } from "@/components/ArticleImage";
import { timeAgo, type ArticleCardData } from "@/lib/articles";

export function ArticleList({ articles, empty }: { articles: ArticleCardData[]; empty: string }) {
  if (!articles.length) return <p className="empty-state">{empty}</p>;

  return (
    <div className="list-grid">
      {articles.map((article) => (
        <article className="list-card" key={article.id}>
          <a className="card-image" href={`/berita/${article.slug}`} aria-label={`Baca: ${article.title}`}>
            <ArticleImage alt={article.title} sizes="(max-width: 760px) 100vw, 33vw" src={article.cover_image_url} />
          </a>
          <div className="card-meta">
            <span>{(article.category?.name ?? "BERITA").toUpperCase()}</span>
            <time>{timeAgo(article.published_at)}</time>
          </div>
          <h3><a href={`/berita/${article.slug}`}>{article.title}</a></h3>
          <p className="category-description">{article.excerpt}</p>
          {article.is_scraped && <p className="source-note">Sumber: {article.source_name}</p>}
        </article>
      ))}
    </div>
  );
}
