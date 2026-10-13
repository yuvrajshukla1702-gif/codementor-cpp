"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Icon } from "./ui/icons";
import { Bar } from "./ui/kit";
import { REWARD_EVENT, type BadgeTone, type RewardEvent } from "@/lib/gamify";

type RewardEventDetail = RewardEvent;

type Bit = { id: number; dx: number; dy: number; rot: number; dur: number; color: string; delay: number };

const CONFETTI = ["#c8f65d", "#ffd166", "#ff7a45", "#7cc4ff", "#ffffff"];

function makeConfetti(): Bit[] {
  return Array.from({ length: 34 }, (_, id) => {
    const angle = (-Math.PI / 2) + (Math.random() - 0.5) * Math.PI * 1.15;
    const dist = 140 + Math.random() * 260;
    return {
      id,
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist + 180 + Math.random() * 120,
      rot: (Math.random() - 0.5) * 900,
      dur: 1.1 + Math.random() * 0.9,
      color: CONFETTI[id % CONFETTI.length],
      delay: Math.random() * 0.12,
    };
  });
}

function useCountUp(target: number, ms = 700) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / ms);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

const TONE: Record<BadgeTone, string> = {
  lime: "var(--accent)",
  gold: "var(--gold)",
  ember: "var(--ember)",
  sky: "var(--accent-2)",
  rose: "var(--hard)",
};

export function RewardLayer() {
  const [reward, setReward] = useState<RewardEventDetail | null>(null);
  const [bits, setBits] = useState<Bit[]>([]);
  const [seq, setSeq] = useState(0);

  useEffect(() => {
    function onReward(e: Event) {
      const d = (e as CustomEvent<RewardEventDetail>).detail;
      setReward(d);
      setSeq((s) => s + 1);
      setBits(d.repeat ? [] : makeConfetti());
    }
    window.addEventListener(REWARD_EVENT, onReward);
    return () => window.removeEventListener(REWARD_EVENT, onReward);
  }, []);

  const close = useCallback(() => setReward(null), []);

  useEffect(() => {
    if (!reward) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    // Replays are quiet: they auto-dismiss.
    const timer = reward.repeat ? window.setTimeout(close, 7000) : 0;
    return () => {
      window.removeEventListener("keydown", onKey);
      if (timer) window.clearTimeout(timer);
    };
  }, [reward, close]);

  if (!reward) return null;
  if (reward.repeat) return <ReplayToast key={seq} reward={reward} onClose={close} />;
  return <Celebration key={seq} reward={reward} bits={bits} onClose={close} />;
}

function ReplayToast({ reward, onClose }: { reward: RewardEventDetail; onClose: () => void }) {
  return (
    <div className="cm-reward-in fixed bottom-5 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-[var(--accent-line)] bg-[var(--panel)] py-2.5 pl-3 pr-2 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)]">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--accent)] text-[var(--accent-ink)]">
        <Icon name="check" size={16} strokeWidth={2.6} />
      </span>
      <div className="text-sm">
        <p className="font-semibold text-[var(--ink)]">Accepted again</p>
        <p className="text-xs text-[var(--muted)]">XP is awarded once per problem. Great for revision.</p>
      </div>
      {reward.next && (
        <Link href={`/practice/${reward.next.id}`} onClick={onClose} className="btn btn-primary btn-sm ml-1">
          Next <Icon name="arrowRight" size={13} />
        </Link>
      )}
      <button type="button" onClick={onClose} aria-label="Dismiss" className="btn btn-quiet btn-sm !px-2">
        <Icon name="x" size={14} />
      </button>
    </div>
  );
}

