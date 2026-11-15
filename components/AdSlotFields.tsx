"use client";

import { useState } from "react";
import type { AdSlotRow } from "@/lib/ads";

/** Settings for one ad slot. All inputs stay in the form (hidden when not in use) so nothing is lost on save. */
export function AdSlotFields({ slot }: { slot: AdSlotRow }) {
  const [kind, setKind] = useState(slot.kind);
  const key = slot.slot_key;
  return (
    <div className="ad-row">
      <label className="ad-row-head">
        <strong>{slot.label}</strong>
        <input defaultChecked={slot.enabled} name={`enabled_${key}`} type="checkbox" />
      </label>
      <small>{slot.position_note}</small>

      <label>
        Jenis iklan
        <select name={`kind_${key}`} onChange={(event) => setKind(event.target.value as AdSlotRow["kind"])} value={kind}>
          <option value="adsense">Google AdSense</option>
          <option value="code">Kode iklan jaringan lain (Adsterra, Media.net, dll.)</option>
          <option value="banner">Banner langsung (sponsor sendiri)</option>
        </select>
      </label>

      <input defaultValue={slot.unit_id ?? ""} hidden={kind !== "adsense"} inputMode="numeric" name={`unit_${key}`} placeholder="ID unit iklan AdSense (angka)" type="text" />
      <textarea defaultValue={slot.code ?? ""} hidden={kind !== "code"} name={`code_${key}`} placeholder="Tempel kode iklan (HTML/JavaScript) dari jaringan iklanmu" rows={5} />
      <input defaultValue={slot.banner_image_url ?? ""} hidden={kind !== "banner"} name={`image_${key}`} placeholder="Alamat gambar banner (https://…)" type="text" />
      <input defaultValue={slot.banner_link_url ?? ""} hidden={kind !== "banner"} name={`link_${key}`} placeholder="Tautan tujuan saat banner diklik (https://…)" type="text" />

      <div className="ad-size" hidden={kind === "adsense"}>
        <label>Lebar (px)<input defaultValue={slot.width} max={2000} min={50} name={`width_${key}`} type="number" /></label>
        <label>Tinggi (px)<input defaultValue={slot.height} max={1500} min={30} name={`height_${key}`} type="number" /></label>
      </div>
    </div>
  );
}
