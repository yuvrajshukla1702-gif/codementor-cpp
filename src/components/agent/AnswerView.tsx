"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { TeacherShow } from "@/components/TeacherShow";
import { Icon } from "@/components/ui/icons";
import { Pips } from "@/components/ui/kit";
import type { TeacherShowScript } from "@/lib/teacher-shows";
import type { VoiceLang } from "@/lib/speech-cache";
import type { RunOutput, Verify } from "@/lib/agent/types";
import { CodeBlock, CopyButton, Pill, RichText, Spinner, compilerName } from "./parts";
import type { Run } from "./useAgent";

type Tab = "explain" | "dry" | "code" | "try" | "chat";

const fmtInput = (s: string) => s.trim().replace(/\n/g, " ⏎ ") || "(empty)";
const secs = (ms?: number) => (ms == null ? "" : `${(ms / 1000).toFixed(ms < 10_000 ? 1 : 0)} s`);

/* ------------------------------------------ banner ------------------------------------------ */

function VerifyBanner({ verify, pending, hasCode }: { verify?: Verify; pending: boolean; hasCode: boolean }) {
  if (!verify) {
    if (!pending || !hasCode) return null;
    return (
      <div className="card flex items-center gap-3 px-4 py-3 text-sm text-[var(--muted)]">
        <Spinner />
        Compiling the C++ and running every test on this computer…
      </div>
    );
  }
  const tone = verify.status === "verified" ? "ok" : verify.status === "failed" ? "bad" : "warn";
  const border = tone === "ok" ? "border-[var(--accent-line)]" : tone === "bad" ? "border-[rgba(255,107,129,0.4)]" : "border-[rgba(255,209,102,0.35)]";
  const color = tone === "ok" ? "text-[var(--accent)]" : tone === "bad" ? "text-[var(--bad)]" : "text-[var(--gold)]";
  const bg = tone === "ok" ? "bg-[var(--accent-soft)]" : tone === "bad" ? "bg-[rgba(255,107,129,0.07)]" : "bg-[rgba(255,209,102,0.06)]";
  return (
    <div className={`cm-fade flex items-start gap-3 rounded-[var(--radius)] border px-4 py-3 ${border} ${bg}`}>
      <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border ${border} ${color}`}>
        <Icon name={tone === "ok" ? "check" : "info"} size={13} strokeWidth={2.6} />
      </span>
      <div className="min-w-0 text-sm">
        <p className={`font-semibold ${color}`}>
          {verify.status === "verified"
            ? `Verified: ${verify.passed}/${verify.total} test cases passed on this computer`
            : verify.status === "failed"
              ? `Not verified: ${verify.passed}/${verify.total} test cases passed`
              : "Not verified"}
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-[var(--muted)]">
          {verify.status === "verified" &&
            `The C++ below was compiled with ${compilerName(verify.compiler)} and run for real${
              verify.repaired ? `. The first draft failed a check, so the AI fixed it ${verify.repaired === 1 ? "once" : `${verify.repaired} times`} using the real error` : ""
            }. `}
          {verify.status !== "verified" && (verify.reason ? `${verify.reason} ` : "")}
          {verify.repairNote && verify.status === "verified" && <span className="text-[var(--faint)]">What it fixed: {verify.repairNote} </span>}
          <span className="text-[var(--faint)]">Checked in {secs(verify.ms)}.</span>
        </p>
      </div>
    </div>
  );
}

function VideoSkeleton({ msg }: { msg: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#07090d]">
      <div className="relative grid aspect-video place-items-center">
        <div className="skeleton absolute inset-0 !rounded-none opacity-60" />
        <div className="relative z-10 flex flex-col items-center gap-3 px-6 text-center">
          <Spinner size={22} />
          <p className="font-display text-lg text-[var(--ink)]">Recording your video…</p>
          <p className="max-w-xs text-xs leading-relaxed text-[var(--muted)]">
            {msg || "The whiteboard and the voice-over are built from a real run of the code."} Read the explanation while you wait.
          </p>
        </div>
      </div>
      <div className="h-[8.5rem] border-t border-white/[0.07] bg-[#090c11]" />
    </div>
  );
}

/* ------------------------------------------ tabs ------------------------------------------ */

function Section({ title, children, tone }: { title: string; children: ReactNode; tone?: "warn" }) {
  return (
    <section className="space-y-2.5">
      <h3 className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${tone === "warn" ? "text-[var(--gold)]" : "text-[var(--muted)]"}`}>{title}</h3>
      {children}
    </section>
  );
}

