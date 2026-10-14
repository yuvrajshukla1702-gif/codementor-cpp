import type { ShowStep } from "../teacher-shows";
import type { DryRow, Viz } from "./types";

/** One snapshot printed by TR(...) in the instrumented program (or simulated by the model as a fallback). */
export type RawEvent = { n: number; l: number; t: string; v: Record<string, unknown> };

export type Frame = {
  n: number;
  note: string;
  code: string;
  vars: Array<{ k: string; v: string }>;
  step: Omit<ShowStep, "say">;
};

/* --------------------------------- parsing --------------------------------- */

export function parseTrace(stderr: string): { events: RawEvent[]; capped: boolean } {
  const events: RawEvent[] = [];
  for (const line of stderr.split(/\r?\n/)) {
    if (!line.startsWith("@@TRACE ")) continue;
    try {
      const j = JSON.parse(line.slice(8)) as RawEvent;
      if (j && typeof j.n === "number" && j.v && typeof j.v === "object") {
        events.push({ n: j.n, l: Number(j.l) || 0, t: String(j.t ?? ""), v: j.v });
      }
    } catch {
      /* a half-written line */
    }
  }
  return { events, capped: events.length >= 4000 };
}

/**
 * Deterministic subsample that keeps the story: the first and last snapshot, the first time each
 * distinct kind of step happens, then evenly spaced fill.
 */
export function sampleEvents(events: RawEvent[], max: number): RawEvent[] {
  if (events.length <= max) return events;
  const chosen = new Set<number>([0, events.length - 1]);
  const seenLabel = new Set<string>();
  for (let i = 0; i < events.length && chosen.size < Math.ceil(max * 0.6); i++) {
    const key = events[i].t;
    if (!seenLabel.has(key)) {
      seenLabel.add(key);
      chosen.add(i);
    }
  }
  const rest = events.map((_, i) => i).filter((i) => !chosen.has(i));
  const need = Math.max(0, max - chosen.size);
  for (let k = 0; k < need && rest.length; k++) {
    chosen.add(rest[Math.floor(((k + 0.5) * rest.length) / need)]);
  }
  return [...chosen].sort((a, b) => a - b).slice(0, max).map((i) => events[i]);
}

/* --------------------------------- values --------------------------------- */

type Cell = string | number;

const isPrim = (x: unknown): x is string | number | boolean => ["string", "number", "boolean"].includes(typeof x);

function lookup(v: Record<string, unknown>, name: string): unknown {
  if (name in v) return v[name];
  const squash = name.replace(/\s+/g, "");
  for (const k of Object.keys(v)) if (k.replace(/\s+/g, "") === squash) return v[k];
  return undefined;
}

function cellOf(x: unknown): Cell {
  if (typeof x === "number") return x;
  if (typeof x === "boolean") return x ? "true" : "false";
  return String(x);
}

function asCells(x: unknown): Cell[] | null {
  if (typeof x === "string") {
    const chars = Array.from(x);
    return chars.length ? chars : null;
  }
  if (Array.isArray(x) && x.length && x.every(isPrim)) return x.map(cellOf);
  return null;
}

function as2D(x: unknown): Cell[][] | null {
  if (!Array.isArray(x) || !x.length) return null;
  if (!x.every((r) => Array.isArray(r) && r.length && (r as unknown[]).every(isPrim))) return null;
  return (x as unknown[][]).map((r) => r.map(cellOf));
}

/** Keep tables small enough to read on a 16:9 board. */
function clampGrid(g: Cell[][]): Cell[][] {
  return g.slice(0, 10).map((r) => r.slice(0, 12));
}

function asPairs(x: unknown): Array<[string, string]> | null {
  if (!Array.isArray(x)) return null;
  if (!x.every((p) => Array.isArray(p) && p.length === 2 && isPrim(p[0]))) return null;
  const pairs = (x as unknown[][]).map((p): [string, string] => [String(p[0]), compact(p[1])]);
  // unordered containers iterate in arbitrary order; a stable order keeps the board calm between steps
  const num = pairs.every(([k]) => k !== "" && !Number.isNaN(Number(k)));
  return pairs.sort((a, b) => (num ? Number(a[0]) - Number(b[0]) : a[0].localeCompare(b[0])));
}

