"use client";

import { useState } from "react";
import type { BankQuestion } from "@/lib/interview-bank";

export function ShortAnswerCard({ q }: { q: BankQuestion }) {
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState("");
  const [mcqResult, setMcqResult] = useState("");

  async function grade() {
    setBusy(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: q.id, answer }),
      });
      const data = await res.json();
      setFeedback(data.feedback || "");
      setScore(data.score ?? null);
    } finally {
      setBusy(false);
    }
  }

  function checkMcq() {
    if (!q.answer) return;
    const ok = picked === q.answer;
    setMcqResult(ok ? `Correct. ${q.explanation || ""}` : `Not quite. Answer: ${q.answer}. ${q.explanation || ""}`);
  }

  return (
    <article className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4">
      <h3 className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">{q.title}</h3>
      <p className="mt-2 text-sm text-[var(--muted)]">{q.prompt}</p>
      {q.kind === "mcq" && q.options && (
        <div className="mt-3 space-y-2">
          {q.options.map((o) => (
            <label key={o} className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="radio" name={q.id} checked={picked === o} onChange={() => setPicked(o)} />
              {o}
            </label>
          ))}
          <button onClick={checkMcq} className="mt-2 rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm text-[#1a1208]">
            Check
          </button>
          {mcqResult && <p className="text-sm text-[var(--ink)]">{mcqResult}</p>}
        </div>
      )}
      {q.kind === "short" && (
        <div className="mt-3 space-y-2">
          <textarea
            className="min-h-28 w-full rounded-md border border-[var(--line)] bg-[#0f1419] p-3 text-sm text-[var(--ink)]"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Write your answer…"
          />
          <button
            disabled={busy || !answer.trim()}
            onClick={grade}
            className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm text-[#1a1208] disabled:opacity-50"
          >
            {busy ? "Grading…" : "Get teacher feedback"}
          </button>
          {score !== null && <p className="text-sm text-[var(--accent)]">Score: {score}/10</p>}
          {feedback && <pre className="whitespace-pre-wrap text-sm text-[var(--muted)]">{feedback}</pre>}
        </div>
      )}
    </article>
  );
}
