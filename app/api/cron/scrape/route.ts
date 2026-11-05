import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { scrapeSources } from "@/lib/scrape";
import { createPublicClient } from "@/lib/supabase/public";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/**
 * Scheduled scrape (Vercel Cron, see vercel.json). Vercel sends `Authorization: Bearer $CRON_SECRET`.
 * Signs in as a dedicated admin bot account so Row Level Security still applies;
 * no service-role key is used. New items are saved as drafts for admin review.
 */
export async function GET(request: NextRequest) {
  if (!authorized(request)) return new Response("Unauthorized", { status: 401 });

  const email = process.env.SCRAPER_BOT_EMAIL;
  const password = process.env.SCRAPER_BOT_PASSWORD;
  if (!email || !password) return Response.json({ error: "Scraper bot credentials are not configured" }, { status: 500 });

  const supabase = createPublicClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return Response.json({ error: "Scraper bot sign-in failed" }, { status: 500 });

  const result = await scrapeSources(supabase);
  revalidatePath("/admin");
  revalidatePath("/admin/scrap");
  return Response.json(result);
}
