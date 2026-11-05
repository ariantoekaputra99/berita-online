-- Noncof Media schema: profiles/roles, categories, tags, articles, scrape sources, RLS, storage.
-- Already applied to the Supabase project "berita-online"; kept here for reproducibility.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated, anon;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'reader' check (role in ('reader','writer','admin')),
  created_at timestamptz not null default now()
);
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique, slug text not null unique, sort_order int not null default 0
);
create table public.tags (
  id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique
);
create table public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 5 and 200),
  slug text not null unique,
  excerpt text not null default '',
  body text not null default '',
  cover_image_url text,
  category_id uuid references public.categories(id) on delete set null,
  author_id uuid references public.profiles(id) on delete set null,
  author_name text not null default 'Redaksi Noncof',
  status text not null default 'draft' check (status in ('draft','pending','published','rejected')),
  is_scraped boolean not null default false,
  source_name text,
  source_url text unique,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index articles_status_published_idx on public.articles (status, published_at desc);
create index articles_author_idx on public.articles (author_id);
create index articles_category_idx on public.articles (category_id);
create table public.article_tags (
  article_id uuid not null references public.articles(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (article_id, tag_id)
);
create index article_tags_tag_idx on public.article_tags (tag_id);
create table public.scrape_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  feed_url text not null unique check (feed_url like 'https://%'),
  category_id uuid references public.categories(id) on delete set null,
  active boolean not null default true,
  last_scraped_at timestamptz
);

create or replace function private.current_role_name() returns text
language sql stable security definer set search_path = '' as $$
  select role from public.profiles where id = (select auth.uid()) $$;
create or replace function private.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(private.current_role_name() = 'admin', false) $$;
create or replace function private.is_writer() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(private.current_role_name() in ('writer','admin'), false) $$;
grant execute on function private.current_role_name(), private.is_admin(), private.is_writer() to anon, authenticated;

create or replace function private.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.handle_new_user();

create or replace function private.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;
create trigger articles_touch before update on public.articles
  for each row execute function private.touch_updated_at();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.articles enable row level security;
alter table public.article_tags enable row level security;
alter table public.scrape_sources enable row level security;

create policy profiles_select on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()));
create policy profiles_update_admin on public.profiles for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

create policy categories_select on public.categories for select to anon, authenticated using (true);
create policy categories_admin_write on public.categories for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

create policy tags_select on public.tags for select to anon, authenticated using (true);
create policy tags_insert on public.tags for insert to authenticated with check ((select private.is_writer()));
create policy tags_admin_modify on public.tags for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy tags_admin_delete on public.tags for delete to authenticated using ((select private.is_admin()));

create policy articles_select_public on public.articles for select to anon
  using (status = 'published' and published_at <= now());
create policy articles_select_auth on public.articles for select to authenticated
  using ((status = 'published' and published_at <= now()) or author_id = (select auth.uid()) or (select private.is_admin()));
create policy articles_insert_writer on public.articles for insert to authenticated
  with check (
    (select private.is_admin())
    or ((select private.is_writer()) and author_id = (select auth.uid()) and status in ('draft','pending') and is_scraped = false)
  );
create policy articles_update on public.articles for update to authenticated
  using ((select private.is_admin()) or (author_id = (select auth.uid()) and (select private.is_writer()) and status in ('draft','pending','rejected')))
  with check ((select private.is_admin()) or (author_id = (select auth.uid()) and (select private.is_writer()) and status in ('draft','pending') and is_scraped = false));
create policy articles_delete on public.articles for delete to authenticated
  using ((select private.is_admin()) or (author_id = (select auth.uid()) and status in ('draft','rejected')));

create policy article_tags_select on public.article_tags for select to anon, authenticated
  using (exists (select 1 from public.articles a where a.id = article_id));
create policy article_tags_write on public.article_tags for all to authenticated
  using (exists (select 1 from public.articles a where a.id = article_id))
  with check (exists (select 1 from public.articles a where a.id = article_id));

create policy scrape_sources_admin on public.scrape_sources for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('article-images', 'article-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
create policy article_images_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'article-images' and (select private.is_writer()) and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy article_images_delete on storage.objects for delete to authenticated
  using (bucket_id = 'article-images' and ((select private.is_admin()) or (storage.foldername(name))[1] = (select auth.uid())::text));

insert into public.categories (name, slug, sort_order) values
  ('Nasional','nasional',1),('Ekonomi','ekonomi',2),('Teknologi','teknologi',3),('Gaya Hidup','gaya-hidup',4),('Opini','opini',5);
insert into public.scrape_sources (name, feed_url, category_id) values
  ('ANTARA News - Terkini','https://www.antaranews.com/rss/terkini.xml',(select id from public.categories where slug='nasional')),
  ('CNN Indonesia - Nasional','https://www.cnnindonesia.com/nasional/rss',(select id from public.categories where slug='nasional'));
