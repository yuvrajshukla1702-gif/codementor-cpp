import { NextResponse } from "next/server";
import { allow, clientIp, isLocal } from "@/lib/agent/limit";
import { describeLlmError, resolveLlm } from "@/lib/agent/llm";
import { writeLangs } from "@/lib/agent/pipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Same answer, written as pseudocode and as C, Python and Java. */
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const s = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : "");
  const solution = s(b.solution, 12000);
  if (solution.length < 10) {
    return NextResponse.json({ error: "There is no solution to rewrite yet.", code: "bad_request" }, { status: 400 });
  }

  const ip = clientIp(req);
  if (!isLocal(ip) && !allow(`langs:${ip}`, 20, 10 * 60_000)) {
    return NextResponse.json({ error: "Too many requests. Wait a few minutes.", code: "quota" }, { status: 429 });
  }

  const cfg = await resolveLlm();
  if (!cfg) {
    return NextResponse.json(
      { error: "This needs an AI key. Paste a free Gemini key on this page first.", code: "no_key" },
      { status: 400 },
    );
  }

  try {
    const langs = await writeLangs(
      cfg,
      {
        title: s(b.title, 120) || "the problem",
        question: s(b.question, 2500),
        solution,
        driver: s(b.driver, 6000),
        inputFormat: s(b.inputFormat, 300),
        outputFormat: s(b.outputFormat, 300),
      },
      req.signal,
    );
    return NextResponse.json({ langs });
  } catch (err) {
    const e = describeLlmError(err, cfg.kind === "gemini" ? "Gemini" : undefined);
    return NextResponse.json({ error: e.message, code: e.code }, { status: e.code === "quota" ? 429 : 502 });
  }
}
