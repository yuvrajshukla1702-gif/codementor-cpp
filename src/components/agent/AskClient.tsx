"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icons";
import { PageHeader } from "@/components/ui/kit";
import type { AgentAnswer, AgentStatus } from "@/lib/agent/types";
import { AnswerView } from "./AnswerView";
import { Pill, Spinner, compilerName } from "./parts";
import { useAgent, type Mark, type Run } from "./useAgent";

const MAX_CHARS = 6000;

const EXAMPLES: Array<{ label: string; text: string }> = [
  {
    label: "Two Sum",
    text: "Two Sum: given an array of integers nums and an integer target, return the indices of the two numbers that add up to target. Exactly one solution exists.",
  },
  { label: "Reverse a linked list", text: "Reverse a singly linked list and show how the pointers move on 1 -> 2 -> 3 -> 4." },
  { label: "Binary search", text: "Explain binary search and show how it finds 23 in the sorted array 4 8 15 16 23 42." },
  { label: "Stack vs queue", text: "What is the difference between a stack and a queue? When do I use each one?" },
  {
    label: "Why is my code wrong?",
    text: "Why does this return the wrong answer for n = 1?\n\nint fib(int n) {\n  if (n <= 1) return 0;\n  return fib(n - 1) + fib(n - 2);\n}",
  },
];

const STEPS: Array<{ key: Mark; label: string }> = [
  { key: "hook", label: "Understand" },
  { key: "explain", label: "Explain" },
  { key: "code", label: "Write code" },
  { key: "verify", label: "Test it" },
  { key: "dry", label: "Dry run" },
  { key: "video", label: "Video" },
];

const ERROR_TITLES: Record<string, string> = {
  no_key: "Add a free AI key first",
  auth: "The AI key was rejected",
  quota: "The free AI limit is used up for now",
  model: "The AI model is not available",
  blocked: "The AI declined this question",
  network: "Could not reach the AI",
  timeout: "That took too long",
  output: "The AI's answer was not usable",
  off_topic: "That is not a programming question",
  bad_request: "Check the question",
  busy: "The agent is busy",
  internal: "Something broke on the server",
};

/* ------------------------------------------ status ------------------------------------------ */

