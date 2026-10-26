import {
  assembleSources,
  cleanCpp,
  compileCpp,
  compilerInfo,
  displayCode,
  ensurePch,
  outputsMatch,
  runExe,
  safetyIssues,
  type CompileResult,
  type Sources,
} from "./cpp";
import { createMemberStreamer } from "./json-stream";
import { describeLlmError, geminiModelInUse, llm, llmJson, LlmError, type LlmConfig } from "./llm";
import {
  DRY_SYSTEM,
  FOLLOWUP_SYSTEM,
  NARRATE_ENGLISH,
  NARRATE_HINGLISH,
  REPAIR_SYSTEM,
  LANGS_SYSTEM,
  SOLVE_SYSTEM,
  TRANSLATE_SYSTEM,
  dryUser,
  followupUser,
  langsUser,
  narrateUser,
  repairUser,
  solveUser,
  translateUser,
} from "./prompts";
import { buildFrames, dryRows, framesForPrompt, parseTrace, resolveViz, sampleEvents, type RawEvent } from "./trace";
import type { AgentEvent, CodeBundle, Hook, LangPack, RunOutput, Stage, TestRow, Verify, Viz } from "./types";
import {
  readExplain,
  readHook,
  validateDry,
  validateLangs,
  validateNarration,
  validateRepair,
  validateSolve,
  validateTranslate,
  type Narration,
} from "./validate";
import { buildScript } from "./video";

const MAX_REPAIRS = 2;
const VIDEO_STEPS = 12;
const TABLE_ROWS = 24;

export function providerLabel(cfg: LlmConfig): string {
  if (cfg.kind === "demo") return "Demo answer (pre-written)";
  if (cfg.kind === "openai") return cfg.model;
  return `Gemini ${geminiModelInUse() ?? cfg.model ?? "Flash"}`.trim();
}

/* ------------------------------------------ tests ------------------------------------------ */

async function runTests(exe: string, tests: TestRow[]): Promise<TestRow[]> {
  const rows: TestRow[] = new Array(tests.length);
  let next = 0;
  const worker = async () => {
    while (next < tests.length) {
      const i = next++;
      const t = tests[i];
      const r = await runExe(exe, t.input);
      const out = r.stdout.replace(/\r\n/g, "\n").trim();
      let actual = out;
      if (r.timedOut) actual = "(timed out after 3 s)";
      else if (r.code !== 0) actual = `${out ? `${out}\n` : ""}(crashed, exit code ${r.code}${r.stderr.trim() ? `: ${r.stderr.trim().slice(0, 160)}` : ""})`;
      const checkable = t.expected.trim().length > 0;
      rows[i] = {
        ...t,
        actual: actual.slice(0, 400),
        ok: r.code === 0 && !r.timedOut && (checkable ? outputsMatch(t.expected, r.stdout) : true),
      };
    }
  };
  await Promise.all([worker(), worker(), worker()]);
  return rows;
}

function failureFeedback(rows: TestRow[]): string {
  return rows
    .map((r, i) => ({ r, i }))
    .filter(({ r }) => !r.ok)
    .slice(0, 3)
    .map(
      ({ r, i }) =>
        `Test #${i}${r.note ? ` (${r.note})` : ""}: input=${JSON.stringify(r.input)} expected=${JSON.stringify(r.expected)} but the program printed ${JSON.stringify(r.actual ?? "")}`,
    )
    .join("\n");
}

/** A repaired test list must keep every example copied from the student's question exactly as it was. */
function mergeTests(old: TestRow[], fixed: TestRow[]): TestRow[] {
  if (!fixed.length) return old;
  const statement = old.filter((t) => /^statement:/i.test(t.note));
  const byInput = new Map(statement.map((t) => [t.input.trim(), t]));
  const merged = fixed.map((t) => byInput.get(t.input.trim()) ?? t);
  for (const t of statement) if (!merged.some((m) => m.input.trim() === t.input.trim())) merged.push(t);
  return merged.slice(0, 8);
}

type Build = {
  asm: Sources;
  plain: CompileResult | null;
  traced: CompileResult | null;
  rows: TestRow[];
  testFeedback: string;
  traceFeedback: string;
  missing: boolean;
};

