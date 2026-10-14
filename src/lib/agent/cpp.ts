import { spawn, type ChildProcess } from "child_process";
import { createHash } from "crypto";
import fs from "fs/promises";
import os from "os";
import path from "path";

/**
 * Everything the agent does with the local C++ compiler: safety screening, the TR(...) trace helper,
 * a precompiled-header fast path, compile + run with hard limits.
 *
 * GCC 6.3 (MinGW) fails on std::stod & friends in strict -std=c++14 mode, so we use the GNU dialect.
 */
export const CPP_FLAGS = ["-std=gnu++14", "-O1", "-w"];
const COMPILE_TIMEOUT = 25_000;
const RUN_TIMEOUT = 3_000;
const MAX_OUT = 200_000;

const ROOT = path.join(os.tmpdir(), "codementor-agent");

/* --------------------------------- screening --------------------------------- */

const ALLOWED_HEADERS = new Set(
  (
    "bits/stdc++.h algorithm array bitset cassert cctype cfloat climits cmath complex cstdint cstdio cstdlib cstring " +
    "deque exception forward_list functional initializer_list iomanip iostream iterator limits list map memory new " +
    "numeric queue random ratio set sstream stack stdexcept string tuple type_traits unordered_map unordered_set " +
    "utility valarray vector chrono"
  ).split(" "),
);

const FORBIDDEN = [
  "system", "popen", "_popen", "fork", "vfork", "execl", "execle", "execlp", "execv", "execve", "execvp", "spawn",
  "spawnl", "spawnv", "CreateProcess", "CreateProcessA", "CreateProcessW", "WinExec", "ShellExecute", "ShellExecuteA",
  "fopen", "freopen", "fopen_s", "ifstream", "ofstream", "fstream", "filesystem", "unlink", "rmdir", "mkdir",
  "chdir", "asm", "__asm", "__asm__", "dlopen", "LoadLibrary", "LoadLibraryA", "GetProcAddress", "socket",
  "getenv", "setenv", "putenv", "pthread_create", "thread", "async", "signal", "raise", "kill",
];

/** Blank out comments, strings and char literals so the keyword scan only sees real code. */
function blankLiterals(src: string): string {
  let out = "";
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    const d = src[i + 1];
    if (c === "/" && d === "/") {
      while (i < n && src[i] !== "\n") i++;
    } else if (c === "/" && d === "*") {
      i += 2;
      while (i < n && !(src[i] === "*" && src[i + 1] === "/")) {
        if (src[i] === "\n") out += "\n";
        i++;
      }
      i += 2;
    } else if (c === '"' || c === "'") {
      const q = c;
      out += q;
      i++;
      while (i < n && src[i] !== q) {
        if (src[i] === "\\") i++;
        if (src[i] === "\n") out += "\n";
        i++;
      }
      out += q;
      i++;
    } else {
      out += c;
      i++;
    }
  }
  return out;
}

