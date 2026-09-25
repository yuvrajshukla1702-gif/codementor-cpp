import type { LcProfile } from "./leetcode";

export type Readiness = {
  score: number;
  label: string;
  gaps: string[];
  weeklyFocus: string[];
  notes: string[];
};

const TARGET_TOPICS = [
  "Array",
  "Hash Table",
  "Two Pointers",
  "Sliding Window",
  "String",
  "Linked List",
  "Stack",
  "Queue",
  "Tree",
  "Binary Search",
  "Heap",
  "Graph",
  "Dynamic Programming",
  "Backtracking",
];

export function computeReadiness(profile: LcProfile | null, localSolved: number): Readiness {
  const lcAll = profile?.solved.all ?? 0;
  const medium = profile?.solved.medium ?? 0;
  const hard = profile?.solved.hard ?? 0;
  const tagMap = new Map((profile?.tags || []).map((t) => [t.name, t.count]));

  let score = 0;
  score += Math.min(35, lcAll * 1.5);
  score += Math.min(25, medium * 2.5);
  score += Math.min(15, hard * 5);
  score += Math.min(15, localSolved * 1.2);
  const covered = TARGET_TOPICS.filter((t) => (tagMap.get(t) || 0) > 0).length;
  score += Math.min(10, covered);
  score = Math.round(Math.min(100, score));

  const gaps = TARGET_TOPICS.filter((t) => (tagMap.get(t) || 0) < 3);
  const weeklyFocus: string[] = [];
  if ((tagMap.get("String") || 0) < 3) weeklyFocus.push("Strings + Sliding Window drills");
  if ((tagMap.get("Linked List") || 0) < 2) weeklyFocus.push("Linked List fundamentals");
  if ((tagMap.get("Tree") || 0) < 2) weeklyFocus.push("Binary Tree BFS/DFS");
  if (medium < 40) weeklyFocus.push("Push Medium LC volume (aim +5 this week)");
  weeklyFocus.push("TCS NQT aptitude x3");
  weeklyFocus.push("Core CS (OOPs/DBMS) x2 short answers");

  while (weeklyFocus.length < 5) {
    weeklyFocus.push("Continue Learn DSA path in order");
    break;
  }

  const label =
    score >= 75 ? "Interview-competitive trajectory" : score >= 45 ? "Building — stay consistent" : "Foundation — protect daily streak";

  const notes = [
    `LeetCode mirrored: ${lcAll} solved (E${profile?.solved.easy ?? 0}/M${medium}/H${hard}).`,
    `Local CodeMentor solves counted: ${localSolved}.`,
    "2027 plan: foundation → 150+ LC with breadth → contests → company mocks.",
  ];

  return { score, label, gaps: gaps.slice(0, 8), weeklyFocus: weeklyFocus.slice(0, 6), notes };
}
