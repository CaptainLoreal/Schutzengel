import { getClient, MODEL } from "@/lib/anthropic";
import type { AiEval } from "@/lib/types";

export const runtime = "nodejs";

interface ChallengeCtx {
  title: string;
  brief: string;
  deliverables: string[];
  evaluationCriteria: string[];
}
interface Body {
  challenge: ChallengeCtx;
  submission: { writeup: string; links: string[] };
}

const SCHEMA = {
  type: "object",
  properties: {
    overall: { type: "integer" },
    fitSummary: { type: "string" },
    criteriaScores: {
      type: "array",
      items: {
        type: "object",
        properties: {
          criterion: { type: "string" },
          score: { type: "integer" },
          note: { type: "string" },
        },
        required: ["criterion", "score", "note"],
        additionalProperties: false,
      },
    },
    strengths: { type: "array", items: { type: "string" } },
    concerns: { type: "array", items: { type: "string" } },
    recommendation: { type: "string", enum: ["advance", "maybe", "pass"] },
  },
  required: [
    "overall",
    "fitSummary",
    "criteriaScores",
    "strengths",
    "concerns",
    "recommendation",
  ],
  additionalProperties: false,
} as const;

function demoEval(b: Body): AiEval {
  const words = b.submission.writeup.split(/\s+/).filter(Boolean).length;
  const hasLinks = (b.submission.links?.length ?? 0) > 0;
  const base = Math.max(30, Math.min(90, 42 + Math.round(words / 8) + (hasLinks ? 8 : 0)));
  const criteriaScores = (b.challenge.evaluationCriteria ?? []).map((criterion, i) => ({
    criterion,
    score: Math.max(25, Math.min(95, base + (i % 2 === 0 ? 6 : -6))),
    note: "Heuristic estimate — set ANTHROPIC_API_KEY for a real evaluation.",
  }));
  return {
    overall: base,
    fitSummary: `${words}-word submission${hasLinks ? " with supporting links" : ""}. Demo grading only.`,
    criteriaScores,
    strengths: [words > 120 ? "Substantive, detailed response." : "Concise and to the point."],
    concerns: [words < 60 ? "Quite short — may lack depth." : "Verify the reasoning in an interview."],
    recommendation: base >= 70 ? "advance" : base >= 50 ? "maybe" : "pass",
    demo: true,
  };
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const client = getClient();
  if (!client) return Response.json(demoEval(body));

  const system = [
    "You are a sharp, fair hiring screener evaluating a candidate's response to a business-development case.",
    "The candidate also recorded a video presentation you cannot see — evaluate their WRITTEN key points and the quality of their case reasoning.",
    "Judge ONLY against the case's stated evaluation criteria. Be specific and reference what they actually wrote.",
    "Score each criterion 0–100 with a one-line note. 'overall' is your holistic 0–100 judgement.",
    "Give 2–3 concrete strengths and 1–3 honest concerns.",
    "'recommendation': 'advance' (worth interviewing), 'maybe' (borderline), or 'pass'.",
    "Do not be a pushover and do not be harsh — calibrate like an experienced reviewer screening many candidates.",
  ].join("\n");

  const content = [
    `CHALLENGE: ${body.challenge.title}`,
    `BRIEF: ${body.challenge.brief}`,
    `EXPECTED DELIVERABLES:\n- ${body.challenge.deliverables.join("\n- ")}`,
    `EVALUATION CRITERIA:\n- ${body.challenge.evaluationCriteria.join("\n- ")}`,
    "",
    `CANDIDATE SUBMISSION:\n${body.submission.writeup}`,
    body.submission.links?.length ? `LINKS: ${body.submission.links.join(", ")}` : "",
    "",
    "Evaluate this submission now. Include one criteriaScores entry per evaluation criterion.",
  ].join("\n");

  try {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 1600,
      system,
      messages: [{ role: "user", content }],
      output_config: { format: { type: "json_schema", schema: SCHEMA } },
    });
    const raw = msg.content.find((x) => x.type === "text")?.text ?? "";
    const evaluation = JSON.parse(raw) as AiEval;
    evaluation.demo = false;
    return Response.json(evaluation);
  } catch (err) {
    console.error("evaluate error", err);
    return Response.json(demoEval(body));
  }
}
