import type { Problem } from "./types";
import { extraGuides } from "./solution-guides-bank";

export type SolutionGuide = {
  english: string;
  hinglish: string;
  hindi: string;
  code: string;
  complexity: string;
};

type Note = {
  cx: string;
  code: string;
  en: string;
  hi: string;
};

function note(cx: string, code: string, en: string, hi: string): Note {
  return { cx, code: code.trim(), en: en.trim(), hi: hi.trim() };
}

const GUIDES: Record<string, Note> = {
  "two-sum": note(
    "O(n) time, O(n) space",
    `class Solution {
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
};`,
    `## What is asked
You are given an array of integers and a target. Return the **indices** of the two numbers that add up to the target. There is exactly one answer, and you may not use the same index twice.

## Why brute force is not the answer
The nested loop checks every pair. It is correct, but it is O(n²). In an interview that reads as "I did not look for structure."

## Optimal idea
Scan once from left to right. For the value at i, the partner you still need is \`target - nums[i]\`. Ask a hash map whether that partner was already seen. If yes, return the stored index and i. If no, store the current value with its index. The lookup is inserted **after** the check, so a value is never paired with itself.

## Dry run
nums = [2, 7, 11, 15], target = 9.
- i = 0, value 2, need 7. Map is empty. Store 2 → 0.
- i = 1, value 7, need 2. Map has 2 at index 0. Return [0, 1].

## Walk the code
\`seen\` maps a value to the index where it appeared. \`need\` is the complement. \`count\` is the O(1) question "have I seen this?". The return order is the earlier index first, then i.

## Complexity and mistakes
Time is O(n) because each index is visited once and the map operation is average O(1). Extra memory is O(n). The usual bug is inserting the value before the lookup, which breaks the case of two equal numbers that are allowed only at different indices, or returning values instead of indices.`,
    `## Sawal kya hai
Array aur target diya hai. Do aise **indices** return karo jin par values ka sum target ke barabar ho. Ek index do baar use nahi kar sakte.

## Brute force kyun nahi
Har pair check karna sahi hai, par O(n²) hai. Interview mein yeh sunai deta hai ki tumne behtar structure nahi dhunda.

## Optimal idea
Ek baar left se right scan karo. Index i par partner \`target - nums[i]\` hai. Hash map se poocho: yeh partner pehle dikha tha kya? Haan, to uska index aur i return karo. Nahi, to current value ko uske index ke saath store karo. Lookup **insert se pehle** hoti hai, isliye number apne aap se pair nahi hota.

## Dry run
nums = [2, 7, 11, 15], target = 9.
- i = 0, value 2, need 7. Map khali. 2 → 0 store.
- i = 1, value 7, need 2. Map mein 2 index 0 par hai. [0, 1] return.

## Code kaise chalta hai
\`seen\` value se index map hai. \`need\` complement hai. \`count\` poochta hai "pehle dekha hai?". Pehle wala index, phir i return hota hai.

## Complexity aur galtiyan
Time O(n), extra memory O(n). Common bug: value pehle insert kar dena, ya indices ki jagah values return kar dena.`,
  ),
  "two-sum-hash": note(
    "O(n) time, O(n) space",
    `class Solution {
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
};`,
    `## What is asked
Same Two Sum contract: return indices of two values that sum to target.

## Why brute force is not the answer
Two nested loops recompute pairs you could have remembered.

## Optimal idea
One hash map from value to index. Complement first, insert second. This drill exists so the map pattern is automatic.

## Dry run
On [3, 2, 4] with target 6: 3 is stored at 0, 2 is stored at 1, 4 needs 2 and hits index 1. Answer [1, 2].

## Walk the code
The loop body is three lines with a fixed order: compute need, return on a hit, otherwise remember nums[i].

## Complexity and mistakes
O(n) time, O(n) space. Do not sort if the caller wants original indices, unless you also store the indices and sort those.`,
    `## Sawal kya hai
Two Sum hi hai: target banane wale do indices.

## Brute force kyun nahi
Nested loop wahi pairs dobara check karta hai jo map yaad rakh sakta tha.

## Optimal idea
Value → index map. Pehle complement dhundo, phir insert. Yeh drill isliye hai ki pattern haath mein aa jaaye.

## Dry run
[3, 2, 4], target 6. 3 index 0, 2 index 1, 4 ko 2 chahiye jo index 1 par hai. Jawab [1, 2].

## Code kaise chalta hai
Teen kaam, isi order mein: need nikalo, hit par return, warna nums[i] yaad rakho.

## Complexity aur galtiyan
O(n) time, O(n) space. Original indices chahiye to seedha sort mat karo.`,
  ),
  "contains-duplicate": note(
    "O(n) time, O(n) space",
    `class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        unordered_set<int> seen;
        for (int x : nums) {
            if (seen.count(x)) return true;
            seen.insert(x);
        }
        return false;
    }
};`,
    `## What is asked
Return true if any value appears at least twice. Otherwise return false.

## Why brute force is not the answer
Comparing every pair is O(n²). Sorting then checking neighbors is O(n log n) and also correct, but the interview default is a set.

## Optimal idea
A set answers "have I seen this value?" in average O(1). The moment insert would repeat a value, you are done.

## Dry run
[1, 2, 3, 1]. Insert 1, 2, 3. The second 1 is already in the set, so return true. [1, 2, 3, 4] inserts four new values and returns false.

## Walk the code
\`count\` before \`insert\` is the whole algorithm. Early return avoids scanning the rest.

## Complexity and mistakes
O(n) time, O(n) memory. A single-element array is false. Do not return true just because the set size is smaller after the loop if you already can return inside the loop.`,
    `## Sawal kya hai
Koi value kam se kam do baar aayi ho to true, warna false.

## Brute force kyun nahi
Har pair O(n²) hai. Sort karke padosi check karna O(n log n) sahi hai, par interview ka default set hai.

## Optimal idea
Set batata hai "yeh value pehle aayi hai?". Repeat milte hi true.

## Dry run
[1, 2, 3, 1] mein doosra 1 set mein hai, true. [1, 2, 3, 4] mein koi repeat nahi, false.

## Code kaise chalta hai
Pehle \`count\`, phir \`insert\`. Hit par baaki array dekhne ki zaroorat nahi.

## Complexity aur galtiyan
O(n) time, O(n) memory. Ek element par false hota hai.`,
  ),
  "best-time-stock": note(
    "O(n) time, O(1) space",
    `class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int best = 0;
        int cheap = INT_MAX;
        for (int p : prices) {
            cheap = min(cheap, p);
            best = max(best, p - cheap);
        }
        return best;
    }
};`,
    `## What is asked
You may buy one day and sell on a later day. Return the maximum profit. If no profit is possible, return 0.

## Why brute force is not the answer
Every buy day with every later sell day is O(n²). You only need the cheapest buy so far.

## Optimal idea
Keep the minimum price seen before today. Today's profit is price minus that minimum. Track the best profit. The buy is always in the past because the minimum is updated as you scan forward, and selling today uses the minimum from earlier days including today, which gives profit 0 and does not hurt the max.

## Dry run
[7, 1, 5, 3, 6, 4]. After 7, cheap is 7. At 1, cheap becomes 1. At 5, profit 4. At 6, profit 5. Answer 5. A falling array such as [7, 6, 4, 3, 1] never beats 0.

## Walk the code
\`cheap\` starts at INT_MAX so the first price becomes the minimum. \`best\` starts at 0 because we cannot be forced into a loss.

## Complexity and mistakes
O(n) time, O(1) memory. Do not sell before you buy, and do not reset the minimum after a profit.`,
    `## Sawal kya hai
Ek baar kharido, baad ke din becho. Maximum profit. Profit na ho to 0.

## Brute force kyun nahi
Har buy ke saath har baad ka sell O(n²) hai. Sirf ab tak ka sabse sasta buy kaafi hai.

## Optimal idea
Ab tak ka minimum price rakho. Aaj ka profit = price - minimum. Best profit update karte jao.

## Dry run
[7, 1, 5, 3, 6, 4]. Cheap 1 par rukta hai. 6 - 1 = 5, yahi answer. Girti hui prices par answer 0.

## Code kaise chalta hai
\`cheap\` INT_MAX se shuru, pehli price minimum ban jaati hai. \`best\` 0 se shuru kyunki loss lena allowed nahi.

## Complexity aur galtiyan
O(n) time, O(1) space. Profit ke baad minimum reset mat karo.`,
  ),
  "plus-one": note(
    "O(n) time, O(1) extra space",
    `class Solution {
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
};`,
    `## What is asked
The array is a decimal number, most significant digit first. Add one and return the new digits.

## Why brute force is not the answer
Converting the whole array to an integer overflows on long inputs. Do the addition on the digits themselves.

## Optimal idea
Walk from the last digit. If it is less than 9, increment it and stop. If it is 9, it becomes 0 and the carry continues. If every digit was 9, insert a leading 1.

## Dry run
[1, 2, 9] becomes [1, 3, 0]. [9, 9] becomes [1, 0, 0].

## Walk the code
The early return is the "no more carry" case. The insert runs only when the loop finishes, which means every digit rolled over.

## Complexity and mistakes
O(n) time. Extra memory is O(1) besides the possible one new digit. Do not add one to the first digit.`,
    `## Sawal kya hai
Array ek decimal number hai, pehla digit sabse bada. Usme 1 jodo.

## Brute force kyun nahi
Poori array ko integer banana lambi input par overflow karega. Addition digits par hi karo.

## Optimal idea
Aakhri digit se chalo. 9 se chhoti ho to +1 karke ruk jao. 9 ho to 0 karo aur carry aage. Saare 9 hon to aage 1 insert karo.

## Dry run
[1, 2, 9] → [1, 3, 0]. [9, 9] → [1, 0, 0].

## Code kaise chalta hai
Early return matlab carry khatam. Loop poora khatam ho to har digit 0 ho chuki hai, isliye aage 1 lagao.

## Complexity aur galtiyan
O(n) time. Pehle digit mein 1 mat jodo jab tak carry wahan pahunche.`,
  ),
  "move-zeroes": note(
    "O(n) time, O(1) space",
    `class Solution {
public:
    void moveZeroes(vector<int>& nums) {
        int w = 0;
        for (int x : nums) {
            if (x != 0) nums[w++] = x;
        }
        while (w < (int)nums.size()) nums[w++] = 0;
    }
};`,
    `## What is asked
Move every zero to the end. Keep the relative order of the non-zero numbers. Do it in place.

## Why brute force is not the answer
Building a second array is easy and uses O(n) extra memory. The in-place version is the one interviews want.

## Optimal idea
\`w\` is the next slot that should hold a non-zero. Read every value. When it is non-zero, write it at \`w\` and advance \`w\`. After the scan, every index from \`w\` to the end is a zero.

## Dry run
[0, 1, 0, 3, 12]. Writes land as 1, then 3, then 12. \`w\` is 3. The tail becomes zeros: [1, 3, 12, 0, 0].

## Walk the code
The first loop compacts non-zeros. The second loop only fills zeros. Order is preserved because writes happen in the same order as reads.

## Complexity and mistakes
O(n) time, O(1) extra memory. Swapping with a slow pointer is the same idea. Do not stable-sort, that is slower and unnecessary.`,
    `## Sawal kya hai
Zeroes ko end mein bhejo. Non-zero ka order same rahe. In place.

## Brute force kyun nahi
Nayi array banana O(n) extra memory hai. Interview in-place chahta hai.

## Optimal idea
\`w\` agla slot hai jahan non-zero likhna hai. Non-zero mile to wahan likho aur w badhao. Scan ke baad w se end tak zero bharo.

## Dry run
[0, 1, 0, 3, 12] se likhta hai 1, 3, 12. Phir tail zero. Result [1, 3, 12, 0, 0].

## Code kaise chalta hai
Pehla loop non-zero chipkata hai. Doosra loop zero bharta hai. Order isliye bacha rehta hai kyunki write, read ke order mein hota hai.

## Complexity aur galtiyan
O(n) time, O(1) extra. Sort mat karo.`,
  ),
  "rotate-array": note(
    "O(n) time, O(1) space",
    `class Solution {
public:
    void rotate(vector<int>& nums, int k) {
        int n = (int)nums.size();
        if (n == 0) return;
        k %= n;
        reverse(nums.begin(), nums.end());
        reverse(nums.begin(), nums.begin() + k);
        reverse(nums.begin() + k, nums.end());
    }
};`,
    `## What is asked
Rotate the array to the right by k steps, in place.

## Why brute force is not the answer
Rotating by one, k times, is O(n·k). An extra array is O(n) memory. Three reverses do it in O(n) time and O(1) extra memory.

## Optimal idea
Reverse the whole array, then reverse the first k elements, then reverse the rest. k is taken modulo n because n rotations do nothing.

## Dry run
[1, 2, 3, 4, 5], k = 2. Whole reverse: [5, 4, 3, 2, 1]. First 2: [4, 5, 3, 2, 1]. The tail: [4, 5, 1, 2, 3].

## Walk the code
\`k %= n\` kills full cycles. The three reverse ranges are [0, n), [0, k), [k, n).

## Complexity and mistakes
O(n) time, O(1) extra. Forgetting the modulo makes k larger than n crash the second reverse.`,
    `## Sawal kya hai
Array ko right ki taraf k steps ghumao, in place.

## Brute force kyun nahi
Ek-ek karke k baar ghumana O(n·k) hai. Teen reverse O(n) time aur O(1) extra memory mein ho jaata hai.

## Optimal idea
Poora reverse, phir pehle k elements reverse, phir baaki reverse. k ko n se mod karo.

## Dry run
[1, 2, 3, 4, 5], k = 2. Ant mein [4, 5, 1, 2, 3].

## Code kaise chalta hai
\`k %= n\` poore chakkar hataata hai. Teen ranges: poora, pehle k, aur uske baad.

## Complexity aur galtiyan
O(n) time, O(1) extra. Mod bhoolne par k n se bada ho sakta hai.`,
  ),
  "maximum-subarray": note(
    "O(n) time, O(1) space",
    `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int best = nums[0];
        int cur = nums[0];
        for (int i = 1; i < (int)nums.size(); i++) {
            cur = max(nums[i], cur + nums[i]);
            best = max(best, cur);
        }
        return best;
    }
};`,
    `## What is asked
Return the largest sum of any contiguous subarray. The array can contain negatives, so the answer can be negative.

## Why brute force is not the answer
Every start and end is O(n²). Kadane throws away a prefix the moment it hurts.

## Optimal idea
\`cur\` is the best sum of a subarray that ends at this index. It is either the number itself, or the number added to the previous \`cur\`. \`best\` is the maximum \`cur\` seen anywhere.

## Dry run
[-2, 1, -3, 4, -1, 2, 1, -5, 4]. After -2, both are -2. At 1, restarting wins. From 4 the running sum reaches 6 on the segment [4, -1, 2, 1]. Answer 6.

## Walk the code
Start both variables at nums[0] so an all-negative array still returns the largest element. The loop begins at index 1.

## Complexity and mistakes
O(n) time, O(1) memory. Starting \`best\` at 0 is wrong when every number is negative.`,
    `## Sawal kya hai
Kisi bhi lagatar subarray ka sabse bada sum. Negatives ho sakte hain, isliye answer negative bhi ho sakta hai.

## Brute force kyun nahi
Har start aur end O(n²) hai. Kadane us prefix ko chhod deta hai jo nuksan kare.

## Optimal idea
\`cur\` is subarray ka best sum jo is index par khatam hota hai. Ya toh sirf yeh number, ya pichhle cur ke saath. \`best\` ab tak ka max cur hai.

## Dry run
[-2, 1, -3, 4, -1, 2, 1, -5, 4] par segment [4, -1, 2, 1] ka sum 6 hai.

## Code kaise chalta hai
Dono variables nums[0] se shuru, taaki saare negative hon to bhi sabse bada element mile. Loop index 1 se.

## Complexity aur galtiyan
O(n) time, O(1) space. \`best = 0\` galat hai jab saare numbers negative hon.`,
  ),
};

