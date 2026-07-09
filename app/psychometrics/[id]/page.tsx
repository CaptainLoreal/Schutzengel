"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getTest, scoreTest, topDimension, LIKERT } from "@/lib/psychometrics";
import { saveTestResult, getTestResults, type TestResult } from "@/lib/store";
import { ScoreBar } from "@/components/ui";

export default function TestRunner() {
  const params = useParams<{ id: string }>();
  const test = getTest(params.id);

  const [mounted, setMounted] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<TestResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!test) {
      setMounted(true);
      return;
    }
    const existing = getTestResults()[test.id];
    if (existing) {
      setResult(existing);
      setAnswers(existing.answers);
      setShowResults(true);
    } else {
      setAnswers(Array(test.questions.length).fill(0));
    }
    setMounted(true);
  }, [test]);

  if (!mounted) {
    return <main className="mx-auto max-w-2xl px-5 py-10 text-muted">Loading…</main>;
  }
  if (!test) {
    return (
      <main className="mx-auto max-w-md px-5 py-20 text-center">
        <p className="text-lg font-semibold">Test not found.</p>
        <Link href="/psychometrics" className="mt-3 inline-block text-indigo-700 hover:underline dark:text-indigo-300">
          ← Psychometrics
        </Link>
      </main>
    );
  }

  const answered = answers.filter((a) => a > 0).length;
  const allAnswered = answered === test.questions.length;

  function pick(qi: number, val: number) {
    setAnswers((a) => {
      const next = [...a];
      next[qi] = val;
      return next;
    });
  }

  function submit() {
    if (!test || !allAnswered) return;
    const scores = scoreTest(test, answers);
    const res: TestResult = {
      testId: test.id,
      answers,
      scores,
      takenAt: new Date().toISOString(),
    };
    saveTestResult(res);
    setResult(res);
    setShowResults(true);
  }

  if (showResults && result) {
    const top = topDimension(result.scores);
    return (
      <main className="mx-auto w-full max-w-2xl px-5 py-8">
        <Link href="/psychometrics" className="text-sm text-muted hover:text-fg">
          ← Psychometrics
        </Link>
        <h1 className="mt-3 text-3xl font-black tracking-tight">{test.name} — results</h1>
        <p className="mt-1 text-muted">
          Your strongest area is <span className="font-semibold text-fg">{test.info[top]?.label ?? top}</span>.
        </p>

        <div className="mt-6 space-y-4 rounded-2xl border border-line bg-surface p-5">
          {result.scores.map((s) => (
            <ScoreBar key={s.dimension} label={test.info[s.dimension]?.label ?? s.dimension} value={s.score} note={test.info[s.dimension]?.blurb} />
          ))}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => setShowResults(false)}
            className="rounded-xl bg-panel px-5 py-2.5 text-sm font-semibold text-fg hover:bg-panel-strong"
          >
            Retake
          </button>
          <Link href="/profile" className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400">
            See it on your profile
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-8">
      <Link href="/psychometrics" className="text-sm text-muted hover:text-fg">
        ← Psychometrics
      </Link>
      <h1 className="mt-3 text-3xl font-black tracking-tight">{test.name}</h1>
      <p className="mt-1 text-muted">{test.tagline}</p>

      {/* progress */}
      <div className="sticky top-[57px] z-10 mt-4 rounded-xl border border-line bg-surface/95 p-3 backdrop-blur">
        <div className="flex items-center justify-between text-xs text-faint">
          <span>Rate how much each statement sounds like you.</span>
          <span>
            {answered}/{test.questions.length}
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-panel">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all"
            style={{ width: `${(answered / test.questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {test.questions.map((q, qi) => (
          <div key={qi} className="rounded-2xl border border-line bg-surface p-4">
            <p className="text-sm font-medium text-fg">{q.text}</p>
            <div className="mt-3 flex items-center justify-between gap-1">
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  onClick={() => pick(qi, v)}
                  title={LIKERT[v - 1]}
                  aria-label={LIKERT[v - 1]}
                  className={`grid h-9 w-9 place-items-center rounded-full text-sm font-bold ring-1 transition ${
                    answers[qi] === v
                      ? "bg-indigo-500 text-white ring-indigo-500"
                      : "bg-panel text-muted ring-line hover:text-fg"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-faint">
              <span>Disagree</span>
              <span>Agree</span>
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-4 mt-5">
        <button
          onClick={submit}
          disabled={!allAnswered}
          className="w-full rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-400 disabled:opacity-40"
        >
          {allAnswered ? "See my results" : `Answer all ${test.questions.length} to continue`}
        </button>
      </div>
    </main>
  );
}
