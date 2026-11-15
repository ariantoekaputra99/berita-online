-- Sumber scrap tambahan (feed sudah dicek hidup). Hanya judul + ringkasan + link yang diambil.
insert into public.scrape_sources (name, feed_url, category_id, active)
select v.name, v.url, c.id, true
from (values
  ('detikNews',               'https://news.detik.com/berita/rss',               'nasional'),
  ('detikFinance',            'https://finance.detik.com/rss',                   'ekonomi'),
  ('detikInet',               'https://inet.detik.com/rss',                      'teknologi'),
  ('detikSport',              'https://sport.detik.com/rss',                     'olahraga'),
  ('CNBC Indonesia - Market', 'https://www.cnbcindonesia.com/market/rss',        'ekonomi'),
  ('CNBC Indonesia - Tech',   'https://www.cnbcindonesia.com/tech/rss',          'teknologi'),
  ('Tempo - Bisnis',          'https://rss.tempo.co/bisnis',                     'ekonomi'),
  ('ANTARA News - Sepakbola', 'https://www.antaranews.com/rss/sepakbola.xml',    'olahraga'),
  ('Okezone - News',          'https://sindikasi.okezone.com/index.php/rss/1/RSS2.0', 'nasional')
) as v(name, url, slug)
join public.categories c on c.slug = v.slug
where not exists (select 1 from public.scrape_sources s where s.feed_url = v.url);
