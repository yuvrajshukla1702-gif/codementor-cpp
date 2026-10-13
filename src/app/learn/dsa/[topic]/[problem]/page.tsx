import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProblem, getTopic } from "@/lib/curriculum";
import { getDsaTopicLesson } from "@/lib/dsa-lessons";
import { buildPracticeBundle } from "@/lib/practice-bundle";
import { buildStudioNav } from "@/lib/problem-nav";
import { PracticeStudio } from "@/components/PracticeStudio";
import { Icon } from "@/components/ui/icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string; problem: string }>;
}): Promise<Metadata> {
  const { problem } = await params;
  return { title: getProblem(problem)?.title ?? "Problem" };
}

export default async function DsaProblemLearnPage({
  params,
}: {
  params: Promise<{ topic: string; problem: string }>;
}) {
  const { topic: topicId, problem: problemId } = await params;
  const topic = getTopic(topicId);
  const problem = getProblem(problemId);
  if (!topic || !problem || problem.topic !== topicId) notFound();
  const topicLesson = getDsaTopicLesson(topicId);
  const bundle = buildPracticeBundle(problem);
  const nav = buildStudioNav(problem);

  return (
    <div className="space-y-5">
      <header className="mx-auto max-w-5xl px-1 pt-3 sm:px-3">
        <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
          <Link href="/learn" className="transition-colors hover:text-[var(--accent)]">
            Learn
          </Link>
          <Icon name="chevronRight" size={13} className="text-[var(--faint)]" />
          <Link href={`/learn/dsa/${topicId}`} className="transition-colors hover:text-[var(--accent)]">
            {topic.title}
          </Link>
        </div>
        <h1 className="mt-3 font-display text-3xl tracking-[-0.04em] md:text-4xl">{problem.title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--muted)]">
          Read the lesson → understand the pattern → then code. Tutor works offline (built-in teacher); optional
          Cursor/Gemini keys upgrade chat quality.
        </p>
      </header>

      {topicLesson && (
        <details className="card mx-auto max-w-5xl p-4">
          <summary className="cursor-pointer font-display text-lg text-[var(--ink)]">
            Topic refresher: {topicLesson.title}
          </summary>
          <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
            <p>{topicLesson.goal}</p>
            <pre className="overflow-x-auto rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 text-[12.5px] leading-relaxed text-[#d7e0ee]">
              {topicLesson.templateCpp}
            </pre>
          </div>
        </details>
      )}

      <div className="h-[82dvh] min-h-[640px]">
        <PracticeStudio key={problem.id} problem={problem} bundle={bundle} nav={nav} defaultTab="teach" />
      </div>
    </div>
  );
}
