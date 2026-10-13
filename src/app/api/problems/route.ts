import { NextResponse } from "next/server";
import { curriculum } from "@/lib/curriculum";

export const dynamic = "force-static";

/** Tiny index (no lessons/tests) used by the Ctrl K palette. */
export function GET() {
  const topicTitle = new Map(curriculum.topics.map((t) => [t.id, t.title]));
  const rows = Object.values(curriculum.problems).map((p) => ({
    id: p.id,
    title: p.title,
    difficulty: p.difficulty,
    topic: p.topic,
    topicTitle: topicTitle.get(p.topic) ?? p.topic,
  }));
  return NextResponse.json(rows, {
    headers: { "Cache-Control": "public, max-age=600, s-maxage=86400" },
  });
}
