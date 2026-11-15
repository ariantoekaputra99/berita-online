import { getAdSettings } from "@/lib/ads";

export const revalidate = 300;

/** ads.txt generated from /admin/iklan: the AdSense line (if a publisher id is set) plus any lines from other ad networks. */
export async function GET() {
  const { publisherId, adsTxtExtra } = await getAdSettings();
  const lines = [
    ...(publisherId ? [`google.com, ${publisherId.replace("ca-", "")}, DIRECT, f08c47fec0942fa0`] : []),
    ...(adsTxtExtra ?? "").split("\n").map((line) => line.trim()).filter(Boolean),
  ];
  if (!lines.length) return new Response("Not found", { status: 404 });
  return new Response(`${lines.join("\n")}\n`, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
