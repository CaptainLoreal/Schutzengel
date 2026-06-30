import type { Challenge } from "./types";

// A common deliverable line for every case — the video presentation is the core.
const VIDEO = "A 2–4 minute video presentation of your recommendation";
const KEYPOINTS = "A few written key points of your recommendation";

// Seed cases — real business-development cases across the four case types.
// Only 2 of 8 are deal/sales-flavoured: BD here is broad, not all sales.
export const SEED_CHALLENGES: Challenge[] = [
  // ── Strategy & Market ───────────────────────────────────────────────
  {
    id: "vinea-nordics",
    company: { name: "Vinea", blurb: "A direct-to-consumer wine club." },
    title: "Should Vinea expand into the Nordics?",
    field: "Strategy & Market",
    summary: "Make the go/no-go call on a new region — and defend it.",
    brief:
      "Vinea sells curated wine subscriptions in Germany and Austria (28k members, +4%/month). Leadership is tempted by the Nordics — high disposable income, strong e-commerce — but alcohol there is heavily regulated, with state retail monopolies in Sweden, Norway and Finland. Should Vinea enter? If so, which market first and how would you get around the constraints? Give a clear recommendation and walk us through your reasoning, the single biggest risk, and what you'd validate before spending real budget.",
    deliverables: [
      "A clear go / no-go call (and which market first)",
      "Your reasoning + the single biggest risk",
      "What you'd validate before committing budget",
      VIDEO,
      KEYPOINTS,
    ],
    skillsVetted: ["Market analysis", "Strategic judgement", "Handling ambiguity"],
    evaluationCriteria: [
      "Is there a clear, defensible recommendation rather than fence-sitting?",
      "Did they engage with the regulatory reality instead of ignoring it?",
      "Is the risk and the validation plan concrete?",
    ],
    effort: "2–3 hours",
    reward: "Fast-track interview with the strategy team",
  },
  {
    id: "loop-rival",
    company: { name: "Loop", blurb: "A meal-kit delivery service." },
    title: "A funded rival just undercut us by 30% — how should Loop respond?",
    field: "Strategy & Market",
    summary: "Diagnose a competitive threat and recommend a response.",
    brief:
      "Loop is the #2 meal-kit brand in its market. A venture-backed competitor just launched at 30% below our price and is spending heavily on ads. Our customer-acquisition cost is creeping up and churn ticked up last month. Don't panic-match the price — analyse how serious the threat really is and recommend how Loop should respond over the next quarter. Be specific about what you would and explicitly would NOT do.",
    deliverables: [
      "Your read on the threat — how serious, and why",
      "A recommended response for the next quarter",
      "What you would explicitly NOT do",
      VIDEO,
      KEYPOINTS,
    ],
    skillsVetted: ["Competitive analysis", "Commercial judgement", "Prioritisation"],
    evaluationCriteria: [
      "Do they avoid the obvious trap (just matching price) with a reasoned alternative?",
      "Is the threat assessment grounded rather than hand-wavy?",
      "Are the recommendations specific and sequenced?",
    ],
    effort: "2–3 hours",
    reward: "Interview with the GM",
  },
  // ── Growth & GTM ────────────────────────────────────────────────────
  {
    id: "stacker-gtm",
    company: { name: "Stacker", blurb: "A B2B analytics platform." },
    title: "Take our new self-serve tier to market",
    field: "Growth & GTM",
    summary: "Design the go-to-market for a new product tier.",
    brief:
      "Stacker sells to mid-market data teams via a sales-led motion (avg deal €30k/yr). We're launching a cheaper self-serve tier (€99/mo, no salesperson) to reach smaller teams. Design the go-to-market: who exactly we target, which channels you'd use, how we avoid cannibalising the sales-led business, and the first three things you'd do in month one. Give a recommendation, not a menu of options.",
    deliverables: [
      "Target segment + positioning for the self-serve tier",
      "Channels and the month-one plan",
      "How to avoid cannibalising the sales-led motion",
      VIDEO,
      KEYPOINTS,
    ],
    skillsVetted: ["Go-to-market strategy", "Segmentation", "Commercial reasoning"],
    evaluationCriteria: [
      "Is the target segment specific and well-justified?",
      "Did they take cannibalisation seriously?",
      "Is the month-one plan concrete and realistic?",
    ],
    effort: "2–3 hours",
    reward: "Fast-track to a growth interview",
  },
  {
    id: "brightline-pricing",
    company: { name: "Brightline", blurb: "A scheduling app for clinics." },
    title: "Redesign our pricing & packaging",
    field: "Growth & GTM",
    summary: "Fix flat pricing that's leaving money on the table.",
    brief:
      "Brightline charges a flat €49/mo per clinic regardless of size — a 2-person practice pays the same as a 20-person one. Large clinics are clearly underpaying and small ones hesitate at the price. Redesign the pricing and packaging: show the tiers, the logic for what you charge on, and how you'd migrate existing customers without an uproar.",
    deliverables: [
      "A proposed tier / packaging structure",
      "The value metric you charge on, and why",
      "A migration plan for existing customers",
      VIDEO,
      KEYPOINTS,
    ],
    skillsVetted: ["Pricing strategy", "Value-based thinking", "Customer empathy"],
    evaluationCriteria: [
      "Does the pricing capture value from larger customers sensibly?",
      "Is the value metric well chosen?",
      "Is the migration plan realistic and low-drama?",
    ],
    effort: "1–2 hours",
    reward: "Interview with the commercial lead",
  },
  // ── Partnerships ────────────────────────────────────────────────────
  {
    id: "paython-partners",
    company: { name: "Paython", blurb: "A payments API for marketplaces." },
    title: "Find and pitch 3 strategic partners",
    field: "Partnerships",
    summary: "Identify partners that unlock distribution — and pitch one.",
    brief:
      "Paython grows mostly through slow direct sales. We think partnerships could unlock distribution. Identify three types of partner (or named companies) that would put Paython in front of the right customers, explain why each makes sense for BOTH sides, then actually pitch the most promising one: what's the deal, what each party gives and gets. We care about the reasoning and how you frame the pitch around the partner's interest.",
    deliverables: [
      "3 partner types/companies + why each fits (mutual value)",
      "A pitch for the most promising one (the deal shape)",
      "How you'd approach them",
      VIDEO,
      KEYPOINTS,
    ],
    skillsVetted: ["Partnership strategy", "Mutual-value thinking", "Deal framing"],
    evaluationCriteria: [
      "Are the partners genuinely well-matched (value for both sides)?",
      "Is the proposed deal structure realistic?",
      "Is the pitch framed around the partner's interest, not just Paython's?",
    ],
    effort: "2 hours",
    reward: "Intro to the partnerships lead",
  },
  {
    id: "forge-channel",
    company: { name: "Forge", blurb: "Developer tooling for data teams." },
    title: "Design a channel-partner program from scratch",
    field: "Partnerships",
    summary: "Build a program that gets others selling for you.",
    brief:
      "Forge wants consultancies and agencies to resell and implement our tooling, but we have no partner program today. Design one: who we'd recruit, what incentive structure would make them actually sell, what support they'd need, and how we'd know it's working. Be concrete — a real program someone could launch next quarter, not a vague framework.",
    deliverables: [
      "Who to recruit + the incentive structure",
      "The support partners would need",
      "How you'd measure success",
      VIDEO,
      KEYPOINTS,
    ],
    skillsVetted: ["Program design", "Incentive thinking", "Operational concreteness"],
    evaluationCriteria: [
      "Would the incentive structure actually motivate partners to sell?",
      "Is it concrete and launchable, not a generic framework?",
      "Are the success metrics meaningful?",
    ],
    effort: "2 hours",
    reward: "Interview with the partnerships team",
  },
  // ── Deals & Pipeline ────────────────────────────────────────────────
  {
    id: "northwind-stalled",
    company: { name: "Northwind", blurb: "Enterprise workforce software." },
    title: "A €250k deal went cold — diagnose and revive it",
    field: "Deals & Pipeline",
    summary: "Work out why a big deal stalled and what to do next.",
    brief:
      "A €250k/yr enterprise deal was progressing well — champion engaged, two demos done — then went silent for three weeks. What we know: procurement just got involved, a competitor is also in the running, and the champion offhandedly mentioned 'budget season is tricky.' Diagnose the most likely reasons it stalled, then lay out exactly how you'd try to revive it: your next three moves and the reasoning behind them.",
    deliverables: [
      "Your diagnosis of why it likely stalled",
      "Your next 3 concrete moves",
      "What you'd avoid doing",
      VIDEO,
      KEYPOINTS,
    ],
    skillsVetted: ["Deal judgement", "Stakeholder reasoning", "Composure under ambiguity"],
    evaluationCriteria: [
      "Is the diagnosis realistic and multi-causal, not just 'follow up more'?",
      "Are the next moves specific and well-reasoned?",
      "Do they show awareness of procurement / champion dynamics?",
    ],
    effort: "1–2 hours",
    reward: "Interview with the sales director",
  },
  {
    id: "reach-leads",
    company: { name: "Reach", blurb: "An SMB marketing platform." },
    title: "Prioritise 6 inbound leads with limited time",
    field: "Deals & Pipeline",
    summary: "Decide who to chase first — and justify it.",
    brief:
      "You have time to properly work only 3 of 6 inbound leads this week. They vary: a tiny startup that filled out the demo form twice; a mid-size company whose junior employee is 'just researching'; a big enterprise with a vague inquiry; a perfect-fit company that went quiet after one reply; a competitor (probably snooping); and a warm referral from an existing customer. Rank all six, pick your top three, and explain your prioritisation logic and how you'd approach each differently.",
    deliverables: [
      "Your ranking of all 6 + your top 3",
      "The logic behind your prioritisation",
      "How you'd approach your top 3 differently",
      VIDEO,
      KEYPOINTS,
    ],
    skillsVetted: ["Qualification", "Prioritisation", "Commercial instinct"],
    evaluationCriteria: [
      "Is the prioritisation logic sound (fit + intent + effort)?",
      "Did they spot the traps (the competitor, 'just researching')?",
      "Is the approach tailored per lead rather than one-size-fits-all?",
    ],
    effort: "1 hour",
    reward: "Fast-track BD interview",
  },
];

export function challengeById(
  id: string,
  extra: Challenge[] = [],
): Challenge | undefined {
  return [...SEED_CHALLENGES, ...extra].find((c) => c.id === id);
}
