import { saveAdSettings } from "@/app/actions/ads";
import { AdSlotFields } from "@/components/AdSlotFields";
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
        Setiap posisi bisa memakai <strong>Google AdSense</strong>, <strong>kode iklan dari jaringan lain</strong> (Adsterra, Media.net, jaringan lokal, dll.),
        atau <strong>banner langsung</strong> untuk sponsor sendiri. Kode dari jaringan lain berjalan di dalam kotak terisolasi (iframe), jadi tidak bisa
        menyentuh sesi atau data situs. Posisi yang belum lengkap tidak menampilkan apa pun. Halaman admin dan penulis tidak pernah menampilkan iklan.
      </p>

      <form action={saveAdSettings} className="ad-grid">
        <div className="ad-row">
          <label className="ad-row-head">
            <strong>Aktifkan iklan di situs</strong>
            <input defaultChecked={Boolean(config?.enabled)} name="enabled" type="checkbox" />
          </label>
          <label className="ad-row-head">
            <span>
              <strong>Pesan anti-adblock</strong>
              <br />
              <small>Pengunjung dengan pemblokir iklan melihat pesan sopan (bisa ditutup) yang meminta mengizinkan iklan. Isi berita tidak diblokir.</small>
            </span>
            <input defaultChecked={antiAdblock} name="anti_adblock" type="checkbox" />
          </label>
          <label>
            ID penerbit AdSense (hanya jika memakai AdSense)
            <input defaultValue={publisherId ?? ""} name="publisher_id" placeholder="ca-pub-1234567890123456" type="text" />
          </label>
          <label>
            Baris tambahan ads.txt (opsional, satu baris per jaringan, biasanya diberikan jaringan iklanmu)
            <textarea defaultValue={adsTxtExtra ?? ""} name="ads_txt_extra" placeholder="adsterra.com, 1234567, DIRECT, abc123def456" rows={3} />
          </label>
        </div>

        {slots.map((slot) => (
          <AdSlotFields key={slot.slot_key} slot={slot} />
        ))}

        <div><SubmitButton className="btn" pendingText="Menyimpan…">Simpan pengaturan</SubmitButton></div>
      </form>
    </section>
  );
}
