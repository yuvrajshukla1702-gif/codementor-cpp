import type { ShowStep, TeacherShowScript } from "../teacher-shows";
import { mechanicalLine, type Frame } from "./trace";
import type { Explain, Hook } from "./types";
import type { Narration } from "./validate";

const STAGE_KEYS = ["cells", "grid", "lists", "listHi", "map", "mapTitle", "mapPlain", "hi", "gridHi", "window"] as const;

function stageOf(step: Omit<ShowStep, "say"> | undefined, withHi = false): Partial<ShowStep> {
  if (!step) return {};
  const out: Record<string, unknown> = {};
  for (const k of STAGE_KEYS) {
    if (!withHi && (k === "hi" || k === "gridHi" || k === "window" || k === "listHi")) continue;
    if (step[k] !== undefined) out[k] = step[k];
  }
  return out as Partial<ShowStep>;
}

const pick = (...s: Array<string | undefined>) => s.find((x) => x && x.trim()) ?? "";

/**
 * Assemble the whiteboard video: a short intro, one beat per real execution snapshot, and an outro.
 * Words come from the model; every number on the board comes from the traced run.
 */
export function buildScript(a: {
  id: string;
  hook: Hook;
  explain: Explain;
  frames: Frame[];
  en: Narration | null;
  hing: Narration | null;
  hindi?: string[] | null;
  output: string;
  machineTraced: boolean;
}): TeacherShowScript {
  const { hook, explain, frames, en, hing } = a;
  const steps: ShowStep[] = [];
  const first = frames[0]?.step;
  const last = frames[frames.length - 1]?.step;

  const add = (step: Omit<ShowStep, "say" | "sayEn">, say: { en: string; hing?: string }) => {
    const text = say.en || say.hing || "";
    if (!text) return;
    steps.push({ ...step, sayEn: say.en || say.hing || "", say: pick(say.hing, say.en) });
  };

  add(
    { chapter: "Hook", scene: "ask", board: hook.title, gesture: "explain" },
    { en: pick(en?.hook, hook.restated), hing: hing?.hook },
  );

  if (explain.brute) {
    add(
      { chapter: "Brute force", scene: "reject", board: explain.brute.idea.replace(/\s+/g, " ").slice(0, 90), gesture: "think" },
      { en: pick(en?.brute, `The simple way: ${explain.brute.idea} It takes ${explain.brute.time}.`), hing: hing?.brute },
    );
  }

  add(
    { chapter: "The trick", scene: "trick", board: explain.approach.name, gesture: "write", ...stageOf(first) },
    { en: pick(en?.idea, explain.approach.why, explain.intuition[0]), hing: hing?.idea },
  );

  frames.forEach((f, i) => {
    const enLine = pick(en?.events[i], mechanicalLine(f, i, "english"));
    const hingLine = pick(hing?.events[i], en?.events[i] ? "" : mechanicalLine(f, i, "hinglish"));
    steps.push({
      ...f.step,
      chapter: `Step ${i + 1}`,
      scene: "walk",
      say: pick(hingLine, enLine),
      sayEn: enLine,
    });
  });

  add(
    { chapter: "Result", scene: "win", board: a.output.trim().slice(0, 48) || "Answer", gesture: "celebrate", ...stageOf(last, true) },
    { en: pick(en?.result, `For this input the program prints ${a.output.trim().slice(0, 60)}.`), hing: hing?.result },
  );

  add(
    { chapter: "Complexity", scene: "cost", board: `${explain.approach.time}  ·  ${explain.approach.space}`, gesture: "explain" },
    { en: pick(en?.complexity, `Time is ${explain.approach.time} and space is ${explain.approach.space}.`), hing: hing?.complexity },
  );

  const pit = pick(en?.pitfall, explain.pitfalls[0]);
  if (pit) {
    add(
      { chapter: "Watch out", scene: "warn", board: pit.replace(/\s+/g, " ").slice(0, 90), gesture: "point" },
      { en: pit, hing: hing?.pitfall },
    );
  }

  if (a.hindi && a.hindi.length === steps.length) {
    a.hindi.forEach((line, i) => {
      if (line) steps[i].sayHi = line;
    });
  }

  const mins = Math.max(1, Math.round((steps.length * 6) / 60));
  return {
    id: a.id,
    title: hook.title,
    subtitle: a.machineTraced ? "Dry run captured from a real execution" : "Walk-through (the AI worked the steps out by hand)",
    kind: "array-scan",
    durationHint: `~${mins} min`,
    steps,
    practiceIds: [],
  };
}

/** School lesson: title, the idea, one card per worked moment, then the answer. No code on the board. */
export function buildLessonScript(a: {
  id: string;
  hook: Hook;
  explain: Explain;
  moments: string[];
  en: Narration | null;
  hing: Narration | null;
}): TeacherShowScript {
  const { hook, explain, moments, en, hing } = a;
  const steps: ShowStep[] = [];

  const add = (step: Omit<ShowStep, "say" | "sayEn">, say: { en: string; hing?: string }) => {
    const text = say.en || say.hing || "";
    if (!text) return;
    steps.push({ ...step, sayEn: say.en || say.hing || "", say: pick(say.hing, say.en) });
  };

  const clip = (s: string, n: number) => s.replace(/\s+/g, " ").trim().slice(0, n);

  add(
    { chapter: "Hook", scene: "ask", board: hook.title, gesture: "explain" },
    { en: pick(en?.hook, hook.restated, explain.summary), hing: hing?.hook },
  );

  if (explain.brute) {
    add(
      { chapter: "A common mix-up", scene: "reject", board: clip(explain.brute.idea, 90), gesture: "think" },
      { en: pick(en?.brute, explain.brute.idea), hing: hing?.brute },
    );
  }

  add(
    { chapter: "The idea", scene: "trick", board: explain.approach.name, gesture: "write" },
    { en: pick(en?.idea, explain.approach.why, explain.analogy, explain.intuition[0]), hing: hing?.idea },
  );

  moments.forEach((moment, i) => {
    const line = clip(moment, 220);
    const enLine = pick(en?.events[i], line);
    const hingLine = pick(hing?.events[i], en?.events[i] ? "" : line);
    steps.push({
      chapter: `Step ${i + 1}`,
      scene: "walk",
      board: clip(line, 90),
      gesture: "explain",
      say: pick(hingLine, enLine),
      sayEn: enLine,
    });
  });

  const answer = pick(explain.keyPoints?.[0], explain.summary, hook.restated);
  add(
    { chapter: "Answer", scene: "win", board: clip(answer, 48) || "Answer", gesture: "celebrate" },
    { en: pick(en?.result, answer), hing: hing?.result },
  );

  const cost = [explain.approach.time, explain.approach.space].filter((s) => s && s !== "—" && s !== "-");
  if (cost.length && (en?.complexity || explain.approach.why)) {
    add(
      { chapter: "The rule", scene: "cost", board: clip(cost.join("  ·  "), 48), gesture: "explain" },
      { en: pick(en?.complexity, explain.approach.why), hing: hing?.complexity },
    );
  }

  const pit = pick(en?.pitfall, explain.pitfalls[0]);
  if (pit) {
    add(
      { chapter: "Watch out", scene: "warn", board: clip(pit, 90), gesture: "point" },
      { en: pit, hing: hing?.pitfall },
    );
  }

  const mins = Math.max(1, Math.round((steps.length * 6) / 60));
  return {
    id: a.id,
    title: hook.title,
    subtitle: "School lesson, walked with one real example",
    kind: "array-scan",
    durationHint: `~${mins} min`,
    steps,
    practiceIds: [],
  };
}
