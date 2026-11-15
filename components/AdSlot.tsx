import { AdblockNotice } from "@/components/AdblockNotice";
import { AdUnit } from "@/components/AdUnit";
import { getAdSettings, slotReady, type AdSlotKey } from "@/lib/ads";

/**
 * Loads the AdSense library whenever a publisher id is saved: Google needs the snippet in the page source to verify the
 * site, and it is what powers Auto ads. Slots and the anti-adblock notice still follow the master switch.
 */
export async function AdScript() {
  const { enabled, publisherId, antiAdblock } = await getAdSettings();
  if (!publisherId) return null;
  return (
    <>
      <script async crossOrigin="anonymous" src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`} />
      {enabled && antiAdblock && <AdblockNotice publisherId={publisherId} />}
    </>
  );
}

/** A labelled ad placement. Renders nothing unless ads and this slot are on and the slot is complete. */
export async function AdSlot({ slot, className = "" }: { slot: AdSlotKey; className?: string }) {
  const { enabled, publisherId, slots } = await getAdSettings();
  const row = slots.find((item) => item.slot_key === slot);
  if (!enabled || !row || !slotReady(row, publisherId)) return null;

  let content;
  if (row.kind === "adsense") {
    content = <AdUnit publisherId={publisherId!} unitId={row.unit_id!} />;
  } else if (row.kind === "banner") {
    content = (
      <a href={row.banner_link_url!} rel="sponsored nofollow noopener noreferrer" target="_blank">
        {/* eslint-disable-next-line @next/next/no-img-element -- sponsor banners come from arbitrary hosts */}
        <img alt="Iklan" height={row.height} loading="lazy" src={row.banner_image_url!} style={{ maxWidth: "100%", height: "auto" }} width={row.width} />
      </a>
    );
  } else {
    // Third-party ad code runs in a sandboxed iframe (no access to our cookies, session or page).
    content = (
      <iframe
        height={row.height}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
        srcDoc={`<!doctype html><html><head><meta charset="utf-8"><base target="_blank"></head><body style="margin:0;overflow:hidden">${row.code}</body></html>`}
        style={{ border: 0, maxWidth: "100%" }}
        title="Iklan"
        width={row.width}
      />
    );
  }

  return (
    <aside aria-label="Iklan" className={`ad-slot ad-${slot} ${className}`.trim()}>
      <span className="ad-label">Iklan</span>
      {content}
    </aside>
  );
}
