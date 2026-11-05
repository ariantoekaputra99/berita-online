-- Marks briefs drafted by AI from a scraped summary, so the public page can disclose it.
alter table public.articles add column if not exists ai_generated boolean not null default false;
