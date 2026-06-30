// Shared domain types for Schutzengel — a business-development case platform
// where you crack real cases and present your thinking on video.

// The four BD case-type buckets (internally still named `Field`).
export type Field =
  | "Strategy & Market"
  | "Growth & GTM"
  | "Partnerships"
  | "Deals & Pipeline";

export interface Company {
  name: string;
  blurb: string;
}

export interface Challenge {
  id: string;
  company: Company;
  title: string;
  field: Field; // case type
  /** One-line hook shown on cards. */
  summary: string;
  /** The full case: context + the question to crack. */
  brief: string;
  /** What the candidate should produce. */
  deliverables: string[];
  /** What this case is vetting for. */
  skillsVetted: string[];
  /** What "good" looks like — drives AI evaluation + candidate feedback. */
  evaluationCriteria: string[];
  effort: string; // e.g. "2–3 hours"
  reward: string; // what cracking it earns the candidate
  custom?: boolean; // true when posted by a company in-app
}

export type SubmissionStatus =
  | "submitted"
  | "reviewing"
  | "shortlisted"
  | "hired"
  | "passed";

export interface CriterionScore {
  criterion: string;
  score: number; // 0–100
  note: string;
}

/** Company-facing AI read of a submission's written key points. */
export interface AiEval {
  overall: number; // 0–100
  fitSummary: string;
  criteriaScores: CriterionScore[];
  strengths: string[];
  concerns: string[];
  recommendation: "advance" | "maybe" | "pass";
  demo?: boolean;
}

/** Candidate-facing AI coaching on their own submission. */
export interface AiFeedback {
  overall: number; // 0–100
  summary: string;
  strengths: string[];
  improvements: string[];
  demo?: boolean;
}

export interface Submission {
  id: string;
  challengeId: string;
  seekerName: string;
  /** Written key points of the recommendation (what the AI reads). */
  writeup: string;
  links: string[];
  /** Whether a video presentation was attached — the core deliverable. */
  hasVideo?: boolean;
  submittedAt: string; // ISO
  status: SubmissionStatus;
  aiEval?: AiEval;
  companyFeedback?: string;
}
