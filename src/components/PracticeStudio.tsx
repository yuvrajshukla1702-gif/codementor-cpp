"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { EditorDiagnostic } from "./CodeEditor";
import { LessonContent } from "./LessonContent";
import type { Problem } from "@/lib/types";
import type { PracticeBundle } from "@/lib/practice-bundle";
import type { SolutionTier } from "@/lib/solution-tiers-shared";
import type { VoiceLang } from "@/lib/walkthrough";

const CodeEditor = dynamic(
  () => import("./CodeEditor").then((m) => m.CodeEditor),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full place-items-center text-sm text-[var(--muted)]">Loading editor…</div>
    ),
  }
);

const TeacherShow = dynamic(
  () => import("./TeacherShow").then((m) => m.TeacherShow),
  {
    ssr: false,
    loading: () => <div className="text-sm text-[var(--muted)]">Loading lesson…</div>,
  }
);

const CodeLecture = dynamic(
  () => import("./CodeLecture").then((m) => m.CodeLecture),
  {
    ssr: false,
    loading: () => <div className="text-sm text-[var(--muted)]">Loading code walk…</div>,
  }
);

const NO_DIAGNOSTICS: EditorDiagnostic[] = [];

const TIER_ORDER: SolutionTier[] = ["easy", "medium", "best"];
const SOL_LANGS: { id: VoiceLang; label: string }[] = [
  { id: "english", label: "English" },
  { id: "hinglish", label: "Hinglish" },
  { id: "hindi", label: "हिंदी" },
];

