/** Shared speech cache + prefetch for course players. */

export type VoiceLang = "hinglish" | "english" | "hindi";

type CacheEntry = { url: string; duration: number };

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<CacheEntry | null>>();

// Two at a time. The line being spoken jumps the queue so a prefetch cannot make the teacher go silent.
const MAX_IN_FLIGHT = 2;
let active = 0;
const waiters: { priority: boolean; start: () => void }[] = [];

function pump() {
  waiters.sort((a, b) => Number(b.priority) - Number(a.priority));
  while (active < MAX_IN_FLIGHT && waiters.length) {
    const job = waiters.shift();
    if (!job) break;
    active += 1;
    job.start();
  }
}

function limited<T>(priority: boolean, fn: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    waiters.push({
      priority,
      start: () => {
        fn().then(resolve, reject).finally(() => {
          active -= 1;
          pump();
        });
      },
    });
    pump();
  });
}

function key(text: string, lang: VoiceLang, speed: number) {
  return `${lang}|${speed}|${text}`;
}

export function estimateSecs(text: string, speed: number) {
  const words = Math.max(4, text.trim().split(/\s+/).length);
  return Math.max(2.2, words / 2.35 / Math.max(0.5, speed));
}

export async function fetchSpeechCached(
  text: string,
  lang: VoiceLang,
  speed: number,
  signal?: AbortSignal,
  priority = false
): Promise<CacheEntry | null> {
  const k = key(text, lang, speed);
  const hit = cache.get(k);
  if (hit) return hit;
  const pending = inflight.get(k);
  if (pending) return pending;

  const job = limited(priority, async () => {
    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, lang, speed, format: "audio" }),
        signal,
      });
      if (signal?.aborted) return null;
      const type = res.headers.get("content-type") || "";
      if (!type.includes("audio")) return null;
      const blob = await res.blob();
      if (signal?.aborted) return null;
      const url = URL.createObjectURL(blob);
      const duration = await new Promise<number>((resolve) => {
        const probe = new Audio();
        probe.preload = "metadata";
        probe.src = url;
        probe.onloadedmetadata = () =>
          resolve(Number.isFinite(probe.duration) ? probe.duration : estimateSecs(text, speed));
        probe.onerror = () => resolve(estimateSecs(text, speed));
      });
      if (cache.size > 60) {
        const first = cache.keys().next().value;
        if (first) {
          URL.revokeObjectURL(cache.get(first)!.url);
          cache.delete(first);
        }
      }
      const entry = { url, duration };
      cache.set(k, entry);
      return entry;
    } catch {
      return null;
    } finally {
      inflight.delete(k);
    }
  });

  inflight.set(k, job);
  return job;
}

export function prefetchSpeech(texts: string[], lang: VoiceLang, speed: number) {
  for (const t of texts) {
    if (!t?.trim()) continue;
    void fetchSpeechCached(t, lang, speed).catch(() => undefined);
  }
}
