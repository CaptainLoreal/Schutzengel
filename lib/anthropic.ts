// Server-only Claude helper. Import this ONLY from API route handlers.
import Anthropic from "@anthropic-ai/sdk";

// Per the Claude API reference, default to the latest, most capable model.
// Override with SCHUTZENGEL_MODEL=claude-sonnet-4-6 for cheaper/faster calls.
export const MODEL = process.env.SCHUTZENGEL_MODEL || "claude-opus-4-8";

export const hasApiKey = Boolean(process.env.ANTHROPIC_API_KEY);

let client: Anthropic | null = null;

/** Returns a singleton Anthropic client, or null when no API key is set. */
export function getClient(): Anthropic | null {
  if (!hasApiKey) return null;
  if (!client) client = new Anthropic();
  return client;
}
