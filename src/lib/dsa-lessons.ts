export type DsaTopicLesson = {
  topicId: string;
  title: string;
  goal: string;
  whenToUse: string[];
  templateCpp: string;
  dryRun: string;
  pitfalls: string[];
  interviewSay: string;
  /** Optional animated classroom id */
  showId?: string;
};

export const dsaTopicLessons: Record<string, DsaTopicLesson> = {
  arrays: {
    topicId: "arrays",
    title: "Arrays — Index Thinking",
    goal: "Treat every array problem as: What do I know at index i? What must I remember from the past?",
    whenToUse: [
      "Contiguous memory, random access O(1)",
      "In-place swaps / two writes (Move Zeroes)",
      "Prefix sums / running min-max (Best Time to Buy Stock, Kadane)",
    ],
    templateCpp: `// Running best pattern
int best = nums[0];
for (int i = 1; i < n; i++) {
    // update state using nums[i]
    best = max(best, candidate);
}
return best;`,
    dryRun: `Kadane on [-2,1,-3,4,-1,2,1,-5,4] ends with best=6.`,
    pitfalls: ["Off-by-one on rotate", "int overflow on sums", "Forgetting in-place mutation"],
    interviewSay: "One scan, O(n) time, O(1) extra unless I need a map.",
    showId: "kadane-show",
  },
  hashing: {
    topicId: "hashing",
    title: "Hashing — Pay Space, Buy Time",
    goal: "Replace nested loops with unordered_map / unordered_set lookups.",
    whenToUse: ["Have I seen X?", "Frequency counting", "Value → index"],
    templateCpp: `unordered_map<int,int> mp;
for (int i = 0; i < n; i++) {
    int need = target - nums[i];
    if (mp.count(need)) return {mp[need], i};
    mp[nums[i]] = i;
}`,
    dryRun: `Two Sum [2,7,11,15], target 9 → [0,1].`,
    pitfalls: ["mp[key] inserts", "Wrong freq updates", "map vs unordered_map"],
    interviewSay: "Average O(1) lookups → O(n) time, O(n) space.",
    showId: "two-sum-show",
  },
  "two-pointers": {
    topicId: "two-pointers",
    title: "Two Pointers — Two Indices, One Rule",
    goal: "Move left/right based on a condition instead of checking all pairs.",
    whenToUse: ["Sorted pair/triplet", "Palindrome ends", "In-place partition"],
    templateCpp: `int L = 0, R = n - 1;
while (L < R) {
    int sum = a[L] + a[R];
    if (sum == target) { L++; R--; }
    else if (sum < target) L++;
    else R--;
}`,
    dryRun: `Container water → move shorter wall → best 49.`,
    pitfalls: ["Unsorted when sum needs sort", "L/R never move", "Wrong pattern choice"],
    interviewSay: "Pointers move at most n steps → O(n) after sort.",
    showId: "two-pointers-water",
  },
  "sliding-window": {
    topicId: "sliding-window",
    title: "Sliding Window — Live Range",
    goal: "Maintain [L,R] that satisfies a constraint; answer from length/sum/counts.",
    whenToUse: ["Longest/shortest subarray/substring", "Fixed k", "At most K zeros/distinct"],
    templateCpp: `int L = 0;
for (int R = 0; R < n; R++) {
    // add s[R]
    while (/* invalid */) { /* remove s[L] */ L++; }
    // update answer
}`,
    dryRun: `"abcabcbb" → max unique window length 3.`,
    pitfalls: ["Answer update timing", "R-L+1 off-by-one", "Subsequence vs subarray"],
    interviewSay: "Each index enters/leaves once → O(n).",
    showId: "sliding-window-unique",
  },
  "binary-search": {
    topicId: "binary-search",
    title: "Binary Search — Halve & Conquer",
    goal: "On a sorted range, throw away half each step.",
    whenToUse: ["Exact find", "Lower/upper bound", "Monotonic predicate"],
    templateCpp: `int L = 0, R = n - 1;
while (L <= R) {
    int mid = L + (R - L) / 2;
    if (a[mid] == target) return mid;
    if (a[mid] < target) L = mid + 1;
    else R = mid - 1;
}
return -1;`,
    dryRun: `[1,3,5,7,9,11] target 7 → found at index 3.`,
    pitfalls: ["Infinite loop", "mid overflow", "lower_bound off-by-one"],
    interviewSay: "O(log n) comparisons.",
    showId: "binary-search-intro",
  },
  stack: {
    topicId: "stack",
    title: "Stack — Last In, First Out",
    goal: "LIFO for matching, undo, and next-greater patterns.",
    whenToUse: ["Parentheses", "Monotonic stack", "Min-stack"],
    templateCpp: `stack<char> st;
for (char c : s) {
    if (/* open */) st.push(c);
    else {
        if (st.empty() || st.top() != need) return false;
        st.pop();
    }
}
return st.empty();`,
    dryRun: `"()[]{}" → empty stack → true.`,
    pitfalls: ["Pop empty", "Wrong pair map", "Leftover opens"],
    interviewSay: "Push/pop O(1); full scan O(n).",
    showId: "stack-valid-parens",
  },
  "linked-list": {
    topicId: "linked-list",
    title: "Linked List — Pointer Surgery",
    goal: "Redraw next pointers carefully; draw on paper first.",
    whenToUse: ["Reverse", "Merge sorted", "Cycle (Floyd)"],
    templateCpp: `ListNode* prev = nullptr;
ListNode* cur = head;
while (cur) {
    ListNode* nxt = cur->next;
    cur->next = prev;
    prev = cur;
    cur = nxt;
}
return prev;`,
    dryRun: `1→2→3 reverse → 3→2→1.`,
    pitfalls: ["Losing next", "No dummy on merge", "Cycle entry mistakes"],
    interviewSay: "prev/cur/next so I never lose the list.",
  },
  "binary-tree": {
    topicId: "binary-tree",
    title: "Binary Trees — Recursion Native",
    goal: "Answer for a node from left + right children.",
    whenToUse: ["Depth", "Invert", "Same / symmetric"],
    templateCpp: `int maxDepth(TreeNode* root) {
    if (!root) return 0;
    return 1 + max(maxDepth(root->left), maxDepth(root->right));
}`,
    dryRun: `Root with deeper right child → depth = 1 + max(L,R).`,
    pitfalls: ["Null base case", "Swap order", "BFS/DFS confusion"],
    interviewSay: "Null base, combine children.",
  },
  hackerrank: {
    topicId: "hackerrank",
    title: "HackerRank Warmup",
    goal: "Classic warmup problems, taught slowly in Hindi, English, or Hinglish, then typed by you.",
    whenToUse: ["Loops and sums", "Frequency maps", "Simulation of a path or clock"],
    templateCpp: `long long sum = 0;
for (int x : a) sum += x;
return sum;`,
    dryRun: `Simple Array Sum 1+2+3+4+10+11 = 31.`,
    pitfalls: ["int overflow on big sums", "Forgetting 12 AM is 00", "Rounding grades when the gap is exactly 3"],
    interviewSay: "I will walk one sample by hand, then code a single pass.",
  },
  dp: {
    topicId: "dp",
    title: "Intro DP — Remember Subanswers",
    goal: "Reuse smaller answers via a table or rolling variables.",
    whenToUse: ["Fibonacci counts", "House robber", "Coin change"],
    templateCpp: `int a = 1, b = 1;
for (int i = 2; i <= n; i++) {
    int c = a + b;
    a = b; b = c;
}
return b;`,
    dryRun: `Climb stairs n=5 → 8 ways.`,
    pitfalls: ["Wrong transition", "Off-by-one", "Bare recursion on large n"],
    interviewSay: "Define dp[i], write transition, state complexity.",
  },
};

export function getDsaTopicLesson(topicId: string) {
  return dsaTopicLessons[topicId];
}
