import { bankBySection } from "@/lib/interview-bank";
import { ShortAnswerCard } from "@/components/ShortAnswerCard";

const sections = [
  { id: "oops" as const, title: "OOPs (C++)" },
  { id: "dbms" as const, title: "DBMS" },
  { id: "os" as const, title: "Operating Systems" },
  { id: "cn" as const, title: "Computer Networks" },
];

export default function CorePage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-[family-name:var(--font-display)] text-4xl">Core CS</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Interviews are not only DSA. Write short answers; the tutor grades and strengthens your outline.
        </p>
      </header>
      {sections.map((s) => (
        <section key={s.id} className="space-y-3">
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--accent)]">{s.title}</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {bankBySection(s.id).map((q) => (
              <ShortAnswerCard key={q.id} q={q} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
