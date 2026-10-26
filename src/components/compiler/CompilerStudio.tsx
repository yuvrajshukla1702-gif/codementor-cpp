"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { EditorDiagnostic } from "@/components/CodeEditor";
import { Icon } from "@/components/ui/icons";
import { runInstant, warmInstantRunners } from "@/lib/compiler/instant";
import { COMPILER_LANGS, type CompilerLangId } from "@/lib/compiler/languages";

const CodeEditor = dynamic(() => import("@/components/CodeEditor").then((m) => m.CodeEditor), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center text-sm text-[var(--muted)]">Loading editor…</div>
  ),
});

const STORE = "cm-compiler-v1";

type RunResult = {
  ok: boolean;
  stage?: "compile" | "run";
  stdout?: string;
  stderr?: string;
  code?: number | null;
  ms?: number;
  truncated?: boolean;
  file?: string;
  message?: string;
  note?: string;
};

type Draft = {
  lang: CompilerLangId;
  code: Partial<Record<CompilerLangId, string>>;
  stdin: string;
};

function starter(id: CompilerLangId) {
  return COMPILER_LANGS.find((l) => l.id === id) ?? COMPILER_LANGS[0];
}

function loadDraft(): Draft {
  const base: Draft = { lang: "cpp", code: {}, stdin: starter("cpp").stdin };
  if (typeof window === "undefined") return base;
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<Draft>;
    const lang = COMPILER_LANGS.some((l) => l.id === parsed.lang) ? (parsed.lang as CompilerLangId) : "cpp";
    return {
      lang,
      code: parsed.code && typeof parsed.code === "object" ? parsed.code : {},
      stdin: typeof parsed.stdin === "string" ? parsed.stdin.slice(0, 20_000) : starter(lang).stdin,
    };
  } catch {
    return base;
  }
}

function diagnosticsFrom(stderr: string): EditorDiagnostic[] {
  const out: EditorDiagnostic[] = [];
  const seen = new Set<string>();
  const push = (line: number, column: number, message: string) => {
    const key = `${line}:${column}:${message}`;
    if (seen.has(key) || out.length >= 12) return;
    seen.add(key);
    out.push({ line, column: column || 1, message, severity: "error" });
  };
  for (const m of stderr.matchAll(
    /(?:^|\n)[A-Za-z0-9_./\\-]+\.(?:cc|cpp|c|py|js|java):(\d+)(?::(\d+))?:\s*(?:fatal error:|error:|warning:)?\s*([^\n]+)/g,
  )) {
    push(Number(m[1]), Number(m[2] || 1), m[3].trim());
  }
  for (const m of stderr.matchAll(/(?:^|\n)(\d+):(\d+)\s+([^\n]+)/g)) {
    push(Number(m[1]), Number(m[2]), m[3].trim());
  }
  for (const m of stderr.matchAll(/on line (\d+)/g)) {
    push(Number(m[1]), 1, m[0]);
  }
  for (const m of stderr.matchAll(/File "[^"]+", line (\d+)/g)) {
    const line = Number(m[1]);
    const next = stderr.slice(m.index ?? 0).split("\n").find((row) => /Error|Exception/.test(row));
    push(line, 1, (next || "Error on this line").trim());
  }
  return out;
}