async function buildAndTest(solution: string, driver: string, tests: TestRow[]): Promise<Build> {
  const asm = assembleSources(solution, driver);
  const empty = { asm, plain: null, traced: null, rows: tests.map((t) => ({ ...t })), traceFeedback: "", missing: false };
  const issues = [...safetyIssues(asm.plain), ...(asm.leftoverTrace ? ["a TR(...) call is not one complete line on its own"] : [])];
  if (issues.length) return { ...empty, testFeedback: `Static check failed: ${issues.join("; ")}` };

  // Both builds start together; the tests run on the plain one while the traced one is still compiling.
  const plainP = compileCpp(asm.plain);
  const tracedP = compileCpp(asm.traced);
  const plain = await plainP;
  if (plain.missing || !plain.ok) {
    void tracedP.catch(() => undefined);
    return plain.missing
      ? { ...empty, plain, traced: null, testFeedback: "", missing: true }
      : { ...empty, plain, traced: null, testFeedback: `Compile error:\n${plain.error}` };
  }

  const rows = await runTests(plain.exe!, tests);
  const traced = await tracedP;
  const failed = rows.filter((r) => !r.ok);
  return {
    asm,
    plain,
    traced,
    rows,
    testFeedback: failed.length ? failureFeedback(rows) : "",
    traceFeedback: traced.ok ? "" : `The instrumented build (with TR calls) failed to compile:\n${traced.error}\nOnly pass variables that are in scope at that exact line.`,
    missing: false,
  };
}

/* ------------------------------------------ pipeline ------------------------------------------ */

export type RunOpts = {
  question: string;
  cfg: LlmConfig;
  emit: (ev: AgentEvent) => void;
  signal?: AbortSignal;
};

