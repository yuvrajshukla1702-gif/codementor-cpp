import type { Problem } from "./types";

export type PathItem = {
  id: string;
  title: string;
  reason: string;
};

export const LEARNING_SPINE: { id: string; title: string }[] = [
  { id: "two-sum", title: "Two Sum" },
  { id: "contains-duplicate", title: "Contains Duplicate" },
  { id: "best-time-stock", title: "Best Time to Buy and Sell Stock" },
  { id: "move-zeroes", title: "Move Zeroes" },
  { id: "valid-palindrome", title: "Valid Palindrome" },
  { id: "maximum-subarray", title: "Maximum Subarray" },
  { id: "plus-one", title: "Plus One" },
  { id: "rotate-array", title: "Rotate Array" },
  { id: "intersection-two-arrays-ii", title: "Intersection of Two Arrays II" },
  { id: "group-anagrams", title: "Group Anagrams" },
  { id: "two-sum-ii", title: "Two Sum II" },
  { id: "container-most-water", title: "Container With Most Water" },
  { id: "three-sum", title: "3Sum" },
  { id: "longest-substr-no-repeat", title: "Longest Substring Without Repeating" },
  { id: "binary-search", title: "Binary Search" },
  { id: "valid-parentheses", title: "Valid Parentheses" },
  { id: "reverse-linked-list", title: "Reverse Linked List" },
  { id: "invert-binary-tree", title: "Invert Binary Tree" },
  { id: "climb-stairs", title: "Climbing Stairs" },
  { id: "house-robber", title: "House Robber" },
  { id: "coin-change", title: "Coin Change" },
  { id: "hr-simple-array-sum", title: "Simple Array Sum" },
  { id: "hr-sock-merchant", title: "Sales by Match" },
];

const STORAGE_DONE = "cm-path-done";
const STORAGE_STREAK = "cm-path-streak";
const STORAGE_LAST = "cm-path-last-day";
const STORAGE_BEST = "cm-path-best";

/** Fired on window whenever progress changes so every subscriber can refresh. */
export const STATE_EVENT = "cm:state";

/** Local calendar day (not UTC) so a streak rolls over at the learner's midnight. */
export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dayKey(d);
}

function lsGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function lsSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage full or blocked */
  }
}

export function loadDoneIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(lsGet(STORAGE_DONE) || "[]");
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export type MarkResult = { firstTime: boolean; streak: number; streakExtended: boolean };

export function markDone(id: string): MarkResult {
  if (typeof window === "undefined") return { firstTime: false, streak: 0, streakExtended: false };
  const done = new Set(loadDoneIds());
  const firstTime = !done.has(id);
  done.add(id);
  lsSet(STORAGE_DONE, JSON.stringify([...done]));
  const bumped = bumpStreak();
  window.dispatchEvent(new Event(STATE_EVENT));
  return { firstTime, streak: bumped.streak, streakExtended: bumped.extended };
}

function bumpStreak(): { streak: number; extended: boolean } {
  const today = dayKey();
  const last = lsGet(STORAGE_LAST) || "";
  let streak = Number(lsGet(STORAGE_STREAK) || 0);
  if (last === today) return { streak: Math.max(streak, 1), extended: false };
  streak = last === yesterdayKey() ? streak + 1 : 1;
  lsSet(STORAGE_STREAK, String(streak));
  lsSet(STORAGE_LAST, today);
  const best = Number(lsGet(STORAGE_BEST) || 0);
  if (streak > best) lsSet(STORAGE_BEST, String(streak));
  return { streak, extended: true };
}

/** Current streak. A streak with no activity today or yesterday is already broken. */
export function loadStreak(): number {
  if (typeof window === "undefined") return 0;
  const last = lsGet(STORAGE_LAST) || "";
  if (last !== dayKey() && last !== yesterdayKey()) return 0;
  return Number(lsGet(STORAGE_STREAK) || 0);
}

export function loadBestStreak(): number {
  if (typeof window === "undefined") return 0;
  return Math.max(Number(lsGet(STORAGE_BEST) || 0), loadStreak());
}

/** True when today has no activity yet but yesterday's streak is still alive. */
export function streakAtRisk(): boolean {
  if (typeof window === "undefined") return false;
  const last = lsGet(STORAGE_LAST) || "";
  return last === yesterdayKey() && Number(lsGet(STORAGE_STREAK) || 0) > 0;
}

export function nextPathItems(doneIds: string[], limit = 3): PathItem[] {
  const done = new Set(doneIds);
  const out: PathItem[] = [];
  for (const item of LEARNING_SPINE) {
    if (done.has(item.id)) continue;
    out.push({
      id: item.id,
      title: item.title,
      reason: out.length === 0 ? "Do this next" : "Up next",
    });
    if (out.length >= limit) break;
  }
  return out;
}

export function dailySet(doneIds: string[]): PathItem[] {
  const next = nextPathItems(doneIds, 1)[0];
  const review = LEARNING_SPINE.filter((x) => doneIds.includes(x.id)).slice(-1)[0];
  const items: PathItem[] = [];
  if (next) items.push(next);
  if (review) items.push({ id: review.id, title: review.title, reason: "Quick review" });
  if (items.length < 2) items.push(...nextPathItems(doneIds, 3).slice(1));
  return items.slice(0, 3);
}

export function enrichWithProblems(
  items: PathItem[],
  getProblem: (id: string) => Problem | undefined
) {
  return items.map((it) => {
    const p = getProblem(it.id);
    return p ? { ...it, title: p.title } : it;
  });
}
