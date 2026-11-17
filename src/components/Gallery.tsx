"use client";

import { useCallback, useMemo, useRef, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES } from "@/data/categories";
import type { PromptItem } from "@/data/types";
import { PromptCard } from "./PromptCard";

type SortKey = "curated" | "newest" | "title";

const VALID_SORTS: SortKey[] = ["curated", "newest", "title"];

interface Props {
  items: PromptItem[];
  /** 固定分类（分类页传），不传则展示全部分类 */
  category?: string;
  title?: string;
  description?: string;
}

function GalleryInner({ items, category, title, description }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const q = params.get("q") ?? "";
  const tag = params.get("tag");
  const sortParam = params.get("sort") as SortKey | null;
  const sort: SortKey = sortParam && VALID_SORTS.includes(sortParam) ? sortParam : "curated";

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

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

  const allTags = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of items) for (const t of p.tags ?? []) counts[t] = (counts[t] ?? 0) + 1;
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-CN"))
      .slice(0, 14)
      .map(([t]) => t);
  }, [items]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const list = items.filter((p) => {
      if (category && p.category !== category) return false;
      if (tag && !(p.tags ?? []).includes(tag)) return false;
      if (!query) return true;
      return [p.title, p.prompt, p.negative ?? "", p.notes ?? "", ...p.models, ...(p.tags ?? [])]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });

    if (sort === "newest") {
      return [...list].sort((a, b) => (b.added ?? "").localeCompare(a.added ?? ""));
    }
    if (sort === "title") {
      return [...list].sort((a, b) => a.title.localeCompare(b.title, "zh-CN"));
    }
    return list;
  }, [items, category, tag, q, sort]);

  const reset = () => router.replace(pathname, { scroll: false });
  const hasFilter = Boolean(q || tag);

  return (
    <section aria-label={title ?? "提示词列表"}>
      <div className="mb-5 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <svg
              viewBox="0 0 16 16"
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 fill-none stroke-mist-500 stroke-[1.6]"
            >
              <circle cx="7" cy="7" r="4.5" />
              <path d="M10.5 10.5 14 14" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setParam("q", e.target.value || null)}
              placeholder="搜索提示词、标签、模型…"
              aria-label="搜索提示词"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2 pl-9 pr-9 text-[13px]
                         text-mist-100 placeholder:text-mist-500 focus:border-accent/40
                         focus:bg-white/[0.05] focus:outline-none"
            />
            {q ? (
              <button
                type="button"
                onClick={() => setParam("q", null)}
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
            onChange={(e) => setParam("sort", e.target.value === "curated" ? null : e.target.value)}
            aria-label="排序"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[12.5px] text-mist-300 focus:border-accent/40 focus:outline-none"
          >
            <option value="curated">推荐顺序</option>
            <option value="newest">最新收录</option>
            <option value="title">标题排序</option>
          </select>

          <span className="ml-auto hidden font-mono text-[11px] text-mist-500 sm:block">
            {filtered.length} / {items.length}
          </span>
        </div>

        {!category && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10.5px] uppercase tracking-wider text-mist-500">分类</span>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  router.push(`/c/${c.id}/`);
                }}
                className="inline-flex items-center gap-1 rounded-lg bg-white/[0.04] px-2 py-1 text-[11.5px] text-mist-300 transition-colors hover:bg-white/[0.08]"
              >
                <span style={{ color: c.tint }}>{c.icon}</span>
                {c.label}
              </button>
            ))}
          </div>
        )}

        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            <span className="shrink-0 text-[10.5px] uppercase tracking-wider text-mist-500">标签</span>
            {allTags.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setParam("tag", tag === t ? null : t)}
                className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10.5px] transition-colors ${
                  tag === t
                    ? "bg-accent/20 text-accent ring-1 ring-accent/40"
                    : "text-mist-500 hover:bg-white/[0.06] hover:text-mist-300"
                }`}
              >
                #{t}
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item, i) => (
            <PromptCard key={item.id} item={item} index={i} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-white/10 py-20 text-center">
          <span className="text-3xl opacity-30">∅</span>
          <div className="space-y-1">
            <p className="text-[14px] text-mist-300">没有匹配的模板</p>
            <p className="text-[12px] text-mist-500">换个关键词，或清除当前的标签筛选</p>
          </div>
          {hasFilter && (
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border border-accent/30 px-3 py-1.5 text-[12px] text-accent transition-colors hover:bg-accent/10"
            >
              清除筛选
            </button>
          )}
        </div>
      )}

      {description && <p className="mt-6 text-[11.5px] text-mist-500">{description}</p>}
    </section>
  );
}

export function Gallery(props: Props) {
  return <GalleryInner {...props} />;
}
