import { resolveLlm } from "@/lib/agent/llm";

const GEMINI = (process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta")
  .trim()
  .replace(/\/+$/, "");

const TTS_MODELS = [
  "gemini-3.8-flash-tts",
  "gemini-3.8-flash-lite-tts",
  "gemini-3.1-flash-tts-preview",
  "gemini-2.5-flash-preview-tts",
];

/** Warm classroom teacher. Same voice across English, Hindi, and Hinglish. */
const VOICE_BY_LANG: Record<string, string> = {
  english: "Sulafat",
  hinglish: "Achird",
  hindi: "Achird",
};

function styleFor(lang: string, speed: number) {
  const pace =
    speed >= 1.8
      ? "a little quicker"
      : speed >= 1.5
        ? "a natural talking pace"
        : speed >= 1.25
          ? "a calm teaching pace"
          : "a clear, slightly slow teaching pace";
  if (lang === "hindi") {
    return `Warm Indian classroom teacher speaking natural Hindi. ${pace}. Maths and science words stay clear. Soft breaths between sentences.`;
  }
  if (lang === "hinglish") {
    return `Warm Indian classroom teacher speaking natural Hinglish. Hindi words clear, English maths and code words clear. ${pace}. Soft breaths between sentences.`;
  }
  return `Warm Indian classroom teacher speaking natural Indian English. ${pace}. Say maths and science terms the way a teacher says them. Soft breaths between sentences.`;
}

type GeminiAudioPart = {
  inlineData?: { data?: string; mimeType?: string };
  inline_data?: { data?: string; mime_type?: string };
};

function wavFromPcm(pcm: Buffer, sampleRate = 24000) {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

function audioFromResponse(data: {
  candidates?: Array<{ content?: { parts?: GeminiAudioPart[] } }>;
}): { buffer: Buffer; mime: string } | null {
  const part = data.candidates?.[0]?.content?.parts?.[0];
  if (!part) return null;
  const raw = part.inlineData?.data || part.inline_data?.data;
  const mime = part.inlineData?.mimeType || part.inline_data?.mime_type || "audio/wav";
  if (!raw) return null;
  let buffer = Buffer.from(raw, "base64");
  if (buffer.length < 200) return null;
  if (buffer.toString("ascii", 0, 4) === "RIFF") return { buffer, mime: "audio/wav" };
  const rateMatch = /rate=(\d+)/i.exec(mime);
  const sampleRate = rateMatch ? Number(rateMatch[1]) : 24000;
  if (/l16|pcm|linear/i.test(mime) || buffer.toString("ascii", 0, 4) !== "RIFF") {
    buffer = wavFromPcm(buffer, sampleRate);
    return { buffer, mime: "audio/wav" };
  }
  return { buffer, mime: mime.startsWith("audio/") ? mime.split(";")[0]!.trim() : "audio/wav" };
}

async function callModel(
  apiKey: string,
  model: string,
  text: string,
  voice: string,
  style: string,
  signal?: AbortSignal
) {
  const url = `${GEMINI}/models/${encodeURIComponent(model)}:generateContent`;
  const body = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text,
            speechMetadata: { style },
          },
        ],
      },
    ],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: { voice },
      },
    },
  };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    const err = new Error(`Gemini TTS ${res.status}: ${errText.slice(0, 180)}`);
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }
  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: GeminiAudioPart[] } }>;
  };
  const audio = audioFromResponse(data);
  if (!audio) throw new Error("Gemini TTS returned empty audio");
  return audio;
}

export async function synthesizeGemini(
  text: string,
  lang: string,
  speed = 1,
  signal?: AbortSignal
): Promise<{ buffer: Buffer; mime: string; voice: string; model: string } | null> {
  const llm = await resolveLlm();
  if (!llm || llm.kind !== "gemini") return null;

  const voice = VOICE_BY_LANG[lang] || VOICE_BY_LANG.hinglish;
  const style = styleFor(lang, speed);
  let lastStatus = 0;

  for (const model of TTS_MODELS) {
    try {
      const audio = await callModel(llm.apiKey, model, text, voice, style, signal);
      return { ...audio, voice: `gemini:${voice}`, model };
    } catch (err) {
      lastStatus = (err as Error & { status?: number }).status || 0;
      // Auth or hard model miss: stop. Quota: try the next TTS model.
      if (lastStatus === 401 || lastStatus === 403) return null;
      if (lastStatus === 404) continue;
      if (lastStatus === 429) continue;
      continue;
    }
  }
  return null;
}
