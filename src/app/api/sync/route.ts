import { NextResponse } from "next/server";
import { syncPlatforms } from "@/lib/platform-sync";

export async function POST(req: Request) {
  const force = new URL(req.url).searchParams.get("force") === "1";
  const result = await syncPlatforms({ force });
  return NextResponse.json({ ok: result.errors.length === 0, ...result });
}
