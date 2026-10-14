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
    { chapter: "Hook", board: hook.title, gesture: "explain", ...stageOf(first), stats: hook.topics.length ? { topics: hook.topics.join(" · ") } : undefined },
    { en: pick(en?.hook, hook.restated), hing: hing?.hook },
  );

  if (explain.brute) {
    add(
      { chapter: "Brute force", board: `Brute force · ${explain.brute.time}`, gesture: "think", ...stageOf(first), stats: { brute: explain.brute.idea.slice(0, 70), time: explain.brute.time } },
      { en: pick(en?.brute, `The simple way: ${explain.brute.idea} It takes ${explain.brute.time}.`), hing: hing?.brute },
    );
  }

  add(
    { chapter: "The idea", board: explain.approach.name, gesture: "write", ...stageOf(first), stats: { time: explain.approach.time, space: explain.approach.space } },
    { en: pick(en?.idea, explain.approach.why, explain.intuition[0]), hing: hing?.idea },
  );

  frames.forEach((f, i) => {
    const enLine = pick(en?.events[i], mechanicalLine(f, i, "english"));
    const hingLine = pick(hing?.events[i], en?.events[i] ? "" : mechanicalLine(f, i, "hinglish"));
    steps.push({
      ...f.step,
      chapter: `Step ${i + 1}`,
      say: pick(hingLine, enLine),
      sayEn: enLine,
    });
  });

  add(
    { chapter: "Result", board: "The answer", gesture: "celebrate", ...stageOf(last, true), stats: { output: a.output.trim().slice(0, 40) || "—" } },
    { en: pick(en?.result, `For this input the program prints ${a.output.trim().slice(0, 60)}.`), hing: hing?.result },
  );

  add(
    { chapter: "Complexity", board: `Time ${explain.approach.time} · Space ${explain.approach.space}`, gesture: "explain", stats: { time: explain.approach.time, space: explain.approach.space } },
    { en: pick(en?.complexity, `Time is ${explain.approach.time} and space is ${explain.approach.space}.`), hing: hing?.complexity },
  );

  const pit = pick(en?.pitfall, explain.pitfalls[0]);
  if (pit) {
    add(
      { chapter: "Watch out", board: "Common mistake", gesture: "point", stats: { watch_out: pit.slice(0, 80) } },
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
