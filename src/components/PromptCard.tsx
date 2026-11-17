import { useCallback, useState } from "react";
import type { KeyboardEvent } from "react";
import { CATEGORY_MAP } from "../data/categories";
import type { PromptItem } from "../data/types";
import { copyText } from "../lib/asset";
import { HoverVideo } from "./HoverVideo";

interface Props {
  item: PromptItem;
  index: number;
  onOpen: (item: PromptItem) => void;
}

export function PromptCard({ item, index, onOpen }: Props) {
  const meta = CATEGORY_MAP[item.category];
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (e?: { stopPropagation: () => void }) => {
      e?.stopPropagation();
      const body = [item.prompt, item.negative && `\n\nNegative: ${item.negative}`]
        .filter(Boolean)
        .join("");
      if (await copyText(body)) {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }
    },
    [item.prompt, item.negative],
  );

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen(item);
    } else if (e.key.toLowerCase() === "c" && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      void copy();
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`${item.title}，${meta.label}，按回车查看详情`}
      onClick={() => onOpen(item)}
      onKeyDown={onKeyDown}
      className="pv-fade-up group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-ink-900/60
                 transition-all duration-300 hover:-translate-y-1 hover:border-white/15
                 hover:bg-ink-900 hover:shadow-[0_18px_50px_-18px_rgba(0,0,0,0.9)]
                 focus-visible:border-accent/50"
      style={{ animationDelay: `${Math.min(index, 14) * 35}ms` }}
    >
      <div className="relative">
        <HoverVideo key={item.id} item={item} />

        <span
          className="pointer-events-none absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full
                     bg-ink-950/75 px-2 py-1 text-[10px] font-medium backdrop-blur-sm"
          style={{ color: meta.tint }}
        >
          <span className="leading-none">{meta.icon}</span>
          {meta.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <header className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-mist-100 transition-colors group-hover:text-white">
              {item.title}
            </h3>
            <button
              type="button"
              onClick={copy}
              aria-label="复制提示词"
              title="复制提示词 (C)"
              className="mt-0.5 shrink-0 rounded-lg border border-white/10 p-1.5 text-mist-500
                         opacity-0 transition-all hover:border-accent/40 hover:text-accent
                         focus-visible:opacity-100 group-hover:opacity-100"
            >
              {copied ? (
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-none stroke-current stroke-[1.8]">
                  <path d="M3 8.5 6.5 12 13 4.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-none stroke-current stroke-[1.5]">
                  <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
                  <path d="M10.5 5.5v-2a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2" />
                </svg>
              )}
            </button>
          </div>

          <p className="font-mono text-[10.5px] tracking-wide text-mist-500">
            {item.models.join(" · ")}
          </p>
        </header>

        <p className="line-clamp-3 text-[12.5px] leading-relaxed text-mist-300/90">
          {item.prompt}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
          {item.tags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[10.5px] text-mist-500"
            >
              #{tag}
            </span>
          ))}
          {item.params?.duration && (
            <span className="ml-auto font-mono text-[10.5px] text-mist-500">
              {item.params.duration}s
            </span>
          )}
          {item.params?.aspect && (
            <span className="font-mono text-[10.5px] text-mist-500">{item.params.aspect}</span>
          )}
        </div>
      </div>
    </article>
  );
}
