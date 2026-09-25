import type { Problem } from "./types";
import { guideForProblem } from "./solution-guides";
import { HAND_A } from "./solution-tiers-part-a";
import { HAND_B } from "./solution-tiers-part-b";
import { HAND_HR } from "./solution-tiers-part-hr";
import type { SolutionTier, TierSolution } from "./solution-tiers-shared";
import { LABEL, wrap } from "./solution-tiers-shared";

export type { SolutionTier, TierSolution };

/** Hand-written beginner → medium → best for popular problems. */
const HAND: Record<string, { easy: TierSolution; medium: TierSolution; best: TierSolution }> = {
  "two-sum": {
    easy: {
      tier: "easy",
      label: LABEL.easy,
      blurb: "Do loops. Har pair check. Bahut simple.",
      blurbEn: "Two loops. Check every pair. Very simple.",
      complexity: "O(n²) time, O(1) space",
      why: "Beginner ke liye pehla step: har possible jodi try karo. Slow hai, par logic crystal clear hai.",
      whyEn: "First step for beginners: try every possible pair. Slow, but the logic is crystal clear.",
      code: wrap(`class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        int n = nums.size();
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (nums[i] + nums[j] == target) {
                    return {i, j};
                }
            }
        }
        return {};
    }
};`),
    },
    medium: {
      tier: "medium",
      label: LABEL.medium,
      blurb: "Pehle sort + two pointers. Thoda smart.",
      blurbEn: "Sort first, then two pointers. A bit smarter.",
      complexity: "O(n log n) time, O(n) space",
      why: "Indexes yaad rakhne ke liye pairs banao, sort karo, phir do pointers se target dhundo. Hash map se pehle ka step.",
      whyEn: "Keep index with each value, sort, then use two pointers. A step before the hash map.",
      code: wrap(`class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        int n = nums.size();
        vector<pair<int,int>> a;
        for (int i = 0; i < n; i++) a.push_back({nums[i], i});
        sort(a.begin(), a.end());
        int L = 0, R = n - 1;
        while (L < R) {
            int sum = a[L].first + a[R].first;
            if (sum == target) return {a[L].second, a[R].second};
            if (sum < target) L++;
            else R--;
        }
        return {};
    }
};`),
    },
    best: {
      tier: "best",
      label: LABEL.best,
      blurb: "Ek pass + hash map. Interview answer.",
      blurbEn: "One pass + hash map. The interview answer.",
      complexity: "O(n) time, O(n) space",
      why: "Har number pe partner poocho: target minus current pehle dikha? Diary (hash map) se turant milta hai.",
      whyEn: "At each number ask: have I seen target minus current? The hash map diary answers instantly.",
      code: wrap(`class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < (int)nums.size(); i++) {
            int need = target - nums[i];
            if (seen.count(need)) return {seen[need], i};
            seen[nums[i]] = i;
        }
        return {};
    }
};`),
    },
  },
  "contains-duplicate": {
    easy: {
      tier: "easy",
      label: LABEL.easy,
      blurb: "Har number ke liye baaki scan.",
      blurbEn: "For each number, scan the rest.",
      complexity: "O(n²) time, O(1) space",
      why: "Sabse seedha: i aur j compare. Duplicate dikha to true.",
      whyEn: "Simplest: compare i and j. If equal, true.",
      code: wrap(`class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        int n = nums.size();
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (nums[i] == nums[j]) return true;
            }
        }
        return false;
    }
};`),
    },
    medium: {
      tier: "medium",
      label: LABEL.medium,
      blurb: "Sort karke neighbours check.",
      blurbEn: "Sort, then check neighbours.",
      complexity: "O(n log n) time, O(1) extra if in-place sort",
      why: "Sort ke baad same numbers paas aa jaate hain. Adjacent equal = duplicate.",
      whyEn: "After sorting, duplicates sit next to each other.",
      code: wrap(`class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        for (int i = 1; i < (int)nums.size(); i++) {
            if (nums[i] == nums[i - 1]) return true;
        }
        return false;
    }
};`),
    },
    best: {
      tier: "best",
      label: LABEL.best,
      blurb: "Hash set. O(n).",
      blurbEn: "Hash set. O(n).",
      complexity: "O(n) time, O(n) space",
      why: "Set mein daalte hue agar pehle se hai to duplicate.",
      whyEn: "While inserting into a set, if it already exists, duplicate.",
      code: wrap(`class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        unordered_set<int> seen;
        for (int x : nums) {
            if (seen.count(x)) return true;
            seen.insert(x);
        }
        return false;
    }
};`),
    },
  },
  "best-time-stock": {
    easy: {
      tier: "easy",
      label: LABEL.easy,
      blurb: "Har buy-sell pair try.",
      blurbEn: "Try every buy-sell pair.",
      complexity: "O(n²) time, O(1) space",
      why: "Har din buy maano, aage ke din sell. Max profit nikaalo.",
      whyEn: "Buy on each day, sell on every later day. Track max profit.",
      code: wrap(`class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int best = 0;
        int n = prices.size();
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                best = max(best, prices[j] - prices[i]);
            }
        }
        return best;
    }
};`),
    },
    medium: {
      tier: "medium",
      label: LABEL.medium,
      blurb: "Suffix max se profit.",
      blurbEn: "Profit using suffix max.",
      complexity: "O(n) time, O(n) space",
      why: "Pehle right side ka max price array banao, phir har din pe sell max minus price.",
      whyEn: "Build max price to the right, then profit = that max minus today's price.",
      code: wrap(`class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int n = prices.size();
        if (n == 0) return 0;
        vector<int> rightMax(n);
        rightMax[n - 1] = prices[n - 1];
        for (int i = n - 2; i >= 0; i--) rightMax[i] = max(rightMax[i + 1], prices[i]);
        int best = 0;
        for (int i = 0; i < n; i++) best = max(best, rightMax[i] - prices[i]);
        return best;
    }
};`),
    },
    best: {
      tier: "best",
      label: LABEL.best,
      blurb: "Min so far + one pass.",
      blurbEn: "Min so far + one pass.",
      complexity: "O(n) time, O(1) space",
      why: "Chalta hua sabse sasta buy yaad rakho. Aaj sell karo to profit update.",
      whyEn: "Remember the cheapest buy so far. Selling today updates best profit.",
      code: wrap(`class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int minBuy = INT_MAX, best = 0;
        for (int p : prices) {
            minBuy = min(minBuy, p);
            best = max(best, p - minBuy);
        }
        return best;
    }
};`),
    },
  },
  "maximum-subarray": {
    easy: {
      tier: "easy",
      label: LABEL.easy,
      blurb: "Saari subarrays ka sum.",
      blurbEn: "Sum every subarray.",
      complexity: "O(n²) time, O(1) space",
      why: "Har start-end range ka sum. Beginner clear, par slow.",
      whyEn: "Sum every start-end range. Clear for beginners, but slow.",
      code: wrap(`class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int best = nums[0];
        int n = nums.size();
        for (int i = 0; i < n; i++) {
            int sum = 0;
            for (int j = i; j < n; j++) {
                sum += nums[j];
                best = max(best, sum);
            }
        }
        return best;
    }
};`),
    },
    medium: {
      tier: "medium",
      label: LABEL.medium,
      blurb: "Prefix sums se range sum.",
      blurbEn: "Range sum via prefix.",
      complexity: "O(n²) time, O(n) space",
      why: "Prefix se sum fast, phir bhi do loops. Medium bridge.",
      whyEn: "Prefix makes range sum fast, but still two loops.",
      code: wrap(`class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int n = nums.size();
        vector<int> pref(n + 1, 0);
        for (int i = 0; i < n; i++) pref[i + 1] = pref[i] + nums[i];
        int best = nums[0];
        for (int i = 0; i < n; i++) {
            for (int j = i; j < n; j++) {
                best = max(best, pref[j + 1] - pref[i]);
            }
        }
        return best;
    }
};`),
    },
    best: {
      tier: "best",
      label: LABEL.best,
      blurb: "Kadane. Ek pass.",
      blurbEn: "Kadane. One pass.",
      complexity: "O(n) time, O(1) space",
      why: "Running sum negative ho to reset. Best ko update karte raho.",
      whyEn: "Reset running sum when negative. Keep updating the best.",
      code: wrap(`class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int best = nums[0], cur = nums[0];
        for (int i = 1; i < (int)nums.size(); i++) {
            cur = max(nums[i], cur + nums[i]);
            best = max(best, cur);
        }
        return best;
    }
};`),
    },
  },
  "move-zeroes": {
    easy: {
      tier: "easy",
      label: LABEL.easy,
      blurb: "Nayi array banao.",
      blurbEn: "Build a new array.",
      complexity: "O(n) time, O(n) space",
      why: "Pehle non-zero copy, phir zeros. Easy to see.",
      whyEn: "Copy non-zeros first, then zeros. Easy to see.",
      code: wrap(`class Solution {
public:
    void moveZeroes(vector<int>& nums) {
        vector<int> tmp;
        for (int x : nums) if (x != 0) tmp.push_back(x);
        while ((int)tmp.size() < (int)nums.size()) tmp.push_back(0);
        nums = tmp;
    }
};`),
    },
    medium: {
      tier: "medium",
      label: LABEL.medium,
      blurb: "Zeros count karke rewrite.",
      blurbEn: "Count zeros, then rewrite.",
      complexity: "O(n) time, O(1) extra writes twice",
      why: "Non-zero likho front pe, baaki zero fill.",
      whyEn: "Write non-zeros to the front, fill the rest with zeros.",
      code: wrap(`class Solution {
public:
    void moveZeroes(vector<int>& nums) {
        int w = 0;
        for (int x : nums) if (x != 0) nums[w++] = x;
        while (w < (int)nums.size()) nums[w++] = 0;
    }
};`),
    },
    best: {
      tier: "best",
      label: LABEL.best,
      blurb: "Two pointers swap in-place.",
      blurbEn: "Two pointers swap in-place.",
      complexity: "O(n) time, O(1) space",
      why: "Read pointer non-zero dhundhe, write pointer pe swap. Order same rehta hai.",
      whyEn: "Read finds non-zeros, swap onto write. Order stays the same.",
      code: wrap(`class Solution {
public:
    void moveZeroes(vector<int>& nums) {
        for (int r = 0, w = 0; r < (int)nums.size(); r++) {
            if (nums[r] != 0) swap(nums[w++], nums[r]);
        }
    }
};`),
    },
  },
  "plus-one": {
    easy: {
      tier: "easy",
      label: LABEL.easy,
      blurb: "Number banao, +1, phir digits. Slow but clear.",
      blurbEn: "Build the number, add 1, write digits back.",
      complexity: "O(n) time, O(n) space",
      why: "Digits ko ek badi number samjho. Beginner idea — carry logic baad mein.",
      whyEn: "Treat digits as one big number. Learn carry logic later.",
      code: wrap(`class Solution {
public:
    vector<int> plusOne(vector<int>& digits) {
        // Easy idea: only works for small numbers (teaching sketch)
        long long num = 0;
        for (int d : digits) num = num * 10 + d;
        num++;
        string s = to_string(num);
        vector<int> out;
        for (char c : s) out.push_back(c - '0');
        return out;
    }
};`),
    },
    medium: {
      tier: "medium",
      label: LABEL.medium,
      blurb: "Right se carry. Normal case.",
      blurbEn: "Carry from the right. The normal case.",
      complexity: "O(n) time, O(1) extra (or O(n) if grow)",
      why: "Last digit se start: 9 nahi to +1 return. 9 hai to 0, carry aage.",
      whyEn: "From the last digit: if not 9, +1 and return. If 9, set 0 and carry on.",
      code: wrap(`class Solution {
public:
    vector<int> plusOne(vector<int>& digits) {
        for (int i = (int)digits.size() - 1; i >= 0; i--) {
            if (digits[i] < 9) {
                digits[i]++;
                return digits;
            }
            digits[i] = 0;
        }
        digits.insert(digits.begin(), 1);
        return digits;
    }
};`),
    },
    best: {
      tier: "best",
      label: LABEL.best,
      blurb: "Same carry — clean in-place.",
      blurbEn: "Same carry — clean in-place.",
      complexity: "O(n) time, O(1) extra",
      why: "Interview answer: digit array pe carry. Big-int convert mat karo.",
      whyEn: "Interview answer: carry on the digit array. Do not convert to a big int.",
      code: wrap(`class Solution {
public:
    vector<int> plusOne(vector<int>& digits) {
        for (int i = (int)digits.size() - 1; i >= 0; i--) {
            if (digits[i] < 9) {
                digits[i]++;
                return digits;
            }
            digits[i] = 0;
        }
        vector<int> out(digits.size() + 1, 0);
        out[0] = 1;
        return out;
    }
};`),
    },
  },
  "rotate-array": {
    easy: {
      tier: "easy",
      label: LABEL.easy,
      blurb: "Naya array. Copy with new index.",
      blurbEn: "New array. Copy with new index.",
      complexity: "O(n) time, O(n) space",
      why: "Har element nayi jagah: (i+k) % n. Extra array beginner ke liye clear.",
      whyEn: "Each element goes to (i+k) % n. Extra array is clearest for beginners.",
      code: wrap(`class Solution {
public:
    void rotate(vector<int>& nums, int k) {
        int n = nums.size();
        k %= n;
        vector<int> out(n);
        for (int i = 0; i < n; i++) out[(i + k) % n] = nums[i];
        nums = out;
    }
};`),
    },
    medium: {
      tier: "medium",
      label: LABEL.medium,
      blurb: "k baar last ko front. Simple, slow.",
      blurbEn: "k times move last to front. Simple, slow.",
      complexity: "O(n·k) time, O(1) space",
      why: "Samajh aata hai, interview mein slow. Extra memory avoid.",
      whyEn: "Easy to understand, slow in interviews. Avoids extra memory.",
      code: wrap(`class Solution {
public:
    void rotate(vector<int>& nums, int k) {
        int n = nums.size();
        k %= n;
        while (k--) {
            int last = nums.back();
            for (int i = n - 1; i > 0; i--) nums[i] = nums[i - 1];
            nums[0] = last;
        }
    }
};`),
    },
    best: {
      tier: "best",
      label: LABEL.best,
      blurb: "Teen reverse. In-place optimal.",
      blurbEn: "Three reverses. In-place optimal.",
      complexity: "O(n) time, O(1) space",
      why: "Poora reverse, pehle k reverse, baaki reverse. Classic trick.",
      whyEn: "Reverse all, reverse first k, reverse the rest. Classic trick.",
      code: wrap(`class Solution {
public:
    void rotate(vector<int>& nums, int k) {
        int n = nums.size();
        k %= n;
        reverse(nums.begin(), nums.end());
        reverse(nums.begin(), nums.begin() + k);
        reverse(nums.begin() + k, nums.end());
    }
};`),
    },
  },
  "valid-palindrome": {
    easy: {
      tier: "easy",
      label: LABEL.easy,
      blurb: "Clean string banao, reverse compare.",
      blurbEn: "Build clean string, reverse compare.",
      complexity: "O(n) time, O(n) space",
      why: "Sirf letters/digits rakh ke naya string, reverse se match.",
      whyEn: "Keep letters/digits only, compare with reverse.",
      code: wrap(`class Solution {
public:
    bool isPalindrome(string s) {
        string t;
        for (char c : s) {
            if (isalnum((unsigned char)c)) t.push_back(tolower((unsigned char)c));
        }
        string r = t;
        reverse(r.begin(), r.end());
        return t == r;
    }
};`),
    },
    medium: {
      tier: "medium",
      label: LABEL.medium,
      blurb: "Two pointers, skip junk.",
      blurbEn: "Two pointers, skip junk.",
      complexity: "O(n) time, O(1) space",
      why: "L aur R andar aao, non-alnum skip, compare.",
      whyEn: "Move L and R inward, skip non-alnum, compare.",
      code: wrap(`class Solution {
public:
    bool isPalindrome(string s) {
        int L = 0, R = (int)s.size() - 1;
        while (L < R) {
            while (L < R && !isalnum((unsigned char)s[L])) L++;
            while (L < R && !isalnum((unsigned char)s[R])) R--;
            if (tolower((unsigned char)s[L]) != tolower((unsigned char)s[R])) return false;
            L++; R--;
        }
        return true;
    }
};`),
    },
    best: {
      tier: "best",
      label: LABEL.best,
      blurb: "Same two pointers — cleanest form.",
      blurbEn: "Same two pointers — cleanest form.",
      complexity: "O(n) time, O(1) space",
      why: "Medium hi best hai is sawaal mein. Extra memory ki zarurat nahi.",
      whyEn: "Medium is already best here. No extra memory needed.",
      code: wrap(`class Solution {
public:
    bool isPalindrome(string s) {
        int L = 0, R = (int)s.size() - 1;
        while (L < R) {
            while (L < R && !isalnum((unsigned char)s[L])) L++;
            while (L < R && !isalnum((unsigned char)s[R])) R--;
            if (tolower((unsigned char)s[L]) != tolower((unsigned char)s[R])) return false;
            L++; R--;
        }
        return true;
    }
};`),
    },
  },
};

