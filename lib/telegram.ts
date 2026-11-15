import { timingSafeEqual } from "node:crypto";

const api = (method: string) => `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`;

export type InlineKeyboard = { text: string; callback_data: string }[][];

export function telegramConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && allowedChatIds().length);
}

/** Chats allowed to give commands and receive notifications (TELEGRAM_ALLOWED_CHAT_IDS, comma separated). */
export function allowedChatIds(): string[] {
  return (process.env.TELEGRAM_ALLOWED_CHAT_IDS ?? "").split(",").map((id) => id.trim()).filter(Boolean);
}

export function validWebhookSecret(header: string | null): boolean {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret || !header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function call(method: string, body: Record<string, unknown>) {
  try {
    await fetch(api(method), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  } catch {
    // Telegram being unreachable must never break scraping or publishing.
  }
}

export const sendMessage = (chatId: string | number, text: string, keyboard?: InlineKeyboard) =>
  call("sendMessage", { chat_id: chatId, text, ...(keyboard ? { reply_markup: { inline_keyboard: keyboard } } : {}) });

export const editMessage = (chatId: string | number, messageId: number, text: string, keyboard?: InlineKeyboard) =>
  call("editMessageText", { chat_id: chatId, message_id: messageId, text, reply_markup: { inline_keyboard: keyboard ?? [] } });

export const answerCallback = (id: string, text?: string) => call("answerCallbackQuery", { callback_query_id: id, text });

export async function notifyAll(text: string, keyboard?: InlineKeyboard) {
  await Promise.all(allowedChatIds().map((chatId) => sendMessage(chatId, text, keyboard)));
}

export const publishPrompt = (ready: number): InlineKeyboard => [[{ text: `Terbitkan semua (${ready})`, callback_data: "pub:ask" }]];
