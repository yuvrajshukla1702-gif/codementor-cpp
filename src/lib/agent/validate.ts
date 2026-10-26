import type { Explain, Hook, TestRow, Viz } from "./types";
import type { RawEvent } from "./trace";

/** Hand-rolled validators: the model's JSON is untrusted, so every field is coerced or rejected. */

export class ShapeError extends Error {}

type Obj = Record<string, unknown>;

const isObj = (x: unknown): x is Obj => !!x && typeof x === "object" && !Array.isArray(x);

function str(x: unknown, max = 600): string {
  if (typeof x === "string") return x.trim().slice(0, max);
  if (typeof x === "number" || typeof x === "boolean") return String(x);
  return "";
}

function strArr(x: unknown, maxItems = 8, maxLen = 400): string[] {
  const list = Array.isArray(x) ? x : typeof x === "string" && x.trim() ? [x] : [];
  return list
    .map((e) => str(e, maxLen))
    .filter(Boolean)
    .slice(0, maxItems);
}

function nameOrNull(x: unknown): string | null {
  const s = str(x, 60);
  return s && !/^(none|null|n\/a|-)$/i.test(s) ? s : null;
}

export type SolveResult = {
  hook: Hook;
  explain: Explain;
  viz: Viz;
  tests: TestRow[];
  code: { solution: string; driver: string; inputFormat: string; outputFormat: string } | null;
  sampleIndex: number;
};

function difficulty(x: unknown): Hook["difficulty"] {
  const s = str(x, 12).toLowerCase();
  if (s.startsWith("easy")) return "Easy";
  if (s.startsWith("med")) return "Medium";
  if (s.startsWith("hard")) return "Hard";
  return null;
}

export function readHook(o: Obj): Hook {
  const kindRaw = str(o.kind, 12).toLowerCase();
  const kind: Hook["kind"] = kindRaw === "code" ? "code" : kindRaw === "concept" ? "concept" : "problem";
  return {
    kind,
    title: str(o.title, 90) || "Your question",
    restated: str(o.restated, 500),
    difficulty: difficulty(o.difficulty),
    topics: strArr(o.topics, 5, 30),
    offTopic: o.offTopic === true || str(o.offTopic).toLowerCase() === "true",
  };
}

export function readExplain(x: unknown): Explain {
  const o = isObj(x) ? x : {};
  const ap = isObj(o.approach) ? o.approach : {};
  const br = isObj(o.brute) ? o.brute : null;
  const steps = strArr(ap.steps, 8, 300);
  const explain: Explain = {
    intuition: strArr(o.intuition, 6, 480),
    brute: br && str(br.idea) ? { idea: str(br.idea, 300), time: str(br.time, 40) || "—" } : null,
    approach: {
      name: str(ap.name, 80) || "Approach",
      steps,
      time: str(ap.time, 40) || "—",
      space: str(ap.space, 40) || "—",
      why: str(ap.why, 700),
    },
    pitfalls: strArr(o.pitfalls, 5, 300),
    followUps: strArr(o.followUps, 4, 200),
  };
  const summary = str(o.summary, 800);
  const analogy = str(o.analogy, 500);
  const keyPoints = strArr(o.keyPoints, 6, 320);
  if (summary) explain.summary = summary;
  if (analogy) explain.analogy = analogy;
  if (keyPoints.length) explain.keyPoints = keyPoints;
  return explain;
}

export function readViz(x: unknown): Viz {
  const o = isObj(x) ? x : {};
  const win = Array.isArray(o.window) && o.window.length === 2 ? [str(o.window[0], 40), str(o.window[1], 40)] : null;
  return {
    array: nameOrNull(o.array),
    pointers: strArr(o.pointers, 4, 40),
    window: win && win[0] && win[1] ? [win[0], win[1]] : null,
    table: nameOrNull(o.table),
    map: nameOrNull(o.map),
    lists: strArr(o.lists, 3, 40),
    show: strArr(o.show, 5, 40),
  };
}

export function readTests(x: unknown): TestRow[] {
  if (!Array.isArray(x)) return [];
  const out: TestRow[] = [];
  for (const t of x.slice(0, 8)) {
    if (!isObj(t)) continue;
    const input = typeof t.input === "string" ? t.input : t.input == null ? "" : JSON.stringify(t.input);
    const expectedRaw = t.expected;
    const expected =
      typeof expectedRaw === "string"
        ? expectedRaw
        : expectedRaw == null
          ? ""
          : typeof expectedRaw === "object"
            ? JSON.stringify(expectedRaw)
            : String(expectedRaw);
    if (input.length > 3000 || expected.length > 3000) continue;
    out.push({
      input: input && !input.endsWith("\n") ? `${input}\n` : input,
      expected: expected.trim(),
      note: str(t.note, 120),
    });
  }
  return out;
}

