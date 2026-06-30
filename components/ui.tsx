import type { Field, SubmissionStatus } from "@/lib/types";
import { FIELD_STYLES, STATUS_STYLES, STATUS_LABEL } from "@/lib/fields";

export function FieldBadge({ field }: { field: Field }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${FIELD_STYLES[field]}`}
    >
      {field}
    </span>
  );
}

export function StatusBadge({ status }: { status: SubmissionStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-white/[0.06] px-2 py-0.5 text-xs text-slate-300">
      {children}
    </span>
  );
}

export function scoreColor(v: number): string {
  if (v < 50) return "text-rose-400";
  if (v < 75) return "text-amber-300";
  return "text-emerald-400";
}

function barColor(v: number): string {
  if (v < 50) return "bg-rose-400";
  if (v < 75) return "bg-amber-300";
  return "bg-emerald-400";
}

export function ScoreBar({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
        <span className="text-slate-300">{label}</span>
        <span className={`font-semibold tabular-nums ${scoreColor(value)}`}>{value}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${barColor(value)} transition-all`}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
      {note && <p className="mt-1 text-xs text-slate-500">{note}</p>}
    </div>
  );
}

export function ScoreRing({ value, size = 120 }: { value: number; size?: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const offset = c - (pct / 100) * c;
  const stroke = value < 50 ? "#fb7185" : value < 75 ? "#fcd34d" : "#34d399";
  return (
    <div className="relative" style={{ height: size, width: size }}>
      <svg viewBox="0 0 120 120" className="-rotate-90" style={{ height: size, width: size }}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold tabular-nums ${scoreColor(value)}`}>{value}</span>
        <span className="text-[10px] uppercase tracking-widest text-slate-400">/ 100</span>
      </div>
    </div>
  );
}

const REC_STYLES = {
  advance: { label: "Advance", cls: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30" },
  maybe: { label: "Maybe", cls: "bg-amber-500/15 text-amber-300 ring-amber-500/30" },
  pass: { label: "Pass", cls: "bg-rose-500/15 text-rose-300 ring-rose-500/30" },
} as const;

export function RecPill({ rec }: { rec: "advance" | "maybe" | "pass" }) {
  const s = REC_STYLES[rec];
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold uppercase tracking-wide ring-1 ${s.cls}`}
    >
      {s.label}
    </span>
  );
}

export function Spinner() {
  return (
    <span className="pa-spin inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white" />
  );
}