function asList(x: unknown): Cell[] | null {
  if (!Array.isArray(x)) return null;
  return x.map((e) => (isPrim(e) ? cellOf(e) : compact(e)));
}

/** Short human-readable value for tables and stat chips. */
export function compact(x: unknown, limit = 70): string {
  let out: string;
  if (typeof x === "string") out = x.length === 1 ? `'${x}'` : `"${x}"`;
  else if (typeof x === "number" || typeof x === "boolean") out = String(x);
  else if (Array.isArray(x)) out = `[${x.map((e) => compact(e, 24)).join(", ")}]`;
  else if (x === null || x === undefined) out = "—";
  else out = JSON.stringify(x);
  return out.length > limit ? `${out.slice(0, limit - 1)}…` : out;
}

function changedIdx(prev: unknown, cur: Cell[] | null): number[] {
  if (!cur) return [];
  const before = Array.isArray(prev) ? prev.map((e) => (isPrim(e) ? cellOf(e) : compact(e))) : typeof prev === "string" ? Array.from(prev) : [];
  const out: number[] = [];
  cur.forEach((c, i) => {
    if (before[i] === undefined || String(before[i]) !== String(c)) out.push(i);
  });
  return out.length === cur.length && cur.length > 4 ? [] : out;
}

/* ---------------------------------- auto viz ---------------------------------- */

const POINTER_NAME = /^(i|j|k|l|r|lo|hi|low|high|left|right|mid|idx|index|p|q|pos|ptr|cur|slow|fast|start|end|s|e|row|col|x|y)\d?$/i;

/** Pick sensible board elements when the model did not (or named variables that never appeared). */
export function autoViz(events: RawEvent[]): Viz {
  const viz: Viz = { array: null, pointers: [], window: null, table: null, map: null, lists: [], show: [] };
  const firstSeen = new Map<string, unknown>();
  for (const e of events) for (const [k, v] of Object.entries(e.v)) if (!firstSeen.has(k)) firstSeen.set(k, v);
  let bestLen = -1;
  const arrays: string[] = [];
  for (const [k, v] of firstSeen) {
    if (/[().]/.test(k)) {
      if (isPrim(v) && viz.show.length < 3) viz.show.push(k);
      continue;
    }
    const cells = asCells(v);
    if (as2D(v)) {
      if (!viz.table) viz.table = k;
    } else if (cells && cells.length >= 2) {
      arrays.push(k);
      const len = cells.length;
      if (len > bestLen && len <= 40) {
        bestLen = len;
        viz.array = k;
      }
    } else if (Array.isArray(v)) {
      arrays.push(k);
    } else if (typeof v === "number" && Number.isInteger(v) && POINTER_NAME.test(k)) {
      viz.pointers.push(k);
    } else if (isPrim(v) && viz.show.length < 4) {
      viz.show.push(k);
    }
  }
  viz.lists = arrays.filter((k) => k !== viz.array).slice(0, 2);
  viz.pointers = viz.pointers.slice(0, 3);
  return viz;
}

/** Keep only the model's viz names that really show up in the trace; fall back to autoViz if nothing is left. */
export function resolveViz(want: Viz | undefined, events: RawEvent[]): Viz {
  const exists = (name: string | null) => !!name && events.some((e) => lookup(e.v, name) !== undefined);
  const auto = autoViz(events);
  if (!want) return auto;
  const got: Viz = {
    array: exists(want.array) ? want.array : null,
    pointers: want.pointers.filter(exists),
    window: want.window && exists(want.window[0]) && exists(want.window[1]) ? want.window : null,
    table: exists(want.table) ? want.table : null,
    map: exists(want.map) ? want.map : null,
    lists: want.lists.filter(exists),
    show: want.show.filter(exists),
  };
  const anyData = got.array || got.table || got.map || got.lists.length || got.show.length;
  if (!anyData) return auto;
  if (!got.array && !got.table) {
    got.array = auto.array && !got.lists.includes(auto.array) && auto.array !== got.map ? auto.array : null;
  }
  if (!got.pointers.length && got.array) got.pointers = auto.pointers.slice(0, 2);
  return got;
}

