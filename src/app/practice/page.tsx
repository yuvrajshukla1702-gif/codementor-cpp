import Link from "next/link";
import { curriculum, getTopic } from "@/lib/curriculum";

function diffClass(d: string) {
  if (d === "Easy") return "diff-easy";
  if (d === "Medium") return "diff-medium";
  return "diff-hard";
}

export default async function PracticeIndex({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const sp = await searchParams;
  const topic = sp.topic ? getTopic(sp.topic) : null;
  const problems = topic
    ? topic.problemIds.map((id) => curriculum.problems[id]).filter(Boolean)
    : Object.values(curriculum.problems);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl">Problems</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {problems.length} problems{topic ? ` · ${topic.title}` : ""}
          </p>
        </div>
      </div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        <Link
          href="/practice"
          className={`shrink-0 rounded-full px-3 py-1 text-xs ${!topic ? "bg-[var(--chip)] text-[var(--ink)]" : "text-[var(--muted)] hover:text-[var(--ink)]"}`}
        >
          All
        </Link>
        {curriculum.topics.map((t) => (
          <Link
            key={t.id}
            href={`/practice?topic=${t.id}`}
            className={`shrink-0 rounded-full px-3 py-1 text-xs ${
              topic?.id === t.id ? "bg-[var(--chip)] text-[var(--ink)]" : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            {t.title}
          </Link>
        ))}
      </div>
      <div className="overflow-hidden rounded-lg border border-[var(--line)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--panel)] text-xs text-[var(--muted)]">
            <tr>
              <th className="px-4 py-2 font-medium">Title</th>
              <th className="px-4 py-2 font-medium">Topic</th>
              <th className="px-4 py-2 font-medium">Difficulty</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((p, i) => (
              <tr key={p.id} className={i % 2 ? "bg-[#222]" : "bg-[#1a1a1a]"}>
                <td className="px-4 py-2.5">
                  <Link href={`/practice/${p.id}`} className="hover:text-[var(--accent)]">
                    {p.title}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-[var(--muted)]">{p.topic}</td>
                <td className={`px-4 py-2.5 ${diffClass(p.difficulty)}`}>{p.difficulty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
