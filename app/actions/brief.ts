"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { aiConfigured, briefDrafts } from "@/lib/ai";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/** Writes AI briefs for one scraped draft (id given) or the newest ones (up to 10). Drafts stay unpublished. */
export async function generateBriefs(formData: FormData) {
  const profile = await requireRole(["admin"]);
  const back = (kind: "ok" | "error", message: string) =>
    redirect(`/admin?status=draft&${kind}=${encodeURIComponent(message)}`);

  if (!aiConfigured()) back("error", "Brief otomatis belum aktif: ANTHROPIC_API_KEY belum diatur di Vercel.");

  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  const result = await briefDrafts(
    supabase,
    { id: profile.id, name: "Redaksi Noncof" },
    { ids: id ? [id] : undefined, limit: id ? 1 : 10 },
  );

  revalidatePath("/admin");
  if (!result.written && result.failed.length) back("error", `Brief gagal dibuat: ${result.failed[0]}`);
  if (!result.written) back("error", "Tidak ada draf yang bisa dibuatkan brief (ringkasan sumber terlalu pendek atau sudah punya isi).");
  const note = result.skipped ? `, ${result.skipped} dilewati karena ringkasan terlalu pendek` : "";
  back("ok", `${result.written} brief otomatis dibuat sebagai draf${note}. Periksa lalu terbitkan.`);
}
