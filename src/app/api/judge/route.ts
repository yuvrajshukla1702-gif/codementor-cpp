import { NextResponse } from "next/server";
import { getProblem } from "@/lib/curriculum";
import { JudgeUnavailableError, judgeProblem } from "@/lib/judge";
import { prisma, ensureSettings } from "@/lib/db";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { problemId?: unknown; code?: unknown };
  const problemId = String(body.problemId || "");
  const code = String(body.code || "");
  const problem = getProblem(problemId);
  if (!problem) return NextResponse.json({ error: "Unknown problem" }, { status: 404 });

  let result;
  try {
    result = await judgeProblem(problem, code, { includeHidden: true });
  } catch (err) {
    if (err instanceof JudgeUnavailableError) {
      // Hosted demos (serverless) have no g++. Say so plainly instead of failing with an empty 500.
      return NextResponse.json(
        {
          passed: false,
          verdict: "Judge unavailable",
          message:
            "This hosted demo has no C++ compiler. Run CodeMentor on your own machine (npm run dev, or Docker) to run and submit code. Lessons, code walks and the teacher work everywhere.",
        },
        { status: 503 }
      );
    }
    throw err;
  }

  // Bookkeeping must never turn a finished verdict into an error (e.g. a read-only database).
  try {
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
  } catch {
    /* progress is also tracked in the browser; ignore database failures */
  }

  return NextResponse.json(result);
}
