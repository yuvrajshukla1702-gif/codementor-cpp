import type { Problem, Topic } from "./types";

const VEC_INT_OUT = (fnCall: string, print: string) => `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){
  ios::sync_with_stdio(false); cin.tie(nullptr);
  int n; if(!(cin>>n)) return 0;
  vector<int> a(n); for(int i=0;i<n;i++) cin>>a[i];
  Solution s; ${fnCall}
  ${print}
  return 0;
}
`;

/** Extra problems — variety beyond Phase-1 starter set */
export const moreProblems: Record<string, Problem> = {
  "missing-number": {
    id: "missing-number",
    title: "Missing Number",
    difficulty: "Easy",
    topic: "arrays",
    leetcodeSlug: "missing-number",
    leetcodeId: 268,
    lesson: `# Missing Number

Array of size n with numbers from 0..n missing exactly one.

## Moves
- Math: expected sum \`n*(n+1)/2\` minus actual sum
- XOR: xor all indices and values

## Dry run
\`[3,0,1]\` n=3 → expect 6, sum=4 → missing 2.`,
    starterCode: `class Solution {
public:
    int missingNumber(vector<int>& nums) {
        return 0;
    }
};`,
    harness: VEC_INT_OUT("int ans=s.missingNumber(a);", 'cout<<ans<<"\\n";'),
    tests: [
      { input: "3\n3 0 1\n", expected: "2" },
      { input: "2\n0 1\n", expected: "2" },
      { input: "1\n0\n", expected: "1", hidden: true },
    ],
    hints: [
      "Sum of 0..n is n*(n+1)/2.",
      "XOR trick also works in O(1) space.",
      "long long sum = n*1LL*(n+1)/2; for(int x:nums) sum-=x;",
    ],
  },
  "single-number": {
    id: "single-number",
    title: "Single Number",
    difficulty: "Easy",
    topic: "arrays",
    leetcodeSlug: "single-number",
    leetcodeId: 136,
    lesson: `# Single Number

Every element appears twice except one. Find it in O(n) time O(1) space.

## The move
XOR cancels pairs: \`a^a=0\`, \`a^0=a\`.`,
    starterCode: `class Solution {
public:
    int singleNumber(vector<int>& nums) {
        return 0;
    }
};`,
    harness: VEC_INT_OUT("int ans=s.singleNumber(a);", 'cout<<ans<<"\\n";'),
    tests: [
      { input: "3\n2 2 1\n", expected: "1" },
      { input: "5\n4 1 2 1 2\n", expected: "4" },
    ],
    hints: ["XOR all elements.", "Pairs cancel to 0.", "int x=0; for(int v:nums) x^=v; return x;"],
  },
  "majority-element": {
    id: "majority-element",
    title: "Majority Element",
    difficulty: "Easy",
    topic: "arrays",
    leetcodeSlug: "majority-element",
    leetcodeId: 169,
    lesson: `# Majority Element

Element appearing more than n/2 times. Boyer-Moore voting is the interview flex.`,
    starterCode: `class Solution {
public:
    int majorityElement(vector<int>& nums) {
        return 0;
    }
};`,
    harness: VEC_INT_OUT("int ans=s.majorityElement(a);", 'cout<<ans<<"\\n";'),
    tests: [
      { input: "3\n3 2 3\n", expected: "3" },
      { input: "7\n2 2 1 1 1 2 2\n", expected: "2" },
    ],
    hints: [
      "Boyer-Moore: candidate + count.",
      "When count hits 0, pick new candidate.",
      "Majority is guaranteed to exist in the classic version.",
    ],
  },
  "merge-sorted-array": {
    id: "merge-sorted-array",
    title: "Merge Sorted Array",
    difficulty: "Easy",
    topic: "arrays",
    leetcodeSlug: "merge-sorted-array",
    leetcodeId: 88,
    lesson: `# Merge Sorted Array

Merge nums2 into nums1 (size m+n) in-place. Fill from the **back** so you don't overwrite.`,
    starterCode: `class Solution {
public:
    void merge(vector<int>& nums1, int m, vector<int>& nums2, int n) {
        
    }
};`,
    harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){
  int m,n; cin>>m>>n;
  vector<int> a(m+n), b(n);
  for(int i=0;i<m;i++) cin>>a[i];
  for(int i=0;i<n;i++) cin>>b[i];
  Solution().merge(a,m,b,n);
  for(int i=0;i<m+n;i++){ if(i) cout<<' '; cout<<a[i]; }
  cout<<"\\n";
}`,
    tests: [
      { input: "3 3\n1 2 3\n2 5 6\n", expected: "1 2 2 3 5 6" },
      { input: "1 0\n1\n\n", expected: "1" },
    ],
    hints: [
      "Three pointers from the end.",
      "Write the larger of nums1[i], nums2[j] at k--.",
      "Don't start from front — you'll overwrite.",
    ],
  },
  "sort-colors": {
    id: "sort-colors",
    title: "Sort Colors",
    difficulty: "Medium",
    topic: "arrays",
    leetcodeSlug: "sort-colors",
    leetcodeId: 75,
    lesson: `# Sort Colors (Dutch National Flag)

Array of 0,1,2 only. One-pass three pointers: lo, mid, hi.`,
    starterCode: `class Solution {
public:
    void sortColors(vector<int>& nums) {
        
    }
};`,
    harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){
  int n; cin>>n; vector<int> a(n);
  for(int i=0;i<n;i++) cin>>a[i];
  Solution().sortColors(a);
  for(int i=0;i<n;i++){ if(i) cout<<' '; cout<<a[i]; }
  cout<<"\\n";
}`,
    tests: [
      { input: "6\n2 0 2 1 1 0\n", expected: "0 0 1 1 2 2" },
      { input: "3\n2 0 1\n", expected: "0 1 2" },
    ],
    hints: [
      "lo/mid/hi pointers.",
      "0 → swap with lo++, mid++. 2 → swap with hi--. 1 → mid++.",
      "Don't mid++ after swapping a 2 (recheck).",
    ],
  },
  "product-except-self": {
    id: "product-except-self",
    title: "Product of Array Except Self",
    difficulty: "Medium",
    topic: "arrays",
    leetcodeSlug: "product-except-self",
    leetcodeId: 238,
    lesson: `# Product Except Self

No division. Prefix products from left, suffix from right.`,
    starterCode: `class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        return {};
    }
};`,
    harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){
  int n; cin>>n; vector<int> a(n);
  for(int i=0;i<n;i++) cin>>a[i];
  auto ans=Solution().productExceptSelf(a);
  for(int i=0;i<(int)ans.size();i++){ if(i) cout<<' '; cout<<ans[i]; }
  cout<<"\\n";
}`,
    tests: [
      { input: "4\n1 2 3 4\n", expected: "24 12 8 6" },
      { input: "2\n-1 1\n", expected: "1 -1" },
    ],
    hints: [
      "ans[i] = leftProduct * rightProduct.",
      "Build left in ans, then multiply running right.",
      "O(n) time, O(1) extra besides output.",
    ],
  },
  "max-consecutive-ones": {
    id: "max-consecutive-ones",
    title: "Max Consecutive Ones",
    difficulty: "Easy",
    topic: "arrays",
    leetcodeSlug: "max-consecutive-ones",
    leetcodeId: 485,
    lesson: `# Max Consecutive Ones

