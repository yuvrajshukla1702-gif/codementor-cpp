import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTeacherShow } from "@/lib/teacher-shows";
import { TeacherShow } from "@/components/TeacherShow";
import { Icon } from "@/components/ui/icons";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: getTeacherShow(id)?.title ?? "Animated lesson" };
}

export default async function SingleShowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const script = getTeacherShow(id);
  if (!script) notFound();
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-1 py-6 sm:px-3 sm:py-8">
      <Link
        href="/learn/classroom"
        className="inline-flex items-center gap-1 text-sm text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
      >
        <Icon name="chevronLeft" size={14} /> All animated lessons
      </Link>
      <TeacherShow script={script} />
    </div>
  );
}
