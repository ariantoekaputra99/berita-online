import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";

export type AdSlotKey = "header" | "home_mid" | "article_inline_1" | "article_inline_2" | "article_end";
export type AdSlotRow = { slot_key: AdSlotKey; label: string; position_note: string; enabled: boolean; unit_id: string | null };
export type AdSettings = { enabled: boolean; publisherId: string | null; slots: AdSlotRow[] };

/** Ad settings for the current request (deduplicated across header, slots and ads.txt). */
export const getAdSettings = cache(async (): Promise<AdSettings> => {
  const supabase = createPublicClient();
  const [{ data: config }, { data: slots }] = await Promise.all([
    supabase.from("ad_config").select("enabled, publisher_id").maybeSingle(),
    supabase.from("ad_slots").select("slot_key, label, position_note, enabled, unit_id").order("sort_order"),
  ]);
  return { enabled: Boolean(config?.enabled && config.publisher_id), publisherId: config?.publisher_id ?? null, slots: (slots ?? []) as AdSlotRow[] };
});

export const PUBLISHER_ID = /^ca-pub-\d{10,20}$/;
export const UNIT_ID = /^\d{6,20}$/;
