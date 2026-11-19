"use client";

import { useEffect, useState } from "react";

type Pref = "system" | "light" | "dark";

const STORAGE_KEY = "pv-theme";

const OPTIONS: { value: Pref; label: string; icon: React.ReactNode }[] = [
  {
    value: "system",
    label: "跟随系统",
    icon: (
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="2" y="3" width="12" height="8" rx="1.5" />
        <path d="M5.5 13.5h5M8 11v2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    value: "light",
    label: "浅色",
    icon: (
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.4">
        <circle cx="8" cy="8" r="3" />
        <path d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M12.6 3.4l-1.1 1.1M4.5 11.5l-1.1 1.1" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    value: "dark",
    label: "深色",
    icon: (
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M13.2 9.6A5.4 5.4 0 0 1 6.4 2.8a5.5 5.5 0 1 0 6.8 6.8Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

function apply(pref: Pref) {
  const dark =
    pref === "dark" ||
    (pref === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

export function ThemeToggle() {
  const [pref, setPref] = useState<Pref>("system");

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Pref | null) ?? "system";
    setPref(stored);
    apply(stored);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if ((localStorage.getItem(STORAGE_KEY) as Pref | null) === "system") apply("system");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const choose = (next: Pref) => {
    setPref(next);
    localStorage.setItem(STORAGE_KEY, next);
    apply(next);
  };

  return (
    <div
      role="group"
      aria-label="外观"
      className="flex items-center rounded-full border border-hairline bg-surface p-0.5"
    >
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => choose(o.value)}
          title={o.label}
          aria-label={o.label}
          aria-pressed={pref === o.value}
          className={`grid h-6 w-6 place-items-center rounded-full transition-colors ${
            pref === o.value
              ? "bg-canvas text-ink shadow-[0_1px_3px_rgba(0,0,0,0.12)]"
              : "text-muted hover:text-ink"
          }`}
        >
          {o.icon}
        </button>
      ))}
    </div>
  );
}
