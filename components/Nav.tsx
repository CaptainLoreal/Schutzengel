"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getRole, setRole, type Role } from "@/lib/store";

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRoleState] = useState<Role>("seeker");
  const [live, setLive] = useState<boolean | null>(null);

  useEffect(() => {
    setRoleState(getRole());
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
          { href: "/", label: "Challenges" },
          { href: "/me", label: "My Work" },
        ]
      : [
          { href: "/company", label: "Console" },
          { href: "/company/new", label: "Post a Challenge" },
        ];

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#080b11]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3">
        <div className="flex items-center gap-5">
          <Link href={role === "seeker" ? "/" : "/company"} className="flex items-center gap-2">
            <span className="text-indigo-400">◆</span>
            <span className="font-black tracking-tight">proofwork</span>
          </Link>
          <nav className="hidden gap-1 sm:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-1.5 text-sm transition ${
                  pathname === l.href ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {live !== null && (
            <span
              className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ring-1 sm:inline-flex ${
                live
                  ? "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30"
                  : "bg-slate-500/10 text-slate-300 ring-slate-500/30"
              }`}
              title={live ? "AI assist is live" : "Set ANTHROPIC_API_KEY for live AI"}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-emerald-400" : "bg-slate-400"}`} />
              {live ? "Live AI" : "Demo"}
            </span>
          )}
          <div className="flex rounded-lg border border-white/10 p-0.5 text-xs font-semibold">
            <button
              onClick={() => switchTo("seeker")}
              className={`rounded-md px-3 py-1.5 transition ${
                role === "seeker" ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Seeker
            </button>
            <button
              onClick={() => switchTo("company")}
              className={`rounded-md px-3 py-1.5 transition ${
                role === "company" ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Company
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
