import type { CompilerLangId } from "./languages";

export type InstantResult = {
  ok: boolean;
  stage: "compile" | "run";
  stdout: string;
  stderr: string;
  code: number;
  ms: number;
};

const MAX_OUT = 24_000;
const STEP_MS = 800;

type SkulptApi = {
  python3: object;
  execLimit: number;
  builtinFiles?: { files: Record<string, string> };
  configure: (options: Record<string, unknown>) => void;
  misceval: { asyncToPromise: (fn: () => unknown) => Promise<unknown> };
  importMainWithBody: (name: string, dump: boolean, code: string, python3: boolean) => unknown;
};

function clip(text: string) {
  return text.length <= MAX_OUT ? text : text.slice(0, MAX_OUT) + "\n… output cut off";
}

function needsRealCompiler(message: string) {
  return /cannot find library|not supported|is not implemented/i.test(message);
}

let skulptLoading: Promise<void> | null = null;

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load the Python runner."));
    document.head.appendChild(script);
  });
}

function ensureSkulpt() {
  if (!skulptLoading) {
    skulptLoading = loadScript("/compiler/skulpt.min.js").then(() => loadScript("/compiler/skulpt-stdlib.js"));
  }
  return skulptLoading;
}

async function runPython(code: string, stdin: string): Promise<InstantResult | null> {
  const started = Date.now();
  try {
    await ensureSkulpt();
  } catch {
    return null;
  }
  const Sk = (window as unknown as { Sk?: SkulptApi }).Sk;
  if (!Sk) return null;
  let stdout = "";
  const lines = stdin.replace(/\r\n/g, "\n").split("\n");
  let line = 0;
  Sk.execLimit = 200_000;
  Sk.configure({
    __future__: Sk.python3,
    output: (text: string) => {
      if (stdout.length < MAX_OUT) stdout += text;
    },
    read: (file: string) => {
      const files = Sk.builtinFiles?.files;
      if (!files || files[file] === undefined) throw new Error("File not found: " + file);
      return files[file];
    },
    inputfun: () => lines[line++] ?? "",
    inputfunTakesPrompt: true,
  });
  try {
    await Sk.misceval.asyncToPromise(() => Sk.importMainWithBody("<stdin>", false, code, true));
    return { ok: true, stage: "run", stdout: clip(stdout), stderr: "", code: 0, ms: Date.now() - started };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : error && typeof error === "object" && "toString" in error
          ? String(error)
          : String(error);
    if (/No module named|ImportError/i.test(message)) return null;
    return { ok: false, stage: "compile", stdout: clip(stdout), stderr: message, code: 1, ms: Date.now() - started };
  }
}

async function runCppFamily(code: string, stdin: string): Promise<InstantResult | null> {
  const started = Date.now();
  const loaded = await import("JSCPP");
  const JSCPP = (loaded.default ?? loaded) as {
    run: (code: string, input: string, config: { stdio: { write: (s: string) => void }; maxTimeout: number }) => number;
  };
  let stdout = "";
  try {
    const exit = JSCPP.run(code, stdin, {
      stdio: {
        write: (text) => {
          if (stdout.length < MAX_OUT) stdout += text;
        },
      },
      maxTimeout: STEP_MS,
    });
    const codeNum = typeof exit === "number" ? exit : 0;
    return { ok: codeNum === 0, stage: "run", stdout: clip(stdout), stderr: "", code: codeNum, ms: Date.now() - started };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (needsRealCompiler(message)) return null;
    const stage = /time limit/i.test(message) ? "run" : "compile";
    return { ok: false, stage, stdout: clip(stdout), stderr: message, code: 1, ms: Date.now() - started };
  }
}

function runJavaScript(code: string, stdin: string): Promise<InstantResult | null> {
  const started = Date.now();
  const source = `
    self.onmessage = (event) => {
      const code = event.data.code;
      const stdin = event.data.stdin;
      let stdout = "";
      let stderr = "";
      const fs = { readFileSync: () => stdin };
      const require = (name) => {
        if (name === "fs") return fs;
        throw new Error(name + " is not available in this runner");
      };
      const console = {
        log: (...args) => { stdout += args.map(String).join(" ") + "\\n"; },
        error: (...args) => { stderr += args.map(String).join(" ") + "\\n"; },
      };
      const process = { argv: ["node", "main.js"], stdin, stdout: { write: (text) => { stdout += String(text); } } };
      try {
        const fn = new Function("require", "console", "process", code);
        fn(require, console, process);
        self.postMessage({ ok: true, stdout, stderr, code: 0 });
      } catch (error) {
        self.postMessage({ ok: false, stdout, stderr: stderr + (error && error.message ? error.message : String(error)), code: 1 });
      }
    };
  `;
  return new Promise((resolve) => {
    const blob = new Blob([source], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    const timer = window.setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({
        ok: false,
        stage: "run",
        stdout: "",
        stderr: "Time limit exceeded.",
        code: 1,
        ms: Date.now() - started,
      });
    }, STEP_MS);
    worker.onmessage = (event: MessageEvent<{ ok: boolean; stdout: string; stderr: string; code: number }>) => {
      window.clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      const data = event.data;
      resolve({
        ok: data.ok,
        stage: data.ok ? "run" : "compile",
        stdout: clip(data.stdout || ""),
        stderr: clip(data.stderr || ""),
        code: data.code,
        ms: Date.now() - started,
      });
    };
    worker.onerror = () => {
      window.clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(null);
    };
    worker.postMessage({ code, stdin });
  });
}

/** Run in the page when we can. Returns null when the real compiler should take over. */
export async function runInstant(language: CompilerLangId, code: string, stdin: string): Promise<InstantResult | null> {
  if (language === "java") return null;
  if (language === "python") return runPython(code, stdin);
  if (language === "javascript") return runJavaScript(code, stdin);
  return runCppFamily(code, stdin);
}

export function warmInstantRunners() {
  if (typeof window === "undefined") return;
  void import("JSCPP").catch(() => {});
  void ensureSkulpt().catch(() => {
    skulptLoading = null;
  });
}
