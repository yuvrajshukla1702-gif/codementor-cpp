import { NextResponse } from "next/server";
import { synthesize } from "@/lib/edge-tts";
import { prepareSpeech, ratePercent } from "@/lib/pronounce";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (body.stop) {
    return NextResponse.json({ stopped: true });
  }

  const raw = String(body.text || "")
    .replace(/[\u0000-\u001f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 720);
  if (!raw) return NextResponse.json({ error: "Nothing to say" }, { status: 400 });

  const lang = String(body.lang || "hinglish");
  const speed = Number(body.speed) || 1;
  const prepared = prepareSpeech(raw, lang);
  const rate = body.ratePercent ? String(body.ratePercent) : ratePercent(speed);

  try {
    const audio = await synthesize(prepared.text, prepared.voice, rate);
    return new NextResponse(new Uint8Array(audio), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "private, max-age=3600",
        "X-Voice": prepared.voice,
      },
    });
  } catch (err) {
    console.error("[speak]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Voice unavailable" }, { status: 503 });
  }
}
