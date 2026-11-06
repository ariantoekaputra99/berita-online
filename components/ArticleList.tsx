import { ArticleCard } from "@/components/ArticleCard";
import type { ArticleCardData } from "@/lib/articles";

export function ArticleList({ articles, empty }: { articles: ArticleCardData[]; empty: string }) {
  if (!articles.length) return <p className="empty-state">{empty}</p>;

  return (
    <div className="story-grid">
      {articles.map((article) => (
        <ArticleCard article={article} key={article.id} />
      ))}
    </div>
  );
}
