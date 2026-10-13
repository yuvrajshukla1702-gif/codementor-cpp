import type { Metadata } from "next";
import Link from "next/link";
import { allTeacherShows, type ShowKind } from "@/lib/teacher-shows";
import { Icon } from "@/components/ui/icons";
import { PageFrame, PageHeader } from "@/components/ui/kit";

export const metadata: Metadata = { title: "Animated classroom" };

const KIND: Record<ShowKind, string> = {
  "hash-map": "Hash map",
  "two-pointers": "Two pointers",
  "sliding-window": "Sliding window",
  "array-scan": "Array scan",
  kadane: "Kadane",
};

export default function ClassroomPage() {
  const shows = allTeacherShows();
  return (
    <PageFrame>
      <div>
        <Link
          href="/learn"
          className="mb-5 inline-flex items-center gap-1 text-sm text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
        >
          <Icon name="chevronLeft" size={14} /> Learn
        </Link>
        <PageHeader eyebrow="Better than passive video" title="Animated" accent="classroom">
          Step-by-step animated dry-runs with Hinglish narration, play/pause and an instant jump into practice. Pause
          anytime — a video can&rsquo;t quiz your brain mid-lesson like this. {shows.length} lessons.
        </PageHeader>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shows.map((s) => (
          <Link
            key={s.id}
            id={s.id}
            href={`/learn/classroom/${s.id}`}
            className="card card-hover group flex scroll-mt-24 flex-col justify-between gap-6 p-5"
          >
            <span className="flex items-center justify-between gap-3">
              <span className="chip">{KIND[s.kind] ?? s.kind}</span>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--accent)] text-[var(--accent-ink)] transition-transform group-hover:scale-105">
                <Icon name="play" size={13} fill="currentColor" strokeWidth={1.2} className="translate-x-px" />
              </span>
            </span>
            <span>
              <span className="block font-display text-lg leading-snug">{s.title}</span>
              <span className="mt-1 block text-sm leading-relaxed text-[var(--muted)]">{s.subtitle}</span>
            </span>
            <span className="flex items-center gap-2 text-xs text-[var(--faint)]">
              <Icon name="layers" size={12} /> {s.steps.length} beats
              {s.durationHint && (
                <>
                  <span aria-hidden>·</span>
                  <Icon name="timer" size={12} /> {s.durationHint}
                </>
              )}
            </span>
          </Link>
        ))}
      </div>

      <p className="text-sm text-[var(--muted)]">
        Prefer reading?{" "}
        <Link href="/learn/cpp" className="text-[var(--accent)] underline-offset-4 hover:underline">
          C++ Fundamentals
        </Link>{" "}
        ·{" "}
        <Link href="/learn" className="text-[var(--accent)] underline-offset-4 hover:underline">
          DSA lessons
        </Link>
      </p>
    </PageFrame>
  );
}