export function CompilerStudio() {
  const [draft, setDraft] = useState<Draft>(loadDraft);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [panel, setPanel] = useState(232);
  const lang = starter(draft.lang);
  const code = draft.code[draft.lang] ?? lang.code;

  useEffect(() => {
    localStorage.setItem(STORE, JSON.stringify(draft));
  }, [draft]);

  useEffect(() => {
    warmInstantRunners();
  }, []);

  const setCode = (value: string) => {
    setDraft((d) => ({ ...d, code: { ...d.code, [d.lang]: value } }));
  };

  const choose = (id: CompilerLangId) => {
    setResult(null);
    setDraft((d) => ({ ...d, lang: id }));
  };

  const reset = () => {
    const fresh = starter(draft.lang);
    setResult(null);
    setDraft((d) => ({ ...d, code: { ...d.code, [d.lang]: fresh.code }, stdin: fresh.stdin }));
  };

  const run = useCallback(async () => {
    if (running) return;
    const started = performance.now();
    let local: Awaited<ReturnType<typeof runInstant>> = null;
    try {
      local = await runInstant(draft.lang, code, draft.stdin);
    } catch {
      local = null;
    }
    if (local) {
      setResult({ ...local, ms: Math.max(1, Math.round(performance.now() - started)) });
      return;
    }
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(25_000),
        body: JSON.stringify({ language: draft.lang, code, stdin: draft.stdin }),
      });
      const data = (await res.json().catch(() => null)) as RunResult | null;
      setResult(data ?? { ok: false, message: "The compiler sent back something unreadable." });
    } catch {
      setResult({ ok: false, message: "The compiler did not answer. Check your connection and run again." });
    } finally {
      setRunning(false);
    }
  }, [code, draft.lang, draft.stdin, running]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        void run();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [run]);

  const markers = useMemo(() => diagnosticsFrom(result?.stderr || ""), [result?.stderr]);
  const focusLine = markers[0]?.line ?? null;
  const stdout = result?.stdout || "";
  const stderr = result?.stderr || "";
  const ran = result?.stage === "run";
  const failed = Boolean(result && !result.ok);

  const status = running
    ? "Running"
    : !result
      ? "Ready"
      : result.message
        ? "Could not run"
        : result.ok
          ? `Ran in ${result.ms ?? 0} ms`
          : result.stage === "compile"
            ? "Did not compile"
            : `Exited ${result.code ?? 1}`;

  const copyOut = async () => {
    const text = [stdout, stderr].filter(Boolean).join(stdout && stderr ? "\n" : "");
    if (!text) return;
    await navigator.clipboard.writeText(text).catch(() => {});
  };

  const drag = (event: React.PointerEvent<HTMLDivElement>) => {
    const startY = event.clientY;
    const startH = panel;
    const move = (ev: PointerEvent) => {
      setPanel(Math.min(440, Math.max(150, startH - (ev.clientY - startY))));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <div className="flex h-[calc(100dvh-3.5rem-1.5rem)] w-full min-w-0 flex-col overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--bg)]">
      <header className="flex items-center gap-2 border-b border-[var(--line)] px-3 py-2.5 sm:px-4">
        <div className="mr-1 hidden items-center gap-2 sm:flex">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--accent)] text-[var(--accent-ink)]">
            <Icon name="terminal" size={16} />
          </span>
          <div className="leading-tight">
            <p className="font-display text-[15px] text-[var(--ink)]">Compiler</p>
            <p className="text-[11px] text-[var(--faint)]">{lang.file}</p>
          </div>
        </div>

        <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto" role="tablist" aria-label="Language">
          {COMPILER_LANGS.map((item) => {
            const on = item.id === draft.lang;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={on}
                className={`btn btn-sm shrink-0 ${on ? "btn-primary" : ""}`}
                onClick={() => choose(item.id)}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button type="button" className="btn btn-sm btn-quiet" onClick={reset}>
            <Icon name="reset" size={14} />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <button type="button" className="btn btn-primary" onClick={() => void run()} disabled={running}>
            <Icon name="play" size={14} fill="currentColor" />
            {running ? "Running…" : "Run"}
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1">
        <CodeEditor
          value={code}
          onChange={setCode}
          language={lang.monaco}
          height="100%"
          diagnostics={markers}
          focusLine={focusLine}
          onRun={() => void run()}
        />
      </div>

      <div
        role="separator"
        aria-orientation="horizontal"
        aria-label="Resize input and output"
        onPointerDown={drag}
        className="h-1.5 shrink-0 cursor-row-resize bg-[var(--line)] hover:bg-[var(--accent)]"
      />

      <section className="grid shrink-0 grid-rows-2 lg:grid-cols-[minmax(240px,320px)_1fr] lg:grid-rows-1" style={{ height: panel }}>
        <label className="flex min-h-0 flex-col border-b border-[var(--line)] lg:border-b-0 lg:border-r">
          <span className="flex items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--faint)]">
            Input
            <span className="font-normal normal-case tracking-normal">stdin</span>
          </span>
          <textarea
            value={draft.stdin}
            onChange={(e) => setDraft((d) => ({ ...d, stdin: e.target.value }))}
            spellCheck={false}
            className="min-h-0 flex-1 resize-none bg-transparent px-3 pb-3 font-mono text-[13px] leading-6 text-[var(--ink)] outline-none placeholder:text-[var(--faint)]"
            placeholder="Numbers or text the program reads"
            aria-label="Program input"
          />
        </label>

        <div className="flex min-h-0 flex-col">
          <div className="flex items-center gap-2 px-3 py-2">
            <span
              className={`chip ${
                running
                  ? ""
                  : result?.ok
                    ? "!border-[rgba(200,246,93,0.45)] !text-[var(--accent)]"
                    : failed
                      ? "!border-[rgba(255,122,69,0.45)] !text-[var(--ember)]"
                      : ""
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  running ? "bg-[var(--gold)]" : result?.ok ? "bg-[var(--accent)]" : failed ? "bg-[var(--ember)]" : "bg-[var(--faint)]"
                }`}
              />
              {status}
            </span>
            {ran && result?.code === 0 && <span className="text-[11px] text-[var(--faint)]">exit 0</span>}
            <span className="ml-auto flex items-center gap-1">
              <button type="button" className="btn btn-sm btn-quiet" onClick={() => void copyOut()} disabled={!stdout && !stderr}>
                <Icon name="copy" size={13} />
                Copy
              </button>
              <button type="button" className="btn btn-sm btn-quiet" onClick={() => setResult(null)} disabled={!result}>
                Clear
              </button>
            </span>
          </div>
          <div className="min-h-0 flex-1 overflow-auto px-3 pb-3">
            {running && <p className="font-mono text-[13px] text-[var(--muted)]">Compiling and running…</p>}
            {!running && !result && (
              <p className="max-w-md text-sm leading-relaxed text-[var(--muted)]">
                Write a program and press Run. Ctrl+Enter works from the editor. This example reads two numbers and prints their sum.
                {draft.lang === "java" ? " In Java the class has to be named Main." : ""}
              </p>
            )}
            {!running && result?.note && <p className="mb-2 max-w-xl text-sm leading-relaxed text-[var(--muted)]">{result.note}</p>}
            {!running && result?.message && <p className="text-sm text-[var(--ember)]">{result.message}</p>}
            {!running && stdout && (
              <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-6 text-[var(--ink)]">{stdout}</pre>
            )}
            {!running && stderr && (
              <pre className={`whitespace-pre-wrap break-words font-mono text-[13px] leading-6 text-[var(--ember)] ${stdout ? "mt-3" : ""}`}>
                {stderr}
              </pre>
            )}
            {!running && result && !result.message && !result.note && !stdout && !stderr && (
              <p className="font-mono text-[13px] text-[var(--muted)]">No output.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
