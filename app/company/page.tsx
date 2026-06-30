"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  allChallenges,
  allSubmissions,
  getChallenge,
  updateSubmission,
} from "@/lib/store";
import {
  FieldBadge,
  StatusBadge,
  ScoreBar,
  ScoreRing,
  RecPill,
  Spinner,
} from "@/components/ui";
import type { AiEval, Challenge, Submission, SubmissionStatus } from "@/lib/types";

export default function Console() {
  const [mounted, setMounted] = useState(false);
  const [subs, setSubs] = useState<Submission[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function refresh() {
    setSubs(allSubmissions());
  }

  useEffect(() => {
    refresh();
    setMounted(true);
  }, []);

  const challenges = useMemo(() => allChallenges(), [mounted]);
  const withSubs = challenges
    .map((c) => ({ challenge: c, items: subs.filter((s) => s.challengeId === c.id) }))
    .filter((g) => g.items.length > 0);

  const selected = subs.find((s) => s.id === selectedId) ?? null;
  const selectedChallenge = selected ? getChallenge(selected.challengeId) : undefined;

  const toReview = subs.filter((s) => s.status === "submitted").length;

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Vetting console</h1>
          <p className="mt-1 text-slate-400">
            Vet people by how they present their thinking — {subs.length} presentation
            {subs.length === 1 ? "" : "s"}, {toReview} to review.
          </p>
        </div>
        <Link
          href="/company/new"
          className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400"
        >
          + Post a challenge
        </Link>
      </div>

      {!mounted ? (
        <p className="mt-10 text-slate-500">Loading…</p>
      ) : withSubs.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-slate-400">
          No submissions yet. Switch to <span className="text-white">Seeker</span> and complete a
          challenge to see it flow into this console.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
          {/* List */}
          <div className="space-y-5">
            {withSubs.map(({ challenge, items }) => (
              <div key={challenge.id}>
                <div className="mb-2 flex items-center gap-2">
                  <FieldBadge field={challenge.field} />
                  <h2 className="text-sm font-semibold text-slate-200">{challenge.title}</h2>
                </div>
                <div className="space-y-1.5">
                  {items.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedId(s.id)}
                      className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition ${
                        selectedId === s.id
                          ? "border-indigo-400/50 bg-indigo-500/10"
                          : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="flex items-center gap-2 text-sm">
                        <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-700 text-xs font-bold">
                          {s.seekerName[0]}
                        </span>
                        {s.seekerName}
                        {s.aiEval && (
                          <span className="text-xs text-slate-500">· AI {s.aiEval.overall}</span>
                        )}
                      </span>
                      <StatusBadge status={s.status} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Detail */}
          <div>
            {selected && selectedChallenge ? (
              <ReviewPanel
                key={selected.id}
                submission={selected}
                challenge={selectedChallenge}
                onStatus={(status) => {
                  updateSubmission(selected.id, { status });
                  refresh();
                }}
                onEval={(aiEval) => {
                  updateSubmission(selected.id, { aiEval });
                  refresh();
                }}
                onFeedback={(companyFeedback) => {
                  updateSubmission(selected.id, { companyFeedback });
                  refresh();
                }}
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-slate-500">
                Select a submission to review it.
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

const DECISION_ACTIVE: Record<SubmissionStatus, string> = {
  hired: "bg-emerald-500/20 text-emerald-200 ring-emerald-500/40",
  shortlisted: "bg-indigo-500/20 text-indigo-200 ring-indigo-500/40",
  passed: "bg-rose-500/20 text-rose-200 ring-rose-500/40",
  submitted: "",
  reviewing: "",
};

function ReviewPanel({
  submission,
  challenge,
  onStatus,
  onEval,
  onFeedback,
}: {
  submission: Submission;
  challenge: Challenge;
  onStatus: (s: SubmissionStatus) => void;
  onEval: (e: AiEval) => void;
  onFeedback: (text: string) => void;
}) {
  const [evaluating, setEvaluating] = useState(false);
  const [feedbackText, setFeedbackText] = useState(submission.companyFeedback ?? "");
  const [savedFlash, setSavedFlash] = useState(false);

  async function runEval() {
    setEvaluating(true);
    try {
      const r = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          challenge: {
            title: challenge.title,
            brief: challenge.brief,
            deliverables: challenge.deliverables,
            evaluationCriteria: challenge.evaluationCriteria,
          },
          submission: { writeup: submission.writeup, links: submission.links },
        }),
      });
      onEval(await r.json());
    } catch {
      /* ignore */
    } finally {
      setEvaluating(false);
    }
  }

  const ev = submission.aiEval;
  const decisions: { s: SubmissionStatus; label: string }[] = [
    { s: "shortlisted", label: "Shortlist" },
    { s: "hired", label: "Hire" },
    { s: "passed", label: "Pass" },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-700 text-sm font-bold">
              {submission.seekerName[0]}
            </span>
            <div>
              <p className="font-bold">{submission.seekerName}</p>
              <p className="text-xs text-slate-500">
                {new Date(submission.submittedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <StatusBadge status={submission.status} />
      </div>

      {/* The work */}
      <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-widest text-slate-500">Key points</p>
          {submission.hasVideo ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-xs font-semibold text-indigo-300 ring-1 ring-indigo-500/30">
              🎥 Video presentation
            </span>
          ) : (
            <span className="text-xs text-slate-500">No video attached</span>
          )}
        </div>
        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-200">{submission.writeup}</p>
        {submission.links.length > 0 && (
          <div className="mt-3 border-t border-white/10 pt-2">
            <p className="text-xs text-slate-500">Links</p>
            <ul className="mt-1 space-y-0.5 text-sm text-indigo-300">
              {submission.links.map((l, i) => (
                <li key={i} className="truncate">
                  {l}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* AI evaluation */}
      <div className="mt-4">
        {!ev && !evaluating && (
          <button
            onClick={runEval}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-400/40 bg-indigo-500/10 px-4 py-2.5 text-sm font-semibold text-indigo-200 hover:bg-indigo-500/20"
          >
            ✦ Run AI evaluation
          </button>
        )}
        {evaluating && (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-white/10 py-4 text-sm text-slate-400">
            <Spinner /> Evaluating against the brief…
          </div>
        )}
        {ev && (
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.05] p-4">
            <div className="flex items-center gap-4">
              <ScoreRing value={ev.overall} size={92} />
              <div className="min-w-0">
                <div className="mb-1">
                  <RecPill rec={ev.recommendation} />
                </div>
                <p className="text-sm text-slate-300">{ev.fitSummary}</p>
                {ev.demo && (
                  <p className="mt-1 text-xs text-slate-500">
                    Demo grading — add an API key for real evaluation.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              {ev.criteriaScores.map((c, i) => (
                <ScoreBar key={i} label={c.criterion} value={c.score} note={c.note} />
              ))}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold text-emerald-300">Strengths</p>
                <ul className="mt-1 space-y-0.5 text-sm text-slate-300">
                  {ev.strengths.map((s, i) => (
                    <li key={i}>· {s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-300">Concerns</p>
                <ul className="mt-1 space-y-0.5 text-sm text-slate-300">
                  {ev.concerns.map((s, i) => (
                    <li key={i}>· {s}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Decision */}
      <div className="mt-4">
        <p className="mb-2 text-xs uppercase tracking-widest text-slate-500">Decision</p>
        <div className="flex flex-wrap gap-2">
          {decisions.map((d) => {
            const active = submission.status === d.s;
            return (
              <button
                key={d.s}
                onClick={() => onStatus(d.s)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold ring-1 transition ${
                  active
                    ? DECISION_ACTIVE[d.s]
                    : "bg-white/[0.03] text-slate-300 ring-white/10 hover:bg-white/[0.07]"
                }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback to candidate */}
      <div className="mt-4">
        <p className="mb-2 text-xs uppercase tracking-widest text-slate-500">
          Feedback to candidate
        </p>
        <textarea
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          rows={3}
          placeholder="Optional note the candidate will see in My Work…"
          className="scroll-thin w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none placeholder:text-slate-600 focus:border-indigo-400/50"
        />
        <button
          onClick={() => {
            onFeedback(feedbackText.trim());
            setSavedFlash(true);
            setTimeout(() => setSavedFlash(false), 1500);
          }}
          className="mt-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20"
        >
          {savedFlash ? "Saved ✓" : "Save feedback"}
        </button>
      </div>
    </div>
  );
}
