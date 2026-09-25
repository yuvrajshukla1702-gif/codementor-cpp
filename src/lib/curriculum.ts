import type { Curriculum } from "./types";
import { moreProblems, moreTopics, topicProblemExtras } from "./problems-bank";
import { hrProblems, hrTopic } from "./hr-problems";

const TWO_SUM_HARNESS = `#include <bits/stdc++.h>
using namespace std;

// === STUDENT_CODE_START ===
{{CODE}}
// === STUDENT_CODE_END ===

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);
  int n, target;
  if (!(cin >> n >> target)) return 0;
  vector<int> nums(n);
  for (int i = 0; i < n; i++) cin >> nums[i];
  Solution sol;
  auto ans = sol.twoSum(nums, target);
  if (ans.size() != 2) { cout << "[]\\n"; return 0; }
  if (ans[0] > ans[1]) swap(ans[0], ans[1]);
  cout << ans[0] << " " << ans[1] << "\\n";
  return 0;
}
`;

const baseTopics = [
  {
    id: "arrays",
    title: "Arrays",
    blurb: "Index thinking, in-place tricks, prefix patterns — your current strength zone. We deepen it.",
    order: 1,
    problemIds: ["two-sum", "contains-duplicate", "best-time-stock", "plus-one", "move-zeroes", "rotate-array", "maximum-subarray"],
  },
  {
    id: "hashing",
    title: "Hashing",
    blurb: "Trade space for time. Maps and sets turn O(n²) into O(n).",
    order: 2,
    problemIds: ["two-sum-hash", "intersection-two-arrays-ii", "group-anagrams", "top-k-frequent"],
  },
  {
    id: "two-pointers",
    title: "Two Pointers",
    blurb: "Two indices walking with a rule — sorted arrays and partitions.",
    order: 3,
    problemIds: ["valid-palindrome", "container-most-water", "three-sum", "remove-duplicates-sorted"],
  },
  {
    id: "sliding-window",
    title: "Sliding Window",
    blurb: "Maintain a live window of interest. The gateway to string mastery.",
    order: 4,
    problemIds: ["max-avg-subarray", "longest-substr-no-repeat", "min-window-substring", "permutation-in-string"],
  },
].map((t) => ({
  ...t,
  problemIds: [...t.problemIds, ...(topicProblemExtras[t.id] || [])],
}));