export async function runAgent({ question, cfg, emit, signal }: RunOpts): Promise<void> {
  const t0 = Date.now();
  const since = () => Date.now() - t0;
  const status = (stage: Stage, msg: string) => emit({ t: "status", stage, msg, ms: since() });
  const aborted = () => !!signal?.aborted;
  const label = () => providerLabel(cfg);

  try {
    status("hook", "Reading your question");
    const compilerP = compilerInfo().then((c) => {
      if (c.ok) void ensurePch();
      return c;
    });

    /* 1. Solve: streamed, so the title and explanation show up while the code is still being written. */
    const partial: Record<string, unknown> = {};
    let hookSent = false;
    const streamer = createMemberStreamer((key, value) => {
      partial[key] = value;
      if (!hookSent && "title" in partial && "topics" in partial) {
        hookSent = true;
        const h = readHook(partial);
        if (!h.offTopic) {
          emit({ t: "hook", data: h, provider: label() });
          status("solve", "Writing the solution");
        }
      }
      if (key === "explain" && value && typeof value === "object" && Object.keys(value as object).length) {
        emit({ t: "explain", data: readExplain(value) });
      }
    });

    const solved = await llmJson(
      cfg,
      { tag: "solve", system: SOLVE_SYSTEM, user: solveUser(question), temperature: 0.2, maxTokens: 7000, think: "off", timeoutMs: 160_000, signal },
      validateSolve,
      (acc) => streamer.feed(acc),
    );
    if (aborted()) return;
    const sd = solved.data;

    if (sd.hook.offTopic) {
      emit({
        t: "error",
        code: "off_topic",
        message: sd.hook.restated || "I can only help with programming, data structures, algorithms and computer science.",
      });
      return;
    }
    emit({ t: "hook", data: sd.hook, provider: label() });
    emit({ t: "explain", data: sd.explain });

    let solution = sd.code!.solution;
    let driver = sd.code!.driver;
    let tests: TestRow[] = sd.tests.length ? sd.tests : [{ input: "", expected: "", note: "demo run" }];
    const bundle = (): CodeBundle => ({
      solution: displayCode(solution),
      driver: cleanCpp(driver),
      inputFormat: sd.code!.inputFormat,
      outputFormat: sd.code!.outputFormat,
    });
    emit({ t: "code", data: bundle(), tests, viz: sd.viz });

    /* 2. Verify with the real compiler; let the model repair itself with real error text. */
    status("verify", "Compiling and testing your answer on this machine");
    const comp = await compilerP;
    const vStart = Date.now();
    let repaired = 0;
    let repairNote = "";
    let build: Build | null = null;
    let repairBlocked = "";

    if (comp.ok) {
      build = await buildAndTest(solution, driver, tests);
      while (!aborted() && !build.missing && (build.testFeedback || build.traceFeedback) && repaired < MAX_REPAIRS) {
        const feedback = build.testFeedback || build.traceFeedback;
        status("repair", `${build.testFeedback ? "A check failed" : "The step-by-step build failed"}, so the AI is fixing its code (attempt ${repaired + 1})`);
        try {
          const fix = await llmJson(
            cfg,
            {
              tag: "repair",
              system: REPAIR_SYSTEM,
              user: repairUser({ question, title: sd.hook.title, solution, driver, tests: build.rows, feedback, attempt: repaired + 1 }),
              temperature: 0.1,
              maxTokens: 7000,
              think: "low",
              signal,
            },
            validateRepair,
          );
          solution = fix.data.solution || solution;
          driver = fix.data.driver || driver;
          tests = mergeTests(tests, fix.data.tests);
          repairNote = fix.data.why || repairNote;
          repaired++;
          emit({ t: "code", data: bundle(), tests, viz: sd.viz });
          status("verify", "Re-running the checks");
          build = await buildAndTest(solution, driver, tests);
        } catch (err) {
          if (aborted()) return;
          repairBlocked = describeLlmError(err).message;
          break;
        }
      }
    }
    if (aborted()) return;

    const rows = build?.rows ?? tests;
    const passed = rows.filter((r) => r.ok).length;
    const checkable = tests.some((t) => t.expected.trim());
    const verify: Verify = (() => {
      const base = { passed, total: rows.length, repaired, ms: Date.now() - vStart, compiler: comp.version, repairNote: repairNote || undefined };
      if (!comp.ok || build?.missing) {
        return { ...base, status: "skipped" as const, passed: 0, reason: "This computer has no C++ compiler (g++), so the code could not be run. Treat the answer as unverified." };
      }
      if (build && !build.testFeedback) {
        return checkable
          ? { ...base, status: "verified" as const }
          : { ...base, status: "skipped" as const, reason: "The code compiled and ran, but there were no expected outputs to compare against." };
      }
      return {
        ...base,
        status: "failed" as const,
        reason: repairBlocked ? `Could not repair: ${repairBlocked}` : "Still failing after the automatic fixes. Check the failing cases before trusting this code.",
        compileError: build?.plain && !build.plain.ok ? build.plain.error : undefined,
      };
    })();
    emit({ t: "verify", data: verify, tests: rows });
    if (repaired > 0 && verify.status === "verified") emit({ t: "code", data: bundle(), tests: rows, viz: sd.viz });

    // Same answer in plain steps and in C, Python and Java. Runs beside the video so it does not add a wait.
    const langsTask: Promise<LangPack | null> = writeLangs(
      cfg,
      {
        title: sd.hook.title,
        question,
        solution: displayCode(solution),
        driver: cleanCpp(driver),
        inputFormat: sd.code!.inputFormat,
        outputFormat: sd.code!.outputFormat,
      },
      signal,
    ).catch(() => null);

    /* 3. Dry run: really execute the instrumented program on the walkthrough input. */
    status("trace", "Running the sample step by step");
    const sample = (rows[0] ?? tests[0]) as TestRow;
    let events: RawEvent[] = [];
    let machineTraced = false;
    let sampleOutput = (sample.actual ?? sample.expected ?? "").trim();
    let lines: string[] = build?.asm.tracedLines ?? [];

    if (build?.plain?.ok && build.traced?.ok) {
      const [tr, pl] = await Promise.all([runExe(build.traced.exe!, sample.input), runExe(build.plain.exe!, sample.input)]);
      const parsed = parseTrace(tr.stderr);
      if (tr.code === 0 && !tr.timedOut && outputsMatch(pl.stdout, tr.stdout) && parsed.events.length >= 2) {
        events = parsed.events;
        machineTraced = true;
        sampleOutput = pl.stdout.trim();
        lines = build.asm.tracedLines;
      }
    }
    if (!machineTraced && !aborted()) {
      try {
        const sim = await llmJson(
          cfg,
          { tag: "dry", system: DRY_SYSTEM, user: dryUser({ solution, sampleInput: sample.input }), temperature: 0, maxTokens: 3000, think: "off", signal },
          validateDry,
        );
        events = sim.data;
        lines = [];
      } catch {
        events = [];
      }
    }
    if (aborted()) return;

    const viz: Viz = events.length ? resolveViz(sd.viz, events) : sd.viz;
    const videoPick = sampleEvents(events, VIDEO_STEPS);
    const frames = buildFrames(events, videoPick, viz, lines);
    if (events.length) {
      const tablePick = sampleEvents(events, TABLE_ROWS);
      emit({
        t: "dry",
        data: {
          sampleInput: sample.input.trim(),
          sampleOutput,
          rows: dryRows(buildFrames(events, tablePick, viz, lines)),
          machineTraced,
          totalEvents: events.length,
        },
      });
    }

    /* 4. Voice-over: two calls in parallel, real values only. */
    status("narrate", "Recording the voice-over");
    let en: Narration | null = null;
    let hing: Narration | null = null;
    if (frames.length) {
      const user = narrateUser({ hook: sd.hook, explain: sd.explain, sampleInput: sample.input, output: sampleOutput, events: framesForPrompt(frames) });
      const call = (tag: string, system: string) =>
        llmJson(cfg, { tag, system, user, temperature: 0.4, maxTokens: 2600, think: "off", timeoutMs: 90_000, signal }, validateNarration(frames.length));
      const [e, h] = await Promise.allSettled([call("narrate-english", NARRATE_ENGLISH), call("narrate-hinglish", NARRATE_HINGLISH)]);
      en = e.status === "fulfilled" ? e.value.data : null;
      hing = h.status === "fulfilled" ? h.value.data : null;
    }
    if (aborted()) return;

    const script = buildScript({
      id: `ask-${t0.toString(36)}`,
      hook: sd.hook,
      explain: sd.explain,
      frames,
      en,
      hing,
      output: sampleOutput,
      machineTraced,
    });
    emit({ t: "video", data: script, machineTraced, narrated: !!(en || hing) });
    const langs = await langsTask;
    if (aborted()) return;
    if (langs) emit({ t: "langs", data: langs });
    status("done", "Done");
    emit({ t: "done", ms: since() });
  } catch (err) {
    if (aborted()) return;
    const e = describeLlmError(err, cfg.kind === "gemini" ? "Gemini" : undefined);
    emit({ t: "error", code: e.code, message: e.message });
  }
}