Count streaks of 1s; keep a max.`,
    starterCode: `class Solution {
public:
    int findMaxConsecutiveOnes(vector<int>& nums) {
        return 0;
    }
};`,
    harness: VEC_INT_OUT("int ans=s.findMaxConsecutiveOnes(a);", 'cout<<ans<<"\\n";'),
    tests: [
      { input: "6\n1 1 0 1 1 1\n", expected: "3" },
      { input: "4\n1 0 1 1\n", expected: "2" },
    ],
    hints: ["cur++ on 1, reset on 0.", "Track max(cur).", "Single pass O(n)."],
  },
  "first-unique-char": {
    id: "first-unique-char",
    title: "First Unique Character",
    difficulty: "Easy",
    topic: "hashing",
    leetcodeSlug: "first-unique-character-in-a-string",
    leetcodeId: 387,
    lesson: `# First Unique Character in a String

Count frequencies, then second pass for first index with count 1.`,
    starterCode: `class Solution {
public:
    int firstUniqChar(string s) {
        return -1;
    }
};`,
    harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){ string s; cin>>s; cout<<Solution().firstUniqChar(s)<<"\\n"; }`,
    tests: [
      { input: "leetcode\n", expected: "0" },
      { input: "loveleetcode\n", expected: "2" },
      { input: "aabb\n", expected: "-1" },
    ],
    hints: ["freq[26] for lowercase.", "Second pass find first freq==1.", "Return -1 if none."],
  },
  "isomorphic-strings": {
    id: "isomorphic-strings",
    title: "Isomorphic Strings",
    difficulty: "Easy",
    topic: "hashing",
    leetcodeSlug: "isomorphic-strings",
    leetcodeId: 205,
    lesson: `# Isomorphic Strings

Bijection between characters of s and t. Two maps (or map + set).`,
    starterCode: `class Solution {
public:
    bool isIsomorphic(string s, string t) {
        return false;
    }
};`,
    harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){ string a,b; cin>>a>>b; cout<<(Solution().isIsomorphic(a,b)?"true":"false")<<"\\n"; }`,
    tests: [
      { input: "egg add\n", expected: "true" },
      { input: "foo bar\n", expected: "false" },
      { input: "paper title\n", expected: "true" },
    ],
    hints: [
      "Map s→t and ensure t not claimed by two s chars.",
      "Lengths must match.",
      "Track last-seen indices as an alternate trick.",
    ],
  },
  "happy-number": {
    id: "happy-number",
    title: "Happy Number",
    difficulty: "Easy",
    topic: "hashing",
    leetcodeSlug: "happy-number",
    leetcodeId: 202,
    lesson: `# Happy Number

