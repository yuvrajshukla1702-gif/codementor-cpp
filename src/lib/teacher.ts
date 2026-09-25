import type { Problem } from "./types";

/** Works with zero API keys — uses curriculum hints + judge signals. */
export function offlineTeacher(params: {
  problem: Problem;
  hintLevel: number;
  code: string;
  judgeSummary: string;
  tone: string;
}): string {
  const { problem, hintLevel, code, judgeSummary, tone } = params;
  const hinglish = tone !== "english";
  const level = Math.max(0, Math.min(3, hintLevel));
  const lines: string[] = [];

  const hi = hinglish
    ? "Teacher mode (built-in — no Gemini needed)."
    : "Teacher mode (built-in — works offline).";
  lines.push(hi, "");

  lines.push(
    hinglish
      ? `Tum try kar rahe ho: **${problem.title}** (${problem.topic}). Goal: pattern samajh ke code likho, ratta nahi.`
      : `You're working on **${problem.title}** (${problem.topic}). Goal: learn the pattern, not memorize.`,
    "",
  );

  if (/compile error/i.test(judgeSummary)) {
    lines.push(
      hinglish ? "## Pehle compile fix karo" : "## Fix compile first",
      hinglish
        ? "Logic se pehle syntax. First error line padho — aksar missing `;`, galat return type, ya typo hota hai."
        : "Syntax before logic. Read the first error line — often a missing `;`, wrong return type, or typo.",
      "",
      judgeSummary.slice(0, 600),
      "",
    );
  } else if (judgeSummary && !/No judge/i.test(judgeSummary)) {
    lines.push(
      hinglish ? "## Judge bola" : "## What the judge saw",
      judgeSummary.slice(0, 500),
      "",
      hinglish
        ? "Failing test ko paper pe dry-run karo: har step pe variable values likho. Pehli jagah jahan paper ≠ code — wahi bug."
        : "Dry-run the failing test on paper. The first step where paper ≠ code is your bug.",
      "",
    );
  }

  const hint = problem.hints[Math.min(level, 2)];
  if (level <= 0) {
    lines.push(
      hinglish ? "## Hint 1 (soft)" : "## Hint 1 (soft)",
      hint,
      "",
      hinglish
        ? "Ab code mat mangna. Pattern naam lo (hash / two pointers / window), phir ek chhota change try karo."
        : "Don't ask for the full solution yet. Name the pattern, then make one small change.",
    );
  } else if (level === 1) {
    lines.push(
      hinglish ? "## Hint 2 (zyada clear)" : "## Hint 2 (clearer)",
      problem.hints[1],
      "",
      codeLooksEmpty(code)
        ? hinglish
          ? "Starter almost empty hai — pehle data structure declare karo (map/set/vector), phir loop."
          : "Starter is nearly empty — declare your structure (map/set/vector), then the loop."
        : hinglish
          ? "Apne loop ke andar pehli decision line check karo — condition ulti to nahi?"
          : "Check the first decision inside your loop — inverted condition?",
    );
  } else {
    lines.push(
      hinglish ? "## Hint 3 (approach outline)" : "## Hint 3 (approach outline)",
      problem.hints[2],
      "",
      hinglish
        ? "Ab structure clear hona chahiye. Full copy-paste mat karo — khud type karo taaki yaad rahe."
        : "The structure should be clear. Type it yourself — don't paste blindly.",
      "",
      "## Try-again checklist",
      "1. Signature / return type match?",
      "2. Edge: n=0/1, duplicates, negatives?",
      "3. Complexity: one pass if possible?",
    );
  }

  lines.push(
    "",
    hinglish
      ? "Lesson tab pe topic padho → quiz → phir editor. Teacher yahin hai."
      : "Read the lesson tab → quiz → then editor. The teacher stays with you.",
  );

  return lines.join("\n");
}

function codeLooksEmpty(code: string) {
  const stripped = code
    .replace(/\/\/.*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/class\s+Solution\s*\{[\s\S]*public:/, "")
    .replace(/return\s+\{\}\s*;/, "")
    .replace(/return\s+0\s*;/, "")
    .replace(/[{};()]/g, "")
    .trim();
  return stripped.length < 40;
}

export function tutorSystemPrompt(tone: string) {
  const lang =
    tone === "hinglish"
      ? "Reply in clear Hinglish (simple Hindi + English). Warm, direct, like a good YouTube DSA teacher."
      : "Reply in clear simple English. Warm, direct, like a good YouTube DSA teacher.";
  return `You are CodeMentor, a patient C++ DSA teacher.
${lang}
Rules:
- Never dump a full correct solution on the first or second failure.
- Point to the conceptual bug and roughly where in the code.
- Restate what the student was trying.
- Give exactly one actionable next step.
- If HINT_LEVEL is 0: light nudge. 1: more specific. 2+: can outline the approach and a short snippet only if needed.
- Keep under 220 words.
- Do not edit any files. Reply with teaching text only.`;
}

export function offlineShortGrade(params: {
  prompt: string;
  answer: string;
  section: string;
  tone: string;
}): { score: number; feedback: string } {
  const text = params.answer.trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  let score = 4;
  if (words >= 40) score += 2;
  if (words >= 80) score += 1;
  if (/because|therefore|for example|example|e\.g\.|jaise|kyunki/i.test(text)) score += 1;
  if (/time|space|o\(|complexity|solid|acid|thread|index|star|situation/i.test(text)) score += 1;
  if (words < 15) score = Math.min(score, 3);
  score = Math.max(1, Math.min(10, score));

  const hinglish = params.tone !== "english";
  const feedback = [
    hinglish ? "Built-in grader (API key optional)." : "Built-in grader (works offline).",
    "",
    `Score: ${score}/10`,
    "",
    hinglish
      ? "Feedback: Answer mein pehle seedha point, phir 1 example, phir short wrap-up. Agar DSA/CS concept hai to complexity / trade-off ek line mein likho."
      : "Feedback: Lead with the direct point, add one example, then a short wrap-up. For CS/DSA, state the trade-off or complexity in one line.",
    "",
    hinglish ? "Stronger outline:" : "Stronger outline:",
    `1. One-line answer to: ${params.prompt.slice(0, 120)}`,
    "2. Why it matters (1–2 sentences)",
    "3. Tiny example or STAR beat",
    "4. Close with what you'd do / complexity / lesson learned",
  ].join("\n");

  return { score, feedback };
}
