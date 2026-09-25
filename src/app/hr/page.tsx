import { bankBySection } from "@/lib/interview-bank";
import { ShortAnswerCard } from "@/components/ShortAnswerCard";

export default function HrPage() {
  const qs = bankBySection("hr");
  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-[family-name:var(--font-display)] text-4xl">HR Desk</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Behavioral answers using STAR. Practice until your stories sound natural, not memorized.
        </p>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        {qs.map((q) => (
          <ShortAnswerCard key={q.id} q={q} />
        ))}
      </div>
    </div>
  );
}
