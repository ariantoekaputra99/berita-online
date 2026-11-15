import { saveAdSettings } from "@/app/actions/ads";
import { SubmitButton } from "@/components/SubmitButton";
import { getAdSettings } from "@/lib/ads";
import { createClient } from "@/lib/supabase/server";

type Props = { searchParams: Promise<{ ok?: string; error?: string }> };

export default async function AdsPage({ searchParams }: Props) {
  const { ok, error } = await searchParams;
  const { slots, publisherId } = await getAdSettings();
  const { data: config } = await (await createClient()).from("ad_config").select("enabled").maybeSingle();

  return (
    <section>
      <div className="panel-head"><h1>Iklan</h1></div>
      {ok && <p className="notice notice-ok">{ok}</p>}
      {error && <p className="notice notice-error" role="alert">{error}</p>}

      <p className="ad-help">
        Memakai Google AdSense. Daftar di adsense.google.com, tambahkan situs <strong>noncofmedia.my.id</strong>, tunggu disetujui,
        lalu salin <strong>ID penerbit</strong> (ca-pub-…) dan buat <strong>unit iklan</strong> tampilan untuk tiap posisi di bawah.
        File <code>/ads.txt</code> dibuat otomatis dari ID penerbit. Jika Auto ads diaktifkan di AdSense, Google juga bisa menambah posisi sendiri.
      </p>

      <form action={saveAdSettings} className="ad-grid">
        <div className="ad-row">
          <label className="ad-row-head">
            <strong>Aktifkan iklan di situs</strong>
            <input defaultChecked={Boolean(config?.enabled)} name="enabled" type="checkbox" />
          </label>
          <label>
            ID penerbit AdSense
            <input defaultValue={publisherId ?? ""} name="publisher_id" placeholder="ca-pub-1234567890123456" type="text" />
          </label>
        </div>

        {slots.map((slot) => (
          <div className="ad-row" key={slot.slot_key}>
            <label className="ad-row-head">
              <strong>{slot.label}</strong>
              <input defaultChecked={slot.enabled} name={`enabled_${slot.slot_key}`} type="checkbox" />
            </label>
            <small>{slot.position_note}</small>
            <input defaultValue={slot.unit_id ?? ""} inputMode="numeric" name={`unit_${slot.slot_key}`} placeholder="ID unit iklan (angka), dari AdSense" type="text" />
          </div>
        ))}

        <p className="ad-help">Posisi tanpa ID unit tidak menampilkan apa pun. Halaman admin dan penulis tidak pernah menampilkan iklan.</p>
        <div><SubmitButton className="btn" pendingText="Menyimpan…">Simpan pengaturan</SubmitButton></div>
      </form>
    </section>
  );
}
