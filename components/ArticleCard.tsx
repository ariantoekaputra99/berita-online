import Link from "next/link";
import { ArticleImage } from "@/components/ArticleImage";
import { timeAgo, type ArticleCardData } from "@/lib/articles";

type Variant = "lead" | "card" | "row";

/** One story teaser. `lead` is the big front-page story, `card` a standard teaser, `row` a small thumbnail row. */
export function ArticleCard({ article, variant = "card", priority }: { article: ArticleCardData; variant?: Variant; priority?: boolean }) {
  const href = `/berita/${article.slug}`;
  const sizes =
    variant === "lead" ? "(max-width: 1024px) 100vw, 780px" : variant === "row" ? "120px" : "(max-width: 720px) 100vw, 380px";

  return (
    <article className={`story story-${variant}`}>
      <Link aria-label={`Baca: ${article.title}`} className="story-media" href={href} tabIndex={-1}>
        <ArticleImage alt="" priority={priority} sizes={sizes} src={article.cover_image_url} />
      </Link>
      <div className="story-body">
        <p className="story-meta">
          {article.category && (
            <Link className="kicker" href={`/kategori/${article.category.slug}`}>
              {article.category.name}
            </Link>
          )}
          <time dateTime={article.published_at ?? undefined}>{timeAgo(article.published_at)}</time>
        </p>
        <h3 className="story-title">
          <Link href={href}>{article.title}</Link>
        </h3>
        {variant !== "row" && <p className="story-excerpt">{article.excerpt}</p>}
        {variant !== "row" && article.is_scraped && article.source_name && <p className="story-source">Sumber: {article.source_name}</p>}
      </div>
    </article>
  );
}
