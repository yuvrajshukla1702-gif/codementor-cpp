import Link from "next/link";
import { DailyPath } from "@/components/DailyPath";

const paths = [
  { href: "/practice/two-sum", label: "Two Sum", hint: "Start here — Easy / Medium / Best + Code walk" },
  { href: "/practice", label: "All problems", hint: "Editor, local judge, LeetCode submit" },
  { href: "/learn", label: "Learn DSA", hint: "Topics with lessons before the drill" },
  { href: "/learn/cpp", label: "C++ track", hint: "Syntax and STL before the hard ones" },
  { href: "/learn/dsa/hackerrank", label: "HackerRank", hint: "Warmups synced to your profile" },
  { href: "/progress", label: "Progress", hint: "LeetCode + HackerRank at a glance" },
];

const SAMPLE = [
  { n: 12, t: "class Solution {", dim: true },
  { n: 13, t: "public:", dim: true },
  { n: 14, t: "    vector<int> twoSum(vector<int>& nums, int target) {", dim: false },
  { n: 15, t: "        unordered_map<int, int> seen;", focus: true },
  { n: 16, t: "        for (int i = 0; i < (int)nums.size(); i++) {", dim: false },
  { n: 17, t: "            int need = target - nums[i];", dim: false },
  { n: 18, t: "            if (seen.count(need)) return {seen[need], i};", dim: false },
  { n: 19, t: "            seen[nums[i]] = i;", dim: false },
  { n: 20, t: "        }", dim: true },
  { n: 21, t: "        return {};", dim: true },
];

export default function HomePage() {
  return (
    <div className="-mx-3 -mt-3">
      <section className="home-hero relative min-h-[calc(100vh-3rem)] overflow-hidden">
        <div className="home-grid home-glow pointer-events-none absolute inset-0" aria-hidden />

        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl items-end gap-10 px-5 pb-14 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:pb-20">
          <div>
            <p className="home-rise font-display text-[clamp(2.75rem,9vw,5.75rem)] leading-[0.92] text-[var(--ink)]">
              Code<span className="text-[var(--accent)]">Mentor</span>
            </p>
            <h1 className="home-rise-delay mt-5 max-w-lg text-xl font-medium leading-snug text-[var(--ink)] md:text-2xl">
              Learn C++ the way a teacher would explain it — then write it yourself.
            </h1>
            <p className="home-rise-delay-2 mt-3 max-w-md text-sm leading-relaxed text-[var(--muted)] md:text-base">
              Easy, Medium, Best for every problem. Hinglish voice. Line-by-line Code walk. Local judge.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/practice/two-sum"
                className="rounded bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-black transition hover:brightness-110"
              >
                Start with Two Sum
              </Link>
              <Link
                href="/practice"
                className="rounded border border-[var(--line)] px-5 py-2.5 text-sm text-[var(--ink)] transition hover:bg-[var(--chip)]"
              >
                Browse problems
              </Link>
            </div>
          </div>

          <div
            className="home-rise-delay home-code-plane relative mt-4 min-h-[220px] overflow-hidden rounded-sm lg:mt-0 lg:min-h-[280px]"
            aria-hidden
          >
            <div className="flex items-center gap-2 border-b border-white/5 px-4 py-2.5">
              <span className="h-2 w-2 rounded-full bg-[var(--hard)]" />
              <span className="h-2 w-2 rounded-full bg-[var(--medium)]" />
              <span className="h-2 w-2 rounded-full bg-[var(--accent-2)]" />
              <span className="ml-3 font-mono text-[11px] text-[var(--muted)]">two-sum.cpp — Code walk</span>
            </div>
            <pre className="overflow-hidden p-4 font-mono text-[12px] leading-6">
              {SAMPLE.map((line) => (
                <div
                  key={line.n}
                  className={
                    line.focus
                      ? "home-scan -mx-4 flex gap-4 px-4 text-[var(--accent)]"
                      : line.dim
                        ? "flex gap-4 text-[var(--muted)]/50"
                        : "flex gap-4 text-[var(--ink)]/80"
                  }
                  style={line.focus ? { background: "rgba(255,161,22,0.12)" } : undefined}
                >
                  <span className="w-6 shrink-0 select-none text-right text-[var(--muted)]/40">{line.n}</span>
                  <span>{line.t}</span>
                </div>
              ))}
            </pre>
            <p className="absolute bottom-4 left-4 right-4 border-l-2 border-[var(--accent)] bg-black/40 px-3 py-2 text-xs leading-relaxed text-[var(--ink)] backdrop-blur-sm">
              Yahan magic shuru. Yeh ek diary hai — hash map. Value ke saath index yaad rakho.
            </p>
          </div>
        </div>
      </section>

      <DailyPath />

      <section className="border-t border-[var(--line)] bg-[var(--bg)] px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-3xl text-[var(--ink)] md:text-4xl">Pick a door</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">One destination. Open it and start.</p>
          <ul className="mt-10">
            {paths.map((p) => (
              <li key={p.href} className="border-t border-[var(--line)] first:border-t-0">
                <Link
                  href={p.href}
                  className="group flex flex-col gap-0.5 py-4 transition sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                >
                  <span className="text-base font-medium text-[var(--ink)] group-hover:text-[var(--accent)]">
                    {p.label}
                  </span>
                  <span className="text-sm text-[var(--muted)] sm:text-right">{p.hint}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
