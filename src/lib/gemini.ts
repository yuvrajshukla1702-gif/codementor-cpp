import { createRequire } from "module";
import { join } from "path";
import { offlineShortGrade, offlineTeacher, tutorSystemPrompt } from "./teacher";
import type { Problem } from "./types";

export { tutorSystemPrompt, offlineTeacher } from "./teacher";

const require = createRequire(join(process.cwd(), "package.json"));

export type TutorProvider = "cursor" | "gemini" | "ollama" | "builtin";

const OLLAMA_BASE = (process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434").replace(/\/$/, "");
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:7b";

export async function askTutor(params: {
  geminiApiKey?: string;
  cursorApiKey?: string;
  system: string;
  user: string;
  problem: Problem;
  hintLevel: number;
  code: string;
  judgeSummary: string;
  tone: string;
}): Promise<{ reply: string; provider: TutorProvider }> {
  const cursorKey = (params.cursorApiKey || process.env.CURSOR_API_KEY || "").trim();
  if (cursorKey) {
    try {
      const reply = await askCursor({
        apiKey: cursorKey,
        system: params.system,
        user: params.user,
      });
      if (reply.trim()) return { reply, provider: "cursor" };
    } catch {
      /* fall through */
    }
  }

  const geminiKey = (params.geminiApiKey || process.env.GEMINI_API_KEY || "").trim();
  if (geminiKey) {
    try {
      const reply = await askGemini({ apiKey: geminiKey, system: params.system, user: params.user });
      if (reply.trim()) return { reply, provider: "gemini" };
    } catch {
      /* fall through */
    }
  }

  // Local Ollama — no cloud key / no Gemini subscription needed
  try {
    if (await ollamaAvailable()) {
      const reply = await askOllama({ system: params.system, user: params.user });
      if (reply.trim()) return { reply, provider: "ollama" };
    }
  } catch {
    /* fall through */
  }

  return {
    reply: offlineTeacher({
      problem: params.problem,
      hintLevel: params.hintLevel,
      code: params.code,
      judgeSummary: params.judgeSummary,
      tone: params.tone,
    }),
    provider: "builtin",
  };
}

export async function gradeWithTutor(params: {
  geminiApiKey?: string;
  cursorApiKey?: string;
  tone: string;
  section: string;
  prompt: string;
  answer: string;
}): Promise<{ score: number; feedback: string; provider: string }> {
  const system = tutorSystemPrompt(params.tone);
  const user = `Grade this interview answer 0-10. Start with "Score: N/10". Give brief feedback and a stronger sample outline (not a speech to memorize).\nQUESTION (${params.section}): ${params.prompt}\nANSWER:\n${params.answer}`;

  const cursorKey = (params.cursorApiKey || process.env.CURSOR_API_KEY || "").trim();
  if (cursorKey) {
    try {
      const reply = await askCursor({ apiKey: cursorKey, system, user });
      if (reply.trim()) {
        const scoreMatch = reply.match(/\b([0-9]|10)\b/);
        return { score: scoreMatch ? Number(scoreMatch[1]) : 5, feedback: reply, provider: "cursor" };
      }
    } catch {
      /* fall through */
    }
  }

  const geminiKey = (params.geminiApiKey || process.env.GEMINI_API_KEY || "").trim();
  if (geminiKey) {
    try {
      const reply = await askGemini({ apiKey: geminiKey, system, user });
      if (reply.trim()) {
        const scoreMatch = reply.match(/\b([0-9]|10)\b/);
        return { score: scoreMatch ? Number(scoreMatch[1]) : 5, feedback: reply, provider: "gemini" };
      }
    } catch {
      /* fall through */
    }
  }

  try {
    if (await ollamaAvailable()) {
      const reply = await askOllama({ system, user });
      if (reply.trim()) {
        const scoreMatch = reply.match(/\b([0-9]|10)\b/);
        return { score: scoreMatch ? Number(scoreMatch[1]) : 5, feedback: reply, provider: "ollama" };
      }
    }
  } catch {
    /* fall through */
  }

  const offline = offlineShortGrade({
    prompt: params.prompt,
    answer: params.answer,
    section: params.section,
    tone: params.tone,
  });
  return { ...offline, provider: "builtin" };
}

export async function detectTutorMode(settings: {
  geminiApiKey?: string | null;
  cursorApiKey?: string | null;
}): Promise<TutorProvider> {
  if ((settings.cursorApiKey || process.env.CURSOR_API_KEY || "").trim()) return "cursor";
  if ((settings.geminiApiKey || process.env.GEMINI_API_KEY || "").trim()) return "gemini";
  if (await ollamaAvailable()) return "ollama";
  return "builtin";
}

async function ollamaAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`, { signal: AbortSignal.timeout(1500) });
    if (!res.ok) return false;
    const data = (await res.json()) as { models?: Array<{ name?: string }> };
    return Array.isArray(data.models) && data.models.length > 0;
  } catch {
    return false;
  }
}

async function askOllama(params: { system: string; user: string }): Promise<string> {
  const preferred = OLLAMA_MODEL;
  const fallback = "llama3.2:1b";
  let model = preferred;

  try {
    const tags = await fetch(`${OLLAMA_BASE}/api/tags`, { signal: AbortSignal.timeout(2000) });
    const data = (await tags.json()) as { models?: Array<{ name?: string }> };
    const names = (data.models || []).map((m) => m.name || "");
    if (!names.some((n) => n === preferred || n.startsWith(preferred + ":"))) {
      if (names.some((n) => n.includes("llama3.2"))) model = names.find((n) => n.includes("llama3.2")) || fallback;
      else if (names[0]) model = names[0];
    }
  } catch {
    model = fallback;
  }

  const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      options: { temperature: 0.4, num_predict: 400 },
      messages: [
        { role: "system", content: params.system },
        { role: "user", content: params.user },
      ],
    }),
    signal: AbortSignal.timeout(90000),
  });
  if (!res.ok) throw new Error(`Ollama ${res.status}`);
  const data = (await res.json()) as { message?: { content?: string } };
  return (data.message?.content || "").trim();
}

async function askCursor(params: { apiKey: string; system: string; user: string }): Promise<string> {
  const sdk = require("@cursor/sdk") as {
    Agent: {
      prompt: (
        prompt: string,
        opts: { apiKey: string; model: { id: string }; local: { cwd: string } },
      ) => Promise<{ status: string; result?: unknown }>;
    };
  };
  const prompt = `${params.system}\n\n---\n\n${params.user}\n\nRemember: do not edit files. Teaching reply only.`;
  const result = await sdk.Agent.prompt(prompt, {
    apiKey: params.apiKey,
    model: { id: "composer-2.5" },
    local: { cwd: process.cwd() },
  });
  if (typeof result.result === "string") return result.result;
  return "";
}

async function askGemini(params: { apiKey: string; system: string; user: string }): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(params.apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: `${params.system}\n\n---\n\n${params.user}` }],
        },
      ],
      generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini ${res.status}`);
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("").trim() || "";
}
