import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const metadata: Metadata = { title: "Kebijakan Privasi", description: "Bagaimana Noncof Media memakai cookie dan data pengunjung." };

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="page-shell article-page" id="konten">
        <article>
          <header className="article-header">
            <h1>Kebijakan Privasi</h1>
            <p className="article-byline">Diperbarui November 2026</p>
          </header>
          <div className="article-body">
            <p>Noncof Media (noncofmedia.my.id) menghormati privasi pengunjung. Halaman ini menjelaskan data apa yang dipakai situs ini.</p>
            <h2>Data yang kami kumpulkan</h2>
            <p>Membaca berita tidak mengharuskan Anda mendaftar. Jika Anda membuat akun (penulis atau redaksi), kami menyimpan nama, alamat email, dan peran akun Anda.</p>
            <h2>Iklan dan cookie</h2>
            <p>Situs ini dapat menampilkan iklan dari Google AdSense. Google dan mitra iklannya memakai cookie untuk menayangkan iklan berdasarkan kunjungan Anda ke situs ini dan situs lain. Anda dapat mengatur iklan yang dipersonalisasi di pengaturan iklan Google (adssettings.google.com) atau menolak cookie lewat pengaturan peramban.</p>
            <h2>Tautan ke situs lain</h2>
            <p>Artikel dapat memuat tautan ke sumber berita asli. Kami tidak bertanggung jawab atas kebijakan privasi situs tersebut.</p>
            <h2>Kontak</h2>
            <p>Pertanyaan tentang kebijakan ini dapat dikirim ke redaksi@noncofmedia.my.id.</p>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
