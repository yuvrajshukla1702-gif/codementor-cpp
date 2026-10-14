import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { compilerInfo } from "@/lib/agent/cpp";
import { DEMOS } from "@/lib/agent/demo";
import { allow, clientIp, isLocal } from "@/lib/agent/limit";
import { describeLlmError, geminiModelInUse, llm, probeGemini, resolveLlm, type RealLlm } from "@/lib/agent/llm";
import type { AgentStatus } from "@/lib/agent/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ping = NonNullable<AgentStatus["test"]>;

/** The latest live check, so page loads and repeated clicks do not each spend a provider request. */
let lastPing: { sig: string; at: number; result: Ping; model: string | null } | null = null;
const PING_TTL_MS = 20_000;

/** Identifies a key + provider without keeping or ever showing the key itself. */
function fingerprint(cfg: RealLlm): string {
  const extra = cfg.kind === "openai" ? `${cfg.baseUrl}|${cfg.model}` : (cfg.model ?? "");
  return createHash("sha256").update(`${cfg.kind}|${extra}|${cfg.apiKey}`).digest("hex").slice(0, 16);
}

async function livePing(cfg: RealLlm): Promise<{ result: Ping; model: string | null }> {
  const started = Date.now();
  try {
    if (cfg.kind === "gemini") {
      const model = await probeGemini(cfg.apiKey, 15_000);
      return { result: { ok: true, ms: Date.now() - started }, model };
    }
    await llm(cfg, {
      tag: "ping",
      system: "You are a connectivity check. Answer in one word.",
      user: "Reply with the single word OK.",
      maxTokens: 128,
      think: "off",
      timeoutMs: 25_000,
    });
    return { result: { ok: true, ms: Date.now() - started }, model: cfg.model };
  } catch (err) {
    const d = describeLlmError(err, cfg.kind === "gemini" ? "Gemini" : undefined);
    return { result: { ok: false, message: d.message, code: d.code }, model: null };
  }
}

/** What the Ask page needs to know: is an AI key saved, is there a compiler, and (optionally) does the key work. */
export async function GET(req: Request) {
  const [cfg, compiler] = await Promise.all([resolveLlm(), compilerInfo()]);
  const status: AgentStatus = {
    configured: !!cfg,
    provider: cfg?.kind ?? null,
    model: cfg ? (cfg.kind === "openai" ? cfg.model : (geminiModelInUse() ?? cfg.model ?? "gemini-3.8-flash")) : null,
    compiler,
    demo: DEMOS,
  };

  if (new URL(req.url).searchParams.get("test") === "1") {
    if (!cfg) {
      status.test = { ok: false, message: "No AI key is saved yet." };
    } else {
      const sig = fingerprint(cfg);
      const ip = clientIp(req);
      if (lastPing && lastPing.sig === sig && Date.now() - lastPing.at < PING_TTL_MS) {
        status.test = lastPing.result;
        if (lastPing.model) status.model = lastPing.model;
      } else if (!isLocal(ip) && !allow(`test:${ip}`, 6, 60_000)) {
        // A public copy must not be usable to drain the owner's key with connection checks.
        status.test = { ok: false, message: "Too many connection checks. Wait a minute and try again.", code: "quota" };
      } else {
        const { result, model } = await livePing(cfg);
        status.test = result;
        if (model) status.model = model;
        // Only settled answers are reused. A network blip or a rate limit is worth checking again right away.
        if (result.ok || result.code === "auth") lastPing = { sig, at: Date.now(), result, model };
      }
    }
  }
  return NextResponse.json(status, { headers: { "Cache-Control": "no-store" } });
}
