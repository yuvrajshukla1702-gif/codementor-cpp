"use client";

import type { ShowGesture } from "@/lib/teacher-shows";

/** Stylized course instructor — CSS only, no image assets. */
export function TeacherPresence({
  speaking,
  gesture = "explain",
  name = "Mentor",
  compact = false,
}: {
  speaking: boolean;
  gesture?: ShowGesture;
  name?: string;
  compact?: boolean;
}) {
  const arm =
    gesture === "point"
      ? "rotate-12 translate-x-1"
      : gesture === "write"
        ? "-rotate-6"
        : gesture === "celebrate"
          ? "-rotate-12 -translate-y-1"
          : gesture === "think"
            ? "rotate-[-20deg] -translate-y-2"
            : "rotate-0";

  return (
    <div className={`flex flex-col items-center ${compact ? "gap-1" : "gap-2"}`}>
      <div className={`relative ${compact ? "h-24 w-20" : "h-36 w-28"}`}>
        <div
          className={`absolute inset-x-2 bottom-0 rounded-t-[40%] bg-gradient-to-b from-[#2a3344] to-[#151a22] ${
            compact ? "top-10" : "top-14"
          }`}
        />
        <div
          className={`absolute left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-b from-[#f0c7a0] to-[#d9a57a] shadow-lg ${
            compact ? "top-1 h-10 w-10" : "top-2 h-14 w-14"
          } ${speaking ? "cm-teacher-talk" : ""}`}
        >
          <span className="absolute left-[28%] top-[42%] h-1 w-1 rounded-full bg-[#3a2a20]" />
          <span className="absolute right-[28%] top-[42%] h-1 w-1 rounded-full bg-[#3a2a20]" />
          <span
            className={`absolute left-1/2 -translate-x-1/2 rounded-full bg-[#8b3a2f] ${
              compact ? "bottom-[22%] h-[3px] w-3" : "bottom-[20%] h-1 w-4"
            } ${speaking ? "cm-mouth" : ""}`}
          />
        </div>
        <div
          className={`absolute right-0 top-[45%] h-2 w-8 origin-left rounded-full bg-[#2a3344] transition-transform duration-500 ${arm}`}
        />
        <div className="absolute left-0 top-[45%] h-2 w-7 -scale-x-100 rounded-full bg-[#2a3344]" />
        {speaking && (
          <div className="absolute -right-1 top-6 flex items-end gap-0.5">
            <span className="cm-wave h-2 w-1 rounded-full bg-[var(--accent)]" />
            <span className="cm-wave cm-wave-2 h-3 w-1 rounded-full bg-[var(--accent)]" />
            <span className="cm-wave cm-wave-3 h-2 w-1 rounded-full bg-[var(--accent)]" />
          </div>
        )}
      </div>
      <div className="text-center">
        <p className={`font-medium text-white ${compact ? "text-[11px]" : "text-xs"}`}>{name}</p>
        <p className={`text-white/45 ${compact ? "text-[9px]" : "text-[10px]"}`}>
          {speaking ? "speaking…" : gesture}
        </p>
      </div>
    </div>
  );
}

/** Karaoke-style caption — words light up as the step progresses. */
export function KaraokeLine({
  text,
  progress,
  className = "",
}: {
  text: string;
  /** 0..1 through the spoken line */
  progress: number;
  className?: string;
}) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return null;
  const lit = Math.floor(progress * words.length);
  return (
    <p className={`flex flex-wrap gap-x-1.5 gap-y-1 leading-snug ${className}`}>
      {words.map((w, i) => (
        <span
          key={`${i}-${w}`}
          className={`transition-colors duration-150 ${
            i <= lit ? "text-white" : "text-white/35"
          } ${i === lit ? "text-[var(--accent)]" : ""}`}
        >
          {w}
        </span>
      ))}
    </p>
  );
}
