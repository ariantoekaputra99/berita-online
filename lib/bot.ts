import { createPublicClient } from "@/lib/supabase/public";

/** Signs in as the dedicated admin bot account (RLS still applies; no service-role key). */
export async function signInBot() {
  const email = process.env.SCRAPER_BOT_EMAIL;
  const password = process.env.SCRAPER_BOT_PASSWORD;
  if (!email || !password) return null;
  const supabase = createPublicClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return null;
  return { supabase, userId: data.user.id };
}
