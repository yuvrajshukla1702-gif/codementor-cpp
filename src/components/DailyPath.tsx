"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { LEARNING_SPINE, nextPathItems } from "@/lib/learning-path";
import {
  BADGES,
  badgeDef,
  markDoneManually,
  setDailyGoal,
  useGame,
  type BadgeDef,
  type BadgeTone,
  type Difficulty,
} from "@/lib/gamify";
import { Icon } from "./ui/icons";
import { Bar, Pips, Ring } from "./ui/kit";

export type SpineMeta = Record<string, { title: string; difficulty: Difficulty; topic: string }>;

const TONE: Record<BadgeTone, string> = {
  lime: "#c8f65d",
  gold: "#ffd166",
  ember: "#ff7a45",
  sky: "#7cc4ff",
  rose: "#ff6b81",
};

export function DailyPath({ meta }: { meta: SpineMeta }) {
  const game = useGame();
  const next = nextPathItems(game.done, 1)[0];
  const nextMeta = next ? meta[next.id] : undefined;
  const doneSet = new Set(game.done);
  const spineDone = LEARNING_SPINE.filter((s) => doneSet.has(s.id)).length;
  const total = LEARNING_SPINE.length;
  const pct = Math.round((spineDone / total) * 100);
  const started = game.ready && game.solved > 0;
  const atRisk = game.ready && game.streak > 0 && game.today === 0;
  const goalPct = game.goal ? game.today / game.goal : 0;

  const earnedTopics = game.badges.map(badgeDef).filter((b): b is BadgeDef => !!b && b.id.startsWith("topic:"));
  const shelf = [...BADGES, ...earnedTopics];
  const earnedCount = shelf.filter((b) => game.badges.includes(b.id)).length;

  return (
    <section className="relative border-t border-[var(--line)] bg-[var(--bg-2)] px-5 py-16 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Mission control</p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">
              One problem a day <span className="font-serif-accent text-[var(--accent)]">compounds</span>.
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-[var(--muted)]">
            Solve to earn XP, grow your streak and unlock badges. XP is only awarded for solves the judge verifies.
          </p>
        </div>

        {atRisk && (
          <div className="cm-fade mt-6 flex items-center gap-3 rounded-2xl border border-[rgba(255,122,69,0.4)] bg-[rgba(255,122,69,0.08)] px-4 py-3 text-sm">
            <span className="cm-pulse text-[var(--ember)]">
              <Icon name="flame" size={20} fill="currentColor" />
            </span>
            <p className="text-[var(--ink)]">
              Your <b className="text-[var(--ember)]">{game.streak}-day streak</b> ends tonight. One problem keeps it alive.
            </p>
            {next && (
              <Link href={`/practice/${next.id}`} className="btn btn-sm ml-auto !border-[rgba(255,122,69,0.5)] !text-[var(--ember)]">
                Save it
              </Link>
            )}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
          {/* ── Mission ── */}
          <div className="card relative overflow-hidden p-6 sm:p-7">
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(200,246,93,0.10), transparent 65%)" }}
            />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="eyebrow !text-[var(--accent)]">{started ? "Up next" : "Your first mission"}</p>
                {next ? (
                  <>
                    <Link
                      href={`/practice/${next.id}`}
                      className="mt-2 block font-display text-3xl leading-tight transition-colors hover:text-[var(--accent)]"
                    >
                      {nextMeta?.title ?? next.title}
                    </Link>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {nextMeta && (
                        <>
                          <span className="chip">
                            <Pips difficulty={nextMeta.difficulty} label />
                          </span>
                          <span className="chip">{nextMeta.topic}</span>
                        </>
                      )}
                      <span className="chip">
                        <Icon name="timer" size={12} /> ~15 min
                      </span>
                    </div>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--muted)]">
                      {started
                        ? "Watch the lesson, follow the code walk, then write it yourself."
                        : "A teacher explains it, you write it, a real C++ judge checks it. About fifteen minutes."}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <Link href={`/practice/${next.id}`} className="btn btn-primary">
                        Start <Icon name="arrowRight" size={15} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => markDoneManually(next.id)}
                        className="btn btn-quiet"
                        title="Marks it done on your path and counts toward your streak. XP needs a judge-verified solve."
                      >
                        Mark done
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mt-2 font-display text-3xl leading-tight">Spine complete.</p>
                    <p className="mt-3 max-w-md text-sm text-[var(--muted)]">
                      You cleared the whole guided path. Pick any problem — the streak keeps counting.
                    </p>
                    <Link href="/practice" className="btn btn-primary mt-5">
                      Browse problems <Icon name="arrowRight" size={15} />
                    </Link>
                  </>
                )}
              </div>

              <div className="flex shrink-0 flex-col items-center gap-3 sm:items-end">
                <Ring value={goalPct} size={92} stroke={7} color={game.goalMet ? "var(--accent)" : "var(--gold)"}>
                  <div className="text-center leading-none">
                    {game.goalMet ? (
                      <Icon name="check" size={26} strokeWidth={2.6} className="mx-auto text-[var(--accent)]" />
                    ) : (
                      <span className="font-display text-xl tabular-nums">
                        {Math.min(game.today, game.goal)}/{game.goal}
                      </span>
                    )}
                    <span className="mt-1 block text-[10px] text-[var(--muted)]">today</span>
                  </div>
                </Ring>
                <div className="flex items-center gap-1" role="group" aria-label="Daily goal">
                  <span className="mr-1 text-[11px] text-[var(--muted)]">Goal</span>
                  {[1, 2, 3].map((g) => (
                    <button
                      key={g}
                      type="button"
                      aria-pressed={game.goal === g}
                      onClick={() => setDailyGoal(g)}
                      className={`grid h-6 w-6 place-items-center rounded-md text-[11px] font-semibold transition-colors ${
                        game.goal === g
                          ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                          : "border border-[var(--line-strong)] text-[var(--muted)] hover:text-[var(--ink)]"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-5">
              <div className="flex items-center gap-2 text-sm">
                <span className={game.streak > 0 ? "text-[var(--ember)]" : "text-[var(--faint)]"}>
                  <Icon name="flame" size={20} fill={game.streak > 0 ? "currentColor" : "none"} />
                </span>
                <span className="font-display text-xl tabular-nums">{game.streak}</span>
                <span className="text-[var(--muted)]">day streak</span>
                <span className="text-xs text-[var(--faint)]">· best {game.best}</span>
              </div>
              <div className="flex gap-2.5">
                {game.week.map((d) => (
                  <div key={d.key} className="flex flex-col items-center gap-1">
                    <span
                      className={`grid h-7 w-7 place-items-center rounded-full text-[var(--accent-ink)] ${
                        d.count > 0
                          ? "bg-[var(--accent)]"
                          : d.today
                            ? "border border-[var(--accent-line)]"
                            : "border border-[var(--line-strong)]"
                      }`}
                    >
                      {d.count > 0 && <Icon name="check" size={13} strokeWidth={3} />}
                    </span>
                    <span className={`text-[10px] ${d.today ? "font-semibold text-[var(--ink)]" : "text-[var(--faint)]"}`}>
                      {d.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Level ── */}
          <div className="card flex flex-col justify-between p-6 sm:p-7">
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="eyebrow">Level</p>
                <Link
                  href="/progress"
                  className="inline-flex items-center gap-1 text-xs text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
                >
                  Full progress <Icon name="arrowRight" size={12} />
                </Link>
              </div>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="font-display text-6xl leading-none tabular-nums text-[var(--gold)]">{game.level}</span>
                <span className="font-serif-accent text-2xl text-[var(--ink)]">{game.rank}</span>
              </div>
              <div className="mt-5">
                <Bar value={game.levelPct} color="linear-gradient(90deg, var(--gold), var(--accent))" height={8} />
              </div>
              <p className="mt-2 flex justify-between text-xs text-[var(--muted)]">
                <span className="tabular-nums">{game.xp} XP</span>
                <span>
                  {game.levelEnd - game.xp} XP to Lv {game.level + 1}
                </span>
              </p>
            </div>
            <dl className="mt-6 grid grid-cols-3 gap-3">
              {[
                { k: "Solved", v: game.solved },
                { k: "Best streak", v: game.best },
                { k: "Badges", v: earnedCount },
              ].map((s) => (
                <div key={s.k} className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5">
                  <dd className="font-display text-2xl leading-none tabular-nums">{s.v}</dd>
                  <dt className="mt-1 text-[11px] text-[var(--muted)]">{s.k}</dt>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-xs leading-relaxed text-[var(--faint)]">
              Easy +10 · Medium +25 · Hard +50. Bonuses for daily streaks and sub-5-minute solves.
            </p>
          </div>
        </div>

        {/* ── Journey ── */}
        <div className="card mt-4 p-6 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Your path</p>
              <h3 className="mt-1 font-display text-xl">
                The spine <span className="text-[var(--muted)]">· {spineDone}/{total}</span>
              </h3>
            </div>
            <div className="w-40 sm:w-64">
              <Bar value={pct} />
            </div>
          </div>
          <div
            className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(42px,1fr))] gap-2 lg:[grid-template-columns:repeat(var(--n),minmax(0,1fr))]"
            style={{ "--n": total } as CSSProperties}
          >
            {LEARNING_SPINE.map((s, i) => {
              const done = doneSet.has(s.id);
              const isNext = next?.id === s.id;
              return (
                <Link
                  key={s.id}
                  href={`/practice/${s.id}`}
                  title={`${i + 1}. ${meta[s.id]?.title ?? s.title}${done ? " — done" : ""}`}
                  className={`grid h-10 place-items-center rounded-xl text-xs font-semibold transition-transform hover:-translate-y-0.5 ${
                    done
                      ? "border border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent)]"
                      : isNext
                        ? "cm-node-pulse bg-[var(--accent)] font-bold text-[var(--accent-ink)]"
                        : "border border-[var(--line-strong)] text-[var(--faint)] hover:text-[var(--ink)]"
                  }`}
                >
                  {done ? <Icon name="check" size={15} strokeWidth={2.6} /> : i + 1}
                </Link>
              );
            })}
          </div>
          {next && (
            <p className="mt-4 text-xs text-[var(--muted)]">
              Next stop: <span className="text-[var(--ink)]">{nextMeta?.title ?? next.title}</span>
            </p>
          )}
        </div>

        {/* ── Badges ── */}
        <div className="card mt-4 p-6 sm:p-7">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Badges</p>
              <h3 className="mt-1 font-display text-xl">Collect them all</h3>
            </div>
            <span className="chip tabular-nums">
              {earnedCount}/{shelf.length}
            </span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {shelf.map((b) => {
              const earned = game.badges.includes(b.id);
              const tone = TONE[b.tone];
              return (
                <div
                  key={b.id}
                  className={`rounded-2xl border p-3.5 transition-colors ${
                    earned ? "border-[var(--line-strong)] bg-[var(--panel-2)]" : "border-dashed border-[var(--line)] opacity-60"
                  }`}
                  style={earned ? { boxShadow: `inset 0 0 0 1px ${tone}22` } : undefined}
                >
                  <span
                    className="grid h-10 w-10 place-items-center rounded-xl"
                    style={{
                      background: earned ? `${tone}22` : "var(--panel-2)",
                      color: earned ? tone : "var(--faint)",
                    }}
                  >
                    <Icon name={earned ? b.icon : "lock"} size={20} />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-[var(--ink)]">{b.name}</p>
                  <p className="mt-0.5 text-xs leading-snug text-[var(--muted)]">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
