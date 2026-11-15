"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/** One AdSense display unit. The AdSense script itself is loaded once by <AdScript />. */
export function AdUnit({ publisherId, unitId }: { publisherId: string; unitId: string }) {
  const pushed = useRef(false);
  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // An ad failing to load must never break the page.
    }
  }, []);
  return (
    <ins
      className="adsbygoogle"
      data-ad-client={publisherId}
      data-ad-format="auto"
      data-ad-slot={unitId}
      data-full-width-responsive="true"
      style={{ display: "block" }}
    />
  );
}
