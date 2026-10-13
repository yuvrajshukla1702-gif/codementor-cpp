import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/ui/icons";
import { Pips } from "@/components/ui/kit";
import { curriculum } from "@/lib/curriculum";
import { getCppCourseSorted } from "@/lib/cpp-course";
import { getDsaTopicLesson } from "@/lib/dsa-lessons";

export const metadata: Metadata = { title: "Learn" };

export default function LearnPage() {
  const cpp = getCppCourseSorted();
  const topics = [...curriculum.topics].sort((a, b) => a.order - b.order);

  return (
    <div className="mx-auto max-w-5xl space-y-12 px-1 py-6 sm:px-3 sm:py-8">
      <header>
        <p className="eyebrow">Learn</p>
        <h1 className="mt-1 font-display text-4xl tracking-[-0.04em]">
          Understand first, <span className="font-serif-accent text-[1.05em] font-normal text-[var(--accent)]">then</span> drill
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          C++ rules and DSA patterns, then the matching problems. The classroom is the step-by-step walkthrough.
        </p>
        <Link href="/learn/classroom" className="btn btn-primary mt-5">
          Open classroom <Icon name="arrowRight" size={15} />
        </Link>
      </header>

      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="eyebrow !text-[var(--accent)]">Track A</p>
            <h2 className="mt-1 font-display text-2xl">C++ Fundamentals</h2>
          </div>
          <Link href="/learn/cpp" className="btn btn-quiet btn-sm !text-[var(--accent)]">
            Open full track <Icon name="arrowRight" size={13} />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cpp.slice(0, 6).map((l) => (
            <Link key={l.id} href={`/learn/cpp/${l.id}`} className="card card-hover block p-5">
              <p className="text-xs text-[var(--muted)]">
                Lesson {String(l.order).padStart(2, "0")} · {l.minutes} min
              </p>
              <h3 className="mt-1.5 font-display text-lg leading-snug text-[var(--ink)]">{l.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">{l.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <p className="eyebrow !text-[var(--accent-2)]">Track B</p>
          <h2 className="mt-1 font-display text-2xl">DSA Patterns</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
            Ordered from your LeetCode baseline. Each topic opens a full lesson before the problem list.
          </p>
        </div>
        <div className="space-y-3">
          {topics.map((t, i) => {
            const lesson = getDsaTopicLesson(t.id);
            return (
              <div key={t.id} className="card p-5 sm:p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-display text-2xl">
                    <span className="mr-3 font-mono text-base text-[var(--accent)]">{String(i + 1).padStart(2, "0")}</span>
                    {t.title}
                  </h3>
                  <Link href={`/learn/dsa/${t.id}`} className="btn btn-quiet btn-sm !text-[var(--accent)]">
                    Study lesson <Icon name="arrowRight" size={13} />
                  </Link>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{lesson?.goal || t.blurb}</p>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {t.problemIds.map((pid) => {
                    const p = curriculum.problems[pid];
                    if (!p) return null;
                    return (
                      <li key={pid}>
                        <Link
                          href={`/learn/dsa/${t.id}/${pid}`}
                          className="flex items-center justify-between gap-3 rounded-xl border border-[var(--line)] px-3.5 py-2.5 text-sm transition-colors hover:border-[var(--line-strong)] hover:bg-[var(--panel-2)]"
                        >
                          <span className="truncate">{p.title}</span>
                          <Pips difficulty={p.difficulty} />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