export function safetyIssues(src: string): string[] {
  const issues: string[] = [];
  const code = blankLiterals(src);
  for (const m of code.matchAll(/^[ \t]*#[ \t]*include[ \t]*([<"])([^>"\n]*)[>"]/gm)) {
    const header = m[2].trim();
    if (m[1] === '"' || !ALLOWED_HEADERS.has(header)) issues.push(`#include ${m[1]}${header}${m[1] === "<" ? ">" : '"'} is not allowed`);
  }
  for (const word of FORBIDDEN) {
    if (new RegExp(`(^|[^A-Za-z0-9_])${word}($|[^A-Za-z0-9_])`).test(code)) issues.push(`"${word}" is not allowed`);
  }
  if (/\bremove\s*\(\s*"|\brename\s*\(\s*"/.test(src)) issues.push("deleting or renaming files is not allowed");
  if (/^[ \t]*#[ \t]*define[^\n]*##/m.test(code)) issues.push("token pasting in #define is not allowed");
  return [...new Set(issues)].slice(0, 6);
}

/** Normalise model-written C++: no fences, no BOM, our own includes, no pragmas. */
export function cleanCpp(src: string): string {
  let s = (src || "").replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const fence = s.match(/```(?:cpp|c\+\+|cc)?\s*\n([\s\S]*?)```/i);
  if (fence) s = fence[1];
  s = s
    .replace(/^[ \t]*#[ \t]*include[ \t]*<bits\/stdc\+\+\.h>[ \t]*$/gm, "")
    .replace(/^[ \t]*using[ \t]+namespace[ \t]+std[ \t]*;[ \t]*$/gm, "")
    .replace(/^[ \t]*#[ \t]*pragma\b.*$/gm, "");
  return s.replace(/\n{3,}/g, "\n\n").trim();
}

const TR_LINE = /^[ \t]*TR[ \t]*\(.*\)[ \t]*;[ \t]*$/;

/** The code the student sees: every single-line TR(...); statement removed. */
export function stripTrace(src: string): { clean: string; leftover: boolean } {
  const kept = src.split("\n").filter((line) => !TR_LINE.test(line));
  const clean = kept.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return { clean, leftover: /(^|[^A-Za-z0-9_])TR[ \t]*\(/.test(blankLiterals(clean)) };
}

/* ------------------------------ the trace helper ------------------------------ */

const HELPER = String.raw`// CodeMentor trace helper: one JSON line per TR(...) call on stderr.
namespace cmtr {
struct T0 {};
struct T1 : T0 {};
struct T2 : T1 {};
inline long& calls() { static long c = 0; return c; }
inline void jstr(std::string& o, const std::string& s) {
  o += '"';
  for (size_t k = 0; k < s.size() && k < 240; k++) {
    unsigned char ch = (unsigned char)s[k];
    switch (ch) {
      case '"': o += "\\\""; break;
      case '\\': o += "\\\\"; break;
      case '\n': o += "\\n"; break;
      case '\r': o += "\\r"; break;
      case '\t': o += "\\t"; break;
      default:
        if (ch < 0x20) { o += "\\u00"; o += "0123456789abcdef"[ch >> 4]; o += "0123456789abcdef"[ch & 15]; }
        else o += (char)ch;
    }
  }
  if (s.size() > 240) o += "...";
  o += '"';
}
template <class V> void js(std::string& o, const V& v);
inline void js(std::string& o, const std::vector<bool>& v);
template <class V, class C> void js(std::string& o, const std::stack<V, C>& s);
template <class V, class C> void js(std::string& o, const std::queue<V, C>& q);
template <class V, class C, class P> void js(std::string& o, const std::priority_queue<V, C, P>& q);
inline void js_(std::string& o, bool v, T2) { o += v ? "true" : "false"; }
inline void js_(std::string& o, char v, T2) { jstr(o, std::string(1, v)); }
inline void js_(std::string& o, const std::string& v, T2) { jstr(o, v); }
inline void js_(std::string& o, const char* v, T2) { jstr(o, v ? v : ""); }
template <class V> typename std::enable_if<std::is_integral<V>::value && !std::is_same<V, bool>::value && !std::is_same<V, char>::value>::type
js_(std::string& o, V v, T2) {
  if (std::is_signed<V>::value) {
    long long x = (long long)v;
    if (x > 9007199254740991LL || x < -9007199254740991LL) { o += '"'; o += std::to_string(x); o += '"'; }
    else o += std::to_string(x);
  } else {
    unsigned long long x = (unsigned long long)v;
    if (x > 9007199254740991ULL) { o += '"'; o += std::to_string(x); o += '"'; }
    else o += std::to_string(x);
  }
}
template <class V> typename std::enable_if<std::is_floating_point<V>::value>::type js_(std::string& o, V v, T2) {
  double d = (double)v;
  if (d != d) { o += "\"nan\""; return; }
  if (d > 1e300) { o += "\"inf\""; return; }
  if (d < -1e300) { o += "\"-inf\""; return; }
  char b[40]; std::snprintf(b, sizeof b, "%.10g", d); o += b;
}
template <class A, class B> void js_(std::string& o, const std::pair<A, B>& p, T2) {
  o += '['; js(o, p.first); o += ','; js(o, p.second); o += ']';
}
template <class V> auto js_(std::string& o, const V& c, T1) -> decltype(c.begin(), c.end(), void()) {
  o += '[';
  int n = 0;
  for (auto it = c.begin(); it != c.end(); ++it) {
    if (n) o += ',';
    if (n >= 64) { o += "\"...\""; break; }
    js(o, *it);
    n++;
  }
  o += ']';
}
template <class V> void js_(std::string& o, const V&, T0) { o += "\"?\""; }
template <class V> void js(std::string& o, const V& v) { js_(o, v, T2()); }
inline void js(std::string& o, const std::vector<bool>& v) {
  o += '[';
  for (size_t k = 0; k < v.size(); k++) {
    if (k) o += ',';
    if (k >= 64) { o += "\"...\""; break; }
    o += v[k] ? "true" : "false";
  }
  o += ']';
}
template <class V, class C> void js(std::string& o, const std::stack<V, C>& s) {
  std::stack<V, C> c = s;
  std::vector<V> items;
  while (!c.empty()) { items.push_back(c.top()); c.pop(); }
  o += '[';
  int n = 0;
  for (size_t k = items.size(); k-- > 0;) {
    if (n) o += ',';
    if (n >= 64) { o += "\"...\""; break; }
    js(o, items[k]);
    n++;
  }
  o += ']';
}
template <class V, class C> void js(std::string& o, const std::queue<V, C>& q) {
  std::queue<V, C> c = q;
  o += '[';
  int n = 0;
  while (!c.empty()) {
    if (n) o += ',';
    if (n >= 64) { o += "\"...\""; break; }
    js(o, c.front());
    c.pop();
    n++;
  }
  o += ']';
}
template <class V, class C, class P> void js(std::string& o, const std::priority_queue<V, C, P>& q) {
  std::priority_queue<V, C, P> c = q;
  o += '[';
  int n = 0;
  while (!c.empty()) {
    if (n) o += ',';
    if (n >= 64) { o += "\"...\""; break; }
    js(o, c.top());
    c.pop();
    n++;
  }
  o += ']';
}
inline std::vector<std::string> names(const char* s) {
  std::vector<std::string> out;
  std::string cur;
  int depth = 0;
  bool inq = false;
  char qc = 0;
  for (const char* p = s; *p; ++p) {
    char ch = *p;
    if (inq) {
      cur += ch;
      if (ch == '\\' && p[1]) { cur += *++p; }
      else if (ch == qc) inq = false;
      continue;
    }
    if (ch == '"' || ch == '\'') { inq = true; qc = ch; cur += ch; continue; }
    if (ch == '(' || ch == '[' || ch == '{') depth++;
    if (ch == ')' || ch == ']' || ch == '}') depth--;
    if (ch == ',' && depth == 0) { out.push_back(cur); cur.clear(); continue; }
    cur += ch;
  }
  out.push_back(cur);
  for (size_t k = 0; k < out.size(); k++) {
    size_t a = out[k].find_first_not_of(" \t\r\n");
    size_t b = out[k].find_last_not_of(" \t\r\n");
    out[k] = a == std::string::npos ? std::string() : out[k].substr(a, b - a + 1);
  }
  return out;
}
inline void putkv(std::string&, const std::vector<std::string>&, size_t) {}
template <class V, class... R>
void putkv(std::string& o, const std::vector<std::string>& nm, size_t k, const V& v, const R&... r) {
  if (k) o += ',';
  jstr(o, k < nm.size() ? nm[k] : std::string("?"));
  o += ':';
  js(o, v);
  putkv(o, nm, k + 1, r...);
}
template <class... A> void emit(int line, const char* note, const char* argNames, const A&... a) {
  long n = ++calls();
  if (n > 4000) return;
  std::vector<std::string> nm = names(argNames);
  std::string o = "@@TRACE {\"n\":" + std::to_string(n) + ",\"l\":" + std::to_string(line) + ",\"t\":";
  jstr(o, note ? note : "");
  o += ",\"v\":{";
  putkv(o, nm, 0, a...);
  o += "}}\n";
  std::fputs(o.c_str(), stderr);
}
}  // namespace cmtr
#define TR(note, ...) cmtr::emit(__LINE__, note, #__VA_ARGS__, ##__VA_ARGS__)`;

export type Sources = { plain: string; traced: string; tracedLines: string[] };

/** Plain = exactly what the student will copy. Traced = the same program plus the trace helper. */
export function assembleSources(solutionWithTrace: string, driver: string): Sources & { leftoverTrace: boolean } {
  const sol = cleanCpp(solutionWithTrace);
  const drv = cleanCpp(driver);
  const solPlain = stripTrace(sol);
  const drvPlain = stripTrace(drv);
  const head = "#include <bits/stdc++.h>\nusing namespace std;\n";
  const plain = `${head}${solPlain.clean}\n\n${drvPlain.clean}\n`;
  const traced = `${head}${HELPER}\n${sol}\n\n${drv}\n`;
  return { plain, traced, tracedLines: traced.split("\n"), leftoverTrace: solPlain.leftover || drvPlain.leftover };
}

/** What we show the student: algorithm without trace calls. */
export function displayCode(solutionWithTrace: string): string {
  return stripTrace(cleanCpp(solutionWithTrace)).clean;
}

/* ------------------------------ process plumbing ------------------------------ */

type Proc = { code: number | null; stdout: string; stderr: string; ms: number; timedOut: boolean; missing: boolean; truncated: boolean };

function killTree(child: ChildProcess) {
  if (!child.pid) return;
  if (process.platform === "win32") {
    try {
      spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" });
    } catch {
      child.kill();
    }
  } else {
    child.kill("SIGKILL");
  }
}

function runProc(cmd: string, args: string[], input: string, timeoutMs: number, cwd?: string): Promise<Proc> {
  return new Promise((resolve) => {
    const started = Date.now();
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let truncated = false;
    let settled = false;
    let child: ChildProcess;
    const finish = (code: number | null, missing = false) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ code, stdout, stderr, ms: Date.now() - started, timedOut, missing, truncated });
    };
    try {
      child = spawn(cmd, args, { cwd, windowsHide: true });
    } catch (err) {
      stderr = err instanceof Error ? err.message : String(err);
      resolve({ code: null, stdout, stderr, ms: 0, timedOut: false, missing: true, truncated: false });
      return;
    }
    const timer = setTimeout(() => {
      timedOut = true;
      killTree(child);
      setTimeout(() => finish(null), 300);
    }, timeoutMs);
    child.on("error", (err: NodeJS.ErrnoException) => {
      stderr += err.message;
      finish(null, err.code === "ENOENT");
    });
    child.stdin?.on("error", () => undefined);
    child.stdout?.on("data", (d) => {
      if (stdout.length < MAX_OUT) stdout += d.toString();
      else truncated = true;
    });
    child.stderr?.on("data", (d) => {
      if (stderr.length < MAX_OUT) stderr += d.toString();
      else truncated = true;
    });
    child.on("close", (code) => finish(code));
    if (input) child.stdin?.write(input);
    child.stdin?.end();
  });
}

let slots = 2;
const waiters: Array<() => void> = [];
async function withSlot<T>(fn: () => Promise<T>): Promise<T> {
  if (slots <= 0) await new Promise<void>((r) => waiters.push(r));
  else slots--;
  try {
    return await fn();
  } finally {
    const next = waiters.shift();
    if (next) next();
    else slots++;
  }
}

/* --------------------------------- compiler --------------------------------- */

type CompilerInfo = { ok: boolean; version?: string };
const g = globalThis as unknown as {
  __cmAgentCompiler?: { at: number; info: CompilerInfo };
  __cmAgentPch?: Promise<string | null>;
  __cmAgentCompiles?: Map<string, Promise<CompileResult>>;
  __cmAgentSweptAt?: number;
};

export async function compilerInfo(): Promise<CompilerInfo> {
  const cached = g.__cmAgentCompiler;
  if (cached && Date.now() - cached.at < (cached.info.ok ? 120_000 : 15_000)) return cached.info;
  const r = await runProc("g++", ["--version"], "", 8_000);
  const info: CompilerInfo =
    r.missing || r.code !== 0 ? { ok: false } : { ok: true, version: (r.stdout.split(/\r?\n/)[0] || "g++").trim().slice(0, 90) };
  g.__cmAgentCompiler = { at: Date.now(), info };
  return info;
}

/** Precompiled <bits/stdc++.h>: halves every compile. Built once, reused until the machine reboots. */
export function ensurePch(): Promise<string | null> {
  if (!g.__cmAgentPch) {
    g.__cmAgentPch = buildPch().catch(() => null);
    g.__cmAgentPch.then((v) => {
      if (!v) g.__cmAgentPch = undefined; // allow another try later
    });
  }
  return g.__cmAgentPch;
}

async function buildPch(): Promise<string | null> {
  const info = await compilerInfo();
  if (!info.ok) return null;
  const key = createHash("sha1").update(`${info.version}|${CPP_FLAGS.join(" ")}`).digest("hex").slice(0, 12);
  const dir = path.join(ROOT, `pch-${key}`);
  const gch = path.join(dir, "bits", "stdc++.h.gch");
  try {
    const st = await fs.stat(gch);
    if (st.size > 1_000_000) return dir;
  } catch {
    /* build it */
  }
  const probe = await runProc("g++", [...CPP_FLAGS, "-x", "c++", "-H", "-fsyntax-only", "-"], "#include <bits/stdc++.h>\n", 25_000);
  const m = /^\.+ (.*bits[\\/]stdc\+\+\.h)\s*$/m.exec(probe.stderr);
  if (!m) return null;
  await fs.mkdir(path.join(dir, "bits"), { recursive: true });
  await fs.copyFile(m[1].trim(), path.join(dir, "bits", "stdc++.h"));
  const tmp = path.join(dir, "bits", `stdc++.h.${process.pid}.tmp`);
  const r = await runProc(
    "g++",
    [...CPP_FLAGS, "-x", "c++-header", path.join(dir, "bits", "stdc++.h"), "-o", tmp],
    "",
    COMPILE_TIMEOUT,
  );
  if (r.code !== 0) {
    await fs.rm(tmp, { force: true }).catch(() => undefined);
    return null;
  }
  await fs.rename(tmp, gch);
  return dir;
}

export type CompileResult = { ok: boolean; exe?: string; error?: string; ms: number; missing?: boolean };

function trimDiagnostics(text: string): string {
  const lines = text.replace(/\r/g, "").split("\n");
  const keep = lines.filter((l) => !/^In file included|^\s+from /.test(l));
  return keep.join("\n").trim().slice(0, 2400);
}

async function sweepOld() {
  if (g.__cmAgentSweptAt && Date.now() - g.__cmAgentSweptAt < 20 * 60_000) return;
  g.__cmAgentSweptAt = Date.now();
  try {
    for (const name of await fs.readdir(ROOT)) {
      if (name.startsWith("pch-")) continue;
      const p = path.join(ROOT, name);
      const st = await fs.stat(p).catch(() => null);
      if (st && Date.now() - st.mtimeMs > 90 * 60_000) await fs.rm(p, { recursive: true, force: true }).catch(() => undefined);
    }
  } catch {
    /* nothing to sweep */
  }
}

export function compileCpp(source: string): Promise<CompileResult> {
  const cache = (g.__cmAgentCompiles ??= new Map());
  const hash = createHash("sha1").update(CPP_FLAGS.join(" ") + "\0" + source).digest("hex").slice(0, 20);
  const hit = cache.get(hash);
  if (hit) return hit;
  const job = withSlot(async (): Promise<CompileResult> => {
    const started = Date.now();
    void sweepOld();
    const dir = path.join(ROOT, hash);
    const exe = path.join(dir, process.platform === "win32" ? "main.exe" : "main");
    try {
      await fs.access(exe);
      return { ok: true, exe, ms: 0 };
    } catch {
      /* compile below */
    }
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, "main.cpp"), source, "utf8");
    const pch = await ensurePch();
    const r = await runProc(
      "g++",
      [...CPP_FLAGS, ...(pch ? ["-I", pch] : []), "main.cpp", "-o", path.basename(exe)],
      "",
      COMPILE_TIMEOUT,
      dir,
    );
    if (r.missing) return { ok: false, missing: true, error: "No C++ compiler found.", ms: Date.now() - started };
    if (r.code !== 0) {
      return {
        ok: false,
        error: r.timedOut ? "The compiler took too long." : trimDiagnostics(r.stderr || r.stdout || "compile failed"),
        ms: Date.now() - started,
      };
    }
    return { ok: true, exe, ms: Date.now() - started };
  });
  cache.set(hash, job);
  job.then((res) => {
    // failures are cheap to retry; successes stay cached (the exe is on disk)
    if (!res.ok) cache.delete(hash);
    if (cache.size > 60) cache.delete(cache.keys().next().value as string);
  });
  return job;
}

export type RunResult = { code: number | null; stdout: string; stderr: string; ms: number; timedOut: boolean; truncated: boolean };

export async function runExe(exe: string, input: string, timeoutMs = RUN_TIMEOUT): Promise<RunResult> {
  const r = await runProc(exe, [], input, timeoutMs, path.dirname(exe));
  return { code: r.code, stdout: r.stdout, stderr: r.stderr, ms: r.ms, timedOut: r.timedOut, truncated: r.truncated };
}

/* -------------------------------- comparison -------------------------------- */

const numeric = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;

function normalize(s: string): string[] {
  return s
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((l) => l.replace(/\s+$/, ""))
    .join("\n")
    .replace(/\s+$/, "")
    .split("\n");
}

/** Whitespace-tolerant, float-tolerant, true/True-tolerant comparison of program output. */
export function outputsMatch(expected: string, actual: string): boolean {
  const a = normalize(expected);
  const b = normalize(actual);
  if (a.join("\n") === b.join("\n")) return true;
  const ta = a.join(" ").split(/\s+/).filter(Boolean);
  const tb = b.join(" ").split(/\s+/).filter(Boolean);
  if (ta.length !== tb.length) return false;
  return ta.every((x, i) => {
    const y = tb[i];
    if (x === y) return true;
    if (/^(true|false|yes|no)$/i.test(x) && /^(true|false|yes|no)$/i.test(y)) return x.toLowerCase() === y.toLowerCase();
    if (numeric.test(x) && numeric.test(y)) {
      const p = Number(x);
      const q = Number(y);
      return Math.abs(p - q) <= 1e-6 * Math.max(1, Math.abs(p), Math.abs(q));
    }
    return false;
  });
}
