import type { Problem, Topic } from "./types";

type Line = { hinglish: string; english: string; hindi: string };

function problem(p: Omit<Problem, "hints"> & { hints: [string, string, string] }): Problem {
  return p;
}

const readN = (body: string, print: string) => `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){
  ios::sync_with_stdio(false); cin.tie(nullptr);
  int n; if(!(cin>>n)) return 0;
  vector<int> a(n); for(int i=0;i<n;i++) cin>>a[i];
  ${body}
  ${print}
}
`;

export const hrTopic: Topic = {
  id: "hackerrank",
  title: "HackerRank Warmup",
  blurb: "Classic HackerRank-style problems for yuvrajshukla1702 — each one taught slowly, then coded.",
  order: 10,
  problemIds: [
    "hr-simple-array-sum",
    "hr-compare-triplets",
    "hr-very-big-sum",
    "hr-diagonal-difference",
    "hr-plus-minus",
    "hr-staircase",
    "hr-mini-max-sum",
    "hr-cake-candles",
    "hr-time-conversion",
    "hr-grading",
    "hr-sock-merchant",
    "hr-counting-valleys",
  ],
};

export const hrProblems: Record<string, Problem> = {
  "hr-simple-array-sum": problem({
    id: "hr-simple-array-sum",
    title: "Simple Array Sum",
    difficulty: "Easy",
    topic: "hackerrank",
    hackerrankSlug: "simple-array-sum",
    lesson: `# Simple Array Sum

Add every number in the array. One loop, one running total.

Use \`long long\` if the numbers can be large — a habit from day one.`,
    solutionExplain: `Start \`sum = 0\`. For each value, \`sum += a[i]\`. Return sum. Time O(n), space O(1).`,
    solutionCode: `long long simpleArraySum(vector<int>& a) {
    long long sum = 0;
    for (int x : a) sum += x;
    return sum;
}`,
    narration: [
      {
        hinglish: "Pehla HackerRank warmup. Kaam sirf itna hai: array ke saare numbers jod do.",
        english: "First HackerRank warmup. The only job is to add every number in the array.",
        hindi: "पहला हैकररैंक वार्मअप। काम सिर्फ इतना है: ऐरे के सारे नंबर जोड़ दो।",
      },
      {
        hinglish: "sum zero se shuru karo. Har element pe sum plus equal karo. Ek baar scan, O n time.",
        english: "Start sum at zero. Add each element. One scan means linear time and constant extra memory.",
        hindi: "योग को शून्य से शुरू करो। हर एलिमेंट जोड़ो। एक स्कैन मतलब रैखिक समय और स्थिर अतिरिक्त मेमोरी।",
      },
      {
        hinglish: "Example: 1 2 3 4 10 11. Chalte chalte sum 31 ban jaata hai. Ab khud type karo.",
        english: "Example: 1, 2, 3, 4, 10, 11. The running total becomes 31. Now type it yourself.",
        hindi: "उदाहरण: एक, दो, तीन, चार, दस, ग्यारह। चलते-चलते योग इकतीस बन जाता है। अब खुद टाइप करो।",
      },
    ] satisfies Line[],
    starterCode: `long long simpleArraySum(vector<int>& a) {
    return 0;
}`,
    harness: readN("long long ans = simpleArraySum(a);", 'cout<<ans<<"\\n";'),
    tests: [
      { input: "6\n1 2 3 4 10 11\n", expected: "31" },
      { input: "1\n5\n", expected: "5", hidden: true },
    ],
    hints: ["One accumulator.", "Add every a[i].", "long long sum = 0; for (int x : a) sum += x;"],
  }),
  "hr-compare-triplets": problem({
    id: "hr-compare-triplets",
    title: "Compare the Triplets",
    difficulty: "Easy",
    topic: "hackerrank",
    hackerrankSlug: "compare-the-triplets",
    lesson: `# Compare the Triplets

Alice and Bob each have 3 scores. Compare index by index. Higher score gets 1 point. Ties give nobody a point.`,
    solutionExplain: `aPoints and bPoints start at 0. For i in 0..2: if a[i] > b[i] Alice++, else if b bigger Bob++. Print both.`,
    solutionCode: `pair<int,int> compareTriplets(vector<int>& a, vector<int>& b) {
    int A = 0, B = 0;
    for (int i = 0; i < 3; i++) {
        if (a[i] > b[i]) A++;
        else if (a[i] < b[i]) B++;
    }
    return {A, B};
}`,
    narration: [
      {
        hinglish: "Teen teen scores hain Alice aur Bob ke. Same index compare karo.",
        english: "Alice and Bob each have three scores. Compare the same index on both sides.",
        hindi: "ऐलिस और बॉब दोनों के तीन-तीन स्कोर हैं। एक ही इंडेक्स की तुलना करो।",
      },
      {
        hinglish: "Agar Alice bada hai to Alice ko ek point. Bob bada hai to Bob ko ek. Barabar pe koi point nahi.",
        english: "If Alice is greater, Alice gets one point. If Bob is greater, Bob gets one. A tie gives nothing.",
        hindi: "अगर ऐलिस बड़ा है तो ऐलिस को एक अंक। बॉब बड़ा है तो बॉब को एक। बराबर पर कोई अंक नहीं।",
      },
      {
        hinglish: "5 6 7 versus 3 6 10. Pehla Alice, doosra tie, teesra Bob. Answer 1 1.",
        english: "Five, six, seven versus three, six, ten. Alice wins the first, the second ties, Bob wins the third. Answer is 1 1.",
        hindi: "पाँच, छह, सात बनाम तीन, छह, दस। पहला ऐलिस, दूसरा बराबर, तीसरा बॉब। उत्तर एक एक।",
      },
    ],
    starterCode: `pair<int,int> compareTriplets(vector<int>& a, vector<int>& b) {
    return {0, 0};
}`,
    harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){
  vector<int> a(3), b(3);
  for (int i=0;i<3;i++) cin>>a[i];
  for (int i=0;i<3;i++) cin>>b[i];
  auto ans = compareTriplets(a,b);
  cout<<ans.first<<" "<<ans.second<<"\\n";
}`,
    tests: [
      { input: "5 6 7\n3 6 10\n", expected: "1 1" },
      { input: "1 2 3\n1 2 3\n", expected: "0 0" },
    ],
    hints: ["Loop i from 0 to 2.", "Strict greater only.", "Return both point totals."],
  }),
  "hr-very-big-sum": problem({
    id: "hr-very-big-sum",
    title: "A Very Big Sum",
    difficulty: "Easy",
    topic: "hackerrank",
    hackerrankSlug: "a-very-big-sum",
    lesson: `# A Very Big Sum

Same as array sum, but values are around 1e10. \`int\` overflows. Use \`long long\`.`,
    solutionExplain: `The bug students hit is \`int sum\`. Each addend is already bigger than 2^31. Store the accumulator as long long from the first addition.`,
    solutionCode: `long long aVeryBigSum(vector<long long>& a) {
    long long sum = 0;
    for (long long x : a) sum += x;
    return sum;
}`,
    narration: [
      {
        hinglish: "Sum wahi hai, par numbers bahut bade hain. int toot jaayega.",
        english: "This is still a sum, but the numbers are huge. A 32-bit int will overflow.",
        hindi: "योग वही है, पर नंबर बहुत बड़े हैं। इंट टूट जाएगा।",
      },
      {
        hinglish: "long long sum rakho. 1e10 plus 1e10 int mein fit nahi hota.",
        english: "Keep the sum in a long long. Ten to the ten plus ten to the ten does not fit in int.",
        hindi: "योग को लॉन्ग लॉन्ग में रखो। दस की घात दस, इंट में नहीं समाता।",
      },
      {
        hinglish: "Paanch numbers 1000000001 se 1000000005. Total 5000000015.",
        english: "Five numbers from 1000000001 to 1000000005. The total is 5000000015.",
        hindi: "पाँच नंबर एक अरब एक से एक अरब पाँच तक। कुल पाँच अरब पंद्रह।",
      },
    ],
    starterCode: `long long aVeryBigSum(vector<long long>& a) {
    return 0;
}`,
    harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){
  int n; cin>>n; vector<long long> a(n);
  for(int i=0;i<n;i++) cin>>a[i];
  cout<<aVeryBigSum(a)<<"\\n";
}`,
    tests: [
      { input: "5\n1000000001 1000000002 1000000003 1000000004 1000000005\n", expected: "5000000015" },
    ],
    hints: ["Do not use int for the sum.", "long long from the start.", "One loop is enough."],
  }),
  "hr-diagonal-difference": problem({
    id: "hr-diagonal-difference",
    title: "Diagonal Difference",
    difficulty: "Easy",
    topic: "hackerrank",
    hackerrankSlug: "diagonal-difference",
    lesson: `# Diagonal Difference

Square matrix. Primary diagonal is \`a[i][i]\`. Secondary is \`a[i][n-1-i]\`. Return absolute difference of the two sums.`,
    solutionExplain: `One loop. left += a[i][i]; right += a[i][n-1-i]; return abs(left-right).`,
    solutionCode: `int diagonalDifference(vector<vector<int>>& a) {
    int n = (int)a.size(), L = 0, R = 0;
    for (int i = 0; i < n; i++) {
        L += a[i][i];
        R += a[i][n - 1 - i];
    }
    return abs(L - R);
}`,
    narration: [
      {
        hinglish: "Square matrix. Seedha diagonal aur ulta diagonal alag alag jodna hai.",
        english: "Square matrix. Add the main diagonal and the anti-diagonal separately.",
        hindi: "वर्ग मैट्रिक्स। मुख्य विकर्ण और उलटा विकर्ण अलग-अलग जोड़ो।",
      },
      {
        hinglish: "i zero se n minus one. Left mein a i i. Right mein a i, n minus one minus i.",
        english: "i goes from zero to n minus one. Left adds row i column i. Right adds row i column n minus one minus i.",
        hindi: "आई शून्य से एन माइनस एक तक। बाएँ में पंक्ति आई स्तंभ आई। दाएँ में पंक्ति आई, स्तंभ एन माइनस एक माइनस आई।",
      },
      {
        hinglish: "Example mein left 15, right 19. Absolute difference 4.",
        english: "In the sample, the left sum is 15 and the right sum is 19. Absolute difference is 4.",
        hindi: "उदाहरण में बायाँ योग पंद्रह, दायाँ उन्नीस। अंतर का मान चार।",
      },
    ],
    starterCode: `int diagonalDifference(vector<vector<int>>& a) {
    return 0;
}`,
    harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){
  int n; cin>>n;
  vector<vector<int>> a(n, vector<int>(n));
  for(int i=0;i<n;i++) for(int j=0;j<n;j++) cin>>a[i][j];
  cout<<diagonalDifference(a)<<"\\n";
}`,
    tests: [{ input: "3\n11 2 4\n4 5 6\n10 8 -12\n", expected: "4" }],
    hints: ["Two running sums.", "Secondary column is n-1-i.", "Return absolute value."],
  }),
  "hr-plus-minus": problem({
    id: "hr-plus-minus",
    title: "Plus Minus",
    difficulty: "Easy",
    topic: "hackerrank",
    hackerrankSlug: "plus-minus",
    lesson: `# Plus Minus

