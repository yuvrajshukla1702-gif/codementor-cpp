import { ensureSettings } from "../db";
import { demoReply } from "./demo";
import type { ErrorCode } from "./types";

/**
 * Tiny provider layer: Gemini (free AI Studio key) or any OpenAI-compatible endpoint
 * (Groq, OpenRouter, OpenAI, LM Studio ...). Server-side only — keys never reach the browser.
 */

export type LlmConfig =
  | { kind: "gemini"; apiKey: string; model?: string }
  | { kind: "openai"; apiKey: string; baseUrl: string; model: string }
  | { kind: "demo"; id: string };

export type LlmCall = {
  /** Which step this is (solve, narrate-en, repair ...). Demo mode keys off it. */
  tag: string;
  system: string;
  user: string;
  json?: boolean;
  temperature?: number;
  maxTokens?: number;
  /** off = fastest, low = small reasoning budget */
  think?: "off" | "low";
  signal?: AbortSignal;
  timeoutMs?: number;
};

export type LlmErrorKind = "auth" | "quota" | "model" | "blocked" | "network" | "timeout" | "server" | "output" | "aborted";

export class LlmError extends Error {
  kind: LlmErrorKind;
  status?: number;
  retryAfterMs?: number;
  constructor(message: string, kind: LlmErrorKind, status?: number, retryAfterMs?: number) {
    super(message);
    this.name = "LlmError";
    this.kind = kind;
    this.status = status;
    this.retryAfterMs = retryAfterMs;
  }
}

export type LlmResult = { text: string; ms: number; model: string };

/** Called with the whole text received so far. An empty string means "starting over" (retry). */
export type OnText = (accumulated: string) => void;

export type RealLlm = Exclude<LlmConfig, { kind: "demo" }>;

export async function resolveLlm(): Promise<RealLlm | null> {
  const base = (process.env.AI_BASE_URL || "").trim();
  const oKey = (process.env.AI_API_KEY || "").trim();
  if (base && oKey) {
    return {
      kind: "openai",
      apiKey: oKey,
      baseUrl: base.replace(/\/+$/, ""),
      model: (process.env.AI_MODEL || "").trim() || "gpt-4o-mini",
    };
  }
  let key = (process.env.GEMINI_API_KEY || "").trim();
  try {
    const s = await ensureSettings();
    key = (s.geminiApiKey || "").trim() || key;
  } catch {
    /* no database (serverless): the env var is enough */
  }
  if (key) return { kind: "gemini", apiKey: key, model: (process.env.GEMINI_MODEL || "").trim() || undefined };
  return null;
}

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(new LlmError("Cancelled", "aborted"));
    const t = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(t);
        reject(new LlmError("Cancelled", "aborted"));
      },
      { once: true },
    );
  });

function withTimeout(call: LlmCall) {
  const t = AbortSignal.timeout(call.timeoutMs ?? 75_000);
  return call.signal ? AbortSignal.any([call.signal, t]) : t;
}

export async function llm(cfg: LlmConfig, call: LlmCall, onText?: OnText): Promise<LlmResult> {
  const started = Date.now();
  if (cfg.kind === "demo") {
    const text = await demoReply(cfg.id, call.tag, call.user);
    if (onText) {
      onText("");
      await sleep(220, call.signal);
      const step = 220;
      for (let i = step; i < text.length + step; i += step) {
        onText(text.slice(0, i));
        await sleep(14, call.signal);
      }
    }
    return { text, ms: Date.now() - started, model: "demo" };
  }
  let lastErr: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      onText?.("");
      const out = cfg.kind === "gemini" ? await geminiOnce(cfg, call, onText) : await openaiOnce(cfg, call, onText);
      return { ...out, ms: Date.now() - started };
    } catch (err) {
      lastErr = err;
      if (call.signal?.aborted) throw new LlmError("Cancelled", "aborted");
      if (!(err instanceof LlmError)) throw err;
      const modelBusy = err.kind === "server" && /high demand|overloaded/i.test(err.message);
      const retryable =
        err.kind === "server" ||
        err.kind === "network" ||
        (err.kind === "quota" && (err.retryAfterMs ?? 99_999) <= 9_000);
      if (!retryable || attempt === 2) throw err;
      await sleep(modelBusy ? 4_000 * (attempt + 1) : (err.retryAfterMs ?? 700 * (attempt + 1)), call.signal);
    }
  }
  throw lastErr instanceof Error ? lastErr : new LlmError("Unknown AI error", "server");
}

