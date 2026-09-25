import { EXTRA_SHOWS, PROBLEM_SHOW_EXTRA } from "./teacher-shows-bank";

export type ShowKind = "array-scan" | "two-pointers" | "sliding-window" | "hash-map" | "kadane";

export type ShowGesture = "point" | "think" | "write" | "celebrate" | "explain";

export type ShowStep = {
  /** Teacher line — Hinglish */
  say: string;
  sayEn?: string;
  sayHi?: string;
  /** Array values for this frame */
  cells?: number[] | string[];
  /** Highlighted indices */
  hi?: number[];
  /** Named pointers */
  pointers?: Record<string, number>;
  /** Hash map snapshot */
  map?: Record<string, string | number>;
  /** Running stats */
  stats?: Record<string, string | number>;
  /** Window [L,R] inclusive */
  window?: [number, number];
  /** One line of the optimal code this frame is teaching */
  codeLine?: string;
  /** Teacher body language for this beat */
  gesture?: ShowGesture;
  /** Short chalkboard heading */
  board?: string;
  /** Course chapter label */
  chapter?: string;
};

export type TeacherShowScript = {
  id: string;
  title: string;
  subtitle: string;
  kind: ShowKind;
  durationHint: string;
  steps: ShowStep[];
  /** Linked practice problem ids */
  practiceIds: string[];
};

