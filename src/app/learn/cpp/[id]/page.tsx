import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCppCourseSorted, getCppLesson } from "@/lib/cpp-course";
import { LessonContent, QuizCard } from "@/components/LessonContent";
import { Icon } from "@/components/ui/icons";
import { Pips } from "@/components/ui/kit";
import { curriculum } from "@/lib/curriculum";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const lesson = getCppLesson(id);
  return { title: lesson?.title ?? "C++ lesson" };
}

export default async function CppLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = getCppLesson(id);
  if (!lesson) notFound();
  const all = getCppCourseSorted();
  const idx = all.findIndex((l) => l.id === id);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx < all.length - 1 ? all[idx + 1] : null;

  return (
    <div className="mx-auto max-w-3xl space-y-9 px-1 py-6 sm:px-3 sm:py-8">
      <header>
        <Link
          href="/learn/cpp"
          className="mb-5 inline-flex items-center gap-1 text-sm text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
        >
          <Icon name="chevronLeft" size={14} /> C++ Fundamentals
        </Link>
        <p className="eyebrow">
          Lesson {String(lesson.order).padStart(2, "0")} · {lesson.minutes} min
        </p>
        <h1 className="mt-1 font-display text-4xl tracking-[-0.04em]">{lesson.title}</h1>
        <p className="mt-2 text-[var(--muted)]">{lesson.summary}</p>
      </header>

      <LessonContent source={lesson.body} />

      <section className="card relative overflow-hidden !border-[var(--accent-line)] p-5 sm:p-6">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(200,246,93,0.10), transparent 65%)" }}
        />
        <h2 className="relative font-display text-xl text-[var(--accent)]">Rules to remember</h2>
        <ul className="relative mt-3 space-y-2 text-sm leading-relaxed text-[var(--muted)]">
          {lesson.rules.map((r) => (
            <li key={r} className="flex gap-2.5">
              <Icon name="check" size={15} strokeWidth={2.6} className="mt-0.5 shrink-0 text-[var(--accent)]" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </section>

      <QuizCard quiz={lesson.quiz} />

      {lesson.practiceIds.length > 0 && (
        <section>
          <h2 className="font-display text-xl">Practice what you learned</h2>
          <div className="mt-3 grid gap-2">
            {lesson.practiceIds.map((pid) => {
              const p = curriculum.problems[pid];
              if (!p) return null;
              return (
                <Link
                  key={pid}
                  href={`/practice/${pid}`}
                  className="card card-hover group flex items-center justify-between gap-3 px-4 py-3"
                >
                  <span className="min-w-0 truncate text-[15px] font-medium">{p.title}</span>
                  <span className="flex shrink-0 items-center gap-3">
                    <Pips difficulty={p.difficulty} label />
                    <Icon
                      name="chevronRight"
                      size={15}
                      className="text-[var(--faint)] transition-all group-hover:translate-x-0.5 group-hover:text-[var(--accent)]"
                    />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <nav className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-6">
        {prev ? (
          <Link href={`/learn/cpp/${prev.id}`} className="btn btn-quiet">
            <Icon name="chevronLeft" size={14} /> {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/learn/cpp/${next.id}`} className="btn btn-primary">
            {next.title} <Icon name="arrowRight" size={14} />
          </Link>
        ) : (
          <Link href="/learn" className="btn btn-primary">
            Back to Learn <Icon name="arrowRight" size={14} />
          </Link>
        )}
      </nav>
    </div>
  );
}
