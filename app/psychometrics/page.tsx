"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TESTS, topDimension } from "@/lib/psychometrics";
import { getTestResults, type TestResult } from "@/lib/store";

export default function TestsPage() {
  const [mounted, setMounted] = useState(false);
  const [results, setResults] = useState<Record<string, TestResult>>({});

  useEffect(() => {
    setResults(getTestResults());
    setMounted(true);
  }, []);

  const done = Object.keys(results).length;

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-8">
      <h1 className="text-3xl font-black tracking-tight">Psychometrics</h1>
      <p className="mt-1 text-muted">
        Quick, self-report tests that build a trait profile companies can see alongside your work.
        {mounted && ` ${done}/${TESTS.length} completed.`}
      </p>

      <div className="mt-6 space-y-4">
        {TESTS.map((t) => {
          const r = results[t.id];
          return (
            <Link
              key={t.id}
              href={`/psychometrics/${t.id}`}
              className="group flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-5 transition hover:border-clay-400/40 hover:bg-panel"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-fg">{t.name}</h2>
                  {mounted && r && (
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-500/30 dark:text-emerald-300">
                      ✓ Done
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted">{t.tagline}</p>
                <p className="mt-1 text-xs text-faint">
                  {t.questions.length} questions · ~{t.minutes} min
                  {mounted && r && ` · strongest: ${topDimension(r.scores)}`}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold text-clay-600 group-hover:underline dark:text-clay-300">
                {mounted && r ? "View / retake →" : "Take test →"}
              </span>
            </Link>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-faint">
        Your results appear on your{" "}
        <Link href="/profile" className="font-semibold text-clay-600 hover:underline dark:text-clay-300">
          profile
        </Link>
        . Self-report tests are indicative, not definitive.
      </p>
    </main>
  );
}
