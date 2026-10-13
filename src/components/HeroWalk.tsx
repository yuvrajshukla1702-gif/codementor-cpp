import type { CSSProperties, ReactNode } from "react";
import { Icon } from "./ui/icons";

/** Purely visual (server-rendered, CSS-only animation): a teacher "walking" a solution line by line. */
const LINES = [
  "class Solution {",
  "public:",
  "    vector<int> twoSum(vector<int>& nums, int target) {",
  "        unordered_map<int, int> seen;",
  "        for (int i = 0; i < (int)nums.size(); i++) {",
  "            int need = target - nums[i];",
  "            if (seen.count(need)) return {seen[need], i};",
  "            seen[nums[i]] = i;",
  "        }",
  "        return {};",
];

const FIRST_LINE_NO = 12;
const FOCUS_START = 2; // index of the first highlighted line
const LINE_H = 24;
const PAD = 16;

const CAPTIONS = [
  "Function ka signature — input mein array aur target milta hai.",
  "Yeh ek diary hai — hash map. Value ke saath uska index yaad rakhenge.",
  "Ab array pe sirf ek baar ghumo. Brute force ki zaroorat nahi.",
  "Jo chahiye woh hai: target minus current number.",
  "Diary mein mil gaya? Bas — answer ready!",
  "Nahi mila? Current number ko diary mein likh do.",
];

const TOKEN = /(\b(?:class|public|for|if|return)\b)|(\b(?:int|vector|unordered_map)\b)|(\b\d+\b)|(\b[A-Za-z_]\w*(?=\())/g;

function highlight(line: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let k = 0;
  TOKEN.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = TOKEN.exec(line))) {
    if (m.index > last) out.push(line.slice(last, m.index));
    const color = m[1] ? "#ff8fb1" : m[2] ? "#7cc4ff" : m[3] ? "#ffd166" : "#c8f65d";
    out.push(
      <span key={k++} style={{ color }}>
        {m[0]}
      </span>
    );
    last = m.index + m[0].length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

export function HeroWalk() {
  return (
    <div className="relative" aria-hidden>
      <div className="glass home-rise-delay relative overflow-hidden rounded-2xl">
        <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#3a4455]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#3a4455]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#3a4455]" />
          <span className="ml-3 font-mono text-[11px] text-[var(--muted)]">two-sum.cpp</span>
          <span className="chip chip-brand !h-5 ml-auto !text-[10px]">
            <span className="cm-pulse h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            teaching
          </span>
        </div>

        <div className="relative font-mono text-[12.5px]" style={{ padding: PAD, lineHeight: `${LINE_H}px` }}>
          <div
            className="cm-walk absolute left-0 right-0 border-l-2 border-[var(--accent)] bg-[rgba(200,246,93,0.09)]"
            style={{ top: PAD + FOCUS_START * LINE_H, height: LINE_H }}
          />
          {LINES.map((t, i) => (
            <div key={i} className="relative flex gap-4 whitespace-pre text-[#cfd8e6]" style={{ height: LINE_H }}>
              <span className="w-5 shrink-0 select-none text-right text-[#3f4a5b]">{FIRST_LINE_NO + i}</span>
              <span className="overflow-hidden">{highlight(t)}</span>
            </div>
          ))}
        </div>

        <div className="relative h-[88px] border-t border-white/5">
          {CAPTIONS.map((c, i) => (
            <div
              key={i}
              className="cm-cap absolute inset-x-4 top-3.5 flex items-start gap-3"
              style={{ "--i": i } as CSSProperties}
            >
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center gap-[2px] rounded-full border border-[var(--accent-line)] bg-[var(--accent-soft)]">
                <span className="cm-wave h-2.5 w-[2px] rounded bg-[var(--accent)]" />
                <span className="cm-wave cm-wave-2 h-4 w-[2px] rounded bg-[var(--accent)]" />
                <span className="cm-wave cm-wave-3 h-2.5 w-[2px] rounded bg-[var(--accent)]" />
              </span>
              <p className="text-[13px] leading-snug text-[var(--ink)]">{c}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="home-rise-delay-3 absolute -bottom-4 right-5 flex items-center gap-2 rounded-xl border border-[var(--accent-line)] bg-[var(--panel)] px-3 py-2 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.9)]">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--accent)] text-[var(--accent-ink)]">
          <Icon name="check" size={12} strokeWidth={3} />
        </span>
        <span className="text-xs font-semibold text-[var(--ink)]">Accepted · 12/12</span>
        <span className="text-xs font-semibold text-[var(--gold)]">+10 XP</span>
      </div>
    </div>
  );
}
