// Career-progression layer: XP, ranks, and badges derived from the cases a
// candidate has completed. All values are computed from submissions, so they
// stay correct as outcomes (shortlisted / hired) change.
import type { Challenge, Submission } from "./types";

export interface Rank {
  name: string;
  min: number;
  next: number | null;
}

// BD-themed career ladder — progress signals demonstrated experience.
const RANKS: Rank[] = [
  { name: "Trainee", min: 0, next: 200 },
  { name: "Analyst", min: 200, next: 500 },
  { name: "Strategist", min: 500, next: 1000 },
  { name: "Principal", min: 1000, next: 1800 },
  { name: "Partner", min: 1800, next: null },
];

export function rankFor(xp: number): Rank {
  let r = RANKS[0];
  for (const x of RANKS) if (xp >= x.min) r = x;
  return r;
}

export function levelFor(xp: number): number {
  return Math.floor(xp / 200) + 1;
}

/** Base XP for a case, inferred from its effort. */
export function baseXp(effort: string): number {
  const e = effort.toLowerCase();
  if (e.includes("min")) return 80;
  const m = e.match(/(\d+)/);
  const n = m ? parseInt(m[1], 10) : 1;
  return n >= 2 ? 160 : 110;
}

function statusBonus(status: Submission["status"]): number {
  if (status === "hired") return 250;
  if (status === "shortlisted") return 100;
  return 0;
}

/** XP earned from a single submission: base + outcome + video bonus. */
export function caseXp(sub: Submission, ch?: Challenge): number {
  const base = ch ? baseXp(ch.effort) : 120;
  return base + statusBonus(sub.status) + (sub.hasVideo ? 20 : 0);
}

export function totalXp(
  subs: Submission[],
  getCh: (id: string) => Challenge | undefined,
): number {
  return subs.reduce((sum, s) => sum + caseXp(s, getCh(s.challengeId)), 0);
}

export interface Badge {
  id: string;
  label: string;
  desc: string;
  icon: string;
  earned: boolean;
}

export function badgesFor(
  subs: Submission[],
  getCh: (id: string) => Challenge | undefined,
  streak: number,
): Badge[] {
  const count = subs.length;
  const types = new Set(subs.map((s) => getCh(s.challengeId)?.field).filter(Boolean));
  const withVideo = subs.some((s) => s.hasVideo);
  const shortlisted = subs.some((s) => s.status === "shortlisted" || s.status === "hired");
  const hired = subs.some((s) => s.status === "hired");
  return [
    { id: "first", icon: "🎯", label: "First Case", desc: "Complete your first case", earned: count >= 1 },
    { id: "camera", icon: "🎥", label: "On Camera", desc: "Submit a video presentation", earned: withVideo },
    {
      id: "rounded",
      icon: "🧭",
      label: "Well-Rounded",
      desc: "Complete a case in all 4 case types",
      earned: types.size >= 4,
    },
    { id: "prolific", icon: "⚡", label: "Prolific", desc: "Complete 5 cases", earned: count >= 5 },
    { id: "radar", icon: "⭐", label: "On the Radar", desc: "Get shortlisted by a company", earned: shortlisted },
    { id: "hired", icon: "🏆", label: "Hired", desc: "Land a hire", earned: hired },
    { id: "streak", icon: "📅", label: "Consistent", desc: "Reach a 3-day streak", earned: streak >= 3 },
  ];
}