Replace n by sum of squares of digits. Happy if you reach 1. Detect cycles with a set (or Floyd).`,
    starterCode: `class Solution {
public:
    bool isHappy(int n) {
        return false;
    }
};`,
    harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){ int n; cin>>n; cout<<(Solution().isHappy(n)?"true":"false")<<"\\n"; }`,
    tests: [
      { input: "19\n", expected: "true" },
      { input: "2\n", expected: "false" },
    ],
    hints: [
      "Helper: next = sum of digit squares.",
      "unordered_set seen; if repeat → false.",
      "19 → 82 → 68 → 100 → 1.",
    ],
  },
  "longest-consecutive": {
    id: "longest-consecutive",
    title: "Longest Consecutive Sequence",
    difficulty: "Medium",
    topic: "hashing",
    leetcodeSlug: "longest-consecutive-sequence",
    leetcodeId: 128,
    lesson: `# Longest Consecutive Sequence

O(n): put all in a set; only start a streak when \`x-1\` not in set.`,
    starterCode: `class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        return 0;
    }
};`,
    harness: VEC_INT_OUT("int ans=s.longestConsecutive(a);", 'cout<<ans<<"\\n";'),
    tests: [
      { input: "6\n100 4 200 1 3 2\n", expected: "4" },
      { input: "10\n0 3 7 2 5 8 4 6 0 1\n", expected: "9" },
    ],
    hints: [
      "unordered_set of all nums.",
      "Only start when num-1 missing.",
      "Count upward while num+len in set.",
    ],
  },
  "two-sum-ii": {
    id: "two-sum-ii",
    title: "Two Sum II (Sorted)",
    difficulty: "Medium",
    topic: "two-pointers",
    leetcodeSlug: "two-sum-ii-input-array-is-sorted",
    leetcodeId: 167,
    lesson: `# Two Sum II

1-indexed sorted array. Two pointers from ends — no hash needed.`,
    starterCode: `class Solution {
public:
    vector<int> twoSum(vector<int>& numbers, int target) {
        return {};
    }
};`,
    harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){
  int n,t; cin>>n>>t; vector<int> a(n);
  for(int i=0;i<n;i++) cin>>a[i];
  auto ans=Solution().twoSum(a,t);
  cout<<ans[0]<<" "<<ans[1]<<"\\n";
}`,
    tests: [
      { input: "4 9\n2 7 11 15\n", expected: "1 2" },
      { input: "3 6\n2 3 4\n", expected: "1 3" },
    ],
    hints: [
      "L=0, R=n-1.",
      "Sum too small → L++. Too big → R--.",
      "Return 1-based indices.",
    ],
  },
  "squares-sorted": {
    id: "squares-sorted",
    title: "Squares of a Sorted Array",
    difficulty: "Easy",
    topic: "two-pointers",
    leetcodeSlug: "squares-of-a-sorted-array",
    leetcodeId: 977,
    lesson: `# Squares of Sorted Array

