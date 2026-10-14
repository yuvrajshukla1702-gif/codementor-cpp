import type { Metadata } from "next";
import AskClient from "@/components/agent/AskClient";

export const metadata: Metadata = {
  title: "Ask AI",
  description: "Ask any programming question and get a whiteboard video, a dry run, an explanation and tested C++.",
};

export default async function AskPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const sp = await searchParams;
  const q = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  return <AskClient initialQ={(q ?? "").slice(0, 6000)} />;
}