export function validateSolve(x: unknown): SolveResult {
  if (!isObj(x)) throw new ShapeError("top level must be a JSON object");
  const hook = readHook(x);
  const explain = readExplain(x.explain);
  const viz = readViz(x.viz);
  const tests = readTests(x.tests);
  const c = isObj(x.code) ? x.code : null;
  const solution = c ? str(c.solution, 14_000) : "";
  const driver = c ? str(c.driver, 6_000) : "";
  if (hook.offTopic) return { hook, explain, viz, tests, code: null, sampleIndex: 0 };
  if (!explain.approach.name || explain.approach.name === "Approach") {
    if (!explain.approach.steps.length && !explain.summary) throw new ShapeError('"explain.approach" is missing');
  }
  if (!solution) throw new ShapeError('"code.solution" is missing');
  if (!driver) throw new ShapeError('"code.driver" is missing (a main() that reads stdin and prints the answer)');
  if (/\bmain\s*\(/.test(solution.replace(/\/\/.*$/gm, ""))) {
    throw new ShapeError('"code.solution" must not contain main(); put main() in "code.driver"');
  }
  if (!/\bmain\s*\(/.test(driver)) throw new ShapeError('"code.driver" must define int main()');
  const sample = Number(x.sampleIndex);
  return {
    hook,
    explain,
    viz,
    tests,
    code: {
      solution,
      driver,
      inputFormat: str(c?.inputFormat, 200) || "see the first test case",
      outputFormat: str(c?.outputFormat, 200) || "see the first test case",
    },
    sampleIndex: Number.isInteger(sample) && sample >= 0 && sample < Math.max(1, tests.length) ? sample : 0,
  };
}

export type RepairResult = { solution: string; driver: string; tests: TestRow[]; why: string };

export function validateRepair(x: unknown): RepairResult {
  if (!isObj(x)) throw new ShapeError("top level must be a JSON object");
  const solution = str(x.solution, 14_000);
  const driver = str(x.driver, 6_000);
  if (!solution && !driver) throw new ShapeError('give the corrected "solution" and/or "driver"');
  if (solution && /\bmain\s*\(/.test(solution.replace(/\/\/.*$/gm, ""))) {
    throw new ShapeError('"solution" must not contain main()');
  }
  return { solution, driver, tests: readTests(x.tests), why: str(x.why, 300) };
}

export type Narration = {
  hook: string;
  brute: string;
  idea: string;
  events: string[];
  result: string;
  complexity: string;
  pitfall: string;
};

export function validateNarration(count: number) {
  return (x: unknown): Narration => {
    if (!isObj(x)) throw new ShapeError("top level must be a JSON object");
    const events = Array.isArray(x.events) ? x.events.map((e) => str(e, 360)) : [];
    if (!events.length || events.every((e) => !e)) throw new ShapeError(`"events" must be an array of ${count} spoken lines`);
    while (events.length < count) events.push("");
    return {
      hook: str(x.hook, 420),
      brute: str(x.brute, 420),
      idea: str(x.idea, 420),
      events: events.slice(0, count),
      result: str(x.result, 420),
      complexity: str(x.complexity, 360),
      pitfall: str(x.pitfall, 360),
    };
  };
}

export function validateLangs(x: unknown): { pseudocode: string; c: string; python: string; java: string } {
  if (!isObj(x)) throw new ShapeError("top level must be a JSON object");
  const block = (v: unknown, max: number) => {
    if (Array.isArray(v)) return v.map((e) => str(e, 500)).filter(Boolean).join("\n").slice(0, max);
    return str(v, max);
  };
  const pseudocode = block(x.pseudocode, 4000);
  const c = block(x.c, 12000);
  const python = block(x.python, 12000);
  const java = block(x.java, 12000);
  if (pseudocode.length < 40) throw new ShapeError('"pseudocode" is missing');
  if (c.length < 40) throw new ShapeError('"c" is missing');
  if (python.length < 40) throw new ShapeError('"python" is missing');
  if (java.length < 40) throw new ShapeError('"java" is missing');
  if (/\bTR\s*\(/.test(`${c}\n${python}\n${java}`)) throw new ShapeError("do not include TR() calls");
  return { pseudocode, c, python, java };
}

export function validateTranslate(count: number) {
  return (x: unknown): string[] => {
    const arr = isObj(x) ? x.out : x;
    if (!Array.isArray(arr)) throw new ShapeError('"out" must be an array of translated lines');
    const out = arr.map((e) => str(e, 500));
    if (out.length !== count) throw new ShapeError(`"out" must have exactly ${count} items (got ${out.length})`);
    return out;
  };
}

/** Fallback when no compiler is available: the model "runs" the code by hand. */
export function validateDry(x: unknown): RawEvent[] {
  if (!isObj(x) || !Array.isArray(x.events)) throw new ShapeError('"events" must be an array');
  const out: RawEvent[] = [];
  for (const e of x.events.slice(0, 16)) {
    if (!isObj(e)) continue;
    const note = str(e.note, 90);
    const v = isObj(e.vars) ? e.vars : {};
    if (!note) continue;
    out.push({ n: out.length + 1, l: 0, t: note, v });
  }
  if (out.length < 2) throw new ShapeError("need at least 2 snapshots");
  return out;
}
