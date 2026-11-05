import { XMLParser } from "fast-xml-parser";

export type FeedItem = {
  title: string;
  link: string;
  excerpt: string;
  image: string | null;
  publishedAt: string | null;
};

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

function asText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object" && "#text" in (value as Record<string, unknown>)) {
    return String((value as Record<string, unknown>)["#text"]);
  }
  return "";
}

function toArray<T>(value: T | T[] | undefined): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function isHttpUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export async function fetchFeed(feedUrl: string, limit = 20): Promise<FeedItem[]> {
  const response = await fetch(feedUrl, {
    headers: { "User-Agent": "NoncofMediaBot/1.0 (+https://noncofmedia.my.id)", Accept: "application/rss+xml, text/xml, */*" },
    signal: AbortSignal.timeout(12000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Feed mengembalikan status ${response.status}`);

  const xml = await response.text();
  const parsed = parser.parse(xml);
  const items = toArray(parsed?.rss?.channel?.item as Record<string, unknown> | Record<string, unknown>[] | undefined);

  const results: FeedItem[] = [];
  for (const item of items.slice(0, limit)) {
    const title = stripHtml(asText(item.title));
    const link = asText(item.link).trim() || asText(item.guid).trim();
    if (title.length < 5 || !isHttpUrl(link)) continue;

    const rawDescription = asText(item.description) || asText(item["content:encoded"]);
    const enclosure = toArray(item.enclosure as Record<string, string> | Record<string, string>[] | undefined)[0];
    const media = toArray(item["media:content"] as Record<string, string> | Record<string, string>[] | undefined)[0];
    const inlineImage = /<img[^>]+src=["']([^"']+)["']/i.exec(rawDescription)?.[1];

    const imageCandidate = enclosure?.["@_url"] ?? media?.["@_url"] ?? inlineImage ?? null;
    const published = asText(item.pubDate);
    const publishedDate = published ? new Date(published) : null;

    results.push({
      title: title.slice(0, 200),
      link,
      excerpt: stripHtml(rawDescription).slice(0, 320),
      image: isHttpUrl(imageCandidate) ? imageCandidate : null,
      publishedAt: publishedDate && !Number.isNaN(publishedDate.getTime()) ? publishedDate.toISOString() : null,
    });
  }
  return results;
}
