# ◆ Schutzengel

**Crack real business-development cases and present your thinking on video — and get hired on how you actually think.**

Not a traditional job board. The case *is* the application: companies post realistic BD cases, candidates work them and present their recommendation on camera, and that presentation is the hiring signal.

## Business development, broad — not just sales

Cases span four types, so it tests commercial *thinking*, not cold-selling:

| Case type | Example |
|---|---|
| **Strategy & Market** | "Should Vinea expand into the Nordics?" · "A rival undercut us 30% — respond." |
| **Growth & GTM** | "Take our self-serve tier to market." · "Redesign our pricing." |
| **Partnerships** | "Find and pitch 3 strategic partners." · "Design a channel-partner program." |
| **Deals & Pipeline** | "A €250k deal went cold — revive it." · "Prioritise 6 inbound leads." |

(Only 2 of 8 seed cases are deal/sales-flavoured.)

## The loop (both sides)

> Company posts a **BD case** → candidate works it and **records a 2–4 min video presentation** (+ written key points) → it lands in the company's **vetting console** → company **watches the presentation**, AI scores the written reasoning against the case's criteria → shortlist / hire + feedback → the candidate's cases stack into a **portfolio = proof of how they think.**

Switch sides with the **Seeker ⟷ Company** toggle in the nav — one browser plays both roles, so a presentation you submit shows up instantly in the console.

## What's built

**Seeker** — case library (filter by case type) · case detail · **video-first submission** (record presentation + key points + links) · instant **AI feedback** · **My Work** portfolio.

**Company** — **vetting console** (watch presentations, **AI evaluation** against the case's own criteria, shortlist/hire/pass, leave feedback) · **post a case** with optional **AI drafting**.

**Where AI sits:** it can't watch the video in this MVP, so it scores the **written key points**; humans watch the actual presentation. AI also drafts cases and coaches candidates. Everything runs in **demo mode** with no API key.

## Run it

Requires **Node 20+** (the default `node` here is v14 — use nvm):

```bash
nvm use            # → Node 20 (.nvmrc)
npm install        # already done once
npm run dev        # http://localhost:3000
```

**Demo vs. live AI:** no key → heuristic grading (fully clickable). Live → copy `.env.example` to `.env.local`, add `ANTHROPIC_API_KEY`. Default model `claude-opus-4-8`; set `SCHUTZENGEL_MODEL=claude-sonnet-4-6` for cheaper/faster calls.

## Structure

```
app/
  page.tsx                  Seeker — case library
  challenge/[id]/page.tsx   Seeker — the case + video-first submission + AI feedback
  me/page.tsx               Seeker — portfolio / My Work
  company/page.tsx          Company — vetting console
  company/new/page.tsx      Company — post a case (+ AI draft)
  api/{evaluate,feedback,draft-brief,status}/route.ts
lib/ challenges.ts fields.ts seed.ts store.ts types.ts anthropic.ts
components/ Nav.tsx ui.tsx VideoRecorder.tsx
```

## Next steps
- **Accounts + DB** (replace localStorage) — the biggest unlock.
- **Video upload + persistence** + (ideally) transcription so AI can assess the actual presentation.
- **Monetization** — company subscription + placement success fee.
