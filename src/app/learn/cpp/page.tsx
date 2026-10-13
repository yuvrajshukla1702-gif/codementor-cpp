import type { Metadata } from "next";
import Link from "next/link";
import { getCppCourseSorted } from "@/lib/cpp-course";
import { Icon } from "@/components/ui/icons";
import { PageFrame, PageHeader } from "@/components/ui/kit";

export const metadata: Metadata = { title: "C++ Fundamentals" };

export default function CppTrackPage() {
  const lessons = getCppCourseSorted();
  return (
    <PageFrame>
      <div>
        <Link
          href="/learn"
          className="mb-5 inline-flex items-center gap-1 text-sm text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
        >
          <Icon name="chevronLeft" size={14} /> Learn
        </Link>
        <PageHeader eyebrow="Track A" title="C++" accent="Fundamentals">
          Syntax, rules, STL, complexity and debug habits — taught before you open the judge.
        </PageHeader>
      </div>
      <ol className="grid gap-3">
        {lessons.map((l) => (
          <li key={l.id}>
            <Link
              href={`/learn/cpp/${l.id}`}
              className="card card-hover group grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 sm:px-5"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--panel-2)] font-mono text-sm font-semibold text-[var(--accent)]">
                {String(l.order).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                <span className="block text-xs text-[var(--muted)]">
                  ~{l.minutes} min · {l.quiz.length} quiz {l.quiz.length === 1 ? "question" : "questions"}
                </span>
                <span className="mt-0.5 block font-display text-lg leading-snug">{l.title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-[var(--muted)]">{l.summary}</span>
              </span>
              <Icon
                name="chevronRight"
                size={18}
                className="text-[var(--faint)] transition-all group-hover:translate-x-0.5 group-hover:text-[var(--accent)]"
              />
            </Link>
          </li>
        ))}
      </ol>
    </PageFrame>
  );
}
