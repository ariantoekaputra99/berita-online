import Image from "next/image";

const image = (id: string, width = 1400) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

const navItems = [
  ["Nasional", "#nasional"],
  ["Ekonomi", "#ekonomi"],
  ["Teknologi", "#teknologi"],
  ["Gaya Hidup", "#gaya-hidup"],
  ["Opini", "#opini"],
];

const latestStories = [
  {
    category: "EKONOMI",
    title: "UMKM lokal mulai melirik pasar digital Asia Tenggara",
    time: "12 menit lalu",
    image: "photo-1556742049-0cfed4f6a45d",
    alt: "Pelaku usaha menyiapkan pesanan untuk pelanggan",
  },
  {
    category: "TEKNOLOGI",
    title: "Kota-kota Indonesia bersiap menyambut transportasi masa depan",
    time: "38 menit lalu",
    image: "photo-1519501025264-65ba15a82390",
    alt: "Pemandangan kota metropolitan saat malam",
  },
  {
    category: "GAYA HIDUP",
    title: "Ruang hijau kota menjadi tempat pulang yang baru",
    time: "1 jam lalu",
    image: "photo-1441974231531-c6227db76b6e",
    alt: "Jalur pejalan kaki yang teduh di tengah hutan",
  },
];

const categoryStories = [
  {
    id: "nasional",
    label: "Nasional",
    eyebrow: "NASIONAL",
    title: "Dari pesisir hingga pegunungan, warga bergerak merawat ruang hidup",
    description:
      "Inisiatif komunitas tumbuh di berbagai daerah, membawa harapan baru untuk lingkungan dan masa depan bersama.",
    image: "photo-1518837695005-2083093ee35b",
    alt: "Ombak dan garis pantai yang luas",
  },
  {
    id: "ekonomi",
    label: "Ekonomi",
    eyebrow: "EKONOMI",
    title: "Ekonomi kreatif daerah menemukan momentumnya",
    description:
      "Kolaborasi pelaku lokal dan teknologi membuka jalan bagi produk Indonesia untuk menjangkau lebih banyak orang.",
    image: "photo-1521737711867-e3b97375f902",
    alt: "Tim kreatif bekerja bersama di ruang kolaborasi",
  },
  {
    id: "teknologi",
    label: "Teknologi",
    eyebrow: "TEKNOLOGI",
    title: "Inovasi sederhana yang membuat hidup sehari-hari lebih mudah",
    description:
      "Dari layanan publik sampai ruang kerja, teknologi buatan anak bangsa kian dekat dengan kebutuhan masyarakat.",
    image: "photo-1518770660439-4636190af475",
    alt: "Komponen elektronik dan papan sirkuit",
  },
  {
    id: "gaya-hidup",
    label: "Gaya Hidup",
    eyebrow: "GAYA HIDUP",
    title: "Melambat sejenak, menemukan kembali ritme hidup di kota",
    description:
      "Makin banyak warga memilih kebiasaan yang lebih mindful untuk menjaga keseimbangan di tengah kesibukan.",
    image: "photo-1445116572660-236099ec97a0",
    alt: "Suasana kafe yang hangat dan tenang",
  },
];

