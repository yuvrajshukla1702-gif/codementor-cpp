import type { Problem } from "./types";
import type { TeacherShowScript } from "./teacher-shows";
import { getTeacherShow, problemShowMap } from "./teacher-shows";
import { synthesizeTeacherShow } from "./synthesize-show";
import { guideForProblem } from "./solution-guides";

export type { VoiceLang } from "./speech-cache";

export function scriptForProblem(problem: Problem): TeacherShowScript {
  const customId = problemShowMap[problem.id];
  if (customId) {
    const custom = getTeacherShow(customId);
    if (custom) {
      return {
        ...custom,
        steps: custom.steps.map((step) => ({
          ...step,
          sayEn: step.sayEn || step.say,
          sayHi: step.sayHi || step.sayEn || step.say,
          gesture: step.gesture || "explain",
        })),
      };
    }
  }

  return synthesizeTeacherShow(problem);
}

export function explainedSolution(problem: Problem) {
  return guideForProblem(problem);
}