export function PracticeStudio({
  problem,
  bundle,
  defaultTab = "watch",
}: {
  problem: Problem;
  bundle: PracticeBundle;
  defaultTab?: "watch" | "teach" | "solution" | "code" | "feedback" | "lecture";
}) {
  const [tab, setTab] = useState<"watch" | "teach" | "solution" | "code" | "feedback" | "lecture">(defaultTab);
  const [solTier, setSolTier] = useState<SolutionTier>(
    () => bundle.visibleTiers[0] ?? "best"
  );
  const [solLang, setSolLang] = useState<VoiceLang>("hinglish");
  const [code, setCode] = useState(problem.starterCode);
  const [busy, setBusy] = useState(false);
  const [focusLine, setFocusLine] = useState<number | null>(null);
  const [judge, setJudge] = useState<{
    passed?: boolean;
    passedCount?: number;
    total?: number;
    compileError?: string;
    verdict?: string;
    diagnostics?: EditorDiagnostic[];
    details?: Array<{
      index: number;
      hidden?: boolean;
      ok: boolean;
      input?: string;
      expected?: string;
      actual?: string;
      error?: string;
    }>;
  } | null>(null);
  const [tutor, setTutor] = useState("");
  const [provider, setProvider] = useState("");
  const [lcMsg, setLcMsg] = useState("");
  const [submitBusy, setSubmitBusy] = useState(false);

  const judgeSummary = useMemo(() => {
    if (!judge) return "No judge run yet.";
    if (judge.compileError) return `Compile error:\n${judge.compileError}`;
    return `Passed ${judge.passedCount}/${judge.total}. Details: ${JSON.stringify(judge.details)}`;
  }, [judge]);

  const { guide, tiers, script, visibleTiers, handCrafted } = bundle;
  const solution = tiers[solTier];
  const lecture = bundle.lectures[solTier];
  const guideText =
    solLang === "english" ? guide.english : solLang === "hindi" ? guide.hindi : guide.hinglish;
  const tierButtons = TIER_ORDER.filter((id) => visibleTiers.includes(id));

  async function runJudge() {
    setBusy(true);
    setLcMsg("");
    try {
      const res = await fetch("/api/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId: problem.id, code }),
      });
      const data = await res.json();
      setJudge(data);
      setFocusLine(data.diagnostics?.[0]?.line ?? null);
      if (data.passed) {
        setTutor("All tests passed.");
        setProvider("builtin");
        try {
          const { markDone } = await import("@/lib/learning-path");
          markDone(problem.id);
        } catch {
          /* ignore */
        }
      }
    } finally {
      setBusy(false);
    }
  }

  async function askTutorOnly() {
    setBusy(true);
    try {
      const t = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: problem.id,
          code,
          judgeSummary,
          bumpHint: true,
        }),
      });
      const tj = await t.json();
      setTutor(tj.reply || "");
      setProvider(tj.provider || "");
    } finally {
      setBusy(false);
    }
  }

  async function submitLc() {
    setSubmitBusy(true);
    setLcMsg(problem.leetcodeSlug ? "Submitting to LeetCode…" : "Checking tests…");
    try {
      const judged = await fetch("/api/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId: problem.id, code }),
      });
      const local = await judged.json();
      setJudge(local);
      setFocusLine(local.diagnostics?.[0]?.line ?? null);
      const localLine = local.compileError
        ? `Local compile error: ${local.compileError}`
        : `Local tests: ${local.passedCount}/${local.total} passed.`;
      if (!problem.leetcodeSlug) {
        setLcMsg(localLine);
        return;
      }
      const res = await fetch("/api/leetcode/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId: problem.id, code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const why = data.error || "Submit failed";
        const hint = /session/i.test(why)
          ? " Open Settings and paste your LEETCODE_SESSION cookie."
          : "";
        setLcMsg(`${localLine} LeetCode: ${why}.${hint}`);
      } else {
        setLcMsg(`${localLine} LeetCode: ${data.verdict?.statusMsg || "submitted"}.`);
      }
    } catch (err) {
      setLcMsg(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setSubmitBusy(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-4.5rem)] min-h-[560px] flex-col overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--panel)]">
      <header className="flex flex-wrap items-center gap-3 border-b border-[var(--line)] px-3 py-2">
        <a href="/practice" className="text-sm text-[var(--muted)] hover:text-[var(--ink)]">
          Problems
        </a>
        <h1 className="text-base">{problem.title}</h1>
        <span
          className={`text-xs font-medium ${
            problem.difficulty === "Easy" ? "diff-easy" : problem.difficulty === "Medium" ? "diff-medium" : "diff-hard"
          }`}
        >
          {problem.difficulty}
        </span>
        {problem.leetcodeSlug && (
          <a
            className="text-xs text-[var(--muted)] hover:text-[var(--accent)]"
            href={`https://leetcode.com/problems/${problem.leetcodeSlug}/`}
            target="_blank"
            rel="noreferrer"
          >
            LeetCode
          </a>
        )}
        {problem.hackerrankSlug && (
          <a
            className="text-xs text-[var(--muted)] hover:text-[var(--accent)]"
            href={`https://www.hackerrank.com/challenges/${problem.hackerrankSlug}/problem`}
            target="_blank"
            rel="noreferrer"
          >
            HackerRank
          </a>
        )}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            disabled={busy}
            onClick={runJudge}
            className="rounded bg-[var(--accent-2)] px-4 py-1.5 text-sm font-semibold text-black disabled:opacity-50"
          >
            {busy ? "Running…" : "Run"}
          </button>
          <button
            disabled={busy}
            onClick={askTutorOnly}
            className="rounded border border-[var(--line)] px-3 py-1.5 text-sm hover:bg-[var(--chip)]"
          >
            Hint
          </button>
          {problem.leetcodeSlug ? (
            <button
              disabled={submitBusy}
              onClick={submitLc}
              className="rounded bg-[var(--accent)] px-3 py-1.5 text-sm font-semibold text-black disabled:opacity-50"
            >
              {submitBusy ? "Submitting…" : "Submit"}
            </button>
          ) : (
            <button
              disabled={submitBusy}
              onClick={submitLc}
              className="rounded bg-[var(--accent)] px-3 py-1.5 text-sm font-semibold text-black disabled:opacity-50"
            >
              {submitBusy ? "Checking…" : "Submit"}
            </button>
          )}
        </div>
      </header>
      {lcMsg && (
        <div className="border-b border-[var(--line)] bg-[#1a1a1a] px-3 py-2 text-sm text-[var(--ink)]">{lcMsg}</div>
      )}

      <div className="grid min-h-0 flex-1 lg:grid-cols-2">
        <section className="flex min-h-0 flex-col border-b border-[var(--line)] lg:border-b-0 lg:border-r">
          <div className="flex gap-1 border-b border-[var(--line)] px-2 py-1.5 text-sm">
            {(
              [
                ["teach", "Description"],
                ["watch", "Lesson"],
                ["lecture", "Code walk"],
                ["solution", "Solution"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`rounded px-2.5 py-1 ${tab === id ? "bg-[var(--chip)] text-[var(--ink)]" : "text-[var(--muted)] hover:text-[var(--ink)]"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {tab === "watch" && <TeacherShow key={script.id} script={script} compact hidePractice />}
            {(tab === "lecture" || tab === "solution") && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="text-xs text-[var(--muted)]">Approach:</span>
                {tierButtons.map((id) => {
                  const t = tiers[id];
                  const active = solTier === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSolTier(id)}
                      className={`rounded px-2.5 py-1 text-xs font-medium ${
                        active
                          ? id === "easy"
                            ? "bg-[var(--easy)] text-black"
                            : id === "best"
                              ? "bg-[var(--accent)] text-black"
                              : "bg-[var(--chip)] text-[var(--ink)]"
                          : "border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setCode(solution.code)}
                  className="ml-auto rounded border border-[var(--line)] px-2.5 py-1 text-xs text-[var(--muted)] hover:text-[var(--ink)]"
                >
                  Load into editor
                </button>
              </div>
            )}
            {tab === "lecture" && <CodeLecture key={lecture.id} script={lecture} />}
            {tab === "solution" && (
              <div className="space-y-5">
                <div>
                  <p className="text-sm font-medium text-[var(--ink)]">{solution.blurb}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">{solution.blurbEn}</p>
                  <p className="mt-2 text-xs font-medium text-[var(--easy)]">{solution.complexity}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--ink)]">{solution.why}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{solution.whyEn}</p>
                </div>

                <section className="border-t border-[var(--line)] pt-4">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold text-[var(--ink)]">Detailed explanation</h2>
                    <div className="ml-auto flex gap-1">
                      {SOL_LANGS.map((l) => (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => setSolLang(l.id)}
                          className={`rounded px-2.5 py-1 text-xs font-medium ${
                            solLang === l.id
                              ? "bg-[var(--chip)] text-[var(--ink)]"
                              : "text-[var(--muted)] hover:text-[var(--ink)]"
                          }`}
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <LessonContent source={guideText} />
                </section>

                <section className="border-t border-[var(--line)] pt-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h2 className="text-sm font-semibold text-[var(--ink)]">
                      C++ — {solution.label}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setTab("lecture")}
                      className="text-xs text-[var(--accent)] hover:underline"
                    >
                      Watch Code walk video →
                    </button>
                  </div>
                  <pre className="overflow-x-auto rounded-lg bg-[#1a1a1a] p-3 text-xs leading-relaxed text-[#d6d6d6]">
                    <code>{solution.code}</code>
                  </pre>
                </section>
                <p className="text-xs text-[var(--muted)]">
                  {handCrafted
                    ? "Tip: start with Easy, then Medium, then Best. Same problem, three levels."
                    : "Best is interview-ready. Hand-written Easy/Medium are available on the core path (Two Sum → …)."}
                </p>
              </div>
            )}
            {tab !== "watch" && tab !== "solution" && tab !== "lecture" && <LessonContent source={problem.lesson} />}
          </div>
        </section>

        <section className="flex min-h-[420px] flex-col lg:min-h-0">
          <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-1.5 text-xs text-[var(--muted)]">
            <span>C++</span>
            <button
              disabled={busy}
              onClick={runJudge}
              className="rounded bg-[var(--accent-2)] px-3 py-1 text-xs font-semibold text-black disabled:opacity-50"
            >
              {busy ? "Running…" : "Run"}
            </button>
          </div>
          <div className="min-h-0 flex-1">
            <CodeEditor
              value={code}
              onChange={(next) => {
                setCode(next);
                setFocusLine(null);
              }}
              height="100%"
              diagnostics={judge?.diagnostics ?? NO_DIAGNOSTICS}
              focusLine={focusLine}
            />
          </div>
          <JudgeConsole
            judge={judge}
            tutor={tutor}
            provider={provider}
            onJump={(line) => setFocusLine(line)}
          />
        </section>
      </div>
    </div>
  );
}