export const curriculum: Curriculum = {
  topics: [...baseTopics, ...moreTopics, hrTopic],
  problems: {
    // placeholder — filled below then merged with moreProblems
    "two-sum": {
      id: "two-sum",
      title: "Two Sum",
      difficulty: "Easy",
      topic: "arrays",
      leetcodeSlug: "two-sum",
      leetcodeId: 1,
      lesson: `# Two Sum — think like a teacher, not a memorizer

You get an array of integers and a target. Return **indices** of two numbers that add to target.

## Wrong first instinct
Brute force: try every pair. Works, but O(n²). Interviews want the O(n) story.

## The move
As you scan left→right, ask: "Have I already seen \`target - nums[i]\`?"
Keep a hash map: value → index.

## Dry run
\`nums = [2,7,11,15], target = 9\`
- i=0, need 7, map empty → store 2→0
- i=1, need 2, map has 2 at 0 → return [0,1]

You already solved this on LeetCode. Rewrite it cleanly here without peeking.

**Tip:** Open the Animated Classroom for Two Sum — watch the map fill before you code.`,
      starterCode: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution
        return {};
    }
};`,
      harness: TWO_SUM_HARNESS,
      tests: [
        { input: "4 9\n2 7 11 15\n", expected: "0 1" },
        { input: "3 6\n3 2 4\n", expected: "1 2" },
        { input: "2 6\n3 3\n", expected: "0 1", hidden: true },
      ],
      hints: [
        "You need indices, not the values. What structure maps value → index in O(1)?",
        "For each nums[i], look up target - nums[i] in a map before inserting nums[i].",
        "unordered_map<int,int> mp; for i... if(mp.count(target-nums[i])) return {mp[...], i}; mp[nums[i]]=i;",
      ],
    },
    "contains-duplicate": {
      id: "contains-duplicate",
      title: "Contains Duplicate",
      difficulty: "Easy",
      topic: "arrays",
      leetcodeSlug: "contains-duplicate",
      leetcodeId: 217,
      lesson: `# Contains Duplicate

Return true if any value appears at least twice.

## Pattern
Set membership. If insert fails / already exists → duplicate.

Sorting also works (O(n log n)) but the set is the interview answer.`,
      starterCode: `class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        return false;
    }
};`,
      harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){
  int n; cin>>n; vector<int> a(n); for(int i=0;i<n;i++) cin>>a[i];
  cout<<(Solution().containsDuplicate(a)?"true":"false")<<"\\n";
}`,
      tests: [
        { input: "4\n1 2 3 1\n", expected: "true" },
        { input: "4\n1 2 3 4\n", expected: "false" },
        { input: "1\n1\n", expected: "false", hidden: true },
      ],
      hints: [
        "What data structure answers 'have I seen this before?' instantly?",
        "unordered_set: if count(x) return true; else insert.",
        "unordered_set<int> s; for(int x:nums){ if(s.count(x)) return true; s.insert(x);} return false;",
      ],
    },
    "best-time-stock": {
      id: "best-time-stock",
      title: "Best Time to Buy and Sell Stock",
      difficulty: "Easy",
      topic: "arrays",
      leetcodeSlug: "best-time-to-buy-and-sell-stock",
      leetcodeId: 121,
      lesson: `# Buy Low, Sell High (one transaction)

Track the **minimum price so far**. At each day, profit = price - minSoFar. Keep max profit.

One pass. No nested loops.`,
      starterCode: `class Solution {
public:
    int maxProfit(vector<int>& prices) {
        return 0;
    }
};`,
      harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){ int n; cin>>n; vector<int>a(n); for(int i=0;i<n;i++)cin>>a[i]; cout<<Solution().maxProfit(a)<<"\\n"; }`,
      tests: [
        { input: "6\n7 1 5 3 6 4\n", expected: "5" },
        { input: "5\n7 6 4 3 1\n", expected: "0" },
      ],
      hints: [
        "You only need the cheapest buy day before today.",
        "Maintain minPrice and maxProfit while scanning once.",
        "minP=INT_MAX; ans=0; for(p:prices){ minP=min(minP,p); ans=max(ans,p-minP);} return ans;",
      ],
    },
    "plus-one": {
      id: "plus-one",
      title: "Plus One",
      difficulty: "Easy",
      topic: "arrays",
      leetcodeSlug: "plus-one",
      leetcodeId: 66,
      lesson: `# Plus One on a digit array

Handle carry from the right. If all 9s, grow the array.`,
      starterCode: `class Solution {
public:
    vector<int> plusOne(vector<int>& digits) {
        return digits;
    }
};`,
      harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){ int n; cin>>n; vector<int>a(n); for(int i=0;i<n;i++)cin>>a[i];
 auto r=Solution().plusOne(a); for(size_t i=0;i<r.size();i++){ if(i)cout<<' '; cout<<r[i]; } cout<<"\\n"; }`,
      tests: [
        { input: "3\n1 2 3\n", expected: "1 2 4" },
        { input: "3\n9 9 9\n", expected: "1 0 0 0" },
      ],
      hints: [
        "Start from the last digit and propagate carry.",
        "If digits[i]<9, increment and return; else set 0 and continue.",
        "After loop, insert 1 at begin (or return {1,0,0,...}).",
      ],
    },
    "move-zeroes": {
      id: "move-zeroes",
      title: "Move Zeroes",
      difficulty: "Easy",
      topic: "arrays",
      leetcodeSlug: "move-zeroes",
      leetcodeId: 283,
      lesson: `# Move Zeroes in-place

Two pointers: write non-zeros forward, then fill the rest with zeros.`,
      starterCode: `class Solution {
public:
    void moveZeroes(vector<int>& nums) {
        
    }
};`,
      harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){ int n; cin>>n; vector<int>a(n); for(int i=0;i<n;i++)cin>>a[i];
 Solution().moveZeroes(a); for(size_t i=0;i<a.size();i++){ if(i)cout<<' '; cout<<a[i]; } cout<<"\\n"; }`,
      tests: [
        { input: "5\n0 1 0 3 12\n", expected: "1 3 12 0 0" },
        { input: "1\n0\n", expected: "0" },
      ],
      hints: [
        "Keep an index for the next non-zero write position.",
        "First pass copy non-zeros; second pass fill zeros.",
        "int w=0; for(int x:nums) if(x) nums[w++]=x; while(w<(int)nums.size()) nums[w++]=0;",
      ],
    },
    "rotate-array": {
      id: "rotate-array",
      title: "Rotate Array",
      difficulty: "Medium",
      topic: "arrays",
      leetcodeSlug: "rotate-array",
      leetcodeId: 189,
      lesson: `# Rotate Array by k (in-place)

