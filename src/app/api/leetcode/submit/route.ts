import { NextResponse } from "next/server";
import { ensureSettings } from "@/lib/db";
import { submitToLeetCode, pollLcSubmission } from "@/lib/leetcode";
import { getProblem } from "@/lib/curriculum";

export async function POST(req: Request) {
  const body = await req.json();
  const problemId = String(body.problemId || "");
  const code = String(body.code || "");
  const problem = getProblem(problemId);
  if (!problem?.leetcodeSlug) {
    return NextResponse.json({ error: "Problem is not linked to LeetCode" }, { status: 400 });
  }

  const settings = await ensureSettings();
  const session = settings.leetcodeSession || "";
  const submitted = await submitToLeetCode({
    session,
    titleSlug: problem.leetcodeSlug,
    code,
    lang: "cpp",
  });
  if (submitted.error || !submitted.submissionId) {
    return NextResponse.json({ error: submitted.error || "submit failed" }, { status: 400 });
  }

  const verdict = await pollLcSubmission(session, submitted.submissionId);
  return NextResponse.json({ submissionId: submitted.submissionId, verdict });
}
