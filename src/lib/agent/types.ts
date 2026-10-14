import type { TeacherShowScript } from "../teacher-shows";

/** Shared by the server pipeline and the browser UI (type-only; no runtime code). */

export type AgentLang = "english" | "hinglish" | "hindi";

export type Stage = "hook" | "solve" | "verify" | "repair" | "trace" | "narrate" | "done";

export type Hook = {
  kind: "problem" | "code" | "concept";
  title: string;
  restated: string;
  difficulty: "Easy" | "Medium" | "Hard" | null;
  topics: string[];
  /** True when the question is not about programming / CS at all. */
  offTopic: boolean;
};

/** How the sample run is drawn on the chalkboard. Names refer to the variables passed to TR(...). */
export type Viz = {
  array: string | null;
  pointers: string[];
  window: [string, string] | null;
  table: string | null;
  map: string | null;
  lists: string[];
  show: string[];
};

export type Explain = {
  intuition: string[];
  brute: { idea: string; time: string } | null;
  approach: { name: string; steps: string[]; time: string; space: string; why: string };
  pitfalls: string[];
  followUps: string[];
  /** Concept answers only */
  summary?: string;
  analogy?: string;
  keyPoints?: string[];
};

export type CodeBundle = {
  /** Algorithm only, as shown to the student (trace calls removed). */
  solution: string;
  /** main() that reads stdin and prints the answer. Needed to run it. */
  driver: string;
  inputFormat: string;
  outputFormat: string;
};

export type TestRow = {
  input: string;
  expected: string;
  note: string;
  actual?: string;
  ok?: boolean;
};

export type Verify = {
  status: "verified" | "failed" | "skipped";
  passed: number;
  total: number;
  /** How many times the model had to fix its own code after real g++ feedback. */
  repaired: number;
  reason?: string;
  compiler?: string;
  ms: number;
  compileError?: string;
  /** What the first draft got wrong, in the model's words (only when repaired). */
  repairNote?: string;
};

export type DryRow = {
  n: number;
  note: string;
  code: string;
  vars: Array<{ k: string; v: string }>;
};

export type Dry = {
  sampleInput: string;
  sampleOutput: string;
  rows: DryRow[];
  /** true: every number comes from really running the program. false: written by the model. */
  machineTraced: boolean;
  totalEvents: number;
};

export type ErrorCode =
  | "no_key"
  | "auth"
  | "quota"
  | "model"
  | "blocked"
  | "network"
  | "timeout"
  | "output"
  | "off_topic"
  | "bad_request"
  | "busy"
  | "aborted"
  | "internal";

export type AgentEvent =
  | { t: "status"; stage: Stage; msg: string; ms: number }
  | { t: "hook"; data: Hook; provider: string }
  | { t: "explain"; data: Explain }
  | { t: "code"; data: CodeBundle; tests: TestRow[]; viz: Viz }
  | { t: "verify"; data: Verify; tests: TestRow[] }
  | { t: "dry"; data: Dry }
  | { t: "video"; data: TeacherShowScript; machineTraced: boolean; narrated: boolean }
  | { t: "done"; ms: number }
  | { t: "error"; code: ErrorCode; message: string };

/** What the browser keeps for history / re-opening an answer. */
export type AgentAnswer = {
  id: string;
  question: string;
  at: number;
  lang: AgentLang;
  provider: string;
  hook: Hook;
  explain?: Explain;
  code?: CodeBundle;
  tests?: TestRow[];
  viz?: Viz;
  verify?: Verify;
  dry?: Dry;
  video?: TeacherShowScript;
  machineTraced?: boolean;
  narrated?: boolean;
  ms?: number;
};

export type AgentStatus = {
  configured: boolean;
  provider: "gemini" | "openai" | null;
  model: string | null;
  compiler: { ok: boolean; version?: string };
  demo: Array<{ id: string; label: string; question: string }>;
  /** Present only when ?test=1 was requested */
  test?: { ok: boolean; ms?: number; message?: string; code?: ErrorCode };
};

export type RunOutput = {
  ok: boolean;
  stdout: string;
  stderr: string;
  ms: number;
  timedOut?: boolean;
  compileError?: string;
  message?: string;
};
