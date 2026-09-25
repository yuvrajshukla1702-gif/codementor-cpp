"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { KaraokeLine, TeacherPresence } from "@/components/course/TeacherPresence";
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

async function fetchSpeech(text: string, lang: VoiceLang, speed: number, signal?: AbortSignal) {
  return fetchSpeechCached(text, lang, speed, signal);
}

export function TeacherShow({
  script,
  compact = false,
  hidePractice = false,
}: {
  script: TeacherShowScript;
  compact?: boolean;
  hidePractice?: boolean;
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
  const gen = useRef(0);
  const speakId = useRef(0);
  const iRef = useRef(0);
  const playRef = useRef(false);
  const speedRef = useRef(speed);
  const langRef = useRef(lang);
  const voiceRef = useRef(voiceOn);
  const scriptRef = useRef(script);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const stepStartedAt = useRef(0);

  speedRef.current = speed;
  langRef.current = lang;
  voiceRef.current = voiceOn;
  scriptRef.current = script;

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
    prefetchSpeech(lines.slice(0, 5), lang, speed);
    const t = window.setTimeout(() => prefetchSpeech(lines.slice(5), lang, speed), 400);
    return () => window.clearTimeout(t);
  }, [script, lang, speed]);

  function hardStop() {
    abortRef.current?.abort();
    abortRef.current = null;
    const audio = audioRef.current;
    if (audio) {
      try {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
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

  async function say(text: string, token: number) {
    const mySpeak = ++speakId.current;
    hardStop();
    if (token !== gen.current || !playRef.current) return false;

    const ac = new AbortController();
    abortRef.current = ac;
    setLoadingVoice(true);

    try {
      const entry = await fetchSpeech(text, langRef.current, speedRef.current, ac.signal);
      if (
        !entry ||
        ac.signal.aborted ||
        mySpeak !== speakId.current ||
        token !== gen.current ||
        !playRef.current
      ) {
        setLoadingVoice(false);
        return false;
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
        return false;
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
      if (!finished && voiceRef.current) return;

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

  const showChrome = hover || !playing || fullscreen;
  const needValue = step?.stats && "need" in step.stats ? String(step.stats.need) : null;
  const stepProgress = Math.min(1, Math.max(0, tick / Math.max(0.4, stepDurations[i] || 3)));
  const chapter = step?.chapter || `Beat ${i + 1}`;
  const boardTitle = step?.board || script.subtitle;
  const gesture = step?.gesture || (playing ? "explain" : "think");
  const focusIdx = step?.hi?.[0] ?? Object.values(step?.pointers || {})[0] ?? -1;

  return (
    <section
      ref={rootRef}
      className={`overflow-hidden bg-black shadow-[0_8px_30px_rgba(0,0,0,0.45)] ${
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
          className={`relative block w-full overflow-hidden text-left ${
            fullscreen ? "h-screen" : "aspect-video"
          }`}
          style={{
            background:
              "radial-gradient(ellipse at 20% 10%, #2a2418 0%, transparent 45%), radial-gradient(ellipse at 80% 0%, #1a2838 0%, transparent 40%), linear-gradient(165deg, #12161c 0%, #07090c 100%)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          <div className="absolute left-3 right-3 top-3 z-10 flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--accent)]/80">
                Live course · {chapter}
              </p>
              <h2 className="mt-0.5 text-sm font-semibold text-white sm:text-base">{script.title}</h2>
            </div>
            <span className="rounded-full bg-black/55 px-2.5 py-1 text-[11px] text-white/80 backdrop-blur">
              {i + 1}/{script.steps.length}
            </span>
          </div>

          <div className="absolute inset-0 grid grid-cols-[72px_1fr] gap-2 px-3 pb-28 pt-14 sm:grid-cols-[110px_1fr] sm:gap-4 sm:px-5 sm:pb-32 sm:pt-16">
            <div className="flex items-end justify-center pb-2 sm:items-center sm:pb-0">
              <TeacherPresence speaking={playing && voiceOn && !loadingVoice} gesture={gesture} compact={!fullscreen && compact} />
            </div>

            <div key={i} className="cm-chalk relative flex min-h-0 flex-col items-center justify-center">
              <div className="mb-3 w-full max-w-3xl rounded-lg border border-white/10 bg-[#0e141c]/85 px-3 py-2 shadow-inner backdrop-blur-sm sm:px-4 sm:py-3">
                <p className="mb-1 text-[10px] uppercase tracking-[0.14em] text-white/40">Chalkboard</p>
                <p className="font-display text-base text-[var(--accent)] sm:text-lg">{boardTitle}</p>
              </div>

              {needValue && (
                <div className="cm-pulse mb-3 rounded-full border border-[#ffa116]/50 bg-[#ffa116]/15 px-3 py-1 text-xs font-semibold text-[#ffd28a]">
                  Looking for {needValue}
                </div>
              )}

              {cells.length > 0 && (
                <div className="relative mb-4 w-full max-w-3xl">
                  {step.window && (
                    <svg
                      className="pointer-events-none absolute inset-x-0 -top-3 h-6 w-full text-[#3ea6ff]/80"
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
                        y="11"
                        textAnchor="middle"
                        className="fill-[#3ea6ff]"
                        style={{ fontSize: 3.5 }}
                      >
                        window
                      </text>
                    </svg>
                  )}
                  <div className="relative flex flex-wrap justify-center gap-2.5 sm:gap-3">
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
                              className="cm-drop rounded bg-[#ff0033] px-1.5 text-[10px] font-bold text-white shadow"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                        <div
                          className={`relative flex h-12 w-12 items-center justify-center border-2 font-mono text-base transition-all duration-500 ease-out sm:h-14 sm:w-14 sm:text-lg ${
                            on
                              ? "border-[var(--accent)] bg-[var(--accent)] text-black shadow-[0_0_28px_rgba(255,161,22,0.45)]"
                              : inWin
                                ? "border-[#3ea6ff] bg-[#12304f] text-white"
                                : "border-white/15 bg-white/[0.06] text-white/65"
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

              {(step.map || step.stats) && (
                <div className="mb-2 grid w-full max-w-3xl gap-2 sm:grid-cols-2">
                  {step.map && (
                    <div className="rounded-xl border border-white/10 bg-black/45 p-3 backdrop-blur">
                      <p className="mb-2 text-[10px] uppercase tracking-wide text-white/45">Memory diary</p>
                      <div className="flex min-h-8 flex-wrap gap-1.5">
                        {Object.keys(step.map).length === 0 ? (
                          <span className="text-xs text-white/40">still empty…</span>
                        ) : (
                          Object.entries(step.map).map(([k, v]) => (
                            <span
                              key={`${k}-${v}-${i}`}
                              className="cm-pop rounded-lg bg-[#1b4a74] px-2.5 py-1 font-mono text-xs text-[#b7e0ff]"
                            >
                              {k} → index {String(v)}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                  {step.stats && (
                    <div className="rounded-xl border border-white/10 bg-black/45 p-3 backdrop-blur">
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
                <pre className="cm-fade mb-1 max-w-3xl overflow-x-auto rounded-xl border border-emerald-400/25 bg-emerald-950/50 px-3 py-2 font-mono text-[12px] text-[#d7ffe4]">
                  {step.codeLine}
                </pre>
              )}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/85 to-transparent px-4 pb-16 pt-16">
            <KaraokeLine text={spoken} progress={playing ? stepProgress : 1} className="text-[15px] font-medium sm:text-base" />
            {caption && <p className="mt-1.5 text-xs leading-relaxed text-white/50">{caption}</p>}
          </div>

          {!playing && (
            <span className="absolute left-1/2 top-1/2 z-20 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#ff0033] text-2xl text-white shadow-lg transition group-hover:scale-105">
              {atEnd ? "↻" : "▶"}
            </span>
          )}
          {loadingVoice && playing && (
            <span className="absolute right-3 top-14 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white/70">
              Loading voice…
            </span>
          )}
        </button>

        <div
          className={`absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black to-transparent px-2 pb-2 pt-10 transition-opacity ${
            showChrome ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="mx-1 mb-2 flex gap-1 overflow-x-auto pb-1">
            {script.steps.map((s, idx) => {
              const label = s.chapter || `Beat ${idx + 1}`;
              const on = idx === i;
              return (
                <button
                  key={idx}
                  type="button"
                  title={s.board || label}
                  onClick={(e) => {
                    e.stopPropagation();
                    jump(idx);
                  }}
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] ${
                    on ? "bg-[var(--accent)] text-black" : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            aria-label="Seek lesson"
            className="relative mx-1 mb-2 block h-1.5 w-[calc(100%-0.5rem)] overflow-hidden rounded-full bg-white/25"
            onClick={(e) => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              seekByTime(Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)));
            }}
          >
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-[#ff0033]"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </button>

          <div className="flex flex-wrap items-center gap-1 px-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggle();
              }}
              aria-label={playing ? "Pause" : "Play"}
              className="grid h-9 w-9 place-items-center rounded-full text-white hover:bg-white/10"
            >
              {playing ? "❚❚" : "▶"}
            </button>
            <button
              type="button"
              aria-label="Replay this beat"
              title="Replay this beat"
              className="rounded px-2 py-1 text-[11px] text-white/80 hover:bg-white/10"
              onClick={(e) => {
                e.stopPropagation();
                jump(i);
              }}
            >
              Replay
            </button>
            <button
              type="button"
              aria-label="Previous step"
              className="grid h-8 w-8 place-items-center rounded-full text-white/80 hover:bg-white/10"
              onClick={(e) => {
                e.stopPropagation();
                jump(i - 1);
              }}
            >
              ⏮
            </button>
            <button
              type="button"
              aria-label="Next step"
              className="grid h-8 w-8 place-items-center rounded-full text-white/80 hover:bg-white/10"
              onClick={(e) => {
                e.stopPropagation();
                jump(i + 1);
              }}
            >
              ⏭
            </button>

            <span className="ml-1 text-[11px] tabular-nums text-white/80">
              {fmt(nowSecs)} / {fmt(totalSecs)}
            </span>

            <div className="ml-auto flex flex-wrap items-center gap-1.5">
              <label className="flex items-center gap-1 text-[11px] text-white/70">
                Speed
                <select
                  aria-label="Speed"
                  className="rounded bg-white/10 px-1.5 py-1 text-[11px] text-white outline-none"
                  value={speed}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setSpeed(next);
                    speedRef.current = next;
                  }}
                >
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={1.8}>1.8x</option>
                  <option value={2}>2x</option>
                </select>
              </label>
              <select
                aria-label="Voice"
                className="rounded bg-white/10 px-1.5 py-1 text-[11px] text-white outline-none"
                value={lang}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  const next = e.target.value as VoiceLang;
                  setLang(next);
                  langRef.current = next;
                  window.localStorage.setItem("cm-voice-lang", next);
                  if (playRef.current) jump(iRef.current);
                }}
              >
                <option value="hinglish">Hinglish</option>
                <option value="english">English</option>
                <option value="hindi">Hindi</option>
              </select>
              <button
                type="button"
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
                className="rounded px-1.5 py-1 text-[11px] text-white/85 hover:bg-white/10"
              >
                {voiceOn ? "🔊" : "🔇"}
              </button>
              <button
                type="button"
                aria-label={fullscreen ? "Exit full screen" : "Full screen"}
                onClick={(e) => {
                  e.stopPropagation();
                  void toggleFullscreen();
                }}
                className="rounded px-2 py-1 text-[11px] text-white/85 hover:bg-white/10"
              >
                {fullscreen ? "⛶ Exit" : "⛶ Full"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {!hidePractice && script.practiceIds.length > 0 && !fullscreen && (
        <div className="flex flex-wrap gap-2 border-t border-white/10 bg-[#0f0f0f] px-3 py-2">
          {script.practiceIds.map((pid) => (
            <Link key={pid} href={`/practice/${pid}`} className="text-sm text-[#3ea6ff] hover:underline">
              Practice {pid}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