function JudgeConsole({
  judge,
  tutor,
  provider,
  onJump,
}: {
  judge: {
    passed?: boolean;
    passedCount?: number;
    total?: number;
    compileError?: string;
    verdict?: string;
    diagnostics?: EditorDiagnostic[];
    details?: Array<{
      index: number;
      hidden?: boolean;
      ok: boolean;
      input?: string;
      expected?: string;
      actual?: string;
      error?: string;
    }>;
  } | null;
  tutor: string;
  provider: string;
  onJump: (line: number) => void;
}) {
  const verdict = judge?.verdict || (judge?.compileError ? "Compile Error" : "");
  const tone =
    verdict === "Accepted"
      ? "text-[var(--accent-2)]"
      : verdict
        ? "text-[#ff6b6b]"
        : "text-[var(--muted)]";
  const failed = judge?.details?.find((d) => !d.ok);
  const diags = judge?.diagnostics ?? [];

  return (
    <div className="h-52 shrink-0 overflow-auto border-t border-[var(--line)] bg-[#1a1a1a] p-3 text-xs">
      <div className="mb-2 text-[var(--muted)]">Test result</div>
      {!judge && <p className="text-[var(--muted)]">Run compiles your C++ and checks every test, the same way a judge does.</p>}
      {verdict && (
        <p className={`text-sm font-semibold ${tone}`}>
          {verdict}
          {verdict !== "Compile Error" && judge?.total != null ? ` · ${judge.passedCount}/${judge.total} tests` : ""}
        </p>
      )}
      {diags.length > 0 && (
        <ul className="mt-2 space-y-1">
          {diags.map((d, i) => (
            <li key={`${d.line}:${d.column}:${i}`}>
              <button
                type="button"
                onClick={() => onJump(d.line)}
                className="text-left text-[#ffb4b4] hover:underline"
              >
                Line {d.line}:{d.column} — {d.message}
              </button>
            </li>
          ))}
        </ul>
      )}
      {judge?.compileError && diags.length === 0 && (
        <pre className="mt-2 whitespace-pre-wrap text-[#ffb4b4]">{judge.compileError}</pre>
      )}
      {failed && verdict !== "Compile Error" && (
        <div className="mt-3 space-y-2">
          <p className="text-[var(--muted)]">Case {failed.index + 1}{failed.hidden ? " (hidden)" : ""}</p>
          {failed.error && <p className="text-[#ffb4b4]">{failed.error}</p>}
          {failed.input != null && (
            <pre className="whitespace-pre-wrap rounded bg-[#111] p-2 text-[var(--ink)]">
              <span className="text-[var(--muted)]">Input{"\n"}</span>
              {failed.input}
            </pre>
          )}
          {failed.actual != null && (
            <pre className="whitespace-pre-wrap rounded bg-[#111] p-2 text-[var(--ink)]">
              <span className="text-[var(--muted)]">Output{"\n"}</span>
              {failed.actual || "(empty)"}
            </pre>
          )}
          {failed.expected != null && (
            <pre className="whitespace-pre-wrap rounded bg-[#111] p-2 text-[var(--ink)]">
              <span className="text-[var(--muted)]">Expected{"\n"}</span>
              {failed.expected}
            </pre>
          )}
        </div>
      )}
      {tutor && <pre className="mt-3 whitespace-pre-wrap text-[var(--ink)]">{tutor}</pre>}
      {provider && <p className="mt-1 text-[var(--muted)]">Tutor: {provider}</p>}
    </div>
  );
}
