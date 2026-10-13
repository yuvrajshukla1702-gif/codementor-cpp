import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { curriculum, getTopic } from "@/lib/curriculum";
import { getDsaTopicLesson } from "@/lib/dsa-lessons";
import { getTeacherShow } from "@/lib/teacher-shows";
import { TeacherShow } from "@/components/TeacherShow";
import { Icon } from "@/components/ui/icons";
import { Pips } from "@/components/ui/kit";

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }): Promise<Metadata> {
  const { topic } = await params;
  return { title: getDsaTopicLesson(topic)?.title ?? getTopic(topic)?.title ?? "Topic" };
}

export default async function DsaTopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic: topicId } = await params;
  const topic = getTopic(topicId);
  const lesson = getDsaTopicLesson(topicId);
  if (!topic || !lesson) notFound();
  const show = lesson.showId ? getTeacherShow(lesson.showId) : null;

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-1 py-6 sm:px-3 sm:py-8">
      <header>
        <Link href="/learn" className="btn btn-quiet btn-sm !px-0 !text-[var(--accent)]">
          <Icon name="chevronLeft" size={14} /> Learn hub
        </Link>
        <h1 className="mt-3 font-display text-4xl tracking-[-0.04em]">{lesson.title}</h1>
        <p className="mt-3 text-lg leading-relaxed text-[var(--muted)]">{lesson.goal}</p>
      </header>

      {show && <TeacherShow script={show} />}

      <section className="space-y-2">
        <h2 className="font-display text-xl">When to use this</h2>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-[var(--muted)] marker:text-[var(--faint)]">
          {lesson.whenToUse.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-xl">C++ template</h2>
        <pre className="overflow-x-auto rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 text-[12.5px] leading-relaxed text-[#d7e0ee]">
          <code>{lesson.templateCpp}</code>
        </pre>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-xl">Dry run</h2>
        <pre className="whitespace-pre-wrap rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm text-[var(--muted)]">
          {lesson.dryRun}
        </pre>
      </section>

      <section className="card p-5">
        <h2 className="font-display text-xl text-[var(--accent)]">Pitfalls</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-[var(--muted)] marker:text-[var(--faint)]">
          {lesson.pitfalls.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </section>

      <section className="card !border-[rgba(124,196,255,0.3)] p-5">
        <h2 className="font-display text-xl">Say this in the interview</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{lesson.interviewSay}</p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl">Problems in this topic ({topic.problemIds.length})</h2>
        <p className="text-sm text-[var(--muted)]">
          Each opens teach-first (animated when available), then the code panel.
        </p>
        <ul className="space-y-2">
          {topic.problemIds.map((pid) => {
            const p = curriculum.problems[pid];
            if (!p) return null;
            return (
              <li key={pid}>
                <Link
                  href={`/learn/dsa/${topicId}/${pid}`}
                  className="card card-hover flex items-center justify-between gap-3 px-4 py-3 text-sm"
                >
                  <span>{p.title}</span>
                  <Pips difficulty={p.difficulty} label />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
