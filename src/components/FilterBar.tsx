import { useEffect, useRef } from "react";
import { CATEGORIES } from "../data/categories";
import type { Category } from "../data/types";

export type SortKey = "curated" | "newest" | "title";

interface Props {
  query: string;
  onQuery: (v: string) => void;
  category: Category | "all";
  onCategory: (v: Category | "all") => void;
  tag: string | null;
  onTag: (v: string | null) => void;
  tags: string[];
  sort: SortKey;
  onSort: (v: SortKey) => void;
  counts: Record<string, number>;
  total: number;
  shown: number;
}

export function FilterBar({
  query,
  onQuery,
  category,
  onCategory,
  tag,
  onTag,
  tags,
  sort,
  onSort,
  counts,
  total,
  shown,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="sticky top-0 z-30 -mx-4 mb-6 border-b border-white/[0.06] bg-ink-950/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <svg
              viewBox="0 0 16 16"
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 fill-none stroke-mist-500 stroke-[1.6]"
            >
              <circle cx="7" cy="7" r="4.5" />
              <path d="M10.5 10.5 14 14" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="搜索提示词、标签、模型…"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2 pl-9 pr-9 text-[13px]
                         text-mist-100 placeholder:text-mist-500 focus:border-accent/40
                         focus:bg-white/[0.05] focus:outline-none"
            />
            {query ? (
              <button
                type="button"
                onClick={() => onQuery("")}
                aria-label="清空搜索"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-mist-500 hover:text-mist-100"
              >
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-none stroke-current stroke-[1.8]">
                  <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
                </svg>
              </button>
            ) : (
              <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-mist-500">
                /
              </kbd>
            )}
          </div>

          <select
            value={sort}
            onChange={(e) => onSort(e.target.value as SortKey)}
            aria-label="排序"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[12.5px] text-mist-300
                       focus:border-accent/40 focus:outline-none"
          >
            <option value="curated">推荐顺序</option>
            <option value="newest">最新收录</option>
            <option value="title">标题排序</option>
          </select>

          <span className="ml-auto hidden font-mono text-[11px] text-mist-500 sm:block">
            {shown} / {total}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onCategory("all")}
            className={`rounded-lg px-2.5 py-1 text-[12px] transition-colors ${
              category === "all"
                ? "bg-accent text-ink-950 font-semibold"
                : "bg-white/[0.04] text-mist-300 hover:bg-white/[0.08]"
            }`}
          >
            全部 <span className="opacity-60">{total}</span>
          </button>
          {CATEGORIES.map((c) => {
            const n = counts[c.id] ?? 0;
            if (!n) return null;
            const active = category === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onCategory(active ? "all" : c.id)}
                title={c.description}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[12px] transition-colors ${
                  active
                    ? "font-semibold"
                    : "bg-white/[0.04] text-mist-300 hover:bg-white/[0.08]"
                }`}
                style={
                  active ? { background: c.tint, color: "#080b14" } : undefined
                }
              >
                <span style={{ color: active ? undefined : c.tint }}>{c.icon}</span>
                {c.label}
                <span className="opacity-60">{n}</span>
              </button>
            );
          })}
        </div>

        {tags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            <span className="shrink-0 text-[10.5px] uppercase tracking-wider text-mist-500">
              标签
            </span>
            {tags.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onTag(tag === t ? null : t)}
                className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10.5px] transition-colors ${
                  tag === t
                    ? "bg-accent/20 text-accent ring-1 ring-accent/40"
                    : "text-mist-500 hover:bg-white/[0.06] hover:text-mist-300"
                }`}
              >
                #{t}
              </button>
            ))}
            {tag && (
              <button
                type="button"
                onClick={() => onTag(null)}
                className="shrink-0 text-[10.5px] text-mist-500 underline-offset-2 hover:text-accent hover:underline"
              >
                清除
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
