import { createHash, randomUUID } from "node:crypto";
import { toSsml } from "@/lib/pronounce";

const TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
const CHROMIUM = "143.0.3650.75";
const cache = new Map<string, Buffer>();

function secMsGec() {
  const winEpoch = 11644473600n;
  let ticks = (BigInt(Math.floor(Date.now() / 1000)) + winEpoch) * 10000000n;
  ticks -= ticks % 3000000000n;
  return createHash("sha256").update(`${ticks}${TOKEN}`).digest("hex").toUpperCase();
}

export async function synthesize(text: string, voice: string, rate = "+0%"): Promise<Buffer> {
  const key = `${voice}|${rate}|${text}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const id = randomUUID().replace(/-/g, "");
  const url =
    "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1" +
    `?TrustedClientToken=${TOKEN}&ConnectionId=${id}&Sec-MS-GEC=${secMsGec()}&Sec-MS-GEC-Version=1-${CHROMIUM}`;

  const ws = new WebSocket(url, {
    headers: {
      "User-Agent": `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${CHROMIUM} Safari/537.36 Edg/${CHROMIUM}`,
      Origin: "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold",
      Pragma: "no-cache",
      "Cache-Control": "no-cache",
    },
  });

  const audio = await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    let settled = false;
    const timer = setTimeout(() => finish(new Error("Voice timed out")), 28000);

    function finish(err?: Error) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        ws.close();
      } catch {
        /* already closed */
      }
      if (err && chunks.length === 0) reject(err);
      else resolve(Buffer.concat(chunks));
    }

    ws.addEventListener("error", () => finish(new Error("Voice connection failed")));
    ws.addEventListener("open", () => {
      const date = new Date().toUTCString().replace("GMT", "GMT+0000 (Coordinated Universal Time)");
      ws.send(
        `X-Timestamp:${date}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n` +
          JSON.stringify({
            context: {
              synthesis: {
                audio: {
                  metadataoptions: { sentenceBoundaryEnabled: "false", wordBoundaryEnabled: "false" },
                  outputFormat: "audio-24khz-48kbitrate-mono-mp3",
                },
              },
            },
          })
      );
      const ssml = toSsml(text, voice, rate);
      ws.send(
        `X-RequestId:${id}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:${date}\r\nPath:ssml\r\n\r\n${ssml}`
      );
    });

    ws.addEventListener("message", async (ev) => {
      const data = ev.data;
      let buf: Buffer;
      if (typeof data === "string") buf = Buffer.from(data);
      else if (data instanceof ArrayBuffer) buf = Buffer.from(data);
      else if (typeof Blob !== "undefined" && data instanceof Blob) buf = Buffer.from(await data.arrayBuffer());
      else buf = Buffer.from(data as Uint8Array);

      if (typeof data !== "string" && buf.length >= 2) {
        const headerLen = buf.readUInt16BE(0);
        const header = buf.subarray(2, 2 + headerLen).toString("utf8");
        if (header.includes("Path:audio")) {
          const piece = buf.subarray(2 + headerLen);
          if (piece.length) chunks.push(piece);
        }
        return;
      }
      if (buf.toString("utf8").includes("Path:turn.end")) finish();
    });
  });

  if (audio.length < 200) throw new Error("Voice returned empty audio");
  if (cache.size > 100) {
    const first = cache.keys().next().value;
    if (first) cache.delete(first);
  }
  cache.set(key, audio);
  return audio;
}
