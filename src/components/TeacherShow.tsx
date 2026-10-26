"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { KaraokeLine, TeacherPresence } from "@/components/course/TeacherPresence";
import { Icon } from "@/components/ui/icons";
import type { TeacherShowScript } from "@/lib/teacher-shows";
import { estimateSecs, fetchSpeechCached, prefetchSpeech, type VoiceLang } from "@/lib/speech-cache";

function lineOf(step: TeacherShowScript["steps"][number], lang: VoiceLang) {
  if (lang === "english") return step.sayEn || step.say;
  if (lang === "hindi") return step.sayHi || step.sayEn || step.say;
  return step.say;
}

function captionOf(step: TeacherShowScript["steps"][number], lang: VoiceLang) {
  if (lang === "english") return step.say && step.say !== lineOf(step, lang) ? step.say : "";
  return step.sayEn && step.sayEn !== lineOf(step, lang) ? step.sayEn : "";
}

function fmt(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

const VOICES: { id: VoiceLang; label: string }[] = [
  { id: "english", label: "English" },
  { id: "hinglish", label: "Hinglish" },
  { id: "hindi", label: "हिंदी" },
];

const SILENT_WAV = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

async function fetchSpeech(text: string, lang: VoiceLang, speed: number, signal?: AbortSignal, priority = false) {
  return fetchSpeechCached(text, lang, speed, signal, priority);
}

function pickBrowserVoice(lang: VoiceLang) {
  const synth = window.speechSynthesis;
  if (!synth) return null;
  const voices = synth.getVoices();
  const want = lang === "hindi" ? "hi" : "en";
  return (
    voices.find((v) => v.lang.toLowerCase().startsWith(want) && /india|hindi|english/i.test(`${v.lang} ${v.name}`)) ||
    voices.find((v) => v.lang.toLowerCase().startsWith(want)) ||
    null
  );
}

/** Used when the recorded voice is slow or missing. The play click already unlocked speech. */
function speakWithBrowser(text: string, lang: VoiceLang): Promise<boolean> {
  const synth = window.speechSynthesis;
  if (!synth || !text.trim()) return Promise.resolve(false);
  return new Promise((resolve) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang === "hindi" ? "hi-IN" : "en-IN";
    utter.rate = lang === "english" ? 1 : 0.96;
    utter.voice = pickBrowserVoice(lang);
    let done = false;
    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      resolve(ok);
    };
    utter.onend = () => finish(true);
    utter.onerror = () => finish(false);
    window.setTimeout(() => finish(false), Math.min(20000, 1200 + text.length * 70));
    synth.cancel();
    synth.speak(utter);
  });
}

