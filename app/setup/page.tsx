"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getProfile, setProfile, getPreferences, setPreferences } from "@/lib/store";
import { FIELDS } from "@/lib/fields";
import type { Field } from "@/lib/types";

const STRENGTHS = [
  "Analytical thinking",
  "Persuasion",
  "Research",
  "Creativity",
  "Communication",
  "Negotiation",
  "Organisation",
  "Relationship-building",
  "Data & numbers",
  "Storytelling",
  "Problem-solving",
  "Resilience",
];
const INDUSTRIES = [
  "SaaS / Tech",
  "E-commerce",
  "Fintech",
  "Healthcare",
  "Consulting",
  "Media & Marketing",
  "Logistics",
  "Sustainability",
  "Consumer goods",
  "Education",
];
const ROLES = [
  "Business Development",
  "Sales / SDR",
  "Growth / Marketing",
  "Strategy / Ops",
  "Partnerships",
  "Product",
  "Consulting",
  "Founder / GM",
];
const WORK_TYPES = ["Short gigs", "Projects", "Full-time", "Internship"];

const STEPS = ["Basics", "Strengths", "Interests", "Preferences", "Done"];

export default function SetupWizard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0);

  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [strengths, setStrengths] = useState<string[]>([]);
  const [customStrength, setCustomStrength] = useState("");
  const [caseTypes, setCaseTypes] = useState<Field[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [workTypes, setWorkTypes] = useState<string[]>([]);

  useEffect(() => {
    const p = getProfile();
    const pref = getPreferences();
    setName(p.name && p.name !== "You" ? p.name : "");
    setHeadline(p.headline);
    setLocation(p.location);
    setStrengths(pref.strengths);
    setCaseTypes(pref.caseTypes);
    setIndustries(pref.industries);
    setRoles(pref.roles);
    setWorkTypes(pref.workTypes);
    setMounted(true);
  }, []);

  function toggle<T extends string>(list: T[], set: (v: T[]) => void, value: T) {
    set(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  }

  function finish() {
    const p = getProfile();
    setProfile({ ...p, name: name.trim() || "You", headline: headline.trim(), location: location.trim() });
    setPreferences({
      strengths,
      industries,
      roles,
      caseTypes,
      workTypes,
      setupComplete: true,
    });
    router.push("/profile");
  }

  if (!mounted) {
    return <main className="mx-auto max-w-2xl px-5 py-10 text-muted">Loading…</main>;
  }

  const canNext = step !== 0 || name.trim().length > 0;
  const last = STEPS.length - 1;

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black tracking-tight">Set up your profile</h1>
        <span className="text-sm text-faint">
          Step {step + 1}/{STEPS.length}
        </span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-panel">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-400 transition-all"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-surface p-6">
        {step === 0 && (
          <div className="space-y-4">
            <StepHead title="The basics" sub="Let's start with who you are." />
            <Labeled label="Your name">
              <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jonas Weber" />
            </Labeled>
            <Labeled label="Headline">
              <input className={inputCls} value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. Aspiring BD analyst · ex-founder" />
            </Labeled>
            <Labeled label="Location">
              <input className={inputCls} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Berlin, Germany" />
            </Labeled>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <StepHead title="What are you good at?" sub="Pick your strengths — these show on your profile and CV." />
            <ChipSelect options={STRENGTHS} selected={strengths} onToggle={(v) => toggle(strengths, setStrengths, v)} />
            <div className="flex gap-2">
              <input
                className={inputCls}
                value={customStrength}
                onChange={(e) => setCustomStrength(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && customStrength.trim()) {
                    setStrengths([...strengths, customStrength.trim()]);
                    setCustomStrength("");
                  }
                }}
                placeholder="Add your own…"
              />
              <button
                onClick={() => {
                  if (customStrength.trim()) {
                    setStrengths([...strengths, customStrength.trim()]);
                    setCustomStrength("");
                  }
                }}
                className="rounded-xl bg-panel px-4 text-sm font-semibold text-fg hover:bg-panel-strong"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <StepHead title="What interests you?" sub="We'll use this to surface the right cases and companies." />
            <div>
              <p className="mb-2 text-xs uppercase tracking-widest text-faint">Type of BD work</p>
              <ChipSelect options={FIELDS} selected={caseTypes} onToggle={(v) => toggle(caseTypes, setCaseTypes, v as Field)} />
            </div>
            <div>
              <p className="mb-2 text-xs uppercase tracking-widest text-faint">Industries</p>
              <ChipSelect options={INDUSTRIES} selected={industries} onToggle={(v) => toggle(industries, setIndustries, v)} />
            </div>
            <div>
              <p className="mb-2 text-xs uppercase tracking-widest text-faint">Roles</p>
              <ChipSelect options={ROLES} selected={roles} onToggle={(v) => toggle(roles, setRoles, v)} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <StepHead title="How do you want to work?" sub="What kind of opportunities are you open to?" />
            <ChipSelect options={WORK_TYPES} selected={workTypes} onToggle={(v) => toggle(workTypes, setWorkTypes, v)} />
          </div>
        )}

        {step === last && (
          <div className="space-y-4">
            <StepHead title="You're all set 🎉" sub="Here's your setup — you can change any of it later in your profile." />
            <Summary label="Strengths" items={strengths} />
            <Summary label="BD interests" items={caseTypes} />
            <Summary label="Industries" items={industries} />
            <Summary label="Roles" items={roles} />
            <Summary label="Open to" items={workTypes} />
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.06] p-4 text-sm">
              <p className="font-semibold text-indigo-700 dark:text-indigo-200">One more thing</p>
              <p className="mt-1 text-body">
                Take a quick psychometric test so companies see how you think, not just what you pick.{" "}
                <Link href="/tests" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-300">
                  Browse tests →
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-fg hover:bg-panel disabled:opacity-40"
        >
          Back
        </button>
        {step < last ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext}
            className="rounded-xl bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-40"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={finish}
            className="rounded-xl bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400"
          >
            Finish setup
          </button>
        )}
      </div>
    </main>
  );
}

const inputCls =
  "w-full rounded-xl border border-line bg-input px-3 py-2 text-sm text-fg outline-none placeholder:text-faint focus:border-indigo-400/50";

function StepHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-fg">{title}</h2>
      <p className="text-sm text-muted">{sub}</p>
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-widest text-muted">{label}</span>
      {children}
    </label>
  );
}

function ChipSelect({
  options,
  selected,
  onToggle,
}: {
  options: readonly string[];
  selected: string[];
  onToggle: (o: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <button
            key={o}
            onClick={() => onToggle(o)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ring-1 transition ${
              on
                ? "bg-indigo-500 text-white ring-indigo-500"
                : "bg-surface text-body ring-line hover:border-indigo-400/40"
            }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

function Summary({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs uppercase tracking-widest text-faint">{label}:</span>
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
