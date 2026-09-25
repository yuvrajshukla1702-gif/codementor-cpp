import Link from "next/link";
import { notFound } from "next/navigation";
import { curriculum, getTopic } from "@/lib/curriculum";
import { getDsaTopicLesson } from "@/lib/dsa-lessons";
import { getTeacherShow } from "@/lib/teacher-shows";
import { TeacherShow } from "@/components/TeacherShow";

export default async function DsaTopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic: topicId } = await params;
  const topic = getTopic(topicId);
  const lesson = getDsaTopicLesson(topicId);
  if (!topic || !lesson) notFound();
  const show = lesson.showId ? getTeacherShow(lesson.showId) : null;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <Link href="/learn" className="text-sm text-[var(--accent)] underline">
          ← Learn hub
        </Link>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl">{lesson.title}</h1>
        <p className="mt-3 text-lg text-[var(--muted)]">{lesson.goal}</p>
      </header>

      {show && <TeacherShow script={show} />}

      <section className="space-y-2">
        <h2 className="font-[family-name:var(--font-display)] text-xl">When to use this</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--muted)]">
          {lesson.whenToUse.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-[family-name:var(--font-display)] text-xl">C++ template</h2>
        <pre className="overflow-x-auto rounded-lg border border-[var(--line)] bg-[#0a0e13] p-4 font-mono text-xs text-[var(--accent-2)]">
          <code>{lesson.templateCpp}</code>
        </pre>
      </section>

      <section className="space-y-2">
        <h2 className="font-[family-name:var(--font-display)] text-xl">Dry run</h2>
        <pre className="whitespace-pre-wrap rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4 text-sm text-[var(--muted)]">
          {lesson.dryRun}
        </pre>
      </section>

      <section className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--accent)]">Pitfalls</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--muted)]">
          {lesson.pitfalls.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-[var(--accent-2)]/30 bg-[var(--panel)] p-5">
        <h2 className="font-[family-name:var(--font-display)] text-xl">Say this in the interview</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">{lesson.interviewSay}</p>
      </section>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl">
          Problems in this topic ({topic.problemIds.length})
        </h2>
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
                  className="flex items-center justify-between rounded-md border border-[var(--line)] px-4 py-3 text-sm hover:bg-[var(--chip)]"
                >
                  <span>{p.title}</span>
                  <span className="text-[var(--muted)]">{p.difficulty}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
