import { NextResponse } from "next/server";
import { ensureSettings, prisma } from "@/lib/db";
import { fetchLcProfile } from "@/lib/leetcode";
import { allProblems } from "@/lib/curriculum";

export async function POST() {
  const settings = await ensureSettings();
  const username = settings.leetcodeUsername || "sM1BAu3vUo";
  const profile = await fetchLcProfile(username);

  for (const r of profile.recent) {
    await prisma.lcSolved.upsert({
      where: { titleSlug: r.titleSlug },
      create: { titleSlug: r.titleSlug, title: r.title, lang: r.lang },
      update: { title: r.title, lang: r.lang, syncedAt: new Date() },
    });
  }

  // Mark local curriculum problems solved if LC slug matches recent or tag coverage
  const slugs = new Set(profile.recent.map((r) => r.titleSlug));
  for (const p of allProblems()) {
    if (p.leetcodeSlug && slugs.has(p.leetcodeSlug)) {
      await prisma.problemProgress.upsert({
        where: { problemId: p.id },
        create: { problemId: p.id, status: "lc_solved", attempts: 0, solvedAt: new Date() },
        update: {
          status: "lc_solved",
          solvedAt: new Date(),
        },
      });
    }
  }

  return NextResponse.json({ ok: true, profile });
}

export async function GET() {
  const settings = await ensureSettings();
  try {
    const profile = await fetchLcProfile(settings.leetcodeUsername || "sM1BAu3vUo");
    return NextResponse.json({ profile });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "sync failed", profile: null },
      { status: 502 }
    );
  }
}
