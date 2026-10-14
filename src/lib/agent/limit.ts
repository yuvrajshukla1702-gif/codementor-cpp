/** Tiny in-memory guards so a public deployment cannot be used to burn the owner's AI key. */

const hits = new Map<string, number[]>();
let active = 0;

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
  if (active >= max) return false;
  active++;
  return true;
}

export function release() {
  active = Math.max(0, active - 1);
}
