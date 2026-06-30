"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getChallenge,
  addSubmission,
  getSeekerName,
  mySubmissions,
  recordActivity,
  getStreak,
} from "@/lib/store";
import { FieldBadge, Chip, Spinner, scoreColor } from "@/components/ui";
import VideoRecorder from "@/components/VideoRecorder";
import { caseXp, badgesFor, type Badge } from "@/lib/gamification";
import type { AiFeedback, Challenge, Submission } from "@/lib/types";

export default function ChallengePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [challenge, setChallenge] = useState<Challenge | undefined>();
  const [already, setAlready] = useState(false);

  const [writeup, setWriteup] = useState("");
  const [links, setLinks] = useState("");
  const [hasVideo, setHasVideo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<AiFeedback | null>(null);
  const [done, setDone] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [unlocked, setUnlocked] = useState<Badge[]>([]);

  useEffect(() => {
    setChallenge(getChallenge(params.id));
    setAlready(mySubmissions().some((s) => s.challengeId === params.id));
    setMounted(true);
  }, [params.id]);

  async function submit() {
    if (!challenge || !writeup.trim() || submitting) return;
    setSubmitting(true);
    const prevBadges = badgesFor(mySubmissions(), getChallenge, getStreak());
    const linkArr = links
      .split(/[\n,]/)
      .map((l) => l.trim())
      .filter(Boolean);
    const sub: Submission = {
      id: `sub-${challenge.id}-${Date.now()}`,
      challengeId: challenge.id,
      seekerName: getSeekerName(),
      writeup: writeup.trim(),
      links: linkArr,
      hasVideo,
      submittedAt: new Date().toISOString(),
      status: "submitted",
    };
    addSubmission(sub);
    recordActivity();
    setXpEarned(caseXp(sub, challenge));
    const after = badgesFor(mySubmissions(), getChallenge, getStreak());
    setUnlocked(after.filter((b) => b.earned && !prevBadges.find((p) => p.id === b.id)?.earned));
    setDone(true);
    setSubmitting(false);
    try {
      const r = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          challenge: {
            title: challenge.title,
            brief: challenge.brief,
            evaluationCriteria: challenge.evaluationCriteria,
          },
          submission: { writeup: sub.writeup, links: sub.links },
        }),
      });
      setFeedback(await r.json());
    } catch {
      /* feedback is best-effort */
    }
  }

  if (!mounted) {
    return <main className="mx-auto max-w-5xl px-5 py-10 text-faint">Loading…</main>;
  }
  if (!challenge) {
    return (
      <main className="mx-auto max-w-md px-5 py-20 text-center">
        <p className="text-lg font-semibold">Case not found.</p>
        <Link href="/" className="mt-3 inline-block text-indigo-700 dark:text-indigo-300 hover:underline">
          ← Back to cases
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-8">
      <Link href="/" className="text-sm text-muted hover:text-fg">
        ← All cases
      </Link>
      <div className="mt-3 flex items-center gap-2">
        <FieldBadge field={challenge.field} />
        <span className="text-xs text-faint">⏱ {challenge.effort}</span>
      </div>
      <h1 className="mt-2 text-3xl font-black tracking-tight">{challenge.title}</h1>
      <p className="text-sm text-muted">
        {challenge.company.name} — {challenge.company.blurb}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
        {/* The case */}
        <section className="space-y-5">
          <div className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="text-xs uppercase tracking-widest text-muted">The case</h2>
            <p className="mt-2 whitespace-pre-wrap text-fg">{challenge.brief}</p>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="text-xs uppercase tracking-widest text-muted">What to present</h2>
            <ul className="mt-2 space-y-1 text-sm text-fg">
              {challenge.deliverables.map((d, i) => (
                <li key={i}>• {d}</li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-faint">Vetting for:</span>
            {challenge.skillsVetted.map((s) => (
              <Chip key={s}>{s}</Chip>
            ))}
          </div>
          <p className="text-xs text-faint">🏆 {challenge.reward}</p>
        </section>

        {/* Submit panel — video first */}
        <aside>
          {done ? (
            <SubmittedPanel
              feedback={feedback}
              onMyWork={() => router.push("/me")}
              xpEarned={xpEarned}
              unlocked={unlocked}
            />
          ) : already ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5 text-center">
              <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                ✓ You&apos;ve already presented on this case.
              </p>
              <Link
                href="/me"
                className="mt-3 inline-block rounded-lg bg-panel px-4 py-2 text-sm font-semibold hover:bg-panel-strong"
              >
                View in My Work
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-line bg-surface p-5">
              <h2 className="font-bold">Present your solution</h2>
              <p className="mt-1 text-xs text-muted">
                Record your recommendation, then add a few written key points.
              </p>

              <div className="mt-3">
                <VideoRecorder onUsed={setHasVideo} />
              </div>

              <label className="mt-4 block">
                <span className="mb-1 block text-xs uppercase tracking-widest text-muted">
                  Key points of your recommendation
                </span>
                <textarea
                  value={writeup}
                  onChange={(e) => setWriteup(e.target.value)}
                  rows={6}
                  placeholder="The headline of your recommendation + the reasoning behind it…"
                  className="scroll-thin w-full resize-none rounded-xl border border-line bg-input px-3 py-2 text-sm outline-none placeholder:text-faint focus:border-indigo-400/50"
                />
              </label>

              <input
                value={links}
                onChange={(e) => setLinks(e.target.value)}
                placeholder="Links (deck, sheet, doc) — comma separated"
                className="mt-2 w-full rounded-xl border border-line bg-input px-3 py-2 text-sm outline-none placeholder:text-faint focus:border-indigo-400/50"
              />

              <button
                onClick={submit}
                disabled={!writeup.trim() || submitting}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-40"
              >
                {submitting ? (
                  <>
                    <Spinner /> Submitting…
                  </>
                ) : (
                  "Submit presentation"
                )}
              </button>
              <p className="mt-2 text-center text-xs text-faint">
                {hasVideo
                  ? "Video attached. You'll get instant AI feedback."
                  : "Your video is the main event — companies watch it to vet you."}
              </p>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}

function SubmittedPanel({
  feedback,
  onMyWork,
  xpEarned,
  unlocked,
}: {
  feedback: AiFeedback | null;
  onMyWork: () => void;
  xpEarned: number;
  unlocked: Badge[];
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
          ✓
        </span>
        <h2 className="font-bold">Presented!</h2>
      </div>
      <p className="mt-2 text-sm text-muted">It&apos;s now in the company&apos;s review queue.</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-sm font-bold text-indigo-700 ring-1 ring-indigo-500/30 dark:text-indigo-300">
          +{xpEarned} XP
        </span>
        {unlocked.map((b) => (
          <span
            key={b.id}
            className="rounded-full bg-amber-500/15 px-3 py-1 text-sm font-semibold text-amber-700 ring-1 ring-amber-500/30 dark:text-amber-300"
          >
            {b.icon} {b.label} unlocked
          </span>
        ))}
      </div>

      {feedback ? (
        <div className="mt-4 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.06] p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
              Instant AI feedback
            </p>
            <span className={`text-lg font-bold ${scoreColor(feedback.overall)}`}>
              {feedback.overall}
            </span>
          </div>
          <p className="mt-2 text-sm text-body">{feedback.summary}</p>
          <div className="mt-3 space-y-3">
            <div>
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Strengths</p>
              <ul className="mt-1 space-y-0.5 text-sm text-body">
                {feedback.strengths.map((s, i) => (
                  <li key={i}>· {s}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">To improve</p>
              <ul className="mt-1 space-y-0.5 text-sm text-body">
                {feedback.improvements.map((s, i) => (
                  <li key={i}>· {s}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-4 flex items-center gap-2 text-sm text-faint">
          <Spinner /> Getting your feedback…
        </p>
      )}

      <button
        onClick={onMyWork}
        className="mt-4 w-full rounded-xl bg-panel px-4 py-2.5 text-sm font-semibold hover:bg-panel-strong"
      >
        View in My Work
      </button>
    </div>
  );
}
