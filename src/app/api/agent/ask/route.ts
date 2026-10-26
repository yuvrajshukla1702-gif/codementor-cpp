import { NextResponse } from "next/server";
import { demoById } from "@/lib/agent/demo";
import { acquire, allow, clientIp, isLocal, release } from "@/lib/agent/limit";
import { resolveLlm, type LlmConfig } from "@/lib/agent/llm";
import { runAgent } from "@/lib/agent/pipeline";
import type { AgentEvent } from "@/lib/agent/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 180;

const MAX_QUESTION = 6000;

/**
 * The agent. Streams newline-delimited JSON events (hook, explain, code, verify, dry, video, ...)
 * so the page can paint each part the moment it exists.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { question?: unknown; demo?: unknown };
  const demoId = typeof body.demo === "string" ? body.demo : "";
  const question = typeof body.question === "string" ? body.question.trim() : "";

  if (!demoId) {
    if (question.length < 3) {
      return NextResponse.json({ error: "Type a question first.", code: "bad_request" }, { status: 400 });
    }
    if (question.length > MAX_QUESTION) {
      return NextResponse.json(
        { error: `That is too long (${question.length} characters). Keep it under ${MAX_QUESTION}.`, code: "bad_request" },
        { status: 413 },
      );
    }
  } else if (!demoById(demoId)) {
    return NextResponse.json({ error: "Unknown demo.", code: "bad_request" }, { status: 400 });
  }

  const ip = clientIp(req);
  if (!demoId && !isLocal(ip) && !allow(`ask:${ip}`, 12, 10 * 60_000)) {
    return NextResponse.json(
      { error: "You are asking a bit too fast. Wait a few minutes and try again.", code: "quota" },
      { status: 429 },
    );
  }

  let cfg: LlmConfig | null = null;
  if (demoId) cfg = { kind: "demo", id: demoId };
  else cfg = await resolveLlm();

  const enc = new TextEncoder();
  const ac = new AbortController();
  req.signal.addEventListener("abort", () => ac.abort());

  if (!cfg) {
    const ev: AgentEvent = {
      t: "error",
      code: "no_key",
      message: "No AI key is set up yet. Paste a free Gemini key below, or try one of the demos.",
    };
    return new Response(`${JSON.stringify(ev)}\n`, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" } });
  }

  // The cap protects a public copy. On this computer a retry must not be told the agent is busy.
  const capped = !isLocal(ip);
  let held = false;
  if (capped) {
    if (!acquire(3)) {
      return NextResponse.json({ error: "The agent is busy with other questions. Try again in a few seconds.", code: "busy" }, { status: 503 });
    }
    held = true;
  }
  const finish = () => {
    if (!held) return;
    held = false;
    release();
  };

  const active = cfg;
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (ev: AgentEvent) => {
        try {
          controller.enqueue(enc.encode(`${JSON.stringify(ev)}\n`));
        } catch {
          /* the browser went away */
        }
      };
      try {
        await runAgent({ question: demoId ? (demoById(demoId)?.question ?? "") : question, cfg: active, emit: send, signal: ac.signal });
      } catch (err) {
        send({ t: "error", code: "internal", message: err instanceof Error ? err.message : "Something went wrong." });
      } finally {
        finish();
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      }
    },
    cancel() {
      ac.abort();
      finish();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
