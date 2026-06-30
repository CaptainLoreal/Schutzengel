// Client-side shared store (localStorage). One browser plays both roles for
// the demo, so seeker submissions flow straight into the company console.
import { SEED_CHALLENGES, challengeById } from "./challenges";
import { SEED_SUBMISSIONS } from "./seed";
import type { Challenge, Submission } from "./types";

const KEY = "proofwork:v2";

export type Role = "seeker" | "company";

interface DB {
  submissions: Submission[];
  customChallenges: Challenge[];
  role: Role;
  seekerName: string;
}

function freshDB(): DB {
  return {
    submissions: SEED_SUBMISSIONS.map((s) => ({ ...s })),
    customChallenges: [],
    role: "seeker",
    seekerName: "You",
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
      seekerName: parsed.seekerName ?? "You",
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
  return loadDB().seekerName;
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
    .filter((s) => s.seekerName === db.seekerName)
    .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
}

export function allSubmissions(): Submission[] {
  return loadDB().submissions.slice().sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
}
