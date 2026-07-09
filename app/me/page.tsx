"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { mySubmissions, getChallenge } from "@/lib/store";
import { FieldBadge, StatusBadge } from "@/components/ui";
import type { Submission } from "@/lib/types";

export default function MyWork() {
  const [mounted, setMounted] = useState(false);
  const [subs, setSubs] = useState<Submission[]>([]);

  useEffect(() => {
    setSubs(mySubmissions());
    setMounted(true);
  }, []);

  const completed = subs.length;
  const wins = subs.filter((s) => s.status === "hired" || s.status === "shortlisted").length;
  const fields = new Set(subs.map((s) => getChallenge(s.challengeId)?.field).filter(Boolean)).size;

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-8">
      <h1 className="text-3xl font-black tracking-tight">My Work</h1>
      <p className="mt-2 text-muted">
        Every case you present is real, portable experience — your proof of how you think.
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
        <Stat label="Completed" value={completed} />
        <Stat label="Shortlisted / hired" value={wins} />
        <Stat label="Case types" value={fields} />
      </div>

      {!mounted ? (
        <p className="mt-8 text-faint">Loading…</p>
      ) : subs.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-line bg-surface p-8 text-center">
          <p className="text-muted">You haven&apos;t completed a challenge yet.</p>
          <Link
            href="/"
            className="mt-3 inline-block rounded-lg bg-clay-500 px-4 py-2 text-sm font-semibold text-white hover:bg-clay-400"
          >
            Browse challenges
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {subs.map((s) => {
            const c = getChallenge(s.challengeId);
            return (
              <div key={s.id} className="rounded-2xl border border-line bg-surface p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      {c && <FieldBadge field={c.field} />}
                      <StatusBadge status={s.status} />
                      {s.hasVideo && <span className="text-xs text-muted">🎥 video</span>}
                    </div>
                    <h3 className="mt-2 font-bold">{c?.title ?? s.challengeId}</h3>
                    <p className="text-xs text-faint">
                      {c?.company.name} · submitted {new Date(s.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-sm text-body">
                  {s.writeup}
                </p>
                {s.companyFeedback && (
                  <div className="mt-3 rounded-lg border border-clay-500/20 bg-clay-500/[0.06] p-3 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-clay-700 dark:text-clay-300">
                      Company feedback
                    </p>
                    <p className="mt-1 text-body">{s.companyFeedback}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <p className="text-3xl font-black tabular-nums">{value}</p>
      <p className="mt-0.5 text-xs uppercase tracking-widest text-muted">{label}</p>
    </div>
  );
}
