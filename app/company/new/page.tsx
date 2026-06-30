"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addChallenge } from "@/lib/store";
import { FIELDS } from "@/lib/fields";
import { Spinner } from "@/components/ui";
import type { Challenge, Field } from "@/lib/types";

export default function NewChallenge() {
  const router = useRouter();
  const [company, setCompany] = useState("");
  const [blurb, setBlurb] = useState("");
  const [title, setTitle] = useState("");
  const [field, setField] = useState<Field>("Strategy & Market");
  const [idea, setIdea] = useState("");
  const [summary, setSummary] = useState("");
  const [brief, setBrief] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [criteria, setCriteria] = useState("");
  const [skills, setSkills] = useState("");
  const [effort, setEffort] = useState("");
  const [reward, setReward] = useState("");
  const [drafting, setDrafting] = useState(false);

  const canPost = company.trim() && title.trim() && brief.trim();

  async function draft() {
    if (!title.trim() || drafting) return;
    setDrafting(true);
    try {
      const r = await fetch("/api/draft-brief", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, field, idea }),
      });
      const d = await r.json();
      setBrief(d.brief ?? "");
      setDeliverables((d.deliverables ?? []).join("\n"));
      setCriteria((d.evaluationCriteria ?? []).join("\n"));
    } catch {
      /* ignore */
    } finally {
      setDrafting(false);
    }
  }

  function post() {
    if (!canPost) return;
    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 30) || "challenge";
    const challenge: Challenge = {
      id: `${slug}-${Date.now().toString(36)}`,
      company: { name: company.trim(), blurb: blurb.trim() || "Hiring on Schutzengel." },
      title: title.trim(),
      field,
      summary: summary.trim() || brief.trim().slice(0, 90),
      brief: brief.trim(),
      deliverables: lines(deliverables),
      skillsVetted: skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      evaluationCriteria: lines(criteria),
      effort: effort.trim() || "1–2 hours",
      reward: reward.trim() || "Interview if shortlisted",
      custom: true,
    };
    addChallenge(challenge);
    router.push("/company");
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-8">
      <h1 className="text-3xl font-black tracking-tight">Post a challenge</h1>
      <p className="mt-1 text-muted">
        Write a realistic BD case that mirrors real work. Candidates present their solution on video;
        you vet them by how they think.
      </p>

      <div className="mt-6 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field_ label="Company">
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className={inputCls}
              placeholder="e.g. Lumen"
            />
          </Field_>
          <Field_ label="Case type">
            <select
              value={field}
              onChange={(e) => setField(e.target.value as Field)}
              className={inputCls}
            >
              {FIELDS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </Field_>
        </div>

        <Field_ label="What the company does (optional)">
          <input
            value={blurb}
            onChange={(e) => setBlurb(e.target.value)}
            className={inputCls}
            placeholder="One line — e.g. A sleep & focus wearable startup."
          />
        </Field_>

        <Field_ label="Challenge title">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputCls}
            placeholder="e.g. Plan the launch teaser for our new wearable"
          />
        </Field_>

        {/* AI draft helper */}
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.05] p-4">
          <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-200">✦ Draft the brief with AI</p>
          <p className="mt-1 text-xs text-muted">
            Describe what you want to test; AI writes the brief, deliverables, and criteria.
          </p>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            rows={2}
            className={`${inputCls} mt-2`}
            placeholder="e.g. Test whether they can create curiosity without revealing the product"
          />
          <button
            onClick={draft}
            disabled={!title.trim() || drafting}
            className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-40"
          >
            {drafting ? (
              <>
                <Spinner /> Drafting…
              </>
            ) : (
              "Draft with AI"
            )}
          </button>
        </div>

        <Field_ label="The brief">
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={5}
            className={inputCls}
            placeholder="The task, addressed to the candidate…"
          />
        </Field_>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field_ label="Deliverables (one per line)">
            <textarea
              value={deliverables}
              onChange={(e) => setDeliverables(e.target.value)}
              rows={4}
              className={inputCls}
              placeholder={"Your approach\nYour reasoning\nA link to your work"}
            />
          </Field_>
          <Field_ label="Evaluation criteria (one per line)">
            <textarea
              value={criteria}
              onChange={(e) => setCriteria(e.target.value)}
              rows={4}
              className={inputCls}
              placeholder={"Is it well-reasoned?\nDid they handle edge cases?"}
            />
          </Field_>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field_ label="Skills (comma sep)">
            <input
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className={inputCls}
              placeholder="Creative copy"
            />
          </Field_>
          <Field_ label="Effort">
            <input
              value={effort}
              onChange={(e) => setEffort(e.target.value)}
              className={inputCls}
              placeholder="2–3 hours"
            />
          </Field_>
          <Field_ label="Reward">
            <input
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              className={inputCls}
              placeholder="Fast-track interview"
            />
          </Field_>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={post}
            disabled={!canPost}
            className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-40"
          >
            Publish challenge
          </button>
          <button
            onClick={() => router.push("/company")}
            className="rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-fg hover:bg-panel"
          >
            Cancel
          </button>
        </div>
      </div>
    </main>
  );
}

const inputCls =
  "w-full rounded-xl border border-line bg-input px-3 py-2 text-sm outline-none placeholder:text-faint focus:border-indigo-400/50";

function lines(s: string): string[] {
  return s
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function Field_({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-widest text-muted">{label}</span>
      {children}
    </label>
  );
}
