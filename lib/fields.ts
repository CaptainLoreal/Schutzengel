import type { Field, SubmissionStatus } from "./types";

// The four business-development case types.
export const FIELDS: Field[] = [
  "Strategy & Market",
  "Growth & GTM",
  "Partnerships",
  "Deals & Pipeline",
];

export const FIELD_STYLES: Record<Field, string> = {
  "Strategy & Market": "bg-indigo-500/15 text-indigo-300 ring-indigo-500/30",
  "Growth & GTM": "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  Partnerships: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  "Deals & Pipeline": "bg-sky-500/15 text-sky-300 ring-sky-500/30",
};

export const STATUS_STYLES: Record<SubmissionStatus, string> = {
  submitted: "bg-slate-500/15 text-slate-300 ring-slate-500/30",
  reviewing: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
  shortlisted: "bg-indigo-500/15 text-indigo-300 ring-indigo-500/30",
  hired: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  passed: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
};

export const STATUS_LABEL: Record<SubmissionStatus, string> = {
  submitted: "Submitted",
  reviewing: "Reviewing",
  shortlisted: "Shortlisted",
  hired: "Hired",
  passed: "Passed",
};
