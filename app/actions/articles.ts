"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { randomSuffix, slugify, type ArticleStatus } from "@/lib/articles";
import { createClient } from "@/lib/supabase/server";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function refreshPublicPages(slug?: string) {
  revalidatePath("/");
  revalidatePath("/kategori/[slug]", "page");
  revalidatePath("/tag/[slug]", "page");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/berita/${slug}`);
}

function parseTags(raw: string): { name: string; slug: string }[] {
  const seen = new Set<string>();
  const tags: { name: string; slug: string }[] = [];
  for (const part of raw.split(",")) {
    const name = part.trim().replace(/\s+/g, " ").slice(0, 40);
    const slug = slugify(name);
    if (!name || !slug || seen.has(slug)) continue;
    seen.add(slug);
    tags.push({ name, slug });
    if (tags.length === 8) break;
  }
  return tags;
}

/** Create or update an article. `intent` is draft | submit (writer, awaits review) | publish (admin only). */
export async function saveArticle(formData: FormData) {
  const profile = await requireRole(["writer", "admin"]);
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const intent = String(formData.get("intent") ?? "draft");
  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim().slice(0, 400);
  const body = String(formData.get("body") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "") || null;
  const tags = parseTags(String(formData.get("tags") ?? ""));
  const home = profile.role === "admin" ? "/admin" : "/dashboard";
  const back = id ? `/dashboard/artikel/${id}` : "/dashboard/baru";
  const fail = (message: string) => redirect(`${back}?error=${encodeURIComponent(message)}`);

  if (title.length < 5) fail("Judul minimal 5 karakter.");
  // Scraped items may be published as summary + source link, so they are exempt from the body minimum.
  let existing: { slug: string; published_at: string | null; is_scraped: boolean } | null = null;
  if (id) {
    const { data } = await supabase.from("articles").select("slug, published_at, is_scraped").eq("id", id).single();
    if (!data) fail("Berita tidak ditemukan atau kamu tidak punya akses.");
    existing = data;
  }
  if (intent !== "draft" && body.length < 30 && !existing?.is_scraped) fail("Isi berita minimal 30 karakter sebelum dikirim.");
  if (intent === "publish" && profile.role !== "admin") fail("Hanya admin yang dapat menerbitkan berita.");

  let status: ArticleStatus = "draft";
  if (intent === "submit") status = "pending";
  if (intent === "publish") status = "published";

  // Cover image: upload a new file if one was provided, otherwise keep the current URL.
  let coverUrl = String(formData.get("current_cover") ?? "") || null;
  if (formData.get("remove_cover") === "on") coverUrl = null;
  const file = formData.get("cover");
  if (file instanceof File && file.size > 0) {
    const ext = IMAGE_TYPES[file.type];
    if (!ext) fail("Format gambar harus JPG, PNG, atau WebP.");
    if (file.size > MAX_IMAGE_BYTES) fail("Ukuran gambar maksimal 5 MB.");
    const path = `${profile.id}/${randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("article-images")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) fail("Gagal mengunggah gambar. Coba lagi.");
    coverUrl = supabase.storage.from("article-images").getPublicUrl(path).data.publicUrl;
  }

  const fields = {
    title,
    excerpt: excerpt || body.slice(0, 200),
    body,
    category_id: categoryId,
    cover_image_url: coverUrl,
    status,
  };

  let articleId = id;
  let slug = "";

  if (id && existing) {
    slug = existing.slug;
    // A scraped item that gets an original body becomes the editor's own write-up (source stays credited).
    const rewritten = existing.is_scraped && body.length > 0 ? { author_id: profile.id, author_name: profile.full_name || "Redaksi Noncof" } : {};
    const { error } = await supabase
      .from("articles")
      .update({
        ...fields,
        ...rewritten,
        published_at: status === "published" ? (existing.published_at ?? new Date().toISOString()) : existing.published_at,
      })
      .eq("id", id);
    if (error) fail("Gagal menyimpan perubahan.");
  } else {
    slug = `${slugify(title) || "berita"}-${randomSuffix()}`;
    const { data, error } = await supabase
      .from("articles")
      .insert({
        ...fields,
        slug,
        author_id: profile.id,
        author_name: profile.full_name || profile.email.split("@")[0],
        published_at: status === "published" ? new Date().toISOString() : null,
      })
      .select("id")
      .single();
    if (error || !data) fail("Gagal membuat berita.");
    articleId = data!.id;
  }

  // Tags: create missing ones, then replace the article's tag links.
  await supabase.from("article_tags").delete().eq("article_id", articleId);
  if (tags.length) {
    await supabase.from("tags").upsert(tags, { onConflict: "slug", ignoreDuplicates: true });
    const { data: tagRows } = await supabase.from("tags").select("id").in("slug", tags.map((t) => t.slug));
    if (tagRows?.length) {
      await supabase.from("article_tags").insert(tagRows.map((t) => ({ article_id: articleId, tag_id: t.id })));
    }
  }

  refreshPublicPages(slug);
  const message =
    status === "published" ? "Berita diterbitkan." : status === "pending" ? "Berita dikirim untuk ditinjau admin." : "Draft disimpan.";
  redirect(`${home}?ok=${encodeURIComponent(message)}`);
}

export async function setArticleStatus(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as ArticleStatus;
  if (!id || !["draft", "pending", "published", "rejected"].includes(status)) return;

  const { data: existing } = await supabase.from("articles").select("slug, published_at").eq("id", id).single();
  if (!existing) return;

  await supabase
    .from("articles")
    .update({
      status,
      published_at: status === "published" ? (existing.published_at ?? new Date().toISOString()) : existing.published_at,
    })
    .eq("id", id);

  refreshPublicPages(existing.slug);
  revalidatePath("/admin");
}

export async function deleteArticle(formData: FormData) {
  const profile = await requireRole(["writer", "admin"]);
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const { data: existing } = await supabase.from("articles").select("slug").eq("id", id).single();
  await supabase.from("articles").delete().eq("id", id);

  refreshPublicPages(existing?.slug);
  revalidatePath(profile.role === "admin" ? "/admin" : "/dashboard");
}