export const teacherShows: Record<string, TeacherShowScript> = {
  "two-sum-show": {
    id: "two-sum-show",
    title: "Two Sum — Hash Map Walk",
    subtitle: "YouTube-style dry run: watch the map fill, then the hit.",
    kind: "hash-map",
    durationHint: "~2 min",
    practiceIds: ["two-sum", "two-sum-hash"],
    steps: [
      {
        chapter: "Hook",
        board: "Two Sum",
        gesture: "explain",
        say: "Suno. Problem bilkul simple hai. Array mein numbers hain. Target diya hai. Do aise numbers chahiye jinka sum target ke barabar ho.",
        sayEn: "Listen. The problem is simple. You get an array of numbers and a target. Find two numbers whose sum equals the target.",
        sayHi: "सुनो। समस्या बिलकुल आसान है। ऐरे में नंबर हैं। टारगेट दिया है। दो ऐसे नंबर चाहिए जिनका योग टारगेट के बराबर हो।",
        cells: [2, 7, 11, 15],
        stats: { target: 9, ask: "which two add to 9?" },
      },
      {
        chapter: "Contract",
        board: "Return indexes, not values",
        gesture: "point",
        say: "Dhyan se. Humein numbers nahi return karne. Unke index return karne hain. 2 aur 7 ka jawab 0 aur 1 hai.",
        sayEn: "Careful. We do not return the numbers. We return their indexes. For 2 and 7, the answer is 0 and 1.",
        sayHi: "ध्यान से। हमें नंबर नहीं रिटर्न करने। उनके इंडेक्स रिटर्न करने हैं। 2 और 7 का जवाब 0 और 1 है।",
        cells: [2, 7, 11, 15],
        hi: [0, 1],
        stats: { return: "[0, 1]" },
      },
      {
        chapter: "Wrong path",
        board: "Brute force = O(n²)",
        gesture: "think",
        say: "Pehla tareeka. Har pair try karo. Chalega. Par time bahut slow ho jaata hai. Interview mein better chahiye.",
        sayEn: "First way. Try every pair. It works. But it is too slow. Interviews want better.",
        sayHi: "पहला तरीका। हर पेयर ट्राई करो। चलेगा। पर बहुत धीमा है। इंटरव्यू में बेहतर चाहिए।",
        cells: [2, 7, 11, 15],
        stats: { brute: "every pair", time: "too slow" },
      },
      {
        chapter: "The idea",
        board: "Diary = hash map",
        gesture: "write",
        say: "Ab socho. Better idea. Ek diary rakho. Har value ke saath uska index yaad rakhna. Yeh diary hash map hai.",
        sayEn: "Now think. Better idea. Keep a diary. Remember each value with its index. That diary is the hash map.",
        sayHi: "अब सोचो। बेहतर आइडिया। एक डायरी रखो। हर वैल्यू के साथ उसका इंडेक्स याद रखना। यही हैश मैप है।",
        cells: [2, 7, 11, 15],
        map: {},
        stats: { diary: "empty hash map" },
        codeLine: "unordered_map<int,int> seen;",
      },
      {
        chapter: "The trick",
        board: "need = target − current",
        gesture: "explain",
        say: "Trick yeh hai. Current number pe aao. Pocho. Target minus current, kya pehle se diary mein hai?",
        sayEn: "Here is the trick. Stand on the current number. Ask. Is target minus current already in the diary?",
        sayHi: "ट्रिक यह है। करंट नंबर पर आओ। पूछो। टारगेट माइनस करंट, क्या पहले से डायरी में है?",
        cells: [2, 7, 11, 15],
        map: {},
        stats: { trick: "need = target - current" },
        codeLine: "int need = target - nums[i];",
      },
      {
        chapter: "Dry run",
        board: "i = 0 · need 7?",
        gesture: "point",
        say: "Dry run. Index zero. Value 2. Need 9 minus 2, matlab 7. Diary khali hai. 7 nahi mila.",
        sayEn: "Dry run. Index 0. Value 2. Need is 9 minus 2, that is 7. Diary is empty. No 7 yet.",
        sayHi: "ड्राई रन। इंडेक्स 0। वैल्यू 2। नीड 9 माइनस 2, मतलब 7। डायरी खाली है। 7 नहीं मिला।",
        cells: [2, 7, 11, 15],
        hi: [0],
        pointers: { i: 0 },
        map: {},
        stats: { need: 7, found: "no" },
      },
      {
        chapter: "Dry run",
        board: "Store 2 → 0",
        gesture: "write",
        say: "Isliye 2 ko diary mein likh do. Value 2, index zero. Ab aage badho.",
        sayEn: "So write 2 into the diary. Value 2, index 0. Now move ahead.",
        sayHi: "इसलिए 2 को डायरी में लिख दो। वैल्यू 2, इंडेक्स 0। अब आगे बढ़ो।",
        cells: [2, 7, 11, 15],
        hi: [0],
        pointers: { i: 0 },
        map: { "2": 0 },
        stats: { action: "store 2 → 0" },
        codeLine: "seen[2] = 0;",
      },
      {
        chapter: "Dry run",
        board: "i = 1 · HIT!",
        gesture: "celebrate",
        say: "Index one. Value 7. Need 9 minus 7, matlab 2. Diary kholo. 2 pehle se index zero pe hai. Hit!",
        sayEn: "Index 1. Value 7. Need is 9 minus 7, that is 2. Open the diary. 2 is already at index 0. Hit!",
        sayHi: "इंडेक्स 1। वैल्यू 7। नीड 9 माइनस 7, मतलब 2। डायरी खोलो। 2 पहले से इंडेक्स 0 पर है। हिट!",
        cells: [2, 7, 11, 15],
        hi: [0, 1],
        pointers: { i: 1 },
        map: { "2": 0 },
        stats: { need: 2, found: "YES @ 0" },
        codeLine: "return {0, 1};",
      },
      {
        chapter: "Wrap",
        board: "One pass. Done.",
        gesture: "celebrate",
        say: "Bas. Answer zero aur one. Ek baar array ghumna. Diary se turant partner mil gaya. Ab tum khud code likho.",
        sayEn: "Done. Answer is 0 and 1. One walk through the array. The diary finds the partner instantly. Now you type the code.",
        sayHi: "बस। जवाब 0 और 1। एक बार ऐरे घूमना। डायरी से तुरंत पार्टनर मिल गया। अब खुद कोड लिखो।",
        cells: [2, 7, 11, 15],
        hi: [0, 1],
        map: { "2": 0 },
        stats: { answer: "[0, 1]", time: "one pass" },
      },
    ],
  },
  "two-pointers-water": {
    id: "two-pointers-water",
    title: "Container With Most Water",
    subtitle: "L and R dance — always move the shorter wall.",
    kind: "two-pointers",
    durationHint: "~2 min",
    practiceIds: ["container-most-water"],
    steps: [
      {
        say: "Heights = [1,8,6,2,5,4,8,3,7]. Area = min(hL,hR) * (R-L). Start ends pe.",
        cells: [1, 8, 6, 2, 5, 4, 8, 3, 7],
        pointers: { L: 0, R: 8 },
        window: [0, 8],
        stats: { area: "min(1,7)*8 = 8", best: 8 },
      },
      {
        say: "Left wall chhoti hai (1 < 7). L++. Kyunki left badhaye bina area nahi badhegi width se zyada easily.",
        cells: [1, 8, 6, 2, 5, 4, 8, 3, 7],
        pointers: { L: 1, R: 8 },
        hi: [1, 8],
        window: [1, 8],
        stats: { area: "min(8,7)*7 = 49", best: 49 },
      },
      {
        say: "Ab best = 49. Right chhota (7 < 8) → R--. Har step width ghat-ti hai, isliye height improve chahiye.",
        cells: [1, 8, 6, 2, 5, 4, 8, 3, 7],
        pointers: { L: 1, R: 7 },
        hi: [1, 7],
        window: [1, 7],
        stats: { area: "min(8,3)*6 = 18", best: 49 },
      },
      {
        say: "Pattern yaad rakho: shorter pointer move. Jab L>=R stop. Answer 49.",
        cells: [1, 8, 6, 2, 5, 4, 8, 3, 7],
        hi: [1, 8],
        pointers: { L: 1, R: 8 },
        stats: { best: 49, rule: "move shorter wall" },
      },
    ],
  },
  "sliding-window-unique": {
    id: "sliding-window-unique",
    title: "Longest Substring Without Repeat",
    subtitle: "Window grow with R, shrink with L when duplicate aata hai.",
    kind: "sliding-window",
    durationHint: "~2 min",
    practiceIds: ["longest-substr-no-repeat"],
    steps: [
      {
        say: "s = \"abcabcbb\". Goal: longest substring jisme koi char dobara na aaye.",
        cells: ["a", "b", "c", "a", "b", "c", "b", "b"],
        pointers: { L: 0, R: 0 },
        window: [0, 0],
        map: {},
        stats: { best: 0 },
      },
      {
        say: "R=0..2 → \"abc\" clean. Set {a,b,c}. best=3. Window healthy.",
        cells: ["a", "b", "c", "a", "b", "c", "b", "b"],
        pointers: { L: 0, R: 2 },
        window: [0, 2],
        hi: [0, 1, 2],
        map: { a: 1, b: 1, c: 1 },
        stats: { best: 3 },
      },
      {
        say: "R=3, char 'a' dubara. Window invalid. L ko aage badhao jab tak 'a' window se bahar.",
        cells: ["a", "b", "c", "a", "b", "c", "b", "b"],
        pointers: { L: 1, R: 3 },
        window: [1, 3],
        hi: [1, 2, 3],
        map: { b: 1, c: 1, a: 1 },
        stats: { best: 3, note: "shrink past old a" },
      },
      {
        say: "Har index at most ek baar enter/leave → O(n). Yahi sliding window ka magic hai.",
        cells: ["a", "b", "c", "a", "b", "c", "b", "b"],
        window: [2, 4],
        pointers: { L: 2, R: 4 },
        hi: [2, 3, 4],
        stats: { best: 3, complexity: "O(n)" },
      },
    ],
  },
  "kadane-show": {
    id: "kadane-show",
    title: "Kadane — Maximum Subarray",
    subtitle: "Running sum vs restart — the classic DP one-liner intuition.",
    kind: "kadane",
    durationHint: "~2 min",
    practiceIds: ["maximum-subarray"],
    steps: [
      {
        say: "nums = [-2,1,-3,4,-1,2,1,-5,4]. Max contiguous sum chahiye.",
        cells: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
        stats: { cur: "-", best: "-" },
      },
      {
        say: "i=0: cur=-2, best=-2. Negative se start — theek hai, edges handle.",
        cells: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
        hi: [0],
        pointers: { i: 0 },
        stats: { cur: -2, best: -2 },
      },
      {
        say: "i=1: kya -2+1 better hai ya sirf 1? max(1, -1)=1. best=1. Restart jeeta.",
        cells: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
        hi: [1],
        pointers: { i: 1 },
        stats: { cur: 1, best: 1, choice: "restart at 1" },
      },
      {
        say: "i=3 pe 4 aata hai — cur becomes 4, then grow 4-1+2+1=6. best=6.",
        cells: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
        hi: [3, 4, 5, 6],
        window: [3, 6],
        pointers: { i: 6 },
        stats: { cur: 6, best: 6 },
      },
      {
        say: "Rule: cur = max(nums[i], cur+nums[i]); best = max(best, cur). O(n) time, O(1) space.",
        cells: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
        hi: [3, 4, 5, 6],
        stats: { answer: 6, complexity: "O(n) / O(1)" },
      },
    ],
  },
  "move-zeroes-show": {
    id: "move-zeroes-show",
    title: "Move Zeroes — Write Pointer",
    subtitle: "Slow pointer writes non-zeros; rest fill with 0.",
    kind: "two-pointers",
    durationHint: "~90 sec",
    practiceIds: ["move-zeroes"],
    steps: [
      {
        say: "nums = [0,1,0,3,12]. In-place: non-zeros pehle, zeroes last.",
        cells: [0, 1, 0, 3, 12],
        pointers: { write: 0, read: 0 },
      },
      {
        say: "read=1 finds 1 → write at 0. Array becomes [1,1,0,3,12] temporarily in mind; write++.",
        cells: [1, 1, 0, 3, 12],
        pointers: { write: 1, read: 1 },
        hi: [0],
      },
      {
        say: "Next non-zeros 3 and 12 land at write=1,2 → [1,3,12,3,12]. Then fill write..end with 0.",
        cells: [1, 3, 12, 0, 0],
        hi: [0, 1, 2],
        pointers: { write: 3 },
        stats: { done: "[1,3,12,0,0]" },
      },
    ],
  },
  "binary-search-intro": {
    id: "binary-search-intro",
    title: "Binary Search — Halve the World",
    subtitle: "Sorted array pe O(log n) — interview ka bread-butter.",
    kind: "two-pointers",
    durationHint: "~2 min",
    practiceIds: ["binary-search", "search-insert"],
    steps: [
      {
        say: "Sorted nums = [1,3,5,7,9,11], target=7. L=0, R=5. Mid se socho.",
        cells: [1, 3, 5, 7, 9, 11],
        pointers: { L: 0, R: 5 },
        window: [0, 5],
        stats: { target: 7 },
      },
      {
        say: "mid=2, nums[mid]=5 < 7 → left half useless. L = mid+1 = 3.",
        cells: [1, 3, 5, 7, 9, 11],
        pointers: { L: 3, R: 5, mid: 2 },
        hi: [2],
        window: [3, 5],
        stats: { midVal: 5 },
      },
      {
        say: "mid=4, nums=9 > 7 → R=mid-1=3. Ab L=R=3, nums[3]=7 → found!",
        cells: [1, 3, 5, 7, 9, 11],
        pointers: { L: 3, R: 3, mid: 3 },
        hi: [3],
        stats: { found: "index 3" },
      },
      {
        say: "Har step search space ~aadha. Yaad: mid overflow se bachne ke liye L+(R-L)/2.",
        cells: [1, 3, 5, 7, 9, 11],
        hi: [3],
        stats: { complexity: "O(log n)" },
      },
    ],
  },
  "stack-valid-parens": {
    id: "stack-valid-parens",
    title: "Valid Parentheses — Stack Story",
    subtitle: "Open push, close match-top. Empty at end = valid.",
    kind: "array-scan",
    durationHint: "~90 sec",
    practiceIds: ["valid-parentheses"],
    steps: [
      {
        say: "s = \"()[]{}\". Stack empty se start. Har open bracket push.",
        cells: ["(", ")", "[", "]", "{", "}"],
        pointers: { i: 0 },
        stats: { stack: "[]" },
      },
      {
        say: "i=0 '(' push. Stack: [ ( ]",
        cells: ["(", ")", "[", "]", "{", "}"],
        pointers: { i: 0 },
        hi: [0],
        stats: { stack: "[ ( ]" },
      },
      {
        say: "i=1 ')' → top '(' se match → pop. Stack empty. Good so far.",
        cells: ["(", ")", "[", "]", "{", "}"],
        pointers: { i: 1 },
        hi: [0, 1],
        stats: { stack: "[]", action: "pop match" },
      },
      {
        say: "Same for [] and {}. End pe stack empty → true. Mismatch / leftover → false.",
        cells: ["(", ")", "[", "]", "{", "}"],
        hi: [0, 1, 2, 3, 4, 5],
        stats: { answer: "true", rule: "empty stack at end" },
      },
    ],
  },
};

export function getTeacherShow(id: string) {
  return teacherShows[id] || EXTRA_SHOWS[id];
}

export function allTeacherShows() {
  return [...Object.values(teacherShows), ...Object.values(EXTRA_SHOWS)];
}

/** Map problem id → default show */
export const problemShowMap: Record<string, string> = {
  "two-sum": "two-sum-show",
  "two-sum-hash": "two-sum-show",
  "container-most-water": "two-pointers-water",
  "longest-substr-no-repeat": "sliding-window-unique",
  "maximum-subarray": "kadane-show",
  "move-zeroes": "move-zeroes-show",
  "binary-search": "binary-search-intro",
  "search-insert": "binary-search-intro",
  "valid-parentheses": "stack-valid-parens",
  ...PROBLEM_SHOW_EXTRA,
};

Object.assign(teacherShows, EXTRA_SHOWS);
