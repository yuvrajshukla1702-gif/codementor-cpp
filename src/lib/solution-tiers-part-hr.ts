import { T, type TierSolution } from "./solution-tiers-shared";

export const HAND_HR: Record<
  string,
  { easy: TierSolution; medium: TierSolution; best: TierSolution }
> = {
  "hr-simple-array-sum": T(
    {
      blurb: "Index loop. sum zero se, har a[i] jodo.",
      blurbEn: "Indexed loop. Start sum at zero, add every a[i].",
      complexity: "O(n) time, O(1) space",
      why: "Beginner style: i zero se n-1, clearly dikhta hai kya add ho raha hai.",
      whyEn: "Beginner style: i from 0 to n-1 makes every add step obvious.",
      code: `long long simpleArraySum(vector<int>& a) {
    long long sum = 0;
    int n = (int)a.size();
    for (int i = 0; i < n; i++) {
        sum = sum + a[i];
    }
    return sum;
}`,
    },
    {
      blurb: "Range-for. Har element seedha sum mein.",
      blurbEn: "Range-for. Add each element directly.",
      complexity: "O(n) time, O(1) space",
      why: "Index ki zaroorat nahi — sirf values chahiye, to range-for clean hai.",
      whyEn: "No index needed — only values matter, so range-for is cleaner.",
      code: `long long simpleArraySum(vector<int>& a) {
    long long sum = 0;
    for (int x : a) sum += x;
    return sum;
}`,
    },
    {
      blurb: "accumulate — STL one-liner feel.",
      blurbEn: "accumulate — idiomatic STL sum.",
      complexity: "O(n) time, O(1) space",
      why: "Library sum helper: intent clear, interview mein bhi chalega.",
      whyEn: "Library sum helper: intent is clear and fine in interviews.",
      code: `long long simpleArraySum(vector<int>& a) {
    return accumulate(a.begin(), a.end(), 0LL);
}`,
    },
  ),

  "hr-compare-triplets": T(
    {
      blurb: "Teen index alag alag compare — verbose ifs.",
      blurbEn: "Compare three indices with clear ifs.",
      complexity: "O(1) time, O(1) space",
      why: "Har category alag line pe: Alice bada / Bob bada / tie. Logic crystal clear.",
      whyEn: "Each category on its own line: Alice wins / Bob wins / tie. Crystal clear.",
      code: `pair<int,int> compareTriplets(vector<int>& a, vector<int>& b) {
    int A = 0, B = 0;
    for (int i = 0; i < 3; i++) {
        if (a[i] > b[i]) {
            A = A + 1;
        } else if (a[i] < b[i]) {
            B = B + 1;
        }
    }
    return {A, B};
}`,
    },
    {
      blurb: "Same loop, compact ++.",
      blurbEn: "Same loop, compact increments.",
      complexity: "O(1) time, O(1) space",
      why: "Same idea, shorter: A++ / B++. Ties ignore.",
      whyEn: "Same idea, shorter: A++ / B++. Ties ignored.",
      code: `pair<int,int> compareTriplets(vector<int>& a, vector<int>& b) {
    int A = 0, B = 0;
    for (int i = 0; i < 3; i++) {
        if (a[i] > b[i]) A++;
        else if (a[i] < b[i]) B++;
    }
    return {A, B};
}`,
    },
    {
      blurb: "Idiom: short loop, return brace pair.",
      blurbEn: "Idiomatic short loop, brace-return pair.",
      complexity: "O(1) time, O(1) space",
      why: "Official style: tight comparison loop, return {A,B}.",
      whyEn: "Official style: tight comparison loop, return {A,B}.",
      code: `pair<int,int> compareTriplets(vector<int>& a, vector<int>& b) {
    int A = 0, B = 0;
    for (int i = 0; i < 3; i++) {
        if (a[i] > b[i]) A++;
        else if (a[i] < b[i]) B++;
    }
    return {A, B};
}`,
    },
  ),


  "hr-very-big-sum": T(
    {
      blurb: "long long sum + indexed for. int mat use karo.",
      blurbEn: "long long sum + indexed for. Do not use int.",
      complexity: "O(n) time, O(1) space",
      why: "Numbers ~1e10 — accumulator pehle din se long long rakho.",
      whyEn: "Values ~1e10 — keep the accumulator as long long from day one.",
      code: `long long aVeryBigSum(vector<long long>& a) {
    long long sum = 0;
    int n = (int)a.size();
    for (int i = 0; i < n; i++) {
        sum = sum + a[i];
    }
    return sum;
}`,
    },
    {
      blurb: "Range-for long long elements.",
      blurbEn: "Range-for over long long elements.",
      complexity: "O(n) time, O(1) space",
      why: "Cleaner add loop; type already long long.",
      whyEn: "Cleaner add loop; element type is already long long.",
      code: `long long aVeryBigSum(vector<long long>& a) {
    long long sum = 0;
    for (long long x : a) sum += x;
    return sum;
}`,
    },
    {
      blurb: "accumulate — STL sum, long long seed.",
      blurbEn: "accumulate — STL sum with long long seed.",
      complexity: "O(n) time, O(1) space",
      why: "0LL seed se overflow avoid — idiomatic STL.",
      whyEn: "0LL seed avoids overflow — idiomatic STL.",
      code: `long long aVeryBigSum(vector<long long>& a) {
    return accumulate(a.begin(), a.end(), 0LL);
}`,
    },
  ),

  "hr-diagonal-difference": T(
    {
      blurb: "Do loops feel: pehle left diagonal, phir right.",
      blurbEn: "Two-pass feel: primary diagonal, then secondary.",
      complexity: "O(n) time, O(1) space",
      why: "Pehle a[i][i] jodo, phir a[i][n-1-i]. Abs difference.",
      whyEn: "First sum a[i][i], then a[i][n-1-i]. Absolute difference.",
      code: `int diagonalDifference(vector<vector<int>>& a) {
    int n = (int)a.size();
    int L = 0;
    int R = 0;
    for (int i = 0; i < n; i++) {
        L = L + a[i][i];
    }
    for (int i = 0; i < n; i++) {
        R = R + a[i][n - 1 - i];
    }
    int diff = L - R;
    if (diff < 0) diff = -diff;
    return diff;
}`,
    },
    {
      blurb: "Ek loop dono diagonals.",
      blurbEn: "One loop for both diagonals.",
      complexity: "O(n) time, O(1) space",
      why: "Same i pe left aur right dono update — half work feel.",
      whyEn: "Update left and right on the same i — one pass.",
      code: `int diagonalDifference(vector<vector<int>>& a) {
    int n = (int)a.size(), L = 0, R = 0;
    for (int i = 0; i < n; i++) {
        L += a[i][i];
        R += a[i][n - 1 - i];
    }
    return abs(L - R);
}`,
    },
    {
      blurb: "abs(L-R) — idiomatic one-pass.",
      blurbEn: "abs(L-R) — idiomatic one-pass.",
      complexity: "O(n) time, O(1) space",
      why: "Official style: one loop + abs.",
      whyEn: "Official style: one loop + abs.",
      code: `int diagonalDifference(vector<vector<int>>& a) {
    int n = (int)a.size(), L = 0, R = 0;
    for (int i = 0; i < n; i++) {
        L += a[i][i];
        R += a[i][n - 1 - i];
    }
    return abs(L - R);
}`,
    },
  ),

  "hr-plus-minus": T(
    {
      blurb: "Indexed count of pos/neg/zero, phir print ratios.",
      blurbEn: "Indexed counts for pos/neg/zero, then print ratios.",
      complexity: "O(n) time, O(1) space",
      why: "Teen counters clearly. Divide by n as double, 6 decimals.",
      whyEn: "Three clear counters. Divide by n as double, six decimals.",
      code: `void plusMinus(vector<int>& a) {
    int pos = 0, neg = 0, zer = 0;
    int n = (int)a.size();
    for (int i = 0; i < n; i++) {
        if (a[i] > 0) pos = pos + 1;
        else if (a[i] < 0) neg = neg + 1;
        else zer = zer + 1;
    }
    cout << fixed << setprecision(6);
    cout << (double)pos / n << "\\n";
    cout << (double)neg / n << "\\n";
    cout << (double)zer / n << "\\n";
}`,
    },
    {
      blurb: "Range-for counts, same print.",
      blurbEn: "Range-for counts, same printing.",
      complexity: "O(n) time, O(1) space",
      why: "x > 0 / x < 0 / else — cleaner scan.",
      whyEn: "x > 0 / x < 0 / else — cleaner scan.",
      code: `void plusMinus(vector<int>& a) {
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
    },
    {
      blurb: "Idiomatic: range-for + fixed setprecision(6).",
      blurbEn: "Idiomatic: range-for + fixed setprecision(6).",
      complexity: "O(n) time, O(1) space",
      why: "Matches solutionCode — short and judge-friendly.",
      whyEn: "Matches solutionCode — short and judge-friendly.",
      code: `void plusMinus(vector<int>& a) {
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
    },
  ),

  "hr-staircase": T(
    {
      blurb: "Nested loops: spaces phir hashes char by char.",
      blurbEn: "Nested loops: spaces then hashes, char by char.",
      complexity: "O(n²) time, O(1) space",
      why: "Har space aur hash alag print — pattern clearly dikhta hai.",
      whyEn: "Print each space and hash separately — the pattern is obvious.",
      code: `void staircase(int n) {
    for (int i = 0; i < n; i++) {
        int spaces = n - 1 - i;
        int hashes = i + 1;
        for (int s = 0; s < spaces; s++) cout << ' ';
        for (int h = 0; h < hashes; h++) cout << '#';
        cout << "\\n";
    }
}`,
    },
    {
      blurb: "Row pe string of spaces + string of #.",
      blurbEn: "Per row: string of spaces + string of #.",
      complexity: "O(n²) time, O(n) space",
      why: "string(count, ch) se line banani easy.",
      whyEn: "string(count, ch) builds each line easily.",
      code: `void staircase(int n) {
    for (int i = 0; i < n; i++) {
        cout << string(n - 1 - i, ' ') << string(i + 1, '#') << "\\n";
    }
}`,
    },
    {
      blurb: "Idiomatic string(n-1-i,' ') + string(i+1,'#').",
      blurbEn: "Idiomatic string constructors per row.",
      complexity: "O(n²) time, O(n) space",
      why: "Official one-liner-per-row style.",
      whyEn: "Official one-liner-per-row style.",
      code: `void staircase(int n) {
    for (int i = 0; i < n; i++) {
        cout << string(n - 1 - i, ' ') << string(i + 1, '#') << "\\n";
    }
}`,
    },
  ),

  "hr-mini-max-sum": T(
    {
      blurb: "Indexed: sum, min, max track. Print sum-max sum-min.",
      blurbEn: "Indexed: track sum, min, max. Print sum-max and sum-min.",
      complexity: "O(n) time, O(1) space",
      why: "Paanch numbers: total minus max = mini sum of 4.",
      whyEn: "Five numbers: total minus max is the min sum of four.",
      code: `void miniMaxSum(vector<long long>& a) {
    long long sum = 0;
    long long mn = a[0];
    long long mx = a[0];
    int n = (int)a.size();
    for (int i = 0; i < n; i++) {
        sum = sum + a[i];
        if (a[i] < mn) mn = a[i];
        if (a[i] > mx) mx = a[i];
    }
    cout << (sum - mx) << " " << (sum - mn) << "\\n";
}`,
    },
    {
      blurb: "Range-for + min/max helpers.",
      blurbEn: "Range-for + min/max helpers.",
      complexity: "O(n) time, O(1) space",
      why: "min(mn,x) / max(mx,x) — cleaner updates.",
      whyEn: "min(mn,x) / max(mx,x) — cleaner updates.",
      code: `void miniMaxSum(vector<long long>& a) {
    long long sum = 0, mn = a[0], mx = a[0];
    for (long long x : a) {
        sum += x;
        mn = min(mn, x);
        mx = max(mx, x);
    }
    cout << (sum - mx) << " " << (sum - mn) << "\\n";
}`,
    },
    {
      blurb: "Idiomatic one-pass min/max/sum.",
      blurbEn: "Idiomatic one-pass min/max/sum.",
      complexity: "O(n) time, O(1) space",
      why: "Matches solutionCode — long long throughout.",
      whyEn: "Matches solutionCode — long long throughout.",
      code: `void miniMaxSum(vector<long long>& a) {
    long long sum = 0, mn = a[0], mx = a[0];
    for (long long x : a) {
        sum += x;
        mn = min(mn, x);
        mx = max(mx, x);
    }
    cout << (sum - mx) << " " << (sum - mn) << "\\n";
}`,
    },
  ),

  "hr-cake-candles": T(
    {
      blurb: "Pehle max dhundo indexed, phir count equals.",
      blurbEn: "Find max with an index loop, then count equals.",
      complexity: "O(n) time, O(1) space",
      why: "Do clear passes: tallest height, phir kitni baar.",
      whyEn: "Two clear passes: tallest height, then how many times.",
      code: `int birthdayCakeCandles(vector<int>& a) {
    int mx = a[0];
    int n = (int)a.size();
    for (int i = 1; i < n; i++) {
        if (a[i] > mx) mx = a[i];
    }
    int cnt = 0;
    for (int i = 0; i < n; i++) {
        if (a[i] == mx) cnt = cnt + 1;
    }
    return cnt;
}`,
    },
    {
      blurb: "Range-for max, phir count.",
      blurbEn: "Range-for max, then count.",
      complexity: "O(n) time, O(1) space",
      why: "Same two passes, cleaner iteration.",
      whyEn: "Same two passes, cleaner iteration.",
      code: `int birthdayCakeCandles(vector<int>& a) {
    int mx = a[0];
    for (int x : a) if (x > mx) mx = x;
    int cnt = 0;
    for (int x : a) if (x == mx) cnt++;
    return cnt;
}`,
    },
    {
      blurb: "max_element + count equals — STL style.",
      blurbEn: "max_element + count equals — STL style.",
      complexity: "O(n) time, O(1) space",
      why: "Idiomatic: *max_element then count matches.",
      whyEn: "Idiomatic: *max_element then count matches.",
      code: `int birthdayCakeCandles(vector<int>& a) {
    int mx = *max_element(a.begin(), a.end());
    int cnt = 0;
    for (int x : a) if (x == mx) cnt++;
    return cnt;
}`,
    },
  ),

  "hr-time-conversion": T(
    {
      blurb: "Parse hh / rest / AM|PM step by step with ifs.",
      blurbEn: "Parse hh / rest / AM|PM step by step with ifs.",
      complexity: "O(1) time, O(1) space",
      why: "12 AM → 0, 12 PM stays, other PM +12. Leading zero pad.",
      whyEn: "12 AM → 0, 12 PM stays, other PM +12. Pad the hour.",
      code: `string timeConversion(string s) {
    int hh = stoi(s.substr(0, 2));
    string rest = s.substr(2, 6);
    string ap = s.substr(8, 2);
    if (ap == "AM") {
        if (hh == 12) {
            hh = 0;
        }
    } else {
        if (hh != 12) {
            hh = hh + 12;
        }
    }
    string hour;
    if (hh < 10) hour = "0" + to_string(hh);
    else hour = to_string(hh);
    return hour + rest;
}`,
    },
    {
      blurb: "Same rules, compact AM/PM branch.",
      blurbEn: "Same rules, compact AM/PM branch.",
      complexity: "O(1) time, O(1) space",
      why: "Shorter ifs; still build string with to_string pad.",
      whyEn: "Shorter ifs; still pad with to_string.",
      code: `string timeConversion(string s) {
    int hh = stoi(s.substr(0, 2));
    string rest = s.substr(2, 6);
    string ap = s.substr(8, 2);
    if (ap == "AM") {
        if (hh == 12) hh = 0;
    } else if (hh != 12) {
        hh += 12;
    }
    string hour = (hh < 10 ? "0" : "") + to_string(hh);
    return hour + rest;
}`,
    },
    {
      blurb: "snprintf %02d — idiomatic format.",
      blurbEn: "snprintf %02d — idiomatic format.",
      complexity: "O(1) time, O(1) space",
      why: "Matches solutionCode: snprintf pads hour cleanly.",
      whyEn: "Matches solutionCode: snprintf pads the hour cleanly.",
      code: `string timeConversion(string s) {
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
    },
  ),

  "hr-grading": T(
    {
      blurb: "Indexed: <38 skip, else next multiple of 5 check gap.",
      blurbEn: "Indexed: skip <38, else check gap to next multiple of 5.",
      complexity: "O(n) time, O(1) extra",
      why: "next = ((g/5)+1)*5. Gap < 3 → round up.",
      whyEn: "next = ((g/5)+1)*5. If gap < 3, round up.",
      code: `vector<int> gradingStudents(vector<int>& grades) {
    int n = (int)grades.size();
    for (int i = 0; i < n; i++) {
        int g = grades[i];
        if (g < 38) {
            continue;
        }
        int next = ((g / 5) + 1) * 5;
        if (next - g < 3) {
            grades[i] = next;
        }
    }
    return grades;
}`,
    },
    {
      blurb: "Range-for int& — mutate in place.",
      blurbEn: "Range-for int& — mutate in place.",
      complexity: "O(n) time, O(1) extra",
      why: "Reference loop: no index noise.",
      whyEn: "Reference loop: no index noise.",
      code: `vector<int> gradingStudents(vector<int>& grades) {
    for (int& g : grades) {
        if (g < 38) continue;
        int next = ((g / 5) + 1) * 5;
        if (next - g < 3) g = next;
    }
    return grades;
}`,
    },
    {
      blurb: "Idiomatic in-place round with continue.",
      blurbEn: "Idiomatic in-place round with continue.",
      complexity: "O(n) time, O(1) extra",
      why: "Matches solutionCode style.",
      whyEn: "Matches solutionCode style.",
      code: `vector<int> gradingStudents(vector<int>& grades) {
    for (int& g : grades) {
        if (g < 38) continue;
        int next = ((g / 5) + 1) * 5;
        if (next - g < 3) g = next;
    }
    return grades;
}`,
    },
  ),

  "hr-sock-merchant": T(
    {
      blurb: "map count indexed, phir pairs += freq/2.",
      blurbEn: "Count with map via index loop, then pairs += freq/2.",
      complexity: "O(n) time, O(k) space",
      why: "Har color ki frequency, integer divide by 2 = pairs.",
      whyEn: "Frequency per color; integer divide by 2 gives pairs.",
      code: `int sockMerchant(vector<int>& a) {
    map<int,int> f;
    int n = (int)a.size();
    for (int i = 0; i < n; i++) {
        f[a[i]] = f[a[i]] + 1;
    }
    int pairs = 0;
    for (auto it = f.begin(); it != f.end(); it++) {
        pairs = pairs + (it->second / 2);
    }
    return pairs;
}`,
    },
    {
      blurb: "unordered_map + range-for count and sum pairs.",
      blurbEn: "unordered_map + range-for count and sum pairs.",
      complexity: "O(n) time avg, O(k) space",
      why: "Hash map faster typical; structured bindings optional.",
      whyEn: "Hash map is typically faster; clear two-loop structure.",
      code: `int sockMerchant(vector<int>& a) {
    unordered_map<int,int> f;
    for (int x : a) f[x]++;
    int pairs = 0;
    for (auto& p : f) pairs += p.second / 2;
    return pairs;
}`,
    },
    {
      blurb: "unordered_map + structured bindings — idiomatic.",
      blurbEn: "unordered_map + structured bindings — idiomatic.",
      complexity: "O(n) time avg, O(k) space",
      why: "Matches solutionCode: for (auto& [c,k] : f) pairs += k/2.",
      whyEn: "Matches solutionCode: for (auto& [c,k] : f) pairs += k/2.",
      code: `int sockMerchant(vector<int>& a) {
    unordered_map<int,int> f;
    for (int x : a) f[x]++;
    int pairs = 0;
    for (auto& [c, k] : f) pairs += k / 2;
    return pairs;
}`,
    },
  ),

  "hr-counting-valleys": T(
    {
      blurb: "Indexed path: U +1, D -1; valley jab -1 se 0.",
      blurbEn: "Indexed path: U +1, D -1; valley when -1 → 0.",
      complexity: "O(n) time, O(1) space",
      why: "prev altitude save karo; neeche se sea level = valley++.",
      whyEn: "Save prev altitude; return to sea level from below = valley++.",
      code: `int countingValleys(string path) {
    int alt = 0, valleys = 0;
    int n = (int)path.size();
    for (int i = 0; i < n; i++) {
        int prev = alt;
        if (path[i] == 'U') alt = alt + 1;
        else alt = alt - 1;
        if (prev < 0 && alt == 0) {
            valleys = valleys + 1;
        }
    }
    return valleys;
}`,
    },
    {
      blurb: "Range-for char; ternary step.",
      blurbEn: "Range-for char; ternary step.",
      complexity: "O(n) time, O(1) space",
      why: "alt += (c=='U'?1:-1). Same valley check.",
      whyEn: "alt += (c=='U'?1:-1). Same valley check.",
      code: `int countingValleys(string path) {
    int alt = 0, valleys = 0;
    for (char c : path) {
        int prev = alt;
        alt += (c == 'U' ? 1 : -1);
        if (prev < 0 && alt == 0) valleys++;
    }
    return valleys;
}`,
    },
    {
      blurb: "Idiomatic altitude walk — matches solutionCode.",
      blurbEn: "Idiomatic altitude walk — matches solutionCode.",
      complexity: "O(n) time, O(1) space",
      why: "Tightest clear form of the valley rule.",
      whyEn: "Tightest clear form of the valley rule.",
      code: `int countingValleys(string path) {
    int alt = 0, valleys = 0;
    for (char c : path) {
        int prev = alt;
        alt += (c == 'U' ? 1 : -1);
        if (prev < 0 && alt == 0) valleys++;
    }
    return valleys;
}`,
    },
  ),
};
