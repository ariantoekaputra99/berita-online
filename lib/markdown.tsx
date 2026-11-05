import type { ReactNode } from "react";

/**
 * Minimal, safe formatting for article bodies. Supported:
 *   ## Judul   ### Subjudul   - daftar   **tebal**   *miring*   [teks](https://tautan)
 * Output is built from React elements only (never raw HTML), so writer input cannot inject markup or scripts.
 * Links are limited to http(s).
 */
const INLINE = /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)|\*\*([^*\n]+)\*\*|\*([^*\n]+)\*/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let index = 0;
  for (const match of text.matchAll(INLINE)) {
    const start = match.index ?? 0;
    if (start > last) nodes.push(text.slice(last, start));
    const key = `${keyPrefix}-${index++}`;
    if (match[1] !== undefined) {
      nodes.push(
        <a href={match[2]} key={key} rel="noopener noreferrer nofollow ugc" target="_blank">
          {match[1]}
        </a>,
      );
    } else if (match[3] !== undefined) {
      nodes.push(<strong key={key}>{match[3]}</strong>);
    } else {
      nodes.push(<em key={key}>{match[4]}</em>);
    }
    last = start + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function renderLines(lines: string[], keyPrefix: string): ReactNode[] {
  return lines.flatMap((line, i) => [
    ...(i > 0 ? [<br key={`${keyPrefix}-br-${i}`} />] : []),
    ...renderInline(line, `${keyPrefix}-${i}`),
  ]);
}

export function renderBody(text: string): ReactNode[] {
  const blocks = text.replace(/\r\n/g, "\n").split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);

  return blocks.map((block, i) => {
    const key = `b${i}`;
    const lines = block.split("\n");

    if (lines.length === 1 && block.startsWith("### ")) return <h3 key={key}>{renderInline(block.slice(4), key)}</h3>;
    if (lines.length === 1 && block.startsWith("## ")) return <h2 key={key}>{renderInline(block.slice(3), key)}</h2>;

    if (lines.every((line) => line.startsWith("- "))) {
      return (
        <ul key={key}>
          {lines.map((line, j) => (
            <li key={j}>{renderInline(line.slice(2), `${key}-${j}`)}</li>
          ))}
        </ul>
      );
    }

    return <p key={key}>{renderLines(lines, key)}</p>;
  });
}
