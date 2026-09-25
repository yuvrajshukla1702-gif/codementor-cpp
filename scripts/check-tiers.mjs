import { createRequire } from "module";
// Use dynamic import via tsx-compatible path — run with npx tsx
import { tiersForProblem } from "../src/lib/solution-tiers.ts";
import { getProblem } from "../src/lib/problems.ts";
import { codeLectureForProblem } from "../src/lib/code-lecture.ts";

const p = getProblem("two-sum");
if (!p) {
  console.error("no problem");
  process.exit(1);
}
const t = tiersForProblem(p);
for (const k of ["easy", "medium", "best"]) {
  const s = t[k];
  const lec = codeLectureForProblem(p, { code: s.code, tierLabel: s.label, complexity: s.complexity });
  console.log(k, s.complexity, "steps=", lec.steps.length, "codeLines=", s.code.split("\n").length);
}
console.log("easy snippet:\n", t.easy.code.split("\n").slice(0, 8).join("\n"));
