import { createClient } from "@supabase/supabase-js";

/** Anonymous client with no cookies, so public pages can be statically cached (ISR). RLS only exposes published articles. */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
