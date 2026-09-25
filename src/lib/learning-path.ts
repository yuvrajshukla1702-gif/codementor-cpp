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

export function loadDoneIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_DONE) || "[]");
  } catch {
    return [];
  }
}

export function markDone(id: string) {
  if (typeof window === "undefined") return;
  const done = new Set(loadDoneIds());
  done.add(id);
  window.localStorage.setItem(STORAGE_DONE, JSON.stringify([...done]));
  bumpStreak();
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function bumpStreak() {
  const today = todayKey();
  const last = window.localStorage.getItem(STORAGE_LAST) || "";
  let streak = Number(window.localStorage.getItem(STORAGE_STREAK) || 0);
  if (last === today) return;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = yesterday.toISOString().slice(0, 10);
  streak = last === yKey ? streak + 1 : 1;
  window.localStorage.setItem(STORAGE_STREAK, String(streak));
  window.localStorage.setItem(STORAGE_LAST, today);
}

export function loadStreak(): number {
  if (typeof window === "undefined") return 0;
  return Number(window.localStorage.getItem(STORAGE_STREAK) || 0);
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
