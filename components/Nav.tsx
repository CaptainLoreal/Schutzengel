"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getRole,
  setRole,
  getSeekerName,
  mySubmissions,
  getChallenge,
  type Role,
} from "@/lib/store";
import { totalXp, rankFor } from "@/lib/gamification";

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRoleState] = useState<Role>("seeker");
  const [live, setLive] = useState<boolean | null>(null);
  const [initial, setInitial] = useState("Y");
  const [xp, setXp] = useState(0);

  useEffect(() => {
    setRoleState(getRole());
    setInitial((getSeekerName()[0] || "Y").toUpperCase());
    setXp(totalXp(mySubmissions(), getChallenge));
    fetch("/api/status")
      .then((r) => r.json())
      .then((d) => setLive(Boolean(d.live)))
      .catch(() => setLive(false));
  }, [pathname]);

  function switchTo(r: Role) {
    setRole(r);
    setRoleState(r);
    router.push(r === "seeker" ? "/" : "/company");
  }

  const links =
    role === "seeker"
      ? [
          { href: "/", label: "Cases" },
          { href: "/me", label: "My Work" },
          { href: "/cv", label: "CV" },
          { href: "/psychometrics", label: "Psychometrics" },
        ]
      : [
          { href: "/company", label: "Console" },
          { href: "/company/new", label: "Post a case" },
        ];

  return (
    <header
      className="sticky top-0 z-20 border-b border-line backdrop-blur"
      style={{ background: "var(--navbg)" }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3">
        <div className="flex items-center gap-5">
          <Link href={role === "seeker" ? "/" : "/company"} className="flex items-center gap-2">
            <span className="text-clay-400">◆</span>
            <span className="font-serif text-lg font-black tracking-tight text-fg">Schutzengel</span>
          </Link>
          <nav className="hidden gap-1 sm:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-1.5 text-sm transition ${
                  pathname === l.href ? "bg-panel text-fg" : "text-muted hover:text-fg"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {live !== null && (
            <span
              className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ring-1 sm:inline-flex ${
                live
                  ? "bg-emerald-500/10 text-emerald-700 ring-emerald-500/30 dark:text-emerald-300"
                  : "bg-panel text-muted ring-line"
              }`}
              title={live ? "AI assist is live" : "Set ANTHROPIC_API_KEY for live AI"}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${live ? "bg-emerald-500" : "bg-slate-400"}`}
              />
              {live ? "Live AI" : "Demo"}
            </span>
          )}

          <Link
            href="/profile"
            title="Your progress"
            className="hidden items-center gap-1.5 rounded-full bg-clay-500/10 px-2.5 py-1 text-xs font-semibold text-clay-700 ring-1 ring-clay-500/20 sm:inline-flex dark:text-clay-300"
          >
            ★ {rankFor(xp).name} · {xp} XP
          </Link>

          <div className="flex rounded-lg border border-line p-0.5 text-xs font-semibold">
            <button
              onClick={() => switchTo("seeker")}
              className={`rounded-md px-3 py-1.5 transition ${
                role === "seeker" ? "bg-clay-500 text-white" : "text-muted hover:text-fg"
              }`}
            >
              Seeker
            </button>
            <button
              onClick={() => switchTo("company")}
              className={`rounded-md px-3 py-1.5 transition ${
                role === "company" ? "bg-clay-500 text-white" : "text-muted hover:text-fg"
              }`}
            >
              Company
            </button>
          </div>

          <Link
            href="/profile"
            title="Your profile"
            className="grid h-8 w-8 place-items-center rounded-full bg-clay-500/15 text-sm font-bold text-clay-700 ring-1 ring-clay-500/30 transition hover:ring-clay-400/60 dark:text-clay-300"
          >
            {initial}
          </Link>
        </div>
      </div>
    </header>
  );
}
