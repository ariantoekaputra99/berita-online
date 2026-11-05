import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/dashboard", "/login", "/daftar"] },
    sitemap: "https://noncofmedia.my.id/sitemap.xml",
  };
}
