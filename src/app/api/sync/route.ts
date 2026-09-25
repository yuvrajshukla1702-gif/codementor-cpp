import { NextResponse } from "next/server";
import { syncPlatforms } from "@/lib/platform-sync";

export async function POST() {
  const result = await syncPlatforms();
  return NextResponse.json({ ok: result.errors.length === 0, ...result });
}
