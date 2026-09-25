import { T, wrap } from "./solution-tiers-shared";

export const HAND_A: Record<string, ReturnType<typeof T>> = {
  "intersection-two-arrays-ii": T(
    {
      blurb: "Nested loops + used flags. Bahut seedha.",
      blurbEn: "Nested loops with used flags. Very straightforward.",
      complexity: "O(n·m) time, O(m) space",
      why: "Har nums1 value ke liye nums2 scan; milte hi used mark. Beginner logic clear.",
      whyEn: "For each nums1 value, scan nums2 and mark used when matched. Clear beginner logic.",
      code: wrap(`class Solution {
public:
    vector<int> intersect(vector<int>& nums1, vector<int>& nums2) {
        int m = nums2.size();
        vector<bool> used(m, false);
        vector<int> ans;
        for (int x : nums1) {
            for (int j = 0; j < m; j++) {
                if (!used[j] && nums2[j] == x) {
                    ans.push_back(x);
                    used[j] = true;
                    break;
                }
            }
        }
        return ans;
    }
};`),
    },
    {
      blurb: "Dono sort + two pointers.",
      blurbEn: "Sort both, then two pointers.",
      complexity: "O(n log n + m log m) time, O(1) extra",
      why: "Sort ke baad same values paas. Pointers se match consume karo.",
      whyEn: "After sorting, equals sit nearby. Walk both arrays and consume matches.",
      code: wrap(`class Solution {
public:
    vector<int> intersect(vector<int>& nums1, vector<int>& nums2) {
        sort(nums1.begin(), nums1.end());
        sort(nums2.begin(), nums2.end());
        vector<int> ans;
        int i = 0, j = 0;
        while (i < (int)nums1.size() && j < (int)nums2.size()) {
            if (nums1[i] == nums2[j]) {
                ans.push_back(nums1[i]);
                i++;
                j++;
            } else if (nums1[i] < nums2[j]) i++;
            else j++;
        }
        return ans;
    }
};`),
    },
    {
      blurb: "Frequency map. Interview answer.",
      blurbEn: "Frequency map. The interview answer.",
      complexity: "O(n + m) time, O(min(n, m)) space",
      why: "nums1 count karo; nums2 pe chalte hue count>0 pe push aur --.",
      whyEn: "Count nums1; walk nums2 and emit while count remains positive.",
      code: wrap(`class Solution {
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
};`),
    },
  ),

  "group-anagrams": T(
    {
      blurb: "Har pair sort karke compare. Slow.",
      blurbEn: "Compare every pair by sorting. Slow.",
      complexity: "O(n² · k log k) time",
      why: "Har word ke liye pehle se groups check: sorted equal to anagram. Seedha lekin mehnga.",
      whyEn: "For each word, check existing groups by sorting. Simple but expensive.",
      code: wrap(`class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        vector<vector<string>> groups;
        vector<string> keys;
        for (const string& s : strs) {
            string sorted = s;
            sort(sorted.begin(), sorted.end());
            bool placed = false;
            for (int i = 0; i < (int)keys.size(); i++) {
                if (keys[i] == sorted) {
                    groups[i].push_back(s);
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                keys.push_back(sorted);
                groups.push_back({s});
            }
        }
        return groups;
    }
};`),
    },
    {
      blurb: "Sorted string ko map key banao.",
      blurbEn: "Use sorted string as the map key.",
      complexity: "O(n · k log k) time, O(n·k) space",
      why: "Ek baar sort → key. Same key = same group. Hash map se O(n) groups.",
      whyEn: "Sort once per word as key. Same key means same group.",
      code: wrap(`class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        unordered_map<string, vector<string>> mp;
        for (const string& s : strs) {
            string key = s;
            sort(key.begin(), key.end());
            mp[key].push_back(s);
        }
        vector<vector<string>> ans;
        for (auto& [_, g] : mp) ans.push_back(std::move(g));
        return ans;
    }
};`),
    },
    {
      blurb: "count[26] signature as key. Fastest.",
      blurbEn: "count[26] signature as key. Fastest.",
      complexity: "O(n · k) time, O(n·k) space",
      why: "Letters count string banao (#a#b...). Sort ki zarurat nahi — O(k) per word.",
      whyEn: "Build a letter-count signature. No sort — O(k) per word.",
      code: wrap(`class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        unordered_map<string, vector<string>> mp;
        for (const string& s : strs) {
            int cnt[26] = {};
            for (char c : s) cnt[c - 'a']++;
            string key;
            for (int i = 0; i < 26; i++) {
                key.push_back('#');
                key += to_string(cnt[i]);
            }
            mp[key].push_back(s);
        }
        vector<vector<string>> ans;
        for (auto& [_, g] : mp) ans.push_back(std::move(g));
        return ans;
    }
};`),
    },
  ),

  "top-k-frequent": T(
    {
      blurb: "Count, phir pairs sort by freq.",
      blurbEn: "Count, then sort pairs by frequency.",
      complexity: "O(n log n) time, O(n) space",
      why: "Frequency map → vector of {freq,val} → sort desc → pehle k lo.",
      whyEn: "Build freq map, sort (freq,val) pairs descending, take first k.",
      code: wrap(`class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {
        unordered_map<int, int> freq;
        for (int x : nums) freq[x]++;
        vector<pair<int, int>> pairs;
        for (auto& [val, f] : freq) pairs.push_back({f, val});
        sort(pairs.rbegin(), pairs.rend());
        vector<int> ans;
        for (int i = 0; i < k; i++) ans.push_back(pairs[i].second);
        return ans;
    }
};`),
    },
    {
      blurb: "Bucket by frequency. Clean.",
      blurbEn: "Bucket by frequency. Clean.",
      complexity: "O(n) time, O(n) space",
      why: "Index = frequency. High freq se neeche chal kar k collect.",
      whyEn: "Index equals frequency. Walk high→low and collect k values.",
      code: wrap(`class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {
        unordered_map<int, int> freq;
        for (int x : nums) freq[x]++;
        int n = nums.size();
        vector<vector<int>> bucket(n + 1);
        for (auto& [val, f] : freq) bucket[f].push_back(val);
        vector<int> ans;
        for (int f = n; f >= 1 && (int)ans.size() < k; f--) {
            for (int v : bucket[f]) {
                ans.push_back(v);
                if ((int)ans.size() == k) return ans;
            }
        }
        return ans;
    }
};`),
    },
    {
      blurb: "Bucket O(n) — optimal interview.",
      blurbEn: "Bucket O(n) — the optimal interview answer.",
      complexity: "O(n) time, O(n) space",
      why: "Heap bhi theek, par bucket linear hai. High freq buckets se k lo.",
      whyEn: "Heap works, but bucket is linear. Collect k from highest-freq buckets.",
      code: wrap(`class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {
        unordered_map<int, int> freq;
        for (int x : nums) freq[x]++;
        vector<vector<int>> bucket(nums.size() + 1);
        for (auto& [val, f] : freq) bucket[f].push_back(val);
        vector<int> ans;
        for (int f = (int)bucket.size() - 1; f >= 0 && (int)ans.size() < k; f--) {
            for (int v : bucket[f]) {
                ans.push_back(v);
                if ((int)ans.size() == k) break;
            }
        }
        return ans;
    }
};`),
    },
  ),

  "container-most-water": T(
    {
      blurb: "Har i,j pair ka area. Brute.",
      blurbEn: "Area for every i,j pair. Brute force.",
      complexity: "O(n²) time, O(1) space",
      why: "Sab width × min height try. Max yaad rakho. Crystal clear.",
      whyEn: "Try every width × min height. Remember the max. Crystal clear.",
      code: wrap(`class Solution {
public:
    int maxArea(vector<int>& height) {
        int n = height.size(), best = 0;
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                int area = min(height[i], height[j]) * (j - i);
                best = max(best, area);
            }
        }
        return best;
    }
};`),
    },
    {
      blurb: "Nested loops + thoda early prune.",
      blurbEn: "Nested loops with a bit of early prune.",
      complexity: "O(n²) worst, often better in practice",
      why: "Agar remaining width * taller wall bhi best se kam, skip. Still O(n²).",
      whyEn: "If remaining width × taller wall cannot beat best, skip. Still O(n²).",
      code: wrap(`class Solution {
public:
    int maxArea(vector<int>& height) {
        int n = height.size(), best = 0;
        for (int i = 0; i < n; i++) {
            for (int j = n - 1; j > i; j--) {
                if (height[j] >= height[i]) {
                    best = max(best, height[i] * (j - i));
                    break;
                }
                best = max(best, height[j] * (j - i));
            }
        }
        return best;
    }
};`),
    },
    {
      blurb: "Two pointers ends se. Optimal.",
      blurbEn: "Two pointers from the ends. Optimal.",
      complexity: "O(n) time, O(1) space",
      why: "Chhoti wall move karo — sirf woh improve kar sakti hai. Wide se start.",
      whyEn: "Move the shorter wall — only that can improve. Start wide.",
      code: wrap(`class Solution {
public:
    int maxArea(vector<int>& height) {
        int L = 0, R = (int)height.size() - 1, best = 0;
        while (L < R) {
            best = max(best, min(height[L], height[R]) * (R - L));
            if (height[L] < height[R]) L++;
            else R--;
        }
        return best;
    }
};`),
    },
  ),

  "three-sum": T(
    {
      blurb: "Teen nested loops. Bahut slow.",
      blurbEn: "Triple nested loops. Very slow.",
      complexity: "O(n³) time, O(k) space for answers",
      why: "Har i<j<k check sum==0. set se duplicates hatao. Beginner pehla try.",
      whyEn: "Check every i<j<k for sum 0. Use a set to drop duplicates.",
      code: wrap(`class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        int n = nums.size();
        set<vector<int>> uniq;
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                for (int k = j + 1; k < n; k++) {
                    if (nums[i] + nums[j] + nums[k] == 0) {
                        vector<int> t = {nums[i], nums[j], nums[k]};
                        sort(t.begin(), t.end());
                        uniq.insert(t);
                    }
                }
            }
        }
        return vector<vector<int>>(uniq.begin(), uniq.end());
    }
};`),
    },
    {
      blurb: "Sort + fix i + two pointers.",
      blurbEn: "Sort, fix i, then two pointers.",
      complexity: "O(n²) time, O(1) / O(log n) extra",
      why: "Sort ke baad har i pe L/R se -nums[i] dhundo. Classic pattern.",
      whyEn: "After sorting, for each i use L/R to find -nums[i]. Classic pattern.",
      code: wrap(`class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        vector<vector<int>> ans;
        int n = nums.size();
        for (int i = 0; i < n; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            int L = i + 1, R = n - 1;
            while (L < R) {
                int sum = nums[i] + nums[L] + nums[R];
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
};`),
    },
    {
      blurb: "Same + clean duplicate skips.",
      blurbEn: "Same approach, cleaned duplicate skips.",
      complexity: "O(n²) time, O(1) extra",
      why: "i skip + L/R skip. Early break jab nums[i]>0. Interview-ready.",
      whyEn: "Skip duplicate i and L/R. Early break when nums[i]>0. Interview-ready.",
      code: wrap(`class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        vector<vector<int>> ans;
        int n = nums.size();
        for (int i = 0; i < n; i++) {
            if (nums[i] > 0) break;
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            int L = i + 1, R = n - 1;
            while (L < R) {
                long long sum = (long long)nums[i] + nums[L] + nums[R];
                if (sum == 0) {
                    ans.push_back({nums[i], nums[L], nums[R]});
                    int lv = nums[L], rv = nums[R];
                    while (L < R && nums[L] == lv) L++;
                    while (L < R && nums[R] == rv) R--;
                } else if (sum < 0) L++;
                else R--;
            }
        }
        return ans;
    }
};`),
    },
  ),

  "remove-duplicates-sorted": T(
    {
      blurb: "Nayi array mein unique copy.",
      blurbEn: "Copy uniques into a new array.",
      complexity: "O(n) time, O(n) space",
      why: "Extra vector mein pehli baar dikhne wale daalo, phir wapas nums mein likho.",
      whyEn: "Push first occurrences into an extra vector, then write back into nums.",
      code: wrap(`class Solution {
public:
    int removeDuplicates(vector<int>& nums) {
        if (nums.empty()) return 0;
        vector<int> uniq;
        uniq.push_back(nums[0]);
        for (int i = 1; i < (int)nums.size(); i++) {
            if (nums[i] != uniq.back()) uniq.push_back(nums[i]);
        }
        for (int i = 0; i < (int)uniq.size(); i++) nums[i] = uniq[i];
        return (int)uniq.size();
    }
};`),
    },
    {
      blurb: "Two pointers: read + write.",
      blurbEn: "Two pointers: read and write.",
      complexity: "O(n) time, O(1) space",
      why: "w pe next unique likho. Sorted hai to pehle unique se compare kaafi.",
      whyEn: "Write the next unique at w. Sorted, so compare against previous unique.",
      code: wrap(`class Solution {
public:
    int removeDuplicates(vector<int>& nums) {
        if (nums.empty()) return 0;
        int w = 1;
        for (int i = 1; i < (int)nums.size(); i++) {
            if (nums[i] != nums[w - 1]) {
                nums[w] = nums[i];
                w++;
            }
        }
        return w;
    }
};`),
    },
    {
      blurb: "Same in-place, cleanest form.",
      blurbEn: "Same in-place idea, cleanest form.",
      complexity: "O(n) time, O(1) space",
      why: "Write pointer sirf naye value pe aage. LeetCode expected answer.",
      whyEn: "Advance the write pointer only on a new value. The expected LeetCode answer.",
      code: wrap(`class Solution {
public:
    int removeDuplicates(vector<int>& nums) {
        int w = 0;
        for (int x : nums) {
            if (w == 0 || x != nums[w - 1]) {
                nums[w++] = x;
            }
        }
        return w;
    }
};`),
    },
  ),

  "max-avg-subarray": T(
    {
      blurb: "Har window ka sum nikaalo.",
      blurbEn: "Compute the sum of every window.",
      complexity: "O(n·k) time, O(1) space",
      why: "Har start i pe i..i+k-1 sum. Max / k. Clear but slow for large k.",
      whyEn: "For each start i, sum i..i+k-1. Track max/k. Clear but slow for large k.",
      code: wrap(`class Solution {
public:
    double findMaxAverage(vector<int>& nums, int k) {
        int n = nums.size();
        double best = -1e18;
        for (int i = 0; i + k - 1 < n; i++) {
            long long sum = 0;
            for (int j = i; j < i + k; j++) sum += nums[j];
            best = max(best, (double)sum / k);
        }
        return best;
    }
};`),
    },
    {
      blurb: "Prefix sums se O(1) window.",
      blurbEn: "Prefix sums for O(1) window queries.",
      complexity: "O(n) time, O(n) space",
      why: "pref[i+k]-pref[i] = window sum. Har window O(1).",
      whyEn: "pref[i+k]-pref[i] is the window sum. Each window is O(1).",
      code: wrap(`class Solution {
public:
    double findMaxAverage(vector<int>& nums, int k) {
        int n = nums.size();
        vector<long long> pref(n + 1, 0);
        for (int i = 0; i < n; i++) pref[i + 1] = pref[i] + nums[i];
        double best = -1e18;
        for (int i = 0; i + k <= n; i++) {
            long long sum = pref[i + k] - pref[i];
            best = max(best, (double)sum / k);
        }
        return best;
    }
};`),
    },
    {
      blurb: "Sliding window running sum.",
      blurbEn: "Sliding window with a running sum.",
      complexity: "O(n) time, O(1) space",
      why: "Pehle k sum, phir +right -left. Extra array nahi chahiye.",
      whyEn: "Sum first k, then +right -left. No extra array needed.",
      code: wrap(`class Solution {
public:
    double findMaxAverage(vector<int>& nums, int k) {
        long long sum = 0;
        for (int i = 0; i < k; i++) sum += nums[i];
        long long best = sum;
        for (int i = k; i < (int)nums.size(); i++) {
            sum += nums[i] - nums[i - k];
            best = max(best, sum);
        }
        return (double)best / k;
    }
};`),
    },
  ),

  "longest-substr-no-repeat": T(
    {
      blurb: "Saari substrings set se check.",
      blurbEn: "Check all substrings with a set.",
      complexity: "O(n³) / O(n²) with care, O(n) space",
      why: "Har i..j pe chars set mein daalo; duplicate aaya to invalid. Simple brute.",
      whyEn: "For each i..j put chars in a set; duplicate means invalid. Simple brute.",
      code: wrap(`class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        int n = s.size(), best = 0;
        for (int i = 0; i < n; i++) {
            unordered_set<char> seen;
            for (int j = i; j < n; j++) {
                if (seen.count(s[j])) break;
                seen.insert(s[j]);
                best = max(best, j - i + 1);
            }
        }
        return best;
    }
};`),
    },
    {
      blurb: "Sliding window + set.",
      blurbEn: "Sliding window with a set.",
      complexity: "O(n) time, O(min(n, Σ)) space",
      why: "Right expand; duplicate pe left shrink jab tak unique. Classic window.",
      whyEn: "Expand right; on duplicate shrink left until unique. Classic window.",
      code: wrap(`class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        unordered_set<char> seen;
        int L = 0, best = 0;
        for (int R = 0; R < (int)s.size(); R++) {
            while (seen.count(s[R])) {
                seen.erase(s[L]);
                L++;
            }
            seen.insert(s[R]);
            best = max(best, R - L + 1);
        }
        return best;
    }
};`),
    },
    {
      blurb: "Last-index map. Jump left.",
      blurbEn: "Last-index map. Jump the left pointer.",
      complexity: "O(n) time, O(Σ) space",
      why: "Char ka last index yaad. Duplicate window ke andar to L = last+1 jump.",
      whyEn: "Remember each char's last index. If duplicate is inside the window, jump L to last+1.",
      code: wrap(`class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        unordered_map<char, int> last;
        int L = 0, best = 0;
        for (int R = 0; R < (int)s.size(); R++) {
            if (last.count(s[R]) && last[s[R]] >= L) {
                L = last[s[R]] + 1;
            }
            last[s[R]] = R;
            best = max(best, R - L + 1);
        }
        return best;
    }
};`),
    },
  ),

  "min-window-substring": T(
    {
      blurb: "Har window check: t covered?",
      blurbEn: "Check every window: is t covered?",
      complexity: "O(n² · |Σ|) time roughly",
      why: "Har i..j pe count map se t satisfy? Valid mein shortest rakho. Slow hard problem.",
      whyEn: "For each i..j, check counts cover t. Keep the shortest valid. Slow for a hard problem.",
      code: wrap(`class Solution {
public:
    string minWindow(string s, string t) {
        if (t.empty() || s.size() < t.size()) return "";
        unordered_map<char, int> need;
        for (char c : t) need[c]++;
        int bestLen = INT_MAX, bestL = 0;
        int n = s.size();
        for (int i = 0; i < n; i++) {
            unordered_map<char, int> have;
            int missing = need.size();
            for (int j = i; j < n; j++) {
                char c = s[j];
                if (need.count(c)) {
                    have[c]++;
                    if (have[c] == need[c]) missing--;
                }
                if (missing == 0) {
                    if (j - i + 1 < bestLen) {
                        bestLen = j - i + 1;
                        bestL = i;
                    }
                    break;
                }
            }
        }
        return bestLen == INT_MAX ? "" : s.substr(bestL, bestLen);
    }
};`),
    },
    {
      blurb: "Sliding expand/shrink + map.",
      blurbEn: "Sliding expand/shrink with a map.",
      complexity: "O(n) time, O(|Σ|) space",
      why: "Right expand jab tak valid; phir left shrink. Best length update.",
      whyEn: "Expand right until valid, then shrink left. Update best length.",
      code: wrap(`class Solution {
public:
    string minWindow(string s, string t) {
        unordered_map<char, int> need, window;
        for (char c : t) need[c]++;
        int required = need.size(), formed = 0;
        int L = 0, bestLen = INT_MAX, bestL = 0;
        for (int R = 0; R < (int)s.size(); R++) {
            char c = s[R];
            window[c]++;
            if (need.count(c) && window[c] == need[c]) formed++;
            while (L <= R && formed == required) {
                if (R - L + 1 < bestLen) {
                    bestLen = R - L + 1;
                    bestL = L;
                }
                char d = s[L];
                window[d]--;
                if (need.count(d) && window[d] < need[d]) formed--;
                L++;
            }
        }
        return bestLen == INT_MAX ? "" : s.substr(bestL, bestLen);
    }
};`),
    },
    {
      blurb: "Same sliding, tighter counters.",
      blurbEn: "Same sliding window, tighter counters.",
      complexity: "O(n) time, O(|Σ|) space",
      why: "need map mutate with remaining deficit; covered count. Same O(n), clean.",
      whyEn: "Mutate need as remaining deficit; track covered count. Same O(n), clean.",
      code: wrap(`class Solution {
public:
    string minWindow(string s, string t) {
        vector<int> need(128, 0);
        for (char c : t) need[c]++;
        int missing = (int)t.size();
        int L = 0, bestLen = INT_MAX, bestL = 0;
        for (int R = 0; R < (int)s.size(); R++) {
            char c = s[R];
            if (need[c] > 0) missing--;
            need[c]--;
            while (missing == 0) {
                if (R - L + 1 < bestLen) {
                    bestLen = R - L + 1;
                    bestL = L;
                }
                char d = s[L++];
                need[d]++;
                if (need[d] > 0) missing++;
            }
        }
        return bestLen == INT_MAX ? "" : s.substr(bestL, bestLen);
    }
};`),
    },
  ),

  "permutation-in-string": T(
    {
      blurb: "Har s2 window sort == s1 sort.",
      blurbEn: "Every s2 window: sorted equals sorted s1.",
      complexity: "O((n-m)·m log m) time",
      why: "Window size = s1.length. Sort karke compare. Seedha lekin slow.",
      whyEn: "Window size = |s1|. Sort and compare. Straightforward but slow.",
      code: wrap(`class Solution {
public:
    bool checkInclusion(string s1, string s2) {
        int m = s1.size(), n = s2.size();
        if (m > n) return false;
        string key = s1;
        sort(key.begin(), key.end());
        for (int i = 0; i + m <= n; i++) {
            string w = s2.substr(i, m);
            sort(w.begin(), w.end());
            if (w == key) return true;
        }
        return false;
    }
};`),
    },
    {
      blurb: "Sliding freq arrays compare.",
      blurbEn: "Sliding frequency arrays, compare each step.",
      complexity: "O(n · 26) time, O(1) space",
      why: "s1 aur window ke 26-counts. Har slide pe arrays equal?",
      whyEn: "26-counts for s1 and the window. After each slide, are arrays equal?",
      code: wrap(`class Solution {
public:
    bool checkInclusion(string s1, string s2) {
        int m = s1.size(), n = s2.size();
        if (m > n) return false;
        vector<int> need(26, 0), win(26, 0);
        for (char c : s1) need[c - 'a']++;
        for (int i = 0; i < n; i++) {
            win[s2[i] - 'a']++;
            if (i >= m) win[s2[i - m] - 'a']--;
            if (i >= m - 1 && win == need) return true;
        }
        return false;
    }
};`),
    },
    {
      blurb: "Sliding freq + matched count.",
      blurbEn: "Sliding freq with a matched-letter count.",
      complexity: "O(n) time, O(1) space",
      why: "26 compares skip: kitne letters perfect match. Window slide pe O(1) update.",
      whyEn: "Skip full 26 compares: track how many letters perfectly match. O(1) per slide.",
      code: wrap(`class Solution {
public:
    bool checkInclusion(string s1, string s2) {
        int m = s1.size(), n = s2.size();
        if (m > n) return false;
        vector<int> need(26, 0), win(26, 0);
        for (char c : s1) need[c - 'a']++;
        int matched = 0;
        for (int i = 0; i < 26; i++) if (need[i] == 0) matched++;
        auto touch = [&](int idx, int delta) {
            if (win[idx] == need[idx]) matched--;
            win[idx] += delta;
            if (win[idx] == need[idx]) matched++;
        };
        for (int i = 0; i < n; i++) {
            touch(s2[i] - 'a', 1);
            if (i >= m) touch(s2[i - m] - 'a', -1);
            if (i >= m - 1 && matched == 26) return true;
        }
        return false;
    }
};`),
    },
  ),
};