function ExplainTab({ run, onFollow }: { run: Run; onFollow: (q: string) => void }) {
  const e = run.explain;
  if (!e) return <Pending label="Writing the explanation" />;
  return (
    <div className="space-y-6">
      {e.summary && <p className="text-[15px] leading-relaxed text-[var(--ink)]">{e.summary}</p>}
      {e.analogy && (
        <div className="rounded-xl border border-[rgba(124,196,255,0.25)] bg-[rgba(124,196,255,0.06)] p-4 text-sm leading-relaxed">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent-2)]">Think of it like this</p>
          {e.analogy}
        </div>
      )}
      {e.keyPoints && e.keyPoints.length > 0 && (
        <Section title="Key points">
          <ul className="space-y-2">
            {e.keyPoints.map((p, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
                <Icon name="check" size={15} strokeWidth={2.6} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                {p}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {e.intuition.length > 0 && (
        <Section title="The idea in plain words">
          <ol className="space-y-2.5">
            {e.intuition.map((p, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[11px] font-bold text-[var(--accent)]">{i + 1}</span>
                {p}
              </li>
            ))}
          </ol>
        </Section>
      )}

      <div className={`grid gap-3 ${e.brute ? "sm:grid-cols-2" : ""}`}>
        {e.brute && (
          <div className="rounded-xl border border-[var(--line)] bg-[var(--panel-2)] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Brute force</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ink)]/85">{e.brute.idea}</p>
            <div className="mt-3">
              <Pill tone="bad">Time {e.brute.time}</Pill>
            </div>
          </div>
        )}
        <div className="rounded-xl border border-[var(--accent-line)] bg-[var(--accent-soft)] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">Better: {e.approach.name}</p>
          {e.approach.why && <p className="mt-2 text-sm leading-relaxed text-[var(--ink)]/90">{e.approach.why}</p>}
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Pill tone="ok">Time {e.approach.time}</Pill>
            <Pill tone="info">Space {e.approach.space}</Pill>
          </div>
        </div>
      </div>

      {e.approach.steps.length > 0 && (
        <Section title="Steps">
          <ol className="space-y-2">
            {e.approach.steps.map((s, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed">
                <span className="mt-px w-5 shrink-0 text-right font-mono text-xs text-[var(--faint)]">{i + 1}.</span>
                {s}
              </li>
            ))}
          </ol>
        </Section>
      )}

      {e.pitfalls.length > 0 && (
        <Section title="Watch out" tone="warn">
          <ul className="space-y-2">
            {e.pitfalls.map((p, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
                <Icon name="info" size={15} className="mt-0.5 shrink-0 text-[var(--gold)]" />
                {p}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {e.followUps.length > 0 && (
        <Section title="Ask the next question">
          <div className="flex flex-wrap gap-2">
            {e.followUps.map((q, i) => (
              <button key={i} type="button" className="btn btn-sm !h-auto !whitespace-normal !py-1.5 text-left" onClick={() => onFollow(q)}>
                {q}
              </button>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Pending({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-8 text-sm text-[var(--muted)]">
      <Spinner />
      {label}…
    </div>
  );
}

function DryTab({ run }: { run: Run }) {
  const d = run.dry;
  if (!d) return run.running ? <Pending label="Running the sample step by step" /> : <p className="py-8 text-sm text-[var(--muted)]">No dry run was produced for this answer.</p>;
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--line)] bg-[var(--panel-2)] p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone={d.machineTraced ? "ok" : "warn"}>
            <Icon name={d.machineTraced ? "check" : "info"} size={12} strokeWidth={2.6} />
            {d.machineTraced ? "Captured from a real run" : "Worked out by the AI, not executed"}
          </Pill>
          <span className="text-xs text-[var(--faint)]">
            {d.rows.length === d.totalEvents ? `${d.totalEvents} steps` : `${d.rows.length} of ${d.totalEvents} steps shown`}
          </span>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="eyebrow !text-[10px]">Input</p>
            <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-[12.5px] text-[var(--ink)]">{d.sampleInput || "(none)"}</pre>
          </div>
          <div>
            <p className="eyebrow !text-[10px]">Output</p>
            <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-[12.5px] text-[var(--accent)]">{d.sampleOutput || "—"}</pre>
          </div>
        </div>
      </div>

      <ol className="relative space-y-3 border-l border-[var(--line-strong)] pl-5">
        {d.rows.map((r) => (
          <li key={r.n} className="relative">
            <span className="absolute -left-[1.72rem] top-0.5 grid h-5 w-5 place-items-center rounded-full border border-[var(--line-strong)] bg-[var(--panel)] font-mono text-[10px] text-[var(--muted)]">
              {r.n}
            </span>
            <p className="text-sm font-medium text-[var(--ink)] first-letter:uppercase">{r.note}</p>
            {r.code && <p className="mt-0.5 truncate font-mono text-[11.5px] text-[var(--faint)]">{r.code}</p>}
            {r.vars.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {r.vars.map((v) => (
                  <span key={v.k} className="inline-flex max-w-full items-center gap-1 rounded-md bg-white/[0.05] px-2 py-1 font-mono text-[11.5px]">
                    <span className="text-[var(--faint)]">{v.k}</span>
                    <span className="truncate text-[var(--ink)]">{v.v}</span>
                  </span>
                ))}
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

function CodeTab({ run }: { run: Run }) {
  const c = run.code;
  if (!c) return <Pending label="Writing the C++" />;
  const full = `#include <bits/stdc++.h>\nusing namespace std;\n\n${c.solution}\n\n${c.driver}\n`;
  const rows = run.tests ?? [];
  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Pill tone="neutral">C++14</Pill>
          {run.verify?.status === "verified" && (
            <Pill tone="ok">
              <Icon name="check" size={12} strokeWidth={2.6} /> tested
            </Pill>
          )}
          <span className="ml-auto flex gap-1">
            <CopyButton text={c.solution} label="Copy solution" />
            <CopyButton text={full} label="Copy full program" />
          </span>
        </div>
        <CodeBlock code={c.solution} />
      </div>

      {rows.length > 0 && (
        <Section title="Test cases it was checked against">
          <div className="overflow-hidden rounded-xl border border-[var(--line)]">
            {rows.map((t, i) => (
              <div key={i} className="grid grid-cols-[1.4rem_minmax(0,1fr)] gap-x-3 border-b border-[var(--line)] px-3 py-2.5 last:border-b-0">
                <span className="pt-0.5">
                  {t.ok === undefined ? (
                    <Icon name="circle" size={14} className="text-[var(--faint)]" />
                  ) : t.ok ? (
                    <Icon name="check" size={15} strokeWidth={2.8} className="text-[var(--accent)]" />
                  ) : (
                    <Icon name="x" size={15} strokeWidth={2.8} className="text-[var(--bad)]" />
                  )}
                </span>
                <div className="min-w-0 text-xs">
                  <p className="truncate font-mono text-[12px] text-[var(--ink)]" title={t.input}>
                    {fmtInput(t.input)}
                  </p>
                  <p className="mt-0.5 font-mono text-[11.5px] text-[var(--muted)]">
                    expected <span className="text-[var(--ink)]">{t.expected || "—"}</span>
                    {t.actual !== undefined && (
                      <>
                        {" · "}got <span className={t.ok ? "text-[var(--accent)]" : "text-[var(--bad)]"}>{t.actual || "(nothing)"}</span>
                      </>
                    )}
                  </p>
                  {t.note && <p className="mt-0.5 text-[11px] text-[var(--faint)]">{t.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function TryTab({ run }: { run: Run }) {
  const c = run.code;
  // Until the user types, show the first test input (it arrives after this panel is already mounted).
  const [typed, setTyped] = useState<string | null>(null);
  const input = typed ?? run.tests?.[0]?.input.trim() ?? "";
  const [out, setOut] = useState<RunOutput | null>(null);
  const [busy, setBusy] = useState(false);
  if (!c) return <Pending label="Writing the C++" />;

  async function go() {
    if (!c) return;
    setBusy(true);
    setOut(null);
    try {
      const res = await fetch("/api/agent/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ solution: c.solution, driver: c.driver, input: input.endsWith("\n") || !input ? input : `${input}\n` }),
      });
      setOut((await res.json()) as RunOutput);
    } catch {
      setOut({ ok: false, stdout: "", stderr: "", ms: 0, message: "Could not reach the server." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-[var(--muted)]">
        Run the exact code from the Code tab on your own input. <span className="text-[var(--ink)]">Input format:</span> {c.inputFormat}{" "}
        <span className="text-[var(--ink)]">Output:</span> {c.outputFormat}
      </p>
      <textarea
        className="input min-h-28 font-mono text-[12.5px]"
        value={input}
        onChange={(e) => setTyped(e.target.value)}
        spellCheck={false}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === "Enter") void go();
        }}
        aria-label="Program input"
      />
      <div className="flex items-center gap-2">
        <button type="button" className="btn btn-primary" onClick={() => void go()} disabled={busy}>
          {busy ? <Spinner size={13} /> : <Icon name="play" size={13} fill="currentColor" strokeWidth={1.2} />}
          Run
        </button>
        <span className="text-xs text-[var(--faint)]">Ctrl + Enter</span>
      </div>
      {out && (
        <div className={`cm-fade rounded-xl border p-4 ${out.ok ? "border-[var(--accent-line)] bg-[var(--accent-soft)]" : "border-[rgba(255,107,129,0.35)] bg-[rgba(255,107,129,0.06)]"}`}>
          <div className="mb-2 flex items-center gap-2 text-xs">
            <span className={out.ok ? "font-semibold text-[var(--accent)]" : "font-semibold text-[var(--bad)]"}>{out.ok ? "Output" : out.message || "It did not run"}</span>
            {out.ms > 0 && <span className="text-[var(--faint)]">{out.ms} ms</span>}
          </div>
          {out.compileError && <pre className="max-h-64 overflow-auto whitespace-pre-wrap font-mono text-[11.5px] text-[var(--bad)]">{out.compileError}</pre>}
          {(out.ok || out.stdout) && <pre className="whitespace-pre-wrap break-words font-mono text-[13px] text-[var(--ink)]">{out.stdout || "(no output)"}</pre>}
          {out.stderr && !out.compileError && <pre className="mt-2 whitespace-pre-wrap font-mono text-[11.5px] text-[var(--muted)]">{out.stderr}</pre>}
        </div>
      )}
    </div>
  );
}

type Turn = { role: "user" | "ai"; text: string; error?: boolean };

function ChatTab({ run, seed }: { run: Run; seed: { q: string; n: number } | null }) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const seen = useRef(0);

  const send = useCallback(
    async (q: string) => {
      const ask = q.trim();
      if (!ask || busy) return;
      const history = turns.filter((t) => !t.error).map((t) => ({ role: t.role, text: t.text }));
      setTurns((t) => [...t, { role: "user", text: ask }]);
      setText("");
      setBusy(true);
      try {
        const res = await fetch("/api/agent/followup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: run.hook?.title,
            question: run.question,
            approach: run.explain ? `${run.explain.approach.name}. ${run.explain.approach.why}` : "",
            solution: run.code?.solution ?? "",
            history,
            ask,
          }),
        });
        const j = (await res.json()) as { answer?: string; error?: string };
        setTurns((t) => [...t, res.ok && j.answer ? { role: "ai", text: j.answer } : { role: "ai", text: j.error || "Something went wrong.", error: true }]);
      } catch {
        setTurns((t) => [...t, { role: "ai", text: "Could not reach the server.", error: true }]);
      } finally {
        setBusy(false);
      }
    },
    [busy, run, turns],
  );

  useEffect(() => {
    if (seed && seed.n !== seen.current) {
      seen.current = seed.n;
      void send(seed.q);
    }
  }, [seed, send]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [turns, busy]);

  const ideas = run.explain?.followUps ?? [];
  return (
    <div className="space-y-4">
      {turns.length === 0 && (
        <div className="space-y-3 py-2">
          <p className="text-sm leading-relaxed text-[var(--muted)]">
            Ask anything about this answer: a different approach, why a line works, a harder variant, or how to explain it in an interview.
          </p>
          {ideas.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {ideas.map((q, i) => (
                <button key={i} type="button" className="btn btn-sm !h-auto !whitespace-normal !py-1.5 text-left" onClick={() => void send(q)}>
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="space-y-3">
        {turns.map((t, i) => (
          <div key={i} className={`cm-fade flex ${t.role === "user" ? "justify-end" : ""}`}>
            <div
              className={`max-w-[92%] rounded-2xl px-4 py-2.5 ${
                t.role === "user"
                  ? "bg-[var(--accent)] text-sm font-medium text-[var(--accent-ink)]"
                  : t.error
                    ? "border border-[rgba(255,107,129,0.35)] bg-[rgba(255,107,129,0.06)] text-sm text-[var(--bad)]"
                    : "border border-[var(--line)] bg-[var(--panel-2)]"
              }`}
            >
              {t.role === "ai" && !t.error ? <RichText text={t.text} /> : t.text}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
            <Spinner size={12} /> Thinking…
          </div>
        )}
        <div ref={endRef} />
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void send(text);
        }}
      >
        <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask a follow-up…" maxLength={800} aria-label="Follow-up question" />
        <button type="submit" className="btn btn-primary shrink-0" disabled={busy || text.trim().length < 2}>
          <Icon name="arrowRight" size={15} strokeWidth={2.4} />
          Ask
        </button>
      </form>
    </div>
  );
}

/* ------------------------------------------ answer ------------------------------------------ */

export function AnswerView({ run, onVideo }: { run: Run; onVideo: (script: TeacherShowScript) => void }) {
  const [tab, setTab] = useState<Tab>("explain");
  const [seed, setSeed] = useState<{ q: string; n: number } | null>(null);
  const [hindi, setHindi] = useState<{ state: "idle" | "loading" | "error"; msg?: string }>({ state: "idle" });
  const hindiBusy = useRef(false);
  const videoRef = useRef(run.video);
  videoRef.current = run.video;

  // A new answer starts on the explanation again.
  useEffect(() => {
    setTab("explain");
    setSeed(null);
    setHindi({ state: "idle" });
  }, [run.id]);

  const onLang = useCallback(
    async (lang: VoiceLang) => {
      const video = videoRef.current;
      if (lang !== "hindi" || !video || hindiBusy.current || video.steps.every((s) => s.sayHi)) return;
      hindiBusy.current = true;
      setHindi({ state: "loading" });
      try {
        const res = await fetch("/api/agent/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lines: video.steps.map((s) => s.sayEn || s.say) }),
        });
        const j = (await res.json()) as { lines?: string[]; error?: string };
        if (!res.ok || !j.lines) throw new Error(j.error || "Translation failed.");
        const lines = j.lines;
        onVideo({ ...video, steps: video.steps.map((s, i) => ({ ...s, sayHi: lines[i] || s.sayHi })) });
        setHindi({ state: "idle" });
      } catch (err) {
        setHindi({ state: "error", msg: err instanceof Error ? err.message : "Translation failed." });
      } finally {
        hindiBusy.current = false;
      }
    },
    [onVideo],
  );

  const { hook } = run;
  if (!hook) return null;

  const tabs: Array<{ id: Tab; label: string; ready: boolean; icon: "book" | "list" | "code" | "terminal" | "sparkles" }> = [
    { id: "explain", label: "Explanation", ready: !!run.explain, icon: "book" },
    { id: "dry", label: "Dry run", ready: !!run.dry || !run.running, icon: "list" },
    { id: "code", label: "Code", ready: !!run.code, icon: "code" },
    { id: "try", label: "Try input", ready: !!run.code, icon: "terminal" },
    { id: "chat", label: "Ask more", ready: true, icon: "sparkles" },
  ];

  return (
    <div className="cm-fade space-y-5">
      <header className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          {hook.difficulty && <Pips difficulty={hook.difficulty} label />}
          {hook.kind !== "problem" && <Pill tone="info">{hook.kind === "concept" ? "Concept" : "Your code"}</Pill>}
          {hook.topics.map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
          <span className="ml-auto flex items-center gap-2 text-[11px] text-[var(--faint)]">
            {run.provider}
            {run.ms != null && <span className="tabular-nums">· {secs(run.ms)}</span>}
          </span>
        </div>
        <h2 className="mt-3 font-display text-3xl tracking-[-0.03em] sm:text-4xl">{hook.title}</h2>
        {hook.restated && <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-[var(--muted)]">{hook.restated}</p>}
      </header>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        {/* sticks beside the tabs only on screens tall enough to fit the whole player */}
        <div className="min-w-0 space-y-3 [@media(min-width:1280px)_and_(min-height:860px)]:sticky [@media(min-width:1280px)_and_(min-height:860px)]:top-20">
          <VerifyBanner verify={run.verify} pending={run.running} hasCode={!!run.code} />
          {run.video ? (
            <TeacherShow key={run.video.id} script={run.video} hidePractice onLangChange={onLang} />
          ) : run.running ? (
            <VideoSkeleton msg={run.stage === "narrate" ? "Writing the voice-over line by line…" : run.stageMsg} />
          ) : null}
          {hindi.state === "loading" && (
            <p className="flex items-center gap-2 text-xs text-[var(--muted)]">
              <Spinner size={12} /> Translating the voice-over to Hindi…
            </p>
          )}
          {hindi.state === "error" && (
            <p className="flex items-start gap-2 text-xs text-[var(--gold)]">
              <Icon name="info" size={13} className="mt-px shrink-0" /> Hindi voice is not ready ({hindi.msg}). It will read the English lines instead.
            </p>
          )}
          {run.video && !run.narrated && (
            <p className="flex items-start gap-2 text-xs text-[var(--gold)]">
              <Icon name="info" size={13} className="mt-px shrink-0" /> The AI could not write the voice-over this time, so these are plain captions built from the real run.
            </p>
          )}
          {run.video && run.machineTraced === false && (
            <p className="flex items-start gap-2 text-xs text-[var(--gold)]">
              <Icon name="info" size={13} className="mt-px shrink-0" /> This walk-through was worked out by the AI, not by executing the code.
            </p>
          )}
        </div>

        <div className="card min-w-0 overflow-hidden">
          <div role="tablist" aria-label="Answer sections" className="no-scrollbar flex gap-1 overflow-x-auto border-b border-[var(--line)] px-2 pt-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                role="tab"
                type="button"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`relative flex shrink-0 items-center gap-1.5 rounded-t-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${
                  tab === t.id ? "text-[var(--ink)]" : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                {t.ready ? <Icon name={t.icon} size={14} /> : <Spinner size={11} />}
                {t.label}
                {tab === t.id && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-[var(--accent)]" />}
              </button>
            ))}
          </div>
          <div className="p-5 sm:p-6">
            {/* every panel stays mounted so typed input and the chat survive tab switches */}
            <div role="tabpanel" hidden={tab !== "explain"}>
              <ExplainTab
                run={run}
                onFollow={(q) => {
                  setSeed({ q, n: Date.now() });
                  setTab("chat");
                }}
              />
            </div>
            <div role="tabpanel" hidden={tab !== "dry"}>
              <DryTab run={run} />
            </div>
            <div role="tabpanel" hidden={tab !== "code"}>
              <CodeTab run={run} />
            </div>
            <div role="tabpanel" hidden={tab !== "try"}>
              <TryTab key={run.id} run={run} />
            </div>
            <div role="tabpanel" hidden={tab !== "chat"}>
              <ChatTab key={run.id} run={run} seed={seed} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