function useStatus() {
  const [status, setStatus] = useState<AgentStatus | null>(null);
  const [failed, setFailed] = useState(false);

  const refresh = useCallback(async (test = false): Promise<AgentStatus | null> => {
    try {
      const res = await fetch(`/api/agent/status${test ? "?test=1" : ""}`, { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const j = (await res.json()) as AgentStatus;
      setStatus(j);
      setFailed(false);
      return j;
    } catch {
      setFailed(true);
      return null;
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { status, failed, refresh };
}

const providerName = (s: AgentStatus) => (s.provider === "gemini" ? "Gemini" : s.provider === "openai" ? "OpenAI-compatible" : "AI");

function StatusRow({
  status,
  failed,
  onTest,
  onToggleKey,
  keyOpen,
  keyBad,
}: {
  status: AgentStatus | null;
  failed: boolean;
  onTest: () => Promise<void>;
  onToggleKey: () => void;
  keyOpen: boolean;
  /** The saved key was refused by the provider (found by a test or by a failed question). */
  keyBad: boolean;
}) {
  const [testing, setTesting] = useState(false);

  if (failed) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Pill tone="bad">
          <Icon name="info" size={12} /> Could not read the agent status
        </Pill>
      </div>
    );
  }
  if (!status) {
    return (
      <div className="flex gap-2" aria-hidden>
        <span className="skeleton h-6 w-40 !rounded-full" />
        <span className="skeleton h-6 w-28 !rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status.configured && keyBad ? (
        <Pill tone="bad">
          <Icon name="info" size={12} /> {providerName(status)} key rejected
        </Pill>
      ) : status.configured ? (
        <Pill tone="ok">
          <Icon name="check" size={12} strokeWidth={2.6} />
          {providerName(status)}
          {status.model ? ` · ${status.model}` : ""}
        </Pill>
      ) : (
        <Pill tone="warn">
          <Icon name="info" size={12} /> No AI key yet
        </Pill>
      )}
      {status.compiler.ok ? (
        <Pill tone="info">
          <Icon name="terminal" size={12} /> {compilerName(status.compiler.version)} ready to test code
        </Pill>
      ) : (
        <Pill tone="warn">
          <Icon name="info" size={12} /> No C++ compiler here, so code cannot be tested
        </Pill>
      )}
      {status.configured && (
        <>
          <button
            type="button"
            className="btn btn-sm btn-quiet"
            disabled={testing}
            onClick={async () => {
              setTesting(true);
              await onTest();
              setTesting(false);
            }}
          >
            {testing ? <Spinner size={12} /> : <Icon name="bolt" size={13} />}
            Test connection
          </button>
          <button type="button" className="btn btn-sm btn-quiet" onClick={onToggleKey} aria-expanded={keyOpen}>
            <Icon name="sliders" size={13} /> Change key
          </button>
        </>
      )}
      {status.test && !testing && !keyBad && (
        <span className={`text-xs ${status.test.ok ? "text-[var(--accent)]" : "text-[var(--bad)]"}`}>
          {status.test.ok ? `Connected in ${((status.test.ms ?? 0) / 1000).toFixed(1)} s` : status.test.message}
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------ setup ------------------------------------------ */

function SetupCard({
  status,
  highlight,
  rejected,
  onSaved,
  onDemo,
  busy,
}: {
  status: AgentStatus | null;
  highlight: boolean;
  /** A key is saved but the provider refused it. */
  rejected: boolean;
  onSaved: () => Promise<AgentStatus | null>;
  onDemo: (id: string, label: string) => void;
  busy: boolean;
}) {
  const [key, setKey] = useState("");
  const [state, setState] = useState<{ phase: "idle" | "saving" | "ok" | "bad"; msg?: string }>({ phase: "idle" });

  async function save() {
    const k = key.trim();
    if (k.length < 20) {
      setState({ phase: "bad", msg: "That looks too short for an API key. Copy the whole key from Google AI Studio." });
      return;
    }
    setState({ phase: "saving" });
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ geminiApiKey: k }),
      });
      if (!res.ok) throw new Error("The key could not be saved. On a hosted copy, set the GEMINI_API_KEY environment variable instead.");
      setKey("");
      const j = await onSaved();
      if (j?.test?.ok) setState({ phase: "ok", msg: `Connected in ${((j.test.ms ?? 0) / 1000).toFixed(1)} s. You can ask now.` });
      else setState({ phase: "bad", msg: j?.test?.message || "The key was saved, but a test call to the AI failed." });
    } catch (err) {
      setState({ phase: "bad", msg: err instanceof Error ? err.message : "Could not save the key." });
    }
  }

  return (
    <section
      id="ask-setup"
      className={`card cm-fade overflow-hidden transition-[border-color,box-shadow] ${highlight ? "!border-[var(--accent-line)] !shadow-[0_0_0_3px_var(--accent-soft)]" : ""}`}
    >
      <div className="grid gap-0 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <div className="space-y-4 p-5 sm:p-6">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
              <Icon name="sparkles" size={16} />
            </span>
            <div>
              <h2 className="font-display text-xl tracking-[-0.02em]">{rejected ? "The saved AI key was rejected" : "Turn on your personal AI"}</h2>
              <p className="text-xs text-[var(--muted)]">
                {rejected ? "It was not accepted. A fresh free key takes about a minute." : "One free key. About a minute. No card needed."}
              </p>
            </div>
          </div>

          <ol className="space-y-3 text-sm leading-relaxed">
            <li className="flex gap-3">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[11px] font-bold text-[var(--accent)]">1</span>
              <span>
                Open{" "}
                <a
                  className="font-medium text-[var(--accent)] underline decoration-[var(--accent-line)] underline-offset-4 hover:decoration-[var(--accent)]"
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noreferrer"
                >
                  aistudio.google.com/apikey
                </a>{" "}
                and press <strong className="text-[var(--ink)]">Create API key</strong>.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[11px] font-bold text-[var(--accent)]">2</span>
              <span>Paste it here. It is saved on this computer only.</span>
            </li>
          </ol>

          <form
            className="flex flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
          >
            <input
              className="input font-mono"
              type="password"
              autoComplete="off"
              spellCheck={false}
              placeholder="Paste your Gemini API key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              aria-label="Gemini API key"
            />
            <button type="submit" className="btn btn-primary shrink-0" disabled={state.phase === "saving" || !key.trim()}>
              {state.phase === "saving" ? <Spinner size={13} /> : <Icon name="check" size={14} strokeWidth={2.6} />}
              Save and test
            </button>
          </form>
          {state.msg && (
            <p className={`flex items-start gap-2 text-xs leading-relaxed ${state.phase === "ok" ? "text-[var(--accent)]" : "text-[var(--bad)]"}`}>
              <Icon name={state.phase === "ok" ? "check" : "info"} size={13} className="mt-px shrink-0" />
              {state.msg}
            </p>
          )}
        </div>

        <div className="space-y-3 border-t border-[var(--line)] bg-[var(--panel-2)]/60 p-5 sm:p-6 md:border-l md:border-t-0">
          <p className="eyebrow">No key yet?</p>
          <p className="text-sm leading-relaxed text-[var(--muted)]">
            Watch a ready-made answer. The text is pre-written, but the C++ is compiled, tested and traced for real on this computer.
          </p>
          <div className="flex flex-col gap-2">
            {(status?.demo ?? []).map((d) => (
              <button
                key={d.id}
                type="button"
                className="btn !h-auto !justify-start !whitespace-normal !py-2 text-left"
                disabled={busy}
                onClick={() => onDemo(d.id, d.label)}
              >
                <Icon name="play" size={13} fill="currentColor" strokeWidth={1.2} className="shrink-0 text-[var(--accent)]" />
                {d.label}
              </button>
            ))}
            {!status && <span className="skeleton h-9 w-full" aria-hidden />}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------ progress ------------------------------------------ */

/** Own state so the 5 Hz tick never re-renders the answer. */
function Elapsed({ startedAt }: { startedAt: number }) {
  const [now, setNow] = useState(() => performance.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(performance.now()), 200);
    return () => window.clearInterval(id);
  }, []);
  return <span className="tabular-nums">{(Math.max(0, now - startedAt) / 1000).toFixed(1)} s</span>;
}

function Progress({ run, onStop }: { run: Run; onStop: () => void }) {
  const done = STEPS.filter((s) => run.marks[s.key] !== undefined).length;
  const activeIdx = STEPS.findIndex((s) => run.marks[s.key] === undefined);
  return (
    <section className="card cm-fade p-4 sm:p-5" aria-live="polite">
      <div className="flex items-center gap-3">
        <Spinner size={16} />
        <p className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--ink)]">{run.stageMsg || "Working"}…</p>
        <span className="text-xs text-[var(--muted)]">
          <Elapsed startedAt={run.startedAt} />
        </span>
        <button type="button" className="btn btn-sm" onClick={onStop}>
          <Icon name="x" size={13} strokeWidth={2.4} /> Stop
        </button>
      </div>

      <div className="mt-4 h-1 overflow-hidden rounded-full bg-[var(--line)]" aria-hidden>
        <div
          className="h-full origin-left rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-2))] transition-transform duration-500 ease-out"
          style={{ transform: `scaleX(${Math.max(0.04, done / STEPS.length)})` }}
        />
      </div>

      <ol className="mt-3 grid grid-cols-3 gap-x-2 gap-y-2.5 sm:grid-cols-6">
        {STEPS.map((s, i) => {
          const t = run.marks[s.key];
          const state = t !== undefined ? "done" : i === activeIdx ? "active" : "todo";
          return (
            <li key={s.key} className="flex items-center gap-2 text-xs">
              <span
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                  state === "done"
                    ? "border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent)]"
                    : state === "active"
                      ? "border-[var(--accent-line)] text-[var(--accent)]"
                      : "border-[var(--line-strong)] text-[var(--faint)]"
                }`}
              >
                {state === "done" ? <Icon name="check" size={11} strokeWidth={3} /> : state === "active" ? <Spinner size={10} /> : <Icon name="dot" size={8} />}
              </span>
              <span className="min-w-0">
                <span className={`block truncate font-medium ${state === "todo" ? "text-[var(--faint)]" : "text-[var(--ink)]"}`}>{s.label}</span>
                {t !== undefined && <span className="block tabular-nums text-[10px] text-[var(--faint)]">{(t / 1000).toFixed(1)} s</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function ErrorCard({ run, onRetry, onSetup }: { run: Run; onRetry: () => void; onSetup: () => void }) {
  const err = run.error;
  if (!err) return null;
  const keyProblem = err.code === "no_key" || err.code === "auth";
  const retryable = !keyProblem && err.code !== "off_topic" && err.code !== "bad_request";
  return (
    <section className="cm-fade flex items-start gap-3 rounded-[var(--radius)] border border-[rgba(255,107,129,0.4)] bg-[rgba(255,107,129,0.07)] p-4 sm:p-5" role="alert">
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[rgba(255,107,129,0.4)] text-[var(--bad)]">
        <Icon name="info" size={14} strokeWidth={2.4} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-lg text-[var(--ink)]">
          {err.code === "busy" && /Gemini is busy/i.test(err.message) ? "Gemini is busy" : (ERROR_TITLES[err.code] ?? "Something went wrong")}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{err.message}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {keyProblem && (
            <button type="button" className="btn btn-sm btn-primary" onClick={onSetup}>
              <Icon name="sparkles" size={13} /> Set up the key
            </button>
          )}
          {retryable && (
            <button type="button" className="btn btn-sm" onClick={onRetry}>
              <Icon name="reset" size={13} /> Try again
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------ pieces ------------------------------------------ */

function Recent({ items, activeId, onOpen, onRemove }: { items: AgentAnswer[]; activeId?: string; onOpen: (a: AgentAnswer) => void; onRemove: (id: string) => void }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-2">
      <p className="eyebrow">Recent answers</p>
      <div className="flex flex-wrap gap-2">
        {items.map((h) => (
          <span
            key={h.id}
            className={`group inline-flex max-w-full items-center overflow-hidden rounded-full border text-xs transition-colors ${
              h.id === activeId ? "border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent)]" : "border-[var(--line)] bg-[var(--panel-2)] text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <button type="button" className="min-w-0 truncate py-1.5 pl-3 pr-2 font-medium" onClick={() => onOpen(h)} title={h.question}>
              {h.hook.title}
            </button>
            <button
              type="button"
              className="grid h-full shrink-0 place-items-center py-1.5 pl-1 pr-2.5 opacity-50 transition-opacity hover:text-[var(--bad)] hover:opacity-100 group-hover:opacity-100"
              onClick={() => onRemove(h.id)}
              aria-label={`Remove ${h.hook.title}`}
            >
              <Icon name="x" size={12} strokeWidth={2.4} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

function Trust() {
  const items: Array<{ icon: "terminal" | "list" | "lock"; title: string; body: string }> = [
    {
      icon: "terminal",
      title: "It tests its own code",
      body: "Every answer is compiled with g++ on this computer and run on test cases. If a check fails, the AI is shown the real error and fixes it.",
    },
    {
      icon: "list",
      title: "The dry run is real",
      body: "The whiteboard values come from running the program step by step, not from the AI guessing what the variables might be.",
    },
    {
      icon: "lock",
      title: "It says when it is unsure",
      body: "If code could not be tested, or a check still fails, you see a clear warning instead of a confident answer.",
    },
  ];
  return (
    <section className="grid gap-3 sm:grid-cols-3" aria-label="How accuracy is protected">
      {items.map((it) => (
        <div key={it.title} className="card p-4 sm:p-5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--chip)] text-[var(--accent)]">
            <Icon name={it.icon} size={16} />
          </span>
          <h3 className="mt-3 font-display text-lg tracking-[-0.02em]">{it.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">{it.body}</p>
        </div>
      ))}
    </section>
  );
}

/* ------------------------------------------ page ------------------------------------------ */

export default function AskClient({ initialQ = "" }: { initialQ?: string }) {
  const { run, history, ask, stop, open, remove, reset, updateVideo, saveLangs } = useAgent();
  const { status, failed, refresh } = useStatus();
  const [text, setText] = useState("");
  const [keyOpen, setKeyOpen] = useState(false);
  const [needKey, setNeedKey] = useState(false);
  const [keyBad, setKeyBad] = useState(false);
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const setupRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  const running = !!run?.running;
  const configured = !!status?.configured;
  const showSetup = !!status && (!status.configured || keyOpen || keyBad);

  // /ask?q=... pre-fills the box (used by the search palette and links from other pages).
  useEffect(() => {
    if (initialQ) setText(initialQ.slice(0, MAX_CHARS));
  }, [initialQ]);

  // Grow the box with its content.
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 340)}px`;
  }, [text]);

  const revealSetup = useCallback(() => {
    setKeyOpen(true);
    setNeedKey(true);
    window.setTimeout(() => setupRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
    window.setTimeout(() => setNeedKey(false), 2400);
  }, []);

  // A saved key that the provider refuses: say so on the chip and open the key box right away.
  const runErrorCode = run?.error?.code;
  useEffect(() => {
    if (runErrorCode === "auth") {
      setKeyBad(true);
      revealSetup();
    }
  }, [runErrorCode, run?.id, revealSetup]);

  // "Test connection" / "Save and test" results keep the same flag honest.
  useEffect(() => {
    const t = status?.test;
    if (t) setKeyBad(!t.ok && t.code === "auth");
  }, [status]);

  const begin = useCallback(
    (input: { question?: string; demo?: string; label?: string }) => {
      void ask(input);
      window.setTimeout(() => progressRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
    },
    [ask],
  );

  const submit = useCallback(() => {
    const q = text.trim();
    if (running || q.length < 3) return;
    if (status && !status.configured) {
      revealSetup();
      return;
    }
    begin({ question: q });
  }, [begin, revealSetup, running, status, text]);

  const retry = useCallback(() => {
    if (!run) return;
    if (run.demo) return;
    begin({ question: run.question });
  }, [begin, run]);

  const startDemo = useCallback(
    (id: string, label: string) => {
      const d = status?.demo.find((x) => x.id === id);
      if (d) setText(d.question);
      // The full question is kept for the run and its history entry; the server still answers from the demo id.
      begin({ demo: id, label, question: d?.question });
    },
    [begin, status],
  );

  const tooLong = text.length > MAX_CHARS;
  const canAsk = !running && text.trim().length >= 3 && !tooLong;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-1 py-6 sm:px-3 sm:py-8">
      <PageHeader eyebrow="Ask AI" title="Ask anything." accent="Watch it taught.">
        Paste a problem, some buggy code, or just a question. You get a whiteboard video with a voice-over, a step-by-step dry run, a plain explanation and C++ that
        has really been compiled and tested.
      </PageHeader>

      <StatusRow
        status={status}
        failed={failed}
        keyOpen={keyOpen}
        keyBad={keyBad}
        onToggleKey={() => setKeyOpen((v) => !v)}
        onTest={async () => {
          await refresh(true);
        }}
      />

      {showSetup && (
        <div ref={setupRef}>
          <SetupCard
            status={status}
            highlight={needKey}
            rejected={keyBad}
            busy={running}
            onDemo={startDemo}
            onSaved={async () => {
              const j = await refresh(true);
              // Close the box once the key works; keep it open while the provider still refuses it.
              const t = j?.test;
              const stillBroken = !!t && !t.ok && (t.code === "auth" || t.code === "model");
              if (j?.configured && !stillBroken) setKeyOpen(false);
              return j;
            }}
          />
        </div>
      )}

      <div ref={progressRef} className="space-y-5 scroll-mt-4">
        {run?.running && <Progress run={run} onStop={stop} />}
        {run?.stopped && (
          <p className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <Icon name="info" size={14} /> Stopped. Whatever was ready is shown below.
          </p>
        )}
        {run?.error && <ErrorCard run={run} onRetry={retry} onSetup={revealSetup} />}
        {run && run.hook && (
          <AnswerView run={run} onVideo={(s) => updateVideo(run.id, s)} onLangs={(langs) => saveLangs(run.id, langs)} />
        )}
      </div>

      <form
        className="card relative p-3 transition-[border-color,box-shadow] focus-within:!border-[var(--accent-line)] focus-within:!shadow-[0_0_0_3px_var(--accent-soft)] sm:p-4"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <label htmlFor="ask-box" className="sr-only">
          Your question
        </label>
        <textarea
          id="ask-box"
          ref={taRef}
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={"Paste a problem, paste your code, or ask a concept…\ne.g. “Explain sliding window with an example I can follow”"}
          className="input !h-auto min-h-[5.5rem] resize-none !border-0 !bg-transparent !p-1.5 text-[15px] leading-relaxed !shadow-none focus:!shadow-none"
          spellCheck={false}
        />
        <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-[var(--line)] pt-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[11px] text-[var(--faint)]">Try:</span>
            {EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                type="button"
                className="chip transition-colors hover:border-[var(--accent-line)] hover:text-[var(--accent)]"
                onClick={() => {
                  setText(ex.text);
                  taRef.current?.focus();
                }}
              >
                {ex.label}
              </button>
            ))}
          </div>
          <span className={`text-[11px] tabular-nums ${tooLong ? "text-[var(--bad)]" : "text-[var(--faint)]"}`}>
            {text.length > 200 ? `${text.length}/${MAX_CHARS}` : ""}
          </span>
          {text && !running && (
            <button
              type="button"
              className="btn btn-sm btn-quiet"
              onClick={() => {
                setText("");
                reset();
                taRef.current?.focus();
              }}
            >
              Clear
            </button>
          )}
          {running ? (
            <button type="button" className="btn" onClick={stop}>
              <Icon name="x" size={14} strokeWidth={2.4} /> Stop
            </button>
          ) : (
            <button type="submit" className="btn btn-primary" disabled={!canAsk && configured}>
              <Icon name="sparkles" size={15} />
              Explain it
              <span className="hidden items-center gap-1 opacity-70 sm:inline-flex">
                <kbd className="kbd !border-black/20 !bg-black/10 !text-[var(--accent-ink)]">Ctrl</kbd>
                <kbd className="kbd !border-black/20 !bg-black/10 !text-[var(--accent-ink)]">↵</kbd>
              </span>
            </button>
          )}
        </div>
      </form>

      <Recent
        items={history}
        activeId={run?.id}
        onOpen={(a) => {
          open(a);
          setText(a.question);
          window.setTimeout(() => progressRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
        }}
        onRemove={remove}
      />

      {!run && (
        <>
          <p className="text-center text-xs leading-relaxed text-[var(--faint)]">
            The explanation appears in a few seconds. The finished video follows it, usually within 15 to 30 seconds. Read while it is being recorded.
          </p>
          <Trust />
        </>
      )}
    </div>
  );
}
