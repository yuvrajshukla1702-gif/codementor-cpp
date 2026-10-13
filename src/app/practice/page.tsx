import type { Metadata } from "next";
import { ProblemBrowser, type BrowserRow, type BrowserTopic } from "@/components/ProblemBrowser";
import { curriculum } from "@/lib/curriculum";

export const metadata: Metadata = { title: "Problems" };

export default async function PracticeIndex({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const sp = await searchParams;
  const topicTitle = new Map(curriculum.topics.map((t) => [t.id, t.title]));

  const rows: BrowserRow[] = Object.values(curriculum.problems).map((p) => ({
    id: p.id,
    title: p.title,
    difficulty: p.difficulty,
    topic: p.topic,
    topicTitle: topicTitle.get(p.topic) ?? p.topic,
  }));

  const topics: BrowserTopic[] = [...curriculum.topics]
    .sort((a, b) => a.order - b.order)
    .map((t) => ({ id: t.id, title: t.title, blurb: t.blurb, problemIds: t.problemIds }));

  return <ProblemBrowser rows={rows} topics={topics} initialTopic={sp.topic} />;
}
