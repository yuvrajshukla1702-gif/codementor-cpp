export type Difficulty = "Easy" | "Medium" | "Hard";

export type TestCase = {
  input: string;
  expected: string;
  hidden?: boolean;
};

export type Problem = {
  id: string;
  title: string;
  difficulty: Difficulty;
  topic: string;
  leetcodeSlug?: string;
  leetcodeId?: number;
  hackerrankSlug?: string;
  lesson: string;
  /** Full explained solution the student can open after the lesson */
  solutionExplain?: string;
  solutionCode?: string;
  /** Slow spoken walkthrough in three languages */
  narration?: Array<{ hinglish: string; english: string; hindi: string }>;
  starterCode: string;
  /** Full program: student edits only the function body region marked between markers */
  harness: string;
  tests: TestCase[];
  hints: [string, string, string];
};

export type Topic = {
  id: string;
  title: string;
  blurb: string;
  order: number;
  problemIds: string[];
};

export type Curriculum = {
  topics: Topic[];
  problems: Record<string, Problem>;
};
