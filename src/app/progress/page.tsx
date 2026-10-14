"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icons";
import { Bar } from "@/components/ui/kit";
import { BADGES, badgeDef, useGame, type BadgeDef, type BadgeTone, type HeatCell } from "@/lib/gamify";

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

const TONE: Record<BadgeTone, string> = {
  lime: "#c8f65d",
  gold: "#ffd166",
  ember: "#ff7a45",
  sky: "#7cc4ff",
  rose: "#ff6b81",
};

function shade(count: number) {
  if (count <= 0) return "var(--panel-2)";
  if (count === 1) return "rgba(200,246,93,0.35)";
  if (count === 2) return "rgba(200,246,93,0.62)";
  return "var(--accent)";
}

const HEAT_LABELS: Record<number, string> = { 1: "Mon", 3: "Wed", 5: "Fri" };

/** Full-width contribution grid: one column per week, one row per weekday (Sun → Sat). */
function Heatmap({ cells }: { cells: HeatCell[] }) {
  const lead = cells[0]?.dow ?? 0;
  const last = cells.length - 1;
  const weeks = Math.ceil((lead + cells.length) / 7);
  return (
    <div
      className="grid max-w-3xl gap-[3px]"
      style={{ gridTemplateColumns: `1.9rem repeat(${weeks}, minmax(0, 1fr))` }}
    >
      {Object.entries(HEAT_LABELS).map(([dow, label]) => (
        <span
          key={label}
          className="flex items-center text-[10px] text-[var(--faint)]"
          style={{ gridColumn: 1, gridRow: Number(dow) + 1 }}
        >
          {label}
        </span>
      ))}
      {cells.map((c, i) => {
        const slot = lead + i;
        return (
          <span
            key={c.key}
            title={`${c.key} · ${c.count} solved`}
            className={`aspect-square w-full rounded-[4px] ${
              i === last ? "outline outline-1 outline-offset-1 outline-[var(--accent-line)]" : ""
            }`}
            style={{
              gridColumn: Math.floor(slot / 7) + 2,
              gridRow: (slot % 7) + 1,
              background: shade(c.count),
              boxShadow: c.count ? "none" : "inset 0 0 0 1px var(--line)",
            }}
          />
        );
      })}
    </div>
  );
}

