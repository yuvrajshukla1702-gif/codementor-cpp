import { useSyncExternalStore } from "react";
import type { IconName } from "@/components/ui/icons";
import {
  dayKey,
  loadBestStreak,
  loadDoneIds,
  loadStreak,
  markDone,
  STATE_EVENT,
} from "./learning-path";

/* ───────────────────────── Static rules ───────────────────────── */

export type Difficulty = "Easy" | "Medium" | "Hard";

export const BASE_XP: Record<Difficulty, number> = { Easy: 10, Medium: 25, Hard: 50 };
const SPEEDRUN_SEC = 300;
const DEFAULT_GOAL = 1;

/** XP needed to *reach* a level. L1 = 0, L2 = 50, L3 = 150, L4 = 300 … */
export const xpForLevel = (level: number) => 25 * level * (level - 1);

export function levelFor(xp: number): number {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level++;
  return level;
}

const RANKS: { min: number; name: string }[] = [
  { min: 1, name: "Rookie" },
  { min: 3, name: "Apprentice" },
  { min: 5, name: "Builder" },
  { min: 8, name: "Specialist" },
  { min: 12, name: "Architect" },
  { min: 17, name: "Grandmaster" },
];

export function rankFor(level: number): string {
  let name = RANKS[0].name;
  for (const r of RANKS) if (level >= r.min) name = r.name;
  return name;
}

export type BadgeTone = "lime" | "gold" | "ember" | "sky" | "rose";
export type BadgeDef = { id: string; name: string; desc: string; icon: IconName; tone: BadgeTone };

export const BADGES: BadgeDef[] = [
  { id: "first-blood", name: "First Blood", desc: "Solve your first problem", icon: "bolt", tone: "lime" },
  { id: "on-fire", name: "On Fire", desc: "Reach a 3-day streak", icon: "flame", tone: "ember" },
  { id: "ten-down", name: "Ten Down", desc: "Solve 10 problems", icon: "target", tone: "sky" },
  { id: "week-warrior", name: "Week Warrior", desc: "Reach a 7-day streak", icon: "flame", tone: "gold" },
  { id: "speedrunner", name: "Speedrunner", desc: "Solve in under 5 minutes", icon: "timer", tone: "lime" },
  { id: "hard-mode", name: "Hard Mode", desc: "Solve a Hard problem", icon: "trophy", tone: "rose" },
  { id: "quarter", name: "Quarter Century", desc: "Solve 25 problems", icon: "medal", tone: "gold" },
  { id: "level-5", name: "Builder", desc: "Reach level 5", icon: "sparkles", tone: "sky" },
];

const TOPIC_NAMES: Record<string, string> = {
  dp: "Dynamic Programming",
  hackerrank: "HackerRank",
};

export function badgeDef(id: string): BadgeDef | undefined {
  const fixed = BADGES.find((b) => b.id === id);
  if (fixed) return fixed;
  if (id.startsWith("topic:")) {
    const topic = id.slice(6);
    const pretty =
      TOPIC_NAMES[topic] ??
      topic
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    return { id, name: `${pretty} Master`, desc: `Cleared every ${pretty} problem`, icon: "medal", tone: "gold" };
  }
  return undefined;
}

/* ───────────────────────── Persistence ───────────────────────── */

const K = {
  xp: "cm-xp",
  xpIds: "cm-xp-ids",
  days: "cm-days",
  todayIds: "cm-today-ids",
  badges: "cm-badges",
  goal: "cm-goal",
} as const;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function readNumber(key: string, fallback = 0): number {
  try {
    const n = Number(window.localStorage.getItem(key));
    return Number.isFinite(n) && n > 0 ? n : fallback;
  } catch {
    return fallback;
  }
}

/* ───────────────────────── Snapshot (useSyncExternalStore) ───────────────────────── */

export type WeekDay = { key: string; label: string; count: number; today: boolean };

/** One cell of the 26-week activity heatmap. `dow` is 0 (Sun) – 6 (Sat). */
export type HeatCell = { key: string; count: number; dow: number };

export type Game = {
  ready: boolean;
  xp: number;
  level: number;
  rank: string;
  levelStart: number;
  levelEnd: number;
  levelPct: number;
  streak: number;
  best: number;
  today: number;
  goal: number;
  goalMet: boolean;
  done: string[];
  solved: number;
  week: WeekDay[];
  heat: HeatCell[];
  badges: string[];
};

