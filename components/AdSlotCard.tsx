"use client";

import { useState } from "react";
import { saveAdSlot } from "@/app/actions/ads";
import { SubmitButton } from "@/components/SubmitButton";
import type { AdSlotRow } from "@/lib/ads";

/** One ad position as its own form. Every field is server-rendered; the tabs only choose which pair is shown. */
export function AdSlotCard({ slot }: { slot: AdSlotRow }) {
  const [kind, setKind] = useState<"banner" | "code">(slot.kind === "code" || slot.kind === "adsense" ? "code" : "banner");
  const isBanner = kind === "banner";
  return (
    <form action={saveAdSlot} className="ad-row" id={slot.slot_key}>
      <input name="slot_key" type="hidden" value={slot.slot_key} />
      <input name="kind" type="hidden" value={kind} />
      <div className="ad-row-head">
        <div>
          <h2>{slot.label}</h2>
          <small>
            {slot.position_note} Desktop {slot.width}×{slot.height} · HP {slot.mobile_width}×{slot.mobile_height}
          </small>
        </div>
        <label className="ad-switch">
          <input defaultChecked={slot.enabled} name="enabled" type="checkbox" /> Aktif
        </label>
      </div>

      <div className="ad-tabs" role="group" aria-label="Jenis iklan">
        <button aria-pressed={isBanner} className={isBanner ? "on" : ""} onClick={() => setKind("banner")} type="button">Gambar + link</button>
        <button aria-pressed={!isBanner} className={!isBanner ? "on" : ""} onClick={() => setKind("code")} type="button">Kode iklan (AdSense, dll.)</button>
      </div>

      <div hidden={!isBanner}>
        <label>Gambar banner desktop (https://…)<input defaultValue={slot.banner_image_url ?? ""} name="image" type="text" /></label>
        <label>Gambar banner HP (opsional)<input defaultValue={slot.mobile_banner_image_url ?? ""} name="mobile_image" type="text" /></label>
        <label>Tautan tujuan saat diklik (https://…)<input defaultValue={slot.banner_link_url ?? ""} name="link" type="text" /></label>
      </div>
      <div hidden={isBanner}>
        <label>Kode iklan desktop<textarea defaultValue={slot.code ?? ""} name="code" rows={5} /></label>
        <label>Kode iklan HP (opsional)<textarea defaultValue={slot.mobile_code ?? ""} name="mobile_code" rows={4} /></label>
        <small>Tempel kode lengkap dari jaringan iklan. Snippet AdSense (&lt;ins class=&quot;adsbygoogle&quot;…&gt;) otomatis dipakai sebagai unit AdSense. Hindari pop-under, interstitial, dan social bar.</small>
      </div>

      <div className="ad-size">
        <label>Lebar desktop<input defaultValue={slot.width} name="width" type="number" /></label>
        <label>Tinggi desktop<input defaultValue={slot.height} name="height" type="number" /></label>
        <label>Lebar HP<input defaultValue={slot.mobile_width} name="mobile_width" type="number" /></label>
        <label>Tinggi HP<input defaultValue={slot.mobile_height} name="mobile_height" type="number" /></label>
      </div>
      <div><SubmitButton className="btn" pendingText="Menyimpan…">Simpan</SubmitButton></div>
    </form>
  );
}
