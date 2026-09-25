import type { TeacherShowScript } from "./teacher-shows";

/** Hand-crafted course shows — filled by generator / expanded over time. */
export const EXTRA_SHOWS: Record<string, TeacherShowScript> = {};

/** problem id → show id */
export const PROBLEM_SHOW_EXTRA: Record<string, string> = {};
