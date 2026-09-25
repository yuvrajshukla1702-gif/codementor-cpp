"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  dailySet,
  LEARNING_SPINE,
  loadDoneIds,
  loadStreak,
  markDone,
  nextPathItems,
  type PathItem,
} from "@/lib/learning-path";

export function DailyPath() {
  const [done, setDone] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setDone(loadDoneIds());
    setStreak(loadStreak());
  }, []);

  const items = useMemo(() => dailySet(done), [done]);
  const next = useMemo(() => nextPathItems(done, 1)[0], [done]);
  const doneCount = done.filter((id) => LEARNING_SPINE.some((s) => s.id === id)).length;
  const total = LEARNING_SPINE.length;
  const pct = Math.round((doneCount / Math.max(1, total)) * 100);

  function complete(id: string) {
    markDone(id);
    setDone(loadDoneIds());
    setStreak(loadStreak());
  }

  return (
    <section className="border-t border-[var(--line)] bg-[var(--panel)] px-5 py-14 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
              What should I do today?
            </p>
            <h2 className="mt-1 font-display text-3xl text-[var(--ink)] md:text-4xl">Today</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Spine path after Two Sum. Finish one, mark done, keep the streak.
            </p>
          </div>
          <div className="text-right">
            <p className="rounded-full border border-[var(--line)] px-3 py-1 text-xs text-[var(--muted)]">
              Streak <span className="font-semibold text-[var(--accent)]">{streak}</span> day
              {streak === 1 ? "" : "s"}
            </p>
            <p className="mt-2 text-xs text-[var(--muted)]">
              Path {doneCount}/{total} · {pct}%
            </p>
          </div>
        </div>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--chip)]">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>

        {next && (
          <div className="mt-8 border border-[var(--line)] bg-[var(--bg)] px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--accent)]">Do this next</p>
            <Link
              href={`/practice/${next.id}`}
              className="mt-1 block font-display text-2xl text-[var(--ink)] hover:text-[var(--accent)]"
            >
              {next.title}
            </Link>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Open Lesson → Code walk → solve in the editor. Then mark done below.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={`/practice/${next.id}`}
                className="rounded bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-black"
              >
                Start lesson
              </Link>
              <button
                type="button"
                onClick={() => complete(next.id)}
                className="rounded border border-[var(--line)] px-3 py-1.5 text-xs text-[var(--muted)] hover:bg-[var(--chip)] hover:text-[var(--ink)]"
              >
                Mark done
              </button>
            </div>
          </div>
        )}

        <ul className="mt-6 space-y-3">
          {items
            .filter((item) => item.id !== next?.id)
            .map((item: PathItem, idx) => (
              <li
                key={`${item.id}-${idx}`}
                className="flex flex-wrap items-center gap-3 border-b border-[var(--line)] py-4 last:border-b-0"
              >
                <span className="w-24 shrink-0 text-xs text-[var(--muted)]">{item.reason}</span>
                <Link
                  href={`/practice/${item.id}`}
                  className="flex-1 text-base font-medium text-[var(--ink)] hover:text-[var(--accent)]"
                >
                  {item.title}
                </Link>
                <button
                  type="button"
                  onClick={() => complete(item.id)}
                  className="rounded border border-[var(--line)] px-2.5 py-1 text-xs text-[var(--muted)] hover:bg-[var(--chip)] hover:text-[var(--ink)]"
                >
                  Mark done
                </button>
              </li>
            ))}
          {!next && items.length === 0 && (
            <li className="py-4 text-sm text-[var(--muted)]">
              Spine complete — open{" "}
              <Link href="/practice" className="text-[var(--accent)] hover:underline">
                all problems
              </Link>
              .
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
