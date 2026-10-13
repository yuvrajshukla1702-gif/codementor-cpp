import type { StudioNav } from "@/components/PracticeStudio";
import { curriculum } from "./curriculum";
import type { Problem } from "./types";

/** Topic breadcrumb + prev/next for a problem. At the end of a topic, "next" rolls into the following topic. */
export function buildStudioNav(problem: Problem): StudioNav {
  const topic =
    curriculum.topics.find((t) => t.problemIds.includes(problem.id)) ??
    curriculum.topics.find((t) => t.id === problem.topic);
  const ids = topic?.problemIds.filter((pid) => curriculum.problems[pid]) ?? [problem.id];
  const at = ids.indexOf(problem.id);

  const pick = (pid: string | undefined) =>
    pid && curriculum.problems[pid] ? { id: pid, title: curriculum.problems[pid].title } : null;

  const ordered = [...curriculum.topics].sort((a, b) => a.order - b.order);
  const ti = ordered.findIndex((t) => t.id === topic?.id);
  const nextTopicFirst =
    ti >= 0
      ? ordered
          .slice(ti + 1)
          .map((t) => t.problemIds.find((pid) => curriculum.problems[pid]))
          .find(Boolean)
      : undefined;

  return {
    topicId: topic?.id ?? problem.topic,
    topicTitle: topic?.title ?? problem.topic,
    topicProblemIds: ids,
    position: at >= 0 ? { index: at + 1, total: ids.length } : null,
    prev: at > 0 ? pick(ids[at - 1]) : null,
    next: at >= 0 && at < ids.length - 1 ? pick(ids[at + 1]) : pick(nextTopicFirst),
  };
}
