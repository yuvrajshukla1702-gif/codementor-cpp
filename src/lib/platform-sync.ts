import { ensureSettings, prisma } from "@/lib/db";
import { allProblems } from "@/lib/curriculum";
import { fetchLcProfile } from "@/lib/leetcode";
import { fetchHrProfile } from "@/lib/hackerrank";

export async function syncPlatforms() {
  const settings = await ensureSettings();
  const errors: string[] = [];
  let leetcode = null;
  let hackerrank = null;

  try {
    const profile = await fetchLcProfile(settings.leetcodeUsername || "sM1BAu3vUo");
    leetcode = profile;
    for (const r of profile.recent) {
      await prisma.lcSolved.upsert({
        where: { titleSlug: r.titleSlug },
        create: { titleSlug: r.titleSlug, title: r.title, lang: r.lang },
        update: { title: r.title, lang: r.lang, syncedAt: new Date() },
      });
    }
    const slugs = new Set(profile.recent.map((r) => r.titleSlug));
    for (const p of allProblems()) {
      if (p.leetcodeSlug && slugs.has(p.leetcodeSlug)) {
        await prisma.problemProgress.upsert({
          where: { problemId: p.id },
          create: { problemId: p.id, status: "lc_solved", attempts: 0, solvedAt: new Date() },
          update: { status: "lc_solved", solvedAt: new Date() },
        });
      }
    }
  } catch (e) {
    errors.push(e instanceof Error ? `LeetCode: ${e.message}` : "LeetCode sync failed");
  }

  try {
    const profile = await fetchHrProfile(settings.hackerrankUsername || "yuvrajshukla1702");
    hackerrank = profile;
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
    for (const c of profile.recent) {
      await prisma.hrSolved.upsert({
        where: { slug: c.slug },
        create: { slug: c.slug, title: c.title },
        update: { title: c.title, syncedAt: new Date() },
      });
    }
    const solved = new Set(profile.recent.map((c) => c.slug));
    for (const p of allProblems()) {
      if (p.hackerrankSlug && solved.has(p.hackerrankSlug)) {
        await prisma.problemProgress.upsert({
          where: { problemId: p.id },
          create: { problemId: p.id, status: "hr_solved", attempts: 0, solvedAt: new Date() },
          update: { status: "hr_solved", solvedAt: new Date() },
        });
      }
    }
  } catch (e) {
    errors.push(e instanceof Error ? `HackerRank: ${e.message}` : "HackerRank sync failed");
  }

  return { leetcode, hackerrank, errors };
}
