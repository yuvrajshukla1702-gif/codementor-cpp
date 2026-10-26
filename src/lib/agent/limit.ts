/** Tiny in-memory guards so a public deployment cannot be used to burn the owner's AI key. */

const hits = new Map<string, number[]>();
/** When each in-flight question started. A slot older than the lease is dropped, so a hung call cannot block the next one forever. */
const holders: number[] = [];
const LEASE_MS = 120_000;

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim() || "unknown";
  return req.headers.get("x-real-ip") || "local";
}

export function isLocal(ip: string): boolean {
  return ip === "local" || ip === "::1" || ip === "127.0.0.1" || ip === "::ffff:127.0.0.1";
}

/** Sliding window: at most `max` calls per `windowMs` for this key. */
export function allow(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (list.length >= max) {
    hits.set(key, list);
    return false;
  }
  list.push(now);
  hits.set(key, list);
  if (hits.size > 500) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  }
  return true;
}

export function acquire(max = 3): boolean {
  const now = Date.now();
  while (holders.length && now - holders[0] > LEASE_MS) holders.shift();
  if (holders.length >= max) return false;
  holders.push(now);
  return true;
}

export function release() {
  holders.shift();
}
