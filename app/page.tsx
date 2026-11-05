import Link from "next/link";
import { ArticleImage } from "@/components/ArticleImage";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { getCategories, getLatestArticles, timeAgo, type ArticleCardData } from "@/lib/articles";

export const revalidate = 60;

const image = (id: string, width = 1400) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

// Placeholder stories shown until the newsroom publishes real articles.
const fallbackLatest = [
  {
    category: "EKONOMI",
    title: "UMKM lokal mulai melirik pasar digital Asia Tenggara",
    time: "Contoh tampilan",
    image: image("photo-1556742049-0cfed4f6a45d", 900),
    alt: "Pelaku usaha menyiapkan pesanan untuk pelanggan",
    href: "/kategori/ekonomi",
  },
  {
    category: "TEKNOLOGI",
    title: "Kota-kota Indonesia bersiap menyambut transportasi masa depan",
    time: "Contoh tampilan",
    image: image("photo-1519501025264-65ba15a82390", 900),
    alt: "Pemandangan kota metropolitan saat malam",
    href: "/kategori/teknologi",
  },
  {
    category: "GAYA HIDUP",
    title: "Ruang hijau kota menjadi tempat pulang yang baru",
    time: "Contoh tampilan",
    image: image("photo-1441974231531-c6227db76b6e", 900),
    alt: "Jalur pejalan kaki yang teduh di tengah hutan",
    href: "/kategori/gaya-hidup",
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
    image: image("photo-1518837695005-2083093ee35b", 800),
    alt: "Ombak dan garis pantai yang luas",
  },
  {
    id: "ekonomi",
    label: "Ekonomi",
    eyebrow: "EKONOMI",
    title: "Ekonomi kreatif daerah menemukan momentumnya",
    description:
      "Kolaborasi pelaku lokal dan teknologi membuka jalan bagi produk Indonesia untuk menjangkau lebih banyak orang.",
    image: image("photo-1521737711867-e3b97375f902", 800),
    alt: "Tim kreatif bekerja bersama di ruang kolaborasi",
  },
  {
    id: "teknologi",
    label: "Teknologi",
    eyebrow: "TEKNOLOGI",
    title: "Inovasi sederhana yang membuat hidup sehari-hari lebih mudah",
    description:
      "Dari layanan publik sampai ruang kerja, teknologi buatan anak bangsa kian dekat dengan kebutuhan masyarakat.",
    image: image("photo-1518770660439-4636190af475", 800),
    alt: "Komponen elektronik dan papan sirkuit",
  },
  {
    id: "gaya-hidup",
    label: "Gaya Hidup",
    eyebrow: "GAYA HIDUP",
    title: "Melambat sejenak, menemukan kembali ritme hidup di kota",
    description:
      "Makin banyak warga memilih kebiasaan yang lebih mindful untuk menjaga keseimbangan di tengah kesibukan.",
    image: image("photo-1445116572660-236099ec97a0", 800),
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

function toLatestCard(article: ArticleCardData) {
  return {
    category: (article.category?.name ?? "BERITA").toUpperCase(),
    title: article.title,
    time: timeAgo(article.published_at),
    image: article.cover_image_url,
    alt: article.title,
    href: `/berita/${article.slug}`,
  };
}

export default async function Home() {
  const categories = await getCategories();
  const [latestArticles, ...perCategory] = await Promise.all([
    getLatestArticles(12),
    ...categoryStories.map((story) => {
      const category = categories.find((item) => item.slug === story.id);
      return category ? getLatestArticles(1, category.id) : Promise.resolve([] as ArticleCardData[]);
    }),
  ]);

  const featured = latestArticles[0] ?? null;
  // The latest-news grid is designed for three cards, so show placeholders until there are three real articles.
  const latestStories = latestArticles.length >= 3 ? latestArticles.slice(0, 3).map(toLatestCard) : fallbackLatest;
  const cards = categoryStories.map((story, index) => {
    const article = perCategory[index]?.[0];
    return article
      ? {
          id: story.id,
          label: story.label,
          eyebrow: story.eyebrow,
          title: article.title,
          description: article.excerpt,
          image: article.cover_image_url,
          alt: article.title,
          href: `/berita/${article.slug}`,
        }
      : { ...story, href: `/kategori/${story.id}` };
  });

  return (
    <>
      <SiteHeader />

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
          <a
            className="hero-visual"
            href={featured ? `/berita/${featured.slug}` : "/kategori/nasional"}
            aria-label={featured ? `Baca: ${featured.title}` : "Baca berita pilihan tentang Indonesia yang bergerak"}
          >
            <ArticleImage
              alt={featured?.title ?? "Lanskap kota dan aktivitas warga Indonesia di pagi hari"}
              className="hero-image"
              priority
              sizes="(max-width: 760px) 100vw, 58vw"
              src={featured?.cover_image_url ?? image("photo-1480714378408-67cf0d13bc1b", 1800)}
            />
            <span className="image-shade" />
            <span className="image-caption">
              <span className="caption-kicker">
                {featured ? `${(featured.category?.name ?? "BERITA").toUpperCase()} · TERBARU` : "CERITA UTAMA · 6 MENIT BACA"}
              </span>
              <strong>{featured?.title ?? "Indonesia bergerak, satu cerita baik dalam satu waktu"}</strong>
              <span className="caption-arrow" aria-hidden="true">↗</span>
            </span>
          </a>
        </section>

        <section aria-label="Berita terkini" className="ticker">
          <span className="ticker-label"><span className="live-dot" /> TERKINI</span>
          <p>{featured?.title ?? "Ide-ide baru lahir dari sekitar kita. Ikuti kabar terbaru pilihan redaksi Noncof Media."}</p>
          <a href={featured ? `/berita/${featured.slug}` : "#berita-terbaru"} aria-label="Lihat berita terkini">→</a>
        </section>

        <section aria-labelledby="latest-title" className="latest-section" id="berita-terbaru">
          <SectionHeading eyebrow="JANGAN KETINGGALAN" title="Kabar terbaru" id="latest-title" link="/kategori/nasional" />
          <div className="latest-grid">
            {latestStories.map((story, index) => (
              <article className={`latest-card latest-card-${index + 1}`} key={story.href + story.title}>
                <a className="card-image" href={story.href}>
                  <ArticleImage alt={story.alt} sizes="(max-width: 760px) 100vw, 33vw" src={story.image} />
                </a>
                <div className="card-meta"><span>{story.category}</span><time>{story.time}</time></div>
                <h3><a href={story.href}>{story.title}</a></h3>
                <a className="story-arrow" href={story.href} aria-label={`Baca: ${story.title}`}>↗</a>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="explore-title" className="explore-section">
          <div className="explore-intro">
            <p className="eyebrow">JELAJAHI PERSPEKTIF</p>
            <h2 id="explore-title">Isu yang dekat,<br /><em>cerita yang berarti.</em></h2>
            <p>Pilih topikmu. Kami akan membawamu lebih dekat pada cerita di baliknya.</p>
            <Link className="text-link" href="/kategori/opini">Temukan semua rubrik <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="explore-list">
            {categoryStories.map((story, index) => (
              <Link className="explore-item" href={`/kategori/${story.id}`} key={story.id}>
                <span className="explore-number">0{index + 1}</span>
                <span>{story.label}</span>
                <span className="explore-arrow" aria-hidden="true">↗</span>
              </Link>
            ))}
            <Link className="explore-item" href="/kategori/opini">
              <span className="explore-number">05</span>
              <span>Opini</span>
              <span className="explore-arrow" aria-hidden="true">↗</span>
            </Link>
          </div>
        </section>

        <section aria-labelledby="stories-title" className="category-section">
          <SectionHeading eyebrow="DARI BERBAGAI SUDUT" title="Cerita untuk hari ini" id="stories-title" link="/kategori/nasional" />
          <div className="category-grid">
            {cards.map((story, index) => (
              <article className="category-card" id={story.id} key={story.id}>
                <a className="category-image" href={story.href} aria-label={`Baca: ${story.title}`}>
                  <ArticleImage alt={story.alt} sizes="(max-width: 760px) 100vw, 25vw" src={story.image} />
                  <span className="category-chip">{story.eyebrow}</span>
                </a>
                <p className="card-meta"><span>0{index + 1} · {story.label.toUpperCase()}</span></p>
                <h3><a href={story.href}>{story.title}</a></h3>
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
            <Link className="button-link button-light" href="/kategori/opini">
              Baca opini terbaru <span aria-hidden="true">↗</span>
            </Link>
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

      <SiteFooter />
    </>
  );
}
