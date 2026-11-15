import { saveAdConfig } from "@/app/actions/ads";
import { AdSlotCard } from "@/components/AdSlotCard";
import { SubmitButton } from "@/components/SubmitButton";
import { getAdSettings } from "@/lib/ads";
import { createClient } from "@/lib/supabase/server";

type Props = { searchParams: Promise<{ ok?: string; error?: string }> };

export default async function AdsPage({ searchParams }: Props) {
  const { ok, error } = await searchParams;
  const { slots, publisherId, adsTxtExtra, antiAdblock } = await getAdSettings();
  const { data: config } = await (await createClient()).from("ad_config").select("enabled").maybeSingle();

  return (
    <section>
      <div className="panel-head"><h1>Iklan</h1></div>
      {ok && <p className="notice notice-ok">{ok}</p>}
      {error && <p className="notice notice-error" role="alert">{error}</p>}

      <p className="ad-help">
        Iklan hanya ada di posisi yang tidak menghalangi bacaan. Tiap posisi bisa berupa banner sponsor (gambar + link) atau kode dari jaringan iklan mana pun
        (Google AdSense, Adsterra, Media.net, dll.). Kode non-AdSense berjalan di kotak terisolasi. Posisi dengan versi HP kosong memakai versi desktop yang
        diperkecil. Halaman admin dan penulis tidak pernah menampilkan iklan.
      </p>

      <div className="ad-grid">
        <form action={saveAdConfig} className="ad-row" id="umum">
          <div className="ad-row-head">
            <h2>Pengaturan umum</h2>
            <label className="ad-switch"><input defaultChecked={Boolean(config?.enabled)} name="enabled" type="checkbox" /> Aktifkan iklan di situs</label>
          </div>
          <label>ID penerbit AdSense (jika memakai AdSense)<input defaultValue={publisherId ?? ""} name="publisher_id" placeholder="ca-pub-1234567890123456" type="text" /></label>
          <label className="ad-switch"><input defaultChecked={antiAdblock} name="anti_adblock" type="checkbox" /> Pesan sopan untuk pengunjung dengan pemblokir iklan (isi berita tidak diblokir)</label>
          <label>Baris tambahan ads.txt (opsional, satu baris per jaringan)<textarea defaultValue={adsTxtExtra ?? ""} name="ads_txt_extra" placeholder="adsterra.com, 1234567, DIRECT, abc123def456" rows={3} /></label>
          <div><SubmitButton className="btn" pendingText="Menyimpan…">Simpan</SubmitButton></div>
        </form>

        {slots.map((slot) => (
          <AdSlotCard key={slot.slot_key} slot={slot} />
        ))}
      </div>
    </section>
  );
}
