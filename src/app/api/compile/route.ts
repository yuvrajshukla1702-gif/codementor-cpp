import { NextResponse } from "next/server";
import { allow, clientIp, isLocal } from "@/lib/agent/limit";
import { compilerLang } from "@/lib/compiler/languages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX_CODE = 40_000;
const MAX_STDIN = 20_000;
const MAX_OUT = 24_000;
const RUNNER = "https://wandbox.org/api/compile.json";

const JAVA_STUB = `public class prog {
    public static void main(String[] args) throws Exception {
        Main.main(args);
    }
}
`;

type WandboxResult = {
  status?: string;
  compiler_output?: string;
  compiler_error?: string;
  compiler_message?: string;
  program_output?: string;
  program_error?: string;
};

function clip(text: string): { text: string; truncated: boolean } {
  if (text.length <= MAX_OUT) return { text, truncated: false };
  return { text: text.slice(0, MAX_OUT) + "\n… output cut off", truncated: true };
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { language?: unknown; code?: unknown; stdin?: unknown } | null;
  const language = typeof body?.language === "string" ? body.language : "";
  const code = typeof body?.code === "string" ? body.code : "";
  const stdin = typeof body?.stdin === "string" ? body.stdin : "";
  const lang = compilerLang(language);

  if (!lang) {
    return NextResponse.json({ ok: false, message: "Pick C, C++, Python, Java, or JavaScript." }, { status: 400 });
  }
  if (!code.trim()) {
    return NextResponse.json({ ok: false, message: "Write some code first." }, { status: 400 });
  }
  if (code.length > MAX_CODE || stdin.length > MAX_STDIN) {
    return NextResponse.json({ ok: false, message: "That program is too long to run here." }, { status: 413 });
  }

  const ip = clientIp(req);
  const cap = isLocal(ip) ? 80 : 30;
  if (!allow(`compile:${ip}`, cap, 10 * 60_000)) {
    return NextResponse.json(
      { ok: false, message: "Too many runs. Wait a minute and try again." },
      { status: 429 },
    );
  }

  const payload: Record<string, unknown> = {
    compiler: lang.compiler,
    code: lang.id === "java" ? JAVA_STUB : code,
    stdin,
    save: false,
  };
  if (lang.options) payload.options = lang.options;
  if (lang.id === "java") payload.codes = [{ file: "Main.java", code }];

  const started = Date.now();
  let result: WandboxResult;
  try {
    const res = await fetch(RUNNER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(25_000),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, message: "The compiler could not run that. Try again in a moment." },
        { status: 502 },
      );
    }
    result = (await res.json()) as WandboxResult;
  } catch {
    return NextResponse.json(
      { ok: false, message: "The compiler did not answer in time. Try a smaller program." },
      { status: 504 },
    );
  }

  const status = String(result.status ?? "1");
  const ok = status === "0";
  const stdout = clip(result.program_output || "");
  let errText = ok
    ? result.program_error || ""
    : result.compiler_error || result.compiler_message || result.program_error || result.compiler_output || "";
  if (lang.id === "java" && /cannot find symbol/.test(errText) && /\bMain\b/.test(errText)) {
    errText = "Java on this page needs a class named Main, with public static void main.\n\n" + errText;
  }
  const stderr = clip(errText);
  const stage = !ok && (result.compiler_error || result.compiler_message) && !result.program_output ? "compile" : "run";

  return NextResponse.json(
    {
      ok,
      stage,
      stdout: stdout.text,
      stderr: stderr.text,
      code: Number.isFinite(Number(status)) ? Number(status) : 1,
      ms: Date.now() - started,
      truncated: stdout.truncated || stderr.truncated,
      file: lang.file,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