export function guideForProblem(problem: Problem): SolutionGuide {
  const hit = GUIDES[problem.id] || extraGuides[problem.id];
  if (hit) {
    return {
      english: hit.en,
      hinglish: hit.hi,
      hindi: hindiFromGuide(problem, hit.en, hit.hi),
      code: hit.code,
      complexity: hit.cx,
    };
  }
  return synthesize(problem);
}

/** Devanagari companion: narration when present, else a short mirror of the Hinglish guide. */
function hindiFromGuide(problem: Problem, english: string, hinglish: string) {
  const fromNarration = (problem.narration || [])
    .map((n, i) => `${i + 1}. ${n.hindi}`)
    .filter((line) => line.length > 3)
    .join("\n");
  if (fromNarration) {
    return [
      `## ${problem.title}`,
      ``,
      `## शिक्षक की बात`,
      fromNarration,
      ``,
      `## और विस्तार`,
      `नीचे वही विचार है जो हिंग्लिश गाइड में है — पहले आइडिया समझो, फिर कोड।`,
      hinglish
        .replace(/^## /gm, "### ")
        .slice(0, 1800),
    ].join("\n");
  }
  return [
    `## ${problem.title}`,
    ``,
    `## क्या पूछा गया है`,
    `समस्या को अंग्रेज़ी या हिंग्लिश गाइड से पढ़ो। यहाँ छोटा सार है।`,
    ``,
    `## मुख्य आइडिया`,
    hinglish.split("\n").slice(0, 24).join("\n") || english.split("\n").slice(0, 16).join("\n"),
    ``,
    `## सलाह`,
    `पहले Easy तरीका सोचो, फिर Medium, फिर Best। कोड वॉक वीडियो में लाइन-बाय-लाइन सुनो।`,
  ].join("\n");
}

function synthesize(problem: Problem): SolutionGuide {
  const code = problem.solutionCode || "";
  const lesson = problem.lesson.replace(/^# .+\n+/, "").trim();
  const narrationEn = (problem.narration || []).map((n, i) => `${i + 1}. ${n.english}`).join("\n");
  const narrationHi = (problem.narration || []).map((n, i) => `${i + 1}. ${n.hinglish}`).join("\n");
  const explain = problem.solutionExplain || "";
  const english = [
    `## What is asked`,
    lesson || problem.title,
    ``,
    `## Optimal idea`,
    explain || problem.hints[1],
    ``,
    `## How to get there`,
    `1. ${problem.hints[0]}`,
    `2. ${problem.hints[1]}`,
    `3. ${problem.hints[2]}`,
    narrationEn ? `\n## Spoken walkthrough\n${narrationEn}` : "",
    ``,
    `## Complexity`,
    `Use the pattern in the code below. One pass or a shrinking window is the usual optimal bound for this problem. Do not stop at the first idea if it is a nested loop.`,
  ].join("\n");
  const hinglish = [
    `## Sawal kya hai`,
    `${problem.title}. Neeche wahi idea hai, simple words mein.`,
    lesson || problem.hints[0],
    ``,
    `## Optimal idea`,
    explain || problem.hints[1],
    ``,
    `## Kaise pahunchte hain`,
    `1. ${problem.hints[0]}`,
    `2. ${problem.hints[1]}`,
    `3. ${problem.hints[2]}`,
    narrationHi ? `\n## Teacher ki lines\n${narrationHi}` : "",
    ``,
    `## Complexity`,
    `Code wahi optimal pattern hai. Nested loop par mat ruko agar ek pass ya window kaam kare.`,
  ].join("\n");
  return {
    english,
    hinglish,
    hindi: hindiFromGuide(problem, english, hinglish),
    code,
    complexity: "See the walkthrough — prefer the linear or logarithmic pattern over a nested loop.",
  };
}
