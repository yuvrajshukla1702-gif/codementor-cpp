import { config } from "dotenv";
config({ path: ".env" });
import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();
const envG = (process.env.GEMINI_API_KEY || "").trim();
const envC = (process.env.CURSOR_API_KEY || "").trim();

const s = await p.settings.upsert({
  where: { id: 1 },
  create: {
    id: 1,
    leetcodeUsername: process.env.LEETCODE_USERNAME || "sM1BAu3vUo",
    geminiApiKey: envG,
    cursorApiKey: envC,
  },
  update: {
    ...(envG ? { geminiApiKey: envG } : {}),
    ...(envC ? { cursorApiKey: envC } : {}),
  },
});

// Probe Gemini without printing the key
let geminiOk = false;
let geminiStatus = 0;
if (envG) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(envG)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: "Reply with exactly: OK" }] }],
      generationConfig: { maxOutputTokens: 8 },
    }),
  });
  geminiStatus = res.status;
  geminiOk = res.ok;
}

console.log(
  JSON.stringify({
    synced_gemini: Boolean(s.geminiApiKey),
    synced_cursor: Boolean(s.cursorApiKey),
    gemini_from_env: Boolean(envG),
    cursor_from_env: Boolean(envC),
    gemini_probe_ok: geminiOk,
    gemini_http: geminiStatus,
  }),
);

await p.$disconnect();
