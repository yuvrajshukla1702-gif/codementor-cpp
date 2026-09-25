"use client";

import { useMemo, useState } from "react";

/** Small markdown-lite renderer for lessons (no extra dependency). */
export function LessonContent({ source }: { source: string }) {
  const blocks = useMemo(() => parseBlocks(source), [source]);
  return (
    <div className="lesson-prose space-y-3 text-sm leading-relaxed text-[var(--muted)]">
      {blocks.map((b, i) => {
        if (b.type === "h1")
          return (
            <h2 key={i} className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
              {b.text}
            </h2>
          );
        if (b.type === "h2")
          return (
            <h3 key={i} className="pt-2 font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
              {b.text}
            </h3>
          );
        if (b.type === "code")
          return (
            <pre key={i} className="overflow-x-auto rounded-lg border border-[var(--line)] bg-[#0a0e13] p-3 font-mono text-xs text-[var(--accent-2)]">
              <code>{b.text}</code>
            </pre>
          );
        if (b.type === "ul")
          return (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {b.items.map((it, j) => (
                <li key={j}>{renderInline(it)}</li>
              ))}
            </ul>
          );
        if (b.type === "table")
          return (
            <div key={i} className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--line)] text-[var(--ink)]">
                    {b.headers.map((h, j) => (
                      <th key={j} className="px-2 py-1.5 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {b.rows.map((row, ri) => (
                    <tr key={ri} className="border-b border-[var(--line)]/60">
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-2 py-1.5">
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        return (
          <p key={i} className="text-[var(--muted)]">
            {renderInline(b.text)}
          </p>
        );
      })}
    </div>
  );
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**"))
      return (
        <strong key={i} className="font-semibold text-[var(--ink)]">
          {p.slice(2, -2)}
        </strong>
      );
    if (p.startsWith("`") && p.endsWith("`"))
      return (
        <code key={i} className="rounded bg-[var(--chip)] px-1 py-0.5 font-mono text-[11px] text-[var(--accent)]">
          {p.slice(1, -1)}
        </code>
      );
    return <span key={i}>{p}</span>;
  });
}

type Block =
  | { type: "h1" | "h2" | "p"; text: string }
  | { type: "code"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] };

function parseBlocks(src: string): Block[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const out: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    if (line.startsWith("```")) {
      i++;
      const buf: string[] = [];
      while (i < lines.length && !lines[i].startsWith("```")) {
        buf.push(lines[i]);
        i++;
      }
      i++;
      out.push({ type: "code", text: buf.join("\n") });
      continue;
    }
    if (line.startsWith("# ")) {
      out.push({ type: "h1", text: line.slice(2).trim() });
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      out.push({ type: "h2", text: line.slice(3).trim() });
      i++;
      continue;
    }
    if (line.trim().startsWith("|") && lines[i + 1]?.includes("---")) {
      const headers = splitRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      out.push({ type: "table", headers, rows });
      continue;
    }
    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      out.push({ type: "ul", items });
      continue;
    }
    out.push({ type: "p", text: line.trim() });
    i++;
  }
  return out;
}

function splitRow(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

export function QuizCard({
  quiz,
}: {
  quiz: Array<{ q: string; options: string[]; answer: number; explain: string }>;
}) {
  const [picked, setPicked] = useState<Record<number, number | null>>({});
  if (!quiz.length) return null;
  return (
    <section className="space-y-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
      <h3 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">Check yourself</h3>
      {quiz.map((item, qi) => {
        const choice = picked[qi];
        const revealed = choice !== undefined && choice !== null;
        return (
          <div key={qi} className="space-y-2 border-t border-[var(--line)] pt-4 first:border-0 first:pt-0">
            <p className="text-sm text-[var(--ink)]">
              {qi + 1}. {item.q}
            </p>
            <div className="flex flex-col gap-1.5">
              {item.options.map((opt, oi) => {
                const selected = choice === oi;
                const correct = revealed && oi === item.answer;
                const wrong = revealed && selected && oi !== item.answer;
                return (
                  <button
                    key={oi}
                    type="button"
                    onClick={() => setPicked((p) => ({ ...p, [qi]: oi }))}
                    className={`rounded-md border px-3 py-2 text-left text-sm transition ${
                      correct
                        ? "border-[var(--accent-2)] bg-[var(--accent-2)]/10 text-[var(--ink)]"
                        : wrong
                          ? "border-red-400/50 bg-red-400/10"
                          : selected
                            ? "border-[var(--accent)] bg-[var(--chip)]"
                            : "border-[var(--line)] hover:bg-[var(--chip)]"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {revealed && <p className="text-xs text-[var(--accent-2)]">{item.explain}</p>}
          </div>
        );
      })}
    </section>
  );
}
