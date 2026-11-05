import Link from "next/link";
import { deleteArticle, setArticleStatus } from "@/app/actions/articles";
import { SubmitButton } from "@/components/SubmitButton";
import { generateBriefs } from "@/app/actions/brief";
import { StatusBadge } from "@/components/StaffShell";
import { timeAgo } from "@/lib/articles";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

type Props = { searchParams: Promise<{ status?: string; ok?: string; error?: string }> };

const FILTERS: [value: string, label: string][] = [
  ["pending", "Menunggu review"],
  ["draft", "Draft"],
  ["published", "Terbit"],
  ["rejected", "Ditolak"],
  ["all", "Semua"],
];

export default async function AdminArticlesPage({ searchParams }: Props) {
  const { status = "pending", ok, error } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("articles")
    .select("id, title, status, author_name, is_scraped, ai_generated, source_name, updated_at, has_body:body, category:categories(name)")
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
          <Link className="btn btn-ghost" href="/admin/pengguna">Kelola pengguna</Link>
          <Link className="btn btn-ghost" href="/admin/scrap">Scrap berita</Link>
          <Link className="btn" href="/dashboard/baru">+ Tulis berita</Link>
        </div>
      </div>
      {ok && <p className="notice notice-ok">{ok}</p>}
      {error && <p className="notice notice-error" role="alert">{error}</p>}

      {status === "draft" && (
        <form action={generateBriefs} className="bulk-bar">
          <p>Buat brief otomatis (AI) untuk 10 draf scrap terbaru yang belum punya isi. Hasilnya tetap draf; kamu cek lalu klik Terbitkan.</p>
          <SubmitButton pendingText="Menulis brief…" confirm="Buat brief otomatis untuk 10 draf scrap terbaru? Ini memakai kuota API AI." className="btn btn-ghost">Buat brief otomatis</SubmitButton>
        </form>
      )}

      <nav aria-label="Filter status" className="filters">
        {FILTERS.map(([value, label], index) => (
          <Link aria-current={status === value ? "page" : undefined} href={`/admin?status=${value}`} key={value}>
            {label}
            {value !== "all" && <span className="count">{counts[index]}</span>}
          </Link>
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
                    {article.is_scraped && !article.ai_generated && <small className="scrape-tag">hasil scrap</small>}
                    {article.ai_generated && <small className="scrape-tag ai-tag">brief AI</small>}
                  </td>
                  <td data-label="Penulis">{article.author_name}</td>
                  <td data-label="Status"><StatusBadge status={article.status} /></td>
                  <td data-label="Diubah">{timeAgo(article.updated_at)}</td>
                  <td className="row-actions">
                    {article.is_scraped && !article.has_body ? (
                      <Link className="link-ok" href={`/dashboard/artikel/${article.id}`}>Tulis ulang</Link>
                    ) : (
                      <Link href={`/dashboard/artikel/${article.id}`}>Edit</Link>
                    )}
                    {article.is_scraped && (!article.has_body || article.ai_generated) && article.status === "draft" && (
                      <form action={generateBriefs}>
                        <input name="id" type="hidden" value={article.id} />
                        <SubmitButton pendingText="Menulis…" confirm="Buat brief otomatis untuk berita ini? Isi lama (jika ada) akan diganti.">{article.ai_generated ? "Ulangi brief" : "Brief otomatis"}</SubmitButton>
                      </form>
                    )}
                    {article.status !== "published" && (
                      <form action={setArticleStatus}>
                        <input name="id" type="hidden" value={article.id} />
                        <input name="status" type="hidden" value="published" />
                        <SubmitButton pendingText="Menerbitkan…" confirm="Terbitkan berita ini ke publik?" className="link-ok">Terbitkan</SubmitButton>
                      </form>
                    )}
                    {article.status === "published" && (
                      <form action={setArticleStatus}>
                        <input name="id" type="hidden" value={article.id} />
                        <input name="status" type="hidden" value="draft" />
                        <SubmitButton pendingText="Memproses…" confirm="Tarik berita ini kembali ke draft? Berita tidak lagi tampil di situs.">Tarik ke draft</SubmitButton>
                      </form>
                    )}
                    {(article.status === "pending" || article.status === "draft") && (
                      <form action={setArticleStatus}>
                        <input name="id" type="hidden" value={article.id} />
                        <input name="status" type="hidden" value="rejected" />
                        <SubmitButton pendingText="Memproses…" confirm="Tolak berita ini dan kembalikan ke penulis?">Tolak</SubmitButton>
                      </form>
                    )}
                    <form action={deleteArticle}>
                      <input name="id" type="hidden" value={article.id} />
                      <SubmitButton pendingText="Menghapus…" confirm="Hapus berita ini secara permanen? Tindakan ini tidak bisa dibatalkan." className="link-danger">Hapus</SubmitButton>
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
