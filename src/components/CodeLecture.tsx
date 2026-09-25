"use client";

import { useEffect, useRef, useState } from "react";
import { KaraokeLine, TeacherPresence } from "@/components/course/TeacherPresence";
import type { CodeLectureScript } from "@/lib/code-lecture";
import type { VoiceLang } from "@/lib/walkthrough";

function lineOf(step: CodeLectureScript["steps"][number], lang: VoiceLang) {
  if (lang === "english") return step.sayEn || step.say;
  if (lang === "hindi") return step.sayHi || step.sayEn || step.say;
  return step.say;
}

const audioCache = new Map<string, string>();

async function fetchSpeech(text: string, lang: VoiceLang, speed: number, signal?: AbortSignal) {
  const key = `${lang}|${speed}|${text}`;
  const hit = audioCache.get(key);
  if (hit) return hit;
  const res = await fetch("/api/speak", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, lang, speed }),
    signal,
  });
  if (!res.ok || !(res.headers.get("content-type") || "").includes("audio")) return null;
  const url = URL.createObjectURL(await res.blob());
  if (audioCache.size > 50) {
    const first = audioCache.keys().next().value;
    if (first) {
      URL.revokeObjectURL(audioCache.get(first)!);
      audioCache.delete(first);
    }
  }
  audioCache.set(key, url);
  return url;
}

