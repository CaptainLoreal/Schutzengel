// Psychometric tests. Each is a set of Likert (1–5) statements that load onto
// trait dimensions; scoring normalises each dimension to 0–100.

export interface TestQuestion {
  text: string;
  dimension: string;
  reverse?: boolean;
}

export interface DimensionInfo {
  label: string;
  blurb: string;
}

export interface PsychTest {
  id: string;
  name: string;
  tagline: string;
  minutes: number;
  dimensions: string[];
  info: Record<string, DimensionInfo>;
  questions: TestQuestion[];
}

export const LIKERT = [
  "Strongly disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly agree",
];

export const TESTS: PsychTest[] = [
  {
    id: "work-personality",
    name: "Work Personality",
    tagline: "How you tend to operate — the Big Five, work-flavoured.",
    minutes: 3,
    dimensions: ["Openness", "Conscientiousness", "Extraversion", "Agreeableness", "Composure"],
    info: {
      Openness: { label: "Openness", blurb: "Curiosity and openness to new ideas and approaches." },
      Conscientiousness: { label: "Conscientiousness", blurb: "Organisation, planning and follow-through." },
      Extraversion: { label: "Extraversion", blurb: "Drawing energy from people and social settings." },
      Agreeableness: { label: "Agreeableness", blurb: "Cooperation and consideration for others." },
      Composure: { label: "Composure", blurb: "Staying calm and steady under pressure." },
    },
    questions: [
      { text: "I enjoy exploring new ideas and unfamiliar approaches.", dimension: "Openness" },
      { text: "I prefer sticking to methods I already know.", dimension: "Openness", reverse: true },
      { text: "I plan my work and follow through on what I start.", dimension: "Conscientiousness" },
      { text: "I often leave things until the last minute.", dimension: "Conscientiousness", reverse: true },
      { text: "Talking to lots of people energises me.", dimension: "Extraversion" },
      { text: "I'd rather work quietly on my own.", dimension: "Extraversion", reverse: true },
      { text: "I go out of my way to help others succeed.", dimension: "Agreeableness" },
      { text: "I put my own goals first, even at others' expense.", dimension: "Agreeableness", reverse: true },
      { text: "I stay calm when things get stressful.", dimension: "Composure" },
      { text: "Sudden changes of plan really rattle me.", dimension: "Composure", reverse: true },
    ],
  },
  {
    id: "career-interests",
    name: "Career Interests",
    tagline: "Which kind of business-development work fits you.",
    minutes: 2,
    dimensions: ["Strategy", "Growth", "Partnerships", "Deals"],
    info: {
      Strategy: { label: "Strategy & Market", blurb: "Analysing markets and finding the smart move." },
      Growth: { label: "Growth & GTM", blurb: "Creative, experimental ways to grow." },
      Partnerships: { label: "Partnerships", blurb: "Building relationships and win-wins." },
      Deals: { label: "Deals & Pipeline", blurb: "Driving deals and negotiations to a close." },
    },
    questions: [
      { text: "I like analysing markets to figure out the smart move.", dimension: "Strategy" },
      { text: "I enjoy digging into data to find the real story.", dimension: "Strategy" },
      { text: "I like inventing creative ways to reach new customers.", dimension: "Growth" },
      { text: "Running experiments to grow something excites me.", dimension: "Growth" },
      { text: "I enjoy building relationships and finding win-wins.", dimension: "Partnerships" },
      { text: "Connecting people and organisations energises me.", dimension: "Partnerships" },
      { text: "I like the thrill of moving a deal towards a close.", dimension: "Deals" },
      { text: "I'm comfortable navigating negotiations and objections.", dimension: "Deals" },
    ],
  },
  {
    id: "bd-aptitude",
    name: "BD Aptitude",
    tagline: "The traits that predict business-development success.",
    minutes: 2,
    dimensions: ["Drive", "Resilience", "Persuasion", "Curiosity"],
    info: {
      Drive: { label: "Drive", blurb: "Setting ambitious goals and chasing them." },
      Resilience: { label: "Resilience", blurb: "Bouncing back from rejection and setbacks." },
      Persuasion: { label: "Persuasion", blurb: "Bringing people around to your view." },
      Curiosity: { label: "Curiosity", blurb: "Digging beneath the surface of a problem." },
    },
    questions: [
      { text: "I set ambitious targets and go after them.", dimension: "Drive" },
      { text: "I keep pushing even when progress is slow.", dimension: "Drive" },
      { text: "I bounce back quickly from rejection.", dimension: "Resilience" },
      { text: "Setbacks motivate me more than they discourage me.", dimension: "Resilience" },
      { text: "I can bring people around to my point of view.", dimension: "Persuasion" },
      { text: "I enjoy making a compelling case for something.", dimension: "Persuasion" },
      { text: "I ask a lot of questions to understand a problem.", dimension: "Curiosity" },
      { text: "I dig beneath the surface before proposing a solution.", dimension: "Curiosity" },
    ],
  },
];

export function getTest(id: string): PsychTest | undefined {
  return TESTS.find((t) => t.id === id);
}

/** Score answers (aligned 1:1 with test.questions, 1–5) into 0–100 per dimension. */
export function scoreTest(
  test: PsychTest,
  answers: number[],
): { dimension: string; score: number }[] {
  return test.dimensions.map((dim) => {
    const vals = test.questions
      .map((q, i) => ({ q, a: answers[i] }))
      .filter((x) => x.q.dimension === dim && x.a)
      .map((x) => (x.q.reverse ? 6 - x.a : x.a));
    if (!vals.length) return { dimension: dim, score: 0 };
    const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
    return { dimension: dim, score: Math.round(((mean - 1) / 4) * 100) };
  });
}

export function topDimension(scores: { dimension: string; score: number }[]): string {
  return scores.reduce((a, b) => (b.score > a.score ? b : a), scores[0] ?? { dimension: "", score: 0 })
    .dimension;
}
