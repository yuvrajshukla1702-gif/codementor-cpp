import { NextResponse } from "next/server";
import { allow, clientIp, isLocal } from "@/lib/agent/limit";
import { describeLlmError, resolveLlm } from "@/lib/agent/llm";
import { translateLines } from "@/lib/agent/pipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Hindi (Devanagari) voice lines are translated on demand, the first time you pick Hindi. */
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as { lines?: unknown };
  const lines = Array.isArray(b.lines) ? b.lines.map((l) => (typeof l === "string" ? l.slice(0, 500) : "")) : [];
  if (!lines.length || lines.length > 40) {
    return NextResponse.json({ error: "Nothing to translate.", code: "bad_request" }, { status: 400 });
  }
  const ip = clientIp(req);
  if (!isLocal(ip) && !allow(`tr:${ip}`, 20, 10 * 60_000)) {
    return NextResponse.json({ error: "Too many requests. Wait a few minutes.", code: "quota" }, { status: 429 });
  }
  const cfg = await resolveLlm();
  if (!cfg) {
    return NextResponse.json({ error: "The Hindi voice needs an AI key. Add one on this page.", code: "no_key" }, { status: 400 });
  }
  try {
    return NextResponse.json({ lines: await translateLines(cfg, lines, req.signal) });
  } catch (err) {
    const e = describeLlmError(err, cfg.kind === "gemini" ? "Gemini" : undefined);
    return NextResponse.json({ error: e.message, code: e.code }, { status: e.code === "quota" ? 429 : 502 });
  }
}
