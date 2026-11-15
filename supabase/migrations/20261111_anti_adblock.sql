-- Pesan ramah untuk pengunjung yang memakai pemblokir iklan (tidak memblokir isi berita).
alter table public.ad_config add column anti_adblock boolean not null default true;
