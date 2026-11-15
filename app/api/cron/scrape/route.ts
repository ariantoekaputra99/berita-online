import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { aiConfigured, briefDrafts, type BriefOutcome } from "@/lib/ai";
import { scrapeSources } from "@/lib/scrape";
import { signInBot } from "@/lib/bot";
import { countReadyAiDrafts } from "@/lib/publish";
import { notifyAll, publishPrompt, telegramConfigured } from "@/lib/telegram";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(request: NextRequest): boolean {
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  // CRON_SECRET: Vercel Cron. AUTOMATION_SECRET: the hourly database scheduler (pg_cron).
  return [process.env.CRON_SECRET, process.env.AUTOMATION_SECRET].some((secret) => {
    if (!secret) return false;
    const expected = Buffer.from(`Bearer ${secret}`);
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}

/**
 * Scheduled scrape (Vercel Cron, see vercel.json). Vercel sends `Authorization: Bearer $CRON_SECRET`.
 * Signs in as a dedicated admin bot account so Row Level Security still applies;
 * no service-role key is used. New items are saved as drafts for admin review.
 */
export async function GET(request: NextRequest) {
  if (!authorized(request)) return new Response("Unauthorized", { status: 401 });

  const bot = await signInBot();
  if (!bot) return Response.json({ error: "Scraper bot is not configured or sign-in failed" }, { status: 500 });
  const { supabase, userId } = bot;

  const result = await scrapeSources(supabase);
  // Turn new drafts into AI briefs (capped per run to bound cost and time). They stay drafts.
  let briefs: BriefOutcome | null = null;
  if (aiConfigured()) {
    briefs = await briefDrafts(supabase, { id: userId, name: "Redaksi Noncof" }, { limit: 10, budgetMs: 40000 });
  }
  revalidatePath("/admin");
  revalidatePath("/admin/scrap");

  // Tell the editors on Telegram when something new is ready to publish.
  let ready = 0;
  if (telegramConfigured() && (result.added || briefs?.written)) {
    ready = await countReadyAiDrafts(supabase);
    if (ready) {
      await notifyAll(
        `${result.added} berita baru di-scrap, ${briefs?.written ?? 0} brief dibuat.\n${ready} draf hasil tulis ulang AI siap terbit.`,
        publishPrompt(ready),
      );
    }
  }
  return Response.json({ ...result, briefs, ready });
}
