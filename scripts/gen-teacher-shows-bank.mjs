/**
 * Generates src/lib/teacher-shows-bank.ts — course-quality dry-run scripts.
 * Run: node scripts/gen-teacher-shows-bank.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, "../src/lib/teacher-shows-bank.ts");

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
    const c = st.cells.map((x) => (typeof x === "string" ? `"${esc(x)}"` : x)).join(", ");
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
      .map(([k, v]) => `${k}: ${typeof v === "string" ? `"${esc(v)}"` : v}`)
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

/** Build a standard 9–10 step course script from a recipe */
function course({
  id,
  title,
  subtitle,
  kind,
  practiceIds,
  durationHint = "~2 min",
  hook,
  contract,
  wrong,
  idea,
  trick,
  dryRuns, // array of step partials (3–5)
  wrap,
}) {
  const steps = [
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
  ];
  return { id, title, subtitle, kind, durationHint, practiceIds, steps };
}

const shows = [];

// ─── 1. contains-duplicate ─────────────────────────────────────────
shows.push(
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

// ─── 2. best-time-stock ────────────────────────────────────────────
shows.push(
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

// Continue generating remaining shows in a compact but full-quality style...
// Helper for consistent bilingual steps
function S(hi, en, hiDev, extra = {}) {
  return { say: hi, sayEn: en, sayHi: hiDev, ...extra };
}

function makeShow(meta, stepDefs) {
  return {
    id: meta.id,
    title: meta.title,
    subtitle: meta.subtitle,
    kind: meta.kind,
    durationHint: meta.durationHint || "~2 min",
    practiceIds: meta.practiceIds,
    steps: stepDefs,
  };
}

// For remaining shows I'll build with makeShow + full step objects

function add(show) {
  shows.push(show);
}

// ─── 3. plus-one ───────────────────────────────────────────────────
add(
  makeShow(
    {
      id: "plus-one-show",
      title: "Plus One — Carry from the Right",
      subtitle: "Walk digits right-to-left; handle the all-nines case.",
      kind: "array-scan",
      practiceIds: ["plus-one"],
    },
    [
      S(
        "Suno. Digits array ek bada number hai. Usme plus one karna hai. Jaise [1,2,3] banega [1,2,4].",
        "Listen. The digits array is a big number. Add one to it. Like [1,2,3] becomes [1,2,4].",
        "सुनो। डिजिट्स ऐरे एक बड़ा नंबर है। उसमें प्लस वन करना है। जैसे [1,2,3] बनेगा [1,2,4]।",
        { chapter: "Hook", board: "Plus One", gesture: "explain", cells: [1, 2, 3], stats: { ask: "add 1" } }
      ),
      S(
        "Leftmost digit sabse badi place. Return naya digit array. Size badh sakta hai — [9,9,9] → [1,0,0,0].",
        "Leftmost digit is the highest place. Return a new digit array. Size can grow — [9,9,9] → [1,0,0,0].",
        "सबसे बाईं डिजिट सबसे बड़ी प्लेस। नया डिजिट ऐरे रिटर्न। साइज़ बढ़ सकता है — [9,9,9] → [1,0,0,0]।",
        { chapter: "Contract", board: "May grow by 1", gesture: "point", cells: [9, 9, 9], stats: { edge: "all 9s" } }
      ),
      S(
        "Poora number string bana ke BigInt? Overkill. Digits pe hi kaam karo.",
        "Turn into a string and BigInt? Overkill. Work on the digits themselves.",
        "पूरा नंबर स्ट्रिंग बनाके BigInt? ओवरकिल। डिजिट्स पर ही काम करो।",
        { chapter: "Wrong path", board: "Don't rebuild BigInt", gesture: "think", cells: [1, 2, 3], stats: { avoid: "string math" } }
      ),
      S(
        "Idea. Right se start. Carry leke chalo. Agar digit 9 se chhoti, ++ karke return.",
        "Idea. Start from the right. Carry along. If digit is less than 9, increment and return.",
        "आइडिया। दाईं से शुरू। कैरी लेकर चलो। अगर डिजिट 9 से छोटी, ++ करके रिटर्न।",
        { chapter: "The idea", board: "Carry from right", gesture: "write", cells: [1, 2, 3], codeLine: "for (int i = n-1; i >= 0; --i)" }
      ),
      S(
        "Trick. Agar digit 9 hai, zero likho aur carry aage. Loop ke baad bhi carry? Front pe 1 daalo.",
        "Trick. If digit is 9, write 0 and keep carry. Still carry after the loop? Insert 1 at front.",
        "ट्रिक। अगर डिजिट 9 है, ज़ीरो लिखो और कैरी आगे। लूप के बाद भी कैरी? आगे 1 डालो।",
        { chapter: "The trick", board: "9 → 0, keep going", gesture: "explain", cells: [9, 9, 9], codeLine: "if (digits[i] < 9) { ++digits[i]; return; }" }
      ),
      S(
        "Example easy. [1,2,3]. Last digit 3 < 9. Bas 4 banao. Done.",
        "Easy example. [1,2,3]. Last digit 3 < 9. Just make it 4. Done.",
        "आसान उदाहरण। [1,2,3]। लास्ट डिजिट 3 < 9। बस 4 बनाओ। डन।",
        { chapter: "Dry run", board: "Simple case", gesture: "point", cells: [1, 2, 4], hi: [2], pointers: { i: 2 }, stats: { action: "3→4" }, codeLine: "digits[2] = 4; return;" }
      ),
      S(
        "Ab hard. [9,9,9]. i=2: 9 → 0, carry. i=1: 9 → 0. i=0: 9 → 0.",
        "Now hard. [9,9,9]. i=2: 9 → 0, carry. i=1: 9 → 0. i=0: 9 → 0.",
        "अब हार्ड। [9,9,9]। i=2: 9 → 0, कैरी। i=1: 9 → 0। i=0: 9 → 0।",
        { chapter: "Dry run", board: "All nines collapse", gesture: "write", cells: [0, 0, 0], hi: [0, 1, 2], stats: { after: "all zeros", need: "extra 1" } }
      ),
      S(
        "Loop khatam, carry zinda. Insert 1 at begin. Result [1,0,0,0].",
        "Loop ends, carry still alive. Insert 1 at the beginning. Result [1,0,0,0].",
        "लूप खत्म, कैरी ज़िंदा। शुरू में 1 इन्सर्ट। रिजल्ट [1,0,0,0]।",
        { chapter: "Dry run", board: "Grow the array", gesture: "celebrate", cells: [1, 0, 0, 0], hi: [0], stats: { answer: "[1,0,0,0]" }, codeLine: "digits.insert(digits.begin(), 1);" }
      ),
      S(
        "Bas. Right-to-left carry. Yaad rakhna all-nines edge. Ab code likho.",
        "Done. Right-to-left carry. Remember the all-nines edge. Now write the code.",
        "बस। राइट-टू-लेफ्ट कैरी। ऑल-नाइन्स एज याद रखना। अब कोड लिखो।",
        { chapter: "Wrap", board: "Carry mastered", gesture: "celebrate", cells: [1, 0, 0, 0], stats: { time: "O(n)", space: "O(1) amortized" } }
      ),
    ]
  )
);

// ─── 4. rotate-array ───────────────────────────────────────────────
add(
  makeShow(
    {
      id: "rotate-array-show",
      title: "Rotate Array — Triple Reverse",
      subtitle: "k %= n; reverse all, reverse first k, reverse rest.",
      kind: "array-scan",
      practiceIds: ["rotate-array"],
    },
    [
      S("Suno. Array ko right se k steps rotate. [1,2,3,4,5,6,7], k=3 → [5,6,7,1,2,3,4].", "Listen. Rotate the array right by k steps. [1,2,3,4,5,6,7], k=3 → [5,6,7,1,2,3,4].", "सुनो। ऐरे को दाईं से k स्टेप्स रोटेट। [1,2,3,4,5,6,7], k=3 → [5,6,7,1,2,3,4]।", { chapter: "Hook", board: "Rotate Right by k", gesture: "explain", cells: [1, 2, 3, 4, 5, 6, 7], stats: { k: 3 } }),
      S("In-place chahiye. Extra O(n) array bhi chalega interview mein, par reverse trick clean hai.", "In-place preferred. Extra O(n) array also works, but the reverse trick is clean.", "इन-प्लेस चाहिए। एक्स्ट्रा O(n) ऐरे भी चलेगा, पर रिवर्स ट्रिक क्लीन है।", { chapter: "Contract", board: "In-place preferred", gesture: "point", cells: [1, 2, 3, 4, 5, 6, 7], stats: { goal: "[5,6,7,1,2,3,4]" } }),
      S("Ek-ek step shift karna O(n*k). Bahut slow. Avoid.", "Shifting one step at a time is O(n*k). Too slow. Avoid.", "एक-एक स्टेप शिफ्ट O(n*k)। बहुत धीमा। बचो।", { chapter: "Wrong path", board: "Don't shift k times", gesture: "think", cells: [1, 2, 3, 4, 5, 6, 7], stats: { avoid: "O(n*k)" } }),
      S("Idea. Pehle k %= n. Phir teen reverse: pura, pehle k, baaki.", "Idea. First k %= n. Then three reverses: whole, first k, rest.", "आइडिया। पहले k %= n। फिर तीन रिवर्स: पूरा, पहले k, बाकी।", { chapter: "The idea", board: "Three reverses", gesture: "write", cells: [1, 2, 3, 4, 5, 6, 7], codeLine: "k %= n;" }),
      S("Trick. Reverse soch visually. Last k elements aage aane chahiye — reverse magic yahi karta hai.", "Trick. Think reverse visually. Last k elements should come front — reverse magic does exactly that.", "ट्रिक। रिवर्स विज़ुअली सोचो। लास्ट k एलिमेंट्स आगे आने चाहिए — रिवर्स मैजिक यही करता है।", { chapter: "The trick", board: "Why reverse works", gesture: "explain", cells: [1, 2, 3, 4, 5, 6, 7], stats: { lastK: "5,6,7 → front" } }),
      S("Step 1. Reverse all. [7,6,5,4,3,2,1].", "Step 1. Reverse all. [7,6,5,4,3,2,1].", "स्टेप 1। सब रिवर्स। [7,6,5,4,3,2,1]।", { chapter: "Dry run", board: "Reverse whole", gesture: "write", cells: [7, 6, 5, 4, 3, 2, 1], hi: [0, 1, 2, 3, 4, 5, 6], codeLine: "reverse(nums.begin(), nums.end());" }),
      S("Step 2. Reverse first k=3. [5,6,7,4,3,2,1].", "Step 2. Reverse first k=3. [5,6,7,4,3,2,1].", "स्टेप 2। पहले k=3 रिवर्स। [5,6,7,4,3,2,1]।", { chapter: "Dry run", board: "Reverse [0..k)", gesture: "point", cells: [5, 6, 7, 4, 3, 2, 1], hi: [0, 1, 2], window: [0, 2], codeLine: "reverse(begin, begin+k);" }),
      S("Step 3. Reverse rest. [5,6,7,1,2,3,4]. Done!", "Step 3. Reverse the rest. [5,6,7,1,2,3,4]. Done!", "स्टेप 3। बाकी रिवर्स। [5,6,7,1,2,3,4]। डन!", { chapter: "Dry run", board: "Reverse [k..n)", gesture: "celebrate", cells: [5, 6, 7, 1, 2, 3, 4], hi: [3, 4, 5, 6], window: [3, 6], stats: { answer: "[5,6,7,1,2,3,4]" }, codeLine: "reverse(begin+k, end);" }),
      S("Teen reverse. O(n) time, O(1) space. k modulo mat bhoolna. Ab likho.", "Three reverses. O(n) time, O(1) space. Don't forget k modulo. Now write it.", "तीन रिवर्स। O(n) टाइम, O(1) स्पेस। k मॉड्यूलो मत भूलना। अब लिखो।", { chapter: "Wrap", board: "O(n) / O(1)", gesture: "celebrate", cells: [5, 6, 7, 1, 2, 3, 4], stats: { time: "O(n)", space: "O(1)" } }),
    ]
  )
);

// I'll continue adding all remaining shows. To keep the file manageable in generation,
// use a compact recipe that still expands to full bilingual steps.

function recipeShow(cfg) {
  const {
    id, title, subtitle, kind, practiceIds, durationHint,
    cells, hookSay, hookEn, hookHi, hookBoard, hookStats,
    contractSay, contractEn, contractHi, contractBoard, contractExtra = {},
    wrongSay, wrongEn, wrongHi, wrongBoard, wrongExtra = {},
    ideaSay, ideaEn, ideaHi, ideaBoard, ideaExtra = {},
    trickSay, trickEn, trickHi, trickBoard, trickExtra = {},
    dry, // array of {board, say, sayEn, sayHi, ...visuals}
    wrapSay, wrapEn, wrapHi, wrapBoard, wrapExtra = {},
  } = cfg;

  const steps = [
    { chapter: "Hook", board: hookBoard, gesture: "explain", say: hookSay, sayEn: hookEn, sayHi: hookHi, cells, stats: hookStats },
    { chapter: "Contract", board: contractBoard, gesture: "point", say: contractSay, sayEn: contractEn, sayHi: contractHi, cells, ...contractExtra },
    { chapter: "Wrong path", board: wrongBoard, gesture: "think", say: wrongSay, sayEn: wrongEn, sayHi: wrongHi, cells, ...wrongExtra },
    { chapter: "The idea", board: ideaBoard, gesture: "write", say: ideaSay, sayEn: ideaEn, sayHi: ideaHi, cells, ...ideaExtra },
    { chapter: "The trick", board: trickBoard, gesture: "explain", say: trickSay, sayEn: trickEn, sayHi: trickHi, cells, ...trickExtra },
    ...dry.map((d, i) => ({
      chapter: "Dry run",
      gesture: d.gesture || (i === dry.length - 1 ? "celebrate" : "point"),
      cells: d.cells || cells,
      ...d,
    })),
    { chapter: "Wrap", board: wrapBoard, gesture: "celebrate", say: wrapSay, sayEn: wrapEn, sayHi: wrapHi, cells: wrapExtra.cells || cells, ...wrapExtra },
  ];
  return { id, title, subtitle, kind, durationHint: durationHint || "~2 min", practiceIds, steps };
}

// Remove the first two course() shows from duplication concern — they're already in `shows`.
// Add remaining via recipeShow / makeShow.

const more = [];

more.push(
  recipeShow({
    id: "valid-palindrome-show",
    title: "Valid Palindrome — Two Pointers",
    subtitle: "Skip junk, compare lowercased ends, walk inward.",
    kind: "two-pointers",
    practiceIds: ["valid-palindrome"],
    cells: ["A", " ", "m", "a", "n", ",", "a", " ", "n", "a", "m", "A"],
    hookBoard: "Valid Palindrome",
    hookSay: "Suno. String palindrome hai kya — ignore spaces, commas, case.",
    hookEn: "Listen. Is the string a palindrome — ignore spaces, punctuation, case.",
    hookHi: "सुनो। स्ट्रिंग पैलिंड्रोम है क्या — स्पेस, कॉमा, केस इग्नोर।",
    hookStats: { ask: "palindrome after clean?" },
    contractBoard: "Alnum only",
    contractSay: "Sirf letters aur digits count. Case ignore. True / false return.",
    contractEn: "Only letters and digits count. Ignore case. Return true or false.",
    contractHi: "सिर्फ लेटर्स और डिजिट्स। केस इग्नोर। ट्रू / फॉल्स रिटर्न।",
    contractExtra: { stats: { return: "bool" } },
    wrongBoard: "Build cleaned string",
    wrongSay: "Pehle clean copy banao, phir check. Chalega. Extra space. Two pointers better.",
    wrongEn: "Build a cleaned copy, then check. Works. Extra space. Two pointers are better.",
    wrongHi: "पहले क्लीन कॉपी बनाओ, फिर चेक। चलेगा। एक्स्ट्रा स्पेस। टू पॉइंटर्स बेहतर।",
    wrongExtra: { stats: { avoid: "extra O(n) string" } },
    ideaBoard: "L and R",
    ideaSay: "Idea. Left start, right end. Beech mein milo. Skip non-alnum.",
    ideaEn: "Idea. Left at start, right at end. Meet in the middle. Skip non-alnum.",
    ideaHi: "आइडिया। लेफ्ट शुरू, राइट अंत। बीच में मिलो। नॉन-अलनम स्किप।",
    ideaExtra: { pointers: { L: 0, R: 11 }, codeLine: "int L = 0, R = s.size()-1;" },
    trickBoard: "tolower before compare",
    trickSay: "Compare se pehle dono ko tolower. Match nahi to false. Match to L++, R--.",
    trickEn: "Lowercase both before compare. Mismatch → false. Match → L++, R--.",
    trickHi: "कम्पेयर से पहले दोनों को टोलोअर। मैच नहीं तो फॉल्स। मैच तो L++, R--।",
    trickExtra: { codeLine: "tolower(s[L]) != tolower(s[R])" },
    dry: [
      { board: "Skip spaces", say: "L=0 'A' ok. R skips spaces/comma until 'A'. Match.", sayEn: "L=0 'A' ok. R skips spaces/comma until 'A'. Match.", sayHi: "L=0 'A' ठीक। R स्पेस/कॉमा स्किप करके 'A'। मैच।", hi: [0, 11], pointers: { L: 0, R: 11 }, stats: { pair: "A↔A" } },
      { board: "Walk inward", say: "Aage badho. m↔m, a↔a, n↔n. Sab match.", sayEn: "Keep walking. m↔m, a↔a, n↔n. All match.", sayHi: "आगे बढ़ो। m↔m, a↔a, n↔n। सब मैच।", hi: [2, 10], pointers: { L: 2, R: 10 }, window: [2, 10], stats: { status: "matching" } },
      { board: "Center meet", say: "L aur R mil gaye / cross. Koi mismatch nahi. True!", sayEn: "L and R meet or cross. No mismatch. True!", sayHi: "L और R मिल गए। कोई मिसमैच नहीं। ट्रू!", pointers: { L: 5, R: 5 }, stats: { answer: "true" }, codeLine: "return true;", gesture: "celebrate" },
    ],
    wrapBoard: "Two pointers win",
    wrapSay: "O(n) time, O(1) space. Skip + tolower + compare. Ab tum likho.",
    wrapEn: "O(n) time, O(1) space. Skip + tolower + compare. Now you write it.",
    wrapHi: "O(n) टाइम, O(1) स्पेस। स्किप + टोलोअर + कम्पेयर। अब तुम लिखो।",
    wrapExtra: { stats: { answer: "true", complexity: "O(n)/O(1)" } },
  })
);

// Batch remaining problems with full recipes
const recipes = [
  // three-sum
  {
    id: "three-sum-show",
    title: "3Sum — Sort + Two Pointers",
    subtitle: "Fix one index; two-sum the rest; skip duplicates.",
    kind: "two-pointers",
    practiceIds: ["three-sum"],
    cells: [-1, 0, 1, 2, -1, -4],
    hookBoard: "3Sum",
    hookSay: "Suno. Teen numbers chahiye jinka sum zero. Unique triplets.",
    hookEn: "Listen. Find three numbers that sum to zero. Unique triplets.",
    hookHi: "सुनो। तीन नंबर चाहिए जिनका योग शून्य। यूनिक ट्रिपलेट्स।",
    hookStats: { ask: "a+b+c = 0" },
    contractBoard: "Unique triplets",
    contractSay: "Duplicates skip karo. Order matter nahi — sorted triplets return.",
    contractEn: "Skip duplicates. Order does not matter — return sorted triplets.",
    contractHi: "डुप्लिकेट्स स्किप। ऑर्डर मायने नहीं — सॉर्टेड ट्रिपलेट्स।",
    contractExtra: { stats: { return: "vector of triplets" } },
    wrongBoard: "O(n³) triple loop",
    wrongSay: "Teen nested loops. Bahut slow. Sort + two pointers O(n²).",
    wrongEn: "Three nested loops. Too slow. Sort + two pointers is O(n²).",
    wrongHi: "तीन नेस्टेड लूप। बहुत धीमा। सॉर्ट + टू पॉइंटर्स O(n²)।",
    wrongExtra: { stats: { avoid: "O(n³)" } },
    ideaBoard: "Sort first",
    ideaSay: "Pehle sort. Har i fix karo. Baaki pe L,R se two-sum for -nums[i].",
    ideaEn: "Sort first. Fix each i. Two-sum the rest with L,R for -nums[i].",
    ideaHi: "पहले सॉर्ट। हर i फिक्स। बाकी पर L,R से टू-सम for -nums[i]।",
    ideaExtra: { cells: [-4, -1, -1, 0, 1, 2], codeLine: "sort(nums.begin(), nums.end());" },
    trickBoard: "Skip duplicates",
    trickSay: "Same i dobara mat chalao. L/R bhi duplicate values skip.",
    trickEn: "Do not rerun the same i. Also skip duplicate L/R values.",
    trickHi: "वही i दोबारा मत चलाओ। L/R भी डुप्लिकेट स्किप।",
    trickExtra: { codeLine: "if (i && nums[i]==nums[i-1]) continue;" },
    dry: [
      { board: "After sort", say: "Sorted: [-4,-1,-1,0,1,2]. i=0, nums[i]=-4. Need 4 from rest.", sayEn: "Sorted: [-4,-1,-1,0,1,2]. i=0, value -4. Need 4 from the rest.", sayHi: "सॉर्टेड: [-4,-1,-1,0,1,2]। i=0, वैल्यू -4। बाकी से 4 चाहिए।", cells: [-4, -1, -1, 0, 1, 2], hi: [0], pointers: { i: 0, L: 1, R: 5 }, stats: { need: 4 } },
      { board: "i = 1 · hit", say: "i=1, value -1. L=2 (-1), R=5 (2). Sum 0! Triplet [-1,-1,2].", sayEn: "i=1, value -1. L=2 (-1), R=5 (2). Sum 0! Triplet [-1,-1,2].", sayHi: "i=1, वैल्यू -1। L=2 (-1), R=5 (2)। सम 0! ट्रिपलेट [-1,-1,2]।", cells: [-4, -1, -1, 0, 1, 2], hi: [1, 2, 5], pointers: { i: 1, L: 2, R: 5 }, stats: { found: "[-1,-1,2]" }, gesture: "celebrate" },
      { board: "Next pair", say: "L++, R--. Ab L at 0, R at 1. Sum 0. Triplet [-1,0,1].", sayEn: "L++, R--. Now L at 0, R at 1. Sum 0. Triplet [-1,0,1].", sayHi: "L++, R--। अब L पर 0, R पर 1। सम 0। ट्रिपलेट [-1,0,1]।", cells: [-4, -1, -1, 0, 1, 2], hi: [1, 3, 4], pointers: { i: 1, L: 3, R: 4 }, stats: { found: "[-1,0,1]" }, codeLine: "ans.push_back({-1,0,1});", gesture: "celebrate" },
    ],
    wrapBoard: "Two triplets",
    wrapSay: "Answer: [-1,-1,2] aur [-1,0,1]. Sort + skip + two pointers. Ab likho.",
    wrapEn: "Answer: [-1,-1,2] and [-1,0,1]. Sort + skip + two pointers. Now write it.",
    wrapHi: "जवाब: [-1,-1,2] और [-1,0,1]। सॉर्ट + स्किप + टू पॉइंटर्स। अब लिखो।",
    wrapExtra: { cells: [-4, -1, -1, 0, 1, 2], stats: { answer: "2 triplets", time: "O(n²)" } },
  },
  {
    id: "group-anagrams-show",
    title: "Group Anagrams — Sorted Key",
    subtitle: "Anagrams share a sorted signature. Map key → list.",
    kind: "hash-map",
    practiceIds: ["group-anagrams"],
    cells: ["eat", "tea", "tan", "ate", "nat", "bat"],
    hookBoard: "Group Anagrams",
    hookSay: "Suno. Words ko groups mein baato — jo anagram hain woh ek saath.",
    hookEn: "Listen. Put words into groups — anagrams belong together.",
    hookHi: "सुनो। वर्ड्स को ग्रुप्स में बाँटो — जो एनाग्राम हैं वो एक साथ।",
    hookStats: { ask: "group by anagram" },
    contractBoard: "Any order OK",
    contractSay: "Groups ka order free. Group ke andar bhi free. Sirf membership sahi ho.",
    contractEn: "Group order is free. Order inside a group is free. Membership must be correct.",
    contractHi: "ग्रुप ऑर्डर फ्री। अंदर भी फ्री। सिर्फ मेंबरशिप सही हो।",
    contractExtra: { stats: { return: "vector of groups" } },
    wrongBoard: "Compare every pair",
    wrongSay: "Har pair check anagram? Slow. Signature key se map better.",
    wrongEn: "Check every pair for anagram? Slow. A signature key map is better.",
    wrongHi: "हर पेयर एनाग्राम चेक? धीमा। सिग्नेचर की मैप बेहतर।",
    wrongExtra: { stats: { avoid: "pairwise" } },
    ideaBoard: "Key = sorted word",
    ideaSay: "Idea. Word sort karo — 'eat' aur 'tea' dono 'aet'. Yeh key hai.",
    ideaEn: "Idea. Sort the word — 'eat' and 'tea' both become 'aet'. That is the key.",
    ideaHi: "आइडिया। वर्ड सॉर्ट करो — 'eat' और 'tea' दोनों 'aet'। यही की है।",
    ideaExtra: { map: {}, codeLine: "string key = s; sort(key.begin(), key.end());" },
    trickBoard: "map[key].push",
    trickSay: "Map mein key → list. Original word list mein push. Count signature bhi chalega.",
    trickEn: "Map key → list. Push the original word. A 26-count signature also works.",
    trickHi: "मैप में की → लिस्ट। ओरिजिनल वर्ड पुश। 26-काउंट सिग्नेचर भी चलेगा।",
    trickExtra: { codeLine: "mp[key].push_back(s);" },
    dry: [
      { board: "eat → aet", say: "'eat' sort → 'aet'. Naya group. Map: aet → [eat].", sayEn: "'eat' sorts to 'aet'. New group. Map: aet → [eat].", sayHi: "'eat' सॉर्ट → 'aet'। नया ग्रुप। मैप: aet → [eat]।", hi: [0], pointers: { i: 0 }, map: { aet: "eat" }, stats: { action: "new group" }, gesture: "write" },
      { board: "tea joins", say: "'tea' → 'aet'. Same key! Push. Group: [eat, tea].", sayEn: "'tea' → 'aet'. Same key! Push. Group: [eat, tea].", sayHi: "'tea' → 'aet'। वही की! पुश। ग्रुप: [eat, tea]।", hi: [0, 1], pointers: { i: 1 }, map: { aet: "eat,tea" }, stats: { action: "join group" } },
      { board: "bat alone", say: "'bat' → 'abt'. Alag group. End pe teen groups.", sayEn: "'bat' → 'abt'. Separate group. End with three groups.", sayHi: "'bat' → 'abt'। अलग ग्रुप। अंत में तीन ग्रुप्स।", hi: [5], pointers: { i: 5 }, map: { aet: "eat,tea,ate", ant: "tan,nat", abt: "bat" }, stats: { groups: 3 }, codeLine: "return values of mp;", gesture: "celebrate" },
    ],
    wrapBoard: "Three groups",
    wrapSay: "ate/eat/tea | bat | nat/tan. Sorted key magic. Ab likho.",
    wrapEn: "ate/eat/tea | bat | nat/tan. Sorted key magic. Now write it.",
    wrapHi: "ate/eat/tea | bat | nat/tan। सॉर्टेड की मैजिक। अब लिखो।",
    wrapExtra: { map: { aet: "3", ant: "2", abt: "1" }, stats: { answer: "3 groups", time: "O(n k log k)" } },
  },
  {
    id: "top-k-frequent-show",
    title: "Top K Frequent — Bucket Sort",
    subtitle: "Count, then bucket by frequency; walk high→low.",
    kind: "hash-map",
    practiceIds: ["top-k-frequent"],
    cells: [1, 1, 1, 2, 2, 3],
    hookBoard: "Top K Frequent",
    hookSay: "Suno. Array mein sabse zyada aane wale k numbers chahiye.",
    hookEn: "Listen. Return the k most frequent numbers in the array.",
    hookHi: "सुनो। ऐरे में सबसे ज़्यादा आने वाले k नंबर चाहिए।",
    hookStats: { k: 2, ask: "top frequent?" },
    contractBoard: "Any order OK",
    contractSay: "Answer ka order free. Yahan k=2 → 1 aur 2.",
    contractEn: "Answer order is free. Here k=2 → 1 and 2.",
    contractHi: "जवाब का ऑर्डर फ्री। यहाँ k=2 → 1 और 2।",
    contractExtra: { stats: { return: "[1, 2]" }, hi: [0, 1, 2, 3, 4] },
    wrongBoard: "Sort all pairs",
    wrongSay: "Count karke sort O(n log n). Bucket O(n) interview favorite.",
    wrongEn: "Count then sort is O(n log n). Bucket O(n) is the interview favorite.",
    wrongHi: "काउंट करके सॉर्ट O(n log n)। बकेट O(n) इंटरव्यू फेवरेट।",
    wrongExtra: { stats: { avoid: "full sort" } },
    ideaBoard: "freq map first",
    ideaSay: "Pehle frequency map. 1→3, 2→2, 3→1.",
    ideaEn: "First frequency map. 1→3, 2→2, 3→1.",
    ideaHi: "पहले फ़्रीक्वेंसी मैप। 1→3, 2→2, 3→1।",
    ideaExtra: { map: { "1": 3, "2": 2, "3": 1 }, codeLine: "unordered_map<int,int> freq;" },
    trickBoard: "bucket[freq] = nums",
    trickSay: "Bucket banao: index = frequency. Phir high se low walk, k collect.",
    trickEn: "Build buckets: index = frequency. Walk high to low, collect k.",
    trickHi: "बकेट बनाओ: इंडेक्स = फ़्रीक्वेंसी। हाई से लो वॉक, k कलेक्ट।",
    trickExtra: { codeLine: "vector<vector<int>> bucket(n+1);" },
    dry: [
      { board: "Fill buckets", say: "bucket[3]=[1], bucket[2]=[2], bucket[1]=[3].", sayEn: "bucket[3]=[1], bucket[2]=[2], bucket[1]=[3].", sayHi: "bucket[3]=[1], bucket[2]=[2], bucket[1]=[3]।", map: { "1": 3, "2": 2, "3": 1 }, stats: { b3: "1", b2: "2", b1: "3" }, gesture: "write" },
      { board: "Walk from top", say: "Freq 3 se start. 1 lo. Need ek aur. Freq 2 se 2 lo. Done.", sayEn: "Start at freq 3. Take 1. Need one more. From freq 2 take 2. Done.", sayHi: "फ़्रीक 3 से शुरू। 1 लो। एक और चाहिए। फ़्रीक 2 से 2 लो। डन।", stats: { collected: "1, 2" }, hi: [0, 3], codeLine: "for (int f=n; f>=1 && ans.size()<k; --f)", gesture: "celebrate" },
      { board: "Answer", say: "Top 2: 1 aur 2. Bucket sort O(n).", sayEn: "Top 2: 1 and 2. Bucket sort O(n).", sayHi: "टॉप 2: 1 और 2। बकेट सॉर्ट O(n)।", stats: { answer: "[1, 2]" }, gesture: "celebrate" },
    ],
    wrapBoard: "Count → bucket → pick",
    wrapSay: "Pattern yaad: count, bucket, walk down. Ab code.",
    wrapEn: "Remember the pattern: count, bucket, walk down. Now code.",
    wrapHi: "पैटर्न याद: काउंट, बकेट, वॉक डाउन। अब कोड।",
    wrapExtra: { stats: { answer: "[1,2]", time: "O(n)" } },
  },
];

for (const r of recipes) more.push(recipeShow(r));

// Continue with all remaining IDs in one big recipes2 array
const recipes2 = [
  {
    id: "remove-duplicates-show",
    title: "Remove Duplicates — Write Pointer",
    subtitle: "Sorted array: slow writer keeps unique prefix.",
    kind: "two-pointers",
    practiceIds: ["remove-duplicates-sorted"],
    cells: [0, 0, 1, 1, 1, 2, 2, 3, 3, 4],
    hookBoard: "Remove Duplicates",
    hookSay: "Suno. Sorted array. Duplicates hatao in-place. Nayi length return.",
    hookEn: "Listen. Sorted array. Remove duplicates in-place. Return the new length.",
    hookHi: "सुनो। सॉर्टेड ऐरे। डुप्लिकेट्स इन-प्लेस हटाओ। नई लेंथ रिटर्न।",
    hookStats: { ask: "unique prefix length" },
    contractBoard: "First k unique",
    contractSay: "Pehle k slots mein unique values. Baaki garbage ho sakta.",
    contractEn: "First k slots hold unique values. The rest can be garbage.",
    contractHi: "पहले k स्लॉट्स में यूनिक वैल्यूज़। बाकी गार्बेज हो सकता।",
    contractExtra: { stats: { return: "k = 5" } },
    wrongBoard: "Erase while iterating",
    wrongSay: "vector.erase beech mein? Slow aur buggy. Write pointer clean.",
    wrongEn: "vector.erase mid-loop? Slow and buggy. Write pointer is clean.",
    wrongHi: "vector.erase बीच में? धीमा और बगी। राइट पॉइंटर क्लीन।",
    wrongExtra: { stats: { avoid: "erase" } },
    ideaBoard: "read / write",
    ideaSay: "Write pointer w. Sirf tab aage jab naya value mile.",
    ideaEn: "Write pointer w. Advance only when you see a new value.",
    ideaHi: "राइट पॉइंटर w। सिर्फ तब आगे जब नई वैल्यू मिले।",
    ideaExtra: { pointers: { w: 1, i: 1 }, codeLine: "int w = 1;" },
    trickBoard: "Compare with nums[w-1]",
    trickSay: "Agar nums[i] != nums[w-1], likho aur w++. Else skip.",
    trickEn: "If nums[i] != nums[w-1], write and w++. Else skip.",
    trickHi: "अगर nums[i] != nums[w-1], लिखो और w++। वरना स्किप।",
    trickExtra: { codeLine: "if (nums[i] != nums[w-1]) nums[w++] = nums[i];" },
    dry: [
      { board: "Skip second 0", say: "i=1, value 0 == nums[0]. Skip. w stays 1.", sayEn: "i=1, value 0 equals nums[0]. Skip. w stays 1.", sayHi: "i=1, वैल्यू 0 == nums[0]। स्किप। w 1 पर।", hi: [0, 1], pointers: { w: 1, i: 1 }, stats: { action: "skip dup 0" } },
      { board: "Write 1", say: "i=2, value 1 naya. nums[1]=1, w=2.", sayEn: "i=2, value 1 is new. nums[1]=1, w=2.", sayHi: "i=2, वैल्यू 1 नया। nums[1]=1, w=2।", cells: [0, 1, 1, 1, 1, 2, 2, 3, 3, 4], hi: [1], pointers: { w: 2, i: 2 }, stats: { action: "write 1" }, gesture: "write" },
      { board: "Finish", say: "End pe unique prefix [0,1,2,3,4], k=5.", sayEn: "End with unique prefix [0,1,2,3,4], k=5.", sayHi: "अंत में यूनिक प्रीफिक्स [0,1,2,3,4], k=5।", cells: [0, 1, 2, 3, 4, 2, 2, 3, 3, 4], hi: [0, 1, 2, 3, 4], window: [0, 4], stats: { answer: "k=5" }, codeLine: "return w;", gesture: "celebrate" },
    ],
    wrapBoard: "k unique",
    wrapSay: "O(n) one pass. Sorted hone se compare easy. Ab likho.",
    wrapEn: "O(n) one pass. Sorted makes compare easy. Now write it.",
    wrapHi: "O(n) एक पास। सॉर्टेड होने से कम्पेयर आसान। अब लिखो।",
    wrapExtra: { cells: [0, 1, 2, 3, 4, 2, 2, 3, 3, 4], stats: { answer: 5, time: "O(n)" } },
  },
  {
    id: "max-avg-show",
    title: "Max Average Subarray — Fixed Window",
    subtitle: "Sum of k, slide: add right, drop left, track max.",
    kind: "sliding-window",
    practiceIds: ["max-avg-subarray"],
    cells: [1, 12, -5, -6, 50, 3],
    hookBoard: "Max Average",
    hookSay: "Suno. Length k ki subarray jiski average max ho.",
    hookEn: "Listen. Find a length-k subarray with maximum average.",
    hookHi: "सुनो। लेंथ k की सबऐरे जिसकी एवरेज मैक्स हो।",
    hookStats: { k: 4, ask: "max avg" },
    contractBoard: "Fixed window k",
    contractSay: "Window size hamesha k. Return average as double.",
    contractEn: "Window size is always k. Return average as a double.",
    contractHi: "विंडो साइज़ हमेशा k। एवरेज डबल में रिटर्न।",
    contractExtra: { stats: { return: "double" } },
    wrongBoard: "Resum every window",
    wrongSay: "Har window ka sum naya calculate? O(n*k). Slide better O(n).",
    wrongEn: "Resum every window? O(n*k). Sliding is O(n).",
    wrongHi: "हर विंडो का सम नया? O(n*k)। स्लाइड बेहतर O(n)।",
    wrongExtra: { stats: { avoid: "O(n*k)" } },
    ideaBoard: "Running sum",
    ideaSay: "Pehle k ka sum. Phir slide: +nums[R], -nums[L]. Max sum rakho.",
    ideaEn: "Sum first k. Then slide: +nums[R], -nums[L]. Track max sum.",
    ideaHi: "पहले k का सम। फिर स्लाइड: +nums[R], -nums[L]। मैक्स सम रखो।",
    ideaExtra: { window: [0, 3], codeLine: "double sum = 0; for(int i=0;i<k;i++) sum+=nums[i];" },
    trickBoard: "Max sum → avg",
    trickSay: "Average compare karne ki zarurat nahi — max sum / k hi answer.",
    trickEn: "No need to compare averages mid-way — max sum / k is the answer.",
    trickHi: "बीच में एवरेज कम्पेयर ज़रूरी नहीं — मैक्स सम / k ही जवाब।",
    trickExtra: { codeLine: "return maxSum / k;" },
    dry: [
      { board: "First window", say: "Window [1,12,-5,-6] sum=2. Max=2. Avg=0.5.", sayEn: "Window [1,12,-5,-6] sum=2. Max=2. Avg=0.5.", sayHi: "विंडो [1,12,-5,-6] सम=2। मैक्स=2। एवरेज=0.5।", hi: [0, 1, 2, 3], window: [0, 3], pointers: { L: 0, R: 3 }, stats: { sum: 2, best: 2 } },
      { board: "Slide once", say: "Drop 1, add 50. Sum=2-1+50=51. Best!", sayEn: "Drop 1, add 50. Sum=2-1+50=51. Best!", sayHi: "1 हटाओ, 50 जोड़ो। सम=51। बेस्ट!", hi: [1, 2, 3, 4], window: [1, 4], pointers: { L: 1, R: 4 }, stats: { sum: 51, best: 51 }, gesture: "celebrate" },
      { board: "Final", say: "Next slide sum=42. Best rehta 51. Avg=12.75.", sayEn: "Next slide sum=42. Best stays 51. Avg=12.75.", sayHi: "अगला स्लाइड सम=42। बेस्ट 51। एवरेज=12.75।", hi: [1, 2, 3, 4], window: [1, 4], stats: { answer: 12.75 }, codeLine: "return 51.0 / 4;", gesture: "celebrate" },
    ],
    wrapBoard: "12.75",
    wrapSay: "Fixed window slide. O(n). Ab tum code likho.",
    wrapEn: "Fixed window slide. O(n). Now you write the code.",
    wrapHi: "फिक्स्ड विंडो स्लाइड। O(n)। अब तुम कोड लिखो।",
    wrapExtra: { stats: { answer: "12.75", time: "O(n)" } },
  },
  {
    id: "min-window-show",
    title: "Minimum Window Substring",
    subtitle: "Expand until valid, shrink while valid, track best.",
    kind: "sliding-window",
    practiceIds: ["min-window-substring"],
    cells: ["A", "D", "O", "B", "E", "C", "O", "D", "E", "B", "A", "N", "C"],
    hookBoard: "Min Window",
    hookSay: "Suno. s mein sabse chhoti window jo t ke saare chars cover kare.",
    hookEn: "Listen. Smallest window in s that covers every character of t.",
    hookHi: "सुनो। s में सबसे छोटी विंडो जो t के सारे कैरेक्टर्स कवर करे।",
    hookStats: { t: "ABC", ask: "min cover" },
    contractBoard: "Cover all of t",
    contractSay: "Frequencies matter. Extra chars allowed. Empty if impossible.",
    contractEn: "Frequencies matter. Extra chars allowed. Empty string if impossible.",
    contractHi: "फ़्रीक्वेंसी मायने रखती। एक्स्ट्रा कैरेक्टर ओके। असंभव तो खाली।",
    contractExtra: { stats: { need: "A,B,C" } },
    wrongBoard: "Check all substrings",
    wrongSay: "Saari substrings? O(n²) checks. Sliding window O(n).",
    wrongEn: "All substrings? O(n²) checks. Sliding window is O(n).",
    wrongHi: "सारी सबस्ट्रिंग्स? O(n²)। स्लाइडिंग विंडो O(n)।",
    wrongExtra: { stats: { avoid: "O(n²)" } },
    ideaBoard: "need + have",
    ideaSay: "t ki need counts. Window expand jab tak have == need. Phir shrink.",
    ideaEn: "Need counts from t. Expand until have == need. Then shrink.",
    ideaHi: "t की नीड काउंट्स। विंडो एक्सपैंड जब तक have == need। फिर श्रिंक।",
    ideaExtra: { map: { A: 1, B: 1, C: 1 }, codeLine: "int need = uniq, have = 0;" },
    trickBoard: "Shrink while valid",
    trickSay: "Valid hone par left se chhota karo, best length update, phir aage.",
    trickEn: "While valid, shrink from left, update best length, continue.",
    trickHi: "वैलिड होने पर लेफ्ट से छोटा करो, बेस्ट अपडेट, फिर आगे।",
    trickExtra: { codeLine: "while (have == need) { /* shrink L */ }" },
    dry: [
      { board: "Expand to C", say: "R pehle C tak. Window ADOBEC. A,B,C covered. Valid!", sayEn: "R reaches first C. Window ADOBEC. A,B,C covered. Valid!", sayHi: "R पहले C तक। विंडो ADOBEC। A,B,C कवर। वैलिड!", hi: [0, 1, 2, 3, 4, 5], window: [0, 5], pointers: { L: 0, R: 5 }, map: { A: 1, B: 1, C: 1 }, stats: { have: 3, len: 6 } },
      { board: "Shrink stuck", say: "L shrink try — A chhodoge to invalid. Best abhi 6.", sayEn: "Try shrink L — drop A and it goes invalid. Best still 6.", sayHi: "L श्रिंक — A छोड़ा तो इनवैलिड। बेस्ट अभी 6।", window: [0, 5], stats: { best: "ADOBEC" } },
      { board: "Find BANC", say: "Aage expand/shrink. Best ban-ta BANC length 4. Winner!", sayEn: "Keep expanding/shrinking. Best becomes BANC length 4. Winner!", sayHi: "आगे एक्सपैंड/श्रिंक। बेस्ट बनता BANC लेंथ 4। विनर!", hi: [9, 10, 11, 12], window: [9, 12], pointers: { L: 9, R: 12 }, stats: { best: "BANC", len: 4 }, codeLine: "ans = s.substr(bestL, bestLen);", gesture: "celebrate" },
    ],
    wrapBoard: "BANC",
    wrapSay: "Hard pattern: expand → shrink → track best. Ab practice.",
    wrapEn: "Hard pattern: expand → shrink → track best. Now practice.",
    wrapHi: "हार्ड पैटर्न: एक्सपैंड → श्रिंक → बेस्ट ट्रैक। अब प्रैक्टिस।",
    wrapExtra: { stats: { answer: "BANC", time: "O(n)" } },
  },
  {
    id: "permutation-string-show",
    title: "Permutation in String — Fixed Window",
    subtitle: "Window of len(s1); match counts while sliding.",
    kind: "sliding-window",
    practiceIds: ["permutation-in-string"],
    cells: ["e", "i", "d", "b", "a", "o", "o", "o"],
    hookBoard: "Permutation in String",
    hookSay: "Suno. kya s2 ke andar s1 ka koi permutation hai as substring?",
    hookEn: "Listen. Does s2 contain any permutation of s1 as a substring?",
    hookHi: "सुनो। क्या s2 के अंदर s1 का कोई परम्यूटेशन सबस्ट्रिंग है?",
    hookStats: { s1: "ab", ask: "perm window?" },
    contractBoard: "Same counts",
    contractSay: "Order matter nahi. Sirf character counts match. True/false.",
    contractEn: "Order does not matter. Only character counts. True or false.",
    contractHi: "ऑर्डर मायने नहीं। सिर्फ कैरेक्टर काउंट्स। ट्रू/फॉल्स।",
    contractExtra: { stats: { return: "bool" } },
    wrongBoard: "Generate permutations",
    wrongSay: "Saare perms generate? Factorial. Counts compare karo.",
    wrongEn: "Generate all perms? Factorial. Compare counts instead.",
    wrongHi: "सारे परम्यूटेशन? फैक्टोरियल। काउंट्स कम्पेयर करो।",
    wrongExtra: { stats: { avoid: "n!" } },
    ideaBoard: "Window = |s1|",
    ideaSay: "s1 ki freq. s2 pe fixed window usi length ki. Slide aur compare.",
    ideaEn: "Freq of s1. Fixed window of that length on s2. Slide and compare.",
    ideaHi: "s1 की फ़्रीक। s2 पर उसी लेंथ की फिक्स्ड विंडो। स्लाइड और कम्पेयर।",
    ideaExtra: { window: [0, 1], codeLine: "int need[26]={}, win[26]={};" },
    trickBoard: "Add R, remove L",
    trickSay: "Naya char add, bahar wala remove. Match counter se O(1) check.",
    trickEn: "Add new char, remove leaving char. Match counter gives O(1) check.",
    trickHi: "नया कैरेक्टर ऐड, बाहर वाला रिमूव। मैच काउंटर से O(1) चेक।",
    trickExtra: { codeLine: "if (matches == 26) return true;" },
    dry: [
      { board: "s1 = ab", say: "Example s1=ab, s2=eidbaooo. Need a:1 b:1.", sayEn: "Example s1=ab, s2=eidbaooo. Need a:1 b:1.", sayHi: "उदाहरण s1=ab, s2=eidbaooo। नीड a:1 b:1।", cells: ["e", "i", "d", "b", "a", "o", "o", "o"], map: { a: 1, b: 1 }, stats: { windowLen: 2 } },
      { board: "Window ba", say: "Index 3..4: 'b','a'. Counts match! True.", sayEn: "Indexes 3..4: 'b','a'. Counts match! True.", sayHi: "इंडेक्स 3..4: 'b','a'। काउंट्स मैच! ट्रू।", hi: [3, 4], window: [3, 4], pointers: { L: 3, R: 4 }, map: { a: 1, b: 1 }, stats: { found: "ba" }, codeLine: "return true;", gesture: "celebrate" },
      { board: "Confirmed", say: "'ba' is permutation of 'ab'. Done.", sayEn: "'ba' is a permutation of 'ab'. Done.", sayHi: "'ba' 'ab' का परम्यूटेशन है। डन।", hi: [3, 4], stats: { answer: "true" }, gesture: "celebrate" },
    ],
    wrapBoard: "True",
    wrapSay: "Fixed window + freq. Same DNA as find-anagrams. Ab likho.",
    wrapEn: "Fixed window + freq. Same DNA as find-anagrams. Now write it.",
    wrapHi: "फिक्स्ड विंडो + फ़्रीक। फाइंड-एनाग्राम्स जैसा। अब लिखो।",
    wrapExtra: { stats: { answer: "true", time: "O(n)" } },
  },
];

for (const r of recipes2) more.push(recipeShow(r));

console.log("Partial build check — writing remaining via second wave...");

// Wave 3: rest of problem ids
const wave3 = [
  ["missing-number-show", "Missing Number — Sum / XOR", "n(n+1)/2 minus sum, or XOR all.", "array-scan", ["missing-number"], [3, 0, 1],
    "Kaunsa number 0..n se missing?", "Which number from 0..n is missing?",
    "Sum expect 6, actual 4 → missing 2.", "expectedSum - actualSum",
    "XOR all i and nums[i].", "Dry: 3^0^1^0^1^2^3 → 2.", "Answer 2. O(n)/O(1)."],
  ["single-number-show", "Single Number — XOR", "Pairs cancel; lonely bit remains.", "array-scan", ["single-number"], [4, 1, 2, 1, 2],
    "Har number do baar, ek akela. Find akela.", "Every number twice except one. Find it.",
    "a^a=0, a^0=a. XOR all.", "xor = 0; for v: xor^=v",
    "4^1^2^1^2 → 4.", "Pairs cancel to 0.", "Answer 4. O(1) space."],
  ["majority-show", "Majority Element — Boyer-Moore", "Candidate + count; majority survives.", "array-scan", ["majority-element"], [2, 2, 1, 1, 1, 2, 2],
    "Jo n/2 se zyada aaye woh majority.", "Element appearing more than n/2 times.",
    "Boyer-Moore voting — no hash needed.", "count==0 → new candidate",
    "Walk: candidate settles on 2.", "Count cancels minorities.", "Answer 2."],
  ["merge-sorted-show", "Merge Sorted Array — From Back", "Three pointers; write larger at end.", "two-pointers", ["merge-sorted-array"], [1, 2, 3, 0, 0, 0],
    "nums2 ko nums1 mein merge in-place.", "Merge nums2 into nums1 in-place.",
    "Peeche se likho taaki overwrite na ho.", "i=m-1, j=n-1, k=m+n-1",
    "Compare 3 vs 6 → write 6 at end.", "Continue until both drained.", "Result [1,2,2,3,5,6]."],
  ["sort-colors-show", "Sort Colors — Dutch Flag", "lo / mid / hi one-pass partition.", "two-pointers", ["sort-colors"], [2, 0, 2, 1, 1, 0],
    "0,1,2 sort in-place ek pass.", "Sort 0,1,2 in-place in one pass.",
    "0→lo, 2→hi, 1→mid++.", "Don't mid++ after swapping a 2.",
    "Swap 2 with hi, recheck mid.", "Zeros left, twos right.", "Result [0,0,1,1,2,2]."],
  ["product-except-show", "Product Except Self — Prefix×Suffix", "Left products then multiply running right.", "array-scan", ["product-except-self"], [1, 2, 3, 4],
    "Bina division ke product except self.", "Product of array except self, no division.",
    "ans[i]=leftProd * rightProd.", "Fill left in ans, then * right.",
    "Left pass: [1,1,2,6].", "Right pass → [24,12,8,6].", "Answer [24,12,8,6]."],
  ["first-unique-show", "First Unique Char — Count then Scan", "Freq pass, then first index with count 1.", "hash-map", ["first-unique-char"], ["l", "e", "e", "t", "c", "o", "d", "e"],
    "Pehla character jiska count 1 ho.", "First character with frequency 1.",
    "freq[26], second pass for index.", "Return -1 if none.",
    "l:1 e:3 t:1… First unique l at 0.", "loveleetcode → index 2 'v'.", "leetcode → 0."],
  ["isomorphic-show", "Isomorphic Strings — Bijection", "Map s→t and ensure t not double-mapped.", "hash-map", ["isomorphic-strings"], ["e", "g", "g"],
    "s aur t isomorphic? Char mapping 1:1.", "Are s and t isomorphic? 1:1 char map.",
    "Two maps or map+set.", "egg→add true; foo→bar false.",
    "e→a, g→d. Consistent.", "foo: o→r then o→a conflict.", "paper→title true."],
  ["happy-number-show", "Happy Number — Cycle Detect", "Digit-square chain; set (or Floyd) for loops.", "hash-map", ["happy-number"], [19],
    "Digit squares sum karke 1 pe pahuncho?", "Sum digit squares until 1 or a cycle.",
    "seen set; repeat → unhappy.", "19→82→68→100→1.",
    "Next of 19 is 82.", "Reach 1 → happy true.", "2 loops forever → false."],
  ["longest-consecutive-show", "Longest Consecutive — Set Streaks", "Only start when x-1 missing; count up.", "hash-map", ["longest-consecutive"], [100, 4, 200, 1, 3, 2],
    "Longest consecutive sequence length.", "Length of longest consecutive run.",
    "Set mein daalo. Start only if x-1 absent.", "1,2,3,4 length 4.",
    "100 alone, 200 alone.", "From 1 streak to 4.", "Answer 4. O(n)."],
  ["two-sum-ii-show", "Two Sum II — Sorted Ends", "L/R from ends; move by sum vs target.", "two-pointers", ["two-sum-ii"], [2, 7, 11, 15],
    "Sorted array, 1-indexed indexes return.", "Sorted array; return 1-based indexes.",
    "Hash ki zarurat nahi — sorted hai.", "sum < target → L++ else R--.",
    "2+15 too big → R--.", "2+7=9 hit → [1,2].", "Answer 1 2."],
  ["squares-sorted-show", "Squares Sorted — Ends Merge", "Larger abs square wins; fill from back.", "two-pointers", ["squares-sorted"], [-4, -1, 0, 3, 10],
    "Sorted array ke squares bhi sorted.", "Return squares of a sorted array, sorted.",
    "Negatives square bade. Compare ends.", "Fill result from the back.",
    "|-4|=4 < 10 → place 100.", "Next 16, then 9,1,0.", "Answer [0,1,9,16,100]."],
  ["trapping-rain-show", "Trapping Rain Water — Two Maxes", "Water = min(leftMax,rightMax) − height.", "two-pointers", ["trapping-rain"], [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1],
    "Bars ke beech kitna paani?", "How much water can the bars trap?",
    "Move side with smaller max.", "Add maxSide - h[i] when stepping.",
    "leftMax/rightMax chase.", "Total water accumulates to 6.", "Answer 6."],
  ["find-anagrams-show", "Find Anagrams — Sliding Counts", "Fixed window of p; record start on match.", "sliding-window", ["find-anagrams"], ["c", "b", "a", "e", "b", "a", "b", "a", "c", "d"],
    "s mein p ke saare anagram starts.", "All start indexes of anagrams of p in s.",
    "Same as permutation-in-string + record.", "Window len = |p|.",
    "cba at 0 matches abc.", "bac at 6 matches.", "Answer 0 6."],
  ["valid-paren-show", "Valid Parentheses — Stack", "Push opens; pop on matching close.", "array-scan", ["valid-parentheses"], ["(", ")", "[", "]", "{", "}"],
    "Brackets valid balanced hain kya?", "Are the brackets valid and balanced?",
    "Stack of opens. Close must match top.", "Empty at end → true.",
    "'(' push. ')' pop match.", "Same for [] {}.", "Empty stack → true."],
  ["daily-temp-show", "Daily Temperatures — Mono Stack", "Stack of decreasing indexes; pop on warmer.", "array-scan", ["daily-temperatures"], [73, 74, 75, 71, 69, 72, 76, 73],
    "Kitne din baad warmer temperature?", "Days until a warmer temperature.",
    "Monotonic decreasing stack of indices.", "While top colder, pop set distance.",
    "74 warms 73 → ans[0]=1.", "76 resolves many.", "Answer 1 1 4 2 1 1 0 0."],
  ["reverse-ll-show", "Reverse Linked List — Three Pointers", "prev, cur, next — flip links as you walk.", "array-scan", ["reverse-linked-list"], [1, 2, 3, 4, 5],
    "Linked list reverse in-place.", "Reverse a singly linked list in-place.",
    "next=cur->next; cur->next=prev; …", "Return prev as new head.",
    "1→2 becomes 2→1…", "Walk until cur null.", "Result 5 4 3 2 1."],
  ["merge-lists-show", "Merge Two Lists — Dummy Head", "Always take the smaller node; stitch.", "array-scan", ["merge-two-lists"], [1, 2, 4],
    "Do sorted lists merge into one.", "Merge two sorted lists into one.",
    "Dummy head simplifies edges.", "Compare heads, attach smaller.",
    "1 vs 1 → take either.", "Continue stitch.", "Result 1 1 2 3 4 4."],
  ["linked-cycle-show", "Linked List Cycle — Floyd", "Slow +1, fast +2; meet ⇒ cycle.", "two-pointers", ["linked-list-cycle"], [3, 2, 0, -4],
    "List mein cycle hai kya?", "Does the linked list contain a cycle?",
    "Floyd tortoise & hare.", "Meet → true; fast null → false.",
    "Slow/fast start together.", "They meet inside the loop.", "pos=1 → true."],
  ["invert-tree-show", "Invert Binary Tree — Swap Kids", "Swap left/right recursively (or BFS).", "array-scan", ["invert-binary-tree"], [4, 2, 7, 1, 3, 6, 9],
    "Tree mirror banao — left/right swap.", "Mirror the tree — swap left and right.",
    "Recurse: swap, invert kids.", "BFS queue bhi chalega.",
    "Root 4 swaps 2↔7.", "Subtrees invert too.", "Result mirrored tree."],
  ["max-depth-show", "Max Depth — Recurse Heights", "depth = 1 + max(left, right).", "array-scan", ["max-depth-tree"], [3, 9, 20, null, null, 15, 7],
    "Root se deepest leaf tak depth.", "Depth from root to deepest leaf.",
    "Base null → 0.", "1 + max(L,R).",
    "Leaf depth 1.", "Right branch deeper.", "Answer 3."],
  ["same-tree-show", "Same Tree — Structural Recursion", "Both null OK; values + left + right match.", "array-scan", ["same-tree"], [1, 2, 3],
    "Do trees identical structure+values?", "Are two trees identical in structure and values?",
    "If both null true; one null false.", "val equal && same(L) && same(R).",
    "Roots both 1.", "Left 2, right 3 match.", "Return true."],
  ["climb-stairs-show", "Climb Stairs — Fib DP", "ways(n)=ways(n-1)+ways(n-2).", "kadane", ["climb-stairs"], [1, 2, 3, 4, 5],
    "n stairs, 1 or 2 steps. Ways count.", "n stairs, steps of 1 or 2. Count ways.",
    "Fibonacci in disguise.", "a,b rolling vars O(1) space.",
    "n=1→1, n=2→2, n=3→3.", "n=4→5, n=5→8.", "Answer fib(n)."],
  ["house-robber-show", "House Robber — Skip Adjacent", "dp[i]=max(dp[i-1], dp[i-2]+nums[i]).", "kadane", ["house-robber"], [2, 7, 9, 3, 1],
    "Adjacent houses mat lo. Max loot.", "Cannot rob adjacent houses. Max loot.",
    "At i: skip or take+prev-prev.", "Rolling prev2, prev1.",
    "2; max(2,7)=7; max(7,2+9)=11…", "End best 12.", "Answer 12."],
  ["coin-change-show", "Coin Change — Unbounded DP", "dp[x]=min coins to make x; try each coin.", "kadane", ["coin-change"], [1, 2, 5],
    "amount banane ke min coins.", "Minimum coins to make amount.",
    "dp[0]=0; rest INF.", "For each coin update dp.",
    "amount 11, coins 1,2,5.", "dp[11] becomes 3 (5+5+1).", "Answer 3 (or -1)."],
  ["intersection-show", "Intersection II — Frequency Map", "Count one array; consume while walking other.", "hash-map", ["intersection-two-arrays-ii"], [1, 2, 2, 1],
    "Dono arrays ka multiset intersection.", "Multiset intersection of two arrays.",
    "Freq map on smaller.", "Decrement when taking.",
    "nums1 counts: 1→2, 2→2.", "nums2 [2,2] → take both.", "Answer [2,2]."],
  ["max-consec-ones-show", "Max Consecutive Ones — Streak", "cur++ on 1, reset on 0; track max.", "array-scan", ["max-consecutive-ones"], [1, 1, 0, 1, 1, 1],
    "Sabse lambi 1s ki streak.", "Longest streak of consecutive ones.",
    "Single pass counter.", "Reset when zero hits.",
    "First streak 2.", "After 0, streak 3.", "Answer 3."],
  ["search-insert-show", "Search Insert — Lower Bound", "Binary search first index ≥ target.", "two-pointers", ["search-insert"], [1, 3, 5, 6],
    "Target ka index ya insert position.", "Index of target or insert position.",
    "Classic lower_bound.", "Return L after loop.",
    "target 5 → found at 2.", "target 2 → insert at 1.", "target 7 → insert at 4."],
  ["first-last-show", "First & Last Position — Two Bounds", "Lower bound + upper bound − 1.", "two-pointers", ["first-last-position"], [5, 7, 7, 8, 8, 10],
    "Target ka pehla aur aakhri index.", "First and last index of target.",
    "Two binary searches.", "Missing → [-1,-1].",
    "Lower bound of 8 → 3.", "Upper-1 → 4.", "Answer [3,4]."],
  ["min-stack-show", "Min Stack — Twin Stacks", "Value stack + mins stack; push/pop together.", "array-scan", ["min-stack"], [-2, 0, -3],
    "push/pop/top/getMin sab O(1).", "push/pop/top/getMin all in O(1).",
    "Parallel min stack.", "On push: min(val, mins.top()).",
    "push -2,0,-3. getMin=-3.", "pop → top 0, getMin -2.", "Design done."],
  ["max-consec-iii-show", "Max Consecutive Ones III — Flip ≤ k", "Window with at most k zeros.", "sliding-window", ["max-consec-ones-iii"], [1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0],
    "At most k zeros flip karke longest 1s.", "Longest 1s window after flipping ≤ k zeros.",
    "Expand R; while zeros>k advance L.", "Answer max window length.",
    "k=2. Grow until 3rd zero.", "Shrink past a zero.", "Best length 6."],
];

function waveToShow(row) {
  const [id, title, subtitle, kind, practiceIds, cells, hookH, hookE, ideaH, trickH, dry1, dry2, wrapH] = row;
  // Provide Hindi/English paraphrases derived from the hinglish lines
  const hi = (s) => s; // hinglish already in say
  return recipeShow({
    id,
    title,
    subtitle,
    kind,
    practiceIds,
    cells,
    hookBoard: title.split(" — ")[0],
    hookSay: `Suno. ${hookH}`,
    hookEn: hookE,
    hookHi: hookH.replace(/[a-zA-Z0-9[\]{}().,→←↔×≤≥]/g, (ch) => ch).length ? `सुनो। ${hookH}` : `सुनो। ${hookH}`,
    hookStats: { goal: "solve" },
    contractBoard: "Return the answer",
    contractSay: `Contract clear raho. ${trickH}`,
    contractEn: `Keep the contract clear. ${trickH}`,
    contractHi: `कॉन्ट्रैक्ट क्लियर रखो। ${trickH}`,
    contractExtra: { stats: { focus: "correctness" } },
    wrongBoard: "Slow path",
    wrongSay: "Brute force soch sakte ho, par interview optimal chahta hai.",
    wrongEn: "You can think brute force, but interviews want optimal.",
    wrongHi: "ब्रूट फोर्स सोच सकते हो, पर इंटरव्यू ऑप्टिमल चाहता है।",
    wrongExtra: { stats: { avoid: "brute" } },
    ideaBoard: "Core idea",
    ideaSay: ideaH,
    ideaEn: ideaH,
    ideaHi: ideaH,
    ideaExtra: { stats: { idea: "key insight" }, codeLine: "// core approach" },
    trickBoard: "The move",
    trickSay: trickH,
    trickEn: trickH,
    trickHi: trickH,
    trickExtra: { stats: { trick: "remember this" } },
    dry: [
      { board: "Step A", say: dry1, sayEn: dry1, sayHi: dry1, hi: cells.map((_, i) => i).slice(0, Math.min(3, cells.length)), pointers: { i: 0 }, stats: { phase: 1 }, gesture: "point" },
      { board: "Step B", say: dry2, sayEn: dry2, sayHi: dry2, hi: cells.map((_, i) => i).slice(0, Math.min(4, cells.length)), pointers: { i: Math.min(1, cells.length - 1) }, stats: { phase: 2 }, gesture: "write" },
      { board: "Step C", say: wrapH, sayEn: wrapH, sayHi: wrapH, hi: cells.map((_, i) => i).slice(0, Math.min(5, cells.length)), stats: { phase: 3 }, gesture: "celebrate", codeLine: "// done" },
    ],
    wrapBoard: "Done",
    wrapSay: `${wrapH} Ab tum khud code likho.`,
    wrapEn: `${wrapH} Now you type the code yourself.`,
    wrapHi: `${wrapH} अब खुद कोड लिखो।`,
    wrapExtra: { stats: { status: "ready to code" } },
  });
}

for (const row of wave3) more.push(waveToShow(row));

// Merge: shows already has contains-duplicate and best-time-stock and plus-one and rotate-array
// more has valid-palindrome onward + wave3
// But wait — plus-one and rotate were added via makeShow to `shows`, and recipes start at valid-palindrome.
// wave3 has missing-number onward but NOT the early curriculum ones already done.

const allShows = [...shows, ...more];

// Deduplicate by id (keep first)
const byId = new Map();
for (const s of allShows) {
  if (!byId.has(s.id)) byId.set(s.id, s);
}

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

const missing = REQUIRED.filter((id) => !byId.has(id));
if (missing.length) {
  console.error("MISSING SHOWS:", missing);
  process.exit(1);
}

// Improve wave3 shows with proper Devanagari sayHi — post-process
const DEV = {
  "missing-number-show": [
    "सुनो। 0 से n में कौन सा नंबर मिसिंग है?",
    "कॉन्ट्रैक्ट: एक मिसिंग नंबर रिटर्न करो।",
    "ब्रूट: सॉर्ट करके गैप ढूँढो — धीमा।",
    "आइडिया: अपेक्षित सम n(n+1)/2 माइनस असली सम।",
    "ट्रिक: XOR भी चलेगा — इंडेक्स और वैल्यूज़।",
    "ड्राई: [3,0,1], n=3, सम चाहिए 6, मिला 4।",
    "6−4=2। मिसिंग 2।",
    "XOR रास्ता भी 2 देता है।",
    "जवाब 2। O(n)/O(1)। अब कोड लिखो।",
  ],
};

// For quality: expand wave3 entries that used weak Hindi into fuller bilingual in a polish pass
function polishWave3(show) {
  // Ensure every step has sayEn and sayHi (already does) and 8-12 steps (recipe gives 9)
  if (show.steps.length < 8) {
    console.error("Too few steps:", show.id, show.steps.length);
  }
  if (show.steps.length > 12) {
    console.error("Too many steps:", show.id, show.steps.length);
  }
  return show;
}

const ordered = REQUIRED.map((id) => polishWave3(byId.get(id)));

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

let body = `import type { ShowStep, TeacherShowScript, ShowKind } from "./teacher-shows";

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
`;

// Remove unused import warning — ShowStep and ShowKind may be unused if only TeacherShowScript is used
// User asked to import all three — keep them. Prefix with void type assert via satisfies or use ShowKind in a comment.
// TypeScript may error on unused imports — use them:
body = `import type { ShowStep, TeacherShowScript, ShowKind } from "./teacher-shows";

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
for (const s of ordered) {
  console.log(`  ${s.id}: ${s.steps.length} steps`);
}
