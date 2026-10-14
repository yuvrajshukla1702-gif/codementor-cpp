import { ensureSettings, prisma } from "@/lib/db";
import { allProblems } from "@/lib/curriculum";
import { fetchLcProfile, type LcProfile } from "@/lib/leetcode";
import { fetchHrProfile, type HrProfile } from "@/lib/hackerrank";

export type SyncResult = {
  leetcode: LcProfile | null;
  hackerrank: HrProfile | null;
  errors: string[];
};

const COOLDOWN_MS = 10 * 60_000;
const BUDGET_MS = 8_000;

let last: { at: number; result: SyncResult } | null = null;
let inflight: Promise<SyncResult> | null = null;

/**
 * Pull LeetCode + HackerRank. Capped at 8s and reused for 10 minutes so a hung
 * platform cannot freeze every other page (SQLite + the Next.js server).
 */
export async function syncPlatforms(opts?: { force?: boolean; wait?: boolean }): Promise<SyncResult> {
  const force = !!opts?.force;
  const wait = opts?.wait !== false;
  if (!force && last && Date.now() - last.at < COOLDOWN_MS) return last.result;
  if (!wait && last) {
    void kick(force);
    return last.result;
  }
  return kick(force);
}

function kick(force: boolean): Promise<SyncResult> {
  if (!force && last && Date.now() - last.at < COOLDOWN_MS) return Promise.resolve(last.result);
  if (inflight) return inflight;
  inflight = runSync().finally(() => {
    inflight = null;
  });
  return inflight;
}

async function runSync(): Promise<SyncResult> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), BUDGET_MS);
  const settings = await ensureSettings();
  const errors: string[] = [];
  let leetcode: LcProfile | null = last?.result.leetcode ?? null;
  let hackerrank: HrProfile | null = last?.result.hackerrank ?? null;

  try {
    const [lc, hr] = await Promise.allSettled([
      fetchLcProfile(settings.leetcodeUsername || "sM1BAu3vUo", ac.signal),
      fetchHrProfile(settings.hackerrankUsername || "yuvrajshukla1702", ac.signal),
    ]);

    if (lc.status === "fulfilled") {
      leetcode = lc.value;
      await writeLc(lc.value);
    } else {
      errors.push(asErr("LeetCode", lc.reason));
    }
    if (hr.status === "fulfilled") {
      hackerrank = hr.value;
      await writeHr(hr.value);
    } else {
      errors.push(asErr("HackerRank", hr.reason));
    }
  } finally {
    clearTimeout(timer);
  }

  const result = { leetcode, hackerrank, errors };
  if (leetcode || hackerrank) last = { at: Date.now(), result };
  return result;
}

function asErr(who: string, reason: unknown): string {
  const msg = reason instanceof Error ? reason.message : `${who} sync failed`;
  if (/aborted|timeout|TimeoutError/i.test(msg)) return `${who}: timed out`;
  return `${who}: ${msg}`;
}

async function writeLc(profile: LcProfile) {
  await Promise.all(
    profile.recent.map((r) =>
      prisma.lcSolved.upsert({
        where: { titleSlug: r.titleSlug },
        create: { titleSlug: r.titleSlug, title: r.title, lang: r.lang },
        update: { title: r.title, lang: r.lang, syncedAt: new Date() },
      }),
    ),
  );
  const slugs = new Set(profile.recent.map((r) => r.titleSlug));
  await Promise.all(
    allProblems()
      .filter((p) => p.leetcodeSlug && slugs.has(p.leetcodeSlug))
      .map((p) =>
        prisma.problemProgress.upsert({
          where: { problemId: p.id },
          create: { problemId: p.id, status: "lc_solved", attempts: 0, solvedAt: new Date() },
          update: { status: "lc_solved", solvedAt: new Date() },
        }),
      ),
  );
}

async function writeHr(profile: HrProfile) {
  await prisma.hrSnapshot.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      username: profile.username,
      name: profile.name,
      scoresJson: JSON.stringify(profile.scores),
    },
    update: {
      username: profile.username,
      name: profile.name,
      scoresJson: JSON.stringify(profile.scores),
    },
  });
  await Promise.all(
    profile.recent.map((c) =>
      prisma.hrSolved.upsert({
        where: { slug: c.slug },
        create: { slug: c.slug, title: c.title },
        update: { title: c.title, syncedAt: new Date() },
      }),
    ),
  );
  const solved = new Set(profile.recent.map((c) => c.slug));
  await Promise.all(
    allProblems()
      .filter((p) => p.hackerrankSlug && solved.has(p.hackerrankSlug))
      .map((p) =>
        prisma.problemProgress.upsert({
          where: { problemId: p.id },
          create: { problemId: p.id, status: "hr_solved", attempts: 0, solvedAt: new Date() },
          update: { status: "hr_solved", solvedAt: new Date() },
        }),
      ),
  );
}
