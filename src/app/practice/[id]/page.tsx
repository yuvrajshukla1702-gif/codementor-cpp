import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProblem } from "@/lib/curriculum";
import { buildPracticeBundle } from "@/lib/practice-bundle";
import { buildStudioNav } from "@/lib/problem-nav";
import { PracticeStudio } from "@/components/PracticeStudio";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const problem = getProblem(id);
  return { title: problem ? problem.title : "Problem" };
}

export default async function PracticeProblemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const problem = getProblem(id);
  if (!problem) notFound();
  const bundle = buildPracticeBundle(problem);
  const nav = buildStudioNav(problem);

  return (
    <div className="-mx-3 -my-3 h-[calc(100dvh-3.5rem)] min-h-[560px] p-2">
      <PracticeStudio key={problem.id} problem={problem} bundle={bundle} nav={nav} defaultTab="teach" />
    </div>
  );
}
