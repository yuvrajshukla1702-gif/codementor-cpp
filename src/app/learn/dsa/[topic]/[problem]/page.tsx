import Link from "next/link";
import { notFound } from "next/navigation";
import { getProblem, getTopic } from "@/lib/curriculum";
import { getDsaTopicLesson } from "@/lib/dsa-lessons";
import { buildPracticeBundle } from "@/lib/practice-bundle";
import { PracticeStudio } from "@/components/PracticeStudio";

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

  return (
    <div className="space-y-6">
      <header className="max-w-4xl">
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/learn" className="text-[var(--accent)] underline">
            Learn
          </Link>
          <span className="text-[var(--muted)]">/</span>
          <Link href={`/learn/dsa/${topicId}`} className="text-[var(--accent)] underline">
            {topic.title}
          </Link>
        </div>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl md:text-4xl">{problem.title}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Read the lesson → understand the pattern → then code. Tutor works offline (built-in teacher); optional
          Cursor/Gemini keys upgrade chat quality.
        </p>
      </header>

      {topicLesson && (
        <details className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4">
          <summary className="cursor-pointer font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
            Topic refresher: {topicLesson.title}
          </summary>
          <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
            <p>{topicLesson.goal}</p>
            <pre className="overflow-x-auto rounded-lg bg-[#0a0e13] p-3 font-mono text-xs text-[var(--accent-2)]">
              {topicLesson.templateCpp}
            </pre>
          </div>
        </details>
      )}

      <PracticeStudio key={problem.id} problem={problem} bundle={bundle} defaultTab="teach" />
    </div>
  );
}
