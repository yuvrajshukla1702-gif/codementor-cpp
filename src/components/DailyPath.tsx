"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { dailySet, loadDoneIds, loadStreak, markDone, type PathItem } from "@/lib/learning-path";

export function DailyPath() {
  const [done, setDone] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setDone(loadDoneIds());
    setStreak(loadStreak());
  }, []);

  const items = useMemo(() => dailySet(done), [done]);

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
            <h2 className="font-display text-3xl text-[var(--ink)] md:text-4xl">Today</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              One clear path. Finish a problem, then mark it done.
            </p>
          </div>
          <p className="rounded-full border border-[var(--line)] px-3 py-1 text-xs text-[var(--muted)]">
            Streak <span className="font-semibold text-[var(--accent)]">{streak}</span> day
            {streak === 1 ? "" : "s"}
          </p>
        </div>

        <ul className="mt-8 space-y-3">
          {items.map((item: PathItem, idx) => (
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
          {items.length === 0 && (
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