async function readError(res: Response): Promise<LlmError> {
  let msg = `${res.status} ${res.statusText}`;
  let retryAfterMs: number | undefined;
  try {
    const raw = await res.text();
    try {
      const j = JSON.parse(raw) as { error?: { message?: string; details?: Array<{ retryDelay?: string }> } | string };
      const e = typeof j.error === "string" ? { message: j.error } : j.error;
      if (e?.message) msg = e.message;
      const delay = (e as { details?: Array<{ retryDelay?: string }> } | undefined)?.details?.find((d) => d.retryDelay)?.retryDelay;
      if (delay) retryAfterMs = Math.ceil(parseFloat(delay) * 1000);
    } catch {
      if (raw) msg = raw.slice(0, 300);
    }
  } catch {
    /* ignore */
  }
  const ra = res.headers.get("retry-after");
  if (ra && !retryAfterMs && Number.isFinite(Number(ra))) retryAfterMs = Number(ra) * 1000;
  const short = msg.replace(/\s+/g, " ").slice(0, 240);
  if (
    res.status === 401 ||
    res.status === 403 ||
    /api key not valid|api_key_invalid|invalid api key|unauthenticated|access_token_type_unsupported|api_key_service_blocked/i.test(msg)
  ) {
    return new LlmError(short, "auth", res.status);
  }
  if (res.status === 429) return new LlmError(short, "quota", res.status, retryAfterMs);
  if (res.status === 404 || /not found|not supported for generateContent|unknown model/i.test(msg)) {
    return new LlmError(short, "model", res.status);
  }
  if (res.status >= 500) return new LlmError(short, "server", res.status, retryAfterMs);
  return new LlmError(short, "output", res.status);
}

function netError(err: unknown): LlmError {
  if (err instanceof LlmError) return err;
  const name = err instanceof Error ? err.name : "";
  if (name === "TimeoutError") return new LlmError("The AI took too long to answer.", "timeout");
  if (name === "AbortError") return new LlmError("Cancelled", "aborted");
  const msg = err instanceof Error ? err.message : String(err);
  return new LlmError(`Could not reach the AI service (${msg}).`, "network");
}

/** Reads a text/event-stream body; every `data:` payload is handed to `onData` as parsed JSON. */
async function readSse(res: Response, onData: (json: unknown) => void) {
  const body = res.body;
  if (!body) throw new LlmError("The AI service sent an empty stream.", "network");
  const reader = body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  const flush = (block: string) => {
    const data = block
      .split(/\r?\n/)
      .filter((l) => l.startsWith("data:"))
      .map((l) => l.slice(5).trimStart())
      .join("\n")
      .trim();
    if (!data || data === "[DONE]") return;
    try {
      onData(JSON.parse(data));
    } catch {
      /* ignore a malformed chunk */
    }
  };
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let m: RegExpExecArray | null;
      while ((m = /\r?\n\r?\n/.exec(buf))) {
        flush(buf.slice(0, m.index));
        buf = buf.slice(m.index + m[0].length);
      }
    }
    buf += dec.decode();
    if (buf.trim()) flush(buf);
  } catch (err) {
    throw netError(err);
  }
}

/* ---------------------------------- Gemini ---------------------------------- */

// GEMINI_BASE_URL is only for proxies and offline tests; normal use never sets it.
const GEMINI = (process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta").trim().replace(/\/+$/, "");
let geminiModel: string | null = null;
let thinkingConfigOk = true;
/** Models that just answered "high demand". They go to the back of the line for a minute. */
const busyUntil = new Map<string, number>();

/** Prefer a Flash model that is still offered to new keys, and leave the overloaded 3.8 model for last. */
const PREFERRED_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.6-flash",
  "gemini-3.7-flash",
  "gemini-3.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
  "gemini-flash-latest",
];

