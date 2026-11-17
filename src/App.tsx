import { useCallback, useEffect, useMemo, useState } from "react";
import { DetailModal } from "./components/DetailModal";
import { FilterBar, type SortKey } from "./components/FilterBar";
import { PromptCard } from "./components/PromptCard";
import { PROMPTS } from "./data/prompts";
import { CATEGORIES } from "./data/categories";
import type { Category, PromptItem } from "./data/types";

const TAG_COUNTS = PROMPTS.reduce<Record<string, number>>((acc, p) => {
  for (const t of p.tags ?? []) acc[t] = (acc[t] ?? 0) + 1;
  return acc;
}, {});

/** 只展示出现次数最多的标签，避免一屏塞满 chips */
const HOT_TAGS = Object.entries(TAG_COUNTS)
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-CN"))
  .slice(0, 12)
  .map(([t]) => t);

const COUNTS = PROMPTS.reduce<Record<string, number>>((acc, p) => {
  acc[p.category] = (acc[p.category] ?? 0) + 1;
  return acc;
}, {});

function readHash(): Pick<PromptItem, "id"> | null {
  const m = window.location.hash.match(/^#p\/(.+)$/);
  return m ? { id: decodeURIComponent(m[1]) } : null;
}

export default function App() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [tag, setTag] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("curated");
  const [active, setActive] = useState<PromptItem | null>(null);

  // 深链：#p/<id> 直接打开详情，方便把单个提示词分享出去
  useEffect(() => {
    const sync = () => {
      const h = readHash();
      const found = h ? PROMPTS.find((p) => p.id === h.id) : null;
      setActive((cur) => (found?.id === cur?.id ? cur : (found ?? null)));
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const open = useCallback((item: PromptItem) => {
    setActive(item);
    window.history.replaceState(null, "", `#p/${encodeURIComponent(item.id)}`);
  }, []);

  const close = useCallback(() => {
    setActive(null);
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = PROMPTS.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (tag && !(p.tags ?? []).includes(tag)) return false;
      if (!q) return true;
      const haystack = [p.title, p.prompt, p.negative ?? "", p.notes ?? "", ...p.models, ...(p.tags ?? [])]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });

    if (sort === "newest") {
      return [...list].sort((a, b) => (b.added ?? "").localeCompare(a.added ?? ""));
    }
    if (sort === "title") {
      return [...list].sort((a, b) => a.title.localeCompare(b.title, "zh-CN"));
    }
    return list;
  }, [query, category, tag, sort]);

  const reset = () => {
    setQuery("");
    setCategory("all");
    setTag(null);
  };

  const withVideo = PROMPTS.filter((p) => p.media?.video).length;
  const hasFilter = Boolean(query || category !== "all" || tag);

  return (
    <div className="mx-auto min-h-screen w-full max-w-[1400px] px-4 pb-24 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4 py-6">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent-warm text-ink-950">
            <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current">
              <path d="M4 2.2 13 8l-9 5.8z" />
            </svg>
          </div>
          <div className="leading-tight">
            <h1 className="text-[15px] font-semibold tracking-tight text-white">PromptVault</h1>
            <p className="font-mono text-[10.5px] text-mist-500">AI 视频提示词库</p>
          </div>
        </div>

        <div className="flex items-center gap-4 font-mono text-[11px] text-mist-500">
          <span>
            <b className="font-semibold text-mist-100">{PROMPTS.length}</b> 条模板
          </span>
          <span className="h-3 w-px bg-white/10" />
          <span>
            <b className="font-semibold text-mist-100">{withVideo}</b> 段视频
          </span>
        </div>
      </header>

      <section className="mb-2 max-w-2xl space-y-3 pb-6">
        <h2 className="text-2xl font-semibold leading-tight tracking-tight text-white sm:text-[32px]">
          把有效的运镜、光位和参数
          <span className="bg-gradient-to-r from-accent to-accent-warm bg-clip-text text-transparent">
            {" "}
            沉淀成可复用的模板
          </span>
        </h2>
        <p className="text-[13px] leading-relaxed text-mist-300">
          每条模板都带正负向提示词、画幅时长参数和实测备注。悬停卡片看效果，点开复制。
          视频放在 <code className="rounded bg-white/[0.06] px-1 font-mono text-[11px]">assets/</code>{" "}
          下，按文件名自动关联。
        </p>
      </section>

      <FilterBar
        query={query}
        onQuery={setQuery}
        category={category}
        onCategory={setCategory}
        tag={tag}
        onTag={setTag}
        tags={HOT_TAGS}
        sort={sort}
        onSort={setSort}
        counts={COUNTS}
        total={PROMPTS.length}
        shown={filtered.length}
      />

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item, i) => (
            <PromptCard key={item.id} item={item} index={i} onOpen={open} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-white/10 py-20 text-center">
          <span className="text-3xl opacity-30">∅</span>
          <div className="space-y-1">
            <p className="text-[14px] text-mist-300">没有匹配的模板</p>
            <p className="text-[12px] text-mist-500">
              换个关键词，或清除当前的分类与标签筛选
            </p>
          </div>
          {hasFilter && (
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border border-accent/30 px-3 py-1.5 text-[12px] text-accent
                         transition-colors hover:bg-accent/10"
            >
              清除全部筛选
            </button>
          )}
        </div>
      )}

      <footer className="mt-16 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-5 text-[11px] text-mist-500">
        <p>
          收录 {PROMPTS.length} 条 · 覆盖 {CATEGORIES.length} 个维度
        </p>
        <p className="font-mono">
          按 <kbd className="rounded border border-white/15 px-1">/</kbd> 搜索 ·{" "}
          <kbd className="rounded border border-white/15 px-1">C</kbd> 复制当前卡片
        </p>
      </footer>

      <DetailModal item={active} onClose={close} />
    </div>
  );
}
