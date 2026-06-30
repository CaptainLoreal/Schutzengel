import { hasApiKey, MODEL } from "@/lib/anthropic";

export const runtime = "nodejs";

export async function GET() {
  return Response.json({ live: hasApiKey, model: hasApiKey ? MODEL : null });
}