/* ---------------------------------- frames ---------------------------------- */

const TR_LINE = /^[ \t]*TR[ \t]*\(.*\)[ \t]*;[ \t]*$/;

function codeBefore(lines: string[], line: number): string {
  for (let i = line - 2; i >= 0 && i > line - 9; i--) {
    const raw = lines[i] ?? "";
    const t = raw.trim();
    if (!t || /^[{}]+;?$/.test(t) || /^}\s*else\s*{?$/.test(t) || TR_LINE.test(raw) || t.startsWith("//")) continue;
    return t.length > 96 ? `${t.slice(0, 95)}…` : t;
  }
  return "";
}

export function buildFrames(all: RawEvent[], picked: RawEvent[], viz: Viz, lines: string[]): Frame[] {
  const at = new Map<number, number>();
  all.forEach((e, i) => at.set(e.n, i));

  // The data being scanned (array / string) is usually printed only at a few TR points: carry it forward.
  const carried: unknown[] = [];
  let last: unknown;
  for (const e of all) {
    const got = viz.array ? lookup(e.v, viz.array) : undefined;
    if (got !== undefined) last = got;
    carried.push(last);
  }

  return picked.map((e): Frame => {
    const i = at.get(e.n) ?? 0;
    const prev = i > 0 ? all[i - 1] : undefined;
    const cur = (name: string | null) => (name ? lookup(e.v, name) : undefined);
    const before = (name: string | null) => (name && prev ? lookup(prev.v, name) : undefined);

    const step: Omit<ShowStep, "say"> = { board: e.t || `Step ${e.n}`, chapter: `Step ${picked.indexOf(e) + 1}` };
    const stats: Record<string, string | number> = {};

    const arrVal = carried[i];
    const grid = viz.array ? as2D(arrVal) : null;
    const cells = grid ? null : asCells(arrVal);
    if (cells) step.cells = cells.every((c) => typeof c === "number") ? (cells as number[]) : cells.map(String);
    if (grid) step.grid = clampGrid(grid);

    // pointers
    const pointers: Record<string, number> = {};
    const gridPtr: number[] = [];
    for (const p of viz.pointers) {
      const val = cur(p);
      if (typeof val !== "number" || !Number.isInteger(val)) continue;
      if (grid) gridPtr.push(val);
      else if (cells && val >= 0 && val < cells.length) pointers[p] = val;
      else stats[p] = val;
    }
    if (Object.keys(pointers).length) step.pointers = pointers;
    if (grid && gridPtr.length >= 2 && gridPtr[0] >= 0 && gridPtr[0] < grid.length && gridPtr[1] >= 0 && gridPtr[1] < (grid[gridPtr[0]]?.length ?? 0)) {
      step.gridHi = [gridPtr[0], gridPtr[1]];
    }

    // window
    if (viz.window && cells) {
      const l = cur(viz.window[0]);
      const r = cur(viz.window[1]);
      if (typeof l === "number" && typeof r === "number" && l <= r) {
        step.window = [Math.max(0, l), Math.min(cells.length - 1, r)];
      } else if (typeof l === "number" && typeof r === "number") {
        stats[viz.window[0]] = l;
        stats[viz.window[1]] = r;
      }
    }

    // highlighted cells
    if (cells) {
      if (step.window) step.hi = [step.window[1]];
      else if (step.pointers) step.hi = [Object.values(step.pointers)[0]];
      else step.hi = changedIdx(before(viz.array), cells).slice(0, 3);
      if (!step.hi.length) delete step.hi;
    }

    // map / dictionary
    if (viz.map) {
      const raw = cur(viz.map);
      const pairs = asPairs(raw);
      if (pairs) {
        step.map = Object.fromEntries(pairs.slice(0, 14));
        step.mapTitle = viz.map;
        step.mapPlain = true;
      } else if (Array.isArray(raw)) {
        step.lists = { ...(step.lists ?? {}), [viz.map]: asList(raw)?.slice(0, 18) ?? [] };
      }
    }

    // named lists: stacks, queues, result vectors
    const lists: Record<string, Cell[]> = { ...(step.lists ?? {}) };
    const listHi: Record<string, number[]> = {};
    for (const name of [...viz.lists, ...(viz.table && !grid ? [viz.table] : [])]) {
      const raw = cur(name);
      const t2 = as2D(raw);
      if (t2 && !step.grid && name === viz.table) {
        step.grid = clampGrid(t2);
        continue;
      }
      const items = asList(raw);
      if (!items) continue;
      lists[name] = items.slice(0, 22);
      const ch = changedIdx(before(name), items).filter((x) => x < 22);
      if (ch.length) listHi[name] = ch.slice(0, 3);
    }
    if (Object.keys(lists).length) step.lists = lists;
    if (Object.keys(listHi).length) step.listHi = listHi;

    // scalar stats
    for (const name of viz.show) {
      const v = cur(name);
      if (v !== undefined) stats[name] = compact(v, 40);
    }
    if (!step.cells && !step.grid && !step.lists && !step.map && !Object.keys(stats).length) {
      for (const [k, v] of Object.entries(e.v).slice(0, 4)) stats[k] = compact(v, 40);
    }
    if (Object.keys(stats).length) step.stats = stats;

    const code = e.l > 0 ? codeBefore(lines, e.l) : "";
    if (code) step.codeLine = code;

    const note = e.t || `Step ${e.n}`;
    const isLast = picked.indexOf(e) === picked.length - 1;
    step.gesture =
      isLast || /\b(finished|complete|completed|answer|result|returns?|done|final)\b/i.test(note)
        ? "celebrate"
        : /\b(push|insert|store|write|set|add|update|assign|fill|record|append|take|move|extend)\b/i.test(note)
          ? "write"
          : /\b(compare|check|ask|wait|why|invalid|mismatch|empty)\b/i.test(note)
            ? "think"
            : "point";

    return {
      n: e.n,
      note,
      code,
      vars: Object.entries(e.v).map(([k, v]) => ({ k, v: compact(v) })),
      step,
    };
  });
}

