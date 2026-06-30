"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getCV,
  setCV,
  getProfile,
  mySubmissions,
  getChallenge,
  type CV,
  type CVEntry,
  type Profile,
} from "@/lib/store";
import { FieldBadge, StatusBadge } from "@/components/ui";
import type { Submission } from "@/lib/types";

type Section = "experience" | "education";

function newEntry(): CVEntry {
  return {
    id: `e${Date.now()}${Math.floor(Math.random() * 1000)}`,
    title: "",
    org: "",
    period: "",
    detail: "",
  };
}

export default function CVPage() {
  const [mounted, setMounted] = useState(false);
  const [cv, setCv] = useState<CV>({ summary: "", experience: [], education: [], skills: [] });
  const [skillsText, setSkillsText] = useState("");
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [subs, setSubs] = useState<Submission[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const c = getCV();
    setCv(c);
    setSkillsText(c.skills.join(", "));
    setProfileState(getProfile());
    setSubs(mySubmissions());
    setMounted(true);
  }, []);

  function addEntry(section: Section) {
    setCv((c) => ({ ...c, [section]: [...c[section], newEntry()] }));
  }
  function updateEntry(section: Section, id: string, field: keyof CVEntry, value: string) {
    setCv((c) => ({
      ...c,
      [section]: c[section].map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));
  }
  function removeEntry(section: Section, id: string) {
    setCv((c) => ({ ...c, [section]: c[section].filter((e) => e.id !== id) }));
  }

  function save() {
    const skills = skillsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const next = { ...cv, skills };
    setCV(next);
    setCv(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  }

  if (!mounted) {
    return <main className="mx-auto max-w-3xl px-5 py-10 text-muted">Loading…</main>;
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black tracking-tight">My CV</h1>
          <p className="mt-1 text-muted">
            Your CV, enriched by the real cases you&apos;ve completed here.
          </p>
        </div>
        <button
          onClick={save}
          className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400"
        >
          {saved ? "Saved ✓" : "Save CV"}
        </button>
      </div>

      {/* Identity header (from profile) */}
      <div className="mt-6 rounded-2xl border border-line bg-surface p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-bold text-fg">{profile?.name || "You"}</p>
            <p className="text-sm text-muted">{profile?.headline || "Add a headline in your profile"}</p>
            {profile?.location && <p className="text-xs text-faint">📍 {profile.location}</p>}
          </div>
          <Link href="/profile" className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-300">
            Edit identity →
          </Link>
        </div>
      </div>

      {/* Summary */}
      <Block title="Summary">
        <textarea
          value={cv.summary}
          onChange={(e) => setCv({ ...cv, summary: e.target.value })}
          rows={3}
          className={inputCls}
          placeholder="A short professional summary — who you are and what you bring…"
        />
      </Block>

      {/* Skills */}
      <Block title="Skills">
        <input
          value={skillsText}
          onChange={(e) => setSkillsText(e.target.value)}
          className={inputCls}
          placeholder="Comma separated — e.g. Market analysis, GTM, Partnerships"
        />
        {cv.skills.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {skillsText
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
              .map((s, i) => (
                <span key={i} className="rounded-md bg-panel px-2 py-0.5 text-xs text-body">
                  {s}
                </span>
              ))}
          </div>
        )}
      </Block>

      {/* Experience */}
      <EntrySection
        title="Experience"
        section="experience"
        entries={cv.experience}
        onAdd={addEntry}
        onChange={updateEntry}
        onRemove={removeEntry}
        titlePh="Role — e.g. BD Intern"
        orgPh="Company"
      />

      {/* Education */}
      <EntrySection
        title="Education"
        section="education"
        entries={cv.education}
        onAdd={addEntry}
        onChange={updateEntry}
        onRemove={removeEntry}
        titlePh="Degree / programme"
        orgPh="School / university"
      />

      {/* Auto: cases completed on the platform */}
      <Block title="Proven on Schutzengel">
        {subs.length === 0 ? (
          <p className="text-sm text-faint">
            Complete a case and it shows up here automatically as demonstrated experience.{" "}
            <Link href="/" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-300">
              Browse cases →
            </Link>
          </p>
        ) : (
          <ul className="space-y-2">
            {subs.map((s) => {
              const c = getChallenge(s.challengeId);
              return (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-surface px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    {c && <FieldBadge field={c.field} />}
                    <span className="text-sm font-semibold text-fg">{c?.title ?? s.challengeId}</span>
                    <span className="text-xs text-faint">· {c?.company.name}</span>
                  </div>
                  <StatusBadge status={s.status} />
                </li>
              );
            })}
          </ul>
        )}
      </Block>

      <div className="mt-6">
        <button
          onClick={save}
          className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400"
        >
          {saved ? "Saved ✓" : "Save CV"}
        </button>
      </div>
    </main>
  );
}

const inputCls =
  "w-full rounded-xl border border-line bg-input px-3 py-2 text-sm text-fg outline-none placeholder:text-faint focus:border-indigo-400/50";

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-2 text-xs uppercase tracking-widest text-faint">{title}</h2>
      <div className="rounded-2xl border border-line bg-surface p-4">{children}</div>
    </section>
  );
}

function EntrySection({
  title,
  section,
  entries,
  onAdd,
  onChange,
  onRemove,
  titlePh,
  orgPh,
}: {
  title: string;
  section: Section;
  entries: CVEntry[];
  onAdd: (s: Section) => void;
  onChange: (s: Section, id: string, field: keyof CVEntry, value: string) => void;
  onRemove: (s: Section, id: string) => void;
  titlePh: string;
  orgPh: string;
}) {
  return (
    <section className="mt-6">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xs uppercase tracking-widest text-faint">{title}</h2>
        <button
          onClick={() => onAdd(section)}
          className="rounded-lg bg-panel px-3 py-1 text-xs font-semibold text-fg hover:bg-panel-strong"
        >
          + Add
        </button>
      </div>
      {entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line p-4 text-sm text-faint">
          Nothing yet — click “Add”.
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((e) => (
            <div key={e.id} className="rounded-2xl border border-line bg-surface p-4">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <input
                  value={e.title}
                  onChange={(ev) => onChange(section, e.id, "title", ev.target.value)}
                  className={inputCls}
                  placeholder={titlePh}
                />
                <input
                  value={e.org}
                  onChange={(ev) => onChange(section, e.id, "org", ev.target.value)}
                  className={inputCls}
                  placeholder={orgPh}
                />
              </div>
              <input
                value={e.period}
                onChange={(ev) => onChange(section, e.id, "period", ev.target.value)}
                className={`${inputCls} mt-2`}
                placeholder="Period — e.g. 2024–2025"
              />
              <textarea
                value={e.detail}
                onChange={(ev) => onChange(section, e.id, "detail", ev.target.value)}
                rows={2}
                className={`${inputCls} mt-2`}
                placeholder="What you did / achieved…"
              />
              <button
                onClick={() => onRemove(section, e.id)}
                className="mt-2 text-xs font-semibold text-rose-600 hover:underline dark:text-rose-400"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
