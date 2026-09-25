import Link from "next/link";
import { getCppCourseSorted } from "@/lib/cpp-course";

export default function CppTrackPage() {
  const lessons = getCppCourseSorted();
  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <Link href="/learn" className="text-sm text-[var(--accent)] underline">
          ← Learn hub
        </Link>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl">C++ Fundamentals</h1>
        <p className="mt-2 text-[var(--muted)]">
          Syntax, rules, STL, complexity, and debug habits — taught before you open the judge.
        </p>
      </header>
      <ol className="space-y-3">
        {lessons.map((l) => (
          <li key={l.id}>
            <Link
              href={`/learn/cpp/${l.id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--panel)] px-5 py-4 transition hover:border-[var(--accent)]"
            >
              <div>
                <p className="text-xs text-[var(--muted)]">
                  {String(l.order).padStart(2, "0")} · ~{l.minutes} min · {l.quiz.length} quiz Qs
                </p>
                <h2 className="font-[family-name:var(--font-display)] text-xl">{l.title}</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">{l.summary}</p>
              </div>
              <span className="text-sm text-[var(--accent)]">Open →</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
