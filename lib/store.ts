// Client-side shared store (localStorage). One browser plays both roles for
// the demo, so seeker submissions flow straight into the company console.
import { SEED_CHALLENGES, challengeById } from "./challenges";
import { SEED_SUBMISSIONS } from "./seed";
import type { Challenge, Submission } from "./types";

const KEY = "proofwork:v2";

export type Role = "seeker" | "company";

export interface Profile {
  name: string;
  headline: string;
  location: string;
  bio: string;
  links: string[];
}

const DEFAULT_PROFILE: Profile = {
  name: "You",
  headline: "",
  location: "",
  bio: "",
  links: [],
};

export interface Activity {
  streak: number;
  lastActiveDay: string | null;
}

interface DB {
  submissions: Submission[];
  customChallenges: Challenge[];
  role: Role;
  profile: Profile;
  activity: Activity;
}

function freshDB(): DB {
  return {
    submissions: SEED_SUBMISSIONS.map((s) => ({ ...s })),
    customChallenges: [],
    role: "seeker",
    profile: { ...DEFAULT_PROFILE },
    activity: { streak: 0, lastActiveDay: null },
  };
}

export function loadDB(): DB {
  if (typeof window === "undefined") return freshDB();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      const db = freshDB();
      window.localStorage.setItem(KEY, JSON.stringify(db));
      return db;
    }
    const parsed = JSON.parse(raw) as Partial<DB>;
    return {
      submissions: parsed.submissions ?? [],
      customChallenges: parsed.customChallenges ?? [],
      role: parsed.role ?? "seeker",
      profile: { ...DEFAULT_PROFILE, ...(parsed.profile ?? {}) },
      activity: {
        streak: parsed.activity?.streak ?? 0,
        lastActiveDay: parsed.activity?.lastActiveDay ?? null,
      },
    };
  } catch {
    return freshDB();
  }
}

function saveDB(db: DB) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(db));
}

export function allChallenges(): Challenge[] {
  const db = loadDB();
  return [...db.customChallenges, ...SEED_CHALLENGES];
}

export function getChallenge(id: string): Challenge | undefined {
  const db = loadDB();
  return challengeById(id, db.customChallenges);
}

export function getRole(): Role {
  return loadDB().role;
}

export function setRole(role: Role) {
  const db = loadDB();
  db.role = role;
  saveDB(db);
}

export function getSeekerName(): string {
  return loadDB().profile.name || "You";
}

export function getProfile(): Profile {
  return loadDB().profile;
}

export function setProfile(profile: Profile) {
  const db = loadDB();
  db.profile = profile;
  saveDB(db);
}

export function addChallenge(c: Challenge) {
  const db = loadDB();
  db.customChallenges = [c, ...db.customChallenges];
  saveDB(db);
}

export function addSubmission(s: Submission) {
  const db = loadDB();
  db.submissions = [s, ...db.submissions];
  saveDB(db);
}

export function updateSubmission(id: string, patch: Partial<Submission>) {
  const db = loadDB();
  db.submissions = db.submissions.map((s) => (s.id === id ? { ...s, ...patch } : s));
  saveDB(db);
}

export function getSubmission(id: string): Submission | undefined {
  return loadDB().submissions.find((s) => s.id === id);
}

export function submissionsForChallenge(challengeId: string): Submission[] {
  return loadDB()
    .submissions.filter((s) => s.challengeId === challengeId)
    .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
}

export function mySubmissions(): Submission[] {
  const db = loadDB();
  return db.submissions
    .filter((s) => s.seekerName === db.profile.name)
    .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
}

export function allSubmissions(): Submission[] {
  return loadDB().submissions.slice().sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function diffDays(a: string, b: string): number {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.round((db.getTime() - da.getTime()) / 86_400_000);
}

export function getStreak(): number {
  return loadDB().activity.streak;
}

/** Bumps the daily streak — call once when the user completes a case. */
export function recordActivity() {
  const db = loadDB();
  const today = dayKey(new Date());
  const last = db.activity.lastActiveDay;
  if (last === null) db.activity.streak = 1;
  else if (last !== today) {
    db.activity.streak = diffDays(last, today) === 1 ? db.activity.streak + 1 : 1;
  }
  db.activity.lastActiveDay = today;
  saveDB(db);
}