function SectionHeading({
  eyebrow,
  title,
  link,
  id,
}: {
  eyebrow: string;
  title: string;
  link?: string;
  id?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={id}>{title}</h2>
      </div>
      {link && (
        <a className="text-link" href={link}>
          Lihat semua <span aria-hidden="true">↗</span>
        </a>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#konten">
        Langsung ke konten
      </a>

      <div className="topline">
        <div className="page-shell topline-inner">
          <p>Kamis, 5 November 2026</p>
          <p className="topline-note">
            Membaca Indonesia, memahami dunia <span aria-hidden="true">✳</span>
          </p>
          <a href="#newsletter">Berlangganan <span aria-hidden="true">↗</span></a>
        </div>
      </div>

      <header className="site-header">
        <div className="page-shell header-main">
          <a aria-label="Noncof Media, halaman utama" className="brand" href="#">
            <span className="brand-mark" aria-hidden="true">N</span>
            <span className="brand-name">noncof<span>media</span></span>
          </a>
          <p className="brand-promise">Berita hari ini,<br />perspektif baru.</p>
          <a className="header-cta" href="#berita-terbaru">
            Jelajahi berita <span aria-hidden="true">↗</span>
          </a>
        </div>
        <nav aria-label="Navigasi utama" className="category-nav">
          <div className="page-shell nav-inner">
            <a className="nav-home" href="#konten" aria-label="Beranda">⌂</a>
            {navItems.map(([label, href]) => (
              <a href={href} key={label}>{label}</a>
            ))}
            <a href="#berita-terbaru">Terbaru <span className="live-dot" aria-hidden="true" /></a>
          </div>
        </nav>
      </header>

      <main id="konten" className="page-shell">
        <section aria-labelledby="headline-title" className="hero-section">
          <div className="hero-copy">
            <p className="eyebrow"><span className="live-dot" /> PILIHAN REDAKSI</p>
            <h1 id="headline-title">
              Cerita hari ini,<br /><em>untuk esok</em> yang lebih baik.
            </h1>
            <p className="hero-intro">
              Menemukan makna di balik setiap kabar. Jurnalisme yang dekat,
              jernih, dan melihat Indonesia dari berbagai sudut.
            </p>
            <a className="button-link" href="#berita-terbaru">
              Baca berita pilihan <span aria-hidden="true">↗</span>
            </a>
            <div className="hero-byline">
              <span className="avatar" aria-hidden="true">NM</span>
              <span><strong>Redaksi Noncof</strong><small>Untuk pembaca yang ingin tahu lebih</small></span>
            </div>
          </div>
          <a className="hero-visual" href="#nasional" aria-label="Baca berita pilihan tentang Indonesia yang bergerak">
            <Image
              alt="Lanskap kota dan aktivitas warga Indonesia di pagi hari"
              className="hero-image"
              fill
              priority
              sizes="(max-width: 760px) 100vw, 58vw"
              src={image("photo-1519608487348-f3c686c7bdb5", 1800)}
            />
            <span className="image-shade" />
            <span className="image-caption">
              <span className="caption-kicker">CERITA UTAMA · 6 MENIT BACA</span>
              <strong>Indonesia bergerak, satu cerita baik dalam satu waktu</strong>
              <span className="caption-arrow" aria-hidden="true">↗</span>
            </span>
          </a>
        </section>

        <section aria-label="Berita terkini" className="ticker">
          <span className="ticker-label"><span className="live-dot" /> TERKINI</span>
          <p>Ide-ide baru lahir dari sekitar kita. Ikuti kabar terbaru pilihan redaksi Noncof Media.</p>
          <a href="#berita-terbaru" aria-label="Lihat berita terkini">→</a>
        </section>

        <section aria-labelledby="latest-title" className="latest-section" id="berita-terbaru">
          <SectionHeading eyebrow="JANGAN KETINGGALAN" title="Kabar terbaru" id="latest-title" link="#nasional" />
          <div className="latest-grid">
            {latestStories.map((story, index) => (
              <article className={`latest-card latest-card-${index + 1}`} key={story.title}>
                <a className="card-image" href={index === 0 ? "#ekonomi" : index === 1 ? "#teknologi" : "#gaya-hidup"}>
                  <Image alt={story.alt} fill sizes="(max-width: 760px) 100vw, 33vw" src={image(story.image, 900)} />
                </a>
                <div className="card-meta"><span>{story.category}</span><time>{story.time}</time></div>
                <h3><a href={index === 0 ? "#ekonomi" : index === 1 ? "#teknologi" : "#gaya-hidup"}>{story.title}</a></h3>
                <a className="story-arrow" href={index === 0 ? "#ekonomi" : index === 1 ? "#teknologi" : "#gaya-hidup"} aria-label={`Baca: ${story.title}`}>↗</a>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="explore-title" className="explore-section">
          <div className="explore-intro">
            <p className="eyebrow">JELAJAHI PERSPEKTIF</p>
            <h2 id="explore-title">Isu yang dekat,<br /><em>cerita yang berarti.</em></h2>
            <p>Pilih topikmu. Kami akan membawamu lebih dekat pada cerita di baliknya.</p>
            <a className="text-link" href="#opini">Temukan semua rubrik <span aria-hidden="true">↗</span></a>
          </div>
          <div className="explore-list">
            {categoryStories.map((story, index) => (
              <a className="explore-item" href={`#${story.id}`} key={story.id}>
                <span className="explore-number">0{index + 1}</span>
                <span>{story.label}</span>
                <span className="explore-arrow" aria-hidden="true">↗</span>
              </a>
            ))}
            <a className="explore-item" href="#opini">
              <span className="explore-number">05</span>
              <span>Opini</span>
              <span className="explore-arrow" aria-hidden="true">↗</span>
            </a>
          </div>
        </section>

        <section aria-labelledby="stories-title" className="category-section">
          <SectionHeading eyebrow="DARI BERBAGAI SUDUT" title="Cerita untuk hari ini" id="stories-title" link="#newsletter" />
          <div className="category-grid">
            {categoryStories.map((story, index) => (
              <article className="category-card" id={story.id} key={story.id}>
                <a className="category-image" href="#berita-terbaru" aria-label={`Lihat berita ${story.label}`}>
                  <Image alt={story.alt} fill sizes="(max-width: 760px) 100vw, 25vw" src={image(story.image, 800)} />
                  <span className="category-chip">{story.eyebrow}</span>
                </a>
                <p className="card-meta"><span>0{index + 1} · {story.label.toUpperCase()}</span></p>
                <h3><a href="#berita-terbaru">{story.title}</a></h3>
                <p className="category-description">{story.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="opinion-title" className="opinion-section" id="opini">
          <div className="opinion-art" aria-hidden="true">
            <span>“</span>
            <div className="opinion-orbit orbit-one" />
            <div className="opinion-orbit orbit-two" />
            <div className="opinion-orbit orbit-three" />
            <div className="opinion-sun" />
          </div>
          <div className="opinion-copy">
            <p className="eyebrow">RUANG OPINI</p>
            <h2 id="opinion-title">Masa depan tidak datang sendiri. <em>Kita yang merangkainya.</em></h2>
            <p className="opinion-description">Gagasan, sudut pandang, dan percakapan yang membuka kemungkinan baru untuk Indonesia.</p>
            <a className="button-link button-light" href="#berita-terbaru">
              Baca opini terbaru <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="opinion-index">01 <span>/ 04</span></div>
        </section>

        <section aria-labelledby="newsletter-title" className="newsletter-section" id="newsletter">
          <div>
            <p className="eyebrow">SURAT DARI REDAKSI</p>
            <h2 id="newsletter-title">Berita baik, langsung<br />ke <em>kotak masukmu.</em></h2>
            <p>Ringkasan pilihan redaksi, dikirim dengan hati-hati. Tanpa bising.</p>
          </div>
          <form action="mailto:redaksi@noncofmedia.my.id" className="newsletter-form" method="get">
            <label className="visually-hidden" htmlFor="email-address">Alamat email</label>
            <input autoComplete="email" id="email-address" name="email" placeholder="Alamat email kamu" required type="email" />
            <button type="submit" aria-label="Berlangganan newsletter">↗</button>
            <small>Dengan berlangganan, kamu menyetujui kebijakan privasi kami.</small>
          </form>
        </section>
      </main>

      <footer className="site-footer">
        <div className="page-shell footer-main">
          <a aria-label="Noncof Media, halaman utama" className="brand footer-brand" href="#konten">
            <span className="brand-mark" aria-hidden="true">N</span>
            <span className="brand-name">noncof<span>media</span></span>
          </a>
          <p>Melihat lebih dekat.<br />Memahami lebih dalam.</p>
          <div className="footer-links">
            <a href="#konten">Beranda</a>
            <a href="#opini">Tentang kami</a>
            <a href="mailto:redaksi@noncofmedia.my.id">Kontak redaksi</a>
          </div>
        </div>
        <div className="page-shell footer-bottom">
          <span>© 2026 Noncof Media. Hak cipta dilindungi.</span>
          <span>Jurnalisme independen, perspektif Indonesia.</span>
        </div>
      </footer>
    </>
  );
}
