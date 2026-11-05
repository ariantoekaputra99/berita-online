import { deleteArticle } from "@/app/actions/articles";
import { StatusBadge } from "@/components/StaffShell";
import { requireRole, getCurrentProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import { timeAgo } from "@/lib/articles";
import { createClient } from "@/lib/supabase/server";

type Props = { searchParams: Promise<{ ok?: string }> };

export default async function DashboardPage({ searchParams }: Props) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  const { ok } = await searchParams;

  if (profile.role === "reader") {
    return (
      <section className="panel">
        <h1>Halo, {profile.full_name || "pembaca"}</h1>
        <p>
          Akunmu sudah terdaftar, tetapi belum memiliki akses menulis. Minta admin redaksi untuk mengubah perananmu
          menjadi penulis, lalu muat ulang halaman ini.
        </p>
      </section>
    );
  }

  await requireRole(["writer", "admin"]);
  const supabase = await createClient();
  const { data: articles } = await supabase
    .from("articles")
    .select("id, title, status, updated_at, category:categories(name)")
    .eq("author_id", profile.id)
    .order("updated_at", { ascending: false });

  return (
    <section>
      <div className="panel-head">
        <h1>Berita saya</h1>
        <a className="btn" href="/dashboard/baru">+ Tulis berita</a>
      </div>
      {ok && <p className="notice notice-ok">{ok}</p>}

      {!articles?.length ? (
        <p className="empty-state">Kamu belum menulis berita. Mulai dari tombol “Tulis berita”.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Judul</th><th>Status</th><th>Diubah</th><th /></tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id}>
                  <td data-label="Judul">{article.title}</td>
                  <td data-label="Status"><StatusBadge status={article.status} /></td>
                  <td data-label="Diubah">{timeAgo(article.updated_at)}</td>
                  <td className="row-actions">
                    {article.status !== "published" && <a href={`/dashboard/artikel/${article.id}`}>Edit</a>}
                    {article.status === "published" && <span className="muted">Terkunci</span>}
                    {(article.status === "draft" || article.status === "rejected") && (
                      <form action={deleteArticle}>
                        <input name="id" type="hidden" value={article.id} />
                        <button className="link-danger" type="submit">Hapus</button>
                      </form>
                    )}
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
