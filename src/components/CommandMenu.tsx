"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon, type IconName } from "./ui/icons";
import { Pips } from "./ui/kit";
import { useGame, type Difficulty } from "@/lib/gamify";
import { nextPathItems } from "@/lib/learning-path";

const PALETTE_EVENT = "cm:palette";

export function openCommandMenu() {
  window.dispatchEvent(new Event(PALETTE_EVENT));
}

type ProblemRow = { id: string; title: string; difficulty: Difficulty; topic: string; topicTitle: string };

type Entry = {
  key: string;
  group: string;
  title: string;
  sub?: string;
  icon: IconName;
  difficulty?: Difficulty;
  done?: boolean;
  run: () => void;
};

const PAGES: { href: string; title: string; sub: string; icon: IconName }[] = [
  { href: "/", title: "Home", sub: "Mission control", icon: "home" },
  { href: "/ask", title: "Ask AI", sub: "Any question: video, dry run, tested code", icon: "sparkles" },
  { href: "/practice", title: "All problems", sub: "Browse & filter", icon: "list" },
  { href: "/learn", title: "Learn DSA", sub: "Topic by topic", icon: "book" },
  { href: "/learn/cpp", title: "C++ track", sub: "Language fundamentals", icon: "code" },
  { href: "/compiler", title: "Compiler", sub: "Write and run C, C++, Python, Java, JavaScript", icon: "terminal" },
  { href: "/tcs", title: "TCS prep", sub: "NQT & interviews", icon: "target" },
  { href: "/core", title: "Core CS", sub: "OS, DBMS, networks", icon: "cpu" },
  { href: "/hr", title: "HR round", sub: "Answers that land", icon: "mic" },
  { href: "/progress", title: "Progress", sub: "XP, streak, badges", icon: "chart" },
  { href: "/settings", title: "Settings", sub: "Keys & sync", icon: "sliders" },
];

function score(text: string, tokens: string[]): number {
  const t = text.toLowerCase();
  let s = 0;
  for (const tok of tokens) {
    const i = t.indexOf(tok);
    if (i < 0) return -1;
    s += i === 0 ? 3 : t[i - 1] === " " || t[i - 1] === "-" ? 2 : 1;
  }
  return s;
}

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable || !!el.closest?.(".monaco-editor");
}

