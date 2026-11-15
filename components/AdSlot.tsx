import { AdblockNotice } from "@/components/AdblockNotice";
import { AdUnit } from "@/components/AdUnit";
import { getAdSettings, parseAdsense, slotReady, type AdSlotKey, type AdSlotRow } from "@/lib/ads";

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

type Creative = { image: string | null; code: string | null; width: number; height: number };

function Creative({ row, creative, publisherId }: { row: AdSlotRow; creative: Creative; publisherId: string | null }) {
  if (row.kind === "banner" || (row.kind !== "code" && row.kind !== "adsense" && creative.image)) {
    if (!creative.image || !row.banner_link_url) return null;
    return (
      <a href={row.banner_link_url} rel="sponsored nofollow noopener noreferrer" target="_blank">
        {/* eslint-disable-next-line @next/next/no-img-element -- sponsor banners come from arbitrary hosts */}
        <img alt="Iklan" height={creative.height} loading="lazy" src={creative.image} style={{ maxWidth: "100%", height: "auto" }} width={creative.width} />
      </a>
    );
  }
  if (row.kind === "adsense") return row.unit_id && publisherId ? <AdUnit publisherId={publisherId} unitId={row.unit_id} /> : null;
  const code = creative.code?.trim();
  if (!code) return null;
  const adsense = parseAdsense(code);
  if (adsense) return <AdUnit publisherId={adsense.client} unitId={adsense.unit} />;
  // Other networks' code runs in a sandboxed iframe (no access to our cookies, session or page).
  return (
    <iframe
      height={creative.height}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
      srcDoc={`<!doctype html><html><head><meta charset="utf-8"><base target="_blank"></head><body style="margin:0;overflow:hidden">${code}</body></html>`}
      style={{ border: 0, maxWidth: "100%" }}
      title="Iklan"
      width={creative.width}
    />
  );
}

/** A labelled ad placement with a desktop and an optional phone version. Renders nothing unless on and complete. */
export async function AdSlot({ slot, className = "" }: { slot: AdSlotKey; className?: string }) {
  const { enabled, publisherId, slots } = await getAdSettings();
  const row = slots.find((item) => item.slot_key === slot);
  if (!enabled || !row || !slotReady(row, publisherId)) return null;

  const desktop: Creative = { image: row.banner_image_url, code: row.code, width: row.width, height: row.height };
  const mobile: Creative = { image: row.mobile_banner_image_url, code: row.mobile_code, width: row.mobile_width, height: row.mobile_height };
  const hasMobile = row.kind === "banner" ? Boolean(mobile.image) : Boolean(mobile.code?.trim());

  return (
    <aside aria-label="Iklan" className={`ad-slot ad-${slot} ${className}`.trim()}>
      <span className="ad-label">Iklan</span>
      <div className={hasMobile ? "ad-desktop" : "ad-both"}>
        <Creative creative={desktop} publisherId={publisherId} row={row} />
      </div>
      {hasMobile && (
        <div className="ad-mobile">
          <Creative creative={mobile} publisherId={publisherId} row={row} />
        </div>
      )}
    </aside>
  );
}
