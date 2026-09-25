import Link from "next/link";
import { notFound } from "next/navigation";
import { getCppCourseSorted, getCppLesson } from "@/lib/cpp-course";
import { LessonContent, QuizCard } from "@/components/LessonContent";
import { curriculum } from "@/lib/curriculum";

export default async function CppLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = getCppLesson(id);
  if (!lesson) notFound();
  const all = getCppCourseSorted();
  const idx = all.findIndex((l) => l.id === id);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx < all.length - 1 ? all[idx + 1] : null;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <Link href="/learn/cpp" className="text-sm text-[var(--accent)] underline">
          ← C++ Fundamentals
        </Link>
        <p className="mt-3 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Lesson {String(lesson.order).padStart(2, "0")} · {lesson.minutes} min
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl">{lesson.title}</h1>
        <p className="mt-2 text-[var(--muted)]">{lesson.summary}</p>
      </header>

      <LessonContent source={lesson.body} />

      <section className="rounded-xl border border-[var(--accent)]/40 bg-[var(--panel)] p-5">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--accent)]">Rules to remember</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-[var(--muted)]">
          {lesson.rules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>

      <QuizCard quiz={lesson.quiz} />

      {lesson.practiceIds.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-[family-name:var(--font-display)] text-xl">Practice what you learned</h2>
          <div className="flex flex-col gap-2">
            {lesson.practiceIds.map((pid) => {
              const p = curriculum.problems[pid];
              if (!p) return null;
              return (
                <Link
                  key={pid}
                  href={`/learn/dsa/${p.topic}/${pid}`}
                  className="rounded-md border border-[var(--line)] px-4 py-3 text-sm hover:bg-[var(--chip)]"
                >
                  {p.title}{" "}
                  <span className="text-[var(--muted)]">
                    ({p.difficulty}) — lesson then editor
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <nav className="flex flex-wrap justify-between gap-3 border-t border-[var(--line)] pt-6 text-sm">
        {prev ? (
          <Link href={`/learn/cpp/${prev.id}`} className="text-[var(--accent)] underline">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/learn/cpp/${next.id}`} className="text-[var(--accent)] underline">
            {next.title} →
          </Link>
        ) : (
          <Link href="/learn" className="text-[var(--accent)] underline">
            Back to Learn hub →
          </Link>
        )}
      </nav>
    </div>
  );
}