Classic: reverse all, reverse first k, reverse rest. k %= n.`,
      starterCode: `class Solution {
public:
    void rotate(vector<int>& nums, int k) {
        
    }
};`,
      harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){ int n,k; cin>>n>>k; vector<int>a(n); for(int i=0;i<n;i++)cin>>a[i];
 Solution().rotate(a,k); for(size_t i=0;i<a.size();i++){ if(i)cout<<' '; cout<<a[i]; } cout<<"\\n"; }`,
      tests: [
        { input: "7 3\n1 2 3 4 5 6 7\n", expected: "5 6 7 1 2 3 4" },
        { input: "4 2\n-1 -100 3 99\n", expected: "3 99 -1 -100" },
      ],
      hints: [
        "k can be larger than n — take modulo.",
        "Three reverses: whole, [0..k), [k..n).",
        "reverse(all); reverse(first k); reverse(rest);",
      ],
    },
    "maximum-subarray": {
      id: "maximum-subarray",
      title: "Maximum Subarray (Kadane)",
      difficulty: "Medium",
      topic: "arrays",
      leetcodeSlug: "maximum-subarray",
      leetcodeId: 53,
      lesson: `# Kadane's Algorithm

At each index: extend the previous subarray or start fresh?
\`cur = max(x, cur+x)\`, \`ans = max(ans, cur)\`.`,
      starterCode: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        return 0;
    }
};`,
      harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){ int n; cin>>n; vector<int>a(n); for(int i=0;i<n;i++)cin>>a[i]; cout<<Solution().maxSubArray(a)<<"\\n"; }`,
      tests: [
        { input: "9\n-2 1 -3 4 -1 2 1 -5 4\n", expected: "6" },
        { input: "1\n1\n", expected: "1" },
        { input: "5\n-1 -2 -3 -4 -5\n", expected: "-1", hidden: true },
      ],
      hints: [
        "Local best ending at i vs starting over at i.",
        "Track curSum and globalMax.",
        "cur=ans=nums[0]; for i=1.. cur=max(nums[i],cur+nums[i]); ans=max(ans,cur);",
      ],
    },
    "two-sum-hash": {
      id: "two-sum-hash",
      title: "Two Sum (Hash Drill)",
      difficulty: "Easy",
      topic: "hashing",
      leetcodeSlug: "two-sum",
      leetcodeId: 1,
      lesson: `# Same Two Sum — force the hash solution

No nested loops. Prove you own unordered_map.`,
      starterCode: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        return {};
    }
};`,
      harness: TWO_SUM_HARNESS,
      tests: [
        { input: "4 9\n2 7 11 15\n", expected: "0 1" },
        { input: "3 6\n3 2 4\n", expected: "1 2" },
      ],
      hints: [
        "Map value to index.",
        "Check complement before insert.",
        "unordered_map path from the Arrays lesson.",
      ],
    },
    "intersection-two-arrays-ii": {
      id: "intersection-two-arrays-ii",
      title: "Intersection of Two Arrays II",
      difficulty: "Easy",
      topic: "hashing",
      leetcodeSlug: "intersection-of-two-arrays-ii",
      leetcodeId: 350,
      lesson: `# Multiset Intersection

