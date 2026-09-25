import { notFound } from "next/navigation";
import { getProblem } from "@/lib/curriculum";
import { buildPracticeBundle } from "@/lib/practice-bundle";
import { PracticeStudio } from "@/components/PracticeStudio";

export default async function PracticeProblemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const problem = getProblem(id);
  if (!problem) notFound();
  const bundle = buildPracticeBundle(problem);
  return (
    <div className="-mx-3 -my-3 h-[calc(100vh-3rem)] p-2">
      <PracticeStudio key={problem.id} problem={problem} bundle={bundle} defaultTab="teach" />
    </div>
  );
}
