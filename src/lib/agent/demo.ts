/**
 * Pre-written "model replies" for three classic questions. They go through the exact same pipeline as a
 * real model's answer — the C++ is really compiled, tested and traced — so the demo shows the real thing
 * without needing an API key. One of them even contains a deliberate first-draft bug to show self-repair.
 */

export type DemoMeta = { id: string; label: string; question: string };

type EvMeta = { i: number; note: string; code: string; state: string };
type NarrateInput = { title: string; sampleInput: string; output: string; events: EvMeta[] };
type Lang = "english" | "hinglish";

type Fixture = DemoMeta & {
  solve: Record<string, unknown>;
  repair?: Record<string, unknown>;
  line: (lang: Lang, e: EvMeta, v: Record<string, string>, all: EvMeta[]) => string;
  slots: Record<Lang, { hook: string; brute: string; idea: string; result: string; complexity: string; pitfall: string }>;
};

/* ------------------------------ 1. Valid Parentheses ------------------------------ */

const VP_SOLUTION = String.raw`class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        TR("start with an empty stack", s, st);
        for (int i = 0; i < (int)s.size(); i++) {
            char c = s[i];
            if (c == '(' || c == '[' || c == '{') {
                st.push(c);
                TR("opening bracket: push it", i, c, st);
            } else {
                if (st.empty()) {
                    TR("closing bracket but the stack is empty: invalid", i, c, st);
                    return false;
                }
                char top = st.top();
                bool ok = (c == ')' && top == '(') || (c == ']' && top == '[') || (c == '}' && top == '{');
                if (!ok) {
                    TR("closing bracket does not match the top: invalid", i, c, top, st);
                    return false;
                }
                st.pop();
                TR("closing bracket matches the top: pop it", i, c, st);
            }
        }
        TR("string finished: valid only if the stack is empty", st, st.empty());
        return st.empty();
    }
};`;

const VP_DRIVER = String.raw`int main() {
    string s;
    getline(cin, s);
    while (!s.empty() && (s.back() == '\r' || s.back() == ' ')) s.pop_back();
    Solution sol;
    cout << (sol.isValid(s) ? "true" : "false") << "\n";
    return 0;
}`;

