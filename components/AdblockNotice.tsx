"use client";

import { useEffect, useState } from "react";

const SNOOZE_KEY = "adblock-notice-until";

/**
 * Polite ad-blocker notice: asks the reader to allow ads on this site. It never hides or blocks the article,
 * can be dismissed (and stays away for 3 days), and does not try to bypass the blocker.
 */
export function AdblockNotice({ publisherId }: { publisherId: string }) {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    try {
      if (Number(localStorage.getItem(SNOOZE_KEY)) > Date.now()) return;
    } catch {
      // storage unavailable: just show the notice
    }
    let cancelled = false;
    const bait = document.createElement("div");
    bait.className = "adsbox ad-banner textads banner-ads pub_300x250";
    bait.style.cssText = "position:absolute;left:-9999px;height:10px;width:10px";
    document.body.appendChild(bait);

    const check = async () => {
      let hidden = bait.offsetHeight === 0 || getComputedStyle(bait).display === "none";
      if (!hidden) {
        try {
          await fetch(`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`, { method: "HEAD", mode: "no-cors" });
        } catch {
          hidden = true;
        }
      }
      if (!cancelled && hidden) setBlocked(true);
    };
    const timer = window.setTimeout(check, 1200);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      bait.remove();
    };
  }, [publisherId]);

  if (!blocked) return null;
  return (
    <div className="adblock-notice" role="status">
      <p>
        <strong>Pemblokir iklan terdeteksi.</strong> Noncof Media gratis dibaca karena iklan. Mohon izinkan iklan untuk situs ini agar kami bisa terus menyajikan berita.
      </p>
      <button
        onClick={() => {
          try {
            localStorage.setItem(SNOOZE_KEY, String(Date.now() + 3 * 24 * 3600 * 1000));
          } catch {
            // ignore
          }
          setBlocked(false);
        }}
        type="button"
      >
        Mengerti
      </button>
    </div>
  );
}
