import { getClient, MODEL } from "@/lib/anthropic";
import type { AiFeedback } from "@/lib/types";

export const runtime = "nodejs";

interface Body {
  challenge: { title: string; brief: string; evaluationCriteria: string[] };
  submission: { writeup: string; links: string[] };
}

const SCHEMA = {
  type: "object",
  properties: {
    overall: { type: "integer" },
    summary: { type: "string" },
    strengths: { type: "array", items: { type: "string" } },
    improvements: { type: "array", items: { type: "string" } },
  },
  required: ["overall", "summary", "strengths", "improvements"],
  additionalProperties: false,
} as const;

function demoFeedback(b: Body): AiFeedback {
  const words = b.submission.writeup.split(/\s+/).filter(Boolean).length;
  const score = Math.max(35, Math.min(92, 45 + Math.round(words / 8)));
  return {
    overall: score,
    summary:
      "Demo feedback — set ANTHROPIC_API_KEY for real, tailored coaching on your submission.",
    strengths: [words > 120 ? "You gave a detailed, substantive answer." : "Clear and concise."],
    improvements: [
      words < 60 ? "Add more depth and a concrete example." : "Tie each point back to the brief's criteria.",
      "Show your reasoning, not just your conclusion.",
    ],
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
  if (!client) return Response.json(demoFeedback(body));

  const system = [
    "You are an encouraging but honest coach giving a young job seeker feedback on the business-development case they just presented.",
    "They recorded a video presentation (which you cannot see) plus the written key points below — coach them on the substance of their thinking.",
    "Be warm and constructive — this is for THEM, to help them grow. Never harsh.",
    "Give an 'overall' 0–100 self-improvement score, a short summary, 2–3 genuine strengths, and 2–3 specific, actionable improvements tied to the challenge's criteria.",
  ].join("\n");

  const content = [
    `CHALLENGE: ${body.challenge.title}`,
    `BRIEF: ${body.challenge.brief}`,
    `WHAT GOOD LOOKS LIKE:\n- ${body.challenge.evaluationCriteria.join("\n- ")}`,
    "",
    `THEIR SUBMISSION:\n${body.submission.writeup}`,
    body.submission.links?.length ? `LINKS: ${body.submission.links.join(", ")}` : "",
    "",
    "Give them feedback now.",
  ].join("\n");

  try {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 1000,
      system,
      messages: [{ role: "user", content }],
      output_config: { format: { type: "json_schema", schema: SCHEMA } },
    });
    const raw = msg.content.find((x) => x.type === "text")?.text ?? "";
    const fb = JSON.parse(raw) as AiFeedback;
    fb.demo = false;
    return Response.json(fb);
  } catch (err) {
    console.error("feedback error", err);
    return Response.json(demoFeedback(body));
  }
}
