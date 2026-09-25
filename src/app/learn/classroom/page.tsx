import Link from "next/link";
import { allTeacherShows } from "@/lib/teacher-shows";
import { TeacherShow } from "@/components/TeacherShow";

export default function ClassroomPage() {
  const shows = allTeacherShows();
  return (
    <div className="space-y-10">
      <header className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">Better than passive YouTube</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl md:text-5xl">Animated Classroom</h1>
        <p className="mt-3 text-[var(--muted)]">
          A hired-teacher vibe: step-by-step animated dry-runs with Hinglish narration, play/pause, and instant jump
          into practice. Pause anytime — YouTube can&apos;t quiz your brain mid-video like this.
        </p>
      </header>

      <div className="space-y-10">
        {shows.map((s) => (
          <div key={s.id} id={s.id} className="scroll-mt-24">
            <TeacherShow script={s} />
          </div>
        ))}
      </div>

      <p className="text-sm text-[var(--muted)]">
        More shows unlock as topics expand. Prefer reading?{" "}
        <Link href="/learn/cpp" className="text-[var(--accent)] underline">
          C++ Fundamentals
        </Link>{" "}
        ·{" "}
        <Link href="/learn" className="text-[var(--accent)] underline">
          DSA lessons
        </Link>
      </p>
    </div>
  );
}
