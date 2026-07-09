"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { allChallenges, mySubmissions, getPreferences } from "@/lib/store";
import { FIELDS } from "@/lib/fields";
import { FieldBadge, Chip } from "@/components/ui";
import { baseXp } from "@/lib/gamification";
import type { Challenge, Field } from "@/lib/types";

export default function Feed() {
  const [mounted, setMounted] = useState(false);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [submittedIds, setSubmittedIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<Field | "All">("All");
  const [setupDone, setSetupDone] = useState(true);

  useEffect(() => {
    setChallenges(allChallenges());
    setSubmittedIds(new Set(mySubmissions().map((s) => s.challengeId)));
    setSetupDone(getPreferences().setupComplete);
    setMounted(true);
  }, []);

  const shown = filter === "All" ? challenges : challenges.filter((c) => c.field === filter);

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Crack real business cases. Present on video.
        </h1>
        <p className="mt-2 text-muted">
          Real BD cases from real companies — strategy, growth, partnerships, deals. Work the case,
          present your thinking on camera, and get vetted on how you actually think.
        </p>
      </div>

      {!setupDone && (
        <Link
          href="/setup"
          className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-indigo-500/30 bg-indigo-500/[0.08] p-4"
        >
          <div>
            <p className="font-semibold text-indigo-700 dark:text-indigo-200">
              👋 New here? Set up your profile
            </p>
            <p className="text-sm text-muted">
              A 2-minute wizard: your strengths, interests, and the work you want.
            </p>
          </div>
          <span className="shrink-0 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white">
            Start setup →
          </span>
        </Link>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {(["All", ...FIELDS] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as Field | "All")}
            className={`rounded-full px-3 py-1.5 text-sm ring-1 transition ${
              filter === f
                ? "bg-panel-strong text-fg ring-line"
                : "text-muted ring-line hover:text-fg"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {!mounted ? (
        <p className="mt-10 text-faint">Loading challenges…</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((c) => (
            <Link
              key={c.id}
              href={`/challenge/${c.id}`}
              className="group flex flex-col rounded-2xl border border-line bg-surface p-5 transition hover:border-indigo-400/40 hover:bg-panel"
            >
              <div className="flex items-center justify-between">
                <FieldBadge field={c.field} />
                {submittedIds.has(c.id) && (
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">✓ Submitted</span>
                )}
              </div>
              <h3 className="mt-3 font-bold leading-snug">{c.title}</h3>
              <p className="mt-1 text-sm text-muted">{c.summary}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {c.skillsVetted.slice(0, 3).map((s) => (
                  <Chip key={s}>{s}</Chip>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs text-faint">
                <span>{c.company.name}</span>
                <span>
                  ⏱ {c.effort} ·{" "}
                  <span className="font-semibold text-indigo-600 dark:text-indigo-300">
                    +{baseXp(c.effort)} XP
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
