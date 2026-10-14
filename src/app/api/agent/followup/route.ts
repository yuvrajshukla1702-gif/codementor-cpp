import { NextResponse } from "next/server";
import { allow, clientIp, isLocal } from "@/lib/agent/limit";
import { describeLlmError, resolveLlm } from "@/lib/agent/llm";
import { answerFollowup } from "@/lib/agent/pipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Turn = { role: "user" | "ai"; text: string };

/** One more question about an answer you already have. Plain text back. */
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const ask = typeof b.ask === "string" ? b.ask.trim() : "";
  if (ask.length < 2) return NextResponse.json({ error: "Type your question.", code: "bad_request" }, { status: 400 });
  if (ask.length > 1500) return NextResponse.json({ error: "Please keep it shorter.", code: "bad_request" }, { status: 413 });

  const ip = clientIp(req);
  if (!isLocal(ip) && !allow(`follow:${ip}`, 30, 10 * 60_000)) {
    return NextResponse.json({ error: "Too many questions. Wait a few minutes.", code: "quota" }, { status: 429 });
  }

  const cfg = await resolveLlm();
  if (!cfg) {
    return NextResponse.json(
      { error: "Follow-up questions need an AI key. Paste a free Gemini key on this page first.", code: "no_key" },
      { status: 400 },
    );
  }

  const history: Turn[] = Array.isArray(b.history)
    ? (b.history as unknown[])
        .filter((h): h is Turn => !!h && typeof h === "object" && ((h as Turn).role === "user" || (h as Turn).role === "ai") && typeof (h as Turn).text === "string")
        .slice(-6)
    : [];
  const s = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : "");

  try {
    const answer = await answerFollowup(
      cfg,
      {
        title: s(b.title, 120) || "the problem",
        question: s(b.question, 2500),
        approach: s(b.approach, 600),
        solution: s(b.solution, 4000),
        history,
        ask,
      },
      req.signal,
    );
    return NextResponse.json({ answer });
  } catch (err) {
    const e = describeLlmError(err, cfg.kind === "gemini" ? "Gemini" : undefined);
    return NextResponse.json({ error: e.message, code: e.code }, { status: e.code === "quota" ? 429 : 502 });
  }
}