Negatives square large too. Two pointers from ends; fill result from back.`,
    starterCode: `class Solution {
public:
    vector<int> sortedSquares(vector<int>& nums) {
        return {};
    }
};`,
    harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){
  int n; cin>>n; vector<int> a(n);
  for(int i=0;i<n;i++) cin>>a[i];
  auto ans=Solution().sortedSquares(a);
  for(int i=0;i<(int)ans.size();i++){ if(i) cout<<' '; cout<<ans[i]; }
  cout<<"\\n";
}`,
    tests: [
      { input: "5\n-4 -1 0 3 10\n", expected: "0 1 9 16 100" },
      { input: "5\n-7 -3 2 3 11\n", expected: "4 9 9 49 121" },
    ],
    hints: [
      "Compare abs(L) vs abs(R).",
      "Place larger square at end of result.",
      "O(n) better than sort of squares O(n log n).",
    ],
  },
  "trapping-rain": {
    id: "trapping-rain",
    title: "Trapping Rain Water",
    difficulty: "Hard",
    topic: "two-pointers",
    leetcodeSlug: "trapping-rain-water",
    leetcodeId: 42,
    lesson: `# Trapping Rain Water

Water at i = max(0, min(leftMax,rightMax)-height[i]). Two pointers / pref-max variant.`,
    starterCode: `class Solution {
public:
    int trap(vector<int>& height) {
        return 0;
    }
};`,
    harness: VEC_INT_OUT("int ans=s.trap(a);", 'cout<<ans<<"\\n";'),
    tests: [
      { input: "12\n0 1 0 2 1 0 1 3 2 1 2 1\n", expected: "6" },
      { input: "6\n4 2 0 3 2 5\n", expected: "9" },
    ],
    hints: [
      "leftMax / rightMax while L<R.",
      "Move the side with smaller max.",
      "Add maxSide - height[i] when moving.",
    ],
  },
  "max-consec-ones-iii": {
    id: "max-consec-ones-iii",
    title: "Max Consecutive Ones III",
    difficulty: "Medium",
    topic: "sliding-window",
    leetcodeSlug: "max-consecutive-ones-iii",
    leetcodeId: 1004,
    lesson: `# Max Consecutive Ones III

Longest window with at most k zeros (you may flip them).`,
    starterCode: `class Solution {
public:
    int longestOnes(vector<int>& nums, int k) {
        return 0;
    }
};`,
    harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){
  int n,k; cin>>n>>k; vector<int> a(n);
  for(int i=0;i<n;i++) cin>>a[i];
  cout<<Solution().longestOnes(a,k)<<"\\n";
}`,
    tests: [
      { input: "11 2\n1 1 1 0 0 0 1 1 1 1 0\n", expected: "6" },
      { input: "7 3\n0 0 1 1 0 0 1\n", expected: "7", hidden: true },
    ],
    hints: [
      "Window with zeroCount <= k.",
      "Expand R; while zeros>k advance L.",
      "Answer max window length.",
    ],
  },
  "find-anagrams": {
    id: "find-anagrams",
    title: "Find All Anagrams in a String",
    difficulty: "Medium",
    topic: "sliding-window",
    leetcodeSlug: "find-all-anagrams-in-a-string",
    leetcodeId: 438,
    lesson: `# Find All Anagrams

Fixed window = p.length(). Compare freq maps (or match counter).`,
    starterCode: `class Solution {
public:
    vector<int> findAnagrams(string s, string p) {
        return {};
    }
};`,
    harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){
  string s,p; cin>>s>>p;
  auto ans=Solution().findAnagrams(s,p);
  if(ans.empty()){ cout<<"\\n"; return 0; }
  for(int i=0;i<(int)ans.size();i++){ if(i) cout<<' '; cout<<ans[i]; }
  cout<<"\\n";
}`,
    tests: [
      { input: "cbaebabacd abc\n", expected: "0 6" },
      { input: "abab ab\n", expected: "0 1 2" },
    ],
    hints: [
      "Same idea as permutation in string.",
      "Slide window of len(p).",
      "Record start index when freqs match.",
    ],
  },
  "binary-search": {
    id: "binary-search",
    title: "Binary Search",
    difficulty: "Easy",
    topic: "binary-search",
    leetcodeSlug: "binary-search",
    leetcodeId: 704,
    lesson: `# Binary Search

Sorted array. Halve search space each step. Mid = L + (R-L)/2.`,
    starterCode: `class Solution {
public:
    int search(vector<int>& nums, int target) {
        return -1;
    }
};`,
    harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){
  int n,t; cin>>n>>t; vector<int> a(n);
  for(int i=0;i<n;i++) cin>>a[i];
  cout<<Solution().search(a,t)<<"\\n";
}`,
    tests: [
      { input: "6 9\n-1 0 3 5 9 12\n", expected: "4" },
      { input: "6 2\n-1 0 3 5 9 12\n", expected: "-1" },
    ],
    hints: [
      "while(L<=R)",
      "nums[mid]==target return mid",
      "Watch infinite loops — update L/R correctly.",
    ],
  },
  "search-insert": {
    id: "search-insert",
    title: "Search Insert Position",
    difficulty: "Easy",
    topic: "binary-search",
    leetcodeSlug: "search-insert-position",
    leetcodeId: 35,
    lesson: `# Search Insert Position

