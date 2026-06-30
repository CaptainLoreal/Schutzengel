import type { Field, SubmissionStatus } from "./types";

// The four business-development case types.
export const FIELDS: Field[] = [
  "Strategy & Market",
  "Growth & GTM",
  "Partnerships",
  "Deals & Pipeline",
];

// Light-first with a dark: text variant so badges read in both themes.
export const FIELD_STYLES: Record<Field, string> = {
  "Strategy & Market":
    "bg-indigo-500/15 text-indigo-700 ring-indigo-500/30 dark:text-indigo-300",
  "Growth & GTM":
    "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30 dark:text-emerald-300",
  Partnerships: "bg-amber-500/15 text-amber-700 ring-amber-500/30 dark:text-amber-300",
  "Deals & Pipeline": "bg-sky-500/15 text-sky-700 ring-sky-500/30 dark:text-sky-300",
};

export const STATUS_STYLES: Record<SubmissionStatus, string> = {
  submitted: "bg-slate-500/15 text-slate-700 ring-slate-500/30 dark:text-slate-300",
  reviewing: "bg-sky-500/15 text-sky-700 ring-sky-500/30 dark:text-sky-300",
  shortlisted: "bg-indigo-500/15 text-indigo-700 ring-indigo-500/30 dark:text-indigo-300",
  hired: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30 dark:text-emerald-300",
  passed: "bg-rose-500/15 text-rose-700 ring-rose-500/30 dark:text-rose-300",
};

export const STATUS_LABEL: Record<SubmissionStatus, string> = {
  submitted: "Submitted",
  reviewing: "Reviewing",
  shortlisted: "Shortlisted",
  hired: "Hired",
  passed: "Passed",
};