const EMPTY_WEEK: WeekDay[] = Array.from({ length: 7 }, (_, i) => ({
  key: `s${i}`,
  label: "·",
  count: 0,
  today: i === 6,
}));

const HEAT_DAYS = 26 * 7;
const EMPTY_HEAT: HeatCell[] = Array.from({ length: HEAT_DAYS }, (_, i) => ({
  key: `h${i}`,
  count: 0,
  dow: i % 7,
}));

const SERVER: Game = {
  ready: false,
  xp: 0,
  level: 1,
  rank: "Rookie",
  levelStart: 0,
  levelEnd: xpForLevel(2),
  levelPct: 0,
  streak: 0,
  best: 0,
  today: 0,
  goal: DEFAULT_GOAL,
  goalMet: false,
  done: [],
  solved: 0,
  week: EMPTY_WEEK,
  heat: EMPTY_HEAT,
  badges: [],
};

const WEEKDAY = ["S", "M", "T", "W", "T", "F", "S"];

function levelStats(xp: number) {
  const level = levelFor(xp);
  const levelStart = xpForLevel(level);
  const levelEnd = xpForLevel(level + 1);
  const levelPct = Math.max(0, Math.min(100, Math.round(((xp - levelStart) / (levelEnd - levelStart)) * 100)));
  return { level, levelStart, levelEnd, levelPct, rank: rankFor(level) };
}

function read(): Game {
  const xp = readNumber(K.xp);
  const done = loadDoneIds();
  const days = readJson<Record<string, number>>(K.days, {});
  const key = dayKey();
  const goal = readNumber(K.goal, DEFAULT_GOAL);
  const today = days[key] || 0;
  const week: WeekDay[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const k = dayKey(d);
    week.push({ key: k, label: WEEKDAY[d.getDay()], count: days[k] || 0, today: i === 0 });
  }
  const heat: HeatCell[] = [];
  for (let i = HEAT_DAYS - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const k = dayKey(d);
    heat.push({ key: k, count: days[k] || 0, dow: d.getDay() });
  }
  return {
    ready: true,
    xp,
    ...levelStats(xp),
    streak: loadStreak(),
    best: loadBestStreak(),
    today,
    goal,
    goalMet: today >= goal,
    done,
    solved: done.length,
    week,
    heat,
    badges: readJson<string[]>(K.badges, []),
  };
}

let cache: Game | null = null;
const listeners = new Set<() => void>();

function invalidate() {
  cache = null;
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (listeners.size === 1) {
    window.addEventListener("storage", invalidate);
    window.addEventListener(STATE_EVENT, invalidate);
    document.addEventListener("visibilitychange", invalidate);
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0) {
      window.removeEventListener("storage", invalidate);
      window.removeEventListener(STATE_EVENT, invalidate);
      document.removeEventListener("visibilitychange", invalidate);
    }
  };
}

function getSnapshot(): Game {
  if (!cache) cache = read();
  return cache;
}

/** Reactive player state. Server render + first paint use an empty snapshot, then hydrate from localStorage. */
export function useGame(): Game {
  return useSyncExternalStore(subscribe, getSnapshot, () => SERVER);
}

export function setDailyGoal(goal: number) {
  const g = Math.max(1, Math.min(5, Math.round(goal)));
  try {
    window.localStorage.setItem(K.goal, String(g));
  } catch {
    /* ignore */
  }
  invalidate();
}

/* ───────────────────────── Rewards ───────────────────────── */

export type SolveInput = {
  id: string;
  difficulty: Difficulty;
  topicId: string;
  topicProblemIds: string[];
  /** Seconds on the clock for a fresh attempt; omit when it isn't a clean, same-session solve. */
  elapsedSec?: number;
  /** The reference solution was loaded into the editor: half XP and no speed bonus. */
  assisted?: boolean;
};

export type RewardPart = { label: string; xp: number };

export type RewardDetail = {
  problemId: string;
  repeat: boolean;
  gained: number;
  parts: RewardPart[];
  xp: number;
  level: number;
  leveledUp: boolean;
  rank: string;
  rankUp: boolean;
  /** Percent through the level before / after, for the animated bar. */
  fromPct: number;
  toPct: number;
  levelEnd: number;
  streak: number;
  streakExtended: boolean;
  today: number;
  goal: number;
  goalJustMet: boolean;
  badges: BadgeDef[];
  solved: number;
  next?: { id: string; title: string } | null;
};

