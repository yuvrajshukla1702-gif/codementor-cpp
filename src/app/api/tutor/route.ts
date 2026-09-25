import { NextResponse } from "next/server";
import { getProblem } from "@/lib/curriculum";
import { askTutor, tutorSystemPrompt } from "@/lib/gemini";
import { prisma, ensureSettings } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();
  const problemId = String(body.problemId || "");
  const code = String(body.code || "");
  const judgeSummary = String(body.judgeSummary || "");
  const problem = getProblem(problemId);
  if (!problem) return NextResponse.json({ error: "Unknown problem" }, { status: 404 });

  const settings = await ensureSettings();
  const prog = await prisma.problemProgress.findUnique({ where: { problemId } });
  const hintLevel = Math.min(3, (prog?.lastHintLevel ?? 0) + (body.bumpHint ? 1 : 0));

  const user = [
    `PROBLEM: ${problem.title} (${problem.difficulty})`,
    `TOPIC: ${problem.topic}`,
    `HINT_LEVEL: ${hintLevel}`,
    `LESSON_SUMMARY:\n${problem.lesson.slice(0, 800)}`,
    `OFFICIAL_HINTS_BANK (use according to level, do not dump all):\n1) ${problem.hints[0]}\n2) ${problem.hints[1]}\n3) ${problem.hints[2]}`,
    `JUDGE:\n${judgeSummary.slice(0, 1500)}`,
    `STUDENT_CODE:\n\`\`\`cpp\n${code.slice(0, 5000)}\n\`\`\``,
  ].join("\n\n");

  const { reply, provider } = await askTutor({
    geminiApiKey: settings.geminiApiKey || process.env.GEMINI_API_KEY || "",
    cursorApiKey: settings.cursorApiKey || process.env.CURSOR_API_KEY || "",
    system: tutorSystemPrompt(settings.tutorTone || "hinglish"),
    user,
    problem,
    hintLevel,
    code,
    judgeSummary,
    tone: settings.tutorTone || "hinglish",
  });

  await prisma.problemProgress.upsert({
    where: { problemId },
    create: { problemId, status: "attempted", attempts: 0, lastHintLevel: hintLevel },
    update: { lastHintLevel: hintLevel, status: prog?.status === "solved" ? "solved" : "attempted" },
  });

  await prisma.attempt.create({
    data: {
      problemId,
      code,
      passed: false,
      tutorReply: reply,
      hintLevel,
      judgeLog: judgeSummary.slice(0, 2000),
    },
  });

  return NextResponse.json({ reply, hintLevel, provider });
}