Count positives, negatives, and zeros. Print each count divided by n, with 6 digits after the decimal.`,
    solutionExplain: `Three counters. Then print pos/n, neg/n, zero/n using fixed 6 decimal places. Ratios are doubles.`,
    solutionCode: `void plusMinus(vector<int>& a) {
    int pos = 0, neg = 0, zer = 0, n = (int)a.size();
    for (int x : a) {
        if (x > 0) pos++;
        else if (x < 0) neg++;
        else zer++;
    }
    cout << fixed << setprecision(6);
    cout << (double)pos / n << "\\n";
    cout << (double)neg / n << "\\n";
    cout << (double)zer / n << "\\n";
}`,
    narration: [
      {
        hinglish: "Teen buckets: positive, negative, zero. Phir ratio n se divide.",
        english: "Three buckets: positive, negative, and zero. Then divide each count by n.",
        hindi: "तीन समूह: धनात्मक, ऋणात्मक, और शून्य। फिर हर गिनती को एन से भाग दो।",
      },
      {
        hinglish: "Print 6 decimal places. 3 positive out of 6 is 0.500000.",
        english: "Print six digits after the decimal. Three positives out of six is 0.500000.",
        hindi: "दशमलव के बाद छह अंक छापो। छह में से तीन धनात्मक का मतलब शून्य दशमलव पाँच।",
      },
    ],
    starterCode: `void plusMinus(vector<int>& a) {
    
}`,
    harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){
  int n; cin>>n; vector<int> a(n);
  for(int i=0;i<n;i++) cin>>a[i];
  plusMinus(a);
}`,
    tests: [
      {
        input: "6\n-4 3 -9 0 4 1\n",
        expected: "0.500000\n0.333333\n0.166667",
      },
    ],
    hints: ["Count three categories.", "Cast to double before dividing.", "setprecision(6) and fixed."],
  }),
  "hr-staircase": problem({
    id: "hr-staircase",
    title: "Staircase",
    difficulty: "Easy",
    topic: "hackerrank",
    hackerrankSlug: "staircase",
    lesson: `# Staircase

For row r from 1 to n, print (n-r) spaces then r hash symbols. Right aligned.`,
    solutionExplain: `Row i (0-based) has n-1-i spaces and i+1 hashes.`,
    solutionCode: `void staircase(int n) {
    for (int i = 0; i < n; i++) {
        cout << string(n - 1 - i, ' ') << string(i + 1, '#') << "\\n";
    }
}`,
    narration: [
      {
        hinglish: "Right aligned hashes. Row ke end mein hash badhte hain, shuru mein spaces kam hote hain.",
        english: "Right aligned hashes. Each next row has one less space and one more hash.",
        hindi: "हैश दाईं ओर सटे हैं। हर अगली पंक्ति में एक स्पेस कम और एक हैश ज़्यादा।",
      },
      {
        hinglish: "n = 4. Pehli line teen space ek hash. Aakhri line char hash, zero space.",
        english: "When n is 4, the first line is three spaces and one hash. The last line is four hashes and no spaces.",
        hindi: "जब एन चार हो, पहली पंक्ति में तीन स्पेस और एक हैश। आखिरी पंक्ति में चार हैश।",
      },
    ],
    starterCode: `void staircase(int n) {
    
}`,
    harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){ int n; cin>>n; staircase(n); }`,
    tests: [
      { input: "4\n", expected: "   #\n  ##\n ###\n####" },
    ],
    hints: ["Loop rows.", "spaces = n - hashes.", "hashes grow from 1 to n."],
  }),
  "hr-mini-max-sum": problem({
    id: "hr-mini-max-sum",
    title: "Mini-Max Sum",
    difficulty: "Easy",
    topic: "hackerrank",
    hackerrankSlug: "mini-max-sum",
    lesson: `# Mini-Max Sum

Five numbers. Minimum sum is total minus the maximum. Maximum sum is total minus the minimum.`,
    solutionExplain: `sum all, track min and max, print sum-max and sum-min. Use long long.`,
    solutionCode: `void miniMaxSum(vector<long long>& a) {
    long long sum = 0, mn = a[0], mx = a[0];
    for (long long x : a) {
        sum += x;
        mn = min(mn, x);
        mx = max(mx, x);
    }
    cout << (sum - mx) << " " << (sum - mn) << "\\n";
}`,
    narration: [
      {
        hinglish: "Paanch numbers. Sabse chhota sum = total minus sabse bada number.",
        english: "Five numbers. The smallest sum of four is the total minus the largest number.",
        hindi: "पाँच नंबर। चार का सबसे छोटा योग, कुल योग में से सबसे बड़े नंबर को हटाने पर मिलता है।",
      },
      {
        hinglish: "1 2 3 4 5. Total 15. Mini 10, maxi 14.",
        english: "One through five total fifteen. Minimum sum is ten, maximum sum is fourteen.",
        hindi: "एक से पाँच का कुल योग पंद्रह। न्यूनतम योग दस, अधिकतम चौदह।",
      },
    ],
    starterCode: `void miniMaxSum(vector<long long>& a) {
    
}`,
    harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){
  vector<long long> a(5);
  for(int i=0;i<5;i++) cin>>a[i];
  miniMaxSum(a);
}`,
    tests: [{ input: "1 2 3 4 5\n", expected: "10 14" }],
    hints: ["Sum, min, max in one pass.", "Print sum-max then sum-min.", "long long."],
  }),
  "hr-cake-candles": problem({
    id: "hr-cake-candles",
    title: "Birthday Cake Candles",
    difficulty: "Easy",
    topic: "hackerrank",
    hackerrankSlug: "birthday-cake-candles",
    lesson: `# Birthday Cake Candles

You can blow out only the tallest candles. Count how many share the maximum height.`,
    solutionExplain: `Find max, then count how many equal max. Or one pass: if taller, reset count to 1; if equal, count++.`,
    solutionCode: `int birthdayCakeCandles(vector<int>& a) {
    int mx = *max_element(a.begin(), a.end());
    int cnt = 0;
    for (int x : a) if (x == mx) cnt++;
    return cnt;
}`,
    narration: [
      {
        hinglish: "Sirf sabse lambi candles bujha sakte ho. Unki count chahiye.",
        english: "You can blow out only the tallest candles. Count how many have that height.",
        hindi: "सिर्फ सबसे लंबी मोमबत्तियाँ बुझा सकते हो। उनकी गिनती चाहिए।",
      },
      {
        hinglish: "3 2 1 3. Max 3, do baar aaya. Answer 2.",
        english: "Heights 3, 2, 1, 3. The max is 3 and it appears twice. Answer 2.",
        hindi: "ऊँचाई तीन, दो, एक, तीन। अधिकतम तीन है और दो बार आया। उत्तर दो।",
      },
    ],
    starterCode: `int birthdayCakeCandles(vector<int>& a) {
    return 0;
}`,
    harness: readN("int ans = birthdayCakeCandles(a);", 'cout<<ans<<"\\n";'),
    tests: [{ input: "4\n3 2 1 3\n", expected: "2" }],
    hints: ["Find the maximum height.", "Count equals to that height.", "One or two passes both fine."],
  }),
  "hr-time-conversion": problem({
    id: "hr-time-conversion",
    title: "Time Conversion",
    difficulty: "Easy",
    topic: "hackerrank",
    hackerrankSlug: "time-conversion",
    lesson: `# Time Conversion

12-hour \`hh:mm:ssAM/PM\` to 24-hour. 12 AM is 00. 12 PM stays 12. PM adds 12 except for 12 itself.`,
    solutionExplain: `Read hour, minute, second, and the AM/PM suffix. If PM and hour != 12, hour += 12. If AM and hour == 12, hour = 0. Print with leading zeros.`,
    solutionCode: `string timeConversion(string s) {
    int hh = stoi(s.substr(0, 2));
    string rest = s.substr(2, 6);
    string ap = s.substr(8, 2);
    if (ap == "AM") {
        if (hh == 12) hh = 0;
    } else if (hh != 12) hh += 12;
    char buf[16];
    snprintf(buf, sizeof(buf), "%02d%s", hh, rest.c_str());
    return buf;
}`,
    narration: [
      {
        hinglish: "12 hour clock ko 24 hour mein badalna hai. AM PM suffix hata dena.",
        english: "Convert 12-hour time to 24-hour time and drop the AM or PM suffix.",
        hindi: "बारह घंटे वाली घड़ी को चौबीस घंटे में बदलो और एएम पीएम हटा दो।",
      },
      {
        hinglish: "12 AM matlab 00. 12 PM matlab 12. Baaki PM mein 12 jod do.",
        english: "12 AM becomes 00. 12 PM stays 12. Every other PM hour gets plus 12.",
        hindi: "बारह एएम का मतलब शून्य शून्य। बारह पीएम बारह ही रहता है। बाकी पीएम में बारह जोड़ो।",
      },
      {
        hinglish: "07:05:45PM becomes 19:05:45. Minute second same rehte hain.",
        english: "07:05:45PM becomes 19:05:45. Minutes and seconds stay the same.",
        hindi: "सात बजकर पाँच मिनट पैंतालीस सेकंड पीएम, उन्नीस बजकर पाँच मिनट पैंतालीस सेकंड बनता है।",
      },
    ],
    starterCode: `string timeConversion(string s) {
    return s;
}`,
    harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){ string s; cin>>s; cout<<timeConversion(s)<<"\\n"; }`,
    tests: [
      { input: "07:05:45PM\n", expected: "19:05:45" },
      { input: "12:00:00AM\n", expected: "00:00:00" },
      { input: "12:00:00PM\n", expected: "12:00:00", hidden: true },
    ],
    hints: ["Special-case hour 12.", "PM adds 12 when hour is not 12.", "Print hour with two digits."],
  }),
  "hr-grading": problem({
    id: "hr-grading",
    title: "Grading Students",
    difficulty: "Easy",
    topic: "hackerrank",
    hackerrankSlug: "grading",
    lesson: `# Grading Students

If grade < 38, leave it. Else round up to next multiple of 5 when the gap is less than 3.`,
    solutionExplain: `next = ((grade/5)+1)*5. If next-grade < 3 and grade >= 38, grade = next.`,
    solutionCode: `vector<int> gradingStudents(vector<int>& grades) {
    for (int& g : grades) {
        if (g < 38) continue;
        int next = ((g / 5) + 1) * 5;
        if (next - g < 3) g = next;
    }
    return grades;
}`,
    narration: [
      {
        hinglish: "38 se kam grade change nahi hota. Warna agle 5 ke multiple se 3 se kam door ho to round up.",
        english: "Grades below 38 stay the same. Otherwise, if the next multiple of 5 is less than 3 away, round up.",
        hindi: "अड़तीस से कम ग्रेड नहीं बदलता। वरना अगर अगला पाँच का गुणज तीन से कम दूर है तो ऊपर राउंड करो।",
      },
      {
        hinglish: "73 next 75, gap 2, so 75. 67 next 70 gap 3, not less than 3, stays 67. 38 becomes 40. 33 stays.",
        english: "73 is 2 away from 75, so it becomes 75. 67 is 3 away from 70, so it stays 67. 38 becomes 40. 33 stays.",
        hindi: "तिहत्तर, पचहत्तर से दो दूर है, इसलिए पचहत्तर। सड़सठ, सत्तर से तीन दूर है, इसलिए सड़सठ रहता है। अड़तीस चालीस बनता है। तैंतीस वही रहता है।",
      },
    ],
    starterCode: `vector<int> gradingStudents(vector<int>& grades) {
    return grades;
}`,
    harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){
  int n; cin>>n; vector<int> a(n);
  for(int i=0;i<n;i++) cin>>a[i];
  auto ans = gradingStudents(a);
  for(int i=0;i<n;i++){ if(i) cout<<" "; cout<<ans[i]; }
  cout<<"\\n";
}`,
    tests: [{ input: "4\n73 67 38 33\n", expected: "75 67 40 33" }],
    hints: ["Skip grades under 38.", "Next multiple of 5.", "Round only if difference is 1 or 2."],
  }),
  "hr-sock-merchant": problem({
    id: "hr-sock-merchant",
    title: "Sock Merchant",
    difficulty: "Easy",
    topic: "hackerrank",
    hackerrankSlug: "sock-merchant",
    lesson: `# Sock Merchant

Count frequencies of each color. Each pair is freq divided by 2. Sum the pairs.`,
    solutionExplain: `unordered_map or a small map. pairs += count[color] / 2.`,
    solutionCode: `int sockMerchant(vector<int>& a) {
    unordered_map<int,int> f;
    for (int x : a) f[x]++;
    int pairs = 0;
    for (auto& [c, k] : f) pairs += k / 2;
    return pairs;
}`,
    narration: [
      {
        hinglish: "Same color ke do socks ek pair. Frequency map banao, har color ka count divide by 2.",
        english: "Two socks of the same color make one pair. Build a frequency map and add count divided by two for each color.",
        hindi: "एक ही रंग के दो मोज़े एक जोड़ी। फ़्रीक्वेंसी मैप बनाओ और हर रंग की गिनती को दो से भाग दो।",
      },
      {
        hinglish: "10 chaar baar, 20 teen baar, 30 ek, 50 ek. Pairs 2 plus 1 = 3.",
        english: "Color 10 appears four times, 20 three times, 30 once, 50 once. Pairs are 2 plus 1, which is 3.",
        hindi: "रंग दस चार बार, बीस तीन बार, तीस एक, पचास एक। जोड़ियाँ दो जमा एक, यानी तीन।",
      },
    ],
    starterCode: `int sockMerchant(vector<int>& a) {
    return 0;
}`,
    harness: readN("int ans = sockMerchant(a);", 'cout<<ans<<"\\n";'),
    tests: [{ input: "9\n10 20 20 10 10 30 50 10 20\n", expected: "3" }],
    hints: ["Count each color.", "Integer division by 2 drops the leftover sock.", "Sum over colors."],
  }),
  "hr-counting-valleys": problem({
    id: "hr-counting-valleys",
    title: "Counting Valleys",
    difficulty: "Easy",
    topic: "hackerrank",
    hackerrankSlug: "counting-valleys",
    lesson: `# Counting Valleys

U is +1, D is -1. A valley is a step sequence that starts below sea level and returns to 0.`,
    solutionExplain: `Track altitude. When a step brings you from -1 to 0, you just finished a valley.`,
    solutionCode: `int countingValleys(string path) {
    int alt = 0, valleys = 0;
    for (char c : path) {
        int prev = alt;
        alt += (c == 'U' ? 1 : -1);
        if (prev < 0 && alt == 0) valleys++;
    }
    return valleys;
}`,
    narration: [
      {
        hinglish: "Sea level zero. U up, D down. Valley tab count hoti hai jab neeche se wapas zero aao.",
        english: "Sea level is zero. U goes up, D goes down. Count a valley when you return to zero from below.",
        hindi: "समुद्र तल शून्य है। यू ऊपर, डी नीचे। घाटी तब गिनो जब नीचे से वापस शून्य पर आओ।",
      },
      {
        hinglish: "UDDDUDUU. Neeche jaake ek baar zero pe wapas aate ho. Answer 1.",
        english: "Path U D D D U D U U. You go below and come back to zero once. Answer is 1.",
        hindi: "रास्ता यू डी डी डी यू डी यू यू। एक बार नीचे जाकर शून्य पर लौटते हो। उत्तर एक।",
      },
    ],
    starterCode: `int countingValleys(string path) {
    return 0;
}`,
    harness: `#include <bits/stdc++.h>
using namespace std;
{{CODE}}
int main(){
  int n; string s; cin>>n>>s;
  cout<<countingValleys(s)<<"\\n";
}`,
    tests: [{ input: "8\nUDDDUDUU\n", expected: "1" }],
    hints: ["Altitude starts at 0.", "U +1, D -1.", "Valley ends when altitude returns to 0 from negative."],
  }),
};
