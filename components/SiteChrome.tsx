import { formatDate } from "@/lib/articles";

export const navItems: [label: string, slug: string][] = [
  ["Nasional", "nasional"],
  ["Ekonomi", "ekonomi"],
  ["Teknologi", "teknologi"],
  ["Gaya Hidup", "gaya-hidup"],
  ["Opini", "opini"],
];

export function SiteHeader() {
  return (
    <>
      <a className="skip-link" href="#konten">
        Langsung ke konten
      </a>

      <div className="topline">
        <div className="page-shell topline-inner">
          <p>{formatDate(new Date().toISOString())}</p>
          <p className="topline-note">
            Membaca Indonesia, memahami dunia <span aria-hidden="true">✳</span>
          </p>
          <a href="/login">Masuk <span aria-hidden="true">↗</span></a>
        </div>
      </div>

      <header className="site-header">
        <div className="page-shell header-main">
          <a aria-label="Noncof Media, halaman utama" className="brand" href="/">
            <span className="brand-mark" aria-hidden="true">N</span>
            <span className="brand-name">noncof<span>media</span></span>
          </a>
          <p className="brand-promise">Berita hari ini,<br />perspektif baru.</p>
          <a className="header-cta" href="/#berita-terbaru">
            Jelajahi berita <span aria-hidden="true">↗</span>
          </a>
        </div>
        <nav aria-label="Navigasi utama" className="category-nav">
          <div className="page-shell nav-inner">
            <a className="nav-home" href="/" aria-label="Beranda">⌂</a>
            {navItems.map(([label, slug]) => (
              <a href={`/kategori/${slug}`} key={slug}>{label}</a>
            ))}
            <a href="/#berita-terbaru">Terbaru <span className="live-dot" aria-hidden="true" /></a>
          </div>
        </nav>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="page-shell footer-main">
        <a aria-label="Noncof Media, halaman utama" className="brand footer-brand" href="/">
          <span className="brand-mark" aria-hidden="true">N</span>
          <span className="brand-name">noncof<span>media</span></span>
        </a>
        <p>Melihat lebih dekat.<br />Memahami lebih dalam.</p>
        <div className="footer-links">
          <a href="/">Beranda</a>
          <a href="/kategori/opini">Opini</a>
          <a href="/login">Ruang redaksi</a>
          <a href="mailto:redaksi@noncofmedia.my.id">Kontak redaksi</a>
        </div>
      </div>
      <div className="page-shell footer-bottom">
        <span>© 2026 Noncof Media. Hak cipta dilindungi.</span>
        <span>Jurnalisme independen, perspektif Indonesia.</span>
      </div>
    </footer>
  );
}
