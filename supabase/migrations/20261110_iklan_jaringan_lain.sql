-- Iklan tidak harus dari Google: tiap posisi bisa memakai AdSense, kode iklan jaringan lain, atau banner langsung (sponsor).
alter table public.ad_slots
  add column kind text not null default 'adsense' check (kind in ('adsense', 'code', 'banner')),
  add column code text check (code is null or char_length(code) <= 8000),
  add column banner_image_url text check (banner_image_url is null or banner_image_url ~ '^https://'),
  add column banner_link_url text check (banner_link_url is null or banner_link_url ~ '^https://'),
  add column width int not null default 300 check (width between 50 and 2000),
  add column height int not null default 250 check (height between 30 and 1500);
update public.ad_slots set width = 728, height = 90 where slot_key = 'header';
alter table public.ad_config
  add column ads_txt_extra text check (ads_txt_extra is null or char_length(ads_txt_extra) <= 4000);
