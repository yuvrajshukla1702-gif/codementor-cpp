import { escapeRawControls } from "./llm";

/**
 * Watches a JSON object being typed out token by token and reports each top-level member the
 * moment it is complete — so the UI can show the title and explanation while the code is still
 * being written. Feed it the whole text received so far (an empty string resets it).
 */
export function createMemberStreamer(onMember: (key: string, value: unknown) => void) {
  let seen = 0;
  let started = false;
  let depth = 0;
  let inStr = false;
  let esc = false;
  let memberStart = 0;
  const done = new Set<string>();

  const reset = () => {
    seen = 0;
    started = false;
    depth = 0;
    inStr = false;
    esc = false;
    memberStart = 0;
    done.clear();
  };

  const emit = (chunk: string) => {
    const body = chunk.trim();
    if (!body) return;
    try {
      const obj = JSON.parse(`{${escapeRawControls(body)}}`) as Record<string, unknown>;
      for (const [k, v] of Object.entries(obj)) {
        if (done.has(k)) continue;
        done.add(k);
        onMember(k, v);
      }
    } catch {
      /* incomplete or malformed member: the final validation decides */
    }
  };

  return {
    feed(acc: string) {
      if (acc.length < seen) reset();
      for (let i = seen; i < acc.length; i++) {
        const ch = acc[i];
        if (inStr) {
          if (esc) esc = false;
          else if (ch === "\\") esc = true;
          else if (ch === '"') inStr = false;
          continue;
        }
        if (!started) {
          if (ch === "{") {
            started = true;
            depth = 1;
            memberStart = i + 1;
          }
          continue;
        }
        if (ch === '"') inStr = true;
        else if (ch === "{" || ch === "[") depth++;
        else if (ch === "}" || ch === "]") {
          depth--;
          if (depth === 0) {
            emit(acc.slice(memberStart, i));
            started = false;
          }
        } else if (ch === "," && depth === 1) {
          emit(acc.slice(memberStart, i));
          memberStart = i + 1;
        }
      }
      seen = acc.length;
    },
    reset,
  };
}
