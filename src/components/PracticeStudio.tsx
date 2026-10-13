"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { EditorDiagnostic } from "./CodeEditor";
import { LessonContent } from "./LessonContent";
import { Icon, type IconName } from "./ui/icons";
import { Pips } from "./ui/kit";
import { fireReward, recordSolve, useGame } from "@/lib/gamify";
import type { Problem } from "@/lib/types";
import type { PracticeBundle } from "@/lib/practice-bundle";
import type { SolutionTier } from "@/lib/solution-tiers-shared";
import type { VoiceLang } from "@/lib/walkthrough";

function EditorSkeleton() {
  return (
    <div className="h-full space-y-3 p-5" aria-label="Loading editor">
      {[62, 40, 74, 55, 30, 68, 46].map((w, i) => (
        <div key={i} className="skeleton h-3.5" style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

const CodeEditor = dynamic(() => import("./CodeEditor").then((m) => m.CodeEditor), {
  ssr: false,
  loading: () => <EditorSkeleton />,
});

const TeacherShow = dynamic(() => import("./TeacherShow").then((m) => m.TeacherShow), {
  ssr: false,
  loading: () => <div className="skeleton h-64 w-full" />,
});

const CodeLecture = dynamic(() => import("./CodeLecture").then((m) => m.CodeLecture), {
  ssr: false,
  loading: () => <div className="skeleton h-64 w-full" />,
});

const NO_DIAGNOSTICS: EditorDiagnostic[] = [];

const TIER_ORDER: SolutionTier[] = ["easy", "medium", "best"];
const SOL_LANGS: { id: VoiceLang; label: string }[] = [
  { id: "english", label: "English" },
  { id: "hinglish", label: "Hinglish" },
  { id: "hindi", label: "हिंदी" },
];

type Tab = "teach" | "watch" | "lecture" | "solution";
const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: "teach", label: "Description", icon: "book" },
  { id: "watch", label: "Lesson", icon: "video" },
  { id: "lecture", label: "Code walk", icon: "code" },
  { id: "solution", label: "Solution", icon: "layers" },
];

type JudgeDetail = {
  index: number;
  hidden?: boolean;
  ok: boolean;
  input?: string;
  expected?: string;
  actual?: string;
  error?: string;
};

type JudgeResult = {
  passed?: boolean;
  passedCount?: number;
  total?: number;
  compileError?: string;
  verdict?: string;
  message?: string;
  diagnostics?: EditorDiagnostic[];
  details?: JudgeDetail[];
};

export type StudioNav = {
  topicId: string;
  topicTitle: string;
  topicProblemIds: string[];
  position: { index: number; total: number } | null;
  prev: { id: string; title: string } | null;
  next: { id: string; title: string } | null;
};

const DEFAULT_SPLIT = 46;
const MIN_SPLIT = 28;
const MAX_SPLIT = 68;

function readDraft(problem: Problem): string | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = window.localStorage.getItem(`cm-code:${problem.id}`);
    return saved && saved !== problem.starterCode ? saved : null;
  } catch {
    return null;
  }
}

export function PracticeStudio({
  problem,
  bundle,
  nav,
  defaultTab = "teach",
}: {
  problem: Problem;
  bundle: PracticeBundle;
  nav: StudioNav;
  defaultTab?: Tab | "code" | "feedback";
}) {
  const [tab, setTab] = useState<Tab>(
    defaultTab === "code" || defaultTab === "feedback" ? "teach" : defaultTab
  );
  const [solTier, setSolTier] = useState<SolutionTier>(() => bundle.visibleTiers[0] ?? "best");
  const [solLang, setSolLang] = useState<VoiceLang>("hinglish");
  const [code, setCode] = useState(() => readDraft(problem) ?? problem.starterCode);
  const [busy, setBusy] = useState(false);
  const [submitBusy, setSubmitBusy] = useState(false);
  const [hintBusy, setHintBusy] = useState(false);
  const [focusLine, setFocusLine] = useState<number | null>(null);
  const [judge, setJudge] = useState<JudgeResult | null>(null);
  const [tutor, setTutor] = useState("");
  const [provider, setProvider] = useState("");
  const [lcMsg, setLcMsg] = useState("");
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [hintsShown, setHintsShown] = useState(0);
  const [solvedSec, setSolvedSec] = useState<number | null>(null);
  const [restored, setRestored] = useState(false);
  const [loadedNote, setLoadedNote] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [split, setSplit] = useState(DEFAULT_SPLIT);

  // Solved on a previous visit (persisted by the gamification store).
  const solvedBefore = useGame().done.includes(problem.id);

  const secRef = useRef(0);
  const splitRef = useRef(DEFAULT_SPLIT);
  const gridRef = useRef<HTMLDivElement>(null);
  const draftRef = useRef(false);
  const assistedRef = useRef(false);
  const hydratedRef = useRef(false);

  const { guide, tiers, script, visibleTiers, handCrafted } = bundle;
  const solution = tiers[solTier];
  const lecture = bundle.lectures[solTier];
  const guideText =
    solLang === "english" ? guide.english : solLang === "hindi" ? guide.hindi : guide.hinglish;
  const tierButtons = TIER_ORDER.filter((id) => visibleTiers.includes(id));
  const visibleExamples = problem.tests.filter((t) => !t.hidden).slice(0, 2);

  // Restore the saved split + note whether we resumed a draft.
  useEffect(() => {
    try {
      const s = Number(window.localStorage.getItem("cm-split"));
      if (s >= MIN_SPLIT && s <= MAX_SPLIT) {
        setSplit(s);
        splitRef.current = s;
      }
      const saved = window.localStorage.getItem(`cm-code:${problem.id}`);
      if (saved && saved !== problem.starterCode) {
        draftRef.current = true;
        setRestored(true);
      }
    } catch {
      /* storage unavailable */
    }
    hydratedRef.current = true;
  }, [problem.id, problem.starterCode]);

  // Autosave the draft per problem.
  useEffect(() => {
    if (!hydratedRef.current) return;
    const t = window.setTimeout(() => {
      try {
        if (code === problem.starterCode) window.localStorage.removeItem(`cm-code:${problem.id}`);
        else window.localStorage.setItem(`cm-code:${problem.id}`, code);
      } catch {
        /* ignore */
      }
    }, 500);
    return () => window.clearTimeout(t);
  }, [code, problem.id, problem.starterCode]);

  const judgeOnce = useCallback(async (): Promise<JudgeResult> => {
    let data: JudgeResult;
    try {
      const res = await fetch("/api/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId: problem.id, code }),
      });
      data = (await res.json()) as JudgeResult;
      if (!res.ok && !data.verdict) {
        data = { ...data, passed: false, verdict: "Judge error", message: `The judge answered with status ${res.status}.` };
      }
    } catch (err) {
      data = {
        passed: false,
        verdict: "Judge unreachable",
        message: err instanceof Error ? err.message : "Network error",
      };
    }
    setJudge(data);
    setFocusLine(data.diagnostics?.[0]?.line ?? null);
    setConsoleOpen(true);
    return data;
  }, [problem.id, code]);

  const accept = useCallback(() => {
    setTutor("All tests passed.");
    setProvider("builtin");
    const elapsed = secRef.current;
    setSolvedSec((prev) => prev ?? elapsed);
    const detail = recordSolve({
      id: problem.id,
      difficulty: problem.difficulty,
      topicId: nav.topicId,
      topicProblemIds: nav.topicProblemIds,
      elapsedSec: draftRef.current ? undefined : elapsed,
      assisted: assistedRef.current,
    });
    fireReward({ ...detail, title: problem.title, next: nav.next });
  }, [problem.id, problem.title, problem.difficulty, nav.topicId, nav.topicProblemIds, nav.next]);

  const runJudge = useCallback(async () => {
    if (busy || submitBusy) return;
    setBusy(true);
    setLcMsg("");
    try {
      const data = await judgeOnce();
      if (data.passed) accept();
    } finally {
      setBusy(false);
    }
  }, [busy, submitBusy, judgeOnce, accept]);

  const submitLc = useCallback(async () => {
    if (busy || submitBusy) return;
    setSubmitBusy(true);
    setLcMsg(problem.leetcodeSlug ? "Submitting to LeetCode…" : "Checking tests…");
    try {
      const local = await judgeOnce();
      if (local.passed) accept();
      const localLine = local.compileError
        ? `Local compile error: ${local.compileError}`
        : local.message
          ? local.message
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
        const hint = /session/i.test(why) ? " Open Settings and paste your LEETCODE_SESSION cookie." : "";
        setLcMsg(`${localLine} LeetCode: ${why}.${hint}`);
      } else {
        setLcMsg(`${localLine} LeetCode: ${data.verdict?.statusMsg || "submitted"}.`);
      }
    } catch (err) {
      setLcMsg(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setSubmitBusy(false);
    }
  }, [busy, submitBusy, judgeOnce, accept, problem.leetcodeSlug, problem.id, code]);

  async function askTutorOnly() {
    setHintBusy(true);
    setConsoleOpen(true);
    try {
      const judgeSummary = !judge
        ? "No judge run yet."
        : judge.compileError
          ? `Compile error:\n${judge.compileError}`
          : `Passed ${judge.passedCount}/${judge.total}. Details: ${JSON.stringify(judge.details)}`;
      const t = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId: problem.id, code, judgeSummary, bumpHint: true }),
      });
      const tj = await t.json();
      setTutor(tj.reply || "");
      setProvider(tj.provider || "");
    } catch {
      setTutor("Couldn't reach the mentor right now. Try the hint ladder in the Description tab.");
      setProvider("");
    } finally {
      setHintBusy(false);
    }
  }

  // Ctrl/Cmd+Enter runs, Ctrl/Cmd+Shift+Enter submits — from anywhere on the page.
  const runRef = useRef(runJudge);
  const submitRef = useRef(submitLc);
  useEffect(() => {
    runRef.current = runJudge;
    submitRef.current = submitLc;
  });
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.defaultPrevented || !(e.ctrlKey || e.metaKey) || e.key !== "Enter") return;
      e.preventDefault();
      if (e.shiftKey) void submitRef.current();
      else void runRef.current();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function startDrag(e: ReactPointerEvent<HTMLDivElement>) {
    const el = gridRef.current;
    if (!el) return;
    e.preventDefault();
    const rect = el.getBoundingClientRect();
    const prevSelect = document.body.style.userSelect;
    const prevCursor = document.body.style.cursor;
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
    const move = (ev: PointerEvent) => {
      const p = ((ev.clientX - rect.left) / rect.width) * 100;
      const next = Math.max(MIN_SPLIT, Math.min(MAX_SPLIT, p));
      splitRef.current = next;
      setSplit(next);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      document.body.style.userSelect = prevSelect;
      document.body.style.cursor = prevCursor;
      try {
        window.localStorage.setItem("cm-split", String(Math.round(splitRef.current)));
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  function nudgeSplit(e: ReactKeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight" && e.key !== "Home") return;
    e.preventDefault();
    const next =
      e.key === "Home"
        ? DEFAULT_SPLIT
        : Math.max(MIN_SPLIT, Math.min(MAX_SPLIT, splitRef.current + (e.key === "ArrowLeft" ? -2 : 2)));
    splitRef.current = next;
    setSplit(next);
    try {
      window.localStorage.setItem("cm-split", String(next));
    } catch {
      /* ignore */
    }
  }

  function resetCode() {
    if (!confirmReset) {
      setConfirmReset(true);
      window.setTimeout(() => setConfirmReset(false), 3000);
      return;
    }
    setCode(problem.starterCode);
    setConfirmReset(false);
    setFocusLine(null);
  }

  function loadSolution() {
    setCode(solution.code);
    assistedRef.current = true;
    setLoadedNote(true);
  }

  const solved = solvedSec != null;
  const showSolved = solved || solvedBefore;

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      {/* ───────── Command bar ───────── */}
      <header className="card flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 px-2.5 py-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <Link href="/practice" className="btn btn-quiet btn-sm !px-2" title="All problems">
            <Icon name="chevronLeft" size={14} />
            <span className="hidden sm:inline">Problems</span>
          </Link>
          <Link
            href={`/practice?topic=${nav.topicId}`}
            className="chip hidden! transition-colors hover:text-[var(--ink)] md:inline-flex!"
            title={`More ${nav.topicTitle} problems`}
          >
            {nav.topicTitle}
          </Link>
          <h1 className="font-display min-w-0 truncate pl-1 text-[17px] font-semibold leading-none tracking-[-0.03em]">
            {problem.title}
          </h1>
          <span className="shrink-0 pl-1">
            <Pips difficulty={problem.difficulty} label />
          </span>
          {showSolved && (
            <span className="chip chip-brand cm-pop shrink-0">
              <Icon name="check" size={11} strokeWidth={3} /> Solved
            </span>
          )}
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          {problem.leetcodeSlug && (
            <a
              className="btn btn-quiet btn-sm hidden! xl:inline-flex!"
              href={`https://leetcode.com/problems/${problem.leetcodeSlug}/`}
              target="_blank"
              rel="noreferrer"
            >
              LeetCode <Icon name="arrowUpRight" size={12} />
            </a>
          )}
          {problem.hackerrankSlug && (
            <a
              className="btn btn-quiet btn-sm hidden! xl:inline-flex!"
              href={`https://www.hackerrank.com/challenges/${problem.hackerrankSlug}/problem`}
              target="_blank"
              rel="noreferrer"
            >
              HackerRank <Icon name="arrowUpRight" size={12} />
            </a>
          )}

          <div className="mr-1 flex items-center gap-0.5">
            {nav.prev ? (
              <Link href={`/practice/${nav.prev.id}`} className="btn btn-quiet btn-sm !px-2" title={`Previous: ${nav.prev.title}`} aria-label={`Previous problem: ${nav.prev.title}`}>
                <Icon name="chevronLeft" size={15} />
              </Link>
            ) : (
              <span className="btn btn-quiet btn-sm pointer-events-none !px-2 opacity-30" aria-hidden>
                <Icon name="chevronLeft" size={15} />
              </span>
            )}
            {nav.position && (
              <span className="px-1 text-[11px] tabular-nums text-[var(--faint)]">
                {nav.position.index}/{nav.position.total}
              </span>
            )}
            {nav.next ? (
              <Link href={`/practice/${nav.next.id}`} className="btn btn-quiet btn-sm !px-2" title={`Next: ${nav.next.title}`} aria-label={`Next problem: ${nav.next.title}`}>
                <Icon name="chevronRight" size={15} />
              </Link>
            ) : (
              <span className="btn btn-quiet btn-sm pointer-events-none !px-2 opacity-30" aria-hidden>
                <Icon name="chevronRight" size={15} />
              </span>
            )}
          </div>

          <Stopwatch running={!solved} secRef={secRef} done={solved} />

          <button type="button" disabled={hintBusy} onClick={askTutorOnly} className="btn btn-sm" title="Ask the mentor for a nudge about your current code">
            <Icon name="bulb" size={14} className="text-[var(--gold)]" />
            {hintBusy ? "Thinking…" : "Hint"}
          </button>
          <button type="button" disabled={busy || submitBusy} onClick={runJudge} className="btn btn-sm" title="Run all tests (Ctrl+Enter)">
            <Icon name="play" size={12} fill="currentColor" strokeWidth={0} className="text-[var(--accent)]" />
            {busy ? "Running…" : "Run"}
            <span className="hidden items-center gap-0.5 lg:inline-flex">
              <kbd className="kbd">Ctrl</kbd>
              <kbd className="kbd">↵</kbd>
            </span>
          </button>
          <button type="button" disabled={busy || submitBusy} onClick={submitLc} className="btn btn-primary btn-sm" title="Judge, then submit (Ctrl+Shift+Enter)">
            {submitBusy ? (problem.leetcodeSlug ? "Submitting…" : "Checking…") : "Submit"}
          </button>
        </div>
      </header>

      {lcMsg && (
        <div className="cm-drop card flex shrink-0 items-start gap-2.5 px-3.5 py-2.5 text-sm text-[var(--ink)]">
          <Icon name="info" size={16} className="mt-0.5 shrink-0 text-[var(--accent-2)]" />
          <p className="min-w-0 flex-1 break-words">{lcMsg}</p>
          <button type="button" onClick={() => setLcMsg("")} aria-label="Dismiss message" className="btn btn-quiet btn-sm !h-6 !px-1.5">
            <Icon name="x" size={13} />
          </button>
        </div>
      )}

      {/* ───────── Panels ───────── */}
      <div
        ref={gridRef}
        className="grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-y-auto lg:gap-0 lg:overflow-hidden lg:[grid-template-columns:var(--split)_10px_minmax(0,1fr)]"
        style={{ "--split": `${split}%` } as CSSProperties}
      >
        {/* Left: learn */}
        <section className="card flex min-h-[72vh] min-w-0 flex-col overflow-hidden lg:min-h-0">
          <div role="tablist" aria-label="Problem sections" className="no-scrollbar flex shrink-0 items-center gap-1 overflow-x-auto border-b border-[var(--line)] p-2">
            {TABS.map((t) => {
              const on = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setTab(t.id)}
                  className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium transition-colors ${
                    on
                      ? "bg-[var(--chip)] text-[var(--ink)] shadow-[inset_0_0_0_1px_var(--line-strong)]"
                      : "text-[var(--muted)] hover:bg-white/[.04] hover:text-[var(--ink)]"
                  }`}
                >
                  <Icon name={t.icon} size={14} className={on ? "text-[var(--accent)]" : ""} />
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            {tab === "teach" && (
              <div className="cm-fade space-y-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip">
                    <Pips difficulty={problem.difficulty} label />
                  </span>
                  <span className="chip">{nav.topicTitle}</span>
                  {problem.leetcodeId && <span className="chip">LeetCode #{problem.leetcodeId}</span>}
                </div>

                <LessonContent source={problem.lesson} />

                {visibleExamples.length > 0 && (
                  <section>
                    <h2 className="mb-3 text-sm font-semibold">Examples</h2>
                    <div className="space-y-3">
                      {visibleExamples.map((t, i) => (
                        <div key={i} className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)]">
                          <div className="border-b border-[var(--line)] px-3 py-1.5 text-[11px] font-medium text-[var(--muted)]">
                            Example {i + 1}
                          </div>
                          <div className="grid gap-px bg-[var(--line)] sm:grid-cols-2">
                            <div className="bg-[var(--surface)] p-3">
                              <p className="mb-1 text-[11px] text-[var(--faint)]">Input</p>
                              <pre className="whitespace-pre-wrap text-[12.5px] text-[var(--ink)]">{t.input}</pre>
                            </div>
                            <div className="bg-[var(--surface)] p-3">
                              <p className="mb-1 text-[11px] text-[var(--faint)]">Output</p>
                              <pre className="whitespace-pre-wrap text-[12.5px] text-[var(--ink)]">{t.expected}</pre>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <section>
                  <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <Icon name="bulb" size={15} className="text-[var(--gold)]" />
                    Stuck? Take a nudge
                  </h2>
                  <div className="space-y-2">
                    {problem.hints.slice(0, hintsShown).map((h, i) => (
                      <div key={i} className="cm-fade rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3.5 text-sm leading-relaxed text-[var(--ink)]">
                        <span className="eyebrow mr-2 !text-[var(--gold)]">Hint {i + 1}</span>
                        {h}
                      </div>
                    ))}
                    {hintsShown < problem.hints.length && (
                      <button type="button" onClick={() => setHintsShown((n) => n + 1)} className="btn btn-sm">
                        Reveal hint {hintsShown + 1} of {problem.hints.length}
                        <Icon name="chevronDown" size={13} />
                      </button>
                    )}
                  </div>
                </section>
              </div>
            )}

            {tab === "watch" && <TeacherShow key={script.id} script={script} compact hidePractice />}

            {(tab === "lecture" || tab === "solution") && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="text-xs text-[var(--muted)]">Approach</span>
                <div className="inline-flex rounded-xl border border-[var(--line-strong)] bg-[var(--surface)] p-0.5">
                  {tierButtons.map((id) => {
                    const t = tiers[id];
                    const active = solTier === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setSolTier(id)}
                        className={`h-7 rounded-[9px] px-3 text-xs font-medium transition-colors ${
                          active
                            ? id === "best"
                              ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                              : id === "easy"
                                ? "bg-[var(--easy)] text-[#04121f]"
                                : "bg-[var(--chip)] text-[var(--ink)]"
                            : "text-[var(--muted)] hover:text-[var(--ink)]"
                        }`}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
                <button type="button" onClick={loadSolution} className="btn btn-sm ml-auto" title="Replaces your editor code with this solution. Counts as assisted (half XP).">
                  Load into editor
                </button>
                {loadedNote && (
                  <p className="cm-fade basis-full text-xs text-[var(--muted)]">
                    Loaded. Solves from here count as assisted — half XP and no speed bonus. Try typing it from memory for full credit.
                  </p>
                )}
              </div>
            )}

            {tab === "lecture" && <CodeLecture key={lecture.id} script={lecture} />}

            {tab === "solution" && (
              <div className="cm-fade space-y-6">
                <div>
                  <p className="text-[15px] font-medium leading-snug text-[var(--ink)]">{solution.blurb}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">{solution.blurbEn}</p>
                  <p className="mt-3">
                    <span className="chip chip-brand">
                      <Icon name="timer" size={12} /> {solution.complexity}
                    </span>
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--ink)]">{solution.why}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{solution.whyEn}</p>
                </div>

                <section className="border-t border-[var(--line)] pt-5">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold text-[var(--ink)]">Detailed explanation</h2>
                    <div className="ml-auto inline-flex rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] p-0.5">
                      {SOL_LANGS.map((l) => (
                        <button
                          key={l.id}
                          type="button"
                          aria-pressed={solLang === l.id}
                          onClick={() => setSolLang(l.id)}
                          className={`h-6 rounded-md px-2.5 text-xs font-medium transition-colors ${
                            solLang === l.id ? "bg-[var(--chip)] text-[var(--ink)]" : "text-[var(--muted)] hover:text-[var(--ink)]"
                          }`}
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <LessonContent source={guideText} />
                </section>

                <section className="border-t border-[var(--line)] pt-5">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h2 className="text-sm font-semibold text-[var(--ink)]">C++ · {solution.label}</h2>
                    <div className="flex items-center gap-1">
                      <CopyButton text={solution.code} />
                      <button type="button" onClick={() => setTab("lecture")} className="btn btn-quiet btn-sm !text-[var(--accent)]">
                        Watch code walk <Icon name="arrowRight" size={12} />
                      </button>
                    </div>
                  </div>
                  <pre className="overflow-x-auto rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 text-[12.5px] leading-relaxed text-[#d7e0ee]">
                    <code>{solution.code}</code>
                  </pre>
                </section>
                <p className="text-xs leading-relaxed text-[var(--muted)]">
                  {handCrafted
                    ? "Tip: start with Easy, then Medium, then Best. Same problem, three levels."
                    : "Best is interview-ready. Hand-written Easy/Medium are available on the core path (Two Sum → …)."}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Resizer */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize panels"
          aria-valuenow={Math.round(split)}
          aria-valuemin={MIN_SPLIT}
          aria-valuemax={MAX_SPLIT}
          tabIndex={0}
          onPointerDown={startDrag}
          onKeyDown={nudgeSplit}
          onDoubleClick={() => {
            splitRef.current = DEFAULT_SPLIT;
            setSplit(DEFAULT_SPLIT);
            try {
              window.localStorage.removeItem("cm-split");
            } catch {
              /* ignore */
            }
          }}
          className="group hidden cursor-col-resize items-center justify-center lg:flex"
          title="Drag to resize · double-click to reset"
        >
          <span className="h-10 w-[3px] rounded-full bg-[var(--line-strong)] transition-colors group-hover:bg-[var(--accent)] group-focus-visible:bg-[var(--accent)]" />
        </div>

        {/* Right: code */}
        <section className="card flex h-[700px] min-w-0 flex-col overflow-hidden lg:h-auto lg:min-h-0">
          <div className="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-[var(--line)] px-3">
            <div className="flex items-center gap-2">
              <span className="chip !text-[var(--ink)]">
                <Icon name="code" size={12} /> C++17
              </span>
              <span className="hidden items-center gap-1.5 text-[11px] text-[var(--faint)] sm:inline-flex">
                <Icon name="check" size={11} />
                {restored ? "Resumed your draft · autosaves" : "Autosaves"}
              </span>
            </div>
            <button
              type="button"
              onClick={resetCode}
              className={`btn btn-sm ${confirmReset ? "!border-[rgba(255,107,129,0.5)] !text-[var(--bad)]" : "btn-quiet"}`}
              title="Restore the starter code"
            >
              <Icon name="reset" size={13} />
              {confirmReset ? "Click again to reset" : "Reset"}
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
              onRun={() => void runRef.current()}
              onSubmit={() => void submitRef.current()}
            />
          </div>

          <Console
            judge={judge}
            tutor={tutor}
            provider={provider}
            busy={busy || submitBusy}
            open={consoleOpen}
            onToggle={() => setConsoleOpen((o) => !o)}
            onJump={(line) => setFocusLine(line)}
          />
        </section>
      </div>
    </div>
  );
}

/* ───────────────────────── Pieces ───────────────────────── */

function Stopwatch({
  running,
  done,
  secRef,
}: {
  running: boolean;
  done: boolean;
  secRef: { current: number };
}) {
  const [s, setS] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const on = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, []);

  useEffect(() => {
    secRef.current = s;
  }, [s, secRef]);

  useEffect(() => {
    if (!running || paused || hidden) return;
    const t = window.setInterval(() => setS((v) => v + 1), 1000);
    return () => window.clearInterval(t);
  }, [running, paused, hidden]);

  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");

  return (
    <button
      type="button"
      onClick={() => !done && setPaused((p) => !p)}
      className={`chip !h-8 !px-2.5 tabular-nums ${done ? "chip-brand" : paused ? "!text-[var(--faint)]" : "!text-[var(--ink)]"}`}
      title={done ? "Solved in this time" : paused ? "Resume timer" : "Pause timer"}
    >
      <Icon name={done ? "check" : paused ? "play" : "timer"} size={12} strokeWidth={done ? 3 : 1.75} />
      {mm}:{ss}
    </button>
  );
}

function CopyButton({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-quiet btn-sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setOk(true);
          window.setTimeout(() => setOk(false), 1400);
        } catch {
          /* clipboard blocked */
        }
      }}
    >
      <Icon name={ok ? "check" : "copy"} size={13} className={ok ? "text-[var(--accent)]" : ""} />
      {ok ? "Copied" : "Copy"}
    </button>
  );
}

function Console({
  judge,
  tutor,
  provider,
  busy,
  open,
  onToggle,
  onJump,
}: {
  judge: JudgeResult | null;
  tutor: string;
  provider: string;
  busy: boolean;
  open: boolean;
  onToggle: () => void;
  onJump: (line: number) => void;
}) {
  const verdict = judge?.verdict || (judge?.compileError ? "Compile Error" : "");
  const accepted = verdict === "Accepted";
  const isCompile = verdict === "Compile Error";
  const cases = judge?.details ?? [];
  const firstBad = cases.findIndex((c) => !c.ok);
  const [pick, setPick] = useState<{ ref: JudgeResult | null; i: number } | null>(null);
  const idx = pick && pick.ref === judge ? pick.i : firstBad >= 0 ? firstBad : 0;
  const shown = cases[idx];
  const diags = judge?.diagnostics ?? [];

  return (
    <div className="shrink-0 border-t border-[var(--line)]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex h-10 w-full items-center gap-3 px-3 text-left text-xs transition-colors hover:bg-white/[.02]"
      >
        <Icon name="terminal" size={14} className="text-[var(--muted)]" />
        <span className="font-semibold text-[var(--ink)]">Console</span>
        {busy ? (
          <span className="cm-pulse text-[var(--muted)]">Compiling and running tests…</span>
        ) : verdict ? (
          <span
            key={`${verdict}-${judge?.passedCount}`}
            className={`cm-pop inline-flex items-center gap-1.5 font-semibold ${accepted ? "text-[var(--accent)]" : "text-[var(--bad)]"}`}
          >
            <Icon name={accepted ? "check" : "x"} size={13} strokeWidth={2.8} />
            {verdict}
            {!isCompile && judge?.total != null && (
              <span className="font-normal text-[var(--muted)]">
                · {judge.passedCount}/{judge.total} tests
              </span>
            )}
          </span>
        ) : (
          <span className="text-[var(--faint)]">Run your code to see results</span>
        )}
        <span className="ml-auto flex items-center gap-2 text-[var(--faint)]">
          <Icon name={open ? "chevronDown" : "chevronUp"} size={14} />
        </span>
      </button>

      {open && (
        <div className="max-h-[270px] min-h-[150px] overflow-y-auto border-t border-[var(--line)] bg-[var(--bg-2)] p-3.5 text-xs">
          {!judge && !busy && !tutor && (
            <p className="leading-relaxed text-[var(--muted)]">
              Run compiles your C++ with g++ and checks every test — visible and hidden — the way a judge does.
              <span className="mt-2 flex items-center gap-1.5 text-[var(--faint)]">
                Shortcut <kbd className="kbd">Ctrl</kbd>
                <kbd className="kbd">↵</kbd>
              </span>
            </p>
          )}

          {judge?.message && <p className="mb-2 text-[var(--bad)]">{judge.message}</p>}

          {diags.length > 0 && (
            <ul className="space-y-1">
              {diags.map((d, i) => (
                <li key={`${d.line}:${d.column}:${i}`}>
                  <button
                    type="button"
                    onClick={() => onJump(d.line)}
                    className="text-left text-[#ffb4c0] underline-offset-2 hover:underline"
                  >
                    <span className="font-mono text-[var(--faint)]">
                      {d.line}:{d.column}
                    </span>{" "}
                    {d.message}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {judge?.compileError && diags.length === 0 && (
            <pre className="whitespace-pre-wrap text-[#ffb4c0]">{judge.compileError}</pre>
          )}

          {cases.length > 0 && !isCompile && (
            <>
              <div className="flex flex-wrap gap-1.5">
                {cases.map((c, i) => {
                  const on = i === idx;
                  return (
                    <button
                      key={i}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setPick({ ref: judge, i })}
                      className={`inline-flex h-7 items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-medium transition-colors ${
                        on ? "border-[var(--line-strong)] bg-[var(--chip)]" : "border-[var(--line)] hover:bg-white/[.03]"
                      } ${c.ok ? "text-[var(--accent)]" : "text-[var(--bad)]"}`}
                    >
                      <Icon name={c.ok ? "check" : "x"} size={11} strokeWidth={3} />
                      Case {i + 1}
                      {c.hidden && <Icon name="lock" size={10} className="text-[var(--faint)]" />}
                    </button>
                  );
                })}
              </div>

              {shown && (
                <div className="cm-fade mt-3 space-y-2" key={idx}>
                  {shown.error && <p className="text-[#ffb4c0]">{shown.error}</p>}
                  {shown.hidden && shown.input == null && (
                    <p className="text-[var(--muted)]">This is a hidden test, so its data isn&rsquo;t shown.</p>
                  )}
                  {(
                    [
                      ["Input", shown.input],
                      ["Your output", shown.actual],
                      ["Expected", shown.expected],
                    ] as const
                  ).map(
                    ([label, val]) =>
                      val != null && (
                        <div key={label}>
                          <p className="mb-1 text-[11px] text-[var(--faint)]">{label}</p>
                          <pre className="whitespace-pre-wrap rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-[12px] text-[var(--ink)]">
                            {val === "" ? "(empty)" : val}
                          </pre>
                        </div>
                      )
                  )}
                </div>
              )}
            </>
          )}

          {tutor && (
            <div className="mt-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3">
              <p className="eyebrow mb-1.5 flex items-center gap-1.5 !text-[var(--gold)]">
                <Icon name="bulb" size={12} /> Mentor
              </p>
              <div className="whitespace-pre-wrap text-[13px] leading-relaxed text-[var(--ink)]">{tutor}</div>
              {provider && provider !== "builtin" && (
                <p className="mt-2 text-[11px] text-[var(--faint)]">via {provider}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