export function CodeLecture({ script }: { script: CodeLectureScript }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [lang, setLang] = useState<VoiceLang>("hinglish");
  const [voiceOn, setVoiceOn] = useState(true);
  const [typed, setTyped] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [speakProgress, setSpeakProgress] = useState(0);

  const rootRef = useRef<HTMLElement | null>(null);
  const gen = useRef(0);
  const speakId = useRef(0);
  const playRef = useRef(false);
  const iRef = useRef(0);
  const speedRef = useRef(speed);
  const langRef = useRef(lang);
  const voiceRef = useRef(voiceOn);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const codeBoxRef = useRef<HTMLDivElement | null>(null);
  const speakStarted = useRef(0);

  speedRef.current = speed;
  langRef.current = lang;
  voiceRef.current = voiceOn;

  const step = script.steps[i] ?? script.steps[0];
  const lines = (step?.codeSoFar || "").split("\n");
  const focus = step?.focusLine ?? -1;
  const atEnd = i >= script.steps.length - 1 && !playing;
  const spoken = step ? lineOf(step, lang) : "";
  const progress = ((i + (playing ? speakProgress : 1)) / Math.max(1, script.steps.length)) * 100;

  useEffect(() => {
    const saved = window.localStorage.getItem("cm-voice-lang");
    if (saved === "english" || saved === "hindi" || saved === "hinglish") {
      setLang(saved);
      langRef.current = saved;
    }
    if (!audioRef.current) audioRef.current = new Audio();
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => {
      document.removeEventListener("fullscreenchange", onFs);
      playRef.current = false;
      gen.current += 1;
      speakId.current += 1;
      hardStop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const line = step?.lineText || "";
    if (!line) {
      setTyped(0);
      return;
    }
    setTyped(0);
    let n = 0;
    const base = Math.max(14, 28 / speedRef.current);
    const id = window.setInterval(() => {
      n += 1;
      // Human typing: occasional pause on punctuation
      setTyped(n);
      if (n >= line.length) window.clearInterval(id);
    }, base);
    return () => window.clearInterval(id);
  }, [i, step?.lineText]);

  useEffect(() => {
    const el = codeBoxRef.current?.querySelector("[data-focus='1']");
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [i, typed]);

  useEffect(() => {
    if (!playing) return;
    speakStarted.current = performance.now();
    const id = window.setInterval(() => {
      const audio = audioRef.current;
      if (audio && Number.isFinite(audio.duration) && audio.duration > 0) {
        setSpeakProgress(Math.min(1, audio.currentTime / audio.duration));
      } else {
        setSpeakProgress(Math.min(1, (performance.now() - speakStarted.current) / 4000));
      }
    }, 120);
    return () => window.clearInterval(id);
  }, [playing, i]);

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
  }

  async function say(text: string, token: number) {
    const my = ++speakId.current;
    hardStop();
    if (token !== gen.current || !playRef.current) return false;
    const ac = new AbortController();
    abortRef.current = ac;
    setSpeakProgress(0);
    try {
      const url = await fetchSpeech(text, langRef.current, speedRef.current, ac.signal);
      if (!url || ac.signal.aborted || my !== speakId.current || token !== gen.current || !playRef.current) {
        return false;
      }
      const audio = audioRef.current || new Audio();
      audioRef.current = audio;
      audio.src = url;
      await audio.play();
      if (my !== speakId.current || token !== gen.current || !playRef.current) {
        audio.pause();
        return false;
      }
      await new Promise<void>((resolve) => {
        const done = () => {
          audio.removeEventListener("ended", done);
          resolve();
        };
        audio.addEventListener("ended", done);
      });
      setSpeakProgress(1);
      return my === speakId.current && token === gen.current && playRef.current;
    } catch {
      return false;
    }
  }

  async function playFrom(start: number) {
    hardStop();
    const token = ++gen.current;
    playRef.current = true;
    setPlaying(true);
    let cur = start;
    while (token === gen.current && playRef.current) {
      iRef.current = cur;
      setI(cur);
      setSpeakProgress(0);
      const frame = script.steps[cur];
      if (!frame) break;
      let ok = true;
      if (voiceRef.current) ok = await say(lineOf(frame, langRef.current), token);
      else {
        const wait = 2200 / speedRef.current;
        await new Promise((r) => setTimeout(r, wait));
        setSpeakProgress(1);
      }
      if (token !== gen.current || !playRef.current) return;
      if (!ok && voiceRef.current) return;
      if (cur >= script.steps.length - 1) {
        playRef.current = false;
        setPlaying(false);
        return;
      }
      await new Promise((r) => setTimeout(r, 180));
      if (token !== gen.current || !playRef.current) return;
      cur += 1;
    }
  }

  function pause() {
    playRef.current = false;
    gen.current += 1;
    speakId.current += 1;
    setPlaying(false);
    hardStop();
  }

  function toggle() {
    if (playRef.current) pause();
    else {
      const last = script.steps.length - 1;
      const start = iRef.current >= last ? 0 : iRef.current;
      void playFrom(start);
    }
  }

  function jump(next: number) {
    const clamped = Math.min(script.steps.length - 1, Math.max(0, next));
    const was = playRef.current;
    pause();
    iRef.current = clamped;
    setI(clamped);
    if (was) void playFrom(clamped);
  }

  async function toggleFullscreen() {
    const el = rootRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await el.requestFullscreen();
    } catch {
      /* blocked */
    }
  }

  return (
    <section
      ref={rootRef}
      className={`overflow-hidden bg-[#0b0d10] shadow-[0_8px_30px_rgba(0,0,0,0.5)] ${
        fullscreen ? "rounded-none" : "rounded-xl"
      }`}
    >
      <div className={`relative flex flex-col ${fullscreen ? "h-screen" : "min-h-[460px]"}`}>
        <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--accent)]/80">Code course</p>
            <h2 className="text-sm font-semibold text-white">{script.title}</h2>
          </div>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/75">
            {i + 1}/{script.steps.length}
          </span>
        </div>

        <div className="grid min-h-0 flex-1 lg:grid-cols-[1.15fr_0.85fr]">
          <button type="button" onClick={toggle} className="relative min-h-[260px] text-left lg:min-h-0">
            <div
              ref={codeBoxRef}
              className="absolute inset-0 overflow-auto bg-[#0e1116] px-3 py-3 font-mono text-[12.5px] leading-6"
            >
              {lines.length === 1 && lines[0] === "" && (
                <p className="text-white/35">Press play — mentor writes the code with you…</p>
              )}
              {lines.map((ln, idx) => {
                const on = idx === focus;
                const show =
                  on && step.lineText
                    ? step.lineText.slice(0, Math.min(typed, step.lineText.length))
                    : ln;
                const caret = on && step.lineText && typed < step.lineText.length;
                return (
                  <div
                    key={`${idx}-${on ? typed : "x"}`}
                    data-focus={on ? "1" : "0"}
                    className={`flex gap-3 rounded px-1 transition-all duration-300 ${
                      on
                        ? "cm-cell-lift bg-[#ffa116]/18 text-white shadow-[inset_3px_0_0_#ffa116]"
                        : "text-[#c8d0da]"
                    }`}
                  >
                    <span className="w-6 shrink-0 select-none text-right text-white/25">{idx + 1}</span>
                    <span className="whitespace-pre">
                      {show || " "}
                      {caret && (
                        <span className="cm-pulse inline-block w-[2px] bg-[#ffa116] align-middle">&nbsp;</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>

            {!playing && (
              <span className="absolute left-1/2 top-1/2 z-10 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#ff0033] text-xl text-white shadow-lg">
                {atEnd ? "↻" : "▶"}
              </span>
            )}
          </button>

          <aside className="flex flex-col border-t border-white/10 bg-gradient-to-b from-[#12161d] to-[#0a0c10] p-3 lg:border-l lg:border-t-0">
            <div className="flex items-start gap-3">
              <TeacherPresence
                speaking={playing && voiceOn}
                gesture={focus >= 0 ? "write" : "explain"}
                compact
              />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-[0.14em] text-white/40">Mentor explains</p>
                <p className="mt-1 text-xs text-white/55">{script.complexity}</p>
              </div>
            </div>
            <div key={i} className="cm-chalk mt-3 min-h-[5.5rem] flex-1 rounded-lg border border-white/10 bg-black/35 p-3">
              <KaraokeLine
                text={spoken || "Press play to start the lecture."}
                progress={playing ? speakProgress : spoken ? 1 : 0}
                className="text-sm font-medium"
              />
              {step?.lineText && (
                <pre className="cm-fade mt-3 overflow-x-auto rounded border border-emerald-400/20 bg-emerald-950/40 px-2 py-1.5 font-mono text-[11px] text-[#d7ffe4]">
                  {step.lineText}
                </pre>
              )}
            </div>
          </aside>
        </div>

        <div className="border-t border-white/10 bg-[#0c0e12] px-3 pb-2 pt-2">
          <div className="mb-2 h-1 overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-[#ff0033] transition-[width] duration-200" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              aria-label={playing ? "Pause" : "Play"}
              onClick={toggle}
              className="grid h-8 w-8 place-items-center rounded-full text-white hover:bg-white/10"
            >
              {playing ? "❚❚" : "▶"}
            </button>
            <button type="button" className="grid h-8 w-8 place-items-center text-white/80 hover:bg-white/10" onClick={() => jump(i - 1)}>
              ⏮
            </button>
            <button type="button" className="grid h-8 w-8 place-items-center text-white/80 hover:bg-white/10" onClick={() => jump(i + 1)}>
              ⏭
            </button>
            <div className="ml-auto flex items-center gap-1.5">
              <select
                aria-label="Speed"
                className="rounded bg-white/10 px-1.5 py-1 text-[11px] text-white"
                value={speed}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setSpeed(v);
                  speedRef.current = v;
                }}
              >
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={1.8}>1.8x</option>
              </select>
              <select
                aria-label="Voice"
                className="rounded bg-white/10 px-1.5 py-1 text-[11px] text-white"
                value={lang}
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
                className="rounded px-1.5 py-1 text-[11px] text-white/85 hover:bg-white/10"
                onClick={() => {
                  const next = !voiceOn;
                  setVoiceOn(next);
                  voiceRef.current = next;
                  if (!next) {
                    speakId.current += 1;
                    hardStop();
                  }
                }}
              >
                {voiceOn ? "🔊" : "🔇"}
              </button>
              <button
                type="button"
                className="rounded px-2 py-1 text-[11px] text-white/85 hover:bg-white/10"
                onClick={() => void toggleFullscreen()}
              >
                {fullscreen ? "Exit" : "Full"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
