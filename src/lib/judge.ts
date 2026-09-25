import { spawn } from "child_process";
import fs from "fs/promises";
import os from "os";
import path from "path";
import type { Problem, TestCase } from "./types";

export type CodeDiagnostic = {
  line: number;
  column: number;
  message: string;
  severity: "error" | "warning";
};

export type JudgeResult = {
  passed: boolean;
  total: number;
  passedCount: number;
  details: Array<{
    index: number;
    hidden: boolean;
    ok: boolean;
    input?: string;
    expected?: string;
    actual?: string;
    error?: string;
  }>;
  compileError?: string;
  diagnostics: CodeDiagnostic[];
  verdict: "Accepted" | "Wrong Answer" | "Compile Error" | "Runtime Error" | "Time Limit Exceeded";
};

function whichGpp(): string {
  return process.platform === "win32" ? "g++" : "g++";
}

async function runCmd(
  cmd: string,
  args: string[],
  input: string,
  timeoutMs = 4000
): Promise<{ code: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { windowsHide: true });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill();
      resolve({ code: null, stdout, stderr: stderr + "\nTIMEOUT" });
    }, timeoutMs);
    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => (stderr += d.toString()));
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr });
    });
    if (input) child.stdin.write(input);
    child.stdin.end();
  });
}

function studentLineOffset(harness: string) {
  const before = harness.split("{{CODE}}")[0] ?? "";
  return Math.max(1, before.split("\n").length);
}

export function parseCompilerDiagnostics(stderr: string, harness: string, studentCode: string): CodeDiagnostic[] {
  const start = studentLineOffset(harness);
  const studentLines = Math.max(1, studentCode.split("\n").length);
  const seen = new Set<string>();
  const out: CodeDiagnostic[] = [];
  for (const raw of stderr.split(/\r?\n/)) {
    const match = raw.match(/:(\d+):(\d+):\s*(fatal error|error|warning):\s*(.+)$/i);
    if (!match) continue;
    const fullLine = Number(match[1]);
    const column = Number(match[2]);
    const kind = match[3].toLowerCase();
    const message = match[4].trim();
    const line = fullLine - start + 1;
    if (line < 1 || line > studentLines) continue;
    const key = `${line}:${column}:${message}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      line,
      column,
      message,
      severity: kind === "warning" ? "warning" : "error",
    });
  }
  return out;
}

export async function judgeProblem(
  problem: Problem,
  studentCode: string,
  opts?: { includeHidden?: boolean }
): Promise<JudgeResult> {
  const includeHidden = opts?.includeHidden ?? true;
  const tests = problem.tests.filter((t) => includeHidden || !t.hidden);
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "codementor-"));
  const cppPath = path.join(dir, "main.cpp");
  const exePath = path.join(dir, process.platform === "win32" ? "main.exe" : "main");

  const source = problem.harness.replace("{{CODE}}", studentCode);
  await fs.writeFile(cppPath, source, "utf8");

  const compile = await runCmd(
    whichGpp(),
    [cppPath, "-O2", "-std=c++17", "-Wall", "-fno-diagnostics-show-caret", "-o", exePath],
    "",
    15000
  );
  if (compile.code !== 0) {
    const raw = (compile.stderr || compile.stdout || "compile failed").slice(0, 4000);
    const diagnostics = parseCompilerDiagnostics(raw, problem.harness, studentCode);
    await fs.rm(dir, { recursive: true, force: true }).catch(() => undefined);
    return {
      passed: false,
      total: tests.length,
      passedCount: 0,
      details: [],
      compileError: raw,
      diagnostics,
      verdict: "Compile Error",
    };
  }

  const details: JudgeResult["details"] = [];
  let passedCount = 0;
  for (let i = 0; i < tests.length; i++) {
    const t = tests[i] as TestCase;
    const run = await runCmd(exePath, [], t.input, 4000);
    const actual = (run.stdout || "").replace(/\r\n/g, "\n").replace(/\s+$/g, "");
    const expected = t.expected.replace(/\r\n/g, "\n").replace(/\s+$/g, "");
    const timedOut = (run.stderr || "").includes("TIMEOUT");
    const runtime = !timedOut && run.code !== 0 && run.code !== null;
    const ok = run.code === 0 && actual === expected;
    if (ok) passedCount++;
    details.push({
      index: i,
      hidden: !!t.hidden,
      ok,
      input: t.hidden ? undefined : t.input,
      expected: t.hidden ? undefined : expected,
      actual: t.hidden && !ok ? "(hidden)" : actual,
      error: timedOut ? "Time Limit" : runtime ? run.stderr?.trim() || "Runtime Error" : undefined,
    });
  }

  await fs.rm(dir, { recursive: true, force: true }).catch(() => undefined);
  const diagnostics = parseCompilerDiagnostics(compile.stderr || "", problem.harness, studentCode);
  const timedOut = details.some((d) => d.error === "Time Limit");
  const crashed = details.some((d) => !d.ok && d.error && d.error !== "Time Limit");
  const passed = passedCount === tests.length && tests.length > 0;
  return {
    passed,
    total: tests.length,
    passedCount,
    details,
    diagnostics,
    verdict: passed ? "Accepted" : timedOut ? "Time Limit Exceeded" : crashed ? "Runtime Error" : "Wrong Answer",
  };
}
