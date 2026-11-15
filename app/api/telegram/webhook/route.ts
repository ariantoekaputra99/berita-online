import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { signInBot } from "@/lib/bot";
import { countReadyAiDrafts, publishAllAiDrafts } from "@/lib/publish";
import { aiConfigured, briefDrafts } from "@/lib/ai";
import { scrapeSources } from "@/lib/scrape";
import {
  allowedChatIds,
  answerCallback,
  editMessage,
  publishPrompt,
  sendMessage,
  validWebhookSecret,
} from "@/lib/telegram";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Update = {
  message?: { chat: { id: number }; text?: string };
  callback_query?: { id: string; data?: string; message?: { message_id: number; chat: { id: number } } };
};

const HELP = "Perintah:\n/status — ringkasan draf\n/brief [jumlah] — buat brief otomatis (AI), default 10, maks 20\n/terbitkan — terbitkan semua draf hasil tulis ulang AI (ada konfirmasi)\n/scrap — scrap sumber lalu buat brief otomatis";

/** Telegram bot webhook. Fails closed: needs the secret header AND a chat id on the allow-list. */
export async function POST(request: NextRequest) {
  if (!validWebhookSecret(request.headers.get("x-telegram-bot-api-secret-token"))) {
    return new Response("Unauthorized", { status: 401 });
  }
  const update = (await request.json().catch(() => ({}))) as Update;
  const chatId = update.message?.chat.id ?? update.callback_query?.message?.chat.id;
  if (chatId === undefined || !allowedChatIds().includes(String(chatId))) return new Response("ok");

  const bot = await signInBot();
  if (!bot) {
    await sendMessage(chatId, "Akun bot belum dikonfigurasi di server.");
    return new Response("ok");
  }
  const { supabase, userId } = bot;

  if (update.callback_query) {
    const { id, data, message } = update.callback_query;
    const messageId = message?.message_id;
    if (data === "pub:ask") {
      await answerCallback(id);
      const ready = await countReadyAiDrafts(supabase);
      if (!ready) return (await editMessage(chatId, messageId!, "Tidak ada draf hasil tulis ulang AI yang siap terbit."), new Response("ok"));
      await editMessage(chatId, messageId!, `Terbitkan ${ready} berita hasil tulis ulang AI ke publik sekarang?`, [
        [{ text: "Ya, terbitkan", callback_data: "pub:yes" }, { text: "Batal", callback_data: "pub:no" }],
      ]);
    } else if (data === "pub:yes") {
      await answerCallback(id, "Menerbitkan…");
      const result = await publishAllAiDrafts(supabase);
      await editMessage(
        chatId,
        messageId!,
        result.error
          ? `Gagal: ${result.error}`
          : `${result.published} berita diterbitkan${result.failed ? `, ${result.failed} gagal` : ""}.`,
      );
    } else if (data === "pub:no") {
      await answerCallback(id);
      await editMessage(chatId, messageId!, "Dibatalkan. Tidak ada berita yang diterbitkan.");
    }
    return new Response("ok");
  }

  const text = (update.message?.text ?? "").trim();
  const command = text.split(/[\s@]/)[0].toLowerCase();
  if (command === "/terbitkan") {
    const ready = await countReadyAiDrafts(supabase);
    await (ready
      ? sendMessage(chatId, `${ready} draf hasil tulis ulang AI siap terbit.`, publishPrompt(ready))
      : sendMessage(chatId, "Tidak ada draf hasil tulis ulang AI yang siap terbit."));
  } else if (command === "/status") {
    const count = async (status: string) =>
      (await supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", status)).count ?? 0;
    const [draft, published, ready] = await Promise.all([count("draft"), count("published"), countReadyAiDrafts(supabase)]);
    await sendMessage(chatId, `Terbit: ${published}\nDraf: ${draft}\nSiap terbit (sudah ditulis ulang AI): ${ready}`, ready ? publishPrompt(ready) : undefined);
  } else if (command === "/brief") {
    if (!aiConfigured()) {
      await sendMessage(chatId, "Brief otomatis belum aktif: ANTHROPIC_API_KEY belum diatur.");
      return new Response("ok");
    }
    const requested = Number.parseInt(text.split(/\s+/)[1] ?? "", 10);
    const limit = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), 20) : 10;
    await sendMessage(chatId, `Membuat hingga ${limit} brief…`);
    const briefs = await briefDrafts(supabase, { id: userId, name: "Redaksi Noncof" }, { limit, budgetMs: 45000 });
    revalidatePath("/admin");
    const ready = await countReadyAiDrafts(supabase);
    const failNote = briefs.failed.length ? `\nGagal: ${briefs.failed[0]}` : "";
    await sendMessage(
      chatId,
      `${briefs.written} brief dibuat${briefs.skipped ? `, ${briefs.skipped} dilewati (ringkasan terlalu pendek)` : ""}.${failNote}\nSiap terbit: ${ready}`,
      ready ? publishPrompt(ready) : undefined,
    );
  } else if (command === "/scrap") {
    await sendMessage(chatId, "Scrap berjalan…");
    const result = await scrapeSources(supabase);
    const briefs = aiConfigured() ? await briefDrafts(supabase, { id: userId, name: "Redaksi Noncof" }, { limit: 10, budgetMs: 40000 }) : null;
    revalidatePath("/admin");
    const ready = await countReadyAiDrafts(supabase);
    await sendMessage(
      chatId,
      `${result.added} berita baru masuk draf${briefs ? `, ${briefs.written} brief dibuat` : ""}.\nSiap terbit: ${ready}`,
      ready ? publishPrompt(ready) : undefined,
    );
  } else {
    await sendMessage(chatId, HELP);
  }
  return new Response("ok");
}
