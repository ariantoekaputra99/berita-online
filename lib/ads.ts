import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";

export type AdSlotKey = "header" | "home_mid" | "article_inline_1" | "article_inline_2" | "article_end";
export type AdKind = "adsense" | "code" | "banner";
export type AdSlotRow = {
  slot_key: AdSlotKey;
  label: string;
  position_note: string;
  enabled: boolean;
  kind: AdKind;
  unit_id: string | null;
  code: string | null;
  banner_image_url: string | null;
  banner_link_url: string | null;
  width: number;
  height: number;
};
export type AdSettings = { enabled: boolean; publisherId: string | null; adsTxtExtra: string | null; slots: AdSlotRow[] };

const SLOT_COLUMNS = "slot_key, label, position_note, enabled, kind, unit_id, code, banner_image_url, banner_link_url, width, height";

/** Ad settings for the current request (deduplicated across header, slots and ads.txt). */
export const getAdSettings = cache(async (): Promise<AdSettings> => {
  const supabase = createPublicClient();
  const [{ data: config }, { data: slots }] = await Promise.all([
    supabase.from("ad_config").select("enabled, publisher_id, ads_txt_extra").maybeSingle(),
    supabase.from("ad_slots").select(SLOT_COLUMNS).order("sort_order"),
  ]);
  return {
    enabled: Boolean(config?.enabled),
    publisherId: config?.publisher_id ?? null,
    adsTxtExtra: config?.ads_txt_extra ?? null,
    slots: (slots ?? []) as AdSlotRow[],
  };
});

/** Whether a slot has everything its ad type needs to render. */
export function slotReady(slot: AdSlotRow, publisherId: string | null): boolean {
  if (!slot.enabled) return false;
  if (slot.kind === "adsense") return Boolean(publisherId && slot.unit_id);
  if (slot.kind === "code") return Boolean(slot.code?.trim());
  return Boolean(slot.banner_image_url && slot.banner_link_url);
}

export const PUBLISHER_ID = /^ca-pub-\d{10,20}$/;
export const UNIT_ID = /^\d{6,20}$/;
export const HTTPS_URL = /^https:\/\/[^\s"'<>]+$/;
