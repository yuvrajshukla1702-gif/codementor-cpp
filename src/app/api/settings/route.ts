import { NextResponse } from "next/server";
import { ensureSettings, prisma } from "@/lib/db";
import { detectTutorMode } from "@/lib/gemini";

export async function GET() {
  const s = await ensureSettings();
  const gemini = Boolean((s.geminiApiKey || process.env.GEMINI_API_KEY || "").trim());
  const cursor = Boolean((s.cursorApiKey || process.env.CURSOR_API_KEY || "").trim());
  const tutorMode = await detectTutorMode(s);
  return NextResponse.json({
    leetcodeUsername: s.leetcodeUsername,
    hackerrankUsername: s.hackerrankUsername || "yuvrajshukla1702",
    tutorTone: s.tutorTone,
    hasGeminiKey: gemini,
    hasCursorKey: cursor,
    hasLcSession: Boolean(s.leetcodeSession),
    hasOllama: tutorMode === "ollama",
    tutorMode,
    ollamaModel: process.env.OLLAMA_MODEL || "qwen2.5:7b",
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  await ensureSettings();
  const data: Record<string, string | undefined> = {
    leetcodeUsername: body.leetcodeUsername ?? undefined,
    hackerrankUsername: body.hackerrankUsername ?? undefined,
    tutorTone: body.tutorTone ?? undefined,
  };
  if (body.geminiApiKey !== undefined && String(body.geminiApiKey).trim() !== "") {
    data.geminiApiKey = String(body.geminiApiKey);
  }
  if (body.cursorApiKey !== undefined && String(body.cursorApiKey).trim() !== "") {
    data.cursorApiKey = String(body.cursorApiKey);
  }
  if (body.leetcodeSession !== undefined) {
    data.leetcodeSession = String(body.leetcodeSession);
  }
  const updated = await prisma.settings.update({
    where: { id: 1 },
    data,
  });
  return NextResponse.json({ ok: true, id: updated.id });
}
