import { NextResponse } from "next/server";
import { allow, clientIp, isLocal } from "@/lib/agent/limit";
import { runUserInput } from "@/lib/agent/pipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** "Try your own input": compile the (screened) solution + driver and run it once. */
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as { solution?: unknown; driver?: unknown; input?: unknown };
  if (typeof b.solution !== "string" || typeof b.driver !== "string" || typeof b.input !== "string") {
    return NextResponse.json({ ok: false, stdout: "", stderr: "", ms: 0, message: "Missing code or input." }, { status: 400 });
  }
  const ip = clientIp(req);
  if (!isLocal(ip) && !allow(`run:${ip}`, 40, 10 * 60_000)) {
    return NextResponse.json({ ok: false, stdout: "", stderr: "", ms: 0, message: "Too many runs. Wait a bit." }, { status: 429 });
  }
  const out = await runUserInput({ solution: b.solution, driver: b.driver, input: b.input });
  return NextResponse.json(out, { headers: { "Cache-Control": "no-store" } });
}
