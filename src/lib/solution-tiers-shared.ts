export type SolutionTier = "easy" | "medium" | "best";

export type TierSolution = {
  tier: SolutionTier;
  label: string;
  blurb: string;
  blurbEn: string;
  complexity: string;
  code: string;
  why: string;
  whyEn: string;
};

export const LABEL: Record<SolutionTier, string> = {
  easy: "Easy (beginner)",
  medium: "Medium",
  best: "Best (optimal)",
};

export function wrap(body: string) {
  return body.trim();
}

export function T(
  e: {
    blurb: string;
    blurbEn: string;
    complexity: string;
    why: string;
    whyEn: string;
    code: string;
  },
  m: typeof e,
  b: typeof e,
) {
  return {
    easy: { ...e, code: wrap(e.code), tier: "easy" as const, label: LABEL.easy },
    medium: { ...m, code: wrap(m.code), tier: "medium" as const, label: LABEL.medium },
    best: { ...b, code: wrap(b.code), tier: "best" as const, label: LABEL.best },
  };
}
