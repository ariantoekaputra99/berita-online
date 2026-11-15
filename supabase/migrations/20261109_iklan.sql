-- Pengaturan iklan (Google AdSense). Publik boleh membaca (ID penerbit memang publik di ads.txt); hanya admin yang menulis.
create table public.ad_config (
  id boolean primary key default true check (id),
  enabled boolean not null default false,
  publisher_id text check (publisher_id is null or publisher_id ~ '^ca-pub-[0-9]{10,20}$'),
  updated_at timestamptz not null default now()
);
insert into public.ad_config default values;

create table public.ad_slots (
  slot_key text primary key,
  label text not null,
  position_note text not null,
  sort_order int not null,
  enabled boolean not null default true,
  unit_id text check (unit_id is null or unit_id ~ '^[0-9]{6,20}$')
);
insert into public.ad_slots (slot_key, label, position_note, sort_order) values
  ('header',          'Bawah menu (semua halaman)',   'Banner lebar tepat di bawah menu rubrik. Posisi paling sering terlihat.', 1),
  ('home_mid',        'Beranda, antar rubrik',        'Muncul setelah rubrik pertama di beranda, saat pembaca mulai menggulir.', 2),
  ('article_inline_1','Artikel, setelah paragraf ke-2','Pembaca sudah masuk ke isi berita; CTR tertinggi di artikel.', 3),
  ('article_inline_2','Artikel, setelah paragraf ke-6','Hanya tampil di artikel panjang (8 paragraf atau lebih).', 4),
  ('article_end',     'Artikel, akhir tulisan',       'Setelah pembaca selesai membaca, sebelum berita lainnya.', 5);

alter table public.ad_config enable row level security;
alter table public.ad_slots enable row level security;
create policy ad_config_select on public.ad_config for select to anon, authenticated using (true);
create policy ad_slots_select on public.ad_slots for select to anon, authenticated using (true);
create policy ad_config_admin on public.ad_config for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy ad_slots_admin on public.ad_slots for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