Count frequencies of one array; walk the other and consume counts.`,
      starterCode: `class Solution {
public:
    vector<int> intersect(vector<int>& nums1, vector<int>& nums2) {
        return {};
    }
};`,
      harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){ int n,m; cin>>n; vector<int>a(n); for(int i=0;i<n;i++)cin>>a[i];
 cin>>m; vector<int>b(m); for(int i=0;i<m;i++)cin>>b[i];
 auto r=Solution().intersect(a,b); sort(r.begin(),r.end());
 for(size_t i=0;i<r.size();i++){ if(i)cout<<' '; cout<<r[i]; } cout<<"\\n"; }`,
      tests: [
        { input: "4\n1 2 2 1\n2\n2 2\n", expected: "2 2" },
        { input: "3\n4 9 5\n5\n9 4 9 8 4\n", expected: "4 9" },
      ],
      hints: [
        "Frequency map on the smaller array.",
        "Decrement count when you take an element.",
        "unordered_map counts; push when count>0 then --.",
      ],
    },
    "group-anagrams": {
      id: "group-anagrams",
      title: "Group Anagrams",
      difficulty: "Medium",
      topic: "hashing",
      leetcodeSlug: "group-anagrams",
      leetcodeId: 49,
      lesson: `# Group Anagrams

Key = sorted string (or 26-count signature). Map key → list of words.`,
      starterCode: `class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        return {};
    }
};`,
      harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){ int n; cin>>n; vector<string>a(n); for(int i=0;i<n;i++)cin>>a[i];
 auto g=Solution().groupAnagrams(a);
 for(auto& v:g) sort(v.begin(),v.end());
 sort(g.begin(),g.end(),[](auto&x,auto&y){ return x.empty()?true: (y.empty()?false:x[0]<y[0]); });
 for(size_t i=0;i<g.size();i++){ if(i)cout<<" | "; for(size_t j=0;j<g[i].size();j++){ if(j)cout<<' '; cout<<g[i][j]; } }
 cout<<"\\n"; }`,
      tests: [
        { input: "6\neat tea tan ate nat bat\n", expected: "ate eat tea | bat | nat tan" },
      ],
      hints: [
        "Anagrams share the same sorted letters.",
        "map<string, vector<string>> keyed by sorted word.",
        "sort copy as key; push original into map[key].",
      ],
    },
    "top-k-frequent": {
      id: "top-k-frequent",
      title: "Top K Frequent Elements",
      difficulty: "Medium",
      topic: "hashing",
      leetcodeSlug: "top-k-frequent-elements",
      leetcodeId: 347,
      lesson: `# Top K Frequent

Count → bucket by frequency (or heap). Interview favorite: bucket sort O(n).`,
      starterCode: `class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {
        return {};
    }
};`,
      harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){ int n,k; cin>>n>>k; vector<int>a(n); for(int i=0;i<n;i++)cin>>a[i];
 auto r=Solution().topKFrequent(a,k); sort(r.begin(),r.end());
 for(size_t i=0;i<r.size();i++){ if(i)cout<<' '; cout<<r[i]; } cout<<"\\n"; }`,
      tests: [
        { input: "6 2\n1 1 1 2 2 3\n", expected: "1 2" },
        { input: "1 1\n1\n", expected: "1" },
      ],
      hints: [
        "First count frequencies.",
        "Bucket: frequency → list of numbers.",
        "Walk buckets from high freq down until k collected.",
      ],
    },
    "valid-palindrome": {
      id: "valid-palindrome",
      title: "Valid Palindrome",
      difficulty: "Easy",
      topic: "two-pointers",
      leetcodeSlug: "valid-palindrome",
      leetcodeId: 125,
      lesson: `# Valid Palindrome

Two pointers from ends. Skip non-alnum. Compare lowercased.`,
      starterCode: `class Solution {
public:
    bool isPalindrome(string s) {
        return false;
    }
};`,
      harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){ string s; getline(cin,s); cout<<(Solution().isPalindrome(s)?"true":"false")<<"\\n"; }`,
      tests: [
        { input: "A man, a plan, a canal: Panama\n", expected: "true" },
        { input: "race a car\n", expected: "false" },
      ],
      hints: [
        "l and r indices moving inward.",
        "isalnum + tolower before compare.",
        "while l<r: skip junk; if lower(s[l])!=lower(s[r]) false; else ++l,--r;",
      ],
    },
    "container-most-water": {
      id: "container-most-water",
      title: "Container With Most Water",
      difficulty: "Medium",
      topic: "two-pointers",
      leetcodeSlug: "container-with-most-water",
      leetcodeId: 11,
      lesson: `# Container With Most Water

