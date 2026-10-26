import Link from "next/link";
import { DailyPath, type SpineMeta } from "@/components/DailyPath";
import { HeroCta } from "@/components/HeroCta";
import { HeroWalk } from "@/components/HeroWalk";
import { Icon, type IconName } from "@/components/ui/icons";
import { curriculum, getProblem } from "@/lib/curriculum";
import { LEARNING_SPINE } from "@/lib/learning-path";

export default function HomePage() {
  const total = Object.keys(curriculum.problems).length;
  const topicTitle = new Map(curriculum.topics.map((t) => [t.id, t.title]));
  const meta: SpineMeta = {};
  for (const s of LEARNING_SPINE) {
    const p = getProblem(s.id);
    meta[s.id] = {
      title: p?.title ?? s.title,
      difficulty: p?.difficulty ?? "Easy",
      topic: (p && topicTitle.get(p.topic)) ?? "",
    };
  }

  const doors: { href: string; icon: IconName; label: string; hint: string; wide?: boolean }[] = [
    {
      href: "/ask",
      icon: "sparkles",
      label: "Ask AI anything",
      hint: "Paste any problem, code or concept. Get a whiteboard video with a voice-over, a dry run, and C++ that was really compiled and tested.",
      wide: true,
    },
    { href: "/practice", icon: "list", label: "All problems", hint: `${total} problems, searchable, with a local judge.` },
    {
      href: "/compiler",
      icon: "terminal",
      label: "Online compiler",
      hint: "Write C, C++, Python, Java, or JavaScript and run it, with input and the real output beside the editor.",
      wide: true,
    },
    {
      href: "/practice/two-sum",
      icon: "play",
      label: "Start with Two Sum",
      hint: "The reference lesson: Easy, Medium and Best solutions, each with a voice-over code walk.",
      wide: true,
    },
    { href: "/learn", icon: "book", label: "Learn DSA", hint: "Topic lessons before the drill." },
    { href: "/learn/cpp", icon: "code", label: "C++ track", hint: "Syntax and STL before the hard ones." },
    { href: "/learn/dsa/hackerrank", icon: "target", label: "HackerRank", hint: "Warm-ups synced to your profile." },
    { href: "/tcs", icon: "mic", label: "Interview prep", hint: "TCS NQT, core CS and HR answers." },
  ];

  return (
    <div className="-mx-3 -mt-3">
      <section className="home-hero relative overflow-hidden px-5 lg:px-8">
        <div className="home-grid pointer-events-none absolute inset-0" aria-hidden />

        <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-14 pb-20 pt-14 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:items-center lg:gap-10 lg:pb-28 lg:pt-24">
          <div>
            <span className="chip chip-brand home-rise !h-7 !px-3 !text-xs">
              <Icon name="sparkles" size={13} />
              C++ · voice-taught · local judge
            </span>
            <h1 className="home-rise-delay mt-6 font-display text-[clamp(2.6rem,6.3vw,5rem)] font-bold leading-[0.98] tracking-[-0.045em]">
              Don&rsquo;t memorise solutions.
              <br />
              <span className="font-serif-accent text-[1.06em] font-normal tracking-[-0.02em] text-[var(--accent)]">Understand</span>{" "}
              them.
            </h1>
            <p className="home-rise-delay-2 mt-6 max-w-lg text-base leading-relaxed text-[var(--muted)] md:text-lg">
              A teacher walks through every line — in English, Hinglish or Hindi. Then you write it yourself and a real
              C++ judge checks it.
            </p>
            <HeroCta />
            <ul className="home-rise-delay-3 mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--muted)]">
              {[`${total} problems`, "3 solution tiers", "Line-by-line code walks", "Runs on your machine"].map((t) => (
                <li key={t} className="inline-flex items-center gap-2">
                  <Icon name="check" size={14} className="text-[var(--accent)]" strokeWidth={2.4} />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <HeroWalk />
        </div>
      </section>

      <DailyPath meta={meta} />

      <section className="border-t border-[var(--line)] bg-[var(--bg)] px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow">Explore</p>
          <h2 className="mt-2 font-display text-3xl md:text-4xl">Pick a door.</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {doors.map((d) => (
              <Link
                key={d.href}
                href={d.href}
                className={`card card-hover group relative flex flex-col justify-between gap-8 overflow-hidden p-5 ${
                  d.wide ? "sm:col-span-2" : ""
                }`}
              >
                {d.wide && (
                  <span
                    className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full"
                    style={{ background: "radial-gradient(circle, rgba(200,246,93,0.14), transparent 65%)" }}
                  />
                )}
                <span
                  className={`relative grid h-10 w-10 place-items-center rounded-xl ${
                    d.wide ? "bg-[var(--accent)] text-[var(--accent-ink)]" : "bg-[var(--panel-2)] text-[var(--accent)]"
                  }`}
                >
                  <Icon name={d.icon} size={18} />
                </span>
                <span className="relative">
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-display text-lg text-[var(--ink)]">{d.label}</span>
                    <Icon
                      name="arrowUpRight"
                      size={16}
                      className="shrink-0 text-[var(--faint)] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]"
                    />
                  </span>
                  <span className="mt-1 block max-w-md text-sm leading-relaxed text-[var(--muted)]">{d.hint}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--line)] px-5 py-8 text-center text-xs text-[var(--faint)]">
        CodeMentor · built to make you <span className="font-serif-accent text-sm text-[var(--muted)]">get it</span>, not
        just pass it.
      </footer>
    </div>
  );
}
