"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getProfile, setProfile, mySubmissions, getChallenge, type Profile } from "@/lib/store";

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  const [p, setP] = useState<Profile>({
    name: "",
    headline: "",
    location: "",
    bio: "",
    links: [],
  });
  const [linksText, setLinksText] = useState("");
  const [saved, setSaved] = useState(false);
  const [stats, setStats] = useState({ completed: 0, wins: 0, types: 0 });

  useEffect(() => {
    const prof = getProfile();
    setP(prof);
    setLinksText(prof.links.join("\n"));
    const subs = mySubmissions();
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

  if (!mounted) {
    return <main className="mx-auto max-w-4xl px-5 py-10 text-muted">Loading…</main>;
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-8">
      <h1 className="text-3xl font-black tracking-tight">Profile</h1>
      <p className="mt-1 text-muted">
        This is your portable identity — how a company sees you alongside your cases.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Preview */}
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

        {/* Edit form */}
        <section>
          <p className="mb-2 text-xs uppercase tracking-widest text-faint">Edit</p>
          <div className="space-y-4 rounded-2xl border border-line bg-surface p-5">
            <Field label="Display name">
              <input
                value={p.name}
                onChange={(e) => setP({ ...p, name: e.target.value })}
                className={inputCls}
                placeholder="Your name"
              />
            </Field>
            <Field label="Headline">
              <input
                value={p.headline}
                onChange={(e) => setP({ ...p, headline: e.target.value })}
                className={inputCls}
                placeholder="e.g. Aspiring BD analyst · ex-founder"
              />
            </Field>
            <Field label="Location">
              <input
                value={p.location}
                onChange={(e) => setP({ ...p, location: e.target.value })}
                className={inputCls}
                placeholder="e.g. Berlin, Germany"
              />
            </Field>
            <Field label="Bio">
              <textarea
                value={p.bio}
                onChange={(e) => setP({ ...p, bio: e.target.value })}
                rows={4}
                className={inputCls}
                placeholder="A few lines on who you are and what you're after…"
              />
            </Field>
            <Field label="Links (one per line)">
              <textarea
                value={linksText}
                onChange={(e) => setLinksText(e.target.value)}
                rows={3}
                className={inputCls}
                placeholder={"linkedin.com/in/you\nyour-portfolio.com"}
              />
            </Field>
            <button
              onClick={save}
              className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400"
            >
              {saved ? "Saved ✓" : "Save profile"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

const inputCls =
  "w-full rounded-xl border border-line bg-input px-3 py-2 text-sm text-fg outline-none placeholder:text-faint focus:border-indigo-400/50";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
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