/**
 * Record a judged-accepted solve. Idempotent per problem: XP is awarded once, replays are free.
 * Updates path progress, streak, XP, daily goal and badges, then notifies subscribers.
 */
export function recordSolve(input: SolveInput): RewardDetail {
  const before = read();
  const awarded = new Set(readJson<string[]>(K.xpIds, []));
  const repeat = awarded.has(input.id);

  const mark = markDone(input.id);
  const key = dayKey();

  // Count each problem once per day toward the daily goal.
  const todayIds = readJson<{ day: string; ids: string[] }>(K.todayIds, { day: "", ids: [] });
  const ids = todayIds.day === key ? todayIds.ids : [];
  const days = readJson<Record<string, number>>(K.days, {});
  const firstToday = !days[key];
  if (!ids.includes(input.id)) {
    ids.push(input.id);
    days[key] = (days[key] || 0) + 1;
    // keep the map small: just over the 26-week heatmap window
    const keys = Object.keys(days).sort();
    while (keys.length > 200) delete days[keys.shift() as string];
    writeJson(K.days, days);
  }
  writeJson(K.todayIds, { day: key, ids });

  const parts: RewardPart[] = [];
  let gained = 0;
  const speedrun = !input.assisted && input.elapsedSec != null && input.elapsedSec <= SPEEDRUN_SEC;
  if (!repeat) {
    const base = BASE_XP[input.difficulty];
    parts.push(
      input.assisted
        ? { label: `${input.difficulty} solved · with solution`, xp: Math.round(base / 2) }
        : { label: `${input.difficulty} solved`, xp: base }
    );
    if (firstToday) parts.push({ label: "First solve today", xp: 5 });
    if (mark.streakExtended && mark.streak >= 2) {
      parts.push({ label: `${mark.streak}-day streak`, xp: Math.min(mark.streak, 7) * 2 });
    }
    if (speedrun) parts.push({ label: "Speedrun · under 5 min", xp: 10 });
    gained = parts.reduce((s, p) => s + p.xp, 0);
    awarded.add(input.id);
    writeJson(K.xpIds, [...awarded]);
    try {
      window.localStorage.setItem(K.xp, String(before.xp + gained));
    } catch {
      /* ignore */
    }
  }

  const xp = before.xp + gained;
  const after = levelStats(xp);
  const doneSet = new Set(loadDoneIds());
  const streak = loadStreak();

  // Badges
  const earned = new Set(readJson<string[]>(K.badges, []));
  const fresh: BadgeDef[] = [];
  const grant = (id: string) => {
    if (earned.has(id)) return;
    earned.add(id);
    const def = badgeDef(id);
    if (def) fresh.push(def);
  };
  if (doneSet.size >= 1) grant("first-blood");
  if (doneSet.size >= 10) grant("ten-down");
  if (doneSet.size >= 25) grant("quarter");
  if (streak >= 3) grant("on-fire");
  if (streak >= 7) grant("week-warrior");
  if (after.level >= 5) grant("level-5");
  if (!repeat && !input.assisted && input.difficulty === "Hard") grant("hard-mode");
  if (!repeat && speedrun) grant("speedrunner");
  if (input.topicProblemIds.length > 0 && input.topicProblemIds.every((pid) => doneSet.has(pid))) {
    grant(`topic:${input.topicId}`);
  }
  if (fresh.length) writeJson(K.badges, [...earned]);

  invalidate();

  const goal = readNumber(K.goal, DEFAULT_GOAL);
  const todayCount = days[key] || 0;
  return {
    problemId: input.id,
    repeat,
    gained,
    parts,
    xp,
    level: after.level,
    leveledUp: after.level > before.level,
    rank: after.rank,
    rankUp: after.rank !== before.rank,
    fromPct: before.level === after.level ? before.levelPct : 0,
    toPct: after.levelPct,
    levelEnd: after.levelEnd,
    streak,
    streakExtended: mark.streakExtended,
    today: todayCount,
    goal,
    goalJustMet: before.today < goal && todayCount >= goal,
    badges: fresh,
    solved: doneSet.size,
  };
}

/** Manual "mark done": progress + streak, but no XP (XP is reserved for judge-verified solves). */
export function markDoneManually(id: string) {
  markDone(id);
  invalidate();
}

export const REWARD_EVENT = "cm:reward";

export type RewardEvent = RewardDetail & { title?: string };

export function fireReward(detail: RewardEvent) {
  window.dispatchEvent(new CustomEvent<RewardEvent>(REWARD_EVENT, { detail }));
}
