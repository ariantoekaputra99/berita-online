-- Varian HP per posisi iklan (banner/kode terpisah untuk layar kecil), seperti panel iklan di manga.
alter table public.ad_slots
  add column mobile_banner_image_url text check (mobile_banner_image_url is null or mobile_banner_image_url ~ '^https://'),
  add column mobile_code text check (mobile_code is null or char_length(mobile_code) <= 8000),
  add column mobile_width int not null default 320 check (mobile_width between 50 and 800),
  add column mobile_height int not null default 100 check (mobile_height between 30 and 1500);
update public.ad_slots set mobile_width = 300, mobile_height = 250 where slot_key in ('article_inline_1', 'article_inline_2');
update public.ad_slots set width = 728, height = 90 where slot_key in ('header', 'home_mid', 'article_end');