Lower bound: first index where nums[i] >= target.`,
    starterCode: `class Solution {
public:
    int searchInsert(vector<int>& nums, int target) {
        return 0;
    }
};`,
    harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){
  int n,t; cin>>n>>t; vector<int> a(n);
  for(int i=0;i<n;i++) cin>>a[i];
  cout<<Solution().searchInsert(a,t)<<"\\n";
}`,
    tests: [
      { input: "4 5\n1 3 5 6\n", expected: "2" },
      { input: "4 2\n1 3 5 6\n", expected: "1" },
      { input: "4 7\n1 3 5 6\n", expected: "4" },
    ],
    hints: ["Classic lower_bound binary search.", "Return L after loop.", "Same as first index not less than target."],
  },
  "first-last-position": {
    id: "first-last-position",
    title: "Find First and Last Position",
    difficulty: "Medium",
    topic: "binary-search",
    leetcodeSlug: "find-first-and-last-position-of-element-in-sorted-array",
    leetcodeId: 34,
    lesson: `# First & Last Position

Two binary searches: leftmost and rightmost index of target.`,
    starterCode: `class Solution {
public:
    vector<int> searchRange(vector<int>& nums, int target) {
        return {-1,-1};
    }
};`,
    harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){
  int n,t; cin>>n>>t; vector<int> a(n);
  for(int i=0;i<n;i++) cin>>a[i];
  auto ans=Solution().searchRange(a,t);
  cout<<ans[0]<<" "<<ans[1]<<"\\n";
}`,
    tests: [
      { input: "6 8\n5 7 7 8 8 10\n", expected: "3 4" },
      { input: "6 6\n5 7 7 8 8 10\n", expected: "-1 -1" },
    ],
    hints: [
      "Lower bound for first.",
      "Upper bound - 1 for last.",
      "If missing return [-1,-1].",
    ],
  },
  "valid-parentheses": {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    topic: "stack",
    leetcodeSlug: "valid-parentheses",
    leetcodeId: 20,
    lesson: `# Valid Parentheses

Stack of opens. On close, top must match. Empty at end.`,
    starterCode: `class Solution {
public:
    bool isValid(string s) {
        return false;
    }
};`,
    harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){ string s; cin>>s; cout<<(Solution().isValid(s)?"true":"false")<<"\\n"; }`,
    tests: [
      { input: "()\n", expected: "true" },
      { input: "()[]{}\n", expected: "true" },
      { input: "(]\n", expected: "false" },
      { input: "([)]\n", expected: "false", hidden: true },
    ],
    hints: [
      "stack<char>",
      "Map closing → expected opening",
      "Empty stack on close = false",
    ],
  },
  "min-stack": {
    id: "min-stack",
    title: "Min Stack (Design)",
    difficulty: "Medium",
    topic: "stack",
    leetcodeSlug: "min-stack",
    leetcodeId: 155,
    lesson: `# Min Stack

Support push/pop/top/getMin in O(1). Keep a parallel min stack.`,
    starterCode: `class MinStack {
public:
    MinStack() {}
    void push(int val) {}
    void pop() {}
    int top() { return 0; }
    int getMin() { return 0; }
};`,
    harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){
  // ops: push x | pop | top | getMin  — print results of top/getMin
  string op; MinStack st;
  while(cin>>op){
    if(op=="push"){ int x; cin>>x; st.push(x); }
    else if(op=="pop") st.pop();
    else if(op=="top") cout<<st.top()<<"\\n";
    else if(op=="getMin") cout<<st.getMin()<<"\\n";
  }
}`,
    tests: [
      {
        input: "push -2\npush 0\npush -3\ngetMin\npop\ntop\ngetMin\n",
        expected: "-3\n0\n-2",
      },
    ],
    hints: [
      "Two stacks: values + mins.",
      "On push, mins.push(min(val, mins.top())).",
      "Pop both together.",
    ],
  },
  "daily-temperatures": {
    id: "daily-temperatures",
    title: "Daily Temperatures",
    difficulty: "Medium",
    topic: "stack",
    leetcodeSlug: "daily-temperatures",
    leetcodeId: 739,
    lesson: `# Daily Temperatures

