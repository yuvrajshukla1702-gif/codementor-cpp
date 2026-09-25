export type QuizItem = {
  q: string;
  options: string[];
  answer: number;
  explain: string;
};

export type CppLesson = {
  id: string;
  title: string;
  order: number;
  minutes: number;
  summary: string;
  /** Teaching body — markdown-lite */
  body: string;
  rules: string[];
  quiz: QuizItem[];
  /** Optional linked DSA practice problem ids */
  practiceIds: string[];
};

export const cppCourse: CppLesson[] = [
  {
    id: "hello-io",
    title: "C++ Setup, Hello & I/O",
    order: 1,
    minutes: 12,
    summary: "How a C++ program runs, iostream, cin/cout, competitive programming fast I/O.",
    body: `# Hello, C++

Every C++ program needs an entry point: \`int main()\`. When \`main\` returns \`0\`, the OS treats it as success.

## Minimal program

\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    cout << "Hello CodeMentor\\n";
    return 0;
}
\`\`\`

\`#include <bits/stdc++.h>\` pulls almost all STL headers (common in contests). In production code, include only what you need (\`<iostream>\`, \`<vector>\`, …).

## Reading & writing

| Goal | Code |
|------|------|
| Print | \`cout << x << " " << y << "\\n";\` |
| Read one value | \`cin >> n;\` |
| Read until fail | \`while (cin >> x)\` |

## Interview / LeetCode habit

On LeetCode you usually **only write a class method** — no \`main\`. Locally, CodeMentor wraps your method in a harness that feeds test input.

## Fast I/O (contests)

\`\`\`cpp
ios::sync_with_stdio(false);
cin.tie(nullptr);
\`\`\`

Do this once at the start of \`main\` in contest programs. Skip it inside LeetCode class methods.`,
    rules: [
      "main must return int (usually 0).",
      "Prefer '\\n' over endl (endl flushes — slower).",
      "cin >> skips whitespace; getline reads a full line.",
      "On LeetCode: implement the method, not main.",
    ],
    quiz: [
      {
        q: "What does return 0; from main usually mean?",
        options: ["Crash", "Success / OK", "Print zero", "Skip cin"],
        answer: 1,
        explain: "Returning 0 signals successful exit to the OS.",
      },
      {
        q: "On LeetCode Two Sum, what do you write?",
        options: ["Full main + cin", "Only Solution::twoSum", "A Python script", "Only #include"],
        answer: 1,
        explain: "Platform provides the driver; you fill the method.",
      },
    ],
    practiceIds: ["two-sum"],
  },
  {
    id: "types-vars",
    title: "Types, Variables & Operators",
    order: 2,
    minutes: 15,
    summary: "int vs long long, bool, char, overflow traps, and operator basics.",
    body: `# Types that matter for DSA

## Integers

| Type | Typical range (64-bit) | Use when |
|------|------------------------|----------|
| \`int\` | ~ ±2×10⁹ | Default indices, small counts |
| \`long long\` | ~ ±9×10¹⁸ | Sums, products, big constraints |
| \`size_t\` | unsigned | Container sizes (careful with underflow) |

**Rule:** if constraints say \`n ≤ 1e5\` and you sum \`a[i]\` up to \`1e9\`, sum can exceed \`int\` → use \`long long\`.

## Overflow classic

\`\`\`cpp
int a = 1e9, b = 1e9;
long long bad = a * b;           // WRONG: multiply happens in int first
long long good = 1LL * a * b;    // OK
\`\`\`

## bool & comparisons

\`true\`/\`false\`. Prefer \`==\` for equality, never \`=\` inside \`if\`.

## const & references (preview)

\`const vector<int>& nums\` means: borrow the vector, don't copy, don't modify.`,
    rules: [
      "Prefer long long for sums/products under large constraints.",
      "Multiply with 1LL * a * b to avoid int overflow.",
      "int is fine for indices 0..n-1 when n ≤ 1e7-ish.",
      "Never assign inside if: write if (x == y), not if (x = y).",
    ],
    quiz: [
      {
        q: "a and b are int = 1e9. Safest product?",
        options: ["a * b", "1LL * a * b", "(int)(a * b)", "a + b"],
        answer: 1,
        explain: "1LL forces the multiply into 64-bit arithmetic.",
      },
    ],
    practiceIds: ["plus-one", "best-time-stock"],
  },
  {
    id: "control-flow",
    title: "if / for / while — Control Flow",
    order: 3,
    minutes: 14,
    summary: "Loops, early returns, and the patterns you reuse in every DSA solution.",
    body: `# Control flow for problem solving

## Early return mindset

In interviews, once you know the answer, **return immediately**. Don't keep scanning for fun.

\`\`\`cpp
for (int i = 0; i < n; i++) {
    if (found) return answer;
}
\`\`\`

## for-loop forms

\`\`\`cpp
for (int i = 0; i < n; i++) { /* index */ }
for (int x : nums) { /* value only */ }
for (int i = n - 1; i >= 0; i--) { /* reverse */ }
\`\`\`

## while for two pointers / windows

\`\`\`cpp
int L = 0;
for (int R = 0; R < n; R++) {
    // expand with R
    while (/* window invalid */) {
        // shrink from L
        L++;
    }
}
\`\`\`

This \`for R\` + \`while L\` shape is sliding window. You'll live here later.

## switch

Rare in DSA. Prefer if/else for clarity.`,
    rules: [
      "Index loops: i from 0 to n-1 unless problem says 1-based.",
      "Prefer range-for when you don't need the index.",
      "Sliding window = expand right, shrink left while invalid.",
      "Infinite loops need a clear exit — always change L/R or break.",
    ],
    quiz: [
      {
        q: "Classic sliding-window skeleton uses:",
        options: ["Only recursion", "for R + while L", "goto only", "switch on n"],
        answer: 1,
        explain: "Right expands; left shrinks while the window breaks the rule.",
      },
    ],
    practiceIds: ["move-zeroes", "max-avg-subarray"],
  },
  {
    id: "functions-classes",
    title: "Functions, Classes & Pass-by-Reference",
    order: 4,
    minutes: 16,
    summary: "How LeetCode Solution classes work, and why we pass vectors by reference.",
    body: `# Functions & the Solution class

## Pass by value vs reference

\`\`\`cpp
void f(vector<int> a);        // COPY — slow for big arrays
void g(vector<int>& a);       // reference — can modify caller's vector
void h(const vector<int>& a); // read-only borrow — preferred for input
\`\`\`

LeetCode often gives \`vector<int>& nums\` so you may modify in-place (Move Zeroes, Rotate).

## Solution class pattern

\`\`\`cpp
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // your logic
        return {};
    }
};
\`\`\`

Methods are usually \`public\`. Helper functions can be \`private\` inside the same class.

## Return types

Match the problem: \`int\`, \`bool\`, \`vector<int>\`, \`string\`, \`ListNode*\`, …

Wrong return type = compile error — read the signature twice before coding.`,
    rules: [
      "Big inputs: pass const T& unless you must mutate.",
      "In-place problems: mutate the reference parameter.",
      "Match the exact return type in the signature.",
      "Helpers: private methods keep Solution clean.",
    ],
    quiz: [
      {
        q: "Best signature for read-only array input?",
        options: ["vector<int> nums", "const vector<int>& nums", "vector<int>*", "int nums[] only"],
        answer: 1,
        explain: "const reference avoids copy and forbids accidental edits.",
      },
    ],
    practiceIds: ["move-zeroes", "rotate-array"],
  },
  {
    id: "vectors",
    title: "vector — Your Default Array",
    order: 5,
    minutes: 18,
    summary: "size, push_back, indexing, sort, and the mistakes that cause TLE/WA.",
    body: `# std::vector

A \`vector<T>\` is a dynamic array: contiguous memory, O(1) index, amortized O(1) push_back.

## Essentials

\`\`\`cpp
vector<int> a;           // empty
vector<int> b(n, 0);     // n zeros
a.push_back(3);
int n = (int)a.size();
a[i] = 5;                // must be in range [0, size)
sort(a.begin(), a.end());
\`\`\`

## Index safety

\`a[a.size()]\` is **out of bounds**. Valid indices: \`0 .. size()-1\`.

## 2D vectors

\`\`\`cpp
vector<vector<int>> g(n, vector<int>(m, 0));
\`\`\`

## Common DSA moves

- Frequency: \`vector<int> freq(26);\` for lowercase letters
- Prefix: \`vector<long long> pref(n+1); pref[i+1]=pref[i]+a[i];\`

## Don't

- \`push_back\` in a hot inner loop without \`reserve\` if you know size (micro-opt)
- Compare vectors with wrong length assumptions`,
    rules: [
      "size() returns size_t — cast to int when mixing with int loops.",
      "sort(a.begin(), a.end()) for ascending.",
      "Empty check: a.empty() or a.size()==0.",
      "Out-of-bounds [i] = undefined behavior — WA or crash.",
    ],
    quiz: [
      {
        q: "Valid indices for vector of size 5?",
        options: ["1..5", "0..5", "0..4", "0..6"],
        answer: 2,
        explain: "0-based: last index is size()-1 = 4.",
      },
    ],
    practiceIds: ["contains-duplicate", "rotate-array"],
  },
  {
    id: "strings",
    title: "string Basics for Interviews",
    order: 6,
    minutes: 15,
    summary: "Indexing chars, ascii tricks, two pointers on strings, and anagram counting.",
    body: `# std::string

Strings are like \`vector<char>\` with extras.

\`\`\`cpp
string s = "code";
char c = s[0];          // 'c'
int n = (int)s.size();
s += 'x';
\`\`\`

## Lowercase letter index

\`\`\`cpp
int idx = s[i] - 'a';  // 0..25 if s[i] is 'a'..'z'
\`\`\`

## Two pointers palindrome

Skip non-alphanumeric, compare lowercased ends — classic Valid Palindrome.

## Anagrams

Count frequency of 26 letters (or map for unicode). Same counts ⇒ anagram.

## Substring windows

Sliding window on strings: grow \`R\`, shrink \`L\` when a constraint breaks (e.g. duplicate char).`,
    rules: [
      "s[i] is char; promote carefully in arithmetic.",
      "Prefer s.size() over strlen-style C APIs.",
      "For ASCII letters, 'a'..'z' → freq[c-'a'].",
      "Don't modify string while iterating blindly — know your indices.",
    ],
    quiz: [
      {
        q: "'z' - 'a' equals?",
        options: ["0", "25", "26", "122"],
        answer: 1,
        explain: "'a'=0 … 'z'=25 in zero-based alphabet index.",
      },
    ],
    practiceIds: ["valid-palindrome", "group-anagrams", "longest-substr-no-repeat"],
  },
  {
    id: "unordered-map",
    title: "unordered_map & unordered_set",
    order: 7,
    minutes: 18,
    summary: "Hashing in C++ — the weapon behind Two Sum, duplicates, and anagrams.",
    body: `# Hash tables in C++

## unordered_map

\`\`\`cpp
unordered_map<int,int> mp;
mp[x] = i;                 // insert / assign
if (mp.count(need)) { ... } // exists?
int idx = mp[need];        // read (careful: [] inserts 0 if missing)
\`\`\`

**Trap:** \`mp[key]\` **creates** the key with default value if absent. Prefer \`.count\` / \`.find\` before read when existence matters.

## unordered_set

\`\`\`cpp
unordered_set<int> st;
st.insert(x);
if (st.count(x)) { /* seen */ }
\`\`\`

## Two Sum pattern

For each \`nums[i]\`, look for \`target - nums[i]\` in the map **before** inserting \`nums[i]\`.

## Complexity

Average O(1) lookup. Worst case degraded (rare). For interviews, say "average O(1) with hash map".`,
    rules: [
      "Use .count/.find when you must not insert accidentally.",
      "map is ordered (tree) O(log n); unordered_map is hash average O(1).",
      "Hash map trades space for time — say that in interviews.",
      "Store value→index for Two Sum style problems.",
    ],
    quiz: [
      {
        q: "Danger of reading mp[key] when key may be missing?",
        options: ["Compile error", "It inserts default value", "Deletes map", "Nothing"],
        answer: 1,
        explain: "operator[] default-inserts. Use count/find first.",
      },
    ],
    practiceIds: ["two-sum", "two-sum-hash", "contains-duplicate"],
  },
  {
    id: "complexity",
    title: "Time & Space Complexity (Plain English)",
    order: 8,
    minutes: 16,
    summary: "Big-O intuition so you can defend your solution in interviews.",
    body: `# Complexity without fear

## Time — how work grows with n

| Pattern | Big-O | Example |
|---------|-------|---------|
| One loop | O(n) | Scan array |
| Nested loops i,j | O(n²) | All pairs |
| Sort | O(n log n) | sort(vec) |
| Hash lookup | O(1) avg | unordered_map |

## Space

Extra arrays/maps you allocate (not counting input, usually).

Two Sum hash map: **O(n) time, O(n) space**.

## Target for n = 1e5

Rough interview budget ~ 1e8 ops/sec mental model:
- O(n) and O(n log n) OK
- O(n²) often TLE

## How to say it

"I scan once while storing seen values in a hash map, so linear time and linear extra memory."`,
    rules: [
      "State time and space after every solution.",
      "Sorting then two pointers: O(n log n) time.",
      "n=1e5 → avoid plain O(n²).",
      "Trade space for time with hashing when needed.",
    ],
    quiz: [
      {
        q: "Best expected time for Two Sum with hash map?",
        options: ["O(n²)", "O(n)", "O(n log n) only", "O(1)"],
        answer: 1,
        explain: "One pass + average O(1) lookups → O(n).",
      },
    ],
    practiceIds: ["two-sum", "maximum-subarray"],
  },
  {
    id: "stl-algos",
    title: "STL Algorithms You Actually Need",
    order: 9,
    minutes: 14,
    summary: "sort, reverse, max/min, lower_bound — interview toolkit.",
    body: `# High-value STL

\`\`\`cpp
sort(a.begin(), a.end());
reverse(a.begin(), a.end());
int mx = *max_element(a.begin(), a.end());
int mn = *min_element(a.begin(), a.end());
swap(a[i], a[j]);
\`\`\`

## lower_bound / upper_bound

On a **sorted** range: binary search positions. Returns iterator.

## accumulate

\`\`\`cpp
long long sum = accumulate(a.begin(), a.end(), 0LL);
\`\`\`

Use \`0LL\` so the sum type is long long.

## Don't memorize all of \<algorithm\>

Know sort, reverse, max_element, swap, binary search bounds. Rest you can look up later.`,
    rules: [
      "sort needs random-access iterators (vector OK).",
      "accumulate third arg type controls sum type — use 0LL.",
      "lower_bound requires sorted order.",
      "prefer clear loops over obscure STL if clarity wins interview.",
    ],
    quiz: [
      {
        q: "Safe sum of many ints into long long?",
        options: ["accumulate(..., 0)", "accumulate(..., 0LL)", "a.size()", "max_element"],
        answer: 1,
        explain: "0LL makes the accumulation use 64-bit.",
      },
    ],
    practiceIds: ["top-k-frequent", "three-sum"],
  },
  {
    id: "debug-mindset",
    title: "Debug Like a Teacher",
    order: 10,
    minutes: 12,
    summary: "What to do when tests fail — before asking for a full solution.",
    body: `# When your code fails

## 1. Compile errors first

Read the **first** error line. Common:
- missing \`;\`
- wrong return type
- used \`map\` without \`#include\` (harness usually includes bits)
- \`nums.size()\` compared badly with signed/unsigned

## 2. Trace one sample by hand

Pick the failing input. Fill a table: \`i | nums[i] | map state | action\`.

Your bug is the first row where paper ≠ code.

## 3. Check edge cases

- empty / single element
- all zeros
- negatives
- duplicates
- already sorted / reverse sorted

## 4. Hint ladder

Ask for Hint 1 → change approach → Hint 2 → still stuck → Hint 3. Full solution last.

CodeMentor's tutor follows this on purpose.`,
    rules: [
      "Fix compile before logic.",
      "Dry-run the failing test on paper.",
      "List edge cases before claiming AC.",
      "Don't jump to full solution on first WA.",
    ],
    quiz: [
      {
        q: "Best first move after Wrong Answer?",
        options: ["Delete file", "Dry-run the failing sample", "Post full solution online", "Change language"],
        answer: 1,
        explain: "Trace the exact failing input — find the first diverging step.",
      },
    ],
    practiceIds: ["two-sum", "maximum-subarray"],
  },
];

export function getCppLesson(id: string) {
  return cppCourse.find((l) => l.id === id);
}

export function getCppCourseSorted() {
  return [...cppCourse].sort((a, b) => a.order - b.order);
}
