import Link from "next/link";
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
          <Link href="/login">Masuk <span aria-hidden="true">↗</span></Link>
        </div>
      </div>

      <header className="site-header">
        <div className="page-shell header-main">
          <Link aria-label="Noncof Media, halaman utama" className="brand" href="/">
            <span className="brand-mark" aria-hidden="true">N</span>
            <span className="brand-name">noncof<span>media</span></span>
          </Link>
          <p className="brand-promise">Berita hari ini,<br />perspektif baru.</p>
          <Link className="header-cta" href="/#berita-terbaru">
            Jelajahi berita <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <nav aria-label="Navigasi utama" className="category-nav">
          <div className="page-shell nav-inner">
            <Link className="nav-home" href="/" aria-label="Beranda">⌂</Link>
            {navItems.map(([label, slug]) => (
              <Link href={`/kategori/${slug}`} key={slug}>{label}</Link>
            ))}
            <Link href="/#berita-terbaru">Terbaru <span className="live-dot" aria-hidden="true" /></Link>
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
        <Link aria-label="Noncof Media, halaman utama" className="brand footer-brand" href="/">
          <span className="brand-mark" aria-hidden="true">N</span>
          <span className="brand-name">noncof<span>media</span></span>
        </Link>
        <p>Melihat lebih dekat.<br />Memahami lebih dalam.</p>
        <div className="footer-links">
          <Link href="/">Beranda</Link>
          <Link href="/kategori/opini">Opini</Link>
          <Link href="/login">Ruang redaksi</Link>
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
