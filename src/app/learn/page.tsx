import Link from "next/link";
import { curriculum } from "@/lib/curriculum";
import { getCppCourseSorted } from "@/lib/cpp-course";
import { getDsaTopicLesson } from "@/lib/dsa-lessons";

export default function LearnPage() {
  const cpp = getCppCourseSorted();
  const topics = [...curriculum.topics].sort((a, b) => a.order - b.order);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <h1 className="text-2xl">Learn</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
          C++ rules and DSA patterns, then the matching problems. The classroom is the step-by-step walkthrough.
        </p>
        <Link
          href="/learn/classroom"
          className="mt-4 inline-flex rounded bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-black"
        >
          Open classroom
        </Link>
      </header>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">Track A</p>
            <h2 className="text-xl">C++ Fundamentals</h2>
          </div>
          <Link href="/learn/cpp" className="text-sm text-[var(--accent)] underline">
            Open full track →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cpp.slice(0, 6).map((l) => (
            <Link
              key={l.id}
              href={`/learn/cpp/${l.id}`}
              className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 transition hover:border-[var(--accent)]"
            >
              <p className="text-xs text-[var(--muted)]">
                Lesson {String(l.order).padStart(2, "0")} · {l.minutes} min
              </p>
              <h3 className="mt-1 font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">{l.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">{l.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent-2)]">Track B</p>
          <h2 className="text-xl">DSA Patterns</h2>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
            Ordered from your LeetCode baseline. Each topic opens a full lesson before the problem list.
          </p>
        </div>
        <div className="space-y-3">
          {topics.map((t, i) => {
            const lesson = getDsaTopicLesson(t.id);
            return (
              <div key={t.id} className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-[family-name:var(--font-display)] text-2xl">
                    <span className="mr-2 text-[var(--accent)]">{String(i + 1).padStart(2, "0")}</span>
                    {t.title}
                  </h3>
                  <Link href={`/learn/dsa/${t.id}`} className="text-sm text-[var(--accent)] underline">
                    Study lesson →
                  </Link>
                </div>
                <p className="mt-2 text-sm text-[var(--muted)]">{lesson?.goal || t.blurb}</p>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {t.problemIds.map((pid) => {
                    const p = curriculum.problems[pid];
                    return (
                      <li key={pid}>
                        <Link
                          href={`/learn/dsa/${t.id}/${pid}`}
                          className="flex items-center justify-between rounded-md border border-[var(--line)] px-3 py-2 text-sm hover:bg-[var(--chip)]"
                        >
                          <span>{p.title}</span>
                          <span className="text-xs text-[var(--muted)]">{p.difficulty}</span>
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
