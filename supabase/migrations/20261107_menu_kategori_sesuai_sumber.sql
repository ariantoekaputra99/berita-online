-- Menu rubrik mengikuti isi berita: rubrik baru, sumber scrap per rubrik, dan koreksi kategori berita lama.
insert into public.categories (name, slug, sort_order) values
  ('Internasional', 'internasional', 2),
  ('Olahraga', 'olahraga', 4),
  ('Hiburan', 'hiburan', 7)
on conflict (slug) do nothing;
update public.categories set sort_order = v.n from (values
  ('nasional',1),('internasional',2),('ekonomi',3),('olahraga',4),('teknologi',5),('gaya-hidup',6),('hiburan',7),('opini',8)
) as v(slug, n) where categories.slug = v.slug;

-- Feed "Terkini" ANTARA bercampur semua rubrik, jadi diganti feed per rubrik.
update public.scrape_sources set active = false where feed_url = 'https://www.antaranews.com/rss/terkini.xml';

insert into public.scrape_sources (name, feed_url, category_id, active)
select v.name, v.url, c.id, true
from (values
  ('ANTARA News - Politik',   'https://www.antaranews.com/rss/politik.xml',   'nasional'),
  ('ANTARA News - Hukum',     'https://www.antaranews.com/rss/hukum.xml',     'nasional'),
  ('ANTARA News - Ekonomi',   'https://www.antaranews.com/rss/ekonomi.xml',   'ekonomi'),
  ('ANTARA News - Tekno',     'https://www.antaranews.com/rss/tekno.xml',     'teknologi'),
  ('ANTARA News - Olahraga',  'https://www.antaranews.com/rss/olahraga.xml',  'olahraga'),
  ('ANTARA News - Lifestyle', 'https://www.antaranews.com/rss/lifestyle.xml', 'gaya-hidup'),
  ('ANTARA News - Hiburan',   'https://www.antaranews.com/rss/hiburan.xml',   'hiburan'),
  ('ANTARA News - Dunia',     'https://www.antaranews.com/rss/dunia.xml',     'internasional'),
  ('CNN Indonesia - Ekonomi',       'https://www.cnnindonesia.com/ekonomi/rss',       'ekonomi'),
  ('CNN Indonesia - Teknologi',     'https://www.cnnindonesia.com/teknologi/rss',     'teknologi'),
  ('CNN Indonesia - Olahraga',      'https://www.cnnindonesia.com/olahraga/rss',      'olahraga'),
  ('CNN Indonesia - Gaya Hidup',    'https://www.cnnindonesia.com/gaya-hidup/rss',    'gaya-hidup'),
  ('CNN Indonesia - Internasional', 'https://www.cnnindonesia.com/internasional/rss', 'internasional'),
  ('CNN Indonesia - Hiburan',       'https://www.cnnindonesia.com/hiburan/rss',       'hiburan')
) as v(name, url, slug)
join public.categories c on c.slug = v.slug
where not exists (select 1 from public.scrape_sources s where s.feed_url = v.url);

-- Berita ANTARA lama: kategori dibaca dari rubrik asli di halaman sumbernya (sisanya tetap Nasional).
update public.articles a set category_id = c.id from public.categories c
  where c.slug = 'olahraga' and a.source_name like 'ANTARA%'
    and substring(a.source_url from '/berita/(\d+)/') = any('{5835395,5835415,5835427,5835435,5835499,5835519,5835531,5837687,5837691,5837699,5837739,5837743,5837747,5839067,5839075,5839103,5839107,5839111,5839115,5839119,5839123,5839127,5839135,5839143,5840355,5840359,5840363,5840367,5840371,5840395,5840403,5840407,5840411,5840415,5840419,5842859,5842883,5842887,5842899,5842919,5845431,5845467,5845471,5845479,5845483,5845503,5845507,5848055,5848059,5848063,5848067,5848075,5848079,5850571,5850579,5850583,5850587,5850591,5850595,5850615,5850635,5853127,5853151,5853155,5853167,5854815,5854883,5854887,5854895}'::text[]);
update public.articles a set category_id = c.id from public.categories c
  where c.slug = 'internasional' and a.source_name like 'ANTARA%'
    and substring(a.source_url from '/berita/(\d+)/') = any('{5837703,5837707,5837715,5837723,5837727,5837731,5839087,5839091,5840343,5840351,5840375,5840379,5840383,5840391,5842903,5842907,5853091,5853123,5854819,5854835,5854843,5854867}'::text[]);
update public.articles a set category_id = c.id from public.categories c
  where c.slug = 'ekonomi' and a.source_name like 'ANTARA%'
    and substring(a.source_url from '/berita/(\d+)/') = any('{5835391,5835403,5835423,5835447,5835471,5835475,5835483,5835487,5835495,5835503,5835511,5835527,5835539,5837679,5837683,5839095,5840347,5840387,5842831,5845435,5848007,5850603,5850607,5850611,5850631,5853135,5853143,5854839,5854859}'::text[]);
update public.articles a set category_id = c.id from public.categories c
  where c.slug = 'hiburan' and a.source_name like 'ANTARA%'
    and substring(a.source_url from '/berita/(\d+)/') = any('{5835543,5848043,5848083,5854855}'::text[]);
update public.articles a set category_id = c.id from public.categories c
  where c.slug = 'teknologi' and a.source_name like 'ANTARA%'
    and substring(a.source_url from '/berita/(\d+)/') = any('{5835379,5850619,5850627}'::text[]);
update public.articles a set category_id = c.id from public.categories c
  where c.slug = 'gaya-hidup' and a.source_name like 'ANTARA%'
    and substring(a.source_url from '/berita/(\d+)/') = any('{5835439,5848031,5850563,5850623}'::text[]);