Start wide. Move the shorter wall inward — only that can improve area.`,
      starterCode: `class Solution {
public:
    int maxArea(vector<int>& height) {
        return 0;
    }
};`,
      harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){ int n; cin>>n; vector<int>a(n); for(int i=0;i<n;i++)cin>>a[i]; cout<<Solution().maxArea(a)<<"\\n"; }`,
      tests: [
        { input: "9\n1 8 6 2 5 4 8 3 7\n", expected: "49" },
        { input: "2\n1 1\n", expected: "1" },
      ],
      hints: [
        "Area = min(h[l],h[r]) * (r-l).",
        "Move the pointer at the smaller height.",
        "Two pointers from ends updating maxArea.",
      ],
    },
    "three-sum": {
      id: "three-sum",
      title: "3Sum",
      difficulty: "Medium",
      topic: "two-pointers",
      leetcodeSlug: "3sum",
      leetcodeId: 15,
      lesson: `# 3Sum

Sort. Fix one index; two-sum the rest with two pointers. Skip duplicates.`,
      starterCode: `class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        return {};
    }
};`,
      harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){ int n; cin>>n; vector<int>a(n); for(int i=0;i<n;i++)cin>>a[i];
 auto r=Solution().threeSum(a);
 for(auto& t:r) sort(t.begin(),t.end());
 sort(r.begin(),r.end());
 for(size_t i=0;i<r.size();i++){ if(i)cout<<" | "; cout<<r[i][0]<<" "<<r[i][1]<<" "<<r[i][2]; }
 cout<<"\\n"; }`,
      tests: [
        { input: "6\n-1 0 1 2 -1 -4\n", expected: "-1 -1 2 | -1 0 1" },
        { input: "3\n0 1 1\n", expected: "" },
      ],
      hints: [
        "Sort first.",
        "For each i, two pointers on i+1..n-1 seeking -nums[i].",
        "Skip duplicate i / l / r values.",
      ],
    },
    "remove-duplicates-sorted": {
      id: "remove-duplicates-sorted",
      title: "Remove Duplicates from Sorted Array",
      difficulty: "Easy",
      topic: "two-pointers",
      leetcodeSlug: "remove-duplicates-from-sorted-array",
      leetcodeId: 26,
      lesson: `# Remove Duplicates (sorted)

