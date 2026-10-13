"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icons";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-[var(--ink)]">
        {label}
        {hint && <span className="ml-2 text-xs font-normal text-[var(--muted)]">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

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

  const tutorLabel =
    meta.tutorMode === "ollama"
      ? `Local Ollama (${meta.ollamaModel || "qwen2.5:7b"})`
      : meta.tutorMode === "cursor"
        ? "Cursor"
        : meta.tutorMode === "gemini"
          ? "Gemini"
          : "Built-in";

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-1 py-6 sm:px-3 sm:py-8">
      <header>
        <p className="eyebrow">Settings</p>
        <h1 className="mt-1 font-display text-4xl tracking-[-0.04em]">Make it yours</h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          Rich tutor is wired automatically: <strong className="text-[var(--ink)]">local Ollama</strong> (already on this
          PC) → optional Gemini / Cursor keys if you add them later. No paid subscription required.
        </p>
        <p className="chip chip-brand mt-3 !h-7">
          <Icon name="sparkles" size={12} /> Active tutor: {tutorLabel}
        </p>
      </header>

      <div className="card space-y-5 p-5 sm:p-6">
        <Field label="LeetCode username">
          <input className="input" value={leetcodeUsername} onChange={(e) => setUser(e.target.value)} />
        </Field>

        <Field label="HackerRank username">
          <input className="input" value={hackerrankUsername} onChange={(e) => setHrUser(e.target.value)} />
        </Field>

        <Field
          label="Cursor API key"
          hint={meta.hasCursorKey ? "saved / env" : "optional — Dashboard → API keys"}
        >
          <input
            type="password"
            className="input"
            value={cursorApiKey}
            onChange={(e) => setCursorKey(e.target.value)}
            placeholder="Paste CURSOR_API_KEY to update"
          />
        </Field>

        <Field
          label="Gemini API key"
          hint={meta.hasGeminiKey ? "saved" : "optional — free AI Studio key is enough"}
        >
          <input
            type="password"
            className="input"
            value={geminiApiKey}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Paste to update"
          />
        </Field>

        <Field
          label="LEETCODE_SESSION cookie"
          hint={meta.hasLcSession ? "saved" : "optional — for Submit to LeetCode"}
        >
          <textarea
            className="input min-h-24 font-mono text-xs"
            value={leetcodeSession}
            onChange={(e) => setSession(e.target.value)}
            placeholder="Browser DevTools → Application → Cookies → LEETCODE_SESSION"
          />
        </Field>

        <Field label="Tutor tone">
          <select className="input" value={tutorTone} onChange={(e) => setTone(e.target.value)}>
            <option value="hinglish">Hinglish (YouTube teacher)</option>
            <option value="english">English</option>
          </select>
        </Field>

        <div className="flex items-center gap-3 pt-1">
          <button onClick={save} className="btn btn-primary">
            Save settings
          </button>
          {status && (
            <p
              className={`cm-fade inline-flex items-center gap-1.5 text-sm ${
                status === "Saved." ? "text-[var(--accent)]" : "text-[var(--bad)]"
              }`}
            >
              <Icon name={status === "Saved." ? "check" : "x"} size={14} strokeWidth={2.6} /> {status}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
