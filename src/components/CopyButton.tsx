"use client";

import { useState } from "react";
import { copyText } from "@/lib/asset";

export function CopyButton({
  text,
  label = "复制",
  variant = "ghost",
}: {
  text: string;
  label?: string;
  variant?: "ghost" | "pill" | "solid";
}) {
  const [done, setDone] = useState(false);

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (await copyText(text)) {
      setDone(true);
      window.setTimeout(() => setDone(false), 1600);
    }
  };

  const base =
    "inline-flex items-center gap-1.5 transition-all duration-200 select-none";
  const styles = {
    ghost: "text-[12px] font-medium text-accent hover:underline underline-offset-4",
    pill: "rounded-full border border-hairline bg-raised px-3 py-1 text-[11.5px] text-ink hover:border-ink/25",
    solid: "rounded-full bg-accent px-3.5 py-1.5 text-[12px] font-medium text-accent-ink hover:opacity-90",
  }[variant];

  return (
    <button type="button" onClick={onClick} className={`${base} ${styles}`} aria-live="polite">
      {done ? (
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 8.5 6.5 12 13 4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
          <path d="M10.5 5.5v-2a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2" />
        </svg>
      )}
      {done ? "已复制" : label}
    </button>
  );
}