Object.assign(HAND, HAND_A, HAND_B, HAND_HR);
HAND["two-sum-hash"] = HAND["two-sum"];

function extractSignature(starter: string) {
  const m = starter.match(
    /((?:vector\s*<[^;]+>|int|void|bool|string|long\s+long|pair\s*<[^>]+>)\s+\w+\s*\([^;]*\))/
  );
  return m?.[1]?.trim() || "";
}

function synthesizeTiers(problem: Problem): { easy: TierSolution; medium: TierSolution; best: TierSolution } {
  const guide = guideForProblem(problem);
  const bestCode = wrap(guide.code || problem.solutionCode || problem.starterCode);
  const midHint = (problem.hints && problem.hints[1]) || "Use sorting or an extra array to simplify.";
  const easyHint = (problem.hints && problem.hints[0]) || "Try the most direct nested or single-pass idea first.";

  // Never ship a stub that does not solve the problem — teach with working code + comments.
  const easyCode = wrap(`/* Easy start (working code)
 * First idea to think: ${easyHint}
 * Read this solution slowly, then rewrite a slower version yourself in the editor.
 */
${bestCode}`);

  const mediumCode = wrap(`/* Medium: ${midHint} */
${bestCode}`);

  return {
    easy: {
      tier: "easy",
      label: LABEL.easy,
      blurb: "Working starter — read, then rewrite slower yourself.",
      blurbEn: "Working starter — read, then rewrite slower yourself.",
      complexity: guide.complexity,
      why: `${problem.title}: pehle yeh working solution samjho. Hint: ${easyHint}`,
      whyEn: `${problem.title}: first understand this working solution. Hint: ${easyHint}`,
      code: easyCode,
    },
    medium: {
      tier: "medium",
      label: LABEL.medium,
      blurb: "Same optimal, with the medium hint in focus.",
      blurbEn: "Same optimal, with the medium hint in focus.",
      complexity: guide.complexity,
      why: midHint,
      whyEn: midHint,
      code: mediumCode,
    },
    best: {
      tier: "best",
      label: LABEL.best,
      blurb: "Interview-ready optimal.",
      blurbEn: "Interview-ready optimal.",
      complexity: guide.complexity,
      why: guide.hinglish.split("\n").slice(0, 6).join(" ").slice(0, 220) || "Optimal pattern for this problem.",
      whyEn: guide.english.split("\n").slice(0, 6).join(" ").slice(0, 220) || "Optimal pattern for this problem.",
      code: bestCode,
    },
  };
}

