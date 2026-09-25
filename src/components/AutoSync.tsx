"use client";

import { useEffect } from "react";

/** Pull LeetCode + HackerRank in the background whenever the app opens. */
export function AutoSync() {
  useEffect(() => {
    const key = "cm-last-platform-sync";
    const last = Number(window.localStorage.getItem(key) || 0);
    if (Date.now() - last < 10 * 60_000) return;
    window.localStorage.setItem(key, String(Date.now()));
    fetch("/api/sync", { method: "POST" }).catch(() => undefined);
  }, []);
  return null;
}
