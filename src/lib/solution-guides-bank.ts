export type ExtraNote = { cx: string; code: string; en: string; hi: string };

function n(cx: string, code: string, en: string, hi: string): ExtraNote {
  return { cx, code: code.trim(), en: en.trim(), hi: hi.trim() };
}

export const extraGuides: Record<string, ExtraNote> = {
  "intersection-two-arrays-ii": n(
    "O(n + m) time, O(min(n, m)) space",
    `class Solution {
public:
    vector<int> intersect(vector<int>& nums1, vector<int>& nums2) {
        unordered_map<int, int> freq;
        for (int x : nums1) freq[x]++;
        vector<int> ans;
        for (int x : nums2) {
            if (freq[x] > 0) {
                ans.push_back(x);
                freq[x]--;
            }
        }
        return ans;
    }
};`,
    `## What is asked
Return the intersection of two arrays. If a value appears several times, the result should contain the minimum of the two frequencies.

## Why brute force is not the answer
For each value in the first array, scanning the second is O(n·m). Sorting both and using two pointers is O(n log n), which is fine, but a frequency map is linear.

## Optimal idea
Count every value in the smaller logical pass (here, nums1). Then walk nums2. Each time the count is still positive, emit the value and decrement. Decrementing is what stops you from using a copy more times than it exists.

## Dry run
nums1 = [1, 2, 2, 1], nums2 = [2, 2]. Counts are 1→2 and 2→2. Both 2s in nums2 are emitted. Answer [2, 2].

## Walk the code
The map stores remaining copies. The second loop only pushes when a copy is left.

## Complexity and mistakes
O(n + m) time. Forgetting to decrement duplicates a value too many times.`,
    `## Sawal kya hai
Dono arrays ka intersection. Jo value kitni baar aaye, utni baar result mein, dono frequencies ka minimum.

## Brute force kyun nahi
Har element ke liye doosri array scan karna O(n·m) hai.

## Optimal idea
nums1 ki frequency gino. nums2 par chalte hue count positive ho to value likho aur count ek kam karo.

## Dry run
[1, 2, 2, 1] aur [2, 2] ka jawab [2, 2] hai.

## Code kaise chalta hai
Map bachi hui copies rakhta hai. Doosra loop sirf tab push karta hai jab copy bachi ho.

## Complexity aur galtiyan
O(n + m). Decrement bhoolne se value zyada baar aa jaati hai.`,
  ),
  "group-anagrams": n(
    "O(n · k log k) time, where k is the longest string",
    `class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        unordered_map<string, vector<string>> groups;
        for (const string& s : strs) {
            string key = s;
            sort(key.begin(), key.end());
            groups[key].push_back(s);
        }
        vector<vector<string>> ans;
        for (auto& [_, g] : groups) ans.push_back(std::move(g));
        return ans;
    }
};`,
    `## What is asked
Group strings that are anagrams of each other. Order inside a group and order of groups do not matter.

## Why brute force is not the answer
Comparing every pair by sorting each time is much heavier than sorting once per string and using that as a key.

## Optimal idea
Two strings are anagrams exactly when their sorted characters match. Use the sorted string as a hash key and append the original string to that bucket.

## Dry run
"eat", "tea", and "ate" all sort to "aet", so they share a bucket. "tan" and "nat" sort to "ant". "bat" stays alone.

## Walk the code
Copy s into key, sort key, push the original s. The original order of characters is preserved in the bucket because we never sort s itself.

## Complexity and mistakes
O(n · k log k) for sorting each string of length k. A count of 26 letters is the same idea and avoids the log factor. Do not use the unsorted string as the key.`,
    `## Sawal kya hai
Anagram strings ko ek group mein daalo. Group ke andar order maayne nahi rakhta.

## Brute force kyun nahi
Har pair ko baar baar sort karke compare karna mehnga hai.

## Optimal idea
Anagram ka sorted form same hota hai. Sorted string ko key banao aur original string us bucket mein daalo.

## Dry run
eat, tea, ate teeno "aet" ban jaate hain. tan aur nat "ant". bat alag.

## Code kaise chalta hai
key = s, key sort, original s push. s khud sort nahi hota, isliye original word bachta hai.

## Complexity aur galtiyan
O(n · k log k). Unsorted string ko key mat banao.`,
  ),
  "top-k-frequent": n(
    "O(n) time, O(n) space",
    `class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {
        unordered_map<int, int> freq;
        for (int x : nums) freq[x]++;
        vector<vector<int>> buckets(nums.size() + 1);
        for (auto& [val, f] : freq) buckets[f].push_back(val);
        vector<int> ans;
        for (int f = (int)buckets.size() - 1; f >= 1 && (int)ans.size() < k; f--) {
            for (int val : buckets[f]) {
                ans.push_back(val);
                if ((int)ans.size() == k) break;
            }
        }
        return ans;
    }
};`,
    `## What is asked
Return the k values that appear most often.

## Why brute force is not the answer
Sorting unique values by frequency is O(n log n). A heap of size k is O(n log k). Bucket sort by frequency is linear because a frequency cannot exceed n.

## Optimal idea
Count frequencies. Put each value into a bucket indexed by its frequency. Walk the buckets from n down to 1 and collect values until you have k.

## Dry run
[1, 1, 1, 2, 2, 3], k = 2. Frequencies: 1→3, 2→2, 3→1. The highest buckets give 1 then 2.

## Walk the code
\`buckets[f]\` holds every value that occurs f times. The outer loop starts at the largest possible frequency.

## Complexity and mistakes
O(n) time and space. Do not sort the whole frequency list if k is the only thing you need.`,
    `## Sawal kya hai
Wo k values jo sabse zyada baar aati hain.

## Brute force kyun nahi
Frequency sort O(n log n) hai. Frequency bucket O(n) hai kyunki frequency n se badi nahi ho sakti.

## Optimal idea
Count lo. Value ko uski frequency wale bucket mein daalo. Bade bucket se neeche chalte hue k values uthao.

## Dry run
[1, 1, 1, 2, 2, 3], k = 2. 1 teen baar, 2 do baar. Jawab 1 aur 2.

## Code kaise chalta hai
\`buckets[f]\` un values ko rakhta hai jo f baar aati hain. Loop sabse badi frequency se shuru hota hai.

## Complexity aur galtiyan
O(n) time aur space.`,
  ),
  "valid-palindrome": n(
    "O(n) time, O(1) space",
    `class Solution {
public:
    bool isPalindrome(string s) {
        int L = 0, R = (int)s.size() - 1;
        while (L < R) {
            while (L < R && !isalnum(static_cast<unsigned char>(s[L]))) L++;
            while (L < R && !isalnum(static_cast<unsigned char>(s[R]))) R--;
            if (tolower(static_cast<unsigned char>(s[L])) != tolower(static_cast<unsigned char>(s[R])))
                return false;
            L++;
            R--;
        }
        return true;
    }
};`,
    `## What is asked
Ignore spaces, punctuation, and letter case. The remaining characters should read the same forward and backward.

## Why brute force is not the answer
Building a cleaned string uses extra memory. Two pointers skip junk in place.

## Optimal idea
L starts at the left, R at the right. Skip anything that is not a letter or digit. Compare the lowercase characters. A mismatch returns false. If the pointers meet, it is a palindrome.

## Dry run
"A man, a plan, a canal: Panama". After skipping punctuation and case, both sides walk through amanaplanacanalpanama.

## Walk the code
\`isalnum\` and \`tolower\` need an unsigned char cast so a negative byte is not undefined. The inner whiles stop before the pointers cross.

## Complexity and mistakes
O(n) time, O(1) extra memory. Comparing without lowercasing fails on mixed case.`,
    `## Sawal kya hai
Space, punctuation, aur case ignore karke check karo ki bachi hui characters aage aur peeche same hain.

## Brute force kyun nahi
Nayi cleaned string extra memory hai. Do pointers jagah par hi skip karte hain.

## Optimal idea
L left se, R right se. Letter ya digit na ho to skip. Lowercase compare. Mismatch par false. Pointers mil jaayein to true.

## Dry run
"A man, a plan, a canal: Panama" andar se amanaplanacanalpanama hai.

## Code kaise chalta hai
\`isalnum\` aur \`tolower\` ko unsigned char chahiye. Andar wale while pointers ko cross nahi karte.

## Complexity aur galtiyan
O(n) time, O(1) extra. Case ignore kiye bina compare galat hota hai.`,
  ),
  "container-most-water": n(
    "O(n) time, O(1) space",
    `class Solution {
public:
    int maxArea(vector<int>& height) {
        int L = 0, R = (int)height.size() - 1, best = 0;
        while (L < R) {
            int h = min(height[L], height[R]);
            best = max(best, h * (R - L));
            if (height[L] < height[R]) L++;
            else R--;
        }
        return best;
    }
};`,
    `## What is asked
Each index is a vertical line. Pick two lines so that the area of the container, shorter line times distance, is maximized.

## Why brute force is not the answer
Every pair is O(n²). The optimal proof is that you never need to move the taller line while the shorter one is fixed, because width only shrinks.

## Optimal idea
Start at both ends, where width is largest. Area is min(height[L], height[R]) * (R - L). Then move the shorter side inward. The taller side stays, because moving it cannot increase the height of the water, which is capped by the short side.

## Dry run
[1, 8, 6, 2, 5, 4, 8, 3, 7]. Start L = 0, R = 8, area 8. Move L because 1 is shorter. L lands on 8, area becomes 49. That is the best.

## Walk the code
The loop updates best, then advances exactly one pointer. Equal heights can move either side.

## Complexity and mistakes
O(n) time, O(1) memory. Moving the taller wall first misses the optimal pair.`,
    `## Sawal kya hai
Do lines chuno taaki chhoti line guna distance maximum ho.

## Brute force kyun nahi
Har pair O(n²) hai. Width sirf ghat-ti hai, isliye chhoti diwar ko hilana kaafi hai.

## Optimal idea
Dono ends se shuru, width sabse badi. Area = min(L, R) * (R - L). Phir jo diwar chhoti ho use andar khiskaao.

## Dry run
[1, 8, 6, 2, 5, 4, 8, 3, 7] par best 49 hai, index 1 aur 8 ki lines.

## Code kaise chalta hai
Pehle best update, phir exactly ek pointer aage. Equal height par koi bhi side chal sakti hai.

## Complexity aur galtiyan
O(n) time, O(1) space. Lambi diwar pehle hilane se answer chhoot jaata hai.`,
  ),
  "three-sum": n(
    "O(n²) time, O(1) extra space besides the answer",
    `class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        vector<vector<int>> ans;
        int n = (int)nums.size();
        for (int i = 0; i < n; i++) {
            if (i && nums[i] == nums[i - 1]) continue;
            int L = i + 1, R = n - 1;
            while (L < R) {
                long sum = (long)nums[i] + nums[L] + nums[R];
                if (sum == 0) {
                    ans.push_back({nums[i], nums[L], nums[R]});
                    L++;
                    R--;
                    while (L < R && nums[L] == nums[L - 1]) L++;
                    while (L < R && nums[R] == nums[R + 1]) R--;
                } else if (sum < 0) L++;
                else R--;
            }
        }
        return ans;
    }
};`,
    `## What is asked
Find every unique triplet that sums to zero. The same three values in a different order count once.

## Why brute force is not the answer
Three nested loops are O(n³) and still need a set to kill duplicates.

## Optimal idea
Sort first. Fix nums[i], then the classic two-pointer scan on the suffix looks for a pair that sums to -nums[i]. Skip equal neighbors at i, L, and R so each triplet is emitted once.

## Dry run
[-1, 0, 1, 2, -1, -4] sorts to [-4, -1, -1, 0, 1, 2]. Fixing -1, the pointers find [-1, 0, 1] and [-1, -1, 2].

## Walk the code
The long sum avoids overflow. After a hit, both pointers move, then the while loops skip duplicates.

## Complexity and mistakes
O(n²) time after the sort. Forgetting the duplicate skips returns the same triplet many times.`,
    `## Sawal kya hai
Aise unique triplets jinka sum 0 ho. Order alag ho to bhi ek hi baar.

## Brute force kyun nahi
Teen loops O(n³) hain aur duplicates alag se hatane padte hain.

## Optimal idea
Pehle sort. nums[i] fix karo, baaki suffix par do pointers se -nums[i] dhundo. Same padosi values skip karo.

## Dry run
[-4, -1, -1, 0, 1, 2] se [-1, 0, 1] aur [-1, -1, 2] milte hain.

## Code kaise chalta hai
long sum overflow se bachata hai. Hit ke baad dono pointers hilte hain aur duplicate skip hote hain.

## Complexity aur galtiyan
Sort ke baad O(n²). Duplicate skip bhoolne se same triplet baar baar aata hai.`,
  ),
  "remove-duplicates-sorted": n(
    "O(n) time, O(1) space",
    `class Solution {
public:
    int removeDuplicates(vector<int>& nums) {
        if (nums.empty()) return 0;
        int w = 1;
        for (int i = 1; i < (int)nums.size(); i++) {
            if (nums[i] != nums[w - 1]) nums[w++] = nums[i];
        }
        return w;
    }
};`,
    `## What is asked
The array is sorted. Remove extra copies in place so each value appears once in the front. Return the new length. Values after that length do not matter.

## Why brute force is not the answer
Erasing from the middle of a vector is O(n) per erase. A write pointer does the whole job in one pass.

## Optimal idea
\`w\` is the next free unique slot, starting at 1 because the first element is always unique. When nums[i] differs from the last written unique value, write it and advance w.

## Dry run
[0, 0, 1, 1, 1, 2, 2, 3] becomes [0, 1, 2, 3, ...] and the returned length is 4.

## Walk the code
Compare against nums[w - 1], not against nums[i - 1] only as a concept of "last kept". They match here because the array is sorted, and w - 1 is the last kept value.

## Complexity and mistakes
O(n) time, O(1) extra. Returning nums.size() leaves the duplicates in the counted prefix.`,
    `## Sawal kya hai
Sorted array mein duplicates hatao, unique values aage rakho, nayi length return karo.

## Brute force kyun nahi
Beech se erase karna har baar O(n) hai. Write pointer ek pass mein kaam karta hai.

## Optimal idea
\`w\` agla unique slot hai, 1 se shuru. nums[i] pichhli rakhi hui value se alag ho to likho aur w badhao.

## Dry run
[0, 0, 1, 1, 1, 2, 2, 3] ka length 4 hota hai: 0, 1, 2, 3.

## Code kaise chalta hai
Compare nums[w - 1] se hota hai, jo last unique value hai.

## Complexity aur galtiyan
O(n) time, O(1) extra. Poora size return mat karo.`,
  ),
  "max-avg-subarray": n(
    "O(n) time, O(1) space",
    `class Solution {
public:
    double findMaxAverage(vector<int>& nums, int k) {
        long window = 0;
        for (int i = 0; i < k; i++) window += nums[i];
        long best = window;
        for (int i = k; i < (int)nums.size(); i++) {
            window += nums[i] - nums[i - k];
            best = max(best, window);
        }
        return (double)best / k;
    }
};`,
    `## What is asked
Find the contiguous subarray of length k whose average is largest.

## Why brute force is not the answer
Re-summing every window is O(n·k). Neighboring windows share k - 1 elements.

## Optimal idea
Sum the first k elements. Slide one step: add the new right value, subtract the value that fell off the left. The maximum sum of a fixed length has the maximum average, so you can compare sums and divide once at the end.

## Dry run
[1, 12, -5, -6, 50, 3], k = 4. Windows sum to 2, then 51, then 42. Best sum 51, average 12.75.

## Walk the code
\`window\` is a long so the sum does not overflow int. The second loop starts at index k.

## Complexity and mistakes
O(n) time, O(1) extra. Dividing inside the loop is unnecessary and easier to get wrong with integers.`,
    `## Sawal kya hai
Length k ki lagatar subarray ka sabse bada average.

## Brute force kyun nahi
Har window dubara jodna O(n·k) hai. Padosi window mein sirf ek element badalta hai.

## Optimal idea
Pehli k values ka sum. Aage badhte hue naya element jodo, purana ghatao. Fixed length par max sum hi max average hai.

## Dry run
[1, 12, -5, -6, 50, 3], k = 4. Best sum 51, average 12.75.

## Code kaise chalta hai
\`window\` long hai taaki sum overflow na kare. Doosra loop index k se chalta hai.

## Complexity aur galtiyan
O(n) time, O(1) extra.`,
  ),
  "longest-substr-no-repeat": n(
    "O(n) time, O(1) space for a fixed alphabet, else O(k)",
    `class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        vector<int> last(128, -1);
        int best = 0, L = 0;
        for (int R = 0; R < (int)s.size(); R++) {
            if (last[s[R]] >= L) L = last[s[R]] + 1;
            last[s[R]] = R;
            best = max(best, R - L + 1);
        }
        return best;
    }
};`,
    `## What is asked
Return the length of the longest substring that contains no repeated character.

## Why brute force is not the answer
Checking every substring is O(n²) or worse. The window only grows and shrinks forward.

## Optimal idea
R walks the string. \`last[c]\` is the most recent index of character c. If that index is still inside the window, L jumps to just after it. Then record R as the new last index and update the best length.

## Dry run
"abcabcbb". The window grows to "abc" (length 3). The next a repeats, so L jumps past the old a. The best stays 3. "bbbbb" never grows past 1.

## Walk the code
The condition \`last[s[R]] >= L\` means the repeat is inside the current window, not somewhere already discarded.

## Complexity and mistakes
Each index is visited once, so O(n). Jumping L backward would break the O(n) proof.`,
    `## Sawal kya hai
Sabse lambi substring ki length jisme koi character repeat na ho.

## Brute force kyun nahi
Har substring check karna O(n²) hai. Window sirf aage badhti aur sikut-ti hai.

## Optimal idea
R string par chalta hai. \`last[c]\` us character ka pichhla index hai. Woh window ke andar ho to L uske just baad chala jaata hai. Phir best length update.

## Dry run
"abcabcbb" par best 3 hai. "bbbbb" par best 1.

## Code kaise chalta hai
\`last[s[R]] >= L\` ka matlab repeat abhi window ke andar hai, pehle chhode hue hisson mein nahi.

## Complexity aur galtiyan
Har index ek baar, O(n). L ko peeche mat le jao.`,
  ),
  "min-window-substring": n(
    "O(n) time, O(1) space for a fixed alphabet",
    `class Solution {
public:
    string minWindow(string s, string t) {
        if (t.empty() || s.empty()) return "";
        vector<int> need(128), have(128);
        int required = 0;
        for (unsigned char c : t) {
            if (need[c]++ == 0) required++;
        }
        int formed = 0, best = INT_MAX, start = 0, L = 0;
        for (int R = 0; R < (int)s.size(); R++) {
            unsigned char c = s[R];
            have[c]++;
            if (need[c] && have[c] == need[c]) formed++;
            while (L <= R && formed == required) {
                if (R - L + 1 < best) {
                    best = R - L + 1;
                    start = L;
                }
                unsigned char left = s[L];
                have[left]--;
                if (need[left] && have[left] < need[left]) formed--;
                L++;
            }
        }
        return best == INT_MAX ? "" : s.substr(start, best);
    }
};`,
    `## What is asked
Return the shortest substring of s that covers every character of t, including duplicates. If none exists, return the empty string.

## Why brute force is not the answer
Every substring against a count of t is O(n²). The window should grow until it is valid, then shrink until it is about to break.

## Optimal idea
\`need\` counts characters in t. \`required\` is how many distinct characters must be satisfied. R grows the window. When \`formed == required\`, the window is valid: record it if it is shorter, then move L forward and drop \`formed\` when a required character falls short.

## Dry run
s = "ADOBECODEBANC", t = "ABC". The window grows until it covers A, B, and C, then shrinks. The shortest is "BANC".

## Walk the code
\`need[c]++ == 0\` counts a new distinct character. The while loop only runs on a valid window, so every saved range is a real cover.

## Complexity and mistakes
O(n) because L and R only move forward. Forgetting duplicate counts in t accepts a window that is missing a repeated letter.`,
    `## Sawal kya hai
s ki sabse chhoti substring jo t ke saare characters cover kare, duplicates ke saath. Na mile to empty string.

## Brute force kyun nahi
Har substring O(n²) hai. Window ko valid banne tak badhao, phir tootne se pehle tak chhota karo.

## Optimal idea
\`need\` t ki counts hai. R window badhata hai. Jab saare required characters mil jaayein, length save karo aur L aage badhao jab tak window valid rahe.

## Dry run
s = ADOBECODEBANC, t = ABC. Sabse chhoti window BANC hai.

## Code kaise chalta hai
\`formed == required\` matlab window valid hai. While loop sirf tab chalta hai.

## Complexity aur galtiyan
L aur R sirf aage jaate hain, O(n). t ke duplicate count bhoolne se window adhuri reh jaati hai.`,
  ),
  "permutation-in-string": n(
    "O(n) time, O(1) space",
    `class Solution {
public:
    bool checkInclusion(string s1, string s2) {
        if (s1.size() > s2.size()) return false;
        vector<int> need(26), have(26);
        for (char c : s1) need[c - 'a']++;
        for (int i = 0; i < (int)s1.size(); i++) have[s2[i] - 'a']++;
        if (need == have) return true;
        for (int i = (int)s1.size(); i < (int)s2.size(); i++) {
            have[s2[i] - 'a']++;
            have[s2[i - (int)s1.size()] - 'a']--;
            if (need == have) return true;
        }
        return false;
    }
};`,
    `## What is asked
Return true if any permutation of s1 is a substring of s2. That means some window of s2 has exactly the same character counts as s1.

## Why brute force is not the answer
Generating every permutation is factorial. You do not need the order, only the counts.

## Optimal idea
Build the count of s1. Take the first window of that length in s2. Slide it: add the new character, remove the character that left. If the two count arrays match, a permutation is present.

## Dry run
s1 = "ab", s2 = "eidbaooo". The window reaches "ba", whose counts match "ab". Return true.

## Walk the code
\`need == have\` compares the 26 counters. The index removed is \`i - s1.size()\`, the left edge of the previous window.

## Complexity and mistakes
O(n) time, O(1) space because the alphabet is fixed. Comparing sorted windows is correct but slower.`,
    `## Sawal kya hai
s1 ka koi permutation s2 ki substring ho to true. Matlab s2 ki kisi window ki character counts s1 jaisi hon.

## Brute force kyun nahi
Saare permutations factorial hain. Order nahi, counts chahiye.

## Optimal idea
s1 ki count banao. s2 par utni hi lambi window slide karo: naya char jodo, bahar gaya char hatao. Counts match hon to true.

## Dry run
s1 = ab, s2 = eidbaooo. Window "ba" match karti hai.

## Code kaise chalta hai
\`need == have\` 26 counts compare karta hai. Jo index hat-ta hai woh \`i - s1.size()\` hai.

## Complexity aur galtiyan
O(n) time, alphabet fixed hone se O(1) space.`,
  ),
  "missing-number": n(
    "O(n) time, O(1) space",
    `class Solution {
public:
    int missingNumber(vector<int>& nums) {
        int n = (int)nums.size();
        int x = n;
        for (int i = 0; i < n; i++) x ^= i ^ nums[i];
        return x;
    }
};`,
    `## What is asked
The array contains n distinct numbers from the range 0..n, with one missing. Return the missing number.

## Why brute force is not the answer
Sorting is O(n log n). A boolean array is O(n) memory. XOR or the gauss sum is O(n) time and O(1) memory.

## Optimal idea
XOR every index, every value, and n. Pairs cancel because x ^ x = 0. The missing number is the only one left.

## Dry run
[3, 0, 1] has n = 3. XOR of 0, 1, 3, 3, 0, 1 leaves 2.

## Walk the code
\`x\` starts as n, then each i and nums[i] are folded in. Starting at n covers the number that has no index.

## Complexity and mistakes
O(n) time, O(1) space. Sum also works, but XOR cannot overflow.`,
    `## Sawal kya hai
0 se n tak ke numbers mein se ek gayab hai. Use return karo.

## Brute force kyun nahi
Sort O(n log n) hai. XOR ya sum O(n) time aur O(1) memory hai.

## Optimal idea
Har index, har value, aur n ko XOR karo. Jo pair banta hai woh 0 ho jaata hai. Bacha hua number missing hai.

## Dry run
[3, 0, 1] mein n = 3. XOR ke baad 2 bachta hai.

## Code kaise chalta hai
\`x\` n se shuru hota hai, phir i aur nums[i] judte hain.

## Complexity aur galtiyan
O(n) time, O(1) space. XOR overflow nahi karta.`,
  ),
  "single-number": n(
    "O(n) time, O(1) space",
    `class Solution {
public:
    int singleNumber(vector<int>& nums) {
        int x = 0;
        for (int v : nums) x ^= v;
        return x;
    }
};`,
    `## What is asked
Every value appears twice except one. Return the one that appears once.

## Why brute force is not the answer
A map is correct and uses O(n) memory. XOR uses none.

## Optimal idea
XOR is commutative and x ^ x = 0, and x ^ 0 = x. Every pair disappears. The singleton remains.

## Dry run
[4, 1, 2, 1, 2]. 1 cancels 1, 2 cancels 2, 4 remains.

## Walk the code
Start at 0, fold every value. The order does not matter.

## Complexity and mistakes
O(n) time, O(1) space. This exact trick fails if values appear three times; that needs a different bit count.`,
    `## Sawal kya hai
Har value do baar hai, ek value ek baar. Woh single value return karo.

## Brute force kyun nahi
Map sahi hai par O(n) memory leta hai. XOR kuch extra nahi leta.

## Optimal idea
x ^ x = 0 aur x ^ 0 = x. Saare pairs mit jaate hain. Single number bachta hai.

## Dry run
[4, 1, 2, 1, 2] mein 4 bachta hai.

## Code kaise chalta hai
0 se shuru, har value XOR. Order se farq nahi padta.

## Complexity aur galtiyan
O(n) time, O(1) space. Teen baar aane wali value par yeh trick nahi chalti.`,
  ),
  "majority-element": n(
    "O(n) time, O(1) space",
    `class Solution {
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
    `## What is asked
Return the value that appears more than n/2 times. The problem promises it exists.

## Why brute force is not the answer
A frequency map is O(n) memory. Sorting and taking the middle is O(n log n). Boyer–Moore finds it in one pass and constant memory because a majority cannot be cancelled away.

## Optimal idea
Keep a candidate and a count. A matching value increments. A different value decrements. When the count hits zero, the next value becomes the candidate. The majority survives because the other values cannot outvote it.

## Dry run
[2, 2, 1, 1, 1, 2, 2]. The candidate ends as 2.

## Walk the code
The reset happens before the increment of the new candidate, so a fresh candidate starts at count 1 on that same element.

## Complexity and mistakes
O(n) time, O(1) space. If a majority were not guaranteed, you would need a second pass to verify.`,
    `## Sawal kya hai
Woh value jo n/2 se zyada baar aati hai. Promise hai ki woh exist karti hai.

## Brute force kyun nahi
Map O(n) memory hai. Boyer–Moore ek pass aur constant memory mein majority nikaalta hai.

## Optimal idea
Candidate aur count rakho. Same value par count badhe, alag par ghate. Count 0 ho to naya candidate. Majority cancel nahi hoti.

## Dry run
[2, 2, 1, 1, 1, 2, 2] ka candidate 2 rehta hai.

## Code kaise chalta hai
Count 0 par pehle candidate badalta hai, phir usi element par count 1 ho jaata hai.

## Complexity aur galtiyan
O(n) time, O(1) space. Majority ka promise na ho to doosra pass chahiye.`,
  ),
  "merge-sorted-array": n(
    "O(n + m) time, O(1) extra space",
    `class Solution {
public:
    void merge(vector<int>& nums1, int m, vector<int>& nums2, int n) {
        int i = m - 1, j = n - 1, w = m + n - 1;
        while (j >= 0) {
            if (i >= 0 && nums1[i] > nums2[j]) nums1[w--] = nums1[i--];
            else nums1[w--] = nums2[j--];
        }
    }
};`,
    `## What is asked
nums1 has m real values followed by n empty slots. nums2 has n values. Merge them into nums1 as one sorted array.

## Why brute force is not the answer
Merging into the front of nums1 overwrites values you still need. A new array uses O(n + m) memory that the signature does not want.

## Optimal idea
Write from the back of nums1, where the empty slots are. Compare the largest remaining value of each array and place the bigger one at the write index. When nums2 is exhausted you are done, because the rest of nums1 is already in place.

## Dry run
nums1 = [1, 2, 3, 0, 0, 0], m = 3, nums2 = [2, 5, 6]. The back fills 6, 5, 3, 2, 2, 1.

## Walk the code
The loop condition is \`j >= 0\`. If i runs out first, the else branch copies the rest of nums2.

## Complexity and mistakes
O(n + m) time, O(1) extra. Writing forward corrupts nums1.`,
    `## Sawal kya hai
nums1 mein m values aur n khali slots hain. nums2 ko nums1 mein sorted merge karo.

## Brute force kyun nahi
Aage se likhne par nums1 ki values mit-ti hain. Nayi array extra memory hai.

## Optimal idea
Peeche se likho, jahan khali jagah hai. Dono arrays ke bache hue bade element mein se bada wahan rakho. nums2 khatam ho to ruk jao.

## Dry run
[1, 2, 3, 0, 0, 0] aur [2, 5, 6] milkar [1, 2, 2, 3, 5, 6] bante hain.

## Code kaise chalta hai
Loop tab tak chalta hai jab tak nums2 bacha ho. i khatam ho to baaki nums2 copy ho jaata hai.

## Complexity aur galtiyan
O(n + m) time, O(1) extra. Aage se likhna nums1 ko kharab karta hai.`,
  ),
  "sort-colors": n(
    "O(n) time, O(1) space",
    `class Solution {
public:
    void sortColors(vector<int>& nums) {
        int lo = 0, mid = 0, hi = (int)nums.size() - 1;
        while (mid <= hi) {
            if (nums[mid] == 0) swap(nums[lo++], nums[mid++]);
            else if (nums[mid] == 2) swap(nums[mid], nums[hi--]);
            else mid++;
        }
    }
};`,
    `## What is asked
Sort an array that contains only 0, 1, and 2. Do it in place, in one pass.

## Why brute force is not the answer
Counting sort is also O(n), but the Dutch national flag does it with three pointers and no second write pass over a count array you then expand.

## Optimal idea
lo is the next slot for a 0. hi is the next slot for a 2. mid scans. A 0 swaps toward lo and both lo and mid advance. A 2 swaps toward hi and hi moves back, but mid stays, because the swapped-in value has not been read. A 1 only advances mid.

## Dry run
[2, 0, 2, 1, 1, 0] ends as [0, 0, 1, 1, 2, 2].

## Walk the code
The important asymmetry: after swapping with hi, do not increment mid.

## Complexity and mistakes
O(n) time, O(1) space. Incrementing mid after a 2-swap can skip a 0 that just arrived.`,
    `## Sawal kya hai
Sirf 0, 1, 2 wali array ko in place, ek pass mein sort karo.

## Brute force kyun nahi
Count karke dubara likhna bhi O(n) hai. Dutch flag teen pointers se ek hi scan mein karta hai.

## Optimal idea
lo agla 0 slot, hi agla 2 slot, mid scanner. 0 ko lo se swap karke lo aur mid badhao. 2 ko hi se swap karke hi ghatao, mid ko mat badhao. 1 par sirf mid badhao.

## Dry run
[2, 0, 2, 1, 1, 0] ban jaata hai [0, 0, 1, 1, 2, 2].

## Code kaise chalta hai
2 wale swap ke baad mid nahi badhta, kyunki naya value abhi padha nahi.

## Complexity aur galtiyan
O(n) time, O(1) space. 2-swap ke baad mid++ karna 0 ko skip kar sakta hai.`,
  ),
  "product-except-self": n(
    "O(n) time, O(1) extra space besides the output",
    `class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        int n = (int)nums.size();
        vector<int> ans(n, 1);
        int left = 1, right = 1;
        for (int i = 0; i < n; i++) {
            ans[i] *= left;
            left *= nums[i];
            ans[n - 1 - i] *= right;
            right *= nums[n - 1 - i];
        }
        return ans;
    }
};`,
    `## What is asked
For each index, return the product of every other element. Do not use division.

## Why brute force is not the answer
A nested product is O(n²). Division by the total product breaks on zeros and is forbidden anyway.

## Optimal idea
ans[i] must be (product of everything left of i) times (product of everything right of i). One forward pass writes the left products. One backward pass multiplies the right products. They can share a single loop from both ends.

## Dry run
[1, 2, 3, 4] becomes [24, 12, 8, 6]. Index 2 is 1*2*4 = 8.

## Walk the code
\`left\` and \`right\` start at 1, the empty product. Multiply into ans before updating the running product, so the current number is excluded.

## Complexity and mistakes
O(n) time. Output does not count as extra space. Updating the running product before writing includes nums[i] and is wrong.`,
    `## Sawal kya hai
Har index par baaki sab elements ka product. Division allowed nahi.

## Brute force kyun nahi
Nested product O(n²) hai. Division zero par toot-ti hai aur mana bhi hai.

## Optimal idea
ans[i] = left product × right product. Ek pass left likhta hai, ek pass right se multiply karta hai.

## Dry run
[1, 2, 3, 4] → [24, 12, 8, 6].

## Code kaise chalta hai
\`left\` aur \`right\` 1 se shuru. Pehle ans mein likho, phir running product update karo, taaki current number shamil na ho.

## Complexity aur galtiyan
O(n) time. Pehle product update kar doge to nums[i] include ho jaayega.`,
  ),
  "max-consecutive-ones": n(
    "O(n) time, O(1) space",
    `class Solution {
public:
    int findMaxConsecutiveOnes(vector<int>& nums) {
        int cur = 0, best = 0;
        for (int x : nums) {
            if (x == 1) best = max(best, ++cur);
            else cur = 0;
        }
        return best;
    }
};`,
    `## What is asked
The array is only 0s and 1s. Return the longest run of consecutive 1s.

## Why brute force is not the answer
You do not need every start index. A streak either continues or dies at a 0.

## Optimal idea
\`cur\` is the current streak. A 1 increments it and maybe updates best. A 0 resets it to 0.

## Dry run
[1, 1, 0, 1, 1, 1] reaches 3.

## Walk the code
\`++cur\` increments before the max, so the new length is what gets compared.

## Complexity and mistakes
O(n) time, O(1) space. Forgetting to reset on 0 counts across the gap.`,
    `## Sawal kya hai
Sirf 0 aur 1. Sabse lambi lagatar 1s ki length.

## Brute force kyun nahi
Har start ki zaroorat nahi. Streak 0 par khatam ho jaati hai.

## Optimal idea
\`cur\` current streak. 1 par badhao aur best update. 0 par cur = 0.

## Dry run
[1, 1, 0, 1, 1, 1] ka answer 3 hai.

## Code kaise chalta hai
\`++cur\` pehle badhata hai, phir max us nayi length se hota hai.

## Complexity aur galtiyan
O(n) time, O(1) space. 0 par reset bhoolne se gap ke paar count ho jaata hai.`,
  ),
  "first-unique-char": n(
    "O(n) time, O(1) space",
    `class Solution {
public:
    int firstUniqChar(string s) {
        int freq[26] = {};
        for (char c : s) freq[c - 'a']++;
        for (int i = 0; i < (int)s.size(); i++) {
            if (freq[s[i] - 'a'] == 1) return i;
        }
        return -1;
    }
};`,
    `## What is asked
Return the index of the first character that appears exactly once. If every character repeats, return -1.

## Why brute force is not the answer
For each character, scanning the rest of the string is O(n²). Two passes over a 26-slot count are enough.

## Optimal idea
Count every letter. Scan the string again in order and return the first index whose count is 1. The second scan is what preserves "first".

## Dry run
"leetcode": l is 1, so index 0. "aabb" has no count of 1, so -1.

## Walk the code
The frequency array is indexed by \`c - 'a'\`. The problem uses lowercase English letters.

## Complexity and mistakes
O(n) time, O(1) space. Returning during the first pass is wrong because you do not yet know the total count.`,
    `## Sawal kya hai
Pehle character ka index jo sirf ek baar aaya ho. Na mile to -1.

## Brute force kyun nahi
Har character ke liye baaki string O(n²) hai. Do passes aur 26 counts kaafi hain.

## Optimal idea
Pehle count. Phir string ko order mein dobara padho aur pehla index jiska count 1 ho use return karo.

## Dry run
"leetcode" mein l index 0 par unique hai. "aabb" par -1.

## Code kaise chalta hai
Index \`c - 'a'\` hai. Pehli pass mein return mat karo, total count abhi pata nahi.

## Complexity aur galtiyan
O(n) time, O(1) space.`,
  ),
  "isomorphic-strings": n(
    "O(n) time, O(1) space",
    `class Solution {
public:
    bool isIsomorphic(string s, string t) {
        int sto[256], tto[256];
        memset(sto, -1, sizeof(sto));
        memset(tto, -1, sizeof(tto));
        for (int i = 0; i < (int)s.size(); i++) {
            unsigned char a = s[i], b = t[i];
            if (sto[a] == -1 && tto[b] == -1) {
                sto[a] = b;
                tto[b] = a;
            } else if (sto[a] != b || tto[b] != a) return false;
        }
        return true;
    }
};`,
    `## What is asked
Characters of s can be replaced so that s becomes t. The replacement must be one-to-one: two different characters cannot map to the same character.

## Why brute force is not the answer
You need both directions. Mapping only s → t allows "ab" and "aa", which is not isomorphic, because b and a would both need to become a, or a would map to two letters.

## Optimal idea
Store the last partner of each character in both directions. The first time you see a pair, record both links. Later, either link disagreeing means the mapping broke.

## Dry run
"egg" and "add": e→a, g→d. "foo" and "bar": o cannot map to both a and r.

## Walk the code
Arrays start at -1, meaning "no mapping yet". The else-if catches a conflict on either side.

## Complexity and mistakes
O(n) time. A single map is not enough.`,
    `## Sawal kya hai
s ke characters replace karke t banna chahiye, aur mapping one-to-one honi chahiye.

## Brute force kyun nahi
Sirf s → t map "ab" aur "aa" ko galat tareeke se allow kar deta hai. Dono directions chahiye.

## Optimal idea
Har character ka partner dono taraf yaad rakho. Pehli baar dono links likho. Baad mein koi link alag ho to false.

## Dry run
egg aur add chal jaata hai. foo aur bar nahi, kyunki o do letters par map hota hai.

## Code kaise chalta hai
-1 matlab abhi mapping nahi. else-if kisi bhi side ka conflict pakadta hai.

## Complexity aur galtiyan
O(n) time. Ek map kaafi nahi.`,
  ),
  "happy-number": n(
    "O(log n) per step, O(1) space",
    `class Solution {
public:
    bool isHappy(int n) {
        auto next = [](int x) {
            int s = 0;
            while (x) {
                int d = x % 10;
                s += d * d;
                x /= 10;
            }
            return s;
        };
        int slow = n, fast = n;
        do {
            slow = next(slow);
            fast = next(next(fast));
        } while (slow != fast);
        return slow == 1;
    }
};`,
    `## What is asked
Replace a number by the sum of the squares of its digits, and repeat. If you reach 1, it is happy. If you loop without reaching 1, it is not.

## Why brute force is not the answer
A set of seen numbers works, but Floyd's cycle finding uses O(1) memory. Unhappy numbers fall into a known cycle.

## Optimal idea
Slow moves one step, fast moves two. If there is a cycle they meet. After they meet, the number is happy only if the meeting point is 1, because 1 loops to itself (1² = 1) and every other cycle does not contain 1.

## Dry run
19 → 82 → 68 → 100 → 1. Happy. 2 eventually cycles and never meets at 1.

## Walk the code
\`next\` sums digit squares. The do-while runs at least once so slow and fast can separate before the equality test.

## Complexity and mistakes
Values collapse quickly, so the loop is short. Using an int for the sum is safe because digit squares of a 32-bit number fit.`,
    `## Sawal kya hai
Har digit ka square jodte jao. 1 mil jaaye to happy. Loop mein phans jao aur 1 na aaye to nahi.

## Brute force kyun nahi
Seen set kaam karta hai par memory leta hai. Slow/fast pointer O(1) memory mein cycle pakadta hai.

## Optimal idea
Slow ek step, fast do step. Milne par happy sirf tab hai jab meeting point 1 ho, kyunki 1 apne aap par loop karta hai.

## Dry run
19 happy hai, 1 tak pahunchta hai. 2 cycle mein chala jaata hai.

## Code kaise chalta hai
\`next\` digit squares ka sum hai. do-while kam se kam ek baar chalta hai.

## Complexity aur galtiyan
Numbers jaldi chhote ho jaate hain. Sum int mein fit hota hai.`,
  ),
  "longest-consecutive": n(
    "O(n) time, O(n) space",
    `class Solution {
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
    `## What is asked
Return the length of the longest run of consecutive integers. The numbers do not have to be adjacent in the array. Order does not matter, duplicates do not help.

## Why brute force is not the answer
Sorting is O(n log n). The linear solution only starts a walk at the beginning of a run.

## Optimal idea
Put every value in a set. A number starts a run only when x - 1 is absent. From there, count x, x+1, x+2, ... while they exist. Each number is visited a constant number of times across all walks, so the total is O(n).

## Dry run
[100, 4, 200, 1, 3, 2]. 1 starts a run because 0 is missing. The run is 1, 2, 3, 4. Length 4. 100 and 200 are runs of length 1.

## Walk the code
The continue skips numbers that are in the middle of a run. \`x + len\` walks forward.

## Complexity and mistakes
O(n) average time because of the hash set. Starting a walk at every number, including middles, becomes O(n²) on one long run.`,
    `## Sawal kya hai
Sabse lambi consecutive integers ki length. Array mein pas pas hona zaroori nahi.

## Brute force kyun nahi
Sort O(n log n) hai. Linear solution sirf run ki shuruaat se chalta hai.

## Optimal idea
Set banao. x tabhi start hai jab x - 1 set mein na ho. Wahan se x, x+1, x+2 gino.

## Dry run
[100, 4, 200, 1, 3, 2] mein 1 se 4 tak length 4 hai.

## Code kaise chalta hai
\`x - 1\` maujood ho to continue. Beech ke numbers se walk shuru mat karo.

## Complexity aur galtiyan
Average O(n). Har number se walk shuru karoge to lambi run par O(n²) ho jaayega.`,
  ),
  "two-sum-ii": n(
    "O(n) time, O(1) space",
    `class Solution {
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
    `## What is asked
The array is sorted in non-decreasing order. Return the 1-based indices of two numbers that add to the target. There is exactly one solution.

## Why brute force is not the answer
A hash map works but uses extra memory. The sort is already paid for, so two pointers are O(1) extra.

## Optimal idea
L at the start, R at the end. If the sum is too small, move L right to increase it. If the sum is too big, move R left to decrease it. Sorted order is what makes that move safe.

## Dry run
[2, 7, 11, 15], target 9. 2 + 15 is too big, so R moves. 2 + 11 is too big. 2 + 7 is 9. Return [1, 2] because the judge wants 1-based indices.

## Walk the code
The return adds 1 to both indices. The loop cannot miss the pair because each move discards only values that cannot be part of a solution with the other pointer.

## Complexity and mistakes
O(n) time, O(1) space. Returning 0-based indices fails the tests.`,
    `## Sawal kya hai
Array sorted hai. Target banane wale do numbers ke **1-based** indices return karo.

## Brute force kyun nahi
Hash map extra memory hai. Sort pehle se hai, isliye do pointers O(1) extra hain.

## Optimal idea
L shuru, R end. Sum chhota ho to L aage, bada ho to R peeche.

## Dry run
[2, 7, 11, 15], target 9. Jawab [1, 2], kyunki indices 1 se ginte hain.

## Code kaise chalta hai
Return mein +1 hai. Galat side hataane se asli pair nahi chhoota.

## Complexity aur galtiyan
O(n) time, O(1) space. 0-based return tests fail karta hai.`,
  ),
  "squares-sorted": n(
    "O(n) time, O(n) space for the output",
    `class Solution {
public:
    vector<int> sortedSquares(vector<int>& nums) {
        int n = (int)nums.size();
        vector<int> ans(n);
        int L = 0, R = n - 1, w = n - 1;
        while (L <= R) {
            if (abs(nums[L]) > abs(nums[R])) ans[w--] = nums[L] * nums[L++];
            else ans[w--] = nums[R] * nums[R--];
        }
        return ans;
    }
};`,
    `## What is asked
The array is sorted and may contain negatives. Return the squares, sorted ascending.

## Why brute force is not the answer
Square then sort is O(n log n). The largest square is at one of the two ends, because the array is sorted.

## Optimal idea
Two pointers at the ends. Write the larger absolute value's square into the back of the answer, then move that pointer inward. Fill the answer from right to left.

## Dry run
[-4, -1, 0, 3, 10]. 16 and 100 are the end squares. 100 is written first, then 16, then 9, then 1, then 0. Result [0, 1, 9, 16, 100].

## Walk the code
Compare abs, not the raw values. \`w\` starts at n - 1.

## Complexity and mistakes
O(n) time. Squaring in place and sorting loses the linear bound.`,
    `## Sawal kya hai
Sorted array, negatives ho sakte hain. Squares ko ascending sorted return karo.

## Brute force kyun nahi
Square karke sort O(n log n) hai. Sabse bada square kisi ek end par hota hai.

## Optimal idea
Dono ends par pointer. Jiska absolute value bada ho uska square answer ke peeche likho. Right se left bharo.

## Dry run
[-4, -1, 0, 3, 10] → [0, 1, 9, 16, 100].

## Code kaise chalta hai
Raw value nahi, abs compare karo. \`w\` n - 1 se shuru.

## Complexity aur galtiyan
O(n) time. Square ke baad sort linear nahi rehta.`,
  ),
  "trapping-rain": n(
    "O(n) time, O(1) space",
    `class Solution {
public:
    int trap(vector<int>& height) {
        int L = 0, R = (int)height.size() - 1;
        int leftMax = 0, rightMax = 0, water = 0;
        while (L < R) {
            if (height[L] <= height[R]) {
                leftMax = max(leftMax, height[L]);
                water += leftMax - height[L];
                L++;
            } else {
                rightMax = max(rightMax, height[R]);
                water += rightMax - height[R];
                R--;
            }
        }
        return water;
    }
};`,
    `## What is asked
Elevation bars form a histogram. Return how many units of water it can trap after raining.

## Why brute force is not the answer
For each index, scanning left-max and right-max is O(n²). Prefix arrays are O(n) time and O(n) memory. Two pointers match that time with O(1) memory.

## Optimal idea
Water at i is min(maxLeft, maxRight) - height[i], when that is positive. If height[L] is the smaller side, the water there is limited by leftMax, because the other side is at least as tall. Move the smaller side.

## Dry run
[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1] traps 6.

## Walk the code
Update the side max before adding water. On a new maximum the added water is 0, which is correct.

## Complexity and mistakes
O(n) time, O(1) space. Adding water before updating the max undercounts the current bar when it is a new peak, or rather it would subtract wrong if you used a stale max incorrectly. The order above is the safe one.`,
    `## Sawal kya hai
Bars ke beech kitna paani rukta hai.

## Brute force kyun nahi
Har index ke liye left-max aur right-max O(n²) hai. Do pointers O(n) time aur O(1) memory hain.

## Optimal idea
Paani = min(leftMax, rightMax) - height. Jo side chhoti ho, usi ka max paani ki seema hai. Chhoti side aage badhao.

## Dry run
[0,1,0,2,1,0,1,3,2,1,2,1] par 6 unit.

## Code kaise chalta hai
Pehle side max update, phir paani jodo. Naya peak par joda hua paani 0 hota hai.

## Complexity aur galtiyan
O(n) time, O(1) space.`,
  ),
  "max-consec-ones-iii": n(
    "O(n) time, O(1) space",
    `class Solution {
public:
    int longestOnes(vector<int>& nums, int k) {
        int L = 0, zeros = 0, best = 0;
        for (int R = 0; R < (int)nums.size(); R++) {
            if (nums[R] == 0) zeros++;
            while (zeros > k) {
                if (nums[L++] == 0) zeros--;
            }
            best = max(best, R - L + 1);
        }
        return best;
    }
};`,
    `## What is asked
You may flip at most k zeros to ones. Return the longest streak of ones you can build.

## Why brute force is not the answer
Every window checked from scratch is O(n²). A sliding window keeps the number of zeros inside it.

## Optimal idea
Grow R. Count zeros in the window. When zeros exceed k, move L until the window is legal again. The window length is the answer candidate. Flipping is not done explicitly: a zero inside a legal window is a flip.

## Dry run
[1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], k = 2. The best window covers 6 ones-and-flips.

## Walk the code
The while loop shrinks from the left only while the window is illegal. L never moves backward.

## Complexity and mistakes
O(n) time. Using k as a remaining budget that you forget to restore when L passes a zero is the classic bug; counting zeros in the window avoids that.`,
    `## Sawal kya hai
Zyada se zyada k zeros ko one bana sakte ho. Sabse lambi ones ki streak.

## Brute force kyun nahi
Har window dubara O(n²) hai. Sliding window andar ke zeros ginti hai.

## Optimal idea
R badhao. Zeros k se zyada hon to L aage badhao jab tak window legal na ho. Window ki length hi answer candidate hai.

## Dry run
k = 2 par upar wale example ki best length 6 hai.

## Code kaise chalta hai
While tabhi chalta hai jab zeros k se bade hon. L peeche nahi jaata.

## Complexity aur galtiyan
O(n) time. Zero ko window se nikaalte waqt count ghatana mat bhoolna.`,
  ),
  "find-anagrams": n(
    "O(n) time, O(1) space",
    `class Solution {
public:
    vector<int> findAnagrams(string s, string p) {
        vector<int> ans;
        if (p.size() > s.size()) return ans;
        vector<int> need(26), have(26);
        for (char c : p) need[c - 'a']++;
        for (int i = 0; i < (int)s.size(); i++) {
            have[s[i] - 'a']++;
            if (i >= (int)p.size()) have[s[i - (int)p.size()] - 'a']--;
            if (i >= (int)p.size() - 1 && need == have) ans.push_back(i - (int)p.size() + 1);
        }
        return ans;
    }
};`,
    `## What is asked
Return every start index in s where the substring is an anagram of p.

## Why brute force is not the answer
Sorting every window is O(n · k log k). Fixed-size count windows are linear.

## Optimal idea
Same sliding count as permutation-in-string, but instead of returning a boolean, push the start index whenever the counts match. The start index is \`i - p.size() + 1\`.

## Dry run
s = "cbaebabacd", p = "abc". Matches start at 0 ("cba") and 6 ("bac").

## Walk the code
The character that leaves is \`s[i - p.size()]\`, and only after the window is wider than p. The compare happens once the window has length p.

## Complexity and mistakes
O(n) time. Off-by-one on the start index is the usual bug.`,
    `## Sawal kya hai
s ke wo start indices jahan substring p ka anagram ho.

## Brute force kyun nahi
Har window sort karna mehnga hai. Fixed counts linear hain.

## Optimal idea
p ki length ki window slide karo. Counts match hon to start index push karo: i - p.size() + 1.

## Dry run
s = cbaebabacd, p = abc. Index 0 aur 6.

## Code kaise chalta hai
Bahar jaane wala char \`s[i - p.size()]\` hai. Compare tab jab window p jitni lambi ho.

## Complexity aur galtiyan
O(n) time. Start index ka off-by-one common bug hai.`,
  ),
  "binary-search": n(
    "O(log n) time, O(1) space",
    `class Solution {
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
    `## What is asked
The array is sorted ascending. Return the index of target, or -1.

## Why brute force is not the answer
A linear scan ignores the sort. Each comparison should throw away half of the remaining range.

## Optimal idea
While L <= R, look at the middle. Equal means found. Smaller than target means the answer is strictly to the right, so L = mid + 1. Larger means R = mid - 1.

## Dry run
[1, 3, 5, 7, 9, 11], target 7. Mid 5 is too small, then mid 9 is too big, then mid lands on 7.

## Walk the code
\`L + (R - L) / 2\` avoids overflow. The loop uses \`<=\` so a one-element range is still checked.

## Complexity and mistakes
O(log n) time. Using \`<\` instead of \`<=\` can skip the last candidate. Setting L = mid without +1 loops forever.`,
    `## Sawal kya hai
Sorted array mein target ka index, na mile to -1.

## Brute force kyun nahi
Linear scan sort ko waste karta hai. Har comparison aadha range fenk de.

## Optimal idea
L <= R tak mid dekho. Barabar ho to index. Chhota ho to L = mid + 1. Bada ho to R = mid - 1.

## Dry run
[1, 3, 5, 7, 9, 11] mein 7 milta hai jab left half aur right half dono kat jaate hain.

## Code kaise chalta hai
Mid \`L + (R - L) / 2\` overflow se bachata hai. \`<=\` last element ko bhi check karta hai.

## Complexity aur galtiyan
O(log n). L = mid bina +1 ke infinite loop hai.`,
  ),
  "search-insert": n(
    "O(log n) time, O(1) space",
    `class Solution {
public:
    int searchInsert(vector<int>& nums, int target) {
        int L = 0, R = (int)nums.size() - 1;
        while (L <= R) {
            int mid = L + (R - L) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) L = mid + 1;
            else R = mid - 1;
        }
        return L;
    }
};`,
    `## What is asked
Return the index of target if it exists. If it does not, return the index where it should be inserted to keep the array sorted.

## Why brute force is not the answer
A linear scan finds the first value greater than or equal to target in O(n). Binary search finds that boundary in O(log n).

## Optimal idea
This is the lower bound. The same loop as binary search runs. When it ends, L is the first index whose value is not smaller than target. That is either the match or the insertion point.

## Dry run
[1, 3, 5, 6], target 2. L ends at 1, between 1 and 3. Target 7 ends at 4, past the last element. Target 5 returns 2.

## Walk the code
Return L, not -1. R is one left of the insertion point when the loop exits.

## Complexity and mistakes
O(log n). Returning R inserts one slot too early.`,
    `## Sawal kya hai
Target ka index, ya woh jagah jahan insert karne se array sorted rahe.

## Brute force kyun nahi
Pehli value jo target se badi ya barabar ho, linear scan O(n) hai. Binary search O(log n).

## Optimal idea
Wahi binary search. Loop khatam hone par L woh pehla index hai jiski value target se chhoti nahi. Yahi insertion point hai.

## Dry run
[1, 3, 5, 6], target 2 par L = 1. Target 7 par L = 4. Target 5 par index 2.

## Code kaise chalta hai
-1 nahi, L return karo.

## Complexity aur galtiyan
O(log n). R return karna ek slot peeche daal deta hai.`,
  ),
  "first-last-position": n(
    "O(log n) time, O(1) space",
    `class Solution {
public:
    vector<int> searchRange(vector<int>& nums, int target) {
        auto bound = [&](int want) {
            int L = 0, R = (int)nums.size();
            while (L < R) {
                int mid = L + (R - L) / 2;
                if (nums[mid] < want) L = mid + 1;
                else R = mid;
            }
            return L;
        };
        int left = bound(target);
        if (left == (int)nums.size() || nums[left] != target) return {-1, -1};
        return {left, bound(target + 1) - 1};
    }
};`,
    `## What is asked
The array is sorted and may contain duplicates. Return the first and last index of target, or [-1, -1].

## Why brute force is not the answer
Finding one copy with binary search and then scanning left and right can be O(n) when the whole array is the target.

## Optimal idea
Lower bound of target is the first index not smaller than target. Lower bound of target + 1 is the first index strictly greater than target. The last occurrence is that index minus one. If the lower bound is out of range or holds a different value, the target is absent.

## Dry run
[5, 7, 7, 8, 8, 10], target 8. Lower bound is 3, bound of 9 is 5, so the range is [3, 4].

## Walk the code
\`bound\` uses a half-open range [L, R). It returns the insertion index, which may equal nums.size().

## Complexity and mistakes
Two binary searches, O(log n). A single search plus a linear expand is not optimal on a long plateau.`,
    `## Sawal kya hai
Sorted array mein target ka pehla aur aakhri index. Na ho to [-1, -1].

## Brute force kyun nahi
Ek binary search ke baad left-right scan lambi plateau par O(n) ho jaata hai.

## Optimal idea
target ka lower bound pehla index hai. target+1 ka lower bound pehla bada index hai. Aakhri occurrence usse ek peeche hai.

## Dry run
[5, 7, 7, 8, 8, 10], target 8. Range [3, 4].

## Code kaise chalta hai
\`bound\` half-open range use karta hai. Return nums.size() bhi ho sakta hai.

## Complexity aur galtiyan
Do binary search, O(log n).`,
  ),
  "valid-parentheses": n(
    "O(n) time, O(n) space",
    `class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        for (char c : s) {
            if (c == '(' || c == '[' || c == '{') st.push(c);
            else {
                if (st.empty()) return false;
                char o = st.top();
                st.pop();
                if ((c == ')' && o != '(') || (c == ']' && o != '[') || (c == '}' && o != '{'))
                    return false;
            }
        }
        return st.empty();
    }
};`,
    `## What is asked
A string of brackets is valid when every closer matches the nearest unmatched opener, and nothing is left open.

## Why brute force is not the answer
Replacing "()", "[]", and "{}" in a loop works but is slower and easy to get wrong on overlapping pairs. A stack is the direct model of "nearest opener".

## Optimal idea
Push openers. On a closer, the stack must be non-empty and the top must be the matching opener, then pop. At the end the stack must be empty.

## Dry run
"()[]{}" pushes and immediately pops three times, ending empty. "(]" pops '(' against ']', which fails. "([)]" fails because ']' does not match '('.

## Walk the code
Empty stack on a closer is an immediate false. The final \`st.empty()\` catches a leftover opener such as "(".

## Complexity and mistakes
O(n) time and O(n) stack space. Checking only the counts of each bracket type accepts "([)]".`,
    `## Sawal kya hai
Har closer apne nearest opener se match kare, aur end mein kuch open na bache.

## Brute force kyun nahi
"()""[]""{}" baar baar replace karna slow hai. Stack seedha nearest opener hai.

## Optimal idea
Opener push. Closer par stack khali na ho aur top match kare, phir pop. End mein stack khali hona chahiye.

## Dry run
()[]{} valid hai. (] fail. ([)] fail kyunki ] , ( se match nahi karta.

## Code kaise chalta hai
Closer par khali stack false hai. Aakhri empty check "(" jaise leftover pakadta hai.

## Complexity aur galtiyan
O(n) time, O(n) space. Sirf counts check karna "([)]" ko galat tareeke se accept karta hai.`,
  ),
  "min-stack": n(
    "O(1) per operation, O(n) space",
    `class MinStack {
    stack<int> vals, mins;
public:
    MinStack() {}
    void push(int val) {
        vals.push(val);
        mins.push(mins.empty() ? val : min(val, mins.top()));
    }
    void pop() {
        vals.pop();
        mins.pop();
    }
    int top() { return vals.top(); }
    int getMin() { return mins.top(); }
};`,
    `## What is asked
Design a stack with push, pop, top, and getMin, each in O(1).

## Why brute force is not the answer
Scanning the stack for the minimum on each getMin is O(n). You have to remember the minimum as values arrive.

## Optimal idea
A second stack stores the minimum at or below the current height. On push, the new min is min(val, old min), or val if the min stack is empty. Pop removes one value and one minimum together, so the previous minimum comes back.

## Dry run
push -2, push 0, push -3. getMin is -3. pop. top is 0. getMin is -2 again.

## Walk the code
\`mins.top()\` after a matching pop is the min of whatever remains. The two stacks always have the same size.

## Complexity and mistakes
Every operation is O(1). Popping only the value stack leaves a stale minimum.`,
    `## Sawal kya hai
Stack jisme push, pop, top, aur getMin sab O(1) hon.

## Brute force kyun nahi
Har getMin par poori stack dekhna O(n) hai. Minimum aate waqt yaad rakhna padta hai.

## Optimal idea
Doosri stack current height tak ka minimum rakhti hai. Push par naya min = min(val, purana min). Pop dono stacks se ek saath.

## Dry run
-2, 0, -3 push. getMin -3. pop ke baad top 0 aur getMin phir -2.

## Code kaise chalta hai
Dono stacks ki height same rehti hai. mins.top() bachi hui values ka min hai.

## Complexity aur galtiyan
Har operation O(1). Sirf value pop karoge to purana min atak jaayega.`,
  ),
  "daily-temperatures": n(
    "O(n) time, O(n) space",
    `class Solution {
public:
    vector<int> dailyTemperatures(vector<int>& temperatures) {
        int n = (int)temperatures.size();
        vector<int> ans(n, 0);
        stack<int> st;
        for (int i = 0; i < n; i++) {
            while (!st.empty() && temperatures[i] > temperatures[st.top()]) {
                int j = st.top();
                st.pop();
                ans[j] = i - j;
            }
            st.push(i);
        }
        return ans;
    }
};`,
    `## What is asked
For each day, return how many days you must wait until a warmer temperature. If it never gets warmer, return 0.

## Why brute force is not the answer
Looking forward from each day is O(n²). A monotonic stack answers every day the moment a warmer day arrives.

## Optimal idea
The stack stores indices of days waiting for a warmer future, and it stays decreasing in temperature. When today is warmer than the top, that day is resolved: distance is i - j. Pop until today is not warmer than the top, then push today.

## Dry run
[73, 74, 75, 71, 69, 72, 76, 73] becomes [1, 1, 4, 2, 1, 1, 0, 0]. 76 resolves several colder days at once.

## Walk the code
ans starts at 0, so unresolved days stay 0. The stack holds indices, not temperatures, because the answer is a distance.

## Complexity and mistakes
Each index is pushed and popped once, so O(n). Storing temperatures instead of indices loses the distance.`,
    `## Sawal kya hai
Har din ke liye kitne din baad temperature zyada hoga. Kabhi na ho to 0.

## Brute force kyun nahi
Har din se aage dekhna O(n²) hai. Monotonic stack us din resolve karta hai jab garam din aata hai.

## Optimal idea
Stack un indices ko rakhti hai jo garam future ka intezaar kar rahe hain, temperature decreasing. Aaj top se garam ho to distance i - j likho aur pop karo. Phir aaj push karo.

## Dry run
[73, 74, 75, 71, 69, 72, 76, 73] → [1, 1, 4, 2, 1, 1, 0, 0].

## Code kaise chalta hai
ans 0 se shuru, isliye jo resolve na hon 0 rehte hain. Stack mein index hai, temperature nahi, kyunki answer distance hai.

## Complexity aur galtiyan
Har index ek baar push aur pop, O(n).`,
  ),
  "reverse-linked-list": n(
    "O(n) time, O(1) space",
    `class Solution {
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
    `## What is asked
Reverse a singly linked list and return the new head.

## Why brute force is not the answer
Copying values into an array and rebuilding uses O(n) memory. Three pointers reverse the links in place.

## Optimal idea
\`prev\` starts null, \`cur\` starts at head. Before you change \`cur->next\`, save it in \`nxt\`, or the rest of the list is gone. Point cur back at prev, then step both forward. When cur becomes null, prev is the new head.

## Dry run
1 → 2 → 3. After the first step, 1 points at null and prev is 1. Then 2 points at 1. Then 3 points at 2. Return 3.

## Walk the code
The order inside the loop is save, rewire, advance prev, advance cur. Any other order loses a node.

## Complexity and mistakes
O(n) time, O(1) extra. Returning cur at the end returns null.`,
    `## Sawal kya hai
Singly linked list reverse karke naya head return karo.

## Brute force kyun nahi
Array mein copy karna O(n) memory hai. Teen pointers links ko jagah par palat-te hain.

## Optimal idea
prev null, cur head. cur->next badalne se pehle nxt mein save karo. cur ko prev ki taraf modo, phir dono aage. cur null ho to prev naya head hai.

## Dry run
1 → 2 → 3 palat kar 3 → 2 → 1 ban jaata hai.

## Code kaise chalta hai
Order: save, rewire, prev aage, cur aage. Order badla to node kho jaayegi.

## Complexity aur galtiyan
O(n) time, O(1) extra. End mein cur return karoge to null milega.`,
  ),
  "merge-two-lists": n(
    "O(n + m) time, O(1) extra space",
    `class Solution {
public:
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
        ListNode dummy(0);
        ListNode* tail = &dummy;
        while (list1 && list2) {
            if (list1->val <= list2->val) {
                tail->next = list1;
                list1 = list1->next;
            } else {
                tail->next = list2;
                list2 = list2->next;
            }
            tail = tail->next;
        }
        tail->next = list1 ? list1 : list2;
        return dummy.next;
    }
};`,
    `## What is asked
Both lists are sorted. Merge them into one sorted list by rewiring the existing nodes.

## Why brute force is not the answer
A dummy head removes the special case of "which list provides the first node". Without it, the first pick needs its own code and is where bugs hide.

## Optimal idea
While both lists remain, attach the smaller node to the tail and advance that list. When one list ends, attach the other list in one pointer assignment. It is already sorted.

## Dry run
1 → 2 → 4 and 1 → 3 → 4 become 1 → 1 → 2 → 3 → 4 → 4.

## Walk the code
\`dummy\` is stack memory, not a leaked node. The returned head is \`dummy.next\`, which skips the fake node. \`tail\` always moves onto the node just attached.

## Complexity and mistakes
O(n + m) time, O(1) extra. Forgetting \`tail = tail->next\` links every node to the dummy and loses the chain.`,
    `## Sawal kya hai
Dono sorted lists ko ek sorted list mein jodo, existing nodes ko rewire karke.

## Brute force kyun nahi
Dummy head pehle node ka special case hata deta hai.

## Optimal idea
Jab tak dono bachi hon, chhoti node tail par lagao aur us list ko aage badhao. Ek list khatam ho to doosri ko ek pointer se jod do.

## Dry run
1,2,4 aur 1,3,4 milkar 1,1,2,3,4,4.

## Code kaise chalta hai
dummy stack par hai. Return dummy.next hai. tail hamesha nayi lagi hui node par chalta hai.

## Complexity aur galtiyan
O(n + m) time, O(1) extra. tail = tail->next bhoolne se chain toot-ti hai.`,
  ),
  "linked-list-cycle": n(
    "O(n) time, O(1) space",
    `class Solution {
public:
    bool hasCycle(ListNode *head) {
        ListNode* slow = head;
        ListNode* fast = head;
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
            if (slow == fast) return true;
        }
        return false;
    }
};`,
    `## What is asked
Return true if some node can be reached again by following next. Do not modify the list.

## Why brute force is not the answer
A set of seen pointers is correct and uses O(n) memory. Floyd's algorithm uses two pointers and no extra memory.

## Optimal idea
Slow moves one step, fast moves two. If there is no cycle, fast falls off the end. If there is a cycle, fast gains one step per loop inside the cycle and must land on slow.

## Dry run
A list that points the tail at index 1 makes fast and slow meet inside the loop. A straight list makes fast->next null and returns false.

## Walk the code
The loop condition checks both \`fast\` and \`fast->next\` before the double step, so a null next is not dereferenced.

## Complexity and mistakes
O(n) time, O(1) space. Comparing values instead of node pointers is wrong when values repeat without a cycle.`,
    `## Sawal kya hai
Koi node next se phir se mil sakti hai to true. List ko mat badlo.

## Brute force kyun nahi
Seen pointers ka set O(n) memory hai. Do pointers O(1) memory hain.

## Optimal idea
Slow ek step, fast do step. Cycle na ho to fast end se gir jaata hai. Cycle ho to fast slow se milta hai.

## Dry run
Seedhi list par fast->next null hota hai, false. Loop wali list par pointers milte hain.

## Code kaise chalta hai
fast aur fast->next dono check hote hain, taaki null par next na lo.

## Complexity aur galtiyan
O(n) time, O(1) space. Values compare mat karo, node pointers compare karo.`,
  ),
  "invert-binary-tree": n(
    "O(n) time, O(h) stack space",
    `class Solution {
public:
    TreeNode* invertTree(TreeNode* root) {
        if (!root) return nullptr;
        swap(root->left, root->right);
        invertTree(root->left);
        invertTree(root->right);
        return root;
    }
};`,
    `## What is asked
Swap every left and right child, at every node, and return the same root.

## Why brute force is not the answer
There is nothing slower hiding here. The whole tree must be visited. The clean way is recursion or a queue. Recursion matches the tree.

## Optimal idea
If the node is null, stop. Otherwise swap its two children, then invert each side. Swapping before the recursive calls is easiest to read. Swapping after also works if you recurse on the original children first and swap those returned pointers.

## Dry run
A root 4 with left 2 and right 7 becomes left 7 and right 2, and the same swap happens under them.

## Walk the code
The function returns root so the caller keeps the original head. Null children return immediately.

## Complexity and mistakes
O(n) time. The call stack is O(h). Forgetting to return root after the swaps still mutates the tree, but the signature expects the root pointer back.`,
    `## Sawal kya hai
Har node ke left aur right child swap karo. Wahi root return karo.

## Optimal idea
Null par ruk jao. Warna children swap karo, phir dono side invert karo.

## Dry run
4 ke left 2 aur right 7 palat kar left 7 aur right 2 ho jaate hain. Neeche bhi wahi.

## Code kaise chalta hai
Function root return karta hai. Null child turant return hota hai.

## Complexity aur galtiyan
O(n) time, stack O(h). Root return karna mat bhoolna.`,
  ),
  "max-depth-tree": n(
    "O(n) time, O(h) stack space",
    `class Solution {
public:
    int maxDepth(TreeNode* root) {
        if (!root) return 0;
        return 1 + max(maxDepth(root->left), maxDepth(root->right));
    }
};`,
    `## What is asked
Return the number of nodes on the longest path from the root down to a leaf.

## Why brute force is not the answer
You still visit every node. The answer is defined by the two children, so recursion is the definition, not a shortcut you are missing.

## Optimal idea
An empty tree has depth 0. Any other node is 1 plus the deeper child.

## Dry run
A single node returns 1. A root with one child that is a leaf returns 2.

## Walk the code
Both recursive calls happen, then max picks the larger. Short-circuiting the second call would be wrong.

## Complexity and mistakes
O(n) time. Counting edges instead of nodes returns one less than the tests want.`,
    `## Sawal kya hai
Root se leaf tak sabse lambe path par kitne nodes hain.

## Optimal idea
Khali tree ki depth 0. Baaki node = 1 + gehra child.

## Dry run
Ek node par 1. Ek child wali root par 2.

## Code kaise chalta hai
Dono recursive calls hoti hain, phir max. Doosri call skip mat karo.

## Complexity aur galtiyan
O(n) time. Edges ginoge to answer ek kam aa jaayega.`,
  ),
  "same-tree": n(
    "O(n) time, O(h) stack space",
    `class Solution {
public:
    bool isSameTree(TreeNode* p, TreeNode* q) {
        if (!p && !q) return true;
        if (!p || !q) return false;
        return p->val == q->val && isSameTree(p->left, q->left) && isSameTree(p->right, q->right);
    }
};`,
    `## What is asked
Two trees are the same when they have the same shape and the same values.

## Why brute force is not the answer
Serializing both trees and comparing strings works but allocates. Structural recursion is enough.

## Optimal idea
Both null means this branch matches. Exactly one null means the shapes differ. Otherwise the values must match and both pairs of children must match.

## Dry run
[1, 2, 3] and [1, 2, 3] return true. [1, 2] and [1, null, 2] return false because the 2 is on different sides.

## Walk the code
The \`!p || !q\` test is safe only after the both-null test. Value is compared only when both nodes exist.

## Complexity and mistakes
O(n) time. Comparing only values and ignoring null children accepts different shapes.`,
    `## Sawal kya hai
Dono trees same hain jab shape aur values dono same hon.

## Optimal idea
Dono null hon to yeh branch match. Ek null ho to shape alag. Warna value same honi chahiye aur dono children same.

## Dry run
[1, 2, 3] aur [1, 2, 3] true. [1, 2] aur [1, null, 2] false, kyunki 2 alag side par hai.

## Code kaise chalta hai
Pehle both-null, phir ek-null. Value tab compare hoti hai jab dono nodes maujood hon.

## Complexity aur galtiyan
O(n) time. Sirf values dekhna alag shape ko bhi true kar deta hai.`,
  ),
  "climb-stairs": n(
    "O(n) time, O(1) space",
    `class Solution {
public:
    int climbStairs(int n) {
        if (n <= 2) return n;
        int a = 1, b = 2;
        for (int i = 3; i <= n; i++) {
            int c = a + b;
            a = b;
            b = c;
        }
        return b;
    }
};`,
    `## What is asked
You climb 1 or 2 steps at a time. Return how many distinct ways to reach the top of n stairs.

## Why brute force is not the answer
Pure recursion recounts the same remaining height many times, exponential unless you memoize. The recurrence is Fibonacci, so two variables are enough.

## Optimal idea
Ways to reach i equals ways to reach i-1 (then one step) plus ways to reach i-2 (then two steps). ways(1) = 1, ways(2) = 2.

## Dry run
n = 3: 1+1+1, 1+2, 2+1. Three ways. n = 4 is 5.

## Walk the code
a and b are the two previous answers. Each loop shifts them forward. n <= 2 returns immediately.

## Complexity and mistakes
O(n) time, O(1) space. ways(2) = 2, not 1. Off-by-one on the base case shifts the whole sequence.`,
    `## Sawal kya hai
Ek ya do seedhi ek baar. n seedhiyon par pahunchne ke kitne tarike.

## Brute force kyun nahi
Seedhi recursion same height baar baar gin-ti hai. Do variables kaafi hain.

## Optimal idea
i tak ke tarike = (i-1) + (i-2). ways(1) = 1, ways(2) = 2.

## Dry run
n = 3 par 3 tarike. n = 4 par 5.

## Code kaise chalta hai
a aur b pichhle do answers hain. n <= 2 seedha return.

## Complexity aur galtiyan
O(n) time, O(1) space. ways(2) ko 1 mat samajhna.`,
  ),
  "house-robber": n(
    "O(n) time, O(1) space",
    `class Solution {
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
    `## What is asked
Houses in a line hold money. You cannot rob two adjacent houses. Return the maximum amount.

## Why brute force is not the answer
Trying every subset of non-adjacent houses is exponential. Each house only needs the best answer one house back and two houses back.

## Optimal idea
At this house, either skip it (keep prev1) or rob it (prev2 + this money). prev2 is the best that does not include the previous house, so adding x is legal.

## Dry run
[2, 7, 9, 3, 1]. Robbing 2+9+1 = 12, or 7+3 = 10, or 7+1 = 8. The best is 12.

## Walk the code
After computing cur, shift: prev2 becomes the old prev1, prev1 becomes cur. The order of those two assignments matters.

## Complexity and mistakes
O(n) time, O(1) space. Using one variable and adding whenever the neighbor was skipped is easy to get wrong at the edges. The two-variable form is the safe one.`,
    `## Sawal kya hai
Line mein houses hain. Pas wale do rob nahi kar sakte. Maximum paisa.

## Brute force kyun nahi
Har subset exponential hai. Har ghar ko sirf ek peeche aur do peeche ka best chahiye.

## Optimal idea
Is ghar par ya skip karo (prev1), ya rob karo (prev2 + x). prev2 pichhle ghar ko include nahi karta.

## Dry run
[2, 7, 9, 3, 1] par 2+9+1 = 12 best hai.

## Code kaise chalta hai
cur ke baad prev2 = purana prev1, prev1 = cur. In dono assignments ka order maayne rakhta hai.

## Complexity aur galtiyan
O(n) time, O(1) space.`,
  ),
  "coin-change": n(
    "O(amount · coins) time, O(amount) space",
    `class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        const int INF = 1e9;
        vector<int> dp(amount + 1, INF);
        dp[0] = 0;
        for (int a = 1; a <= amount; a++) {
            for (int c : coins) {
                if (c <= a) dp[a] = min(dp[a], dp[a - c] + 1);
            }
        }
        return dp[amount] >= INF ? -1 : dp[amount];
    }
};`,
    `## What is asked