export function dryRows(frames: Frame[]): DryRow[] {
  return frames.map((f, i) => ({ n: i + 1, note: f.note, code: f.code, vars: f.vars.slice(0, 8) }));
}

/* ------------------------------ plain-text helpers ------------------------------ */

/** What the narrator sees for each snapshot: real values only. */
export function framesForPrompt(frames: Frame[]): Array<{ i: number; note: string; code: string; state: string }> {
  return frames.map((f, i) => ({
    i,
    note: f.note,
    code: f.code,
    state: f.vars
      .slice(0, 7)
      .map((x) => `${x.k}=${x.v}`)
      .join("; ")
      .slice(0, 230),
  }));
}

/** Last-resort narration when the model is unavailable: stays truthful, just plain. */
export function mechanicalLine(f: Frame, index: number, lang: "english" | "hinglish"): string {
  const bits = f.vars
    .filter((x) => /^(['"]?[A-Za-z0-9 _.-]{1,14}['"]?|-?\d+(\.\d+)?|true|false)$/.test(x.v) && /^[A-Za-z_][A-Za-z0-9_]*$/.test(x.k))
    .slice(0, 3)
    .map((x) => `${x.k} ${lang === "english" ? "is" : "hai"} ${x.v.replace(/['"]/g, "")}`);
  const head = lang === "english" ? `Step ${index + 1}.` : `Step ${index + 1}.`;
  return `${head} ${f.note}.${bits.length ? ` ${bits.join(", ")}.` : ""}`;
}
