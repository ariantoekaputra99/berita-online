import Script from "next/script";
import { AdUnit } from "@/components/AdUnit";
import { getAdSettings, type AdSlotKey } from "@/lib/ads";

/** Loads the AdSense library once per public page (also enables Google Auto ads if switched on in AdSense). */
export async function AdScript() {
  const { enabled, publisherId } = await getAdSettings();
  if (!enabled || !publisherId) return null;
  return (
    <Script
      async
      crossOrigin="anonymous"
      id="adsense"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
      strategy="afterInteractive"
    />
  );
}

/** A labelled ad placement. Renders nothing unless ads and this slot are on and the slot has an AdSense unit id. */
export async function AdSlot({ slot, className = "" }: { slot: AdSlotKey; className?: string }) {
  const { enabled, publisherId, slots } = await getAdSettings();
  const row = slots.find((item) => item.slot_key === slot);
  if (!enabled || !publisherId || !row?.enabled || !row.unit_id) return null;
  return (
    <aside aria-label="Iklan" className={`ad-slot ad-${slot} ${className}`.trim()}>
      <span className="ad-label">Iklan</span>
      <AdUnit publisherId={publisherId} unitId={row.unit_id} />
    </aside>
  );
}
