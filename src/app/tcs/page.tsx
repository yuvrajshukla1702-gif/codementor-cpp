import { bankBySection } from "@/lib/interview-bank";
import { ShortAnswerCard } from "@/components/ShortAnswerCard";

export default function TcsPage() {
  const aptitude = bankBySection("tcs-aptitude");
  const coding = bankBySection("tcs-coding");
  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-[family-name:var(--font-display)] text-4xl">TCS NQT</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Aptitude patterns + coding discussion prompts typical of NQT / service-company first rounds. Pair this
          with DSA Practice three times a week.
        </p>
      </header>
      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--accent)]">Aptitude</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {aptitude.map((q) => (
            <ShortAnswerCard key={q.id} q={q} />
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--accent)]">Coding prompts</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {coding.map((q) => (
            <ShortAnswerCard key={q.id} q={q} />
          ))}
        </div>
      </section>
    </div>
  );
}
