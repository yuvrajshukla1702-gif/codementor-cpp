import type { Problem } from "./types";
import { guideForProblem } from "./solution-guides";

export type CodeLectureStep = {
  codeSoFar: string;
  focusLine: number;
  lineText: string;
  say: string;
  sayEn: string;
  sayHi: string;
};

export type CodeLectureScript = {
  id: string;
  title: string;
  complexity: string;
  steps: CodeLectureStep[];
};

type LineExplain = { hinglish: string; english: string; hindi: string };

function clean(line: string) {
  return line.replace(/\t/g, "  ");
}

function explainCppLine(raw: string, fnName: string, title: string): LineExplain | "skip" {
  const line = raw.trim();
  if (!line) return "skip";
  // Braces alone are visual noise — skip speaking them
  if (line === "{" || line === "}" || line === "};") return "skip";

  if (/^class\s+\w+/.test(line)) {
    return {
      hinglish: `Pehle shell likhte hain. Yeh Solution class hai. ${title} ka poora logic iske andar aayega, bilkul interview style.`,
      english: `First we write the shell. This is the Solution class. All of ${title} will live inside it, just like in an interview.`,
      hindi: `पहले शेल लिखते हैं। यह Solution क्लास है। ${title} का पूरा लॉजिक इसके अंदर आएगा।`,
    };
  }
  if (line === "public:") {
    return {
      hinglish: "Public section isliye, taaki LeetCode judge bahar se function call kar sake. Private rakhoge to judge fail kar dega.",
      english: "We mark it public so the LeetCode judge can call our function from outside. If it were private, the judge would fail.",
      hindi: "पब्लिक इसलिए, ताकि लीटकोड जज बाहर से फ़ंक्शन कॉल कर सके।",
    };
  }
  if (
    /vector\s*<\s*int\s*>\s+\w+\s*\(/.test(line) ||
    /int\s+\w+\s*\(/.test(line) ||
    /void\s+\w+\s*\(/.test(line) ||
    /bool\s+\w+\s*\(/.test(line) ||
    /string\s+\w+\s*\(/.test(line) ||
    /long\s+long\s+\w+\s*\(/.test(line) ||
    /pair\s*</.test(line)
  ) {
    return {
      hinglish: `Ab function signature. Naam hai ${fnName}. Socho jaise teacher board pe likhta hai: input kya aayega, output kya jaayega. Yeh line wahi contract fix karti hai.`,
      english: `Now the function signature. The name is ${fnName}. Think of it as the contract: what comes in, what goes out. This line locks that contract.`,
      hindi: `अब फ़ंक्शन सिग्नेचर। नाम है ${fnName}। इनपुट क्या आएगा, आउटपुट क्या जाएगा — यही लाइन तय करती है।`,
    };
  }
  if (/unordered_map|map\s*<|set\s*<|unordered_set/.test(line)) {
    return {
      hinglish:
        "Yahan magic shuru. Yeh ek diary hai, hash map. Isme hum value likhenge aur uske saath index. Baad mein turant pooch sakte hain: yeh number pehle dikha tha kya?",
      english:
        "Here is the main idea. This is a diary, a hash map. We will store each value with its index, then ask instantly: have I already seen this number?",
      hindi:
        "यहाँ असली आइडिया शुरू। यह डायरी है, हैश मैप। वैल्यू के साथ इंडेक्स रखेंगे, फिर तुरंत पूछ सकेंगे कि नंबर पहले दिखा था या नहीं।",
    };
  }
  if (/for\s*\(.*\bj\b/.test(line)) {
    return {
      hinglish:
        "Andar wala loop. i fix hai, j uske aage se chalta hai. Har possible jodi check kar rahe ho. Beginner ke liye yeh sabse clear idea hai.",
      english:
        "Inner loop. i is fixed, j walks ahead of it. We check every possible pair. Clearest idea for beginners.",
      hindi:
        "अंदर वाला लूप। आई फिक्स है, जे आगे चलता है। हर जोड़ी चेक। बिगिनर के लिए सबसे साफ़ आइडिया।",
    };
  }
  if (/for\s*\(/.test(line)) {
    return {
      hinglish: "Ab loop. Array pe left se right chalenge. Har step pe socho: is number pe kya check karna hai?",
      english: "Now the loop. We walk the array left to right. At each step ask: what should I check for this number?",
      hindi: "अब लूप। ऐरे पर बाएँ से दाएँ। हर स्टेप पर सोचो: इस नंबर पर क्या चेक करना है?",
    };
  }
  if (/while\s*\(/.test(line)) {
    return {
      hinglish: "While loop. Jab tak condition true hai, kaam chalta rahega. Har step pe socho: ab kya change hua?",
      english: "While loop. We keep going while the condition is true. At every step, ask: what just changed?",
      hindi: "वाइल लूप। जब तक कंडीशन सच है काम चलेगा। हर स्टेप पर सोचो क्या बदला।",
    };
  }
  if (/need\s*=|complement\s*=/.test(line) || (/target\s*-/.test(line) && /=/.test(line))) {
    return {
      hinglish:
        "Yeh line sabse important hai. Current number pe khade ho. Target minus current nikaalo. Jo bacha, wahi tumhara partner hai. Ab sirf yeh poochna hai: partner pehle mil chuka hai ya nahi?",
      english:
        "This is the key line. Stand on the current number. Subtract it from the target. Whatever remains is your partner. Now the only question is: have we already seen that partner?",
      hindi:
        "यह सबसे ज़रूरी लाइन है। करंट नंबर पर खड़े हो। टारगेट में से घटाओ। जो बचा वही पार्टनर है। अब बस पूछो: पार्टनर पहले मिल चुका है क्या?",
    };
  }
  if (/\.count\s*\(|\.find\s*\(/.test(line) || /if\s*\(.*\b(seen|mp|map|st)\b/.test(line)) {
    return {
      hinglish:
        "Ab diary khol ke check. Agar partner pehle se pada hai, matlab pair mil gaya. Turant dono indexes return kar do. Yahan hi answer ban-ta hai.",
      english:
        "Open the diary and check. If the partner is already there, the pair is found. Return both indexes immediately. This is where the answer is born.",
      hindi:
        "अब डायरी खोलकर चेक। अगर पार्टनर पहले से पड़ा है तो पेयर मिल गया। तुरंत दोनों इंडेक्स रिटर्न करो।",
    };
  }
  if (/return\s*\{/.test(line) || /^return\s+[^{\s]/.test(line)) {
    return {
      hinglish: "Return. Judge ko final jawab de rahe ho. Iske baad function khatam.",
      english: "Return. We hand the final answer to the judge. After this the function is done.",
      hindi: "रिटर्न। जज को फाइनल जवाब दे रहे हो। इसके बाद फ़ंक्शन खत्म।",
    };
  }
  if (/\[.*\]\s*=/.test(line) && /(seen|mp|map|st)\[/.test(line)) {
    return {
      hinglish:
        "Partner nahi mila, to current number ko diary mein likh do. Index ke saath. Aage jab iski zarurat hogi, turant mil jaayega. Yeh step mat bhoolna.",
      english:
        "Partner not found, so write the current number into the diary with its index. Later, when we need it, we will find it instantly. Do not skip this step.",
      hindi:
        "पार्टनर नहीं मिला तो करंट नंबर डायरी में इंडेक्स के साथ लिख दो। आगे ज़रूरत पर तुरंत मिल जाएगा।",
    };
  }
  if (/if\s*\(/.test(line)) {
    return {
      hinglish: "If condition. Socho jaise sawaal: kya yeh true hai? Haan to andar ka kaam, nahi to skip.",
      english: "If condition. Ask like a question: is this true? If yes, do the inner work; if not, skip.",
      hindi: "इफ कंडीशन। पूछो जैसे सवाल: क्या यह सच है? हाँ तो अंदर का काम, नहीं तो छोड़ो।",
    };
  }
  if (/else/.test(line)) {
    return {
      hinglish: "Else path. Jab if fail hota hai, tab yeh door khulti hai.",
      english: "Else path. When the if fails, this door opens.",
      hindi: "एल्स पथ। जब इफ फेल होता है, तब यह दरवाज़ा खुलता है।",
    };
  }
  if (/push_back|emplace|insert\s*\(/.test(line)) {
    return {
      hinglish: "Yahan value store ho rahi hai. Result list ya structure dheere dheere bhar raha hai.",
      english: "We are storing a value here. The result list or structure is filling up step by step.",
      hindi: "यहाँ वैल्यू स्टोर हो रही है। रिजल्ट धीरे धीरे भर रहा है।",
    };
  }
  if (/max\s*\(|min\s*\(/.test(line)) {
    return {
      hinglish: "Best answer update. Purana best aur naya value compare, jo bada ya chhota chahiye wahi rakho.",
      english: "Update the best answer. Compare the old best with the new value and keep what you need.",
      hindi: "बेस्ट जवाब अपडेट। पुराना और नया कम्पेयर करके सही वाला रखो।",
    };
  }
  if (/sort\s*\(/.test(line)) {
    return {
      hinglish: "Sort kar do. Order fix hone ke baad two pointers ya binary search natural lagta hai.",
      english: "Sort first. Once order is fixed, two pointers or binary search feels natural.",
      hindi: "पहले सॉर्ट करो। ऑर्डर फिक्स होने के बाद टू पॉइंटर्स आसान लगता है।",
    };
  }
  if (/\b(mid|left|right|lo|hi)\b\s*=/.test(line) && !/for\s*\(/.test(line)) {
    return {
      hinglish: "Pointer move. Search space chhota ya shift ho raha hai. Yeh line direction decide karti hai.",
      english: "Moving a pointer. The search space shrinks or shifts. This line decides the direction.",
      hindi: "पॉइंटर मूव। सर्च स्पेस छोटा या शिफ्ट हो रहा है। यही लाइन दिशा तय करती है।",
    };
  }
  if (/ios::|cin\.tie|using namespace/.test(line)) {
    return {
      hinglish: "Chhoti setup line. Input output tez karne ke liye. Logic pe asar nahi.",
      english: "Small setup line to speed up input and output. It does not change the logic.",
      hindi: "छोटी सेटअप लाइन। इनपुट आउटपुट तेज़ करने के लिए। लॉजिक नहीं बदलती।",
    };
  }

  // Meaningful fallback — explain role, not just echo the code
  return {
    hinglish: `Ab yeh line likh rahe hain. Dhyan se padho: yeh step algorithm ko aage badhata hai. Agar skip kar doge to flow toot jaayega.`,
    english: `Now we write this line. Read it carefully: this step moves the algorithm forward. Skip it and the flow breaks.`,
    hindi: `अब यह लाइन लिख रहे हैं। ध्यान से पढ़ो: यह स्टेप अल्गोरिदम को आगे बढ़ाता है।`,
  };
}

function detectFnName(code: string) {
  const m = code.match(
    /\b(?:vector\s*<[^>]+>|int|void|bool|string|long\s+long|pair\s*<[^>]+>)\s+(\w+)\s*\(/
  );
  return m?.[1] || "solve";
}

/** Hand-tuned Two Sum walk — YouTube teacher style. */
const TWO_SUM_LINES: Array<{ match: RegExp; hinglish: string; english: string; hindi: string }> = [
  {
    match: /^class/,
    hinglish: "Board saaf. Pehle Solution class. Iske andar two sum ka optimal answer aayega.",
    english: "Clean board. First the Solution class. The optimal two sum answer will live inside it.",
    hindi: "बोर्ड साफ़। पहले Solution क्लास। टू सम का ऑप्टिमल जवाब इसके अंदर आएगा।",
  },
  {
    match: /^public:/,
    hinglish: "Public isliye taaki judge function call kar sake. Yeh chhoti formal line hai.",
    english: "Public so the judge can call our function. It is a small formal line.",
    hindi: "पब्लिक इसलिए ताकि जज फ़ंक्शन कॉल कर सके।",
  },
  {
    match: /twoSum/,
    hinglish:
      "Signature dekho. nums array aayega, target aayega, aur hum do indexes return karenge. Numbers nahi, indexes. Yeh yaad rakhna.",
    english:
      "Look at the signature. We get the nums array and the target, and we return two indexes. Not the numbers, the indexes. Remember that.",
    hindi: "सिग्नेचर देखो। नम्स और टारगेट आएगा, हम दो इंडेक्स रिटर्न करेंगे। नंबर नहीं, इंडेक्स।",
  },
  {
    match: /unordered_map/,
    hinglish:
      "Ab diary. unordered map. Key value hogi, value index hoga. Matlab number dikha to uska ghar number yaad.",
    english:
      "Now the diary. An unordered map. The key is the number, the value is its index. When a number appears, we remember its house number.",
    hindi: "अब डायरी। अनऑर्डर्ड मैप। की नंबर, वैल्यू इंडेक्स। नंबर दिखे तो उसका घर याद।",
  },
  {
    match: /for\s*\(\s*int i/,
    hinglish:
      "Loop ek hi baar. i zero se size tak. Nested loop mat sochna, warna slow ho jaayega.",
    english:
      "One loop only. i from zero to size. Do not invent a nested loop, or it becomes slow.",
    hindi: "लूप एक ही बार। आई ज़ीरो से साइज़ तक। नेस्टेड लूप मत सोचना।",
  },
  {
    match: /need\s*=/,
    hinglish:
      "Ruko. Yeh core line hai. Current nums i hai. Partner chahiye target minus nums i. Is number ko need bolte hain.",
    english:
      "Pause. This is the core line. Current value is nums i. The partner we want is target minus nums i. We call that need.",
    hindi: "रुको। यह कोर लाइन है। करंट नम्स आई है। पार्टनर है टारगेट माइनस नम्स आई। इसे नीड कहते हैं।",
  },
  {
    match: /seen\.count/,
    hinglish:
      "Diary se poocho: need pehle aa chuki hai kya? Agar haan, to uska index aur ab wala i, dono milakar answer ready.",
    english:
      "Ask the diary: have we already seen need? If yes, take its stored index and the current i. Together that is the answer.",
    hindi: "डायरी से पूछो: नीड पहले आ चुकी है क्या? हाँ तो उसका इंडेक्स और अभी वाला आई, दोनों जवाब।",
  },
  {
    match: /return\s*\{\s*seen/,
    hinglish: "Hit! Pair mil gaya. seen of need pehle wala index, i current index. Return kar do.",
    english: "Hit! Pair found. seen of need is the earlier index, i is the current one. Return them.",
    hindi: "हिट! पेयर मिल गया। सीन ऑफ नीड पुराना इंडेक्स, आई करंट। रिटर्न करो।",
  },
  {
    match: /seen\[nums/,
    hinglish:
      "Need nahi mili. Koi baat nahi. Current number ko diary mein rakh do, index ke saath. Agli baar kaam aayega.",
    english:
      "Need was missing. That is fine. Put the current number into the diary with its index. It will help on a later step.",
    hindi: "नीड नहीं मिली। कोई बात नहीं। करंट नंबर डायरी में इंडेक्स के साथ रख दो।",
  },
  {
    match: /return\s*\{\s*\}/,
    hinglish: "Safety return. Problem kehta hai solution hamesha hai, phir bhi empty return rakhte hain compile ke liye.",
    english: "Safety return. The problem says a solution always exists, but we still keep an empty return for the compiler.",
    hindi: "सेफ़्टी रिटर्न। सॉल्यूशन हमेशा है, फिर भी कंपाइलर के लिए एम्प्टी रिटर्न रखते हैं।",
  },
];

export type CodeLectureOptions = {
  /** Override solution code (e.g. easy / medium / best tier). */
  code?: string;
  tierLabel?: string;
  complexity?: string;
};

export function codeLectureForProblem(problem: Problem, opts?: CodeLectureOptions): CodeLectureScript {
  const guide = guideForProblem(problem);
  const code = (opts?.code || guide.code || problem.solutionCode || problem.starterCode || "").trim();
  const complexity = opts?.complexity || guide.complexity;
  const tierBit = opts?.tierLabel ? ` (${opts.tierLabel})` : "";
  const lines = code.split(/\r?\n/).map(clean);
  const fnName = detectFnName(code);
  const steps: CodeLectureStep[] = [];
  const isHashTwoSum =
    (problem.id === "two-sum" || problem.id === "two-sum-hash") && /unordered_map/.test(code);

  steps.push({
    codeSoFar: "",
    focusLine: -1,
    lineText: "",
    say: `Chalo dheere se. ${problem.title}${tierBit} ka code hum line by line likhenge. Har line pe main bataunga yeh kyun likhi, sirf kya likhi nahi.`,
    sayEn: `Slow down with me. We will write the ${problem.title}${tierBit} code line by line. On every line I will tell you why it is there, not only what it is.`,
    sayHi: `चलो धीरे से। ${problem.title}${tierBit} का कोड लाइन बाय लाइन लिखेंगे। हर लाइन पर बताऊँगा यह क्यों है।`,
  });

  const specials = isHashTwoSum ? TWO_SUM_LINES : [];
  const built: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    built.push(line);
    let explain = explainCppLine(line, fnName, problem.title);
    if (explain === "skip") continue;

    const hit = specials.find((s) => s.match.test(line.trim()));
    if (hit) {
      explain = { hinglish: hit.hinglish, english: hit.english, hindi: hit.hindi };
    }

    steps.push({
      codeSoFar: built.join("\n"),
      focusLine: i,
      lineText: line,
      say: explain.hinglish,
      sayEn: explain.english,
      sayHi: explain.hindi,
    });
  }

  steps.push({
    codeSoFar: built.join("\n"),
    focusLine: Math.max(0, built.length - 1),
    lineText: "",
    say: `Bas. Poora flow clear hona chahiye. Complexity ${complexity}. Ab editor mein khud type karo, dekhte dekhte nahi, sochte sochte.`,
    sayEn: `Done. The whole flow should feel clear. Complexity ${complexity}. Now type it in the editor yourself, thinking, not just copying.`,
    sayHi: `बस। पूरा फ्लो क्लियर होना चाहिए। कॉम्प्लेक्सिटी ${complexity}। अब एडिटर में खुद टाइप करो।`,
  });

  return {
    id: `${problem.id}-code-lecture-${opts?.tierLabel || "default"}`,
    title: `${problem.title} — Code Lecture${tierBit}`,
    complexity,
    steps,
  };
}
