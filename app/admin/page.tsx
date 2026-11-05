import { deleteArticle, setArticleStatus } from "@/app/actions/articles";
import { StatusBadge } from "@/components/StaffShell";
import { timeAgo } from "@/lib/articles";
import { createClient } from "@/lib/supabase/server";

type Props = { searchParams: Promise<{ status?: string; ok?: string }> };

const FILTERS: [value: string, label: string][] = [
  ["pending", "Menunggu review"],
  ["draft", "Draft"],
  ["published", "Terbit"],
  ["rejected", "Ditolak"],
  ["all", "Semua"],
];

export default async function AdminArticlesPage({ searchParams }: Props) {
  const { status = "pending", ok } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("articles")
    .select("id, title, status, author_name, is_scraped, source_name, updated_at, category:categories(name)")
    .order("updated_at", { ascending: false })
    .limit(100);
  if (status !== "all") query = query.eq("status", status);
  const { data: articles } = await query;

  const countOf = async (value: string) => {
    const { count } = await supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", value);
    return count ?? 0;
  };
  const counts = await Promise.all(FILTERS.filter(([v]) => v !== "all").map(([v]) => countOf(v)));

  return (
    <section>
      <div className="panel-head">
        <h1>Kelola berita</h1>
        <div className="panel-actions">
          <a className="btn btn-ghost" href="/admin/pengguna">Kelola pengguna</a>
          <a className="btn btn-ghost" href="/admin/scrap">Scrap berita</a>
          <a className="btn" href="/dashboard/baru">+ Tulis berita</a>
        </div>
      </div>
      {ok && <p className="notice notice-ok">{ok}</p>}

      <nav aria-label="Filter status" className="filters">
        {FILTERS.map(([value, label], index) => (
          <a aria-current={status === value ? "page" : undefined} href={`/admin?status=${value}`} key={value}>
            {label}
            {value !== "all" && <span className="count">{counts[index]}</span>}
          </a>
        ))}
      </nav>

      {!articles?.length ? (
        <p className="empty-state">Tidak ada berita dengan status ini.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Judul</th><th>Penulis / sumber</th><th>Status</th><th>Diubah</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id}>
                  <td data-label="Judul">
                    <strong>{article.title}</strong>
                    {article.is_scraped && <small className="scrape-tag">hasil scrap</small>}
                  </td>
                  <td data-label="Penulis">{article.author_name}</td>
                  <td data-label="Status"><StatusBadge status={article.status} /></td>
                  <td data-label="Diubah">{timeAgo(article.updated_at)}</td>
                  <td className="row-actions">
                    <a href={`/dashboard/artikel/${article.id}`}>Edit</a>
                    {article.status !== "published" && (
                      <form action={setArticleStatus}>
                        <input name="id" type="hidden" value={article.id} />
                        <input name="status" type="hidden" value="published" />
                        <button className="link-ok" type="submit">Terbitkan</button>
                      </form>
                    )}
                    {article.status === "published" && (
                      <form action={setArticleStatus}>
                        <input name="id" type="hidden" value={article.id} />
                        <input name="status" type="hidden" value="draft" />
                        <button type="submit">Tarik ke draft</button>
                      </form>
                    )}
                    {(article.status === "pending" || article.status === "draft") && (
                      <form action={setArticleStatus}>
                        <input name="id" type="hidden" value={article.id} />
                        <input name="status" type="hidden" value="rejected" />
                        <button type="submit">Tolak</button>
                      </form>
                    )}
                    <form action={deleteArticle}>
                      <input name="id" type="hidden" value={article.id} />
                      <button className="link-danger" type="submit">Hapus</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
