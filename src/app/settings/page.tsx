"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [leetcodeUsername, setUser] = useState("sM1BAu3vUo");
  const [hackerrankUsername, setHrUser] = useState("yuvrajshukla1702");
  const [geminiApiKey, setKey] = useState("");
  const [cursorApiKey, setCursorKey] = useState("");
  const [leetcodeSession, setSession] = useState("");
  const [tutorTone, setTone] = useState("hinglish");
  const [status, setStatus] = useState("");
  const [meta, setMeta] = useState<{
    hasGeminiKey?: boolean;
    hasCursorKey?: boolean;
    hasLcSession?: boolean;
    hasOllama?: boolean;
    tutorMode?: string;
    ollamaModel?: string;
  }>({});

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((j) => {
        setUser(j.leetcodeUsername || "sM1BAu3vUo");
        setHrUser(j.hackerrankUsername || "yuvrajshukla1702");
        setTone(j.tutorTone || "hinglish");
        setMeta(j);
      })
      .catch(() => undefined);
  }, []);

  async function save() {
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leetcodeUsername,
        hackerrankUsername,
        geminiApiKey: geminiApiKey || undefined,
        cursorApiKey: cursorApiKey || undefined,
        leetcodeSession: leetcodeSession || undefined,
        tutorTone,
      }),
    });
    if (res.ok) {
      setStatus("Saved.");
      setKey("");
      setCursorKey("");
      setSession("");
      const j = await fetch("/api/settings").then((r) => r.json());
      setMeta(j);
    } else setStatus("Save failed.");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="font-[family-name:var(--font-display)] text-4xl">Settings</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Rich tutor is wired automatically: <strong className="text-[var(--ink)]">local Ollama</strong> (already on
          this PC) → optional Gemini / Cursor keys if you add them later. No paid subscription required.
        </p>
        <p className="mt-2 text-sm text-[var(--accent-2)]">
          Active tutor:{" "}
          {meta.tutorMode === "ollama"
            ? `Local Ollama (${meta.ollamaModel || "qwen2.5:7b"})`
            : meta.tutorMode === "cursor"
              ? "Cursor"
              : meta.tutorMode === "gemini"
                ? "Gemini"
                : "Built-in"}
        </p>
      </header>

      <label className="block space-y-1 text-sm">
        <span>LeetCode username</span>
        <input
          className="w-full rounded-md border border-[var(--line)] bg-[#0f1419] px-3 py-2"
          value={leetcodeUsername}
          onChange={(e) => setUser(e.target.value)}
        />
      </label>

      <label className="block space-y-1 text-sm">
        <span>HackerRank username</span>
        <input
          className="w-full rounded-md border border-[var(--line)] bg-[#0f1419] px-3 py-2"
          value={hackerrankUsername}
          onChange={(e) => setHrUser(e.target.value)}
        />
      </label>

      <label className="block space-y-1 text-sm">
        <span>
          Cursor API key {meta.hasCursorKey ? "(saved / env)" : "(optional — Dashboard → API keys)"}
        </span>
        <input
          type="password"
          className="w-full rounded-md border border-[var(--line)] bg-[#0f1419] px-3 py-2"
          value={cursorApiKey}
          onChange={(e) => setCursorKey(e.target.value)}
          placeholder="Paste CURSOR_API_KEY to update"
        />
      </label>

      <label className="block space-y-1 text-sm">
        <span>
          Gemini API key {meta.hasGeminiKey ? "(saved)" : "(optional — free AI Studio key is enough)"}
        </span>
        <input
          type="password"
          className="w-full rounded-md border border-[var(--line)] bg-[#0f1419] px-3 py-2"
          value={geminiApiKey}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Paste to update"
        />
      </label>

      <label className="block space-y-1 text-sm">
        <span>
          LEETCODE_SESSION cookie {meta.hasLcSession ? "(saved)" : "(optional — for Submit to LeetCode)"}
        </span>
        <textarea
          className="min-h-24 w-full rounded-md border border-[var(--line)] bg-[#0f1419] px-3 py-2 font-mono text-xs"
          value={leetcodeSession}
          onChange={(e) => setSession(e.target.value)}
          placeholder="Browser DevTools → Application → Cookies → LEETCODE_SESSION"
        />
      </label>

      <label className="block space-y-1 text-sm">
        <span>Tutor tone</span>
        <select
          className="w-full rounded-md border border-[var(--line)] bg-[#0f1419] px-3 py-2"
          value={tutorTone}
          onChange={(e) => setTone(e.target.value)}
        >
          <option value="hinglish">Hinglish (YouTube teacher)</option>
          <option value="english">English</option>
        </select>
      </label>

      <button onClick={save} className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[#1a1208]">
        Save settings
      </button>
      {status && <p className="text-sm text-[var(--accent-2)]">{status}</p>}
    </div>
  );
}
