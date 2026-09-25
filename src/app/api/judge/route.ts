import { NextResponse } from "next/server";
import { getProblem } from "@/lib/curriculum";
import { judgeProblem } from "@/lib/judge";
import { prisma, ensureSettings } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();
  const problemId = String(body.problemId || "");
  const code = String(body.code || "");
  const problem = getProblem(problemId);
  if (!problem) return NextResponse.json({ error: "Unknown problem" }, { status: 404 });

  const result = await judgeProblem(problem, code, { includeHidden: true });

  await ensureSettings();
  const prev = await prisma.problemProgress.findUnique({ where: { problemId } });
  await prisma.attempt.create({
    data: {
      problemId,
      code,
      passed: result.passed,
      judgeLog: JSON.stringify(result),
      hintLevel: prev?.lastHintLevel ?? 0,
    },
  });

  await prisma.problemProgress.upsert({
    where: { problemId },
    create: {
      problemId,
      status: result.passed ? "solved" : "attempted",
      attempts: 1,
      bestCode: result.passed ? code : "",
      solvedAt: result.passed ? new Date() : null,
    },
    update: {
      attempts: { increment: 1 },
      status: result.passed ? "solved" : prev?.status === "solved" ? "solved" : "attempted",
      bestCode: result.passed ? code : prev?.bestCode || "",
      solvedAt: result.passed ? new Date() : prev?.solvedAt,
    },
  });

  return NextResponse.json(result);
}
