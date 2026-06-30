import type { Submission } from "./types";

// Sample submissions from other candidates so the company console isn't empty.
// Each is a video presentation + written key points. Fixed timestamps avoid
// hydration mismatches.
export const SEED_SUBMISSIONS: Submission[] = [
  {
    id: "seed-stacker-priya",
    challengeId: "stacker-gtm",
    seekerName: "Priya N.",
    writeup:
      "Recommendation: target solo analysts and 2–4 person data teams at seed/Series-A startups — they feel the pain but can't afford the sales-led tier.\n\n• Channels: SEO + a free template gallery, dbt/Slack communities, and a 'self-serve → sales-assist' tripwire when usage crosses a seat threshold.\n• Anti-cannibalisation: gate the self-serve tier below the features mid-market actually buys (SSO, audit logs, SLAs), and route anyone >10 seats to sales automatically.\n• Month one: ship the template gallery, instrument the upgrade trigger, and run one community launch.",
    links: [],
    hasVideo: true,
    submittedAt: "2026-06-28T10:15:00.000Z",
    status: "submitted",
  },
  {
    id: "seed-vinea-marco",
    challengeId: "vinea-nordics",
    seekerName: "Marco V.",
    writeup:
      "Recommendation: conditional GO — Denmark first, not Sweden/Norway.\n\n• Denmark has no state alcohol monopoly, so DTC shipping is viable; Sweden/Norway/Finland (Systembolaget/Vinmonopolet/Alko) would gut the subscription model.\n• Biggest risk: assuming the German playbook transfers — palate, price sensitivity and logistics differ.\n• Validate first: a cheap pre-launch landing page + paid test to 2 Danish cities to measure CAC and willingness-to-pay before any inventory or licensing spend.",
    links: [],
    hasVideo: true,
    submittedAt: "2026-06-28T16:40:00.000Z",
    status: "submitted",
  },
  {
    id: "seed-northwind-aisha",
    challengeId: "northwind-stalled",
    seekerName: "Aisha R.",
    writeup:
      "Diagnosis: most likely a stalled internal business case, not lost interest — procurement + 'budget season' + a competitor suggests the champion is stuck selling it upward, not ghosting us.\n\nNext 3 moves:\n1. Give the champion ammunition, not pressure — a one-page ROI/business case they can forward internally.\n2. Go multi-threaded: get a warm intro to the economic buyer so the deal doesn't live or die on one person.\n3. Create a reason to re-engage (a deadline-linked incentive or a procurement-friendly term), without discounting in panic.\nAvoid: 'just checking in' emails that add no value.",
    links: [],
    hasVideo: true,
    submittedAt: "2026-06-29T09:05:00.000Z",
    status: "reviewing",
  },
];
