import { T, type TierSolution } from "./solution-tiers-shared";

export const HAND_B: Record<
  string,
  { easy: TierSolution; medium: TierSolution; best: TierSolution }
> = {
  "missing-number": T(
    {
      blurb: "Har number 0..n check nested. Missing dhundo.",
      blurbEn: "Nested check each 0..n. Find the missing one.",
      complexity: "O(n²) time, O(1) space",
      why: "Beginner: har candidate ke liye array scan. Slow par clear.",
      whyEn: "For beginners: scan the array for each candidate. Slow but clear.",
      code: `class Solution {
public:
    int missingNumber(vector<int>& nums) {
        int n = nums.size();
        for (int x = 0; x <= n; x++) {
            bool found = false;
            for (int v : nums) if (v == x) { found = true; break; }
            if (!found) return x;
        }
        return -1;
    }
};`,
    },
    {
      blurb: "Sum formula: expect - actual.",
      blurbEn: "Sum formula: expected minus actual.",
      complexity: "O(n) time, O(1) space",
      why: "0..n ka sum n*(n+1)/2. Array sum ghatao — bachi missing.",
      whyEn: "Sum 0..n is n*(n+1)/2. Subtract array sum → missing.",
      code: `class Solution {
public:
    int missingNumber(vector<int>& nums) {
        int n = nums.size();
        long long expect = n * 1LL * (n + 1) / 2;
        long long sum = 0;
        for (int x : nums) sum += x;
        return (int)(expect - sum);
    }
};`,
    },
    {
      blurb: "XOR sab indices + values. Interview flex.",
      blurbEn: "XOR all indices and values. Interview flex.",
      complexity: "O(n) time, O(1) space",
      why: "Pairs cancel. Jo bachta hai woh missing. Overflow nahi.",
      whyEn: "Pairs cancel; leftover is missing. No overflow.",
      code: `class Solution {
public:
    int missingNumber(vector<int>& nums) {
        int x = nums.size();
        for (int i = 0; i < (int)nums.size(); i++) x ^= i ^ nums[i];
        return x;
    }
};`,
    },
  ),

  "single-number": T(
    {
      blurb: "Count map. Jo count 1 woh answer.",
      blurbEn: "Count map. The one with count 1 wins.",
      complexity: "O(n) time, O(n) space",
      why: "Har number ki frequency. Single wala dikh jaata hai.",
      whyEn: "Frequency of each number; the singleton stands out.",
      code: `class Solution {
public:
    int singleNumber(vector<int>& nums) {
        unordered_map<int, int> cnt;
        for (int x : nums) cnt[x]++;
        for (auto& [v, c] : cnt) if (c == 1) return v;
        return 0;
    }
};`,
    },
    {
      blurb: "Sort karke neighbours scan.",
      blurbEn: "Sort, then scan neighbours.",
      complexity: "O(n log n) time, O(1) extra",
      why: "Pairs paas aa jaate hain. Odd-one-out akela rehta hai.",
      whyEn: "Pairs sit together; the odd one is alone.",
      code: `class Solution {
public:
    int singleNumber(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        int n = nums.size();
        for (int i = 0; i + 1 < n; i += 2) {
            if (nums[i] != nums[i + 1]) return nums[i];
        }
        return nums[n - 1];
    }
};`,
    },
    {
      blurb: "XOR all. O(1) space magic.",
      blurbEn: "XOR all. O(1) space magic.",
      complexity: "O(n) time, O(1) space",
      why: "a^a=0, a^0=a. Pairs vanish, single bachta hai.",
      whyEn: "a^a=0, a^0=a. Pairs vanish; singleton remains.",
      code: `class Solution {
public:
    int singleNumber(vector<int>& nums) {
        int x = 0;
        for (int v : nums) x ^= v;
        return x;
    }
};`,
    },
  ),

  "majority-element": T(
    {
      blurb: "Count map. Jo > n/2 woh majority.",
      blurbEn: "Count map. Whoever exceeds n/2 is majority.",
      complexity: "O(n) time, O(n) space",
      why: "Frequencies count karo, max wala pick.",
      whyEn: "Count frequencies and pick the one over n/2.",
      code: `class Solution {
public:
    int majorityElement(vector<int>& nums) {
        unordered_map<int, int> cnt;
        int n = nums.size();
        for (int x : nums) {
            if (++cnt[x] > n / 2) return x;
        }
        return nums[0];
    }
};`,
    },
    {
      blurb: "Sort. Middle element majority.",
      blurbEn: "Sort. Middle element is majority.",
      complexity: "O(n log n) time, O(1) extra",
      why: "Majority > n/2 baar aata hai, sort ke baad mid pe zaroor.",
      whyEn: "Majority appears > n/2 times, so it covers the middle after sort.",
      code: `class Solution {
public:
    int majorityElement(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        return nums[nums.size() / 2];
    }
};`,
    },
    {
      blurb: "Boyer-Moore voting. O(1) space.",
      blurbEn: "Boyer-Moore voting. O(1) space.",
      complexity: "O(n) time, O(1) space",
      why: "Candidate + count. Cancel different votes. Winner survives.",
      whyEn: "Candidate + count. Different votes cancel; winner survives.",
      code: `class Solution {
public:
    int majorityElement(vector<int>& nums) {
        int cand = 0, count = 0;
        for (int x : nums) {
            if (count == 0) cand = x;
            count += (x == cand) ? 1 : -1;
        }
        return cand;
    }
};`,
    },
  ),

  "merge-sorted-array": T(
    {
      blurb: "nums2 copy nums1 mein, phir sort.",
      blurbEn: "Copy nums2 into nums1, then sort.",
      complexity: "O((m+n) log(m+n)) time",
      why: "Sabse seedha merge: daalo aur sort. Clear beginner move.",
      whyEn: "Simplest merge: dump and sort. Clear beginner move.",
      code: `class Solution {
public:
    void merge(vector<int>& nums1, int m, vector<int>& nums2, int n) {
        for (int i = 0; i < n; i++) nums1[m + i] = nums2[i];
        sort(nums1.begin(), nums1.end());
    }
};`,
    },
    {
      blurb: "Do pointers → naya array, copy back.",
      blurbEn: "Two pointers into a new array, copy back.",
      complexity: "O(m+n) time, O(m+n) space",
      why: "Classic merge jaise merge-sort. Extra space leke clean.",
      whyEn: "Classic merge-sort merge. Extra space, clean logic.",
      code: `class Solution {
public:
    void merge(vector<int>& nums1, int m, vector<int>& nums2, int n) {
        vector<int> out;
        int i = 0, j = 0;
        while (i < m && j < n) {
            if (nums1[i] <= nums2[j]) out.push_back(nums1[i++]);
            else out.push_back(nums2[j++]);
        }
        while (i < m) out.push_back(nums1[i++]);
        while (j < n) out.push_back(nums2[j++]);
        for (int k = 0; k < m + n; k++) nums1[k] = out[k];
    }
};`,
    },
    {
      blurb: "End se two pointers. In-place.",
      blurbEn: "Two pointers from the end. In-place.",
      complexity: "O(m+n) time, O(1) space",
      why: "Peeche se likho taaki overwrite na ho. Interview answer.",
      whyEn: "Write from the back so you don't overwrite. Interview answer.",
      code: `class Solution {
public:
    void merge(vector<int>& nums1, int m, vector<int>& nums2, int n) {
        int i = m - 1, j = n - 1, k = m + n - 1;
        while (j >= 0) {
            if (i >= 0 && nums1[i] > nums2[j]) nums1[k--] = nums1[i--];
            else nums1[k--] = nums2[j--];
        }
    }
};`,
    },
  ),

  "sort-colors": T(
    {
      blurb: "0/1/2 count, phir rewrite.",
      blurbEn: "Count 0/1/2, then rewrite.",
      complexity: "O(n) time, O(1) space",
      why: "Counting sort for 3 values. Do passes, very clear.",
      whyEn: "Counting sort for three values. Two passes, very clear.",
      code: `class Solution {
public:
    void sortColors(vector<int>& nums) {
        int c0 = 0, c1 = 0, c2 = 0;
        for (int x : nums) {
            if (x == 0) c0++;
            else if (x == 1) c1++;
            else c2++;
        }
        int i = 0;
        while (c0--) nums[i++] = 0;
        while (c1--) nums[i++] = 1;
        while (c2--) nums[i++] = 2;
    }
};`,
    },
    {
      blurb: "Do passes: 0s aage, phir 1s.",
      blurbEn: "Two passes: 0s front, then 1s.",
      complexity: "O(n) time, O(1) space",
      why: "Pehle 0s partition, phir 1s. Partition thinking.",
      whyEn: "First partition 0s, then 1s. Partition thinking.",
      code: `class Solution {
public:
    void sortColors(vector<int>& nums) {
        int p = 0, n = nums.size();
        for (int i = 0; i < n; i++) if (nums[i] == 0) swap(nums[i], nums[p++]);
        for (int i = p; i < n; i++) if (nums[i] == 1) swap(nums[i], nums[p++]);
    }
};`,
    },
    {
      blurb: "Dutch flag. Ek pass three pointers.",
      blurbEn: "Dutch flag. One pass, three pointers.",
      complexity: "O(n) time, O(1) space",
      why: "lo/mid/hi. 0 left, 2 right, 1 middle. Optimal one-pass.",
      whyEn: "lo/mid/hi. 0s left, 2s right, 1s middle. Optimal one-pass.",
      code: `class Solution {
public:
    void sortColors(vector<int>& nums) {
        int lo = 0, mid = 0, hi = (int)nums.size() - 1;
        while (mid <= hi) {
            if (nums[mid] == 0) swap(nums[lo++], nums[mid++]);
            else if (nums[mid] == 1) mid++;
            else swap(nums[mid], nums[hi--]);
        }
    }
};`,
    },
  ),

  "product-except-self": T(
    {
      blurb: "Har i pe nested multiply (skip i).",
      blurbEn: "For each i, nested multiply (skip i).",
      complexity: "O(n²) time, O(1) extra",
      why: "Seedha meaning: product of all except self. Slow but honest.",
      whyEn: "Literal meaning: product of all except self. Slow but honest.",
      code: `class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        int n = nums.size();
        vector<int> ans(n, 1);
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) if (i != j) ans[i] *= nums[j];
        }
        return ans;
    }
};`,
    },
    {
      blurb: "Prefix + suffix arrays.",
      blurbEn: "Prefix + suffix arrays.",
      complexity: "O(n) time, O(n) space",
      why: "Left product * right product. Extra arrays se clear.",
      whyEn: "Left product * right product. Extra arrays make it clear.",
      code: `class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        int n = nums.size();
        vector<int> left(n, 1), right(n, 1), ans(n);
        for (int i = 1; i < n; i++) left[i] = left[i - 1] * nums[i - 1];
        for (int i = n - 2; i >= 0; i--) right[i] = right[i + 1] * nums[i + 1];
        for (int i = 0; i < n; i++) ans[i] = left[i] * right[i];
        return ans;
    }
};`,
    },
    {
      blurb: "Prefix in ans, suffix in-place. O(1) extra.",
      blurbEn: "Prefix in ans, then suffix in-place. O(1) extra.",
      complexity: "O(n) time, O(1) extra",
      why: "Pehle left products ans mein, phir running right multiply. Interview gold.",
      whyEn: "Left products in ans, then multiply running right. Interview gold.",
      code: `class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        int n = nums.size();
        vector<int> ans(n, 1);
        for (int i = 1; i < n; i++) ans[i] = ans[i - 1] * nums[i - 1];
        int right = 1;
        for (int i = n - 1; i >= 0; i--) {
            ans[i] *= right;
            right *= nums[i];
        }
        return ans;
    }
};`,
    },
  ),

  "max-consecutive-ones": T(
    {
      blurb: "1 pe cur++, 0 pe reset. Max yaad rakho.",
      blurbEn: "On 1 cur++, on 0 reset. Track max.",
      complexity: "O(n) time, O(1) space",
      why: "Streak counter. Yeh hi optimal hai — medium=best.",
      whyEn: "Streak counter. This is already optimal — medium=best.",
      code: `class Solution {
public:
    int findMaxConsecutiveOnes(vector<int>& nums) {
        int cur = 0, best = 0;
        for (int x : nums) {
            if (x == 1) { cur++; best = max(best, cur); }
            else cur = 0;
        }
        return best;
    }
};`,
    },
    {
      blurb: "Same streak pass. Already optimal.",
      blurbEn: "Same streak pass. Already optimal.",
      complexity: "O(n) time, O(1) space",
      why: "Is problem pe better approach nahi — same code.",
      whyEn: "No better approach for this problem — same code.",
      code: `class Solution {
public:
    int findMaxConsecutiveOnes(vector<int>& nums) {
        int cur = 0, best = 0;
        for (int x : nums) {
            if (x == 1) { cur++; best = max(best, cur); }
            else cur = 0;
        }
        return best;
    }
};`,
    },
    {
      blurb: "Same O(n) streak. Best = medium.",
      blurbEn: "Same O(n) streak. Best equals medium.",
      complexity: "O(n) time, O(1) space",
      why: "Single pass streak — yeh hi best.",
      whyEn: "Single-pass streak is the best.",
      code: `class Solution {
public:
    int findMaxConsecutiveOnes(vector<int>& nums) {
        int cur = 0, best = 0;
        for (int x : nums) {
            if (x == 1) { cur++; best = max(best, cur); }
            else cur = 0;
        }
        return best;
    }
};`,
    },
  ),

  "first-unique-char": T(
    {
      blurb: "Har char ke liye nested count.",
      blurbEn: "For each char, nested count.",
      complexity: "O(n²) time, O(1) space",
      why: "Har index pe poora string count. Beginner clear.",
      whyEn: "At each index, count across the string. Clear for beginners.",
      code: `class Solution {
public:
    int firstUniqChar(string s) {
        int n = s.size();
        for (int i = 0; i < n; i++) {
            int c = 0;
            for (int j = 0; j < n; j++) if (s[j] == s[i]) c++;
            if (c == 1) return i;
        }
        return -1;
    }
};`,
    },
    {
      blurb: "freq[26] do passes.",
      blurbEn: "freq[26] in two passes.",
      complexity: "O(n) time, O(1) space",
      why: "Pehle count, phir pehla freq==1. Alphabet size fixed.",
      whyEn: "Count first, then first freq==1. Fixed alphabet size.",
      code: `class Solution {
public:
    int firstUniqChar(string s) {
        int freq[26] = {};
        for (char c : s) freq[c - 'a']++;
        for (int i = 0; i < (int)s.size(); i++)
            if (freq[s[i] - 'a'] == 1) return i;
        return -1;
    }
};`,
    },
    {
      blurb: "Same freq array. Already best.",
      blurbEn: "Same freq array. Already best.",
      complexity: "O(n) time, O(1) space",
      why: "26 letters — hash array hi optimal.",
      whyEn: "26 letters — the hash array is optimal.",
      code: `class Solution {
public:
    int firstUniqChar(string s) {
        int freq[26] = {};
        for (char c : s) freq[c - 'a']++;
        for (int i = 0; i < (int)s.size(); i++)
            if (freq[s[i] - 'a'] == 1) return i;
        return -1;
    }
};`,
    },
  ),

  "isomorphic-strings": T(
    {
      blurb: "Do maps: s→t aur t→s bijection.",
      blurbEn: "Two maps: s→t and t→s bijection.",
      complexity: "O(n) time, O(1) alphabet space",
      why: "Har mapping unique dono taraf. Medium=best same idea.",
      whyEn: "Each mapping unique both ways. Medium=best same idea.",
      code: `class Solution {
public:
    bool isIsomorphic(string s, string t) {
        if (s.size() != t.size()) return false;
        unordered_map<char, char> st, ts;
        for (int i = 0; i < (int)s.size(); i++) {
            char a = s[i], b = t[i];
            if (st.count(a) && st[a] != b) return false;
            if (ts.count(b) && ts[b] != a) return false;
            st[a] = b; ts[b] = a;
        }
        return true;
    }
};`,
    },
    {
      blurb: "Same dual-map bijection.",
      blurbEn: "Same dual-map bijection.",
      complexity: "O(n) time, O(1) alphabet space",
      why: "Is pattern pe better nahi — same code.",
      whyEn: "No better pattern here — same code.",
      code: `class Solution {
public:
    bool isIsomorphic(string s, string t) {
        if (s.size() != t.size()) return false;
        unordered_map<char, char> st, ts;
        for (int i = 0; i < (int)s.size(); i++) {
            char a = s[i], b = t[i];
            if (st.count(a) && st[a] != b) return false;
            if (ts.count(b) && ts[b] != a) return false;
            st[a] = b; ts[b] = a;
        }
        return true;
    }
};`,
    },
    {
      blurb: "Same maps. Best = medium.",
      blurbEn: "Same maps. Best equals medium.",
      complexity: "O(n) time, O(1) alphabet space",
      why: "Bijection check O(n) — yeh hi best.",
      whyEn: "Bijection check in O(n) is the best.",
      code: `class Solution {
public:
    bool isIsomorphic(string s, string t) {
        if (s.size() != t.size()) return false;
        unordered_map<char, char> st, ts;
        for (int i = 0; i < (int)s.size(); i++) {
            char a = s[i], b = t[i];
            if (st.count(a) && st[a] != b) return false;
            if (ts.count(b) && ts[b] != a) return false;
            st[a] = b; ts[b] = a;
        }
        return true;
    }
};`,
    },
  ),

  "happy-number": T(
    {
      blurb: "Set mein seen + digit square sum.",
      blurbEn: "Seen set + sum of digit squares.",
      complexity: "O(log n) per step, cycle detect",
      why: "Cycle detect set se. 1 aaya to happy.",
      whyEn: "Detect cycles with a set. Reach 1 → happy.",
      code: `class Solution {
public:
    int next(int n) {
        int s = 0;
        while (n) { int d = n % 10; s += d * d; n /= 10; }
        return s;
    }
    bool isHappy(int n) {
        unordered_set<int> seen;
        while (n != 1 && !seen.count(n)) {
            seen.insert(n);
            n = next(n);
        }
        return n == 1;
    }
};`,
    },
    {
      blurb: "Same set + digit squares.",
      blurbEn: "Same set + digit squares.",
      complexity: "O(log n) per step",
      why: "Medium same — set approach solid.",
      whyEn: "Medium same — set approach is solid.",
      code: `class Solution {
public:
    int next(int n) {
        int s = 0;
        while (n) { int d = n % 10; s += d * d; n /= 10; }
        return s;
    }
    bool isHappy(int n) {
        unordered_set<int> seen;
        while (n != 1 && !seen.count(n)) {
            seen.insert(n);
            n = next(n);
        }
        return n == 1;
    }
};`,
    },
    {
      blurb: "Floyd tortoise-hare. O(1) space.",
      blurbEn: "Floyd tortoise-hare. O(1) space.",
      complexity: "O(log n) steps, O(1) space",
      why: "Slow/fast on next(). Space free cycle detect.",
      whyEn: "Slow/fast on next(). Cycle detect without a set.",
      code: `class Solution {
public:
    int next(int n) {
        int s = 0;
        while (n) { int d = n % 10; s += d * d; n /= 10; }
        return s;
    }
    bool isHappy(int n) {
        int slow = n, fast = next(n);
        while (fast != 1 && slow != fast) {
            slow = next(slow);
            fast = next(next(fast));
        }
        return fast == 1;
    }
};`,
    },
  ),

  "longest-consecutive": T(
    {
      blurb: "Sort unique, consecutive scan.",
      blurbEn: "Sort unique, scan consecutive runs.",
      complexity: "O(n log n) time",
      why: "Sort ke baad streak count. Simple medium se pehle.",
      whyEn: "After sort, count streaks. Simple step before the set trick.",
      code: `class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        if (nums.empty()) return 0;
        sort(nums.begin(), nums.end());
        nums.erase(unique(nums.begin(), nums.end()), nums.end());
        int best = 1, cur = 1;
        for (int i = 1; i < (int)nums.size(); i++) {
            if (nums[i] == nums[i - 1] + 1) { cur++; best = max(best, cur); }
            else cur = 1;
        }
        return best;
    }
};`,
    },
    {
      blurb: "Set + har number se expand.",
      blurbEn: "Set + expand from every number.",
      complexity: "O(n²) worst, usually ok",
      why: "Set mein daalo, har se left-right expand. Kaam karta hai.",
      whyEn: "Put in a set, expand left-right from each. Works.",
      code: `class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        unordered_set<int> s(nums.begin(), nums.end());
        int best = 0;
        for (int x : s) {
            int L = x, R = x;
            while (s.count(L - 1)) L--;
            while (s.count(R + 1)) R++;
            best = max(best, R - L + 1);
        }
        return best;
    }
};`,
    },
    {
      blurb: "Set. Sirf streak start pe expand.",
      blurbEn: "Set. Expand only at streak starts.",
      complexity: "O(n) time, O(n) space",
      why: "num-1 missing tabhi start. Har number ek baar. Interview answer.",
      whyEn: "Start only when num-1 missing. Each number once. Interview answer.",
      code: `class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        unordered_set<int> s(nums.begin(), nums.end());
        int best = 0;
        for (int x : s) {
            if (s.count(x - 1)) continue;
            int len = 1;
            while (s.count(x + len)) len++;
            best = max(best, len);
        }
        return best;
    }
};`,
    },
  ),

  "two-sum-ii": T(
    {
      blurb: "Nested loops. 1-based indices.",
      blurbEn: "Nested loops. 1-based indices.",
      complexity: "O(n²) time, O(1) space",
      why: "Sorted ignore karke brute force. Clear pehla step.",
      whyEn: "Ignore sorted property; brute force. Clear first step.",
      code: `class Solution {
public:
    vector<int> twoSum(vector<int>& numbers, int target) {
        int n = numbers.size();
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++)
                if (numbers[i] + numbers[j] == target) return {i + 1, j + 1};
        return {};
    }
};`,
    },
    {
      blurb: "Two pointers ends se.",
      blurbEn: "Two pointers from the ends.",
      complexity: "O(n) time, O(1) space",
      why: "Sorted hai to L/R move. Sum chhota → L++, bada → R--.",
      whyEn: "Sorted → move L/R. Sum small → L++, large → R--.",
      code: `class Solution {
public:
    vector<int> twoSum(vector<int>& numbers, int target) {
        int L = 0, R = (int)numbers.size() - 1;
        while (L < R) {
            int sum = numbers[L] + numbers[R];
            if (sum == target) return {L + 1, R + 1};
            if (sum < target) L++;
            else R--;
        }
        return {};
    }
};`,
    },
    {
      blurb: "Same two pointers. Best = medium.",
      blurbEn: "Same two pointers. Best equals medium.",
      complexity: "O(n) time, O(1) space",
      why: "Yeh hi optimal — hash ki zarurat nahi.",
      whyEn: "This is optimal — no hash needed.",
      code: `class Solution {
public:
    vector<int> twoSum(vector<int>& numbers, int target) {
        int L = 0, R = (int)numbers.size() - 1;
        while (L < R) {
            int sum = numbers[L] + numbers[R];
            if (sum == target) return {L + 1, R + 1};
            if (sum < target) L++;
            else R--;
        }
        return {};
    }
};`,
    },
  ),

  "squares-sorted": T(
    {
      blurb: "Square sab, phir sort.",
      blurbEn: "Square all, then sort.",
      complexity: "O(n log n) time",
      why: "Seedha: square + sort. Kaam karta hai.",
      whyEn: "Literal: square then sort. It works.",
      code: `class Solution {
public:
    vector<int> sortedSquares(vector<int>& nums) {
        for (int& x : nums) x = x * x;
        sort(nums.begin(), nums.end());
        return nums;
    }
};`,
    },
    {
      blurb: "Two pointers, fill from end.",
      blurbEn: "Two pointers, fill from the end.",
      complexity: "O(n) time, O(n) space",
      why: "Largest square ends pe. Compare abs(L) vs abs(R).",
      whyEn: "Largest squares at ends. Compare abs(L) vs abs(R).",
      code: `class Solution {
public:
    vector<int> sortedSquares(vector<int>& nums) {
        int n = nums.size();
        vector<int> ans(n);
        int L = 0, R = n - 1, k = n - 1;
        while (L <= R) {
            long long a = 1LL * nums[L] * nums[L];
            long long b = 1LL * nums[R] * nums[R];
            if (a > b) { ans[k--] = (int)a; L++; }
            else { ans[k--] = (int)b; R--; }
        }
        return ans;
    }
};`,
    },
    {
      blurb: "Same two-pointers fill. Best = medium.",
      blurbEn: "Same two-pointers fill. Best equals medium.",
      complexity: "O(n) time, O(n) space",
      why: "O(n) fill already optimal.",
      whyEn: "O(n) fill is already optimal.",
      code: `class Solution {
public:
    vector<int> sortedSquares(vector<int>& nums) {
        int n = nums.size();
        vector<int> ans(n);
        int L = 0, R = n - 1, k = n - 1;
        while (L <= R) {
            long long a = 1LL * nums[L] * nums[L];
            long long b = 1LL * nums[R] * nums[R];
            if (a > b) { ans[k--] = (int)a; L++; }
            else { ans[k--] = (int)b; R--; }
        }
        return ans;
    }
};`,
    },
  ),

  "trapping-rain": T(
    {
      blurb: "Har i pe maxL / maxR scan.",
      blurbEn: "For each i, scan maxL and maxR.",
      complexity: "O(n²) time, O(1) space",
      why: "Water = min(leftMax,rightMax)-h[i]. Nested scan se nikaalo.",
      whyEn: "Water = min(leftMax,rightMax)-h[i]. Nested scans compute it.",
      code: `class Solution {
public:
    int trap(vector<int>& height) {
        int n = height.size(), water = 0;
        for (int i = 0; i < n; i++) {
            int maxL = 0, maxR = 0;
            for (int j = 0; j <= i; j++) maxL = max(maxL, height[j]);
            for (int j = i; j < n; j++) maxR = max(maxR, height[j]);
            water += min(maxL, maxR) - height[i];
        }
        return water;
    }
};`,
    },
    {
      blurb: "Prefix / suffix max arrays.",
      blurbEn: "Prefix / suffix max arrays.",
      complexity: "O(n) time, O(n) space",
      why: "Precompute leftMax rightMax. Phir O(1) per cell.",
      whyEn: "Precompute leftMax/rightMax. Then O(1) per cell.",
      code: `class Solution {
public:
    int trap(vector<int>& height) {
        int n = height.size();
        if (n == 0) return 0;
        vector<int> L(n), R(n);
        L[0] = height[0];
        for (int i = 1; i < n; i++) L[i] = max(L[i - 1], height[i]);
        R[n - 1] = height[n - 1];
        for (int i = n - 2; i >= 0; i--) R[i] = max(R[i + 1], height[i]);
        int water = 0;
        for (int i = 0; i < n; i++) water += min(L[i], R[i]) - height[i];
        return water;
    }
};`,
    },
    {
      blurb: "Two pointers. O(1) space.",
      blurbEn: "Two pointers. O(1) space.",
      complexity: "O(n) time, O(1) space",
      why: "Chhoti side move karo, water add. Interview king.",
      whyEn: "Move the smaller side, add water. Interview king.",
      code: `class Solution {
public:
    int trap(vector<int>& height) {
        int L = 0, R = (int)height.size() - 1;
        int maxL = 0, maxR = 0, water = 0;
        while (L < R) {
            if (height[L] < height[R]) {
                maxL = max(maxL, height[L]);
                water += maxL - height[L];
                L++;
            } else {
                maxR = max(maxR, height[R]);
                water += maxR - height[R];
                R--;
            }
        }
        return water;
    }
};`,
    },
  ),

  "max-consec-ones-iii": T(
    {
      blurb: "Har window try. At most k zeros.",
      blurbEn: "Try every window. At most k zeros.",
      complexity: "O(n²) time",
      why: "Har L..R pe zeros count. Beginner window idea.",
      whyEn: "Count zeros in every L..R. Beginner window idea.",
      code: `class Solution {
public:
    int longestOnes(vector<int>& nums, int k) {
        int n = nums.size(), best = 0;
        for (int L = 0; L < n; L++) {
            int zeros = 0;
            for (int R = L; R < n; R++) {
                if (nums[R] == 0) zeros++;
                if (zeros > k) break;
                best = max(best, R - L + 1);
            }
        }
        return best;
    }
};`,
    },
    {
      blurb: "Sliding window zeros count.",
      blurbEn: "Sliding window with zeros count.",
      complexity: "O(n) time, O(1) space",
      why: "Expand R; zeros>k to L aage. Max length.",
      whyEn: "Expand R; when zeros>k advance L. Track max length.",
      code: `class Solution {
public:
    int longestOnes(vector<int>& nums, int k) {
        int L = 0, zeros = 0, best = 0;
        for (int R = 0; R < (int)nums.size(); R++) {
            if (nums[R] == 0) zeros++;
            while (zeros > k) if (nums[L++] == 0) zeros--;
            best = max(best, R - L + 1);
        }
        return best;
    }
};`,
    },
    {
      blurb: "Same sliding window. Best = medium.",
      blurbEn: "Same sliding window. Best equals medium.",
      complexity: "O(n) time, O(1) space",
      why: "O(n) window already optimal.",
      whyEn: "O(n) window is already optimal.",
      code: `class Solution {
public:
    int longestOnes(vector<int>& nums, int k) {
        int L = 0, zeros = 0, best = 0;
        for (int R = 0; R < (int)nums.size(); R++) {
            if (nums[R] == 0) zeros++;
            while (zeros > k) if (nums[L++] == 0) zeros--;
            best = max(best, R - L + 1);
        }
        return best;
    }
};`,
    },
  ),

  "find-anagrams": T(
    {
      blurb: "Har window sort, p se match.",
      blurbEn: "Sort each window, match against p.",
      complexity: "O(n * m log m) time",
      why: "Anagram = same sorted string. Slow but clear.",
      whyEn: "Anagram = same sorted string. Slow but clear.",
      code: `class Solution {
public:
    vector<int> findAnagrams(string s, string p) {
        vector<int> ans;
        int m = p.size(), n = s.size();
        if (m > n) return ans;
        string key = p;
        sort(key.begin(), key.end());
        for (int i = 0; i + m <= n; i++) {
            string w = s.substr(i, m);
            sort(w.begin(), w.end());
            if (w == key) ans.push_back(i);
        }
        return ans;
    }
};`,
    },
    {
      blurb: "Sliding freq[26] compare.",
      blurbEn: "Sliding freq[26] compare.",
      complexity: "O(n) time, O(1) space",
      why: "Fixed window. Add/remove char, freqs equal → anagram.",
      whyEn: "Fixed window. Add/remove chars; equal freqs → anagram.",
      code: `class Solution {
public:
    vector<int> findAnagrams(string s, string p) {
        vector<int> ans;
        int m = p.size(), n = s.size();
        if (m > n) return ans;
        array<int, 26> need{}, win{};
        for (char c : p) need[c - 'a']++;
        for (int i = 0; i < n; i++) {
            win[s[i] - 'a']++;
            if (i >= m) win[s[i - m] - 'a']--;
            if (i >= m - 1 && win == need) ans.push_back(i - m + 1);
        }
        return ans;
    }
};`,
    },
    {
      blurb: "Same sliding freq. Best = medium.",
      blurbEn: "Same sliding freq. Best equals medium.",
      complexity: "O(n) time, O(1) space",
      why: "Sliding freq hi optimal.",
      whyEn: "Sliding freq is optimal.",
      code: `class Solution {
public:
    vector<int> findAnagrams(string s, string p) {
        vector<int> ans;
        int m = p.size(), n = s.size();
        if (m > n) return ans;
        array<int, 26> need{}, win{};
        for (char c : p) need[c - 'a']++;
        for (int i = 0; i < n; i++) {
            win[s[i] - 'a']++;
            if (i >= m) win[s[i - m] - 'a']--;
            if (i >= m - 1 && win == need) ans.push_back(i - m + 1);
        }
        return ans;
    }
};`,
    },
  ),

  "binary-search": T(
    {
      blurb: "Linear scan. Target dhundo.",
      blurbEn: "Linear scan. Find the target.",
      complexity: "O(n) time, O(1) space",
      why: "Sorted ignore. Seedha loop. Binary se pehle.",
      whyEn: "Ignore sorted. Plain loop. Before binary search.",
      code: `class Solution {
public:
    int search(vector<int>& nums, int target) {
        for (int i = 0; i < (int)nums.size(); i++)
            if (nums[i] == target) return i;
        return -1;
    }
};`,
    },
    {
      blurb: "Classic binary search.",
      blurbEn: "Classic binary search.",
      complexity: "O(log n) time, O(1) space",
      why: "L/R mid. Halve space. Medium = best almost.",
      whyEn: "L/R mid. Halve the space. Medium almost best.",
      code: `class Solution {
public:
    int search(vector<int>& nums, int target) {
        int L = 0, R = (int)nums.size() - 1;
        while (L <= R) {
            int mid = L + (R - L) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) L = mid + 1;
            else R = mid - 1;
        }
        return -1;
    }
};`,
    },
    {
      blurb: "Same binary search. Best = medium.",
      blurbEn: "Same binary search. Best equals medium.",
      complexity: "O(log n) time, O(1) space",
      why: "Log n binary hi optimal.",
      whyEn: "Log-n binary is optimal.",
      code: `class Solution {
public:
    int search(vector<int>& nums, int target) {
        int L = 0, R = (int)nums.size() - 1;
        while (L <= R) {
            int mid = L + (R - L) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) L = mid + 1;
            else R = mid - 1;
        }
        return -1;
    }
};`,
    },
  ),

  "search-insert": T(
    {
      blurb: "Linear: pehla index >= target.",
      blurbEn: "Linear: first index >= target.",
      complexity: "O(n) time",
      why: "Lower bound brute. Binary se pehle intuition.",
      whyEn: "Brute lower bound. Intuition before binary.",
      code: `class Solution {
public:
    int searchInsert(vector<int>& nums, int target) {
        for (int i = 0; i < (int)nums.size(); i++)
            if (nums[i] >= target) return i;
        return nums.size();
    }
};`,
    },
    {
      blurb: "Binary lower_bound.",
      blurbEn: "Binary lower_bound.",
      complexity: "O(log n) time",
      why: "L after loop = insert position.",
      whyEn: "L after the loop is the insert position.",
      code: `class Solution {
public:
    int searchInsert(vector<int>& nums, int target) {
        int L = 0, R = (int)nums.size();
        while (L < R) {
            int mid = L + (R - L) / 2;
            if (nums[mid] < target) L = mid + 1;
            else R = mid;
        }
        return L;
    }
};`,
    },
    {
      blurb: "Same lower_bound binary.",
      blurbEn: "Same lower_bound binary.",
      complexity: "O(log n) time",
      why: "Yeh hi best insert position.",
      whyEn: "This is the best insert-position search.",
      code: `class Solution {
public:
    int searchInsert(vector<int>& nums, int target) {
        int L = 0, R = (int)nums.size();
        while (L < R) {
            int mid = L + (R - L) / 2;
            if (nums[mid] < target) L = mid + 1;
            else R = mid;
        }
        return L;
    }
};`,
    },
  ),

  "first-last-position": T(
    {
      blurb: "Linear first aur last scan.",
      blurbEn: "Linear scan for first and last.",
      complexity: "O(n) time",
      why: "Do passes: pehli aur aakhri match.",
      whyEn: "Two passes: first and last match.",
      code: `class Solution {
public:
    vector<int> searchRange(vector<int>& nums, int target) {
        int first = -1, last = -1;
        for (int i = 0; i < (int)nums.size(); i++) {
            if (nums[i] == target) {
                if (first == -1) first = i;
                last = i;
            }
        }
        return {first, last};
    }
};`,
    },
    {
      blurb: "Lower + upper bound binary.",
      blurbEn: "Lower + upper bound binary.",
      complexity: "O(log n) time",
      why: "Leftmost + rightmost binary. Range milta hai.",
      whyEn: "Leftmost + rightmost binary. Gets the range.",
      code: `class Solution {
public:
    int lower(vector<int>& a, int t) {
        int L = 0, R = (int)a.size();
        while (L < R) {
            int m = L + (R - L) / 2;
            if (a[m] < t) L = m + 1; else R = m;
        }
        return L;
    }
    int upper(vector<int>& a, int t) {
        int L = 0, R = (int)a.size();
        while (L < R) {
            int m = L + (R - L) / 2;
            if (a[m] <= t) L = m + 1; else R = m;
        }
        return L;
    }
    vector<int> searchRange(vector<int>& nums, int target) {
        int lo = lower(nums, target);
        if (lo == (int)nums.size() || nums[lo] != target) return {-1, -1};
        return {lo, upper(nums, target) - 1};
    }
};`,
    },
    {
      blurb: "Same lower/upper bound. Best.",
      blurbEn: "Same lower/upper bound. Best.",
      complexity: "O(log n) time",
      why: "Two binary searches — optimal.",
      whyEn: "Two binary searches — optimal.",
      code: `class Solution {
public:
    int lower(vector<int>& a, int t) {
        int L = 0, R = (int)a.size();
        while (L < R) {
            int m = L + (R - L) / 2;
            if (a[m] < t) L = m + 1; else R = m;
        }
        return L;
    }
    int upper(vector<int>& a, int t) {
        int L = 0, R = (int)a.size();
        while (L < R) {
            int m = L + (R - L) / 2;
            if (a[m] <= t) L = m + 1; else R = m;
        }
        return L;
    }
    vector<int> searchRange(vector<int>& nums, int target) {
        int lo = lower(nums, target);
        if (lo == (int)nums.size() || nums[lo] != target) return {-1, -1};
        return {lo, upper(nums, target) - 1};
    }
};`,
    },
  ),

  "valid-parentheses": T(
    {
      blurb: "Stack of opens. Close pe match.",
      blurbEn: "Stack of opens. Match on close.",
      complexity: "O(n) time, O(n) space",
      why: "LIFO pairing. Medium=best same stack.",
      whyEn: "LIFO pairing. Medium=best same stack.",
      code: `class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        for (char c : s) {
            if (c == '(' || c == '[' || c == '{') st.push(c);
            else {
                if (st.empty()) return false;
                char o = st.top(); st.pop();
                if ((c == ')' && o != '(') || (c == ']' && o != '[') || (c == '}' && o != '{'))
                    return false;
            }
        }
        return st.empty();
    }
};`,
    },
    {
      blurb: "Same stack matching.",
      blurbEn: "Same stack matching.",
      complexity: "O(n) time, O(n) space",
      why: "Stack hi standard — same code.",
      whyEn: "Stack is the standard — same code.",
      code: `class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        for (char c : s) {
            if (c == '(' || c == '[' || c == '{') st.push(c);
            else {
                if (st.empty()) return false;
                char o = st.top(); st.pop();
                if ((c == ')' && o != '(') || (c == ']' && o != '[') || (c == '}' && o != '{'))
                    return false;
            }
        }
        return st.empty();
    }
};`,
    },
    {
      blurb: "Same stack. Best = medium.",
      blurbEn: "Same stack. Best equals medium.",
      complexity: "O(n) time, O(n) space",
      why: "O(n) stack is optimal.",
      whyEn: "O(n) stack is optimal.",
      code: `class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        for (char c : s) {
            if (c == '(' || c == '[' || c == '{') st.push(c);
            else {
                if (st.empty()) return false;
                char o = st.top(); st.pop();
                if ((c == ')' && o != '(') || (c == ']' && o != '[') || (c == '}' && o != '{'))
                    return false;
            }
        }
        return st.empty();
    }
};`,
    },
  ),

  "min-stack": T(
    {
      blurb: "Pair stack: value + min so far.",
      blurbEn: "Pair stack: value + min so far.",
      complexity: "O(1) ops, O(n) space",
      why: "Har push pe running min store. Easy design.",
      whyEn: "Store running min on each push. Easy design.",
      code: `class MinStack {
    stack<pair<int,int>> st;
public:
    MinStack() {}
    void push(int val) {
        int m = st.empty() ? val : min(val, st.top().second);
        st.push({val, m});
    }
    void pop() { st.pop(); }
    int top() { return st.top().first; }
    int getMin() { return st.top().second; }
};`,
    },
    {
      blurb: "Dual stacks: values + mins.",
      blurbEn: "Dual stacks: values + mins.",
      complexity: "O(1) ops, O(n) space",
      why: "Alag min stack. Same O(1). Medium=best vibe.",
      whyEn: "Separate min stack. Same O(1). Medium=best vibe.",
      code: `class MinStack {
    stack<int> vals, mins;
public:
    MinStack() {}
    void push(int val) {
        vals.push(val);
        mins.push(mins.empty() ? val : min(val, mins.top()));
    }
    void pop() { vals.pop(); mins.pop(); }
    int top() { return vals.top(); }
    int getMin() { return mins.top(); }
};`,
    },
    {
      blurb: "Same dual stack. Best = medium.",
      blurbEn: "Same dual stack. Best equals medium.",
      complexity: "O(1) ops, O(n) space",
      why: "O(1) getMin — yeh hi design.",
      whyEn: "O(1) getMin — this is the design.",
      code: `class MinStack {
    stack<int> vals, mins;
public:
    MinStack() {}
    void push(int val) {
        vals.push(val);
        mins.push(mins.empty() ? val : min(val, mins.top()));
    }
    void pop() { vals.pop(); mins.pop(); }
    int top() { return vals.top(); }
    int getMin() { return mins.top(); }
};`,
    },
  ),

  "daily-temperatures": T(
    {
      blurb: "Har din nested aage warmer dhundo.",
      blurbEn: "For each day, nested scan for warmer.",
      complexity: "O(n²) time",
      why: "Brute next greater. Clear pehle.",
      whyEn: "Brute next-greater. Clear first.",
      code: `class Solution {
public:
    vector<int> dailyTemperatures(vector<int>& temperatures) {
        int n = temperatures.size();
        vector<int> ans(n, 0);
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (temperatures[j] > temperatures[i]) {
                    ans[i] = j - i;
                    break;
                }
            }
        }
        return ans;
    }
};`,
    },
    {
      blurb: "Monotonic decreasing stack of indices.",
      blurbEn: "Monotonic decreasing stack of indices.",
      complexity: "O(n) time, O(n) space",
      why: "Stack pe colder days. Warm aaya to distances set.",
      whyEn: "Colder days on stack. Warmer day sets distances.",
      code: `class Solution {
public:
    vector<int> dailyTemperatures(vector<int>& temperatures) {
        int n = temperatures.size();
        vector<int> ans(n, 0);
        stack<int> st;
        for (int i = 0; i < n; i++) {
            while (!st.empty() && temperatures[i] > temperatures[st.top()]) {
                int j = st.top(); st.pop();
                ans[j] = i - j;
            }
            st.push(i);
        }
        return ans;
    }
};`,
    },
    {
      blurb: "Same monotonic stack. Best.",
      blurbEn: "Same monotonic stack. Best.",
      complexity: "O(n) time, O(n) space",
      why: "Next greater O(n) — yeh hi optimal.",
      whyEn: "Next greater in O(n) — this is optimal.",
      code: `class Solution {
public:
    vector<int> dailyTemperatures(vector<int>& temperatures) {
        int n = temperatures.size();
        vector<int> ans(n, 0);
        stack<int> st;
        for (int i = 0; i < n; i++) {
            while (!st.empty() && temperatures[i] > temperatures[st.top()]) {
                int j = st.top(); st.pop();
                ans[j] = i - j;
            }
            st.push(i);
        }
        return ans;
    }
};`,
    },
  ),

  "reverse-linked-list": T(
    {
      blurb: "Naya list, har node front pe insert.",
      blurbEn: "New list; insert each node at front.",
      complexity: "O(n) time, O(n) space",
      why: "Head insert se reverse order. Extra nodes.",
      whyEn: "Head-insert builds reverse order. Extra nodes.",
      code: `class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        ListNode* neu = nullptr;
        while (head) {
            ListNode* node = new ListNode(head->val);
            node->next = neu;
            neu = node;
            head = head->next;
        }
        return neu;
    }
};`,
    },
    {
      blurb: "Iterative 3 pointers: prev/cur/next.",
      blurbEn: "Iterative 3 pointers: prev/cur/next.",
      complexity: "O(n) time, O(1) space",
      why: "In-place reverse. Classic interview.",
      whyEn: "In-place reverse. Classic interview.",
      code: `class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        ListNode* prev = nullptr;
        ListNode* cur = head;
        while (cur) {
            ListNode* nxt = cur->next;
            cur->next = prev;
            prev = cur;
            cur = nxt;
        }
        return prev;
    }
};`,
    },
    {
      blurb: "Same iterative (ya recursive). Best.",
      blurbEn: "Same iterative (or recursive). Best.",
      complexity: "O(n) time, O(1) space",
      why: "3-pointer in-place hi best. Recursive bhi ok.",
      whyEn: "3-pointer in-place is best. Recursive also fine.",
      code: `class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        ListNode* prev = nullptr;
        ListNode* cur = head;
        while (cur) {
            ListNode* nxt = cur->next;
            cur->next = prev;
            prev = cur;
            cur = nxt;
        }
        return prev;
    }
};`,
    },
  ),

  "merge-two-lists": T(
    {
      blurb: "Naya list: chhota val copy karte raho.",
      blurbEn: "New list: keep copying the smaller val.",
      complexity: "O(m+n) time, O(m+n) space",
      why: "Values copy. Extra nodes, logic clear.",
      whyEn: "Copy values. Extra nodes, clear logic.",
      code: `class Solution {
public:
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
        ListNode dummy(0), *tail = &dummy;
        while (list1 && list2) {
            if (list1->val <= list2->val) {
                tail->next = new ListNode(list1->val);
                list1 = list1->next;
            } else {
                tail->next = new ListNode(list2->val);
                list2 = list2->next;
            }
            tail = tail->next;
        }
        while (list1) { tail->next = new ListNode(list1->val); list1 = list1->next; tail = tail->next; }
        while (list2) { tail->next = new ListNode(list2->val); list2 = list2->next; tail = tail->next; }
        return dummy.next;
    }
};`,
    },
    {
      blurb: "Iterative merge, stitch existing nodes.",
      blurbEn: "Iterative merge, stitch existing nodes.",
      complexity: "O(m+n) time, O(1) space",
      why: "Dummy + attach smaller pointer. No new nodes.",
      whyEn: "Dummy + attach smaller pointer. No new nodes.",
      code: `class Solution {
public:
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
        ListNode dummy(0), *tail = &dummy;
        while (list1 && list2) {
            if (list1->val <= list2->val) { tail->next = list1; list1 = list1->next; }
            else { tail->next = list2; list2 = list2->next; }
            tail = tail->next;
        }
        tail->next = list1 ? list1 : list2;
        return dummy.next;
    }
};`,
    },
    {
      blurb: "Same iterative stitch. Best.",
      blurbEn: "Same iterative stitch. Best.",
      complexity: "O(m+n) time, O(1) space",
      why: "Pointer merge O(1) space — optimal.",
      whyEn: "Pointer merge in O(1) space — optimal.",
      code: `class Solution {
public:
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
        ListNode dummy(0), *tail = &dummy;
        while (list1 && list2) {
            if (list1->val <= list2->val) { tail->next = list1; list1 = list1->next; }
            else { tail->next = list2; list2 = list2->next; }
            tail = tail->next;
        }
        tail->next = list1 ? list1 : list2;
        return dummy.next;
    }
};`,
    },
  ),

  "linked-list-cycle": T(
    {
      blurb: "Set of visited node pointers.",
      blurbEn: "Set of visited node pointers.",
      complexity: "O(n) time, O(n) space",
      why: "Node dubara dikha to cycle. Extra space.",
      whyEn: "Seeing a node again means cycle. Extra space.",
      code: `class Solution {
public:
    bool hasCycle(ListNode *head) {
        unordered_set<ListNode*> seen;
        while (head) {
            if (seen.count(head)) return true;
            seen.insert(head);
            head = head->next;
        }
        return false;
    }
};`,
    },
    {
      blurb: "Floyd slow/fast. Meet = cycle.",
      blurbEn: "Floyd slow/fast. Meet = cycle.",
      complexity: "O(n) time, O(1) space",
      why: "Slow +1, fast +2. Meet → cycle. Medium=best.",
      whyEn: "Slow +1, fast +2. Meet → cycle. Medium=best.",
      code: `class Solution {
public:
    bool hasCycle(ListNode *head) {
        ListNode *slow = head, *fast = head;
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
            if (slow == fast) return true;
        }
        return false;
    }
};`,
    },
    {
      blurb: "Same Floyd. Best = medium.",
      blurbEn: "Same Floyd. Best equals medium.",
      complexity: "O(n) time, O(1) space",
      why: "Floyd O(1) space — interview answer.",
      whyEn: "Floyd O(1) space — interview answer.",
      code: `class Solution {
public:
    bool hasCycle(ListNode *head) {
        ListNode *slow = head, *fast = head;
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
            if (slow == fast) return true;
        }
        return false;
    }
};`,
    },
  ),

  "invert-binary-tree": T(
    {
      blurb: "BFS queue. Har node pe left/right swap.",
      blurbEn: "BFS queue. Swap left/right at each node.",
      complexity: "O(n) time, O(n) space",
      why: "Level order walk, swap children. Visual clear.",
      whyEn: "Level-order walk, swap children. Visually clear.",
      code: `class Solution {
public:
    TreeNode* invertTree(TreeNode* root) {
        if (!root) return nullptr;
        queue<TreeNode*> q;
        q.push(root);
        while (!q.empty()) {
            TreeNode* n = q.front(); q.pop();
            swap(n->left, n->right);
            if (n->left) q.push(n->left);
            if (n->right) q.push(n->right);
        }
        return root;
    }
};`,
    },
    {
      blurb: "Recursive swap + recurse both.",
      blurbEn: "Recursive swap + recurse both.",
      complexity: "O(n) time, O(h) space",
      why: "Elegant recursive mirror. Medium=best.",
      whyEn: "Elegant recursive mirror. Medium=best.",
      code: `class Solution {
public:
    TreeNode* invertTree(TreeNode* root) {
        if (!root) return nullptr;
        swap(root->left, root->right);
        invertTree(root->left);
        invertTree(root->right);
        return root;
    }
};`,
    },
    {
      blurb: "Same recursive invert. Best.",
      blurbEn: "Same recursive invert. Best.",
      complexity: "O(n) time, O(h) space",
      why: "Recursion clean aur standard.",
      whyEn: "Recursion is clean and standard.",
      code: `class Solution {
public:
    TreeNode* invertTree(TreeNode* root) {
        if (!root) return nullptr;
        swap(root->left, root->right);
        invertTree(root->left);
        invertTree(root->right);
        return root;
    }
};`,
    },
  ),

  "max-depth-tree": T(
    {
      blurb: "BFS levels count.",
      blurbEn: "BFS level count.",
      complexity: "O(n) time, O(n) space",
      why: "Har level pe depth++. Iterative intuition.",
      whyEn: "depth++ per level. Iterative intuition.",
      code: `class Solution {
public:
    int maxDepth(TreeNode* root) {
        if (!root) return 0;
        queue<TreeNode*> q;
        q.push(root);
        int depth = 0;
        while (!q.empty()) {
            int sz = q.size();
            depth++;
            while (sz--) {
                TreeNode* n = q.front(); q.pop();
                if (n->left) q.push(n->left);
                if (n->right) q.push(n->right);
            }
        }
        return depth;
    }
};`,
    },
    {
      blurb: "Recursive 1 + max(L,R).",
      blurbEn: "Recursive 1 + max(L,R).",
      complexity: "O(n) time, O(h) space",
      why: "Definition seedha code. Medium=best.",
      whyEn: "Definition becomes the code. Medium=best.",
      code: `class Solution {
public:
    int maxDepth(TreeNode* root) {
        if (!root) return 0;
        return 1 + max(maxDepth(root->left), maxDepth(root->right));
    }
};`,
    },
    {
      blurb: "Same recursive depth. Best.",
      blurbEn: "Same recursive depth. Best.",
      complexity: "O(n) time, O(h) space",
      why: "One-liner recursion is the classic answer.",
      whyEn: "One-liner recursion is the classic answer.",
      code: `class Solution {
public:
    int maxDepth(TreeNode* root) {
        if (!root) return 0;
        return 1 + max(maxDepth(root->left), maxDepth(root->right));
    }
};`,
    },
  ),

  "same-tree": T(
    {
      blurb: "BFS compare dono trees saath.",
      blurbEn: "BFS compare both trees together.",
      complexity: "O(n) time, O(n) space",
      why: "Queue pairs. Structure + values match.",
      whyEn: "Queue of pairs. Structure and values must match.",
      code: `class Solution {
public:
    bool isSameTree(TreeNode* p, TreeNode* q) {
        queue<pair<TreeNode*, TreeNode*>> qu;
        qu.push({p, q});
        while (!qu.empty()) {
            auto [a, b] = qu.front(); qu.pop();
            if (!a && !b) continue;
            if (!a || !b || a->val != b->val) return false;
            qu.push({a->left, b->left});
            qu.push({a->right, b->right});
        }
        return true;
    }
};`,
    },
    {
      blurb: "Recursive null checks + vals.",
      blurbEn: "Recursive null checks + values.",
      complexity: "O(n) time, O(h) space",
      why: "Clean recursive definition. Medium=best.",
      whyEn: "Clean recursive definition. Medium=best.",
      code: `class Solution {
public:
    bool isSameTree(TreeNode* p, TreeNode* q) {
        if (!p && !q) return true;
        if (!p || !q || p->val != q->val) return false;
        return isSameTree(p->left, q->left) && isSameTree(p->right, q->right);
    }
};`,
    },
    {
      blurb: "Same recursive compare. Best.",
      blurbEn: "Same recursive compare. Best.",
      complexity: "O(n) time, O(h) space",
      why: "Recursion is the standard answer.",
      whyEn: "Recursion is the standard answer.",
      code: `class Solution {
public:
    bool isSameTree(TreeNode* p, TreeNode* q) {
        if (!p && !q) return true;
        if (!p || !q || p->val != q->val) return false;
        return isSameTree(p->left, q->left) && isSameTree(p->right, q->right);
    }
};`,
    },
  ),

  "climb-stairs": T(
    {
      blurb: "Naive recursion: f(n-1)+f(n-2).",
      blurbEn: "Naive recursion: f(n-1)+f(n-2).",
      complexity: "O(2^n) time",
      why: "Definition seedha. Slow — memo seekho next.",
      whyEn: "Literal definition. Slow — learn memo next.",
      code: `class Solution {
public:
    int climbStairs(int n) {
        if (n <= 2) return n;
        return climbStairs(n - 1) + climbStairs(n - 2);
    }
};`,
    },
    {
      blurb: "Memoized recursion / dp array.",
      blurbEn: "Memoized recursion / dp array.",
      complexity: "O(n) time, O(n) space",
      why: "Har n ek baar. Fibonacci with cache.",
      whyEn: "Each n once. Fibonacci with a cache.",
      code: `class Solution {
public:
    int climbStairs(int n) {
        vector<int> dp(n + 1, -1);
        function<int(int)> f = [&](int k) {
            if (k <= 2) return k;
            if (dp[k] != -1) return dp[k];
            return dp[k] = f(k - 1) + f(k - 2);
        };
        return f(n);
    }
};`,
    },
    {
      blurb: "Do rolling vars. O(1) space.",
      blurbEn: "Two rolling vars. O(1) space.",
      complexity: "O(n) time, O(1) space",
      why: "a,b slide. Interview fib answer.",
      whyEn: "Slide a,b. Interview fib answer.",
      code: `class Solution {
public:
    int climbStairs(int n) {
        if (n <= 2) return n;
        int a = 1, b = 2;
        for (int i = 3; i <= n; i++) {
            int c = a + b;
            a = b; b = c;
        }
        return b;
    }
};`,
    },
  ),

  "house-robber": T(
    {
      blurb: "Naive recursion: rob / skip.",
      blurbEn: "Naive recursion: rob or skip.",
      complexity: "O(2^n) time",
      why: "Har house: lo ya chhodo. Exponential.",
      whyEn: "Each house: take or skip. Exponential.",
      code: `class Solution {
public:
    int robFrom(vector<int>& nums, int i) {
        if (i >= (int)nums.size()) return 0;
        return max(nums[i] + robFrom(nums, i + 2), robFrom(nums, i + 1));
    }
    int rob(vector<int>& nums) { return robFrom(nums, 0); }
};`,
    },
    {
      blurb: "DP array: max(skip, take).",
      blurbEn: "DP array: max(skip, take).",
      complexity: "O(n) time, O(n) space",
      why: "dp[i] = max(dp[i-1], dp[i-2]+nums[i]).",
      whyEn: "dp[i] = max(dp[i-1], dp[i-2]+nums[i]).",
      code: `class Solution {
public:
    int rob(vector<int>& nums) {
        int n = nums.size();
        if (n == 0) return 0;
        if (n == 1) return nums[0];
        vector<int> dp(n);
        dp[0] = nums[0];
        dp[1] = max(nums[0], nums[1]);
        for (int i = 2; i < n; i++)
            dp[i] = max(dp[i - 1], dp[i - 2] + nums[i]);
        return dp[n - 1];
    }
};`,
    },
    {
      blurb: "Do vars prev2/prev1. O(1) space.",
      blurbEn: "Two vars prev2/prev1. O(1) space.",
      complexity: "O(n) time, O(1) space",
      why: "DP roll. Interview optimal.",
      whyEn: "Rolled DP. Interview optimal.",
      code: `class Solution {
public:
    int rob(vector<int>& nums) {
        int prev2 = 0, prev1 = 0;
        for (int x : nums) {
            int cur = max(prev1, prev2 + x);
            prev2 = prev1;
            prev1 = cur;
        }
        return prev1;
    }
};`,
    },
  ),

  "coin-change": T(
    {
      blurb: "Naive recursion: try har coin.",
      blurbEn: "Naive recursion: try each coin.",
      complexity: "Exponential time",
      why: "Har amount pe saari coins try. Slow but idea.",
      whyEn: "Try all coins at each amount. Slow but shows the idea.",
      code: `class Solution {
public:
    int rec(vector<int>& coins, int amount) {
        if (amount == 0) return 0;
        if (amount < 0) return INT_MAX / 2;
        int best = INT_MAX / 2;
        for (int c : coins) best = min(best, 1 + rec(coins, amount - c));
        return best;
    }
    int coinChange(vector<int>& coins, int amount) {
        int ans = rec(coins, amount);
        return ans >= INT_MAX / 2 ? -1 : ans;
    }
};`,
    },
    {
      blurb: "Top-down DP / memo on amount.",
      blurbEn: "Top-down DP / memo on amount.",
      complexity: "O(amount * coins) time",
      why: "Memo se overlapping subproblems kaate.",
      whyEn: "Memo cuts overlapping subproblems.",
      code: `class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        vector<int> memo(amount + 1, -2);
        function<int(int)> dp = [&](int a) {
            if (a == 0) return 0;
            if (a < 0) return INT_MAX / 2;
            if (memo[a] != -2) return memo[a];
            int best = INT_MAX / 2;
            for (int c : coins) best = min(best, 1 + dp(a - c));
            return memo[a] = best;
        };
        int ans = dp(amount);
        return ans >= INT_MAX / 2 ? -1 : ans;
    }
};`,
    },
    {
      blurb: "Bottom-up DP. Fewest coins.",
      blurbEn: "Bottom-up DP. Fewest coins.",
      complexity: "O(amount * coins) time, O(amount) space",
      why: "dp[x]=min(dp[x-coin]+1). Interview standard.",
      whyEn: "dp[x]=min(dp[x-coin]+1). Interview standard.",
      code: `class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        const int INF = amount + 1;
        vector<int> dp(amount + 1, INF);
        dp[0] = 0;
        for (int a = 1; a <= amount; a++) {
            for (int c : coins) if (c <= a) dp[a] = min(dp[a], dp[a - c] + 1);
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }
};`,
    },
  ),
};