Next warmer day distance. Monotonic decreasing stack of indices.`,
    starterCode: `class Solution {
public:
    vector<int> dailyTemperatures(vector<int>& temperatures) {
        return {};
    }
};`,
    harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){
  int n; cin>>n; vector<int> a(n);
  for(int i=0;i<n;i++) cin>>a[i];
  auto ans=Solution().dailyTemperatures(a);
  for(int i=0;i<(int)ans.size();i++){ if(i) cout<<' '; cout<<ans[i]; }
  cout<<"\\n";
}`,
    tests: [
      { input: "8\n73 74 75 71 69 72 76 73\n", expected: "1 1 4 2 1 1 0 0" },
    ],
    hints: [
      "Stack stores indices with decreasing temps.",
      "While top colder than current, pop and set distance.",
      "Unresolved stay 0.",
    ],
  },
  "reverse-linked-list": {
    id: "reverse-linked-list",
    title: "Reverse Linked List",
    difficulty: "Easy",
    topic: "linked-list",
    leetcodeSlug: "reverse-linked-list",
    leetcodeId: 206,
    lesson: `# Reverse Linked List

Three pointers: prev, cur, next. Classic interview.`,
    starterCode: `/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode(int x) : val(x), next(NULL) {}
 * };
 */
class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        return head;
    }
};`,
    harness: `#include <bits/stdc++.h>
using namespace std;
struct ListNode{ int val; ListNode* next; ListNode(int x):val(x),next(NULL){} };
{{CODE}}
int main(){
  int n; cin>>n; ListNode* head=NULL,*tail=NULL;
  for(int i=0;i<n;i++){ int x; cin>>x; auto* node=new ListNode(x);
    if(!head) head=tail=node; else { tail->next=node; tail=node; } }
  head=Solution().reverseList(head);
  for(auto* p=head;p;p=p->next){ if(p!=head) cout<<' '; cout<<p->val; }
  cout<<"\\n";
}`,
    tests: [
      { input: "5\n1 2 3 4 5\n", expected: "5 4 3 2 1" },
      { input: "2\n1 2\n", expected: "2 1" },
    ],
    hints: [
      "prev=null, cur=head",
      "next=cur->next; cur->next=prev; prev=cur; cur=next",
      "Return prev",
    ],
  },
  "merge-two-lists": {
    id: "merge-two-lists",
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    topic: "linked-list",
    leetcodeSlug: "merge-two-sorted-lists",
    leetcodeId: 21,
    lesson: `# Merge Two Sorted Lists

Dummy head + stitch smaller node each time.`,
    starterCode: `class Solution {
public:
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
        return list1;
    }
};`,
    harness: `#include <bits/stdc++.h>
using namespace std;
struct ListNode{ int val; ListNode* next; ListNode(int x):val(x),next(NULL){} };
{{CODE}}
ListNode* readList(){ int n; cin>>n; ListNode* h=NULL,*t=NULL;
  for(int i=0;i<n;i++){ int x; cin>>x; auto* node=new ListNode(x);
    if(!h) h=t=node; else { t->next=node; t=node; } } return h; }
int main(){
  auto* a=readList(); auto* b=readList();
  auto* h=Solution().mergeTwoLists(a,b);
  for(auto* p=h;p;p=p->next){ if(p!=h) cout<<' '; cout<<p->val; }
  cout<<"\\n";
}`,
    tests: [
      { input: "3\n1 2 4\n3\n1 3 4\n", expected: "1 1 2 3 4 4" },
      { input: "0\n\n0\n\n", expected: "" },
    ],
    hints: [
      "Dummy node simplifies edge cases.",
      "Compare list1->val and list2->val.",
      "Attach leftover list at end.",
    ],
  },
  "linked-list-cycle": {
    id: "linked-list-cycle",
    title: "Linked List Cycle",
    difficulty: "Easy",
    topic: "linked-list",
    leetcodeSlug: "linked-list-cycle",
    leetcodeId: 141,
    lesson: `# Linked List Cycle

Floyd: slow +1, fast +2. Meet ⇒ cycle.`,
    starterCode: `class Solution {
public:
    bool hasCycle(ListNode *head) {
        return false;
    }
};`,
    harness: `#include <bits/stdc++.h>
using namespace std;
struct ListNode{ int val; ListNode* next; ListNode(int x):val(x),next(NULL){} };
{{CODE}}
int main(){
  int n,pos; cin>>n>>pos; vector<ListNode*> nodes;
  for(int i=0;i<n;i++){ int x; cin>>x; nodes.push_back(new ListNode(x)); }
  for(int i=0;i+1<n;i++) nodes[i]->next=nodes[i+1];
  if(n && pos>=0) nodes[n-1]->next=nodes[pos];
  ListNode* head=n?nodes[0]:NULL;
  cout<<(Solution().hasCycle(head)?"true":"false")<<"\\n";
}`,
    tests: [
      { input: "4 1\n3 2 0 -4\n", expected: "true" },
      { input: "2 -1\n1 2\n", expected: "false" },
    ],
    hints: [
      "slow/fast pointers",
      "If fast hits null → no cycle",
      "If slow==fast → cycle",
    ],
  },
  "invert-binary-tree": {
    id: "invert-binary-tree",
    title: "Invert Binary Tree",
    difficulty: "Easy",
    topic: "binary-tree",
    leetcodeSlug: "invert-binary-tree",
    leetcodeId: 226,
    lesson: `# Invert Binary Tree

Swap left/right recursively (or BFS).`,
    starterCode: `class Solution {
public:
    TreeNode* invertTree(TreeNode* root) {
        return root;
    }
};`,
    harness: `#include <bits/stdc++.h>
using namespace std;
struct TreeNode{ int val; TreeNode* left; TreeNode* right;
  TreeNode(int x):val(x),left(NULL),right(NULL){} };
{{CODE}}
TreeNode* build(vector<string>& a,int i){
  if(i>=(int)a.size()||a[i]=="null") return NULL;
  auto* n=new TreeNode(stoi(a[i]));
  n->left=build(a,2*i+1); n->right=build(a,2*i+2); return n;
}
void level(TreeNode* r){
  if(!r){ cout<<"\\n"; return; }
  queue<TreeNode*> q; q.push(r);
  vector<string> out;
  while(!q.empty()){
    auto* n=q.front(); q.pop();
    if(!n){ out.push_back("null"); continue; }
    out.push_back(to_string(n->val));
    q.push(n->left); q.push(n->right);
  }
  while(!out.empty() && out.back()=="null") out.pop_back();
  for(int i=0;i<(int)out.size();i++){ if(i) cout<<' '; cout<<out[i]; }
  cout<<"\\n";
}
int main(){
  vector<string> a; string x; while(cin>>x) a.push_back(x);
  auto* r=build(a,0);
  level(Solution().invertTree(r));
}`,
    tests: [
      { input: "4 2 7 1 3 6 9\n", expected: "4 7 2 9 6 3 1" },
    ],
    hints: [
      "If !root return null",
      "swap left/right",
      "Recurse both children",
    ],
  },
  "max-depth-tree": {
    id: "max-depth-tree",
    title: "Maximum Depth of Binary Tree",
    difficulty: "Easy",
    topic: "binary-tree",
    leetcodeSlug: "maximum-depth-of-binary-tree",
    leetcodeId: 104,
    lesson: `# Max Depth

1 + max(depth(left), depth(right)).`,
    starterCode: `class Solution {
public:
    int maxDepth(TreeNode* root) {
        return 0;
    }
};`,
    harness: `#include <bits/stdc++.h>
using namespace std;
struct TreeNode{ int val; TreeNode* left; TreeNode* right;
  TreeNode(int x):val(x),left(NULL),right(NULL){} };
{{CODE}}
TreeNode* build(vector<string>& a,int i){
  if(i>=(int)a.size()||a[i]=="null") return NULL;
  auto* n=new TreeNode(stoi(a[i]));
  n->left=build(a,2*i+1); n->right=build(a,2*i+2); return n;
}
int main(){
  vector<string> a; string x; while(cin>>x) a.push_back(x);
  cout<<Solution().maxDepth(build(a,0))<<"\\n";
}`,
    tests: [
      { input: "3 9 20 null null 15 7\n", expected: "3" },
      { input: "1 null 2\n", expected: "2" },
    ],
    hints: ["Base: null → 0", "Return 1+max(L,R)", "BFS level count also works"],
  },
  "same-tree": {
    id: "same-tree",
    title: "Same Tree",
    difficulty: "Easy",
    topic: "binary-tree",
    leetcodeSlug: "same-tree",
    leetcodeId: 100,
    lesson: `# Same Tree

Both null → true. One null → false. Values equal && recurse sides.`,
    starterCode: `class Solution {
public:
    bool isSameTree(TreeNode* p, TreeNode* q) {
        return false;
    }
};`,
    harness: `#include <bits/stdc++.h>
using namespace std;
struct TreeNode{ int val; TreeNode* left; TreeNode* right;
  TreeNode(int x):val(x),left(NULL),right(NULL){} };
{{CODE}}
TreeNode* build(vector<string>& a,int i){
  if(i>=(int)a.size()||a[i]=="null") return NULL;
  auto* n=new TreeNode(stoi(a[i]));
  n->left=build(a,2*i+1); n->right=build(a,2*i+2); return n;
}
int main(){
  string line1, line2;
  getline(cin,line1); getline(cin,line2);
  auto split=[](string s){ stringstream ss(s); vector<string> v; string x; while(ss>>x) v.push_back(x); return v; };
  auto A=split(line1), B=split(line2);
  cout<<(Solution().isSameTree(build(A,0), build(B,0))?"true":"false")<<"\\n";
}`,
    tests: [
      { input: "1 2 3\n1 2 3\n", expected: "true" },
      { input: "1 2\n1 null 2\n", expected: "false" },
    ],
    hints: ["Null checks first", "Compare vals", "&& left && right"],
  },
  "climb-stairs": {
    id: "climb-stairs",
    title: "Climbing Stairs",
    difficulty: "Easy",
    topic: "dp",
    leetcodeSlug: "climbing-stairs",
    leetcodeId: 70,
    lesson: `# Climbing Stairs

Ways(n) = ways(n-1)+ways(n-2). Fibonacci in disguise.`,
    starterCode: `class Solution {
public:
    int climbStairs(int n) {
        return 0;
    }
};`,
    harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){ int n; cin>>n; cout<<Solution().climbStairs(n)<<"\\n"; }`,
    tests: [
      { input: "2\n", expected: "2" },
      { input: "3\n", expected: "3" },
      { input: "5\n", expected: "8", hidden: true },
    ],
    hints: ["a=1,b=1 rolling vars", "Loop to n", "Don't recurse without memo for large n"],
  },
  "house-robber": {
    id: "house-robber",
    title: "House Robber",
    difficulty: "Medium",
    topic: "dp",
    leetcodeSlug: "house-robber",
    leetcodeId: 198,
    lesson: `# House Robber

