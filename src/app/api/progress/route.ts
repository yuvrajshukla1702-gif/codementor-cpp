import { NextResponse } from "next/server";
import { ensureSettings, prisma } from "@/lib/db";
import { computeReadiness } from "@/lib/readiness";
import { gradeWithTutor } from "@/lib/gemini";
import { interviewBank } from "@/lib/interview-bank";

export async function GET() {
  const synced = await (await import("@/lib/platform-sync")).syncPlatforms();
  const profile = synced.leetcode;
  const hackerrank = synced.hackerrank;
  const localSolved = await prisma.problemProgress.count({
    where: { status: { in: ["solved", "lc_solved", "hr_solved"] } },
  });
  const readiness = computeReadiness(profile, localSolved);
  const progress = await prisma.problemProgress.findMany();
  const lc = await prisma.lcSolved.findMany({ orderBy: { syncedAt: "desc" }, take: 30 });
  const hrSolved = await prisma.hrSolved.findMany({ orderBy: { syncedAt: "desc" }, take: 30 });

  await prisma.weeklyPlan.upsert({
    where: { id: 1 },
    create: { id: 1, payload: JSON.stringify(readiness) },
    update: { payload: JSON.stringify(readiness) },
  });

  return NextResponse.json({ profile, hackerrank, readiness, progress, lc, hrSolved, syncErrors: synced.errors });
}

export async function POST(req: Request) {
  const body = await req.json();
  const questionId = String(body.questionId || "");
  const answer = String(body.answer || "");
  const q = interviewBank.find((x) => x.id === questionId);
  if (!q) return NextResponse.json({ error: "Unknown question" }, { status: 404 });

  const settings = await ensureSettings();
  const graded = await gradeWithTutor({
    geminiApiKey: settings.geminiApiKey || process.env.GEMINI_API_KEY || "",
    cursorApiKey: settings.cursorApiKey || process.env.CURSOR_API_KEY || "",
    tone: settings.tutorTone || "hinglish",
    section: q.section,
    prompt: q.prompt,
    answer,
  });

  await prisma.shortAnswerAttempt.create({
    data: {
      section: q.section,
      questionId,
      answer,
      score: graded.score,
      feedback: graded.feedback,
    },
  });

  return NextResponse.json({
    score: graded.score,
    feedback: graded.feedback,
    provider: graded.provider,
  });
}