function _stripClassInner(starter: string) {
  const m = starter.match(/public:\s*([\s\S]*?)\{\s*[\s\S]*?\}\s*\};?\s*$/);
  if (m) {
    const sig = starter.match(
      /((?:vector\s*<[^;]+>|int|void|bool|string|long\s+long|pair\s*<[^>]+>)\s+\w+\s*\([^;]*\))/
    );
    if (sig) return `    ${sig[1]} {`;
  }
  const sig = extractSignature(starter);
  return sig ? `    ${sig} {` : "    void solve() {";
}

function guessEasyReturn(problem: Problem) {
  const s = problem.starterCode;
  if (/\bvoid\b/.test(s)) return "        return;";
  if (/\bbool\b/.test(s)) return "        return false;";
  if (/\bstring\b/.test(s)) return '        return "";';
  if (/vector\s*</.test(s)) return "        return {};";
  if (/\bint\b/.test(s) || /long\s+long/.test(s)) return "        return 0;";
  return "        return {};";
}

function _guessEasyBody(problem: Problem) {
  return guessEasyReturn(problem).trim();
}

export function hasHandTiers(problemId: string) {
  return Boolean(HAND[problemId]);
}

/** Tiers safe to show in UI — hide thin auto Easy stubs. */
export function visibleTiersForProblem(problem: Problem): SolutionTier[] {
  if (HAND[problem.id]) return ["easy", "medium", "best"];
  // Auto-synthesized Easy is the same Best code with a comment — hide it.
  return ["medium", "best"];
}

export function tiersForProblem(problem: Problem) {
  if (HAND[problem.id]) return HAND[problem.id];
  return synthesizeTiers(problem);
}

export function tierSolution(problem: Problem, tier: SolutionTier): TierSolution {
  const all = tiersForProblem(problem);
  return all[tier];
}