export function CommandMenu() {
  const router = useRouter();
  const game = useGame();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [rows, setRows] = useState<ProblemRow[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        e.stopPropagation();
        setQuery("");
        setActive(0);
        setOpen((o) => !o);
        return;
      }
      if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey && !isTyping(e.target)) {
        e.preventDefault();
        setQuery("");
        setActive(0);
        setOpen(true);
      }
    }
    function onOpen() {
      setQuery("");
      setActive(0);
      setOpen(true);
    }
    window.addEventListener("keydown", onKey, true);
    window.addEventListener(PALETTE_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener(PALETTE_EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    if (rows) return;
    let live = true;
    fetch("/api/problems")
      .then((r) => r.json())
      .then((d: ProblemRow[]) => live && setRows(d))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [open, rows]);

  const entries = useMemo<Entry[]>(() => {
    const done = new Set(game.done);
    const go = (href: string) => () => router.push(href);
    const problemEntry = (p: ProblemRow, group: string): Entry => ({
      key: `p:${p.id}`,
      group,
      title: p.title,
      sub: p.topicTitle,
      icon: "code",
      difficulty: p.difficulty,
      done: done.has(p.id),
      run: go(`/practice/${p.id}`),
    });
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    const out: Entry[] = [];

    if (tokens.length === 0) {
      const next = nextPathItems(game.done, 1)[0];
      if (next) {
        out.push({
          key: "a:continue",
          group: "Quick actions",
          title: `Continue · ${next.title}`,
          sub: "Next on your path",
          icon: "play",
          run: go(`/practice/${next.id}`),
        });
      }
      if (rows && rows.length) {
        out.push({
          key: "a:random",
          group: "Quick actions",
          title: "Surprise me",
          sub: "Random unsolved problem",
          icon: "shuffle",
          run: () => {
            const pool = rows.filter((r) => !done.has(r.id));
            const pick = (pool.length ? pool : rows)[Math.floor(Math.random() * (pool.length || rows.length))];
            router.push(`/practice/${pick.id}`);
          },
        });
      }
      for (const p of PAGES) {
        out.push({ key: `g:${p.href}`, group: "Go to", title: p.title, sub: p.sub, icon: p.icon, run: go(p.href) });
      }
      return out;
    }

    const pages = PAGES.map((p) => ({ p, s: score(`${p.title} ${p.sub}`, tokens) }))
      .filter((x) => x.s >= 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 4);
    const problems = (rows ?? [])
      .map((p) => ({ p, s: score(`${p.title} ${p.topicTitle} ${p.id}`, tokens) }))
      .filter((x) => x.s >= 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 9);
    for (const { p } of problems) out.push(problemEntry(p, "Problems"));
    for (const { p } of pages) {
      out.push({ key: `g:${p.href}`, group: "Go to", title: p.title, sub: p.sub, icon: p.icon, run: go(p.href) });
    }
    const raw = query.trim();
    if (raw.length >= 3) {
      out.push({
        key: "a:ask",
        group: "Ask the AI",
        title: raw.length > 52 ? `${raw.slice(0, 52)}…` : raw,
        sub: "Video, dry run & tested code",
        icon: "sparkles",
        run: go(`/ask?q=${encodeURIComponent(raw.slice(0, 6000))}`),
      });
    }
    return out;
  }, [query, rows, game.done, router]);

  const idx = Math.min(active, Math.max(0, entries.length - 1));

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [idx, entries]);

  function run(e: Entry | undefined) {
    if (!e) return;
    setOpen(false);
    e.run();
  }

  if (!open) return null;

  let lastGroup = "";
  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Command menu"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onMouseDown={close} />
      <div className="cm-drop relative w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--line-strong)] bg-[var(--panel)] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)]">
        <div className="flex items-center gap-3 border-b border-[var(--line)] px-4">
          <Icon name="search" size={16} className="text-[var(--muted)]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive(Math.min(idx + 1, entries.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive(Math.max(idx - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                run(entries[idx]);
              } else if (e.key === "Escape") {
                e.preventDefault();
                close();
              }
            }}
            placeholder="Search problems, topics, pages…"
            aria-label="Search"
            className="h-14 flex-1 bg-transparent text-[15px] text-[var(--ink)] outline-none placeholder:text-[var(--faint)]"
          />
          <kbd className="kbd">Esc</kbd>
        </div>

        <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2" role="listbox">
          {entries.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-[var(--muted)]">
              {rows ? "Nothing matches that. Try a topic like “two pointers”." : "Loading…"}
            </p>
          )}
          {entries.map((e, i) => {
            const header = e.group !== lastGroup ? e.group : null;
            lastGroup = e.group;
            const on = i === idx;
            return (
              <div key={e.key}>
                {header && <p className="eyebrow px-3 pb-1 pt-3 first:pt-1">{header}</p>}
                <button
                  type="button"
                  role="option"
                  aria-selected={on}
                  data-active={on}
                  onMouseMove={() => setActive(i)}
                  onClick={() => run(e)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                    on ? "bg-[var(--chip)]" : ""
                  }`}
                >
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${
                      on ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "bg-[var(--panel-2)] text-[var(--muted)]"
                    }`}
                  >
                    <Icon name={e.icon} size={14} />
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    <span className="text-[var(--ink)]">{e.title}</span>
                    {e.sub && <span className="ml-2 text-xs text-[var(--faint)]">{e.sub}</span>}
                  </span>
                  {e.difficulty && <Pips difficulty={e.difficulty} />}
                  {e.done && <Icon name="check" size={14} className="text-[var(--accent)]" />}
                  {on && <Icon name="arrowRight" size={14} className="text-[var(--muted)]" />}
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4 border-t border-[var(--line)] px-4 py-2 text-[11px] text-[var(--faint)]">
          <span className="inline-flex items-center gap-1.5">
            <kbd className="kbd">↑</kbd>
            <kbd className="kbd">↓</kbd> navigate
          </span>
          <span className="inline-flex items-center gap-1.5">
            <kbd className="kbd">↵</kbd> open
          </span>
          <span className="ml-auto hidden sm:inline">
            Press <kbd className="kbd">/</kbd> anywhere to search
          </span>
        </div>
      </div>
    </div>
  );
}
