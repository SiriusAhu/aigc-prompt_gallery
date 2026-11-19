"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { PromptItem } from "@/data/types";
import { assetUrl } from "@/lib/asset";
import { PromptCard } from "./PromptCard";

type SortKey = "default" | "title" | "newest" | "oldest";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "default", label: "默认顺序" },
  { value: "title", label: "按名称" },
  { value: "newest", label: "最新收录" },
  { value: "oldest", label: "最早收录" },
];

const SORT_KEYS = SORTS.map((s) => s.value);

function normalizeSort(v: string | null): SortKey {
  return v && SORT_KEYS.includes(v as SortKey) ? (v as SortKey) : "default";
}

function sortItems(items: PromptItem[], sort: SortKey): PromptItem[] {
  const next = [...items];
  switch (sort) {
    case "title":
      return next.sort((a, b) => a.title.localeCompare(b.title, "zh-CN"));
    case "newest":
      return next.sort((a, b) => (b.added ?? "").localeCompare(a.added ?? ""));
    case "oldest":
      return next.sort((a, b) => (a.added ?? "").localeCompare(b.added ?? ""));
    default:
      return next;
  }
}

export function PromptList({
  items,
  ratio,
}: {
  items: PromptItem[];
  ratio: "4/3" | "16/9";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // 状态完全来自 URL，刷新与分享都能还原
  const tag = params.get("tag");
  const sort = normalizeSort(params.get("sort"));

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

  // 标签取自当前页面所有条目，按出现次数降序
  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      for (const t of item.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-CN"));
  }, [items]);

  const shown = useMemo(() => {
    const filtered = tag ? items.filter((i) => i.tags.includes(tag)) : items;
    return sortItems(filtered, sort);
  }, [items, tag, sort]);

  const tagKnown = tag === null || tags.some(([t]) => t === tag);

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 border-b border-hairline pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setParam("tag", null)}
            aria-pressed={tag === null}
            className={`rounded-full px-3 py-1.5 text-[12px] transition-colors ${
              tag === null
                ? "bg-ink text-canvas"
                : "border border-hairline text-muted hover:border-ink/25 hover:text-ink"
            }`}
          >
            全部
            <span className="ml-1.5 opacity-60">{items.length}</span>
          </button>

          {tags.map(([t, count]) => {
            const active = tag === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setParam("tag", active ? null : t)}
                aria-pressed={active}
                className={`rounded-full px-3 py-1.5 text-[12px] transition-colors ${
                  active
                    ? "bg-ink text-canvas"
                    : "border border-hairline text-muted hover:border-ink/25 hover:text-ink"
                }`}
              >
                {t}
                <span className="ml-1.5 opacity-60">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-[11.5px] text-muted sm:block">{shown.length} 条</span>
          <label className="flex items-center gap-2 text-[12px] text-muted">
            <span className="sr-only">排序方式</span>
            <select
              value={sort}
              onChange={(e) => setParam("sort", e.target.value === "default" ? null : e.target.value)}
              className="cursor-pointer rounded-full border border-hairline bg-canvas px-3 py-1.5 text-[12px] text-ink outline-none transition-colors hover:border-ink/25"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {shown.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p, i) => (
            <PromptCard
              key={p.id}
              index={i}
              ratio={ratio}
              href={`/p/${p.id}`}
              item={{
                id: p.id,
                title: p.title,
                prompt: p.prompt,
                tags: p.tags,
                images: p.media?.images
                  ?.map((img) => {
                    const src = assetUrl(img.src);
                    return src ? { src, seed: img.seed } : null;
                  })
                  .filter(Boolean) as { src: string; seed?: number | null }[] | undefined,
                hasVideo: Boolean(p.media?.video),
                model: p.models?.[0],
              }}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-hairline py-20 text-center">
          <p className="text-[14px] text-ink">
            {tagKnown ? "这个标签下还没有内容" : `没有找到标签「${tag}」`}
          </p>
          <button
            type="button"
            onClick={() => setParam("tag", null)}
            className="mt-3 rounded-full border border-hairline px-3.5 py-1.5 text-[12px] text-muted transition-colors hover:border-ink/25 hover:text-ink"
          >
            查看全部
          </button>
        </div>
      )}
    </>
  );
}
