import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function ensureSettings() {
  const existing = await prisma.settings.findUnique({ where: { id: 1 } });
  const envGemini = (process.env.GEMINI_API_KEY || "").trim();
  const envCursor = (process.env.CURSOR_API_KEY || "").trim();
  const envUser = (process.env.LEETCODE_USERNAME || "").trim();

  if (!existing) {
    return prisma.settings.create({
      data: {
        id: 1,
        leetcodeUsername: envUser || "sM1BAu3vUo",
        geminiApiKey: envGemini,
        cursorApiKey: envCursor,
        hackerrankUsername: "yuvrajshukla1702",
      },
    });
  }

  // Keep Settings in sync with .env so you don't paste keys in the UI.
  const patch: {
    geminiApiKey?: string;
    cursorApiKey?: string;
    leetcodeUsername?: string;
  } = {};
  if (envGemini && !existing.geminiApiKey?.trim()) patch.geminiApiKey = envGemini;
  if (envCursor && !existing.cursorApiKey?.trim()) patch.cursorApiKey = envCursor;
  // Prefer non-empty env over empty defaults; also refresh if env is set and DB still default-empty key
  if (envGemini && existing.geminiApiKey?.trim() !== envGemini) {
    // Only overwrite when DB empty or env is the source of truth for local-dev
    if (!existing.geminiApiKey?.trim()) patch.geminiApiKey = envGemini;
  }
  if (envCursor && !existing.cursorApiKey?.trim()) patch.cursorApiKey = envCursor;
  if (envUser && !existing.leetcodeUsername) patch.leetcodeUsername = envUser;

  if (Object.keys(patch).length) {
    return prisma.settings.update({ where: { id: 1 }, data: patch });
  }
  return existing;
}
