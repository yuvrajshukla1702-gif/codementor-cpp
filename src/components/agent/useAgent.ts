"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TeacherShowScript } from "@/lib/teacher-shows";
import type { AgentAnswer, AgentEvent, CodeBundle, Dry, Explain, Hook, LangPack, Stage, TestRow, Verify, Viz } from "@/lib/agent/types";

export type Mark = "hook" | "explain" | "code" | "verify" | "dry" | "video";

export type Run = {
  id: string;
  question: string;
  demo: boolean;
  startedAt: number;
  running: boolean;
  stage: Stage | "idle";
  stageMsg: string;
  /** Milliseconds from the start at which each part first appeared. */
  marks: Partial<Record<Mark, number>>;
  hook?: Hook;
  provider?: string;
  explain?: Explain;
  code?: CodeBundle;
  langs?: LangPack;
  tests?: TestRow[];
  viz?: Viz;
  verify?: Verify;
  dry?: Dry;
  video?: TeacherShowScript;
  machineTraced?: boolean;
  narrated?: boolean;
  ms?: number;
  error?: { code: string; message: string };
  stopped?: boolean;
};

const HISTORY_KEY = "cm-agent-history-v1";
const HISTORY_MAX = 8;

function loadHistory(): AgentAnswer[] {
  try {
    const raw = JSON.parse(window.localStorage.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(raw) ? (raw as AgentAnswer[]).filter((a) => a && a.id && a.hook) : [];
  } catch {
    return [];
  }
}

function saveHistory(list: AgentAnswer[]) {
  for (let keep = Math.min(list.length, HISTORY_MAX); keep >= 0; keep--) {
    try {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, keep)));
      return;
    } catch {
      /* quota: retry with fewer entries */
    }
  }
}

function mark(run: Run, key: Mark, now: number): Run["marks"] {
  return run.marks[key] === undefined ? { ...run.marks, [key]: now - run.startedAt } : run.marks;
}

function apply(run: Run, ev: AgentEvent, now: number): Run {
  switch (ev.t) {
    case "status":
      return { ...run, stage: ev.stage, stageMsg: ev.msg };
    case "hook":
      return { ...run, hook: ev.data, provider: ev.provider, marks: mark(run, "hook", now) };
    case "explain":
      return { ...run, explain: ev.data, marks: mark(run, "explain", now) };
    case "code":
      return { ...run, code: ev.data, tests: ev.tests, viz: ev.viz, marks: mark(run, "code", now) };
    case "langs":
      return { ...run, langs: ev.data };
    case "verify":
      return { ...run, verify: ev.data, tests: ev.tests, marks: mark(run, "verify", now) };
    case "dry":
      return { ...run, dry: ev.data, marks: mark(run, "dry", now) };
    case "video":
      return { ...run, video: ev.data, machineTraced: ev.machineTraced, narrated: ev.narrated, marks: mark(run, "video", now) };
    case "done":
      return { ...run, running: false, ms: ev.ms, stage: "done" };
    case "error":
      return { ...run, running: false, error: { code: ev.code, message: ev.message } };
  }
}

export function toAnswer(run: Run): AgentAnswer | null {
  if (!run.hook || !run.explain || run.error) return null;
  return {
    id: run.id,
    question: run.question,
    at: Date.now(),
    lang: "hinglish",
    provider: run.provider ?? "",
    hook: run.hook,
    explain: run.explain,
    code: run.code,
    langs: run.langs,
    tests: run.tests,
    viz: run.viz,
    verify: run.verify,
    dry: run.dry,
    video: run.video,
    machineTraced: run.machineTraced,
    narrated: run.narrated,
    ms: run.ms,
  };
}

function fromAnswer(a: AgentAnswer): Run {
  return {
    id: a.id,
    question: a.question,
    demo: /demo/i.test(a.provider),
    startedAt: Date.now(),
    running: false,
    stage: "done",
    stageMsg: "",
    marks: {},
    hook: a.hook,
    provider: a.provider,
    explain: a.explain,
    code: a.code,
    langs: a.langs,
    tests: a.tests,
    viz: a.viz,
    verify: a.verify,
    dry: a.dry,
    video: a.video,
    machineTraced: a.machineTraced,
    narrated: a.narrated,
    ms: a.ms,
  };
}