export default function ProgressPage() {
  const game = useGame();
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
      const res = await fetch("/api/sync?force=1", { method: "POST" });
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

  const earned = game.badges.map(badgeDef).filter((b): b is BadgeDef => !!b);
  const activeDays = game.heat.filter((c) => c.count > 0).length;

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-1 py-6 sm:px-3 sm:py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Progress</p>
          <h1 className="mt-1 font-display text-4xl tracking-[-0.04em]">
            Your <span className="font-serif-accent text-[1.05em] font-normal text-[var(--accent)]">journey</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
            XP, streak and badges live in this browser. LeetCode and HackerRank sync themselves when you open the site;
            this page refreshes both.
          </p>
        </div>
        <button disabled={busy} onClick={syncLc} className="btn btn-primary">
          {busy ? "Syncing…" : "Sync LeetCode + HackerRank"}
        </button>
      </header>
      {msg && (
        <p className="cm-drop flex items-start gap-2 rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3.5 py-2.5 text-sm text-[var(--ink)]">
          <Icon name="info" size={16} className="mt-0.5 shrink-0 text-[var(--accent-2)]" />
          {msg}
        </p>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <p className="eyebrow">Level</p>
          <p className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-5xl leading-none tabular-nums text-[var(--gold)]">{game.level}</span>
            <span className="font-serif-accent text-xl">{game.rank}</span>
          </p>
          <div className="mt-4">
            <Bar value={game.levelPct} color="linear-gradient(90deg, var(--gold), var(--accent))" />
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            {game.xp} XP · {game.levelEnd - game.xp} to next level
          </p>
        </div>
        <div className="card p-5">
          <p className="eyebrow">Streak</p>
          <p className="mt-2 flex items-center gap-2">
            <span className={game.streak > 0 ? "text-[var(--ember)]" : "text-[var(--faint)]"}>
              <Icon name="flame" size={30} fill={game.streak > 0 ? "currentColor" : "none"} />
            </span>
            <span className="font-display text-5xl leading-none tabular-nums">{game.streak}</span>
          </p>
          <p className="mt-4 text-xs text-[var(--muted)]">
            Best {game.best} {game.best === 1 ? "day" : "days"} ·{" "}
            {game.today > 0 ? "today is done" : "solve one today to extend it"}
          </p>
        </div>
        <div className="card p-5">
          <p className="eyebrow">Solved</p>
          <p className="mt-2 font-display text-5xl leading-none tabular-nums">{game.solved}</p>
          <p className="mt-4 text-xs text-[var(--muted)]">Problems finished in this browser.</p>
        </div>
        <div className="card p-5">
          <p className="eyebrow">Badges</p>
          <p className="mt-2 font-display text-5xl leading-none tabular-nums">
            {earned.length}
            <span className="text-2xl text-[var(--faint)]">/{BADGES.length}</span>
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {earned.length === 0 && <span className="text-xs text-[var(--muted)]">Solve a problem to earn your first.</span>}
            {earned.slice(0, 8).map((b) => (
              <span
                key={b.id}
                title={`${b.name} — ${b.desc}`}
                className="grid h-7 w-7 place-items-center rounded-lg"
                style={{ background: `${TONE[b.tone]}22`, color: TONE[b.tone] }}
              >
                <Icon name={b.icon} size={14} />
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="eyebrow">Activity</p>
            <h2 className="mt-1 font-display text-xl">Last 26 weeks</h2>
          </div>
          <p className="text-xs text-[var(--muted)]">
            {activeDays} active {activeDays === 1 ? "day" : "days"} · don&rsquo;t break the chain
          </p>
        </div>
        <div className="mt-5">
          <Heatmap cells={game.heat} />
        </div>
      </section>

      {data?.readiness && (
        <section className="grid gap-4 md:grid-cols-3">
          <div className="card p-6 md:col-span-1">
            <div className="text-sm text-[var(--muted)]">Readiness score</div>
            <div className="mt-2 font-display text-5xl tabular-nums text-[var(--accent)]">{data.readiness.score}</div>
            <div className="mt-2 text-sm text-[var(--ink)]">{data.readiness.label}</div>
          </div>
          <div className="card p-6 md:col-span-2">
            <h2 className="font-display text-xl">This week&apos;s plan</h2>
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
        <section className="card p-6">
          <h2 className="font-display text-xl">HackerRank · @{data.hackerrank.username}</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {data.hackerrank.name} · level {data.hackerrank.level ?? "—"} · recent challenges {data.hackerrank.recent.length}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {data.hackerrank.scores
              .filter((s) => s.slug === "cpp" || s.slug === "algorithms" || s.slug === "data-structures")
              .map((s) => (
                <span key={s.slug} className="chip !h-7">
                  {s.name} · score {s.practiceScore}
                </span>
              ))}
          </div>
          <Link className="btn btn-quiet btn-sm mt-3 !px-0 !text-[var(--accent)]" href="/learn/dsa/hackerrank">
            Open HackerRank lessons <Icon name="arrowRight" size={13} />
          </Link>
        </section>
      )}

      {data?.profile && (
        <section className="card p-6">
          <h2 className="font-display text-xl">LeetCode · @{data.profile.username}</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Solved {data.profile.solved.all} (Easy {data.profile.solved.easy} / Medium {data.profile.solved.medium} / Hard{" "}
            {data.profile.solved.hard})
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {data.profile.tags.slice(0, 12).map((t) => (
              <span key={t.name} className="chip !h-7">
                {t.name} · {t.count}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="card p-6">
        <h2 className="font-display text-xl">Local problem status</h2>
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