/* -------------------------------------- smaller services -------------------------------------- */

export async function answerFollowup(
  cfg: LlmConfig,
  a: { title: string; question: string; approach: string; solution: string; history: Array<{ role: "user" | "ai"; text: string }>; ask: string },
  signal?: AbortSignal,
): Promise<string> {
  const r = await llm(cfg, { tag: "followup", system: FOLLOWUP_SYSTEM, user: followupUser(a), temperature: 0.3, maxTokens: 1100, think: "off", signal });
  return r.text.trim();
}

export async function writeLangs(
  cfg: LlmConfig,
  a: { title: string; question: string; solution: string; driver: string; inputFormat: string; outputFormat: string },
  signal?: AbortSignal,
): Promise<LangPack> {
  const r = await llmJson(
    cfg,
    {
      tag: "langs",
      system: LANGS_SYSTEM,
      user: langsUser(a),
      temperature: 0.2,
      maxTokens: 6000,
      think: "off",
      timeoutMs: 50_000,
      signal,
    },
    validateLangs,
  );
  return r.data;
}

export async function translateLines(cfg: LlmConfig, lines: string[], signal?: AbortSignal): Promise<string[]> {
  const r = await llmJson(
    cfg,
    { tag: "translate-hi", system: TRANSLATE_SYSTEM, user: translateUser(lines), temperature: 0.2, maxTokens: 6000, think: "off", signal },
    validateTranslate(lines.length),
  );
  return r.data;
}

export async function runUserInput(a: { solution: string; driver: string; input: string }): Promise<RunOutput> {
  if (a.solution.length > 30_000 || a.driver.length > 12_000 || a.input.length > 20_000) {
    return { ok: false, stdout: "", stderr: "", ms: 0, message: "That is too large to run here." };
  }
  const asm = assembleSources(a.solution, a.driver);
  const issues = safetyIssues(asm.plain);
  if (issues.length) return { ok: false, stdout: "", stderr: "", ms: 0, message: `Refused to run this code: ${issues.join("; ")}.` };
  const comp = await compilerInfo();
  if (!comp.ok) return { ok: false, stdout: "", stderr: "", ms: 0, message: "This computer has no C++ compiler (g++), so code can't be run here." };
  const c = await compileCpp(asm.plain);
  if (!c.ok) return { ok: false, stdout: "", stderr: "", ms: c.ms, compileError: c.error, message: "It did not compile." };
  const r = await runExe(c.exe!, a.input);
  return {
    ok: r.code === 0 && !r.timedOut,
    stdout: r.stdout.replace(/\r\n/g, "\n"),
    stderr: r.stderr.slice(0, 600),
    ms: r.ms,
    timedOut: r.timedOut,
    message: r.timedOut ? "Stopped after 3 seconds (time limit)." : r.code !== 0 ? `The program crashed (exit code ${r.code}).` : undefined,
  };
}

export { LlmError };
export type { Hook };
