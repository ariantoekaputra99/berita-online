import Link from "next/link";
import { formatDate } from "@/lib/articles";

export const navItems: [label: string, slug: string][] = [
  ["Nasional", "nasional"],
  ["Ekonomi", "ekonomi"],
  ["Teknologi", "teknologi"],
  ["Gaya Hidup", "gaya-hidup"],
  ["Opini", "opini"],
];

function Brand({ light }: { light?: boolean }) {
  return (
    <Link aria-label="Noncof Media, halaman utama" className={`brand${light ? " brand-light" : ""}`} href="/">
      <span className="brand-mark" aria-hidden="true">N</span>
      <span className="brand-name">noncof<span>media</span></span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <>
      <a className="skip-link" href="#konten">
        Langsung ke konten
      </a>

      <header className="site-header">
        <div className="topline">
          <div className="page-shell topline-inner">
            <p>{formatDate(new Date().toISOString())}</p>
            <Link href="/login">Ruang redaksi</Link>
          </div>
        </div>
        <div className="page-shell masthead">
          <Brand />
          <p className="masthead-tagline">Berita terkini Indonesia, disajikan jernih.</p>
        </div>
        <nav aria-label="Navigasi utama" className="category-nav">
          <div className="page-shell nav-inner">
            <Link href="/">Beranda</Link>
            {navItems.map(([label, slug]) => (
              <Link href={`/kategori/${slug}`} key={slug}>{label}</Link>
            ))}
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
        <div className="footer-about">
          <Brand light />
          <p>Berita terkini Indonesia dan dunia, dikurasi dan ditinjau redaksi.</p>
        </div>
        <nav aria-label="Rubrik" className="footer-col">
          <h2>Rubrik</h2>
          {navItems.map(([label, slug]) => (
            <Link href={`/kategori/${slug}`} key={slug}>{label}</Link>
          ))}
        </nav>
        <div className="footer-col">
          <h2>Redaksi</h2>
          <a href="mailto:redaksi@noncofmedia.my.id">Kontak redaksi</a>
          <Link href="/login">Ruang redaksi</Link>
        </div>
      </div>
      <div className="page-shell footer-bottom">
        <span>© {new Date().getFullYear()} Noncof Media. Hak cipta dilindungi.</span>
        <span>Berita dari sumber lain dikreditkan pada tiap artikel.</span>
      </div>
    </footer>
  );
}
