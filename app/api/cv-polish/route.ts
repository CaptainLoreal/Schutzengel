import { getClient, MODEL } from "@/lib/anthropic";

export const runtime = "nodejs";

interface Body {
  summary: string;
  headline?: string;
}

const SCHEMA = {
  type: "object",
  properties: { summary: { type: "string" } },
  required: ["summary"],
  additionalProperties: false,
} as const;

function demo(b: Body): { summary: string; demo: boolean } {
  const s = (b.summary || "").trim();
  const polished = s ? s.charAt(0).toUpperCase() + s.slice(1) + (/[.!?]$/.test(s) ? "" : ".") : s;
  return { summary: polished, demo: true };
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.summary?.trim()) return Response.json({ summary: "", demo: true });

  const client = getClient();
  if (!client) return Response.json(demo(body));

  const system = [
    "You are a sharp CV-writing coach. Rewrite the candidate's professional summary to be crisp, specific and confident.",
    "Rules: 2–4 sentences. Stay truthful to what they wrote — do not invent facts, employers, or metrics. No clichés ('hard-working team player'), no buzzword soup. Keep their voice.",
    body.headline ? `Their headline is: ${body.headline}.` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
      system,
      messages: [{ role: "user", content: `Improve this summary:\n\n${body.summary}` }],
      output_config: { format: { type: "json_schema", schema: SCHEMA } },
    });
    const raw = msg.content.find((x) => x.type === "text")?.text ?? "";
    return Response.json({ ...JSON.parse(raw), demo: false });
  } catch (err) {
    console.error("cv-polish error", err);
    return Response.json(demo(body));
  }
}