const bracket = (ch: string, lang: Lang) => {
  const names: Record<string, [string, string]> = {
    "(": ["open round bracket", "open round bracket"],
    ")": ["close round bracket", "close round bracket"],
    "[": ["open square bracket", "open square bracket"],
    "]": ["close square bracket", "close square bracket"],
    "{": ["open curly bracket", "open curly bracket"],
    "}": ["close curly bracket", "close curly bracket"],
  };
  const c = ch.replace(/['"]/g, "");
  return (names[c] ?? [c, c])[lang === "english" ? 0 : 1];
};

const vpLine: Fixture["line"] = (lang, e, v, all) => {
  const en = lang === "english";
  const c = bracket(v.c ?? "", lang);
  const size = Math.floor(((v.st ?? "").match(/'/g)?.length ?? 0) / 2);
  if (/start with an empty/.test(e.note)) {
    return en
      ? "We start with an empty stack. Nothing is waiting to be closed yet."
      : "Shuru mein stack bilkul khaali hai. Abhi koi bracket close hone ka wait nahi kar raha.";
  }
  if (/opening bracket: push/.test(e.note)) {
    return en
      ? `Index ${v.i}. It is an ${c}, so we push it on the stack. Now ${size} bracket${size === 1 ? " is" : "s are"} waiting to be closed.`
      : `Index ${v.i} pe ${c} mila, toh isko stack mein push karte hain. Ab stack mein ${size} bracket close hone ka wait kar rahe hain.`;
  }
  if (/matches the top/.test(e.note)) {
    return en
      ? `Index ${v.i}. A ${c}. It matches the bracket on top of the stack, so we pop that pair away. ${size} left waiting.`
      : `Index ${v.i} pe ${c} aaya. Ye stack ke top wale bracket se match karta hai, toh dono ko hata dete hain. Ab ${size} bracket bache hain.`;
  }
  if (/invalid/.test(e.note)) {
    return en
      ? `Index ${v.i}. A ${c} but there is nothing matching on the stack. That makes the string invalid, so we return false.`
      : `Index ${v.i} pe ${c} aaya lekin stack mein uska jodi nahi hai. Matlab string invalid hai, isliye false return karte hain.`;
  }
  const last = e.i === all.length - 1;
  return last
    ? en
      ? "The string is finished and the stack is empty. Every bracket found its partner, so the answer is true."
      : "String khatam ho gayi aur stack khaali hai. Har bracket ko uska jodi mil gaya, toh answer true hai."
    : en
      ? "Nothing more to read."
      : "Aur kuch padhne ko nahi bacha.";
};

const VALID_PARENTHESES: Fixture = {
  id: "valid-parentheses",
  label: "Valid Parentheses (stack)",
  question:
    "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if open brackets are closed by the same type of brackets and in the correct order. Example: \"()[]{}\" is true, \"(]\" is false.",
  solve: {
    kind: "problem",
    offTopic: false,
    title: "Valid Parentheses",
    restated:
      "Given a string made only of the brackets ()[]{}, decide whether every opening bracket is closed by the same kind of bracket in the right order.",
    difficulty: "Easy",
    topics: ["Stack", "String"],
    explain: {
      intuition: [
        "The bracket you opened last must be the first one you close, like stacking plates and always taking the top plate.",
        "So keep a stack of opening brackets that are still waiting to be closed.",
        "Every closing bracket must match the top of that stack. If it does not, the string cannot be valid.",
      ],
      brute: {
        idea: "Keep deleting adjacent pairs \"()\", \"[]\" and \"{}\" until nothing changes. The string is valid if it ends up empty.",
        time: "O(n^2)",
      },
      approach: {
        name: "Stack matching",
        steps: [
          "Create an empty stack of characters.",
          "Scan the string from left to right.",
          "If the character opens a bracket, push it.",
          "If it closes a bracket, the stack must be non-empty and its top must be the matching opener. Pop it, otherwise return false.",
          "After the scan, return true only when the stack is empty.",
        ],
        time: "O(n)",
        space: "O(n)",
        why: "A valid string is exactly one where every closer meets the most recent unmatched opener, and a stack always keeps that opener on top.",
      },
      pitfalls: [
        "Calling top() or pop() on an empty stack when the string starts with a closing bracket.",
        "Forgetting the final check that the stack is empty, which wrongly accepts \"((\".",
        "Comparing only the counts of brackets instead of their order.",
      ],
      followUps: [
        "How would you handle other characters mixed in with the brackets?",
        "How would you find the length of the longest valid substring?",
        "Can you do it in O(1) extra space when there is only one kind of bracket?",
      ],
    },
    viz: { array: "s", pointers: ["i"], window: null, table: null, map: null, lists: ["st"], show: ["c"] },
    tests: [
      { input: "([]{})\n", expected: "true", note: "walkthrough: nested and mixed" },
      { input: "()[]{}\n", expected: "true", note: "statement: three pairs in a row" },
      { input: "(]\n", expected: "false", note: "statement: wrong closing bracket" },
      { input: "((\n", expected: "false", note: "edge: never closed" },
      { input: ")(\n", expected: "false", note: "edge: closing bracket comes first" },
    ],
    code: {
      solution: VP_SOLUTION,
      driver: VP_DRIVER,
      inputFormat: "One line: the bracket string s.",
      outputFormat: "true or false.",
    },
    sampleIndex: 0,
  },
  line: vpLine,
  slots: {
    english: {
      hook: "Here is a classic. You get a string of brackets, and you must say whether every opening bracket gets closed by the right kind of bracket, in the right order. We will walk through the string round bracket, square bracket, curly bracket, and then close them in reverse.",
      brute: "The slow way is to keep deleting neighbouring pairs like round-open round-close until nothing is left. That rescans the string again and again, which can take quadratic time.",
      idea: "Think of stacking plates. The last bracket you opened must be the first one you close. So we keep a stack of open brackets, and every closing bracket has to match the one on top.",
      result: "The string is valid, so the program prints true. Every opener found its partner and the stack ended empty.",
      complexity: "We read each character once, so time is linear. In the worst case the stack holds every character, so space is linear too.",
      pitfall: "Do not forget the final check that the stack is empty. Otherwise a string like two open brackets would wrongly pass.",
    },
    hinglish: {
      hook: "Ye ek classic question hai. Ek string di hai jisme sirf brackets hain, aur batana hai ki har opening bracket sahi type ke bracket se, sahi order mein close hota hai ya nahi.",
      brute: "Slow tareeka ye hai ki baar baar paas wali jodiyan hatate raho jab tak kuch bache nahi. Isme string ko bar bar scan karna padta hai, toh time quadratic ho jata hai.",
      idea: "Plates ke stack ki tarah socho. Jo bracket sabse last mein khola, wahi sabse pehle band hona chahiye. Isliye ek stack rakhte hain, aur har closing bracket ko top wale se match karna hota hai.",
      result: "String valid hai, isliye program true print karta hai. Har opening bracket ko apna jodi mila aur stack aakhir mein khaali tha.",
      complexity: "Har character ek hi baar padhte hain, toh time linear hai. Worst case mein stack mein sab characters aa sakte hain, toh space bhi linear hai.",
      pitfall: "Aakhir mein stack khaali hai ya nahi, ye check karna mat bhulna. Warna do open brackets wali string galti se pass ho jayegi.",
    },
  },
};

/* ------------------- 2. Longest Substring Without Repeating Characters ------------------- */

const LS_SOLUTION = String.raw`class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        unordered_map<char, int> last;
        int best = 0, left = 0;
        for (int right = 0; right < (int)s.size(); right++) {
            char c = s[right];
            if (last.count(c) && last[c] >= left) {
                left = last[c] + 1;
                TR("repeat found: move left past the old copy", left, right, c, last);
            }
            last[c] = right;
            best = max(best, right - left + 1);
            TR("extend the window and record the best length", s, left, right, c, best, last);
        }
        TR("scan finished: the best length is the answer", best);
        return best;
    }
};`;

const LS_DRIVER = String.raw`int main() {
    string s;
    getline(cin, s);
    while (!s.empty() && (s.back() == '\r')) s.pop_back();
    Solution sol;
    cout << sol.lengthOfLongestSubstring(s) << "\n";
    return 0;
}`;

const lsLine: Fixture["line"] = (lang, e, v, all) => {
  const en = lang === "english";
  const ch = (v.c ?? "").replace(/['"]/g, "");
  if (/repeat found/.test(e.note)) {
    return en
      ? `The letter ${ch} at position ${v.right} already sits inside the window. So we slide left forward to ${v.left}, just past its old copy.`
      : `Position ${v.right} pe letter ${ch} window ke andar pehle se hai. Isliye left ko ${v.left} pe le jate hain, uski purani copy ke theek baad.`;
  }
  if (/extend the window/.test(e.note)) {
    const len = Number(v.right) - Number(v.left) + 1;
    return en
      ? `Window is from ${v.left} to ${v.right}, ${len} letter${len === 1 ? "" : "s"} with no repeats. The best length so far is ${v.best}.`
      : `Window ${v.left} se ${v.right} tak hai, ${len} letter aur koi repeat nahi. Ab tak ki best length ${v.best} hai.`;
  }
  const last = e.i === all.length - 1;
  return last
    ? en
      ? `The string is finished. The longest window without repeats had length ${v.best}, so that is the answer.`
      : `String khatam ho gayi. Bina repeat wali sabse lambi window ki length ${v.best} thi, wahi answer hai.`
    : en
      ? "On to the next letter."
      : "Ab agla letter dekhte hain.";
};

const LONGEST_SUBSTRING: Fixture = {
  id: "longest-substring",
  label: "Longest Substring Without Repeats (sliding window)",
  question:
    "Given a string s, find the length of the longest substring without repeating characters. Example: s = \"abcabcbb\" gives 3 because the answer is \"abc\".",
  solve: {
    kind: "problem",
    offTopic: false,
    title: "Longest Substring Without Repeats",
    restated:
      "Given a string, find the length of the longest stretch of consecutive characters in which no character appears twice.",
    difficulty: "Medium",
    topics: ["Sliding Window", "Hash Map", "String"],
    explain: {
      intuition: [
        "Look at a window of letters between two positions, left and right. We want the widest window with no repeated letter.",
        "Move right one step at a time. If the new letter is already inside the window, the window is broken.",
        "To repair it, jump left to just after the old copy of that letter. We never move left backwards, so every letter is visited at most twice.",
      ],
      brute: { idea: "Check every substring and test it for repeats with a set.", time: "O(n^3)" },
      approach: {
        name: "Sliding window with last-seen index",
        steps: [
          "Keep a map from each character to the last index where it appeared.",
          "Grow the window by moving right across the string.",
          "If the current character was last seen inside the window, move left to one past that index.",
          "Record the character's new index and update the best window length.",
          "Return the best length after the scan.",
        ],
        time: "O(n)",
        space: "O(k)",
        why: "The window always holds distinct letters, and left only jumps forward to the earliest spot that removes the duplicate, so no better window is ever skipped.",
      },
      pitfalls: [
        "Moving left backwards when the old copy is already outside the window. Always compare against left first.",
        "Forgetting the empty string, where the answer is 0.",
        "Using the window size from the map size instead of right - left + 1.",
      ],
      followUps: [
        "How would you return the substring itself, not only its length?",
        "How does it change if the alphabet is only lowercase letters?",
        "Can you allow at most k repeated characters?",
      ],
    },
    viz: { array: "s", pointers: ["left", "right"], window: ["left", "right"], table: null, map: "last", lists: [], show: ["best"] },
    tests: [
      { input: "abcabcbb\n", expected: "3", note: "statement: the answer is abc" },
      { input: "bbbbb\n", expected: "1", note: "statement: all letters equal" },
      { input: "pwwkew\n", expected: "3", note: "statement: the answer is wke" },
      { input: "\n", expected: "0", note: "edge: empty string" },
      { input: "abba\n", expected: "2", note: "edge: left must never move backwards" },
    ],
    code: {
      solution: LS_SOLUTION,
      driver: LS_DRIVER,
      inputFormat: "One line: the string s (may be empty).",
      outputFormat: "One integer: the length.",
    },
    sampleIndex: 0,
  },
  line: lsLine,
  slots: {
    english: {
      hook: "We get a string and want the longest stretch of letters where no letter shows up twice. Our sample is a b c a b c b b. Watch a window slide across it.",
      brute: "The slow way is to test every possible substring for repeats. That is cubic time, far too slow for long strings.",
      idea: "Keep a window with two ends, left and right, and a diary of the last position of every letter. Right always moves forward. When a letter repeats inside the window, left jumps just past its old copy.",
      result: "The widest window with no repeat had length 3, so the program prints 3.",
      complexity: "Each end of the window only moves forward, so time is linear. The map holds at most one entry per distinct letter.",
      pitfall: "Never let left move backwards. In a b b a, the old a is already outside the window, so left must stay put.",
    },
    hinglish: {
      hook: "Ek string di hai aur humein sabse lambi aisi stretch chahiye jisme koi letter do baar na aaye. Hamara sample a b c a b c b b hai. Dekho ek window kaise slide karti hai.",
      brute: "Slow tareeka ye hai ki har substring ko check karo ki usme repeat hai ya nahi. Ye cubic time leta hai, lambi strings ke liye bahut slow.",
      idea: "Do ends wali window rakho, left aur right, aur ek diary jisme har letter ki last position likhi ho. Right hamesha aage badhta hai. Agar window ke andar letter repeat ho, toh left ko uski purani copy ke theek baad le jao.",
      result: "Bina repeat wali sabse badi window ki length 3 thi, isliye program 3 print karta hai.",
      complexity: "Window ka har end sirf aage badhta hai, toh time linear hai. Map mein har alag letter ka ek hi entry hota hai.",
      pitfall: "Left ko kabhi peeche mat le jao. a b b a mein purana a window ke bahar hai, toh left wahi rehna chahiye.",
    },
  },
};

/* ------------------------------ 3. Coin Change (self-repair) ------------------------------ */

const CC_BUGGY = String.raw`class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        vector<int> dp(amount + 1, amount + 1);
        dp[0] = 0;
        TR("zero coins are needed to make 0", dp);
        for (int a = 1; a <= amount; a++) {
            for (int c : coins) {
                if (c <= a && dp[a - c] + 1 < dp[a]) {
                    dp[a] = dp[a - c] + 1;
                    TR("better way found: take one coin", a, c, dp[a], dp);
                }
            }
        }
        TR("table complete: read the last cell", amount, dp[amount], dp);
        return dp[amount];
    }
};`;

const CC_FIXED = String.raw`class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        vector<int> dp(amount + 1, amount + 1);
        dp[0] = 0;
        TR("zero coins are needed to make 0", dp);
        for (int a = 1; a <= amount; a++) {
            for (int c : coins) {
                if (c <= a && dp[a - c] + 1 < dp[a]) {
                    dp[a] = dp[a - c] + 1;
                    TR("better way found: take one coin", a, c, dp[a], dp);
                }
            }
        }
        TR("table complete: read the last cell", amount, dp[amount], dp);
        return dp[amount] > amount ? -1 : dp[amount];
    }
};`;

const CC_DRIVER = String.raw`int main() {
    int n;
    cin >> n;
    vector<int> coins(n);
    for (int &x : coins) cin >> x;
    int amount;
    cin >> amount;
    Solution sol;
    cout << sol.coinChange(coins, amount) << "\n";
    return 0;
}`;

const CC_TESTS = [
  { input: "3\n1 2 5\n11\n", expected: "3", note: "statement: 5 + 5 + 1" },
  { input: "1\n2\n3\n", expected: "-1", note: "statement: 3 cannot be made from 2s" },
  { input: "1\n1\n0\n", expected: "0", note: "statement: amount 0 needs no coins" },
  { input: "2\n2 5\n7\n", expected: "2", note: "edge: 2 + 5" },
];

const ccLine: Fixture["line"] = (lang, e, v, all) => {
  const en = lang === "english";
  if (/zero coins/.test(e.note)) {
    return en
      ? "Cell zero is zero, because making the amount 0 needs no coins. Every other cell starts as impossible."
      : "Cell zero mein 0 hai, kyunki amount 0 banane ke liye koi coin nahi chahiye. Baaki sab cells shuru mein impossible maane hain.";
  }
  if (/better way/.test(e.note)) {
    const prev = Number(v["dp[a]"]) - 1;
    return en
      ? `To make ${v.a}, take a coin of ${v.c} on top of the best way to make ${Number(v.a) - Number(v.c)}. That needs ${v["dp[a]"]} coin${Number(v["dp[a]"]) === 1 ? "" : "s"}, which beats what we had.`
      : `${v.a} banane ke liye ${v.c} ka coin lo, aur ${Number(v.a) - Number(v.c)} banane ka best tareeka use karo, jisme ${prev} coin lagte hain. Total ${v["dp[a]"]} coin, jo pehle se behtar hai.`;
  }
  const last = e.i === all.length - 1;
  return last
    ? en
      ? `The table is complete. The last cell says ${v["dp[amount]"]} coins are enough for the amount ${v.amount}.`
      : `Table poori ho gayi. Aakhri cell batata hai ki amount ${v.amount} ke liye ${v["dp[amount]"]} coin kaafi hain.`
    : en
      ? "Moving on."
      : "Aage badhte hain.";
};

const COIN_CHANGE: Fixture = {
  id: "coin-change",
  label: "Coin Change (dynamic programming, self-repair)",
  question:
    "You are given coins of different denominations and a total amount. Return the fewest number of coins needed to make up that amount, or -1 if it cannot be made. Example: coins = [1,2,5], amount = 11 gives 3 (5 + 5 + 1).",
  solve: {
    kind: "problem",
    offTopic: false,
    title: "Coin Change",
    restated:
      "Given coin values and a target amount, find the minimum number of coins that add up exactly to the amount, or -1 if that is impossible.",
    difficulty: "Medium",
    topics: ["Dynamic Programming", "Array"],
    explain: {
      intuition: [
        "Greedy fails here: with coins 1, 3, 4 and amount 6, taking the biggest coin first gives 4+1+1, but 3+3 is better.",
        "Instead, build the answer for every smaller amount first. The best way to make a is one coin c plus the best way to make a minus c.",
        "Store these answers in a table so each amount is solved once.",
      ],
      brute: { idea: "Try every combination of coins recursively.", time: "O(S^n)" },
      approach: {
        name: "Bottom-up DP over amounts",
        steps: [
          "Make dp of size amount+1, filled with amount+1 as a stand-in for impossible.",
          "Set dp[0] = 0.",
          "For each amount a from 1 to the target, try every coin c that fits.",
          "If dp[a-c] + 1 is smaller than dp[a], update dp[a].",
          "If dp[amount] is still the impossible marker, return -1, otherwise return dp[amount].",
        ],
        time: "O(amount x coins)",
        space: "O(amount)",
        why: "Every optimal way to make a ends with some last coin c, and the rest must itself be optimal for a minus c, so the table is filled in a safe order.",
      },
      pitfalls: [
        "Returning dp[amount] without converting the impossible marker to -1.",
        "Using INT_MAX as infinity and then overflowing on dp[a-c] + 1.",
        "Forgetting dp[0] = 0, which makes every cell stay impossible.",
      ],
      followUps: [
        "How would you count the number of ways to make the amount?",
        "How would you rebuild which coins were used?",
        "Can you reduce it with BFS over amounts?",
      ],
    },
    viz: { array: "dp", pointers: ["a"], window: null, table: null, map: null, lists: [], show: ["c"] },
    tests: CC_TESTS,
    code: {
      solution: CC_BUGGY,
      driver: CC_DRIVER,
      inputFormat: "Line 1: n coins. Line 2: the n coin values. Line 3: the amount.",
      outputFormat: "The fewest coins, or -1.",
    },
    sampleIndex: 0,
  },
  repair: {
    why: "The first draft returned dp[amount] directly, so an impossible amount printed the stand-in value amount+1 instead of -1.",
    solution: CC_FIXED,
    driver: CC_DRIVER,
    tests: CC_TESTS,
  },
  line: ccLine,
  slots: {
    english: {
      hook: "We have coins of different values and a target amount. We want the fewest coins that add up exactly. Our sample coins are 1, 2 and 5, and the amount is 11.",
      brute: "Trying every combination of coins blows up exponentially. We need to reuse sub-answers.",
      idea: "Build a table. Cell a holds the fewest coins to make amount a. To fill it, try each coin c, and look back at the cell a minus c, then add one coin. Keep the smallest.",
      result: "The last cell holds 3, so the answer is 3 coins: five, five and one.",
      complexity: "For each amount we try every coin, so time is amount times the number of coins. The table needs amount plus one cells.",
      pitfall: "If the last cell still holds the impossible marker, return minus one. This first draft forgot that, and the real test run caught it.",
    },
    hinglish: {
      hook: "Humare paas alag alag value ke coins hain aur ek target amount hai. Sabse kam coins chahiye jo exact amount banaye. Sample mein coins 1, 2 aur 5 hain, aur amount 11 hai.",
      brute: "Coins ke har combination ko try karna exponential ho jata hai. Humein purane answers dobara use karne honge.",
      idea: "Ek table banao. Cell a mein amount a banane ke liye sabse kam coins likhe hote hain. Isse bharne ke liye har coin c try karo, cell a minus c dekho, aur ek coin jod do. Sabse chhota rakho.",
      result: "Aakhri cell mein 3 hai, toh answer 3 coins hai: paanch, paanch aur ek.",
      complexity: "Har amount ke liye saare coins try karte hain, toh time amount ganaa coins ka hai. Table mein amount plus ek cells chahiye.",
      pitfall: "Agar aakhri cell mein abhi bhi impossible wala marker hai, toh minus ek return karo. Pehle draft mein ye bhool gayi thi, aur asli test run ne pakad liya.",
    },
  },
};

export const DEMO_FIXTURES: Fixture[] = [VALID_PARENTHESES, LONGEST_SUBSTRING, COIN_CHANGE];

export const DEMOS: DemoMeta[] = DEMO_FIXTURES.map(({ id, label, question }) => ({ id, label, question }));

export function demoById(id: string): Fixture | undefined {
  return DEMO_FIXTURES.find((f) => f.id === id);
}

/** The model's JSON for the "solve" step, used as the format example in the real prompt too. */
export function solveExample(): string {
  return JSON.stringify(VALID_PARENTHESES.solve);
}

function parseState(state: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of state.split("; ")) {
    const eq = part.indexOf("=");
    if (eq > 0) out[part.slice(0, eq).trim()] = part.slice(eq + 1).trim();
  }
  return out;
}

export async function demoReply(id: string, tag: string, user: string): Promise<string> {
  const f = demoById(id);
  if (!f) throw new Error(`Unknown demo "${id}".`);
  if (tag === "solve") return JSON.stringify(f.solve);
  if (tag === "repair") return JSON.stringify(f.repair ?? { why: "No change needed.", solution: "", driver: "" });
  if (tag === "narrate-english" || tag === "narrate-hinglish") {
    const lang: Lang = tag === "narrate-english" ? "english" : "hinglish";
    const input = JSON.parse(user.slice(user.lastIndexOf("INPUT:\n") + 7)) as NarrateInput;
    const events = input.events.map((e) => f.line(lang, e, parseState(e.state), input.events));
    return JSON.stringify({ ...f.slots[lang], events });
  }
  return JSON.stringify({});
}
