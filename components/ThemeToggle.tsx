"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const isDark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("schutzengel-theme", isDark ? "dark" : "light");
    } catch {
      /* ignore */
    }
    setDark(isDark);
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition hover:text-fg"
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}
