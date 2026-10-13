"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Icon } from "./ui/icons";
import { Bar, Pips, Ring } from "./ui/kit";
import { useGame, type Difficulty } from "@/lib/gamify";
import { nextPathItems } from "@/lib/learning-path";

export type BrowserRow = {
  id: string;
  title: string;
  difficulty: Difficulty;
  topic: string;
  topicTitle: string;
};

export type BrowserTopic = { id: string; title: string; blurb: string; problemIds: string[] };

const DIFFS = ["All", "Easy", "Medium", "Hard"] as const;
const STATUS = ["All", "Todo", "Solved"] as const;

function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex shrink-0 rounded-xl border border-[var(--line-strong)] bg-[var(--surface)] p-0.5">
      {options.map((o) => {
        const on = o === value;
        return (
          <button
            key={o}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o)}
            className={`h-8 rounded-[9px] px-3 text-xs font-medium transition-colors ${
              on
                ? "bg-[var(--chip)] text-[var(--ink)] shadow-[inset_0_0_0_1px_var(--line-strong)]"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

export function ProblemBrowser({
  rows,
  topics,
  initialTopic,
}: {
  rows: BrowserRow[];
  topics: BrowserTopic[];
  initialTopic?: string;
}) {
  const router = useRouter();
  const game = useGame();
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<string>(topics.some((t) => t.id === initialTopic) ? initialTopic! : "all");
  const [diff, setDiff] = useState<(typeof DIFFS)[number]>("All");
  const [status, setStatus] = useState<(typeof STATUS)[number]>("All");

  const done = useMemo(() => new Set(game.done), [game.done]);
  const nextId = nextPathItems(game.done, 1)[0]?.id;

  const topicMembers = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const t of topics) m.set(t.id, new Set(t.problemIds));
    return m;
  }, [topics]);

  const searching = query.trim().length > 0;

  const filtered = useMemo(() => {
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    const members = topic === "all" ? null : topicMembers.get(topic);
    return rows.filter((r) => {
      if (members && !members.has(r.id)) return false;
      if (diff !== "All" && r.difficulty !== diff) return false;
      if (status === "Solved" && !done.has(r.id)) return false;
      if (status === "Todo" && done.has(r.id)) return false;
      if (tokens.length) {
        const hay = `${r.title} ${r.topicTitle} ${r.id}`.toLowerCase();
        if (!tokens.every((t) => hay.includes(t))) return false;
      }
      return true;
    });
  }, [rows, query, topic, diff, status, done, topicMembers]);

  const groups = useMemo(() => {
    if (searching) return [{ id: "results", title: "", blurb: "", rows: filtered }];
    const byId = new Map(filtered.map((r) => [r.id, r]));
    const used = new Set<string>();
    const out: { id: string; title: string; blurb: string; rows: BrowserRow[] }[] = [];
    for (const t of topics) {
      if (topic !== "all" && t.id !== topic) continue;
      const list = t.problemIds.map((id) => byId.get(id)).filter((r): r is BrowserRow => !!r && !used.has(r.id));
      list.forEach((r) => used.add(r.id));
      if (list.length) out.push({ id: t.id, title: t.title, blurb: t.blurb, rows: list });
    }
    const rest = filtered.filter((r) => !used.has(r.id));
    if (rest.length) out.push({ id: "other", title: "More", blurb: "", rows: rest });
    return out;
  }, [filtered, searching, topic, topics]);

  const total = rows.length;
  const solved = rows.filter((r) => done.has(r.id)).length;
  const pct = total ? Math.round((solved / total) * 100) : 0;

  function pickTopic(id: string) {
    setTopic(id);
    const url = id === "all" ? "/practice" : `/practice?topic=${id}`;
    window.history.replaceState(null, "", url);
  }

  function surprise() {
    const pool = filtered.filter((r) => !done.has(r.id));
    const list = pool.length ? pool : filtered;
    if (!list.length) return;
    router.push(`/practice/${list[Math.floor(Math.random() * list.length)].id}`);
  }

  function reset() {
    setQuery("");
    setDiff("All");
    setStatus("All");
    pickTopic("all");
  }

  return (
    <div className="mx-auto max-w-5xl px-1 py-6 sm:px-3 sm:py-8">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="eyebrow">Practice</p>
          <h1 className="mt-1 font-display text-4xl tracking-[-0.04em]">Problems</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {filtered.length} of {total} shown · every one has a lesson and a local judge
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Ring value={total ? solved / total : 0} size={52} stroke={5}>
              <span className="text-[11px] font-semibold tabular-nums">{solved}</span>
            </Ring>
            <p className="text-xs leading-tight text-[var(--muted)]">
              <b className="block text-sm text-[var(--ink)]">{pct}% cleared</b>
              {total - solved} to go
            </p>
          </div>
          <button type="button" onClick={surprise} className="btn" disabled={filtered.length === 0}>
            <Icon name="shuffle" size={15} /> Surprise me
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative block flex-1">
          <span className="sr-only">Search problems</span>
          <Icon name="search" size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--faint)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or topic…"
            className="input !h-11 !pl-10"
            autoComplete="off"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Segmented label="Difficulty" value={diff} options={DIFFS} onChange={setDiff} />
          <Segmented label="Status" value={status} options={STATUS} onChange={setStatus} />
        </div>
      </div>

      <div className="no-scrollbar -mx-1 mt-4 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {[{ id: "all", title: "All topics" }, ...topics].map((t) => {
          const on = topic === t.id;
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={on}
              onClick={() => pickTopic(t.id)}
              className={`h-8 shrink-0 rounded-full border px-3.5 text-xs font-medium transition-colors ${
                on
                  ? "border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--line-strong)] hover:text-[var(--ink)]"
              }`}
            >
              {t.title}
            </button>
          );
        })}
      </div>

      <div className="mt-5 space-y-4">
        {groups.length === 0 && (
          <div className="card grid place-items-center gap-3 px-6 py-16 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--panel-2)] text-[var(--muted)]">
              <Icon name="search" size={20} />
            </span>
            <p className="font-display text-lg">Nothing matches</p>
            <p className="max-w-xs text-sm text-[var(--muted)]">Try a different word, or clear the filters.</p>
            <button type="button" onClick={reset} className="btn btn-sm">
              Clear filters
            </button>
          </div>
        )}

        {groups.map((g) => {
          const gSolved = g.rows.filter((r) => done.has(r.id)).length;
          return (
            <section key={g.id} className="card overflow-hidden">
              {g.title && (
                <header className="flex items-center justify-between gap-4 border-b border-[var(--line)] bg-[var(--panel-2)]/60 px-4 py-3.5 sm:px-5">
                  <div className="min-w-0">
                    <h2 className="font-display text-lg leading-tight">{g.title}</h2>
                    {g.blurb && <p className="mt-0.5 hidden max-w-xl truncate text-xs text-[var(--muted)] sm:block">{g.blurb}</p>}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <div className="hidden w-24 sm:block">
                      <Bar value={(gSolved / g.rows.length) * 100} height={5} />
                    </div>
                    <span className="text-xs font-medium tabular-nums text-[var(--muted)]">
                      {gSolved}/{g.rows.length}
                    </span>
                  </div>
                </header>
              )}
              <ul className="divide-y divide-[var(--line)]">
                {g.rows.map((r) => {
                  const isDone = done.has(r.id);
                  const isNext = r.id === nextId && !isDone;
                  return (
                    <li key={r.id}>
                      <Link
                        href={`/practice/${r.id}`}
                        className="group relative grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition-colors before:absolute before:inset-y-2 before:left-0 before:w-[2px] before:origin-center before:scale-y-0 before:rounded-full before:bg-[var(--accent)] before:transition-transform hover:bg-[var(--panel-2)] hover:before:scale-y-100 sm:px-5"
                      >
                        <span
                          className={`grid h-5 w-5 place-items-center rounded-full border ${
                            isDone
                              ? "border-transparent bg-[var(--accent)] text-[var(--accent-ink)]"
                              : isNext
                                ? "cm-node-pulse border-[var(--accent)]"
                                : "border-[var(--line-strong)]"
                          }`}
                        >
                          {isDone && <Icon name="check" size={12} strokeWidth={3} />}
                        </span>
                        <span className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
                          <span className="truncate text-[15px] font-medium text-[var(--ink)]">{r.title}</span>
                          {isNext && <span className="chip chip-brand !h-5 !text-[10px]">Next up</span>}
                          {searching && <span className="chip !h-5 !text-[10px]">{r.topicTitle}</span>}
                        </span>
                        <span className="flex items-center gap-3">
                          <Pips difficulty={r.difficulty} label />
                          <Icon
                            name="chevronRight"
                            size={15}
                            className="text-[var(--faint)] transition-all group-hover:translate-x-0.5 group-hover:text-[var(--accent)]"
                          />
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