export function useAgent() {
  const [run, setRun] = useState<Run | null>(null);
  const [history, setHistory] = useState<AgentAnswer[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const historyRef = useRef<AgentAnswer[]>([]);

  useEffect(() => {
    const h = loadHistory();
    historyRef.current = h;
    setHistory(h);
    return () => abortRef.current?.abort();
  }, []);

  const commit = useCallback((next: AgentAnswer[]) => {
    historyRef.current = next;
    setHistory(next);
    saveHistory(next);
  }, []);

  const ask = useCallback(
    async (input: { question?: string; demo?: string; label?: string }) => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      const startedAt = performance.now();
      let cur: Run = {
        id: `a${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
        question: input.question?.trim() || input.label || "",
        demo: !!input.demo,
        startedAt,
        running: true,
        stage: "hook",
        stageMsg: "Sending your question",
        marks: {},
      };
      setRun(cur);
      const push = (ev: AgentEvent) => {
        cur = apply(cur, ev, performance.now());
        setRun(cur);
      };

      try {
        const res = await fetch("/api/agent/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input.demo ? { demo: input.demo } : { question: input.question }),
          signal: ac.signal,
        });
        if (!res.ok || !res.body) {
          const j = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
          push({ t: "error", code: (j.code as never) || "internal", message: j.error || `The server answered ${res.status}.` });
          return;
        }
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          let nl: number;
          while ((nl = buf.indexOf("\n")) >= 0) {
            const line = buf.slice(0, nl).trim();
            buf = buf.slice(nl + 1);
            if (!line) continue;
            try {
              push(JSON.parse(line) as AgentEvent);
            } catch {
              /* ignore a torn line */
            }
          }
        }
        if (cur.running) {
          push({ t: "error", code: "network", message: "The connection dropped before the answer was finished. Try again." });
        }
      } catch (err) {
        if (ac.signal.aborted) {
          cur = { ...cur, running: false, stopped: true };
          setRun(cur);
          return;
        }
        push({ t: "error", code: "network", message: err instanceof Error ? err.message : "Could not reach the server." });
      } finally {
        if (abortRef.current === ac) abortRef.current = null;
        const answer = toAnswer(cur);
        if (answer && !cur.running && !cur.stopped) {
          // Asking the same thing again replaces the old copy instead of piling up duplicates.
          commit([answer, ...historyRef.current.filter((h) => h.id !== answer.id && h.question.trim() !== answer.question.trim())].slice(0, HISTORY_MAX));
        }
      }
    },
    [commit],
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const open = useCallback((a: AgentAnswer) => {
    abortRef.current?.abort();
    setRun(fromAnswer(a));
  }, []);

  const remove = useCallback(
    (id: string) => {
      commit(historyRef.current.filter((h) => h.id !== id));
      setRun((r) => (r && r.id === id && !r.running ? null : r));
    },
    [commit],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setRun(null);
  }, []);

  /** Remember pseudocode and the C / Python / Java versions for an answer already on screen. */
  const saveLangs = useCallback(
    (id: string, langs: LangPack) => {
      setRun((r) => (r && r.id === id ? { ...r, langs } : r));
      const idx = historyRef.current.findIndex((h) => h.id === id);
      if (idx >= 0) {
        const next = historyRef.current.slice();
        next[idx] = { ...next[idx], langs };
        commit(next);
      }
    },
    [commit],
  );

  /** Swap in a script that now has Hindi lines, and remember it. */
  const updateVideo = useCallback(
    (id: string, video: TeacherShowScript) => {
      setRun((r) => (r && r.id === id ? { ...r, video } : r));
      const idx = historyRef.current.findIndex((h) => h.id === id);
      if (idx >= 0) {
        const next = historyRef.current.slice();
        next[idx] = { ...next[idx], video };
        commit(next);
      }
    },
    [commit],
  );

  return { run, history, ask, stop, open, remove, reset, updateVideo, saveLangs };
}
