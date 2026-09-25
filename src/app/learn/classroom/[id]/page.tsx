import Link from "next/link";
import { notFound } from "next/navigation";
import { getTeacherShow } from "@/lib/teacher-shows";
import { TeacherShow } from "@/components/TeacherShow";

export default async function SingleShowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const script = getTeacherShow(id);
  if (!script) notFound();
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/learn/classroom" className="text-sm text-[var(--accent)] underline">
        ← All animated lessons
      </Link>
      <TeacherShow script={script} />
    </div>
  );
}