Return the fewest coins that sum to amount. You have infinite copies of each coin. If it is impossible, return -1.

## Why brute force is not the answer
Greedy (always take the largest coin) fails, for example coins 1, 3, 4 and amount 6: greedy takes 4+1+1, but 3+3 is better. Recursion without memory recomputes the same remaining amount.

## Optimal idea
dp[a] is the fewest coins that make amount a. dp[0] = 0. For every amount, try every coin that fits and take 1 + dp[a - coin]. If dp[amount] was never improved, it is impossible.

## Dry run
coins [1, 2, 5], amount 11. dp builds up to 3, which is 5+5+1.

## Walk the code
INF is 1e9, not INT_MAX, so INF + 1 does not overflow when you write dp[a - c] + 1. The check at the end treats anything still at INF as impossible.

## Complexity and mistakes
O(amount · number of coins) time, O(amount) memory. Greedy is not optimal for arbitrary coin sets.`,
    `## Sawal kya hai
Amount banane ke liye kam se kam kitne coins. Har coin infinite hai. Impossible ho to -1.

## Brute force kyun nahi
Greedy galat hai: coins 1, 3, 4 aur amount 6 par 4+1+1 se 3+3 behtar hai. Bina memory ki recursion same amount dobara gin-ti hai.

## Optimal idea
dp[a] = amount a ke liye kam se kam coins. dp[0] = 0. Har amount par har coin try karo: 1 + dp[a - coin].

## Dry run
[1, 2, 5] aur 11 ka jawab 3 hai: 5+5+1.

## Code kaise chalta hai
INF 1e9 hai taaki +1 overflow na kare. End mein INF bacha ho to -1.

## Complexity aur galtiyan
Time O(amount · coins), space O(amount). Greedy arbitrary coins par optimal nahi.`,
  ),
};
