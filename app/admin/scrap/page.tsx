import { addSource, deleteSource, runScrape, toggleSource } from "@/app/actions/scrape";
import { timeAgo } from "@/lib/articles";
import { createClient } from "@/lib/supabase/server";

type Props = { searchParams: Promise<{ ok?: string; error?: string }> };

export default async function ScrapePage({ searchParams }: Props) {
  const { ok, error } = await searchParams;
  const supabase = await createClient();
  const [{ data: sources }, { data: categories }] = await Promise.all([
    supabase
      .from("scrape_sources")
      .select("id, name, feed_url, active, last_scraped_at, category:categories(name)")
      .order("name"),
    supabase.from("categories").select("id, name").order("sort_order"),
  ]);

  return (
    <section>
      <div className="panel-head">
        <h1>Scrap berita</h1>
        <form action={runScrape}>
          <input name="source_id" type="hidden" value="all" />
          <button className="btn" type="submit">Scrap semua sumber aktif</button>
        </form>
      </div>
      {ok && <p className="notice notice-ok">{ok}</p>}
      {error && <p className="notice notice-error" role="alert">{error}</p>}

      <p className="notice">
        Scrap mengambil <strong>judul, ringkasan, gambar utama, dan tautan asli</strong> dari feed RSS sumber, lalu menyimpannya
        sebagai <strong>draft</strong>. Isi artikel lengkap tidak disalin; halaman berita menampilkan atribusi dan tombol menuju
        sumber. Tinjau di <a href="/admin?status=draft">Kelola berita</a> sebelum menerbitkan. Scrap otomatis semua sumber aktif berjalan setiap hari pukul 05.00 WIB.
      </p>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>Sumber</th><th>Kategori bawaan</th><th>Terakhir scrap</th><th>Status</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {(sources ?? []).map((source) => {
              const category = Array.isArray(source.category) ? source.category[0] : source.category;
              return (
                <tr key={source.id}>
                  <td data-label="Sumber">
                    <strong>{source.name}</strong>
                    <small className="muted block">{source.feed_url}</small>
                  </td>
                  <td data-label="Kategori">{category?.name ?? "-"}</td>
                  <td data-label="Terakhir">{source.last_scraped_at ? timeAgo(source.last_scraped_at) : "Belum pernah"}</td>
                  <td data-label="Status">{source.active ? "Aktif" : "Nonaktif"}</td>
                  <td className="row-actions">
                    <form action={runScrape}>
                      <input name="source_id" type="hidden" value={source.id} />
                      <button className="link-ok" disabled={!source.active} type="submit">Scrap</button>
                    </form>
                    <form action={toggleSource}>
                      <input name="id" type="hidden" value={source.id} />
                      <input name="active" type="hidden" value={String(source.active)} />
                      <button type="submit">{source.active ? "Nonaktifkan" : "Aktifkan"}</button>
                    </form>
                    <form action={deleteSource}>
                      <input name="id" type="hidden" value={source.id} />
                      <button className="link-danger" type="submit">Hapus</button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <form action={addSource} className="form-card">
        <h2>Tambah sumber</h2>
        <p className="muted">Gunakan feed RSS resmi dari media tepercaya. Periksa syarat penggunaan feed sumber sebelum menambahkannya.</p>
        <div className="field-row">
          <label className="field">
            <span>Nama sumber</span>
            <input name="name" placeholder="mis. ANTARA News - Ekonomi" required />
          </label>
          <label className="field">
            <span>Kategori bawaan</span>
            <select name="category_id">
              <option value="">Tanpa kategori</option>
              {(categories ?? []).map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="field">
          <span>URL feed RSS (https)</span>
          <input name="feed_url" placeholder="https://contoh.com/rss.xml" required type="url" />
        </label>
        <div className="form-actions">
          <button className="btn" type="submit">Tambah sumber</button>
        </div>
      </form>
    </section>
  );
}
