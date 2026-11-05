import type { Metadata } from "next";
import { DM_Sans, Manrope } from "next/font/google";
import "./globals.css";

// Self-hosted by Next at build time: no render-blocking request to Google Fonts.
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap", variable: "--font-dm-sans" });
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], display: "swap", variable: "--font-manrope" });

const siteUrl = "https://noncofmedia.my.id";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Noncof Media — Berita Hari Ini, Perspektif Baru",
    template: "%s | Noncof Media",
  },
  description:
    "Berita terkini Indonesia dan dunia, disajikan dengan perspektif baru. Ikuti kabar politik, ekonomi, teknologi, dan gaya hidup bersama Noncof Media.",
  applicationName: "Noncof Media",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteUrl,
    siteName: "Noncof Media",
    title: "Noncof Media — Berita Hari Ini, Perspektif Baru",
    description:
      "Berita terkini Indonesia dan dunia, disajikan dengan perspektif baru.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Noncof Media — Berita Hari Ini, Perspektif Baru",
    description:
      "Berita terkini Indonesia dan dunia, disajikan dengan perspektif baru.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${dmSans.variable} ${manrope.variable}`} lang="id">
      <body>{children}</body>
    </html>
  );
}
