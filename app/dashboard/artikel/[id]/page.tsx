import { notFound } from "next/navigation";
import { ArticleForm } from "@/components/ArticleForm";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function EditArticlePage({ params, searchParams }: Props) {
  const profile = await requireRole(["writer", "admin"]);
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const [{ data: article }, { data: categories }] = await Promise.all([
    supabase
      .from("articles")
      .select("id, title, excerpt, body, category_id, cover_image_url, status, is_scraped, ai_generated, source_name, source_url, article_tags(tag:tags(name))")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("categories").select("id, name, slug").order("sort_order"),
  ]);
  if (!article) notFound();

  const isAdmin = profile.role === "admin";
  if (article.status === "published" && !isAdmin) {
    return (
      <section className="panel">
        <h1>{article.title}</h1>
        <p>Berita ini sudah terbit dan hanya bisa diubah oleh admin.</p>
      </section>
    );
  }

  const tags = (article.article_tags ?? [])
    .flatMap((row: { tag: { name: string } | { name: string }[] }) => (Array.isArray(row.tag) ? row.tag : [row.tag]))
    .map((tag: { name: string }) => tag.name)
    .join(", ");

  return (
    <section>
      <div className="panel-head"><h1>Edit berita</h1></div>
      <ArticleForm
        article={{ ...article, tags }}
        categories={categories ?? []}
        error={error}
        isAdmin={isAdmin}
      />
    </section>
  );
}
