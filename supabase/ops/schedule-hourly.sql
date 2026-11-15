-- Run once in the Supabase SQL editor (replace <AUTOMATION_SECRET> with the same value set in Vercel;
-- never commit the real value). Calls the scrape + AI-brief endpoint every hour at minute 7.
create extension if not exists pg_net;
create extension if not exists pg_cron;
select cron.schedule(
  'scrape-dan-brief-tiap-jam', '7 * * * *',
  $$select net.http_get(
      url := 'https://noncofmedia.my.id/api/cron/scrape',
      headers := jsonb_build_object('Authorization', 'Bearer <AUTOMATION_SECRET>'),
      timeout_milliseconds := 58000
  )$$
);
-- Stop it: select cron.unschedule('scrape-dan-brief-tiap-jam');
