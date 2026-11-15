import { getAdSettings } from "@/lib/ads";

export const revalidate = 300;

/** ads.txt for Google AdSense, generated from the publisher id saved in /admin/iklan. */
export async function GET() {
  const { publisherId } = await getAdSettings();
  if (!publisherId) return new Response("Not found", { status: 404 });
  return new Response(`google.com, ${publisherId.replace("ca-", "")}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
