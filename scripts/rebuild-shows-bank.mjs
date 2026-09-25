/**
 * Rebuild teacher-shows-bank.ts from polished recipes.
 * Run: node scripts/rebuild-shows-bank.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { WAVE3, recipeShow } from "./wave3-full.mjs";
import { WAVE3B } from "./wave3b.mjs";
import { WAVE3C } from "./wave3c.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, "../src/lib/teacher-shows-bank.ts");
const oldPath = outPath;

function esc(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function stepTs(st) {
  const lines = ["      {"];
  if (st.chapter) lines.push(`        chapter: "${esc(st.chapter)}",`);
  if (st.board) lines.push(`        board: "${esc(st.board)}",`);
  if (st.gesture) lines.push(`        gesture: "${st.gesture}",`);
  lines.push(`        say: "${esc(st.say)}",`);
  if (st.sayEn) lines.push(`        sayEn: "${esc(st.sayEn)}",`);
  if (st.sayHi) lines.push(`        sayHi: "${esc(st.sayHi)}",`);
  if (st.cells) {
    const c = st.cells
      .map((x) => (typeof x === "string" ? `"${esc(x)}"` : x === null ? "null" : x))
      .join(", ");
    lines.push(`        cells: [${c}],`);
  }
  if (st.hi) lines.push(`        hi: [${st.hi.join(", ")}],`);
  if (st.pointers) {
    const p = Object.entries(st.pointers)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    lines.push(`        pointers: { ${p} },`);
  }
  if (st.map) {
    const m = Object.entries(st.map)
      .map(([k, v]) => `"${esc(k)}": ${typeof v === "string" ? `"${esc(v)}"` : v}`)
      .join(", ");
    lines.push(`        map: { ${m} },`);
  }
  if (st.stats) {
    const s = Object.entries(st.stats)
      .map(([k, v]) => {
        const key = /^[a-zA-Z_][\w]*$/.test(k) ? k : `"${esc(k)}"`;
        return `${key}: ${typeof v === "string" ? `"${esc(v)}"` : v}`;
      })
      .join(", ");
    lines.push(`        stats: { ${s} },`);
  }
  if (st.window) lines.push(`        window: [${st.window[0]}, ${st.window[1]}],`);
  if (st.codeLine) lines.push(`        codeLine: "${esc(st.codeLine)}",`);
  lines.push("      }");
  return lines.join("\n");
}

function showTs(show) {
  const steps = show.steps.map(stepTs).join(",\n");
  const practice = show.practiceIds.map((id) => `"${id}"`).join(", ");
  return `  "${show.id}": {
    id: "${show.id}",
    title: "${esc(show.title)}",
    subtitle: "${esc(show.subtitle)}",
    kind: "${show.kind}",
    durationHint: "${esc(show.durationHint)}",
    practiceIds: [${practice}],
    steps: [
${steps},
    ],
  }`;
}

function course(cfg) {
  const {
    id, title, subtitle, kind, practiceIds, durationHint = "~2 min",
    hook, contract, wrong, idea, trick, dryRuns, wrap,
  } = cfg;
  return {
    id, title, subtitle, kind, durationHint, practiceIds,
    steps: [
      { chapter: "Hook", gesture: "explain", ...hook },
      { chapter: "Contract", gesture: "point", ...contract },
      { chapter: "Wrong path", gesture: "think", ...wrong },
      { chapter: "The idea", gesture: "write", ...idea },
      { chapter: "The trick", gesture: "explain", ...trick },
      ...dryRuns.map((d, i) => ({
        chapter: "Dry run",
        gesture: d.gesture || (i === dryRuns.length - 1 ? "celebrate" : "point"),
        ...d,
      })),
      { chapter: "Wrap", gesture: "celebrate", ...wrap },
    ],
  };
}

function S(say, sayEn, sayHi, extra = {}) {
  return { say, sayEn, sayHi, ...extra };
}

function makeShow(meta, steps) {
  return { ...meta, durationHint: meta.durationHint || "~2 min", steps };
}

// ── Early high-quality shows (curriculum Phase-1 style) ────────────
const early = [];

early.push(
  course({
    id: "contains-duplicate-show",
    title: "Contains Duplicate — Set Walk",
    subtitle: "Have I seen this value before? Set answers instantly.",
    kind: "hash-map",
    practiceIds: ["contains-duplicate"],
    hook: {
      board: "Contains Duplicate",
      say: "Suno. Array mein numbers hain. Poori question ek line mein: kya koi value do baar aayi?",
      sayEn: "Listen. You get an array of numbers. The whole question in one line: does any value appear twice?",
      sayHi: "सुनो। ऐरे में नंबर हैं। पूरी सवाल एक लाइन में: क्या कोई वैल्यू दो बार आई?",
      cells: [1, 2, 3, 1],
      stats: { ask: "any value twice?" },
    },
    contract: {
      board: "Return bool",
      say: "True agar duplicate milta hai. False agar saari values unique hain. Index nahi chahiye — sirf haan / na.",
      sayEn: "Return true if a duplicate exists. False if every value is unique. No indexes — just yes or no.",
      sayHi: "ट्रू अगर डुप्लिकेट मिले। फॉल्स अगर सारी वैल्यू यूनिक हैं। इंडेक्स नहीं — सिर्फ हाँ / ना।",
      cells: [1, 2, 3, 1],
      stats: { return: "true / false" },
    },
    wrong: {
      board: "Brute = O(n²)",
      say: "Har pair compare karo. Chalega. Par n bada ho to slow. Interview mein better chahiye.",
      sayEn: "Compare every pair. It works. But it is slow for large n. Interviews want better.",
      sayHi: "हर पेयर कम्पेयर करो। चलेगा। पर n बड़ा हो तो धीमा। इंटरव्यू में बेहतर चाहिए।",
      cells: [1, 2, 3, 1],
      stats: { brute: "every pair", time: "too slow" },
    },
    idea: {
      board: "Diary = unordered_set",
      say: "Better idea. Ek set rakho. Jo dekha, usme daalo. Pehle se hai to duplicate.",
      sayEn: "Better idea. Keep a set. Insert what you see. If it was already there, that is a duplicate.",
      sayHi: "बेहतर आइडिया। एक सेट रखो। जो देखा, उसमें डालो। पहले से है तो डुप्लिकेट।",
      cells: [1, 2, 3, 1],
      map: {},
      stats: { diary: "empty set" },
      codeLine: "unordered_set<int> seen;",
    },
    trick: {
      board: "count before insert",
      say: "Trick. Current pe aao. Pehle poocho — set mein hai? Hai to return true. Nahi to insert.",
      sayEn: "Trick. Stand on current. Ask first — is it in the set? If yes, return true. Else insert.",
      sayHi: "ट्रिक। करंट पर आओ। पहले पूछो — सेट में है? है तो ट्रू। नहीं तो इन्सर्ट।",
      cells: [1, 2, 3, 1],
      map: {},
      stats: { rule: "seen.count(x) ?" },
      codeLine: "if (seen.count(x)) return true;",
    },
    dryRuns: [
      {
        board: "i = 0 · insert 1",
        say: "Index zero. Value 1. Set khali. Insert. Ab set mein 1.",
        sayEn: "Index 0. Value 1. Set empty. Insert. Now the set holds 1.",
        sayHi: "इंडेक्स 0। वैल्यू 1। सेट खाली। इन्सर्ट। अब सेट में 1।",
        cells: [1, 2, 3, 1],
        hi: [0],
        pointers: { i: 0 },
        map: { "1": 1 },
        stats: { action: "insert 1" },
        codeLine: "seen.insert(1);",
        gesture: "write",
      },
      {
        board: "i = 1 · insert 2",
        say: "Index one. Value 2. Set mein nahi. Insert. Set: 1, 2.",
        sayEn: "Index 1. Value 2. Not in the set. Insert. Set: 1, 2.",
        sayHi: "इंडेक्स 1। वैल्यू 2। सेट में नहीं। इन्सर्ट। सेट: 1, 2।",
        cells: [1, 2, 3, 1],
        hi: [1],
        pointers: { i: 1 },
        map: { "1": 1, "2": 1 },
        stats: { action: "insert 2" },
      },
      {
        board: "i = 2 · insert 3",
        say: "Index two. Value 3. Naya hai. Insert. Ab tak sab clean.",
        sayEn: "Index 2. Value 3. New. Insert. Still all unique so far.",
        sayHi: "इंडेक्स 2। वैल्यू 3। नया है। इन्सर्ट। अभी तक सब क्लीन।",
        cells: [1, 2, 3, 1],
        hi: [2],
        pointers: { i: 2 },
        map: { "1": 1, "2": 1, "3": 1 },
        stats: { action: "insert 3" },
      },
      {
        board: "i = 3 · HIT!",
        say: "Index three. Value 1. Set kholo — 1 pehle se hai. Duplicate! Return true.",
        sayEn: "Index 3. Value 1. Open the set — 1 is already there. Duplicate! Return true.",
        sayHi: "इंडेक्स 3। वैल्यू 1। सेट खोलो — 1 पहले से है। डुप्लिकेट! ट्रू रिटर्न।",
        cells: [1, 2, 3, 1],
        hi: [0, 3],
        pointers: { i: 3 },
        map: { "1": 1, "2": 1, "3": 1 },
        stats: { found: "YES · duplicate 1" },
        codeLine: "return true;",
        gesture: "celebrate",
      },
    ],
    wrap: {
      board: "One pass. Done.",
      say: "Bas. Ek baar scan. Set se turant pata. Time O(n), space O(n). Ab tum code likho.",
      sayEn: "Done. One scan. The set answers instantly. Time O(n), space O(n). Now you type the code.",
      sayHi: "बस। एक बार स्कैन। सेट से तुरंत पता। टाइम O(n), स्पेस O(n)। अब खुद कोड लिखो।",
      cells: [1, 2, 3, 1],
      hi: [0, 3],
      map: { "1": 1, "2": 1, "3": 1 },
      stats: { answer: "true", time: "one pass" },
    },
  })
);

early.push(
  course({
    id: "best-time-stock-show",
    title: "Best Time to Buy & Sell — Min So Far",
    subtitle: "Track cheapest buy behind you; profit = price − minSoFar.",
    kind: "array-scan",
    practiceIds: ["best-time-stock"],
    hook: {
      board: "Buy Low, Sell High",
      say: "Suno. Prices din ke according. Ek baar buy, ek baar sell. Max profit chahiye.",
      sayEn: "Listen. Daily prices. One buy, one sell. Maximize profit.",
      sayHi: "सुनो। रोज़ की कीमतें। एक बार खरीद, एक बार बेच। मैक्स प्रॉफिट चाहिए।",
      cells: [7, 1, 5, 3, 6, 4],
      stats: { ask: "max one-trade profit?" },
    },
    contract: {
      board: "Sell after buy",
      say: "Pehle kharidna, baad mein bechna. Agar profit possible nahi, answer zero.",
      sayEn: "Buy first, sell later. If no profit is possible, answer is zero.",
      sayHi: "पहले खरीदना, बाद में बेचना। अगर प्रॉफिट संभव नहीं, जवाब ज़ीरो।",
      cells: [7, 1, 5, 3, 6, 4],
      stats: { return: "max profit int" },
    },
    wrong: {
      board: "Every buy/sell pair",
      say: "Har buy-sell pair try karo. O(n²). Chalega par slow. Better hai.",
      sayEn: "Try every buy-sell pair. O(n²). Works but slow. There is better.",
      sayHi: "हर बाय-सेल पेयर ट्राई करो। O(n²)। चलेगा पर धीमा। बेहतर है।",
      cells: [7, 1, 5, 3, 6, 4],
      stats: { brute: "all pairs", time: "O(n²)" },
    },
    idea: {
      board: "minPrice so far",
      say: "Idea. Aaj tak ka sabse sasta price yaad rakho. Aaj becho to profit = aaj − min.",
      sayEn: "Idea. Remember the cheapest price so far. Profit today = today − that min.",
      sayHi: "आइडिया। आज तक का सबसे सस्ता प्राइस याद रखो। आज बेचो तो प्रॉफिट = आज − मिन।",
      cells: [7, 1, 5, 3, 6, 4],
      stats: { track: "minPrice + maxProfit" },
      codeLine: "int minP = INT_MAX, ans = 0;",
    },
    trick: {
      board: "Update both each day",
      say: "Har din: min update karo, phir profit update. Order matter karta hai — pehle min, phir ans.",
      sayEn: "Each day: update min, then update profit. Order matters — min first, then ans.",
      sayHi: "हर दिन: मिन अपडेट, फिर प्रॉफिट। ऑर्डर मायने रखता है — पहले मिन, फिर ऐन्स।",
      cells: [7, 1, 5, 3, 6, 4],
      stats: { order: "min then profit" },
      codeLine: "minP = min(minP, p); ans = max(ans, p - minP);",
    },
    dryRuns: [
      {
        board: "day 0 · price 7",
        say: "Din zero. Price 7. Min banta 7. Profit 0. Abhi kuch nahi.",
        sayEn: "Day 0. Price 7. Min becomes 7. Profit 0. Nothing yet.",
        sayHi: "दिन 0। प्राइस 7। मिन 7। प्रॉफिट 0। अभी कुछ नहीं।",
        cells: [7, 1, 5, 3, 6, 4],
        hi: [0],
        pointers: { i: 0 },
        stats: { minP: 7, ans: 0 },
      },
      {
        board: "day 1 · cheaper 1",
        say: "Din one. Price 1. Yeh sasta! Min = 1. Profit abhi bhi 0.",
        sayEn: "Day 1. Price 1. Cheaper! Min = 1. Profit still 0.",
        sayHi: "दिन 1। प्राइस 1। सस्ता! मिन = 1। प्रॉफिट अभी भी 0।",
        cells: [7, 1, 5, 3, 6, 4],
        hi: [1],
        pointers: { i: 1 },
        stats: { minP: 1, ans: 0 },
        gesture: "write",
      },
      {
        board: "day 2 · profit 4",
        say: "Din two. Price 5. Profit 5 minus 1 = 4. Ans = 4.",
        sayEn: "Day 2. Price 5. Profit 5 minus 1 = 4. Ans = 4.",
        sayHi: "दिन 2। प्राइस 5। प्रॉफिट 5 माइनस 1 = 4। ऐन्स = 4।",
        cells: [7, 1, 5, 3, 6, 4],
        hi: [1, 2],
        pointers: { i: 2 },
        stats: { minP: 1, ans: 4 },
      },
      {
        board: "day 4 · best 5",
        say: "Din four. Price 6. Profit 6 minus 1 = 5. Best update! Ans = 5.",
        sayEn: "Day 4. Price 6. Profit 6 minus 1 = 5. Best update! Ans = 5.",
        sayHi: "दिन 4। प्राइस 6। प्रॉफिट 6 माइनस 1 = 5। बेस्ट अपडेट! ऐन्स = 5।",
        cells: [7, 1, 5, 3, 6, 4],
        hi: [1, 4],
        pointers: { i: 4 },
        stats: { minP: 1, ans: 5 },
        codeLine: "return ans; // 5",
        gesture: "celebrate",
      },
    ],
    wrap: {
      board: "One pass. Done.",
      say: "Answer paanch. Buy at 1, sell at 6. Ek scan. Ab tum likho.",
      sayEn: "Answer is five. Buy at 1, sell at 6. One scan. Now you write it.",
      sayHi: "जवाब पाँच। 1 पर खरीद, 6 पर बेच। एक स्कैन। अब तुम लिखो।",
      cells: [7, 1, 5, 3, 6, 4],
      hi: [1, 4],
      stats: { answer: 5, time: "O(n)" },
    },
  })
);

// Pull remaining early shows (plus-one … permutation) from previous generated file via dynamic extract,
// OR redefine the ones we already have as recipeShow in gen script.
// Simplest: import EARLY_REST from extracting the good shows already in teacher-shows-bank.ts

const bankMod = await import(pathToFileURL(oldPath).href + "?t=" + Date.now()).catch(() => null);

const EARLY_IDS = [
  "plus-one-show",
  "rotate-array-show",
  "valid-palindrome-show",
  "three-sum-show",
  "group-anagrams-show",
  "top-k-frequent-show",
  "remove-duplicates-show",
  "max-avg-show",
  "min-window-show",
  "permutation-string-show",
];

const earlyRest = [];
if (bankMod?.EXTRA_SHOWS) {
  for (const id of EARLY_IDS) {
    if (bankMod.EXTRA_SHOWS[id]) earlyRest.push(bankMod.EXTRA_SHOWS[id]);
  }
}

const waveAll = [...WAVE3, ...WAVE3B, ...WAVE3C];
// Dedupe WAVE3 in case push duplicated
const waveById = new Map();
for (const s of waveAll) waveById.set(s.id, s);

const REQUIRED = [
  "contains-duplicate-show", "best-time-stock-show", "plus-one-show", "rotate-array-show",
  "valid-palindrome-show", "three-sum-show", "group-anagrams-show", "top-k-frequent-show",
  "remove-duplicates-show", "max-avg-show", "min-window-show", "permutation-string-show",
  "missing-number-show", "single-number-show", "majority-show", "merge-sorted-show",
  "sort-colors-show", "product-except-show", "first-unique-show", "isomorphic-show",
  "happy-number-show", "longest-consecutive-show", "two-sum-ii-show", "squares-sorted-show",
  "trapping-rain-show", "find-anagrams-show", "valid-paren-show", "daily-temp-show",
  "reverse-ll-show", "merge-lists-show", "linked-cycle-show", "invert-tree-show",
  "max-depth-show", "same-tree-show", "climb-stairs-show", "house-robber-show",
  "coin-change-show", "intersection-show", "max-consec-ones-show", "search-insert-show",
  "first-last-show", "min-stack-show", "max-consec-iii-show",
];

const byId = new Map();
for (const s of [...early, ...earlyRest, ...waveById.values()]) byId.set(s.id, s);

const missing = REQUIRED.filter((id) => !byId.has(id));
if (missing.length) {
  console.error("MISSING:", missing);
  process.exit(1);
}

// Validate step counts and sayHi Devanagari-ish
for (const id of REQUIRED) {
  const s = byId.get(id);
  if (s.steps.length < 8 || s.steps.length > 12) {
    console.error(`Bad step count ${id}: ${s.steps.length}`);
    process.exit(1);
  }
  for (const st of s.steps) {
    if (!st.sayEn || !st.sayHi) {
      console.error(`Missing bilingual on ${id}`);
      process.exit(1);
    }
  }
}

const ordered = REQUIRED.map((id) => byId.get(id));

const PROBLEM_SHOW_EXTRA = {
  "contains-duplicate": "contains-duplicate-show",
  "best-time-stock": "best-time-stock-show",
  "plus-one": "plus-one-show",
  "rotate-array": "rotate-array-show",
  "valid-palindrome": "valid-palindrome-show",
  "three-sum": "three-sum-show",
  "group-anagrams": "group-anagrams-show",
  "top-k-frequent": "top-k-frequent-show",
  "remove-duplicates-sorted": "remove-duplicates-show",
  "max-avg-subarray": "max-avg-show",
  "min-window-substring": "min-window-show",
  "permutation-in-string": "permutation-string-show",
  "missing-number": "missing-number-show",
  "single-number": "single-number-show",
  "majority-element": "majority-show",
  "merge-sorted-array": "merge-sorted-show",
  "sort-colors": "sort-colors-show",
  "product-except-self": "product-except-show",
  "first-unique-char": "first-unique-show",
  "isomorphic-strings": "isomorphic-show",
  "happy-number": "happy-number-show",
  "longest-consecutive": "longest-consecutive-show",
  "two-sum-ii": "two-sum-ii-show",
  "squares-sorted": "squares-sorted-show",
  "trapping-rain": "trapping-rain-show",
  "find-anagrams": "find-anagrams-show",
  "valid-parentheses": "valid-paren-show",
  "daily-temperatures": "daily-temp-show",
  "reverse-linked-list": "reverse-ll-show",
  "merge-two-lists": "merge-lists-show",
  "linked-list-cycle": "linked-cycle-show",
  "invert-binary-tree": "invert-tree-show",
  "max-depth-tree": "max-depth-show",
  "same-tree": "same-tree-show",
  "climb-stairs": "climb-stairs-show",
  "house-robber": "house-robber-show",
  "coin-change": "coin-change-show",
  "intersection-two-arrays-ii": "intersection-show",
  "max-consecutive-ones": "max-consec-ones-show",
  "search-insert": "search-insert-show",
  "first-last-position": "first-last-show",
  "min-stack": "min-stack-show",
  "max-consec-ones-iii": "max-consec-iii-show",
};

const body = `import type { ShowStep, TeacherShowScript, ShowKind } from "./teacher-shows";

/** Extra YouTube-style dry-run scripts (course quality). */
export const EXTRA_SHOWS: Record<string, TeacherShowScript> = {
${ordered.map(showTs).join(",\n")},
};

/** problemId → showId for bank / curriculum problems covered here */
export const PROBLEM_SHOW_EXTRA: Record<string, string> = {
${Object.entries(PROBLEM_SHOW_EXTRA)
  .map(([k, v]) => `  "${k}": "${v}",`)
  .join("\n")}
};

/** Re-export type anchors so ShowStep / ShowKind imports stay intentional */
export type _ShowBankTypes = ShowStep | ShowKind | TeacherShowScript;
`;

fs.writeFileSync(outPath, body, "utf8");
console.log("Wrote", outPath);
console.log("EXTRA_SHOWS keys:", ordered.length);
for (const s of ordered) console.log(`  ${s.id}: ${s.steps.length} steps`);
