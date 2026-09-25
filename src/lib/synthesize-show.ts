import type { Problem } from "./types";
import type { ShowGesture, ShowKind, TeacherShowScript } from "./teacher-shows";
import { guideForProblem } from "./solution-guides";

function kindFor(problem: Problem): ShowKind {
  const t = problem.topic;
  if (t === "hashing") return "hash-map";
  if (t === "two-pointers") return "two-pointers";
  if (t === "sliding-window") return "sliding-window";
  if (problem.id.includes("subarray") || problem.id.includes("kadane")) return "kadane";
  return "array-scan";
}

function parseCells(problem: Problem): number[] | string[] | undefined {
  const sample = problem.tests?.[0]?.input || "";
  const nums = sample.match(/-?\d+/g)?.map(Number);
  if (!nums || nums.length < 2) return undefined;
  // Drop leading n / target often present in harnesses
  const body = nums.length > 4 ? nums.slice(1, Math.min(9, nums.length)) : nums.slice(0, 8);
  return body.length >= 2 ? body : undefined;
}

/** Course-quality fallback when no hand-written show exists. */
export function synthesizeTeacherShow(problem: Problem): TeacherShowScript {
  const guide = guideForProblem(problem);
  const cells = parseCells(problem) || [2, 7, 11, 15];
  const kind = kindFor(problem);
  const cx = guide.complexity || "see Solution tab";

  const beats: Array<{
    chapter: string;
    board: string;
    gesture: ShowGesture;
    hinglish: string;
    english: string;
    hindi: string;
    cells?: number[] | string[];
    hi?: number[];
    pointers?: Record<string, number>;
    map?: Record<string, string | number>;
    stats?: Record<string, string | number>;
    codeLine?: string;
  }> = [
    {
      chapter: "Hook",
      board: problem.title,
      gesture: "explain",
      hinglish: `Suno. Aaj ka sawaal: ${problem.title}. Difficulty ${problem.difficulty}. Pehle idea clear, phir code.`,
      english: `Listen. Today's problem: ${problem.title}. Difficulty ${problem.difficulty}. Idea first, then code.`,
      hindi: `सुनो। आज का सवाल: ${problem.title}। पहले आइडिया, फिर कोड।`,
      cells: cells as number[],
      stats: { difficulty: problem.difficulty, topic: problem.topic },
    },
    {
      chapter: "Ask",
      board: "What is asked?",
      gesture: "think",
      hinglish: problem.hints[0],
      english: problem.hints[0],
      hindi: problem.hints[0],
      cells: cells as number[],
      stats: { hint: "start here" },
    },
    {
      chapter: "Wrong path",
      board: "Slow idea first",
      gesture: "think",
      hinglish: "Pehle brute force socho — nested loops ya har option. Chalega, par interview mein slow sunai deta hai.",
      english: "Name the brute force first — nested loops or every option. It works, but interviews hear slow.",
      hindi: "पहले ब्रूट फोर्स सोचो। चलेगा, पर इंटरव्यू में धीमा लगेगा।",
      cells: cells as number[],
      stats: { brute: "try all", goal: "do better" },
    },
    {
      chapter: "The idea",
      board: "Optimal pattern",
      gesture: "explain",
      hinglish: problem.hints[1],
      english: problem.hints[1],
      hindi: problem.hints[1],
      cells: cells as number[],
      stats: { complexity: cx },
      codeLine: guide.code.split("\n").find((l) => /unordered_|for |while |if /.test(l))?.trim() || undefined,
    },
    {
      chapter: "Dry run",
      board: "Walk the example",
      gesture: "point",
      hinglish: `Example pe chalte hain. Sample values board pe hain. Har step pe poocho: ab state kya badli?`,
      english: `Walk the example. Sample values are on the board. At each step ask: what just changed?`,
      hindi: `उदाहरण पर चलते हैं। हर स्टेप पर पूछो: स्टेट क्या बदली?`,
      cells: cells as number[],
      hi: [0],
      pointers: { i: 0 },
      stats: { step: "start at index 0" },
    },
    {
      chapter: "Dry run",
      board: "Update state",
      gesture: "write",
      hinglish: problem.hints[2],
      english: problem.hints[2],
      hindi: problem.hints[2],
      cells: cells as number[],
      hi: cells.length > 1 ? [0, 1] : [0],
      pointers: { i: Math.min(1, cells.length - 1) },
      stats: { move: "advance / update answer" },
    },
    {
      chapter: "Code shape",
      board: "Skeleton",
      gesture: "write",
      hinglish: "Ab shape yaad rakho. Class Solution, public function, phir core loop. Solution tab mein Easy → Medium → Best hai.",
      english: "Remember the shape. Class Solution, public function, then the core loop. Solution tab has Easy → Medium → Best.",
      hindi: "आकार याद रखो। Solution क्लास, पब्लिक फ़ंक्शन, फिर कोर लूप।",
      cells: cells as number[],
      codeLine: "class Solution { /* Easy → Medium → Best */ };",
      stats: { next: "Code walk tab" },
    },
    {
      chapter: "Wrap",
      board: cx,
      gesture: "celebrate",
      hinglish: "Bas. Pattern clear hona chahiye. Ab Code walk chalao, phir editor mein khud type karo. Dekhte mat raho — sochte likho.",
      english: "Done. The pattern should feel clear. Run Code walk, then type it yourself. Think while you type.",
      hindi: "बस। पैटर्न क्लियर हो। कोड वॉक चलाओ, फिर खुद टाइप करो।",
      cells: cells as number[],
      hi: cells.map((_, i) => i).slice(0, 3),
      stats: { complexity: cx, action: "your turn" },
    },
  ];

  return {
    id: `${problem.id}-course`,
    title: `${problem.title} — Course`,
    subtitle: "Full beat lesson: hook → idea → dry run → wrap",
    kind,
    durationHint: "~2–3 min",
    practiceIds: [problem.id],
    steps: beats.map((b) => ({
      chapter: b.chapter,
      board: b.board,
      gesture: b.gesture,
      say: b.hinglish,
      sayEn: b.english,
      sayHi: b.hindi,
      cells: Array.isArray(cells) ? cells : undefined,
      hi: b.hi,
      pointers: b.pointers,
      map: b.map,
      stats: b.stats,
      codeLine: b.codeLine,
    })),
  };
}
