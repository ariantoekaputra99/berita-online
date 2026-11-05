import { saveArticle } from "@/app/actions/articles";
import type { Category } from "@/lib/articles";

type Props = {
  categories: Category[];
  isAdmin: boolean;
  error?: string;
  article?: {
    id: string;
    title: string;
    excerpt: string;
    body: string;
    category_id: string | null;
    cover_image_url: string | null;
    tags: string;
    status: string;
    is_scraped: boolean;
    source_name: string | null;
    source_url: string | null;
  };
};

export function ArticleForm({ categories, isAdmin, error, article }: Props) {
  return (
    <form action={saveArticle} className="form-card" encType="multipart/form-data">
      {error && <p className="notice notice-error" role="alert">{error}</p>}
      {article?.status === "rejected" && (
        <p className="notice notice-error">Berita ini ditolak admin. Perbaiki lalu kirim ulang.</p>
      )}
      {article?.is_scraped && (
        <p className="notice">
          Berita ini hasil scrap dari <strong>{article.source_name}</strong>. Hanya judul, ringkasan, dan gambar utama yang
          disalin; pembaca diarahkan ke sumber asli.{" "}
          {article.source_url && <a className="text-link" href={article.source_url} rel="noopener noreferrer" target="_blank">Buka sumber ↗</a>}
        </p>
      )}

      {article && <input name="id" type="hidden" value={article.id} />}
      {article && <input name="current_cover" type="hidden" value={article.cover_image_url ?? ""} />}

      <label className="field">
        <span>Judul</span>
        <input defaultValue={article?.title} maxLength={200} minLength={5} name="title" placeholder="Judul berita" required />
      </label>

      <label className="field">
        <span>Ringkasan <small>(tampil di kartu berita dan hasil pencarian)</small></span>
        <textarea defaultValue={article?.excerpt} maxLength={400} name="excerpt" rows={3} placeholder="Satu atau dua kalimat yang merangkum berita." />
      </label>

      <label className="field">
        <span>Isi berita <small>(pisahkan paragraf dengan baris kosong)</small></span>
        <textarea defaultValue={article?.body} name="body" rows={14} placeholder="Tulis isi berita di sini…" />
      </label>

      <div className="field-row">
        <label className="field">
          <span>Kategori</span>
          <select defaultValue={article?.category_id ?? ""} name="category_id">
            <option value="">Tanpa kategori</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Tag <small>(pisahkan dengan koma, maks. 8)</small></span>
          <input defaultValue={article?.tags} name="tags" placeholder="ekonomi, umkm, digital" />
        </label>
      </div>

      <div className="field">
        <span>Gambar utama <small>(JPG, PNG, atau WebP, maks. 5 MB)</small></span>
        {article?.cover_image_url && (
          <div className="cover-preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="Gambar utama saat ini" referrerPolicy="no-referrer" src={article.cover_image_url} />
            <label className="check">
              <input name="remove_cover" type="checkbox" /> Hapus gambar ini
            </label>
          </div>
        )}
        <input accept="image/jpeg,image/png,image/webp" name="cover" type="file" />
      </div>

      <div className="form-actions">
        <button className="btn btn-ghost" name="intent" type="submit" value="draft">Simpan draft</button>
        {isAdmin ? (
          <button className="btn" name="intent" type="submit" value="publish">Terbitkan</button>
        ) : (
          <button className="btn" name="intent" type="submit" value="submit">Kirim untuk ditinjau</button>
        )}
      </div>
    </form>
  );
}
