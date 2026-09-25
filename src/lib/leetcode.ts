const LC_GQL = "https://leetcode.com/graphql";

async function lcFetch(query: string, variables: Record<string, unknown>, session?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Referer: "https://leetcode.com/",
    Origin: "https://leetcode.com",
  };
  if (session) headers.Cookie = `LEETCODE_SESSION=${session}`;

  const res = await fetch(LC_GQL, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`LeetCode HTTP ${res.status}`);
  return res.json();
}

export type LcProfile = {
  username: string;
  ranking: number | null;
  solved: { all: number; easy: number; medium: number; hard: number };
  tags: Array<{ name: string; count: number }>;
  recent: Array<{ title: string; titleSlug: string; lang: string; timestamp: string }>;
};

export async function fetchLcProfile(username: string): Promise<LcProfile> {
  const query = `
  query($username: String!) {
    matchedUser(username: $username) {
      username
      profile { ranking }
      submitStatsGlobal { acSubmissionNum { difficulty count } }
      tagProblemCounts {
        fundamental { tagName problemsSolved }
        intermediate { tagName problemsSolved }
        advanced { tagName problemsSolved }
      }
    }
    recentAcSubmissionList(username: $username, limit: 30) {
      title titleSlug timestamp lang
    }
  }`;
  const json = await lcFetch(query, { username });
  const u = json?.data?.matchedUser;
  if (!u) throw new Error("LeetCode user not found");
  const ac = u.submitStatsGlobal?.acSubmissionNum || [];
  const pick = (d: string) => ac.find((x: { difficulty: string }) => x.difficulty === d)?.count ?? 0;
  const tags = [
    ...(u.tagProblemCounts?.fundamental || []),
    ...(u.tagProblemCounts?.intermediate || []),
    ...(u.tagProblemCounts?.advanced || []),
  ].map((t: { tagName: string; problemsSolved: number }) => ({
    name: t.tagName,
    count: t.problemsSolved,
  }));
  return {
    username: u.username,
    ranking: u.profile?.ranking ?? null,
    solved: { all: pick("All"), easy: pick("Easy"), medium: pick("Medium"), hard: pick("Hard") },
    tags,
    recent: (json?.data?.recentAcSubmissionList || []).map(
      (r: { title: string; titleSlug: string; lang: string; timestamp: string }) => r
    ),
  };
}

export async function submitToLeetCode(params: {
  session: string;
  titleSlug: string;
  code: string;
  lang?: string;
}): Promise<{ submissionId?: number; error?: string }> {
  const session = params.session.trim();
  if (!session) return { error: "Missing LEETCODE_SESSION cookie" };

  // Resolve question id
  const q = await lcFetch(
    `query($titleSlug: String!) { question(titleSlug: $titleSlug) { questionId titleSlug } }`,
    { titleSlug: params.titleSlug },
    session
  );
  const questionId = q?.data?.question?.questionId;
  if (!questionId) return { error: "Could not resolve LeetCode question id (login/session?)" };

  const lang = params.lang || "cpp";
  const submitQuery = `
    mutation submit($lang: String!, $questionId: String!, $typedCode: String!, $titleSlug: String!) {
      submitCode(lang: $lang, questionId: $questionId, typedCode: $typedCode, titleSlug: $titleSlug) {
        submission_id: submissionId
      }
    }`;
  try {
    const sub = await lcFetch(
      submitQuery,
      {
        lang,
        questionId: String(questionId),
        typedCode: params.code,
        titleSlug: params.titleSlug,
      },
      session
    );
    const submissionId = sub?.data?.submitCode?.submission_id ?? sub?.data?.submitCode?.submissionId;
    if (!submissionId) {
      return {
        error:
          "Submit rejected. Refresh LEETCODE_SESSION from browser DevTools → Application → Cookies. Unofficial API may change.",
      };
    }
    return { submissionId: Number(submissionId) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "submit failed" };
  }
}

export async function pollLcSubmission(session: string, submissionId: number) {
  for (let i = 0; i < 20; i++) {
    const json = await lcFetch(
      `query($id: ID!) { submissionDetails(submissionId: $id) { statusCode statusMsg runtime memory code } }`,
      { id: submissionId },
      session
    );
    const d = json?.data?.submissionDetails;
    if (d && d.statusCode !== null && d.statusCode !== undefined && d.statusMsg) {
      // 10 = Accepted typically; pending states vary
      if (d.statusMsg !== "Pending" && d.statusMsg !== "Judging") {
        return d;
      }
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  return { statusMsg: "Timeout waiting for LeetCode verdict" };
}