export function TeacherShow({
  script,
  compact = false,
  hidePractice = false,
  onLangChange,
}: {
  script: TeacherShowScript;
  compact?: boolean;
  hidePractice?: boolean;
  /** Fires with the saved voice language on mount and whenever the viewer changes it. */
  onLangChange?: (lang: VoiceLang) => void;
}) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [lang, setLang] = useState<VoiceLang>("hinglish");
  const [voiceOn, setVoiceOn] = useState(true);
  const [hover, setHover] = useState(false);
  const [loadingVoice, setLoadingVoice] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [tick, setTick] = useState(0);
  const [stepDurations, setStepDurations] = useState<number[]>(() =>
    script.steps.map((s) => estimateSecs(lineOf(s, "hinglish"), 1))
  );

  const rootRef = useRef<HTMLElement | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const [fit, setFit] = useState(1);
  const gen = useRef(0);
  const speakId = useRef(0);
  const iRef = useRef(0);
  const playRef = useRef(false);
  const speedRef = useRef(speed);
  const langRef = useRef(lang);
  const voiceRef = useRef(voiceOn);
  const scriptRef = useRef(script);
  const onLangRef = useRef(onLangChange);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const stepStartedAt = useRef(0);
  const chipsRef = useRef<HTMLDivElement | null>(null);
  const spokenLineRef = useRef("");

  speedRef.current = speed;
  langRef.current = lang;
  voiceRef.current = voiceOn;
  scriptRef.current = script;
  onLangRef.current = onLangChange;

  const step = script.steps[i] ?? script.steps[0];
  const cells = step?.cells ?? [];
  const spoken = step ? lineOf(step, lang) : "";
  const caption = step ? captionOf(step, lang) : "";
  const atEnd = i >= script.steps.length - 1 && !playing;

  const totalSecs = useMemo(
    () => stepDurations.reduce((a, b) => a + b, 0) || script.steps.length * 4,
    [stepDurations, script.steps.length]
  );
  const elapsedBefore = useMemo(
    () => stepDurations.slice(0, i).reduce((a, b) => a + b, 0),
    [stepDurations, i]
  );
  const currentStepDur = stepDurations[i] || 4;
  const localElapsed = playing ? Math.min(currentStepDur, tick) : 0;
  const nowSecs = elapsedBefore + localElapsed;
  const progress = (nowSecs / Math.max(0.1, totalSecs)) * 100;

  useEffect(() => {
    const saved = window.localStorage.getItem("cm-voice-lang");
    if (saved === "english" || saved === "hindi" || saved === "hinglish") {
      setLang(saved);
      langRef.current = saved;
    }
    onLangRef.current?.(langRef.current);
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "auto";
    }
    window.speechSynthesis?.cancel();

    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => {
      document.removeEventListener("fullscreenchange", onFs);
      playRef.current = false;
      gen.current += 1;
      speakId.current += 1;
      hardStop();
      window.speechSynthesis?.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the active chapter chip in view as the lesson advances.
  useEffect(() => {
    const box = chipsRef.current;
    const chip = box?.children[i] as HTMLElement | undefined;
    if (!box || !chip) return;
    const target = chip.offsetLeft - box.clientWidth / 2 + chip.clientWidth / 2;
    box.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [i]);

  // A busy board (a row of cells plus a stack, a map and a note) shrinks to fit the stage instead of spilling out of it.
  // Transform only, measured once per step, so it costs nothing while playing.
  useLayoutEffect(() => {
    const outer = boardRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    const measure = () => {
      const needW = Math.max(inner.scrollWidth, inner.offsetWidth);
      const needH = Math.max(inner.scrollHeight, inner.offsetHeight);
      const k = Math.min(1, outer.clientHeight / Math.max(1, needH), outer.clientWidth / Math.max(1, needW));
      const next = Math.max(0.5, Math.round(k * 100) / 100);
      setFit((p) => (p === next ? p : next));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(outer);
    return () => ro.disconnect();
  }, [i, fullscreen, script]);

  useEffect(() => {
    if (!playing) return;
    stepStartedAt.current = performance.now();
    const id = window.setInterval(() => {
      setTick((performance.now() - stepStartedAt.current) / 1000);
    }, 200);
    return () => window.clearInterval(id);
  }, [playing, i]);

  useEffect(() => {
    setStepDurations(script.steps.map((s) => estimateSecs(lineOf(s, lang), speed)));
    // Prefetch first beats immediately, then the rest so first play rarely waits.
    const lines = script.steps.map((s) => lineOf(s, lang));
    prefetchSpeech(lines.slice(0, 1), lang, speed);
    const t = window.setTimeout(() => prefetchSpeech(lines.slice(1, 2), lang, speed), 80);
    return () => window.clearTimeout(t);
  }, [script, lang, speed]);

  // Hindi lines for an Ask AI answer arrive a moment later. Replay the beat so the new words are what you hear.
  useEffect(() => {
    const frame = script.steps[iRef.current] ?? script.steps[0];
    const line = frame ? lineOf(frame, langRef.current) : "";
    if (spokenLineRef.current === line) return;
    const hadLine = spokenLineRef.current.length > 0;
    spokenLineRef.current = line;
    if (!hadLine || !playRef.current) return;
    const at = iRef.current;
    pause();
    iRef.current = at;
    setI(at);
    setTick(0);
    void playFrom(at);
    // pause/playFrom are stable enough for a line-text change; listing them retriggers playback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [script, lang]);

  function hardStop() {
    abortRef.current?.abort();
    abortRef.current = null;
    const audio = audioRef.current;
    if (audio) {
      try {
        audio.pause();
      } catch {
        /* ignore */
      }
    }
    window.speechSynthesis?.cancel();
    void fetch("/api/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stop: true }),
    }).catch(() => undefined);
  }

  function prefetch(index: number) {
    const frame = scriptRef.current.steps[index];
    if (!frame || !voiceRef.current) return;
    const text = lineOf(frame, langRef.current);
    void fetchSpeech(text, langRef.current, speedRef.current).catch(() => undefined);
  }

  function unlockAudio() {
    const audio = audioRef.current || new Audio();
    audioRef.current = audio;
    audio.src = SILENT_WAV;
    void audio.play().then(() => audio.pause()).catch(() => undefined);
    const synth = window.speechSynthesis;
    if (!synth) return;
    try {
      synth.resume();
      const warm = new SpeechSynthesisUtterance(" ");
      warm.volume = 0;
      synth.cancel();
      synth.speak(warm);
    } catch {
      /* the recorded voice is the one we want */
    }
  }

  async function say(text: string, token: number) {
    const mySpeak = ++speakId.current;
    hardStop();
    if (token !== gen.current || !playRef.current) return false;

    const ac = new AbortController();
    abortRef.current = ac;
    setLoadingVoice(true);

    try {
      const pending = fetchSpeech(text, langRef.current, speedRef.current, ac.signal, true);
      const raced = await Promise.race([
        pending.then((entry) => ({ entry, slow: false as const })),
        new Promise<{ entry: null; slow: true }>((resolve) => window.setTimeout(() => resolve({ entry: null, slow: true }), 3200)),
      ]);
      if (ac.signal.aborted || mySpeak !== speakId.current || token !== gen.current || !playRef.current) {
        setLoadingVoice(false);
        return false;
      }
      const entry = raced.slow ? null : raced.entry;
      if (!entry) {
        setLoadingVoice(false);
        const heard = await speakWithBrowser(text, langRef.current);
        return heard && mySpeak === speakId.current && token === gen.current && playRef.current;
      }

      setStepDurations((prev) => {
        const next = [...prev];
        next[iRef.current] = entry.duration / Math.max(0.5, speedRef.current);
        return next;
      });

      const audio = audioRef.current || new Audio();
      audioRef.current = audio;
      audio.pause();
      audio.src = entry.url;
      audio.playbackRate = 1;
      setLoadingVoice(false);
      stepStartedAt.current = performance.now();
      setTick(0);

      try {
        await audio.play();
      } catch {
        setLoadingVoice(false);
        const heard = await speakWithBrowser(text, langRef.current);
        return heard && mySpeak === speakId.current && token === gen.current && playRef.current;
      }

      if (mySpeak !== speakId.current || token !== gen.current || !playRef.current) {
        audio.pause();
        return false;
      }

      await new Promise<void>((resolve) => {
        const finish = () => {
          audio.removeEventListener("ended", finish);
          resolve();
        };
        if (audio.ended || audio.paused) {
          resolve();
          return;
        }
        audio.addEventListener("ended", finish);
      });

      return mySpeak === speakId.current && token === gen.current && playRef.current;
    } catch {
      setLoadingVoice(false);
      return false;
    }
  }

  async function playFrom(start: number) {
    hardStop();
    const token = ++gen.current;
    playRef.current = true;
    setPlaying(true);
    let cur = start;
    prefetch(cur);
    prefetch(cur + 1);

    while (token === gen.current && playRef.current) {
      iRef.current = cur;
      setI(cur);
      setTick(0);
      stepStartedAt.current = performance.now();
      const frame = scriptRef.current.steps[cur];
      if (!frame) break;
      prefetch(cur + 1);

      let finished = true;
      if (voiceRef.current) {
        finished = await say(lineOf(frame, langRef.current), token);
      } else {
        const wait = ((stepDurations[cur] || 3) * 1000) / Math.max(0.5, speedRef.current);
        await new Promise((r) => window.setTimeout(r, wait));
      }

      if (token !== gen.current || !playRef.current) return;
      if (!finished && voiceRef.current) {
        const wait = Math.min(6000, ((stepDurations[cur] || 3) * 1000) / Math.max(0.5, speedRef.current));
        await new Promise((r) => window.setTimeout(r, wait));
        if (token !== gen.current || !playRef.current) return;
      }

      if (cur >= scriptRef.current.steps.length - 1) {
        playRef.current = false;
        setPlaying(false);
        return;
      }
      await new Promise((r) => window.setTimeout(r, 40));
      if (token !== gen.current || !playRef.current) return;
      cur += 1;
    }
  }

  function play() {
    const last = script.steps.length - 1;
    const start = !playRef.current && iRef.current >= last ? 0 : iRef.current;
    void playFrom(start);
    // After playFrom's stop(), still inside the click, so the browser allows later speech.
    unlockAudio();
  }

  function pause() {
    playRef.current = false;
    gen.current += 1;
    speakId.current += 1;
    setPlaying(false);
    setLoadingVoice(false);
    hardStop();
  }

  function toggle() {
    if (playRef.current) pause();
    else play();
  }

  function chooseLang(next: VoiceLang) {
    if (next === langRef.current) return;
    setLang(next);
    langRef.current = next;
    window.localStorage.setItem("cm-voice-lang", next);
    onLangRef.current?.(next);
    const frame = scriptRef.current.steps[iRef.current];
    spokenLineRef.current = frame ? lineOf(frame, next) : "";
    if (!playRef.current) return;
    const at = iRef.current;
    pause();
    iRef.current = at;
    setI(at);
    setTick(0);
    void playFrom(at);
    unlockAudio();
  }

  function jump(next: number) {
    const clamped = Math.min(script.steps.length - 1, Math.max(0, next));
    const wasPlaying = playRef.current;
    pause();
    iRef.current = clamped;
    setI(clamped);
    setTick(0);
    if (wasPlaying) void playFrom(clamped);
  }

  function seekByTime(ratio: number) {
    const target = ratio * totalSecs;
    let idx = 0;
    let acc = 0;
    for (let s = 0; s < stepDurations.length; s++) {
      const d = stepDurations[s] || 3;
      if (acc + d >= target) {
        idx = s;
        break;
      }
      acc += d;
      idx = s;
    }
    jump(idx);
  }

  async function toggleFullscreen() {
    const el = rootRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await el.requestFullscreen();
    } catch {
      /* browser blocked */
    }
  }

  // YouTube-style: the bar fades while the lesson plays, and comes back on hover or pause.
  const showChrome = hover || !playing;
  const needValue = step?.stats && "need" in step.stats ? String(step.stats.need) : null;
  const stepProgress = Math.min(1, Math.max(0, tick / Math.max(0.4, stepDurations[i] || 3)));
  const chapterLabels = useMemo(() => {
    const names = script.steps.map((s, idx) => s.chapter || `Beat ${idx + 1}`);
    const totals = new Map<string, number>();
    for (const name of names) totals.set(name, (totals.get(name) || 0) + 1);
    const seen = new Map<string, number>();
    return names.map((name) => {
      if ((totals.get(name) || 0) < 2) return name;
      const n = (seen.get(name) || 0) + 1;
      seen.set(name, n);
      return `${name} ${n}`;
    });
  }, [script]);
  const spanLabel = script.kind === "sliding-window" ? "window" : "range";
  const chapter = chapterLabels[i] || step?.chapter || `Beat ${i + 1}`;
  const boardTitle = step?.board || script.subtitle;
  const gesture = step?.gesture || (playing ? "explain" : "think");
  const focusIdx = step?.hi?.[0] ?? Object.values(step?.pointers || {})[0] ?? -1;

  return (
    <section
      ref={rootRef}
      data-player="yt"
      className={`overflow-hidden bg-black ${
        fullscreen ? "rounded-none" : "rounded-xl"
      } ${compact ? "text-[13px]" : ""}`}
    >
      <div
        className="group relative"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <button
          type="button"
          onClick={toggle}
          className={`relative block w-full overflow-hidden bg-[#0f0f0f] text-left ${
            fullscreen ? "h-screen" : compact ? "aspect-[16/10]" : "aspect-video"
          }`}
        >

          <div
            className={`pointer-events-none absolute left-3 right-3 top-3 z-10 transition-opacity duration-200 ${
              showChrome ? "opacity-100" : "opacity-0"
            }`}
          >
            <p className="text-[12px] font-medium text-white/90 drop-shadow">{chapter}</p>
          </div>

          <div
            className={`absolute inset-0 grid grid-cols-[72px_minmax(0,1fr)] gap-2 px-3 pt-10 sm:grid-cols-[110px_minmax(0,1fr)] sm:gap-4 sm:px-5 sm:pt-12 ${
              fullscreen ? "pb-28 sm:pb-32" : "pb-24"
            }`}
          >
            <div className="flex items-end justify-center pb-2 sm:items-center sm:pb-0">
              <TeacherPresence speaking={playing && voiceOn && !loadingVoice} gesture={gesture} compact={!fullscreen && compact} />
            </div>

            <div key={i} ref={boardRef} className="cm-chalk relative flex min-h-0 items-center justify-center">
             <div
              ref={innerRef}
              className="flex w-full flex-col items-center"
              style={fit < 1 ? { transform: `scale(${fit})` } : undefined}
             >
              <div
                className={`w-full max-w-3xl rounded-lg border border-white/10 bg-[#0c1219]/90 px-3 shadow-inner sm:px-4 ${
                  compact ? "mb-2 py-1.5" : "mb-3 py-2 sm:py-3"
                }`}
              >
                <p className="mb-0.5 text-[10px] uppercase tracking-[0.14em] text-white/40">Chalkboard</p>
                <p className="font-display text-base text-[var(--accent)] sm:text-lg">{boardTitle}</p>
              </div>

              {needValue && (
                <div className="cm-pulse mb-3 rounded-full border border-[#ffd166]/50 bg-[#ffd166]/15 px-3 py-1 text-xs font-semibold text-[#ffe3a3]">
                  Looking for {needValue}
                </div>
              )}

              {cells.length > 0 && (
                <div className={`relative w-full max-w-3xl ${step.window ? "pt-6" : ""} ${compact ? "mb-2" : "mb-4"}`}>
                  {step.window && (
                    <svg
                      className="pointer-events-none absolute inset-x-0 top-0 h-5 w-full text-[#7cc4ff]/80"
                      viewBox="0 0 100 12"
                      preserveAspectRatio="none"
                      aria-hidden
                    >
                      <path
                        d={`M ${8 + (step.window[0] / Math.max(1, cells.length - 1)) * 84} 10
                            L ${8 + (step.window[0] / Math.max(1, cells.length - 1)) * 84} 2
                            L ${8 + (step.window[1] / Math.max(1, cells.length - 1)) * 84} 2
                            L ${8 + (step.window[1] / Math.max(1, cells.length - 1)) * 84} 10`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <text
                        x={8 + ((step.window[0] + step.window[1]) / 2 / Math.max(1, cells.length - 1)) * 84}
                        y="5"
                        textAnchor="middle"
                        className="fill-[#7cc4ff]"
                        style={{ fontSize: 3.2 }}
                      >
                        {spanLabel}
                      </text>
                    </svg>
                  )}
                  <div className={`relative flex justify-center rounded-2xl border border-white/10 bg-black/30 px-3 py-3 sm:px-4 ${cells.length > 14 ? "flex-wrap" : "flex-nowrap"} ${cells.length > 11 ? "gap-1" : cells.length > 7 ? "gap-1.5" : "gap-2.5 sm:gap-3"}`}>
                  {focusIdx >= 0 && (
                    <div
                      className="cm-laser pointer-events-none absolute -left-8 top-1/2 hidden h-0.5 w-8 bg-gradient-to-r from-transparent to-[var(--accent)] sm:block"
                      style={{
                        left: `calc(${(focusIdx / Math.max(1, cells.length - 1)) * 100}% - 2rem)`,
                      }}
                    />
                  )}
                  {cells.map((c, idx) => {
                    const on = step.hi?.includes(idx);
                    const inWin = step.window && idx >= step.window[0] && idx <= step.window[1];
                    const pointerLabels = Object.entries(step.pointers || {})
                      .filter(([, v]) => v === idx)
                      .map(([k]) => k);
                    return (
                      <div
                        key={`${idx}-${String(c)}-${i}`}
                        className={`flex flex-col items-center gap-1 ${on ? "cm-cell-lift" : ""}`}
                      >
                        <div className="flex h-5 min-h-5 items-end gap-1">
                          {pointerLabels.map((p) => (
                            <span
                              key={p}
                              className="cm-drop rounded bg-[#ff7a45] px-1.5 text-[10px] font-bold text-black shadow"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                        <div
                          className={`relative flex items-center justify-center border-2 font-mono text-base transition-all duration-500 ease-out ${
                            compact
                              ? "h-11 w-11"
                              : cells.length > 11
                                ? "h-8 w-8 text-xs"
                                : cells.length > 7
                                  ? "h-10 w-10 text-sm"
                                  : "h-12 w-12 sm:h-14 sm:w-14 sm:text-lg"
                          } ${
                            on
                              ? "border-[var(--accent)] bg-[var(--accent)] text-black shadow-[0_0_28px_rgba(200,246,93,0.45)]"
                              : inWin
                                ? "border-[#7cc4ff] bg-[#12283f] text-white"
                                : "border-white/15 bg-[#161d27] text-white"
                          }`}
                          style={{ borderRadius: 12 }}
                        >
                          {String(c)}
                          {on && (
                            <span className="cm-ring pointer-events-none absolute -inset-1 rounded-[14px] border border-[var(--accent)]/50" />
                          )}
                        </div>
                        <span className="text-[10px] text-white/40">{idx}</span>
                      </div>
                    );
                  })}
                  </div>
                </div>
              )}

              {step.grid && step.grid.length > 0 && (
                <div className={`mb-2 max-w-full overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-2 ${compact ? "" : "sm:p-3"}`}>
                  <table className="mx-auto border-separate border-spacing-1 font-mono text-[11px]">
                    <tbody>
                      {step.grid.map((row, r) => (
                        <tr key={r}>
                          <th className="pr-1 text-right text-[9px] font-normal text-white/35">{r}</th>
                          {row.map((c, col) => {
                            const on = step.gridHi?.[0] === r && step.gridHi?.[1] === col;
                            return (
                              <td
                                key={col}
                                className={`h-7 min-w-7 rounded-md px-1.5 text-center transition-colors duration-300 ${
                                  on
                                    ? "bg-[var(--accent)] font-bold text-black shadow-[0_0_18px_rgba(200,246,93,0.4)]"
                                    : "bg-white/[0.07] text-white/75"
                                }`}
                              >
                                {String(c)}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {(step.map || step.stats || step.lists) && (
                <div className={`mb-2 grid w-full max-w-3xl gap-2 ${step.lists && (step.map || step.stats) ? "sm:grid-cols-2" : ""}`}>
                  {step.lists && Object.keys(step.lists).length > 0 && (
                    <div className="rounded-xl border border-white/10 bg-black/50 p-3">
                      {Object.entries(step.lists).map(([name, items]) => (
                        <div key={name} className="mb-2 last:mb-0">
                          <p className="mb-1 font-mono text-[10px] uppercase tracking-wide text-white/45">{name}</p>
                          <div className="flex min-h-7 flex-wrap items-center gap-1.5">
                            {items.length === 0 ? (
                              <span className="text-xs text-white/40">empty</span>
                            ) : (
                              items.map((v, idx) => (
                                <span
                                  key={`${idx}-${String(v)}-${i}`}
                                  className={`cm-pop rounded-lg px-2.5 py-1 font-mono text-xs ${
                                    step.listHi?.[name]?.includes(idx)
                                      ? "bg-[var(--accent)] font-bold text-black"
                                      : "bg-[#1b4a74] text-[#b7e0ff]"
                                  }`}
                                >
                                  {String(v)}
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {step.map && (
                    <div className="rounded-xl border border-white/10 bg-black/50 p-3">
                      <p className="mb-2 text-[10px] uppercase tracking-wide text-white/45">{step.mapTitle || "Memory diary"}</p>
                      <div className="flex min-h-8 flex-wrap gap-1.5">
                        {Object.keys(step.map).length === 0 ? (
                          <span className="text-xs text-white/40">still empty…</span>
                        ) : (
                          Object.entries(step.map).map(([k, v]) => (
                            <span
                              key={`${k}-${v}-${i}`}
                              className="cm-pop rounded-lg bg-[#1b4a74] px-2.5 py-1 font-mono text-xs text-[#b7e0ff]"
                            >
                              {step.mapPlain ? `${k} → ${String(v)}` : `${k} → index ${String(v)}`}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                  {step.stats && !step.map && !step.lists && (
                    <div className="mb-1 flex flex-wrap justify-center gap-2">
                      {Object.entries(step.stats).map(([k, v]) => (
                        <span key={k} className="rounded-full border border-white/10 bg-black/50 px-3 py-1 font-mono text-xs text-white/90">
                          <span className="text-white/45">{k} </span>
                          {String(v)}
                        </span>
                      ))}
                    </div>
                  )}
                  {step.stats && (step.map || step.lists) && (
                    <div className="rounded-xl border border-white/10 bg-black/50 p-3">
                      <p className="mb-2 text-[10px] uppercase tracking-wide text-white/45">On the board</p>
                      <ul className="space-y-1 font-mono text-xs text-white/90">
                        {Object.entries(step.stats).map(([k, v]) => (
                          <li key={k} className="cm-fade">
                            <span className="text-white/45">{k}: </span>
                            {String(v)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {step.codeLine && (
                <pre className="cm-fade mb-1 max-w-3xl overflow-x-auto rounded-xl border border-[#c8f65d]/25 bg-[#c8f65d]/[0.07] px-3 py-2 font-mono text-[12px] text-[#e8ffb0]">
                  {step.codeLine}
                </pre>
              )}
             </div>
            </div>
          </div>

          <div
            className={`pointer-events-none absolute inset-x-3 z-20 flex flex-col items-center text-center transition-[bottom] duration-200 ${
              showChrome ? "bottom-[4.25rem]" : "bottom-3"
            }`}
          >
            {lang === "hindi" && step && !step.sayHi && (
              <p className="mb-1 rounded bg-black/80 px-2 py-0.5 text-[11px] font-medium text-[#ffd166]">
                Writing the Hindi voice. English plays until those lines are ready.
              </p>
            )}
            <div className="max-w-[92%] rounded bg-black/75 px-2 py-1">
              <KaraokeLine
                text={spoken}
                progress={playing ? stepProgress : 1}
                className="justify-center text-[15px] font-medium leading-snug sm:text-base"
              />
              {caption && <p className="mt-0.5 text-center text-[12px] leading-snug text-white/70">{caption}</p>}
            </div>
          </div>

          {loadingVoice && playing && (
            <span className="absolute right-3 top-3 z-20 rounded bg-black/75 px-2 py-1 text-[11px] font-medium text-white/90">
              Loading voice…
            </span>
          )}
        </button>

        <div
          className={`absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black from-45% via-black/80 to-transparent pt-8 transition-opacity duration-200 ${
            showChrome ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <button
            type="button"
            aria-label="Seek lesson"
            className="group/seek relative flex h-3 w-full items-center"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              seekByTime(Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)));
            }}
          >
            <span className="relative block h-1 w-full bg-white/25 transition-[height] group-hover/seek:h-1.5">
              <span className="absolute inset-y-0 left-0 bg-[#ff2a2a]" style={{ width: `${Math.min(100, progress)}%` }} />
              <span
                className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[#ff2a2a] opacity-0 shadow group-hover/seek:opacity-100"
                style={{ left: `calc(${Math.min(100, progress)}% - 6px)` }}
              />
            </span>
          </button>

          <div className="flex items-center gap-0.5 px-1 pb-1 text-white">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggle();
              }}
              aria-label={playing ? "Pause" : "Play"}
              className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-white/10"
            >
              {playing ? (
                <Icon name="pause" size={20} fill="currentColor" strokeWidth={1} />
              ) : (
                <Icon name="play" size={20} fill="currentColor" strokeWidth={1} className="translate-x-px" />
              )}
            </button>
            <button
              type="button"
              aria-label="Previous step"
              title="Previous"
              className="grid h-8 w-8 place-items-center rounded-full transition-colors hover:bg-white/10"
              onClick={(e) => {
                e.stopPropagation();
                jump(i - 1);
              }}
            >
              <Icon name="skipBack" size={18} fill="currentColor" strokeWidth={1.2} />
            </button>
            <button
              type="button"
              aria-label="Next step"
              title="Next"
              className="grid h-8 w-8 place-items-center rounded-full transition-colors hover:bg-white/10"
              onClick={(e) => {
                e.stopPropagation();
                jump(i + 1);
              }}
            >
              <Icon name="skipForward" size={18} fill="currentColor" strokeWidth={1.2} />
            </button>
            <button
              type="button"
              aria-label={voiceOn ? "Mute voice" : "Unmute voice"}
              aria-pressed={!voiceOn}
              title={voiceOn ? "Mute" : "Unmute"}
              className="grid h-8 w-8 place-items-center rounded-full transition-colors hover:bg-white/10"
              onClick={(e) => {
                e.stopPropagation();
                const next = !voiceOn;
                setVoiceOn(next);
                voiceRef.current = next;
                if (!next) {
                  speakId.current += 1;
                  hardStop();
                }
              }}
            >
              <Icon name={voiceOn ? "volume" : "volumeOff"} size={18} />
            </button>

            <span className="ml-1 text-[13px] font-medium tabular-nums text-white">
              {fmt(nowSecs)} / {fmt(totalSecs)}
            </span>

            <div className="ml-auto flex items-center">
              <div role="radiogroup" aria-label="Voice language" className="mr-1 flex items-center">
                {VOICES.map((opt) => {
                  const on = lang === opt.id;
                  const short = opt.id === "english" ? "EN" : opt.id === "hinglish" ? "HI-EN" : "हि";
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      title={opt.label}
                      onClick={(e) => {
                        e.stopPropagation();
                        chooseLang(opt.id);
                      }}
                      className={`rounded px-1.5 py-1 text-[12px] font-medium transition-colors hover:bg-white/10 ${
                        on ? "text-white" : "text-white/55"
                      }`}
                    >
                      {short}
                    </button>
                  );
                })}
              </div>
              <select
                aria-label="Speed"
                className="h-8 bg-transparent px-1 text-[13px] font-medium text-white outline-none [color-scheme:dark]"
                value={speed}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  setSpeed(next);
                  speedRef.current = next;
                  if (playRef.current) {
                    const at = iRef.current;
                    pause();
                    iRef.current = at;
                    setI(at);
                    void playFrom(at);
                    unlockAudio();
                  }
                }}
              >
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={1.8}>1.8x</option>
                <option value={2}>2x</option>
              </select>
              <button
                type="button"
                aria-label={fullscreen ? "Exit full screen" : "Full screen"}
                title={fullscreen ? "Exit full screen" : "Full screen"}
                onClick={(e) => {
                  e.stopPropagation();
                  void toggleFullscreen();
                }}
                className="grid h-8 w-8 place-items-center rounded-full transition-colors hover:bg-white/10"
              >
                <Icon name={fullscreen ? "minimize" : "maximize"} size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {!fullscreen && (
        <div className="bg-black px-3 pb-3 pt-3">
          <h2 className="text-[15px] font-semibold leading-snug text-white">{script.title}</h2>
          <p className="mt-0.5 text-[13px] text-white/60">
            {chapter}
            <span className="px-1 text-white/30">·</span>
            {i + 1} / {script.steps.length}
          </p>
          <div ref={chipsRef} className="no-scrollbar mt-2.5 flex gap-1.5 overflow-x-auto">
            {script.steps.map((s, idx) => {
              const label = chapterLabels[idx] || s.chapter || `Beat ${idx + 1}`;
              const on = idx === i;
              return (
                <button
                  key={idx}
                  type="button"
                  title={s.board || label}
                  aria-current={on ? "step" : undefined}
                  onClick={() => jump(idx)}
                  className={`shrink-0 rounded-lg px-2.5 py-1 text-[12px] font-medium transition-colors ${
                    on ? "bg-white text-black" : "bg-white/10 text-white/80 hover:bg-white/15"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!hidePractice && script.practiceIds.length > 0 && !fullscreen && (
        <div className="flex flex-wrap gap-2 border-t border-white/[0.07] bg-[#090c11] px-3 py-2">
          {script.practiceIds.map((pid) => (
            <Link key={pid} href={`/practice/${pid}`} className="text-sm text-[var(--accent-2)] hover:underline">
              Practice {pid}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
