"use client";

import { useRef } from "react";

type Props = { defaultValue?: string };

/** Textarea with a small formatting toolbar. Stores plain text in a simple, safe markup (see lib/markdown). */
export function BodyEditor({ defaultValue }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function wrap(before: string, after: string, placeholder: string) {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end, value } = el;
    const selected = value.slice(start, end) || placeholder;
    el.setRangeText(`${before}${selected}${after}`, start, end, "end");
    el.setSelectionRange(start + before.length, start + before.length + selected.length);
    el.focus();
  }

  function prefixLines(prefix: string) {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end, value } = el;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const block = value.slice(lineStart, end) || "Teks";
    el.setRangeText(block.split("\n").map((line) => `${prefix}${line}`).join("\n"), lineStart, end, "end");
    el.focus();
  }

  function insertLink() {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end, value } = el;
    const text = value.slice(start, end) || "teks tautan";
    el.setRangeText(`[${text}](https://)`, start, end, "end");
    const urlStart = start + text.length + 3;
    el.setSelectionRange(urlStart, urlStart + "https://".length);
    el.focus();
  }

  return (
    <div className="editor">
      <div aria-label="Format teks" className="editor-toolbar" role="toolbar">
        <button onClick={() => wrap("**", "**", "teks tebal")} title="Tebal" type="button"><b>B</b></button>
        <button onClick={() => wrap("*", "*", "teks miring")} title="Miring" type="button"><i>I</i></button>
        <button onClick={() => prefixLines("## ")} title="Judul bagian" type="button">H2</button>
        <button onClick={() => prefixLines("### ")} title="Sub judul" type="button">H3</button>
        <button onClick={() => prefixLines("- ")} title="Daftar" type="button">• Daftar</button>
        <button onClick={insertLink} title="Tautan" type="button">Tautan</button>
      </div>
      <textarea
        defaultValue={defaultValue}
        name="body"
        placeholder="Tulis isi berita di sini…"
        ref={ref}
        rows={16}
      />
    </div>
  );
}
