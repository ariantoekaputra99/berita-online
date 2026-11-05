import { ArticleForm } from "@/components/ArticleForm";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function NewArticlePage({ searchParams }: Props) {
  const profile = await requireRole(["writer", "admin"]);
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("id, name, slug").order("sort_order");

  return (
    <section>
      <div className="panel-head"><h1>Tulis berita</h1></div>
      <ArticleForm categories={categories ?? []} error={error} isAdmin={profile.role === "admin"} />
    </section>
  );
}
