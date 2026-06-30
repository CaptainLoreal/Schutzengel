import { getClient, MODEL } from "@/lib/anthropic";

export const runtime = "nodejs";

interface Body {
  title: string;
  field: string;
  idea: string;
}

const SCHEMA = {
  type: "object",
  properties: {
    brief: { type: "string" },
    deliverables: { type: "array", items: { type: "string" } },
    evaluationCriteria: { type: "array", items: { type: "string" } },
  },
  required: ["brief", "deliverables", "evaluationCriteria"],
  additionalProperties: false,
} as const;

function demoDraft(b: Body) {
  return {
    brief:
      `${b.idea || b.title}. Describe your approach, walk through your reasoning, and share any supporting work. ` +
      "We care about how you think, not a perfect answer. (Demo draft — set ANTHROPIC_API_KEY for a tailored brief.)",
    deliverables: [
      "Your approach in plain language",
      "Your reasoning / key decisions",
      "Any supporting links or examples",
    ],
    evaluationCriteria: [
      "Is the approach sound and well-reasoned?",
      "Did they consider real constraints and edge cases?",
      "Is it communicated clearly?",
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
  if (!client) return Response.json(demoDraft(body));

  const system = [
    "You help a company write a great business-development case for a hiring platform.",
    "The case should mirror real BD work, be completable in a few hours, and reveal how a candidate thinks. Candidates present their answer as a short video plus written key points.",
    "Return a clear 'brief' (one tight paragraph addressed to the candidate), 3 concise 'deliverables', and 3 'evaluationCriteria' phrased as questions a reviewer would ask.",
  ].join("\n");

  const content = `FIELD: ${body.field}\nTITLE: ${body.title}\nWHAT THEY WANT TO TEST: ${body.idea}\n\nWrite the brief now.`;

  try {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 1200,
      system,
      messages: [{ role: "user", content }],
      output_config: { format: { type: "json_schema", schema: SCHEMA } },
    });
    const raw = msg.content.find((x) => x.type === "text")?.text ?? "";
    return Response.json({ ...JSON.parse(raw), demo: false });
  } catch (err) {
    console.error("draft-brief error", err);
    return Response.json(demoDraft(body));
  }
}
