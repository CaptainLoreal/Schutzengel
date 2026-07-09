"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getProfile,
  setProfile,
  mySubmissions,
  getChallenge,
  getStreak,
  getPreferences,
  getTestResults,
  type Profile,
  type Preferences,
  type TestResult,
} from "@/lib/store";
import { totalXp, rankFor, levelFor, badgesFor, type Badge } from "@/lib/gamification";
import { TESTS, topDimension } from "@/lib/tests";

const LEADERBOARD_SEED = [
  { name: "Priya N.", xp: 1240 },
  { name: "Marco V.", xp: 980 },
  { name: "Aisha R.", xp: 760 },
  { name: "Tomás P.", xp: 540 },
  { name: "Lena K.", xp: 410 },
];

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  const [p, setP] = useState<Profile>({ name: "", headline: "", location: "", bio: "", links: [] });
  const [linksText, setLinksText] = useState("");
  const [saved, setSaved] = useState(false);
  const [stats, setStats] = useState({ completed: 0, wins: 0, types: 0 });
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [prefs, setPrefs] = useState<Preferences>({
    strengths: [],
    industries: [],
    roles: [],
    caseTypes: [],
    workTypes: [],
    setupComplete: false,
  });
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});

  useEffect(() => {
    const prof = getProfile();
    setP(prof);
    setLinksText(prof.links.join("\n"));
    const subs = mySubmissions();
    const st = getStreak();
    setStreak(st);
    setXp(totalXp(subs, getChallenge));
    setBadges(badgesFor(subs, getChallenge, st));
    setPrefs(getPreferences());
    setTestResults(getTestResults());
    setStats({
      completed: subs.length,
      wins: subs.filter((s) => s.status === "hired" || s.status === "shortlisted").length,
      types: new Set(subs.map((s) => getChallenge(s.challengeId)?.field).filter(Boolean)).size,
    });
    setMounted(true);
  }, []);

  function save() {
    const links = linksText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const next = { ...p, name: p.name.trim() || "You", links };
    setProfile(next);
    setP(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  }

  const initial = (p.name?.[0] || "Y").toUpperCase();
  const rank = rankFor(xp);
  const level = levelFor(xp);
  const pct = rank.next === null ? 100 : Math.round(((xp - rank.min) / (rank.next - rank.min)) * 100);
  const nextRankName = rank.next !== null ? rankFor(rank.next).name : null;

  const board = [...LEADERBOARD_SEED, { name: p.name || "You", xp, you: true }]
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 8);

  if (!mounted) {
    return <main className="mx-auto max-w-4xl px-5 py-10 text-muted">Loading…</main>;
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-8">
      <h1 className="text-3xl font-black tracking-tight">Profile</h1>
      <p className="mt-1 text-muted">
        Your portable identity and career progression — what grows as you complete real cases.
      </p>

      {/* Progress hero */}
      <div className="mt-6 rounded-2xl border border-line bg-surface p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-faint">Rank · Level {level}</p>
            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-300">{rank.name}</p>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-right">
              <p className="text-2xl font-black tabular-nums text-fg">{xp}</p>
              <p className="text-xs uppercase tracking-widest text-faint">total XP</p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-line px-3 py-2">
              <span className="text-2xl">🔥</span>
              <div>
                <p className="text-xl font-black tabular-nums text-fg">{streak}</p>
                <p className="text-[10px] uppercase tracking-widest text-faint">day streak</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-panel">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-400 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-faint">
          {nextRankName ? `${rank.next! - xp} XP to ${nextRankName}` : "Top rank reached — Partner."}
        </p>
      </div>

      {/* Identity + edit */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
        <section>
          <p className="mb-2 text-xs uppercase tracking-widest text-faint">How companies see you</p>
          <div className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-indigo-500/15 text-xl font-bold text-indigo-700 ring-1 ring-indigo-500/30 dark:text-indigo-300">
                {initial}
              </span>
              <div className="min-w-0">
                <p className="truncate text-lg font-bold text-fg">{p.name || "You"}</p>
                <p className="truncate text-sm text-muted">{p.headline || "Add a headline"}</p>
                {p.location && <p className="text-xs text-faint">📍 {p.location}</p>}
              </div>
            </div>
            {p.bio && <p className="mt-4 whitespace-pre-wrap text-sm text-body">{p.bio}</p>}
            {p.links.length > 0 && (
              <div className="mt-4 border-t border-line pt-3">
                <p className="text-xs uppercase tracking-widest text-faint">Links</p>
                <ul className="mt-1 space-y-0.5 text-sm text-indigo-700 dark:text-indigo-300">
                  {p.links.map((l, i) => (
                    <li key={i} className="truncate">
                      {l}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-4 text-center">
              <Stat label="Cases" value={stats.completed} />
              <Stat label="Shortlisted / hired" value={stats.wins} />
              <Stat label="Case types" value={stats.types} />
            </div>
            <Link
              href="/me"
              className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-300"
            >
              View completed cases →
            </Link>
          </div>
        </section>

        <section>
          <p className="mb-2 text-xs uppercase tracking-widest text-faint">Edit</p>
          <div className="space-y-4 rounded-2xl border border-line bg-surface p-5">
            <FieldRow label="Display name">
              <input
                value={p.name}
                onChange={(e) => setP({ ...p, name: e.target.value })}
                className={inputCls}
                placeholder="Your name"
              />
            </FieldRow>
            <FieldRow label="Headline">
              <input
                value={p.headline}
                onChange={(e) => setP({ ...p, headline: e.target.value })}
                className={inputCls}
                placeholder="e.g. Aspiring BD analyst · ex-founder"
              />
            </FieldRow>
            <FieldRow label="Location">
              <input
                value={p.location}
                onChange={(e) => setP({ ...p, location: e.target.value })}
                className={inputCls}
                placeholder="e.g. Berlin, Germany"
              />
            </FieldRow>
            <FieldRow label="Bio">
              <textarea
                value={p.bio}
                onChange={(e) => setP({ ...p, bio: e.target.value })}
                rows={4}
                className={inputCls}
                placeholder="A few lines on who you are and what you're after…"
              />
            </FieldRow>
            <FieldRow label="Links (one per line)">
              <textarea
                value={linksText}
                onChange={(e) => setLinksText(e.target.value)}
                rows={3}
                className={inputCls}
                placeholder={"linkedin.com/in/you\nyour-portfolio.com"}
              />
            </FieldRow>
            <button
              onClick={save}
              className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400"
            >
              {saved ? "Saved ✓" : "Save profile"}
            </button>
          </div>
        </section>
      </div>

      {/* Setup nudge */}
      {!prefs.setupComplete && (
        <Link
          href="/setup"
          className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-indigo-500/30 bg-indigo-500/[0.08] p-4"
        >
          <div>
            <p className="font-semibold text-indigo-700 dark:text-indigo-200">
              Finish setting up your profile
            </p>
            <p className="text-sm text-muted">
              Tell us your strengths and interests so we can match you to the right cases.
            </p>
          </div>
          <span className="shrink-0 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white">
            Start →
          </span>
        </Link>
      )}

      {/* Interests + psychometrics */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs uppercase tracking-widest text-faint">Strengths & interests</p>
            <Link href="/setup" className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-300">
              Edit
            </Link>
          </div>
          <div className="space-y-2.5 rounded-2xl border border-line bg-surface p-5">
            <TagRow label="Strengths" items={prefs.strengths} />
            <TagRow label="BD interests" items={prefs.caseTypes} />
            <TagRow label="Industries" items={prefs.industries} />
            <TagRow label="Roles" items={prefs.roles} />
            <TagRow label="Open to" items={prefs.workTypes} />
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs uppercase tracking-widest text-faint">Psychometric profile</p>
            <Link href="/tests" className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-300">
              All tests
            </Link>
          </div>
          <div className="space-y-2 rounded-2xl border border-line bg-surface p-5">
            {TESTS.map((t) => {
              const r = testResults[t.id];
              return (
                <div key={t.id} className="flex items-center justify-between text-sm">
                  <span className="text-body">{t.name}</span>
                  {r ? (
                    <span className="font-semibold text-fg">
                      {t.info[topDimension(r.scores)]?.label ?? topDimension(r.scores)}
                    </span>
                  ) : (
                    <Link href={`/tests/${t.id}`} className="text-indigo-600 hover:underline dark:text-indigo-300">
                      Take →
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Achievements */}
      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-faint">
          Achievements · {badges.filter((b) => b.earned).length}/{badges.length}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {badges.map((b) => (
            <div
              key={b.id}
              title={b.desc}
              className={`rounded-2xl border p-4 text-center transition ${
                b.earned
                  ? "border-amber-500/30 bg-amber-500/[0.07]"
                  : "border-line bg-surface opacity-50 grayscale"
              }`}
            >
              <div className="text-3xl">{b.icon}</div>
              <p className="mt-1 text-sm font-bold text-fg">{b.label}</p>
              <p className="mt-0.5 text-xs text-faint">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Leaderboard */}
      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-faint">
          Leaderboard
        </h2>
        <div className="rounded-2xl border border-line bg-surface p-3">
          <ol className="space-y-1">
            {board.map((row, i) => (
              <li
                key={`${row.name}-${i}`}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                  "you" in row && row.you ? "bg-indigo-500/10 ring-1 ring-indigo-500/30" : ""
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="w-5 text-right font-bold tabular-nums text-faint">{i + 1}</span>
                  <span
                    className={
                      "you" in row && row.you
                        ? "font-semibold text-indigo-700 dark:text-indigo-300"
                        : "text-body"
                    }
                  >
                    {row.name}
                  </span>
                </span>
                <span className="tabular-nums text-muted">{row.xp} XP</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}

const inputCls =
  "w-full rounded-xl border border-line bg-input px-3 py-2 text-sm text-fg outline-none placeholder:text-faint focus:border-indigo-400/50";

function TagRow({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-24 shrink-0 text-xs uppercase tracking-widest text-faint">{label}</span>
      {items.length ? (
        items.map((i) => (
          <span key={i} className="rounded-md bg-panel px-2 py-0.5 text-xs text-body">
            {i}
          </span>
        ))
      ) : (
        <span className="text-xs text-faint">—</span>
      )}
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-widest text-muted">{label}</span>
      {children}
    </label>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xl font-black tabular-nums text-fg">{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-faint">{label}</p>
    </div>
  );
}
