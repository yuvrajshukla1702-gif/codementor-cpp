"use client";

import { Fragment, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/icons";

export function Spinner({ size = 14 }: { size?: number }) {
  return (
    <span
      aria-hidden
      className="inline-block shrink-0 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent"
      style={{ width: size, height: size }}
    />
  );
}

/** "g++ (MinGW.org GCC-6.3.0-1) 6.3.0" -> "g++ 6.3.0" */
export function compilerName(v?: string) {
  const ver = v?.match(/(\d+\.\d+(?:\.\d+)?)\s*$/)?.[1];
  return ver ? `g++ ${ver}` : "g++";
}

export function CopyButton({ text, label = "Copy", className = "" }: { text: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={`btn btn-sm btn-quiet ${className}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          window.setTimeout(() => setDone(false), 1600);
        } catch {
          /* clipboard blocked */
        }
      }}
    >
      <Icon name={done ? "check" : "copy"} size={13} strokeWidth={done ? 2.6 : 2} />
      {done ? "Copied" : label}
    </button>
  );
}

/* --------------------------- a tiny C++ highlighter --------------------------- */

const KEYWORDS =
  "auto break case catch class const constexpr continue default delete do else enum explicit false for friend goto if inline namespace new noexcept nullptr operator private protected public return sizeof static struct switch template this throw true try typedef typename using virtual while";
const TYPES =
  "bool char double float int long short signed unsigned void size_t string vector map set unordered_map unordered_set stack queue deque priority_queue pair array bitset list multiset multimap tuple";
const WORDS = new Map<string, string>();
KEYWORDS.split(" ").forEach((w) => WORDS.set(w, "text-[#ff9ec4]"));
TYPES.split(" ").forEach((w) => WORDS.set(w, "text-[var(--accent-2)]"));

const TOKEN = /(\/\/.*$)|("(?:\\.|[^"\\\n])*")|('(?:\\.|[^'\\\n])*')|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_]\w*\b)|(#\s*include[^\n]*)/gm;

export function highlightCpp(code: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let k = 0;
  for (const m of code.matchAll(TOKEN)) {
    const at = m.index ?? 0;
    if (at > last) out.push(code.slice(last, at));
    const text = m[0];
    let cls = "";
    if (m[1]) cls = "text-[var(--faint)] italic";
    else if (m[2] || m[3]) cls = "text-[var(--gold)]";
    else if (m[4]) cls = "text-[var(--ember)]";
    else if (m[6]) cls = "text-[var(--faint)]";
    else if (m[5]) cls = WORDS.get(text) ?? (/^[A-Z]/.test(text) ? "text-[#b9e7ff]" : "");
    out.push(cls ? <span key={k++} className={cls}>{text}</span> : text);
    last = at + text.length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

export function CodeBlock({ code, className = "" }: { code: string; className?: string }) {
  return (
    <pre
      className={`overflow-x-auto rounded-xl border border-[var(--line)] bg-[#080b10] p-4 font-mono text-[12.5px] leading-[1.65] text-[var(--ink)] ${className}`}
    >
      <code>{highlightCpp(code)}</code>
    </pre>
  );
}

/* --------------------------- light markdown for chat --------------------------- */

function inline(text: string): ReactNode[] {
  return text.split(/(`[^`\n]+`|\*\*[^*\n]+\*\*)/g).map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code key={i} className="rounded bg-white/[0.07] px-1 py-0.5 font-mono text-[0.9em] text-[var(--accent)]">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={i} className="font-semibold text-[var(--ink)]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

/** Paragraphs, bullet lists, `inline code`, **bold** and fenced code blocks. No dependency needed. */
export function RichText({ text }: { text: string }) {
  const blocks = text.split(/```[a-zA-Z+]*\n?/g);
  return (
    <div className="space-y-2.5 text-sm leading-relaxed text-[var(--ink)]/90">
      {blocks.map((block, i) => {
        if (i % 2 === 1) return <CodeBlock key={i} code={block.replace(/\n$/, "")} className="!p-3 !text-[12px]" />;
        return block
          .split(/\n{2,}/)
          .map((para) => para.trim())
          .filter(Boolean)
          .map((para, j) => {
            const lines = para.split("\n");
            if (lines.every((l) => /^\s*([-*•]|\d+[.)])\s+/.test(l))) {
              return (
                <ul key={`${i}-${j}`} className="list-disc space-y-1 pl-5 marker:text-[var(--faint)]">
                  {lines.map((l, n) => (
                    <li key={n}>{inline(l.replace(/^\s*([-*•]|\d+[.)])\s+/, ""))}</li>
                  ))}
                </ul>
              );
            }
            return <p key={`${i}-${j}`}>{inline(para)}</p>;
          });
      })}
    </div>
  );
}

export function Pill({ tone = "neutral", children }: { tone?: "neutral" | "ok" | "warn" | "bad" | "info"; children: ReactNode }) {
  const map = {
    neutral: "border-[var(--line)] bg-[var(--panel-2)] text-[var(--muted)]",
    ok: "border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent)]",
    warn: "border-[rgba(255,209,102,0.35)] bg-[rgba(255,209,102,0.08)] text-[var(--gold)]",
    bad: "border-[rgba(255,107,129,0.35)] bg-[rgba(255,107,129,0.08)] text-[var(--bad)]",
    info: "border-[rgba(124,196,255,0.3)] bg-[rgba(124,196,255,0.08)] text-[var(--accent-2)]",
  } as const;
  return <span className={`inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-medium ${map[tone]}`}>{children}</span>;
}