Slow/fast writer pointer. Return new length.`,
      starterCode: `class Solution {
public:
    int removeDuplicates(vector<int>& nums) {
        return 0;
    }
};`,
      harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){ int n; cin>>n; vector<int>a(n); for(int i=0;i<n;i++)cin>>a[i];
 int k=Solution().removeDuplicates(a); cout<<k<<"\\n";
 for(int i=0;i<k;i++){ if(i)cout<<' '; cout<<a[i]; } cout<<"\\n"; }`,
      tests: [
        { input: "3\n1 1 2\n", expected: "2\n1 2" },
        { input: "10\n0 0 1 1 1 2 2 3 3 4\n", expected: "5\n0 1 2 3 4" },
      ],
      hints: [
        "Write pointer advances only on new values.",
        "Compare with previous unique.",
        "int w=1; for i=1.. if nums[i]!=nums[w-1] nums[w++]=nums[i]; return w;",
      ],
    },
    "max-avg-subarray": {
      id: "max-avg-subarray",
      title: "Maximum Average Subarray I",
      difficulty: "Easy",
      topic: "sliding-window",
      leetcodeSlug: "maximum-average-subarray-i",
      leetcodeId: 643,
      lesson: `# Fixed window average

Sum first k, then slide: add right, remove left. Track max sum/k.`,
      starterCode: `class Solution {
public:
    double findMaxAverage(vector<int>& nums, int k) {
        return 0;
    }
};`,
      harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){ int n,k; cin>>n>>k; vector<int>a(n); for(int i=0;i<n;i++)cin>>a[i];
 cout<<fixed<<setprecision(5)<<Solution().findMaxAverage(a,k)<<"\\n"; }`,
      tests: [
        { input: "6 4\n1 12 -5 -6 50 3\n", expected: "12.75000" },
        { input: "1 1\n5\n", expected: "5.00000" },
      ],
      hints: [
        "Fixed size window of k.",
        "Maintain running sum while sliding.",
        "maxSum over window sums; return maxSum/k.",
      ],
    },
    "longest-substr-no-repeat": {
      id: "longest-substr-no-repeat",
      title: "Longest Substring Without Repeating Characters",
      difficulty: "Medium",
      topic: "sliding-window",
      leetcodeSlug: "longest-substring-without-repeating-characters",
      leetcodeId: 3,
      lesson: `# Variable window + last-seen index

Expand right; if duplicate inside window, move left past previous occurrence.`,
      starterCode: `class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        return 0;
    }
};`,
      harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){ string s; getline(cin,s); cout<<Solution().lengthOfLongestSubstring(s)<<"\\n"; }`,
      tests: [
        { input: "abcabcbb\n", expected: "3" },
        { input: "bbbbb\n", expected: "1" },
        { input: "pwwkew\n", expected: "3" },
      ],
      hints: [
        "Sliding window [L,R] with unique chars.",
        "Map char → last index; jump L when needed.",
        "ans = max(ans, R-L+1) each step.",
      ],
    },
    "min-window-substring": {
      id: "min-window-substring",
      title: "Minimum Window Substring",
      difficulty: "Hard",
      topic: "sliding-window",
      leetcodeSlug: "minimum-window-substring",
      leetcodeId: 76,
      lesson: `# Minimum Window Substring (Hard — stretch)

Need all chars of t covered. Expand until valid, shrink while valid, track best.`,
      starterCode: `class Solution {
public:
    string minWindow(string s, string t) {
        return "";
    }
};`,
      harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){ string s,t; cin>>s>>t; cout<<Solution().minWindow(s,t)<<"\\n"; }`,
      tests: [
        { input: "ADOBECODEBANC ABC\n", expected: "BANC" },
        { input: "a a\n", expected: "a" },
      ],
      hints: [
        "Need counts for t; track how many unique requirements satisfied.",
        "Two pointers; shrink from left when window is valid.",
        "Record best length substring when valid.",
      ],
    },
    "permutation-in-string": {
      id: "permutation-in-string",
      title: "Permutation in String",
      difficulty: "Medium",
      topic: "sliding-window",
      leetcodeSlug: "permutation-in-string",
      leetcodeId: 567,
      lesson: `# Permutation in String

Fixed window of len(s1). Compare frequency maps / matches count.`,
      starterCode: `class Solution {
public:
    bool checkInclusion(string s1, string s2) {
        return false;
    }
};`,
      harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){ string a,b; cin>>a>>b; cout<<(Solution().checkInclusion(a,b)?"true":"false")<<"\\n"; }`,
      tests: [
        { input: "ab eidbaooo\n", expected: "true" },
        { input: "ab eidboaoo\n", expected: "false" },
      ],
      hints: [
        "Window size = s1.length().",
        "Maintain 26-letter counts for window vs s1.",
        "Slide one char at a time updating counts.",
      ],
    },
    ...moreProblems,
    ...hrProblems,
  },
};

export function getTopic(id: string) {
  return curriculum.topics.find((t) => t.id === id);
}

export function getProblem(id: string) {
  return curriculum.problems[id];
}

export function allProblems() {
  return Object.values(curriculum.problems);
}