function Celebration({ reward, bits, onClose }: { reward: RewardEventDetail; bits: Bit[]; onClose: () => void }) {
  const xpShown = useCountUp(reward.gained);
  const [pct, setPct] = useState(reward.fromPct);

  useEffect(() => {
    const id = requestAnimationFrame(() => setPct(reward.toPct));
    return () => cancelAnimationFrame(id);
  }, [reward.toPct]);

  const next = reward.next;

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label="Problem solved">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[3px]" onMouseDown={onClose} />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {bits.map((b) => (
          <span
            key={b.id}
            className="cm-confetti"
            style={
              {
                background: b.color,
                animationDelay: `${b.delay}s`,
                "--dx": `${b.dx}px`,
                "--dy": `${b.dy}px`,
                "--rot": `${b.rot}deg`,
                "--dur": `${b.dur}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className="cm-reward-in relative w-full max-w-md overflow-hidden rounded-3xl border border-[var(--accent-line)] bg-[var(--panel)] shadow-[0_50px_140px_-30px_rgba(200,246,93,0.35)]">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-48"
          style={{ background: "radial-gradient(ellipse 70% 100% at 50% 0%, rgba(200,246,93,0.16), transparent 70%)" }}
        />
        <div className="relative px-6 pb-6 pt-8 text-center">
          <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-full bg-[var(--accent)] text-[var(--accent-ink)]">
            <span className="cm-ring absolute inset-0 rounded-full border-2 border-[var(--accent)]" />
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path className="cm-check-draw" d="M20 6 9 17l-5-5" />
            </svg>
          </div>

          <p className="eyebrow mt-5 !text-[var(--accent)]">Accepted</p>
          <h2 className="mt-1 text-2xl font-semibold text-[var(--ink)]">{reward.title ?? "Problem solved"}</h2>

          <div className="mt-4 flex items-end justify-center gap-2">
            <span className="font-display text-6xl leading-none tabular-nums text-[var(--gold)]">+{xpShown}</span>
            <span className="pb-1.5 text-sm font-semibold text-[var(--muted)]">XP</span>
          </div>

          {reward.parts.length > 1 && (
            <ul className="mx-auto mt-3 max-w-[16rem] space-y-1 text-left text-xs text-[var(--muted)]">
              {reward.parts.map((p) => (
                <li key={p.label} className="flex items-center justify-between">
                  <span>{p.label}</span>
                  <span className="tabular-nums text-[var(--ink)]">+{p.xp}</span>
                </li>
              ))}
            </ul>
          )}

          {(reward.leveledUp || reward.rankUp) && (
            <div className="cm-pop mt-4 inline-flex items-center gap-2 rounded-full border border-[rgba(255,209,102,0.45)] bg-[rgba(255,209,102,0.1)] px-3 py-1 text-xs font-semibold text-[var(--gold)]">
              <Icon name="sparkles" size={13} />
              {reward.leveledUp ? `Level up · Lv ${reward.level}` : ""}
              {reward.leveledUp && reward.rankUp ? " · " : ""}
              {reward.rankUp ? `New rank: ${reward.rank}` : ""}
            </div>
          )}

          <div className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3 text-left">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[var(--ink)]">
                Level {reward.level} · {reward.rank}
              </span>
              <span className="tabular-nums text-[var(--muted)]">
                {reward.xp} / {reward.levelEnd} XP
              </span>
            </div>
            <div className="mt-2">
              <Bar value={pct} color="linear-gradient(90deg, var(--gold), var(--accent))" height={8} />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            {reward.streak > 0 && (
              <span
                className={`chip ${reward.streakExtended ? "!border-[rgba(255,122,69,0.45)] !bg-[rgba(255,122,69,0.1)] !text-[var(--ember)]" : ""}`}
              >
                <Icon name="flame" size={12} fill={reward.streakExtended ? "currentColor" : "none"} />
                {reward.streak}-day streak{reward.streakExtended ? " +1" : ""}
              </span>
            )}
            <span className={`chip ${reward.goalJustMet ? "chip-brand" : ""}`}>
              <Icon name={reward.today >= reward.goal ? "check" : "target"} size={12} />
              Daily goal {Math.min(reward.today, reward.goal)}/{reward.goal}
            </span>
            <span className="chip">{reward.solved} solved</span>
          </div>

          {reward.badges.length > 0 && (
            <div className="mt-4 space-y-2">
              {reward.badges.map((b) => (
                <div
                  key={b.id}
                  className="cm-pop flex items-center gap-3 rounded-2xl border border-[var(--line-strong)] bg-[var(--panel-2)] p-2.5 text-left"
                  style={{ boxShadow: `0 0 0 1px ${TONE[b.tone]}33 inset` }}
                >
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                    style={{ background: `${TONE[b.tone]}22`, color: TONE[b.tone] }}
                  >
                    <Icon name={b.icon} size={20} />
                  </span>
                  <span className="min-w-0">
                    <span className="eyebrow !text-[10px]" style={{ color: TONE[b.tone] }}>
                      Badge unlocked
                    </span>
                    <span className="block truncate text-sm font-semibold text-[var(--ink)]">{b.name}</span>
                    <span className="block truncate text-xs text-[var(--muted)]">{b.desc}</span>
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
            {next ? (
              <Link href={`/practice/${next.id}`} onClick={onClose} autoFocus className="btn btn-primary !h-11 flex-1 !text-sm">
                Next: {next.title} <Icon name="arrowRight" size={15} />
              </Link>
            ) : (
              <Link href="/practice" onClick={onClose} autoFocus className="btn btn-primary !h-11 flex-1 !text-sm">
                Browse problems <Icon name="arrowRight" size={15} />
              </Link>
            )}
            <button type="button" onClick={onClose} className="btn !h-11 flex-1 !text-sm">
              Stay here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
