"use client";

import { useEffect, useState } from "react";

type ProgressPayload = {
  profile: {
    username: string;
    solved: { all: number; easy: number; medium: number; hard: number };
    tags: Array<{ name: string; count: number }>;
  } | null;
  hackerrank: {
    username: string;
    name: string;
    level: number | null;
    scores: Array<{ slug: string; name: string; practiceScore: number }>;
    recent: Array<{ slug: string; title: string }>;
  } | null;
  readiness: {
    score: number;
    label: string;
    gaps: string[];
    weeklyFocus: string[];
    notes: string[];
  };
  progress: Array<{ problemId: string; status: string; attempts: number }>;
};

export default function ProgressPage() {
  const [data, setData] = useState<ProgressPayload | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await fetch("/api/progress");
    setData(await res.json());
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  async function syncLc() {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const j = await res.json();
      if (j.errors?.length) setMsg(j.errors.join(" · "));
      else
        setMsg(
          `Synced LC @${j.leetcode?.username || "?"} (${j.leetcode?.solved?.all ?? "?"} solved) and HackerRank @${j.hackerrank?.username || "yuvrajshukla1702"} (${j.hackerrank?.recent?.length ?? 0} recent challenges).`,
        );
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl">Progress</h1>
          <p className="mt-2 text-[var(--muted)]">
            LeetCode and HackerRank sync themselves when you open the site. This page refreshes both.
          </p>
        </div>
        <button
          disabled={busy}
          onClick={syncLc}
          className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[#1a1208] disabled:opacity-50"
        >
          {busy ? "Syncing…" : "Sync LeetCode + HackerRank"}
        </button>
      </header>
      {msg && <p className="text-sm text-[var(--accent-2)]">{msg}</p>}

      {data?.readiness && (
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6 md:col-span-1">
            <div className="text-sm text-[var(--muted)]">Readiness score</div>
            <div className="mt-2 font-[family-name:var(--font-display)] text-5xl text-[var(--accent)]">
              {data.readiness.score}
            </div>
            <div className="mt-2 text-sm text-[var(--ink)]">{data.readiness.label}</div>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6 md:col-span-2">
            <h2 className="font-[family-name:var(--font-display)] text-xl">This week&apos;s plan</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--muted)]">
              {data.readiness.weeklyFocus.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
            <h3 className="mt-4 text-sm font-medium text-[var(--ink)]">Gaps to close</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">{data.readiness.gaps.join(" · ") || "Keep expanding depth."}</p>
          </div>
        </section>
      )}

      {data?.hackerrank && (
        <section className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6">
          <h2 className="font-[family-name:var(--font-display)] text-xl">
            HackerRank · @{data.hackerrank.username}
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {data.hackerrank.name} · level {data.hackerrank.level ?? "—"} · recent challenges{" "}
            {data.hackerrank.recent.length}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {data.hackerrank.scores
              .filter((s) => s.slug === "cpp" || s.slug === "algorithms" || s.slug === "data-structures")
              .map((s) => (
                <span key={s.slug} className="rounded-md bg-[var(--chip)] px-2 py-1 text-xs text-[var(--muted)]">
                  {s.name} · score {s.practiceScore}
                </span>
              ))}
          </div>
          <a className="mt-3 inline-block text-sm text-[var(--accent)] underline" href="/learn/dsa/hackerrank">
            Open HackerRank lessons →
          </a>
        </section>
      )}

      {data?.profile && (
        <section className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6">
          <h2 className="font-[family-name:var(--font-display)] text-xl">LeetCode · @{data.profile.username}</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Solved {data.profile.solved.all} (Easy {data.profile.solved.easy} / Medium {data.profile.solved.medium} /
            Hard {data.profile.solved.hard})
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {data.profile.tags.slice(0, 12).map((t) => (
              <span key={t.name} className="rounded-md bg-[var(--chip)] px-2 py-1 text-xs text-[var(--muted)]">
                {t.name} · {t.count}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6">
        <h2 className="font-[family-name:var(--font-display)] text-xl">Local problem status</h2>
        <ul className="mt-3 space-y-1 text-sm text-[var(--muted)]">
          {(data?.progress || []).length === 0 && <li>No local attempts yet — open Practice.</li>}
          {(data?.progress || []).map((p) => (
            <li key={p.problemId}>
              {p.problemId}: <span className="text-[var(--ink)]">{p.status}</span> · {p.attempts} attempts
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
