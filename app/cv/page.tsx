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
  type CVContact,
  type Profile,
} from "@/lib/store";
import { Spinner } from "@/components/ui";
import type { Submission } from "@/lib/types";

type Section = "experience" | "education";
type Mode = "edit" | "preview";

const rid = () => `e${Date.now()}${Math.floor(Math.random() * 1000)}`;
const newEntry = (): CVEntry => ({ id: rid(), title: "", org: "", location: "", period: "", detail: "" });

export default function CVPage() {
  const [mounted, setMounted] = useState(false);
  const [cv, setCv] = useState<CV>(getCV());
  const [skillsText, setSkillsText] = useState("");
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [subs, setSubs] = useState<Submission[]>([]);
  const [mode, setMode] = useState<Mode>("edit");
  const [saved, setSaved] = useState(false);
  const [polishing, setPolishing] = useState(false);

  useEffect(() => {
    const c = getCV();
    setCv(c);
    setSkillsText(c.skills.join(", "));
    setProfileState(getProfile());
    setSubs(mySubmissions());
    setMounted(true);
  }, []);

  const skillsArr = skillsText.split(",").map((s) => s.trim()).filter(Boolean);

  // ── mutations ────────────────────────────────────────────────
  const setContact = (field: keyof CVContact, value: string) =>
    setCv((c) => ({ ...c, contact: { ...c.contact, [field]: value } }));

  const addEntry = (s: Section) => setCv((c) => ({ ...c, [s]: [...c[s], newEntry()] }));
  const updateEntry = (s: Section, id: string, field: keyof CVEntry, value: string) =>
    setCv((c) => ({ ...c, [s]: c[s].map((e) => (e.id === id ? { ...e, [field]: value } : e)) }));
  const removeEntry = (s: Section, id: string) =>
    setCv((c) => ({ ...c, [s]: c[s].filter((e) => e.id !== id) }));

  const addCred = () =>
    setCv((c) => ({ ...c, certifications: [...c.certifications, { id: rid(), title: "", issuer: "", year: "" }] }));
  const updateCred = (id: string, field: "title" | "issuer" | "year", value: string) =>
    setCv((c) => ({ ...c, certifications: c.certifications.map((x) => (x.id === id ? { ...x, [field]: value } : x)) }));
  const removeCred = (id: string) =>
    setCv((c) => ({ ...c, certifications: c.certifications.filter((x) => x.id !== id) }));

  const addLang = () =>
    setCv((c) => ({ ...c, languages: [...c.languages, { id: rid(), name: "", level: "" }] }));
  const updateLang = (id: string, field: "name" | "level", value: string) =>
    setCv((c) => ({ ...c, languages: c.languages.map((x) => (x.id === id ? { ...x, [field]: value } : x)) }));
  const removeLang = (id: string) =>
    setCv((c) => ({ ...c, languages: c.languages.filter((x) => x.id !== id) }));

  async function polishSummary() {
    if (!cv.summary.trim() || polishing) return;
    setPolishing(true);
    try {
      const r = await fetch("/api/cv-polish", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ summary: cv.summary, headline: profile?.headline }),
      });
      const d = await r.json();
      if (d.summary) setCv((c) => ({ ...c, summary: d.summary }));
    } catch {
      /* ignore */
    } finally {
      setPolishing(false);
    }
  }

  function save() {
    const next = { ...cv, skills: skillsArr };
    setCV(next);
    setCv(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  }

  // ── completeness ─────────────────────────────────────────────
  const checks: { ok: boolean; label: string }[] = [
    { ok: !!cv.summary.trim(), label: "summary" },
    { ok: !!cv.contact.email.trim(), label: "contact email" },
    { ok: skillsArr.length > 0, label: "skills" },
    { ok: cv.experience.some((e) => e.title.trim()), label: "experience" },
    { ok: cv.education.some((e) => e.title.trim()), label: "education" },
    { ok: cv.languages.some((l) => l.name.trim()) || cv.certifications.some((x) => x.title.trim()), label: "a language or certification" },
    { ok: subs.length > 0, label: "a completed case" },
  ];
  const done = checks.filter((c) => c.ok).length;
  const pct = Math.round((done / checks.length) * 100);
  const missing = checks.filter((c) => !c.ok).map((c) => c.label);

  if (!mounted) {
    return <main className="mx-auto max-w-3xl px-5 py-10 text-muted">Loading…</main>;
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-8">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black tracking-tight">My CV</h1>
          <p className="mt-1 text-muted">Your CV, enriched by the real cases you complete here.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-line p-0.5 text-xs font-semibold">
            <button
              onClick={() => setMode("edit")}
              className={`rounded-md px-3 py-1.5 transition ${mode === "edit" ? "bg-indigo-500 text-white" : "text-muted hover:text-fg"}`}
            >
              Edit
            </button>
            <button
              onClick={() => setMode("preview")}
              className={`rounded-md px-3 py-1.5 transition ${mode === "preview" ? "bg-indigo-500 text-white" : "text-muted hover:text-fg"}`}
            >
              Preview
            </button>
          </div>
          {mode === "preview" && (
            <button
              onClick={() => window.print()}
              className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-fg hover:bg-panel"
            >
              ⭳ Print / PDF
            </button>
          )}
          <button
            onClick={save}
            className="rounded-lg bg-indigo-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-400"
          >
            {saved ? "Saved ✓" : "Save"}
          </button>
        </div>
      </div>

      {/* Completeness meter */}
      <div className="mt-4 rounded-xl border border-line bg-surface p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-fg">CV {pct}% complete</span>
          <span className="text-xs text-faint">
            {missing.length ? `Add: ${missing.slice(0, 3).join(", ")}` : "All set 🎉"}
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-panel">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {mode === "edit" ? (
        <div className="mt-6 space-y-6">
          {/* Contact */}
          <Block title="Contact">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <input className={inputCls} placeholder="Email" value={cv.contact.email} onChange={(e) => setContact("email", e.target.value)} />
              <input className={inputCls} placeholder="Phone" value={cv.contact.phone} onChange={(e) => setContact("phone", e.target.value)} />
              <input className={inputCls} placeholder="Website" value={cv.contact.website} onChange={(e) => setContact("website", e.target.value)} />
            </div>
            <p className="mt-2 text-xs text-faint">
              Name, headline & location come from your{" "}
              <Link href="/profile" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-300">profile</Link>.
            </p>
          </Block>

          {/* Summary */}
          <Block
            title="Summary"
            action={
              <button
                onClick={polishSummary}
                disabled={!cv.summary.trim() || polishing}
                className="flex items-center gap-1.5 rounded-lg border border-indigo-400/40 bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-500/20 disabled:opacity-40 dark:text-indigo-200"
              >
                {polishing ? <Spinner /> : "✦"} Polish with AI
              </button>
            }
          >
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
            <input className={inputCls} value={skillsText} onChange={(e) => setSkillsText(e.target.value)} placeholder="Comma separated — e.g. Market analysis, GTM, Partnerships" />
            {skillsArr.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {skillsArr.map((s, i) => (
                  <span key={i} className="rounded-md bg-panel px-2 py-0.5 text-xs text-body">{s}</span>
                ))}
              </div>
            )}
          </Block>

          {/* Experience */}
          <EntrySection title="Experience" section="experience" entries={cv.experience} onAdd={addEntry} onChange={updateEntry} onRemove={removeEntry} titlePh="Role — e.g. BD Analyst" orgPh="Company" />

          {/* Education */}
          <EntrySection title="Education" section="education" entries={cv.education} onAdd={addEntry} onChange={updateEntry} onRemove={removeEntry} titlePh="Degree / programme" orgPh="School / university" />

          {/* Certifications */}
          <Block title="Certifications & Awards" action={<AddBtn onClick={addCred} />}>
            {cv.certifications.length === 0 ? (
              <Empty />
            ) : (
              <div className="space-y-2">
                {cv.certifications.map((x) => (
                  <div key={x.id} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_90px_auto]">
                    <input className={inputCls} placeholder="Title" value={x.title} onChange={(e) => updateCred(x.id, "title", e.target.value)} />
                    <input className={inputCls} placeholder="Issuer" value={x.issuer} onChange={(e) => updateCred(x.id, "issuer", e.target.value)} />
                    <input className={inputCls} placeholder="Year" value={x.year} onChange={(e) => updateCred(x.id, "year", e.target.value)} />
                    <RemoveBtn onClick={() => removeCred(x.id)} />
                  </div>
                ))}
              </div>
            )}
          </Block>

          {/* Languages */}
          <Block title="Languages" action={<AddBtn onClick={addLang} />}>
            {cv.languages.length === 0 ? (
              <Empty />
            ) : (
              <div className="space-y-2">
                {cv.languages.map((x) => (
                  <div key={x.id} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
                    <input className={inputCls} placeholder="Language" value={x.name} onChange={(e) => updateLang(x.id, "name", e.target.value)} />
                    <input className={inputCls} placeholder="Level — e.g. Native, C1, Fluent" value={x.level} onChange={(e) => updateLang(x.id, "level", e.target.value)} />
                    <RemoveBtn onClick={() => removeLang(x.id)} />
                  </div>
                ))}
              </div>
            )}
          </Block>

          {/* Auto cases */}
          <Block title="Proven on Schutzengel">
            {subs.length === 0 ? (
              <p className="text-sm text-faint">
                Complete a case and it appears here automatically.{" "}
                <Link href="/" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-300">Browse cases →</Link>
              </p>
            ) : (
              <ul className="space-y-1.5">
                {subs.map((s) => {
                  const c = getChallenge(s.challengeId);
                  return (
                    <li key={s.id} className="text-sm text-body">
                      • <span className="font-semibold text-fg">{c?.title ?? s.challengeId}</span>{" "}
                      <span className="text-faint">· {c?.company.name} · {c?.field}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Block>

          <button onClick={save} className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400">
            {saved ? "Saved ✓" : "Save CV"}
          </button>
        </div>
      ) : (
        <CVPreview cv={cv} skills={skillsArr} profile={profile} subs={subs} />
      )}
    </main>
  );
}

// ── Edit helpers ───────────────────────────────────────────────
const inputCls =
  "w-full rounded-xl border border-line bg-input px-3 py-2 text-sm text-fg outline-none placeholder:text-faint focus:border-indigo-400/50";

function Block({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xs uppercase tracking-widest text-faint">{title}</h2>
        {action}
      </div>
      <div className="rounded-2xl border border-line bg-surface p-4">{children}</div>
    </section>
  );
}

function AddBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-lg bg-panel px-3 py-1 text-xs font-semibold text-fg hover:bg-panel-strong">
      + Add
    </button>
  );
}
function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-lg px-2 py-1 text-xs font-semibold text-rose-600 hover:underline dark:text-rose-400">
      Remove
    </button>
  );
}
function Empty() {
  return <p className="text-sm text-faint">Nothing yet — click “Add”.</p>;
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
    <Block title={title} action={<AddBtn onClick={() => onAdd(section)} />}>
      {entries.length === 0 ? (
        <Empty />
      ) : (
        <div className="space-y-3">
          {entries.map((e) => (
            <div key={e.id} className="rounded-xl border border-line p-3">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <input className={inputCls} placeholder={titlePh} value={e.title} onChange={(ev) => onChange(section, e.id, "title", ev.target.value)} />
                <input className={inputCls} placeholder={orgPh} value={e.org} onChange={(ev) => onChange(section, e.id, "org", ev.target.value)} />
                <input className={inputCls} placeholder="Location" value={e.location ?? ""} onChange={(ev) => onChange(section, e.id, "location", ev.target.value)} />
                <input className={inputCls} placeholder="Period — e.g. 2024–2025" value={e.period} onChange={(ev) => onChange(section, e.id, "period", ev.target.value)} />
              </div>
              <textarea
                className={`${inputCls} mt-2`}
                rows={3}
                placeholder="Achievements — one per line (rendered as bullets)"
                value={e.detail}
                onChange={(ev) => onChange(section, e.id, "detail", ev.target.value)}
              />
              <div className="mt-1 flex justify-end">
                <RemoveBtn onClick={() => onRemove(section, e.id)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </Block>
  );
}

// ── Preview (a real, printable document — fixed light styling) ──
function CVPreview({
  cv,
  skills,
  profile,
  subs,
}: {
  cv: CV;
  skills: string[];
  profile: Profile | null;
  subs: Submission[];
}) {
  const contactBits = [cv.contact.email, cv.contact.phone, profile?.location, cv.contact.website, ...(profile?.links ?? [])].filter(Boolean);
  return (
    <div className="mt-6">
      <div id="cv-doc" className="mx-auto max-w-[800px] rounded-2xl border border-slate-200 bg-white p-8 text-slate-900 shadow-sm">
        <header className="border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-black tracking-tight">{profile?.name || "Your Name"}</h2>
          {profile?.headline && <p className="text-slate-600">{profile.headline}</p>}
          {contactBits.length > 0 && (
            <p className="mt-1 flex flex-wrap gap-x-2 text-xs text-slate-500">
              {contactBits.map((b, i) => (
                <span key={i}>
                  {i > 0 && <span className="mr-2 text-slate-300">·</span>}
                  {b}
                </span>
              ))}
            </p>
          )}
        </header>

        {cv.summary && (
          <PSection title="Summary">
            <p className="text-sm leading-relaxed text-slate-700">{cv.summary}</p>
          </PSection>
        )}

        {cv.experience.some((e) => e.title) && (
          <PSection title="Experience">
            {cv.experience.filter((e) => e.title).map((e) => (
              <Entry key={e.id} e={e} />
            ))}
          </PSection>
        )}

        {cv.education.some((e) => e.title) && (
          <PSection title="Education">
            {cv.education.filter((e) => e.title).map((e) => (
              <Entry key={e.id} e={e} />
            ))}
          </PSection>
        )}

        {subs.length > 0 && (
          <PSection title="Proven on Schutzengel">
            <ul className="space-y-1 text-sm text-slate-700">
              {subs.map((s) => {
                const c = getChallenge(s.challengeId);
                return (
                  <li key={s.id}>
                    <span className="font-semibold">{c?.title ?? s.challengeId}</span>
                    <span className="text-slate-500"> — {c?.company.name}, {c?.field}</span>
                  </li>
                );
              })}
            </ul>
          </PSection>
        )}

        {cv.certifications.some((x) => x.title) && (
          <PSection title="Certifications & Awards">
            <ul className="space-y-1 text-sm text-slate-700">
              {cv.certifications.filter((x) => x.title).map((x) => (
                <li key={x.id}>
                  <span className="font-semibold">{x.title}</span>
                  <span className="text-slate-500">{x.issuer ? ` — ${x.issuer}` : ""}{x.year ? ` (${x.year})` : ""}</span>
                </li>
              ))}
            </ul>
          </PSection>
        )}

        {skills.length > 0 && (
          <PSection title="Skills">
            <p className="text-sm text-slate-700">{skills.join(" · ")}</p>
          </PSection>
        )}

        {cv.languages.some((l) => l.name) && (
          <PSection title="Languages">
            <p className="text-sm text-slate-700">
              {cv.languages.filter((l) => l.name).map((l) => `${l.name}${l.level ? ` (${l.level})` : ""}`).join(" · ")}
            </p>
          </PSection>
        )}
      </div>
    </div>
  );
}

function PSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">{title}</h3>
      {children}
    </section>
  );
}

function Entry({ e }: { e: CVEntry }) {
  const bullets = (e.detail || "").split("\n").map((b) => b.trim()).filter(Boolean);
  return (
    <div className="mb-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-bold text-slate-900">
          {e.title}
          {e.org && <span className="font-normal text-slate-600"> · {e.org}</span>}
          {e.location && <span className="font-normal text-slate-400"> · {e.location}</span>}
        </p>
        {e.period && <p className="shrink-0 text-xs text-slate-500">{e.period}</p>}
      </div>
      {bullets.length > 0 && (
        <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-slate-700">
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