function pickGeminiFlash(names: string[]): string | null {
  const scored = names
    .filter((n) => /flash/.test(n) && !/(lite|image|tts|live|audio|embed|vision|robotics|computer|learnlm|8b|exp)/.test(n))
    .map((n) => {
      const m = n.match(/gemini-(\d+)(?:\.(\d+))?/);
      const ver = m ? Number(m[1]) * 10 + Number(m[2] ?? 0) : 0;
      return { n, s: ver * 10 + (/preview/.test(n) ? 0 : 1) + (/latest/.test(n) ? -5 : 0) };
    })
    .sort((a, b) => b.s - a.s);
  return scored[0]?.n ?? null;
}

async function listGeminiModels(apiKey: string, signal: AbortSignal): Promise<string[]> {
  const res = await fetch(`${GEMINI}/models?pageSize=200`, { headers: { "x-goog-api-key": apiKey }, signal });
  if (!res.ok) throw await readError(res);
  const j = (await res.json()) as { models?: Array<{ name?: string; supportedGenerationMethods?: string[] }> };
  return (j.models ?? [])
    .filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
    .map((m) => (m.name || "").replace(/^models\//, ""))
    .filter(Boolean);
}

export function geminiModelInUse() {
  return geminiModel;
}

/** Cheap key check: list models. Does not spend a generateContent call. */
export async function probeGemini(apiKey: string, timeoutMs = 15_000): Promise<string> {
  const names = await listGeminiModels(apiKey, AbortSignal.timeout(timeoutMs));
  const model = PREFERRED_MODELS.find((n) => names.includes(n)) ?? pickGeminiFlash(names) ?? names.find((n) => /^gemini/i.test(n)) ?? names[0];
  if (!model) throw new LlmError("No usable Gemini model was found for this key.", "model");
  return model;
}

function modelSignal(call: LlmCall): AbortSignal {
  // One model gets 70s. A silent "thinking" call used to burn the whole wait and then fail.
  const limit = AbortSignal.timeout(Math.min(call.timeoutMs ?? 75_000, 70_000));
  return call.signal ? AbortSignal.any([call.signal, limit]) : limit;
}

async function geminiOnce(
  cfg: Extract<LlmConfig, { kind: "gemini" }>,
  call: LlmCall,
  onText?: OnText,
): Promise<Omit<LlmResult, "ms">> {
  const tried: string[] = [];
  const now = Date.now();
  const candidates = [geminiModel, cfg.model, ...PREFERRED_MODELS]
    .filter((m, i, a): m is string => Boolean(m) && a.indexOf(m) === i)
    .sort((a, b) => Number((busyUntil.get(a) ?? 0) > now) - Number((busyUntil.get(b) ?? 0) > now));
  let discovered = false;
  let lastBusy: LlmError | null = null;
  let timeouts = 0;
  for (let i = 0; i < candidates.length; i++) {
    const model = candidates[i];
    tried.push(model);
    const signal = modelSignal(call);
    try {
      onText?.("");
      const text = await geminiGenerate(cfg.apiKey, model, call, signal, onText);
      geminiModel = model;
      return { text, model };
    } catch (err) {
      if (call.signal?.aborted) throw new LlmError("Cancelled", "aborted");
      const timedOut = err instanceof LlmError && err.kind === "timeout";
      const busy = err instanceof LlmError && err.kind === "server" && /high demand|overloaded/i.test(err.message);
      if (timedOut) {
        timeouts += 1;
        busyUntil.set(model, Date.now() + 60_000);
        if (geminiModel === model) geminiModel = null;
        if (timeouts >= 2) throw err;
        continue;
      }
      if (!(err instanceof LlmError) || (err.kind !== "model" && !busy)) throw err;
      if (busy) {
        lastBusy = err;
        busyUntil.set(model, Date.now() + 60_000);
      }
      if (geminiModel === model) geminiModel = null;
      if (i === candidates.length - 1 && !discovered) {
        discovered = true;
        const found = pickGeminiFlash(await listGeminiModels(cfg.apiKey, signal));
        if (found && !tried.includes(found)) candidates.push(found);
      }
    }
  }
  if (lastBusy) throw lastBusy;
  throw new LlmError(`No usable Gemini model found (tried ${tried.join(", ")}).`, "model");
}

type GeminiChunk = {
  candidates?: Array<{ finishReason?: string; content?: { parts?: Array<{ text?: string; thought?: boolean }> } }>;
  promptFeedback?: { blockReason?: string };
};

function geminiText(chunk: GeminiChunk): string {
  return (chunk.candidates?.[0]?.content?.parts ?? [])
    .filter((p) => !p.thought)
    .map((p) => p.text ?? "")
    .join("");
}

async function geminiGenerate(
  apiKey: string,
  model: string,
  call: LlmCall,
  signal: AbortSignal,
  onText?: OnText,
): Promise<string> {
  // Gemini 3 thinks at "medium" by default and can stay silent until the request is aborted.
  // "low" is the fast setting that still writes correct code. thinkingBudget: 0 hangs these models.
  const generationConfig: Record<string, unknown> = {
    temperature: call.temperature ?? 0.3,
    maxOutputTokens: call.maxTokens ?? 8192,
  };
  if (call.json) generationConfig.responseMimeType = "application/json";
  const body = (withThinking: boolean) =>
    JSON.stringify({
      systemInstruction: { parts: [{ text: call.system }] },
      contents: [{ role: "user", parts: [{ text: call.user }] }],
      generationConfig:
        withThinking && thinkingConfigOk
          ? { ...generationConfig, thinkingConfig: { thinkingLevel: "low" } }
          : generationConfig,
    });

  const url = onText
    ? `${GEMINI}/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`
    : `${GEMINI}/models/${encodeURIComponent(model)}:generateContent`;
  const headers = { "Content-Type": "application/json", "x-goog-api-key": apiKey };
  const post = async (withThinking: boolean) => {
    try {
      return await fetch(url, { method: "POST", headers, body: body(withThinking), signal });
    } catch (err) {
      throw netError(err);
    }
  };

  let res = await post(true);
  if (!res.ok) {
    const e = await readError(res);
    // Some models reject thinking settings (or refuse budget 0). Retry once without them.
    if (res.status === 400 && /think|budget/i.test(e.message)) {
      thinkingConfigOk = false;
      res = await post(false);
      if (!res.ok) throw await readError(res);
    } else {
      throw e;
    }
  }

  let text = "";
  let blocked = "";
  let finish = "";
  if (onText) {
    await readSse(res, (j) => {
      const chunk = j as GeminiChunk;
      if (chunk.promptFeedback?.blockReason) blocked = chunk.promptFeedback.blockReason;
      const fr = chunk.candidates?.[0]?.finishReason;
      if (fr) finish = fr;
      const add = geminiText(chunk);
      if (add) {
        text += add;
        onText(text);
      }
    });
  } else {
    const data = (await res.json()) as GeminiChunk;
    if (data.promptFeedback?.blockReason) blocked = data.promptFeedback.blockReason;
    finish = data.candidates?.[0]?.finishReason ?? "";
    text = geminiText(data);
  }
  text = text.trim();
  if (!text) {
    if (blocked) throw new LlmError(`The AI declined this request (${blocked}).`, "blocked");
    throw new LlmError(`The model returned nothing (${finish || "no candidates"}).`, "output");
  }
  if (finish === "MAX_TOKENS" && call.json) throw new LlmError("The AI's answer was cut off (too long).", "output");
  return text;
}

/* --------------------------- OpenAI-compatible chat --------------------------- */

async function openaiOnce(
  cfg: Extract<LlmConfig, { kind: "openai" }>,
  call: LlmCall,
  onText?: OnText,
): Promise<Omit<LlmResult, "ms">> {
  const signal = withTimeout(call);
  let res: Response;
  try {
    res = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${cfg.apiKey}` },
      body: JSON.stringify({
        model: cfg.model,
        temperature: call.temperature ?? 0.3,
        max_tokens: call.maxTokens ?? 8192,
        ...(onText ? { stream: true } : {}),
        ...(call.json ? { response_format: { type: "json_object" } } : {}),
        messages: [
          { role: "system", content: call.system },
          { role: "user", content: call.user },
        ],
      }),
      signal,
    });
  } catch (err) {
    throw netError(err);
  }
  if (!res.ok) throw await readError(res);

  let text = "";
  if (onText) {
    await readSse(res, (j) => {
      const add = (j as { choices?: Array<{ delta?: { content?: string } }> }).choices?.[0]?.delta?.content;
      if (add) {
        text += add;
        onText(text);
      }
    });
  } else {
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    text = data.choices?.[0]?.message?.content || "";
  }
  text = text.trim();
  if (!text) throw new LlmError("The model returned nothing.", "output");
  return { text, model: cfg.model };
}

/* ------------------------------ JSON extraction ------------------------------ */

/** Escape raw control characters that models sometimes leave inside JSON strings (e.g. real newlines in code). */
export function escapeRawControls(src: string): string {
  let out = "";
  let inStr = false;
  let esc = false;
  for (const ch of src) {
    if (inStr) {
      if (esc) {
        esc = false;
        out += ch;
      } else if (ch === "\\") {
        esc = true;
        out += ch;
      } else if (ch === '"') {
        inStr = false;
        out += ch;
      } else if (ch === "\n") out += "\\n";
      else if (ch === "\r") out += "\\r";
      else if (ch === "\t") out += "\\t";
      else out += ch;
    } else {
      if (ch === '"') inStr = true;
      out += ch;
    }
  }
  return out;
}

export function parseJsonLoose(text: string): unknown {
  let s = text.trim().replace(/^\uFEFF/, "");
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  const a = s.indexOf("{");
  const b = s.lastIndexOf("}");
  if (a >= 0 && b > a) s = s.slice(a, b + 1);
  try {
    return JSON.parse(s);
  } catch {
    const fixed = escapeRawControls(s).replace(/,\s*([}\]])/g, "$1");
    return JSON.parse(fixed);
  }
}

/** Ask for JSON, validate it, and on a bad shape retry once with the exact complaint. */
export async function llmJson<T>(
  cfg: LlmConfig,
  call: Omit<LlmCall, "json">,
  validate: (x: unknown) => T,
  onText?: OnText,
): Promise<{ data: T; ms: number; model: string; raw: string }> {
  let lastErr = "";
  let total = 0;
  for (let attempt = 0; attempt < 2; attempt++) {
    const r = await llm(
      cfg,
      {
        ...call,
        json: true,
        temperature: attempt ? 0 : call.temperature,
        user: attempt
          ? `${call.user}\n\nYour previous reply was rejected: ${lastErr}\nReturn ONLY the corrected JSON object.`
          : call.user,
      },
      attempt ? undefined : onText,
    );
    total += r.ms;
    try {
      return { data: validate(parseJsonLoose(r.text)), ms: total, model: r.model, raw: r.text };
    } catch (err) {
      lastErr = (err instanceof Error ? err.message : String(err)).slice(0, 300);
    }
  }
  throw new LlmError(`The AI's answer was not in the expected format (${lastErr}).`, "output");
}

/* ------------------------------- user messages ------------------------------- */

export function describeLlmError(err: unknown, provider?: string): { code: ErrorCode; message: string } {
  if (err instanceof LlmError) {
    switch (err.kind) {
      case "auth":
        return { code: "auth", message: `The AI key was rejected${provider ? ` by ${provider}` : ""}. Paste a new one on the Ask AI page or in Settings (free keys come from aistudio.google.com/apikey).` };
      case "quota":
        return { code: "quota", message: "The AI rate limit was reached. Free Gemini keys allow about 10 requests a minute, so wait a little and ask again." };
      case "model":
        return { code: "model", message: `No usable AI model was found for this key (${err.message}).` };
      case "blocked":
        return { code: "blocked", message: err.message };
      case "timeout":
        return { code: "timeout", message: "The AI took too long to answer. Try again, or ask something a little smaller." };
      case "network":
        return { code: "network", message: err.message };
      case "aborted":
        return { code: "aborted", message: "Cancelled." };
      case "output":
        return { code: "output", message: err.message };
      default:
        if (/high demand|overloaded/i.test(err.message)) {
          return { code: "busy", message: "Gemini is busy right now. Wait a few seconds and try again." };
        }
        return { code: "internal", message: `The AI service had a problem (${err.message}). Try again in a moment.` };
    }
  }
  return { code: "internal", message: err instanceof Error ? err.message : "Something went wrong." };
}
