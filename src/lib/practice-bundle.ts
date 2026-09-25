import type { Problem } from "./types";
import { codeLectureForProblem, type CodeLectureScript } from "./code-lecture";
import { guideForProblem, type SolutionGuide } from "./solution-guides";
import {
  hasHandTiers,
  tiersForProblem,
  visibleTiersForProblem,
  type SolutionTier,
  type TierSolution,
} from "./solution-tiers";
import { scriptForProblem } from "./walkthrough";
import type { TeacherShowScript } from "./teacher-shows";

export type PracticeBundle = {
  guide: SolutionGuide;
  tiers: { easy: TierSolution; medium: TierSolution; best: TierSolution };
  visibleTiers: SolutionTier[];
  handCrafted: boolean;
  script: TeacherShowScript;
  lectures: Record<SolutionTier, CodeLectureScript>;
};

/** Server-only prep so the client does not ship every problem's solution text. */
export function buildPracticeBundle(problem: Problem): PracticeBundle {
  const guide = guideForProblem(problem);
  const tiers = tiersForProblem(problem);
  const visibleTiers = visibleTiersForProblem(problem);
  const handCrafted = hasHandTiers(problem.id);
  const script = scriptForProblem(problem);
  const lectures = {
    easy: codeLectureForProblem(problem, {
      code: tiers.easy.code,
      tierLabel: tiers.easy.label,
      complexity: tiers.easy.complexity,
    }),
    medium: codeLectureForProblem(problem, {
      code: tiers.medium.code,
      tierLabel: tiers.medium.label,
      complexity: tiers.medium.complexity,
    }),
    best: codeLectureForProblem(problem, {
      code: tiers.best.code,
      tierLabel: tiers.best.label,
      complexity: tiers.best.complexity,
    }),
  } as const;
  return { guide, tiers, visibleTiers, handCrafted, script, lectures };
}