dp[i] = max(dp[i-1], dp[i-2]+nums[i]). Can't rob adjacent.`,
    starterCode: `class Solution {
public:
    int rob(vector<int>& nums) {
        return 0;
    }
};`,
    harness: VEC_INT_OUT("int ans=s.rob(a);", 'cout<<ans<<"\\n";'),
    tests: [
      { input: "4\n1 2 3 1\n", expected: "4" },
      { input: "5\n2 7 9 3 1\n", expected: "12" },
    ],
    hints: [
      "prev2, prev1 rolling.",
      "cur = max(prev1, prev2+nums[i])",
      "O(n)/O(1)",
    ],
  },
  "coin-change": {
    id: "coin-change",
    title: "Coin Change",
    difficulty: "Medium",
    topic: "dp",
    leetcodeSlug: "coin-change",
    leetcodeId: 322,
    lesson: `# Coin Change

Fewest coins for amount. dp[x] = min over coin of dp[x-coin]+1.`,
    starterCode: `class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        return -1;
    }
};`,
    harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){
  int n,amount; cin>>n>>amount; vector<int> c(n);
  for(int i=0;i<n;i++) cin>>c[i];
  cout<<Solution().coinChange(c,amount)<<"\\n";
}`,
    tests: [
      { input: "3 11\n1 2 5\n", expected: "3" },
      { input: "1 3\n2\n", expected: "-1" },
    ],
    hints: [
      "dp[0]=0, else INF",
      "For each coin update dp",
      "Return dp[amount] or -1",
    ],
  },
};

export const moreTopics: Topic[] = [
  {
    id: "binary-search",
    title: "Binary Search",
    blurb: "Sorted world → log n. Lower/upper bound muscle memory.",
    order: 5,
    problemIds: ["binary-search", "search-insert", "first-last-position"],
  },
  {
    id: "stack",
    title: "Stack & Monotonic Stack",
    blurb: "LIFO + next greater patterns. Parentheses to daily temperatures.",
    order: 6,
    problemIds: ["valid-parentheses", "min-stack", "daily-temperatures"],
  },
  {
    id: "linked-list",
    title: "Linked List",
    blurb: "Pointer surgery — reverse, merge, cycle detection.",
    order: 7,
    problemIds: ["reverse-linked-list", "merge-two-lists", "linked-list-cycle"],
  },
  {
    id: "binary-tree",
    title: "Binary Trees",
    blurb: "Recursion on left/right. Depth, invert, sameness.",
    order: 8,
    problemIds: ["invert-binary-tree", "max-depth-tree", "same-tree"],
  },
  {
    id: "dp",
    title: "Intro Dynamic Programming",
    blurb: "After arrays: stairs, robber, coins — think subproblems.",
    order: 9,
    problemIds: ["climb-stairs", "house-robber", "coin-change"],
  },
];

export const topicProblemExtras: Record<string, string[]> = {
  arrays: [
    "missing-number",
    "single-number",
    "majority-element",
    "merge-sorted-array",
    "sort-colors",
    "product-except-self",
    "max-consecutive-ones",
  ],
  hashing: ["first-unique-char", "isomorphic-strings", "happy-number", "longest-consecutive"],
  "two-pointers": ["two-sum-ii", "squares-sorted", "trapping-rain"],
  "sliding-window": ["max-consec-ones-iii", "find-anagrams"],
};
