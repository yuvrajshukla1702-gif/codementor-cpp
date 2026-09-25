export type HrScore = {
  slug: string;
  name: string;
  practiceScore: number;
  practiceRank: string;
};

export type HrChallenge = { slug: string; title: string };

export type HrProfile = {
  username: string;
  name: string;
  level: number | null;
  scores: HrScore[];
  recent: HrChallenge[];
};

const UA = {
  "User-Agent": "Mozilla/5.0",
  Accept: "application/json",
};

async function getJson(url: string) {
  const res = await fetch(url, { headers: UA, cache: "no-store" });
  if (!res.ok) throw new Error(`HackerRank HTTP ${res.status}`);
  return res.json();
}

export async function fetchHrProfile(username: string): Promise<HrProfile> {
  const user = username.trim() || "yuvrajshukla1702";
  const [profile, scores, recent] = await Promise.all([
    getJson(`https://www.hackerrank.com/rest/contests/master/hackers/${encodeURIComponent(user)}/profile`),
    getJson(`https://www.hackerrank.com/rest/hackers/${encodeURIComponent(user)}/scores_elo`),
    getJson(
      `https://www.hackerrank.com/rest/hackers/${encodeURIComponent(user)}/recent_challenges?offset=0&limit=100`,
    ),
  ]);

  const model = profile?.model || {};
  const scoreRows = Array.isArray(scores) ? scores : [];
  const challenges = Array.isArray(recent?.models) ? recent.models : [];

  return {
    username: model.username || user,
    name: model.name || user,
    level: typeof model.level === "number" ? model.level : null,
    scores: scoreRows
      .map((row: { slug?: string; name?: string; practice?: { score?: number; rank?: string | number } }) => ({
        slug: String(row.slug || ""),
        name: String(row.name || row.slug || ""),
        practiceScore: Number(row.practice?.score || 0),
        practiceRank: String(row.practice?.rank ?? ""),
      }))
      .filter((s: HrScore) => s.slug),
    recent: challenges
      .map((c: { slug?: string; name?: string; challenge_slug?: string; challenge_name?: string }) => ({
        slug: String(c.slug || c.challenge_slug || ""),
        title: String(c.name || c.challenge_name || c.slug || ""),
      }))
      .filter((c: HrChallenge) => c.slug),
  };
}
