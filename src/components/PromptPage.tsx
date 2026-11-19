import { Suspense } from "react";
import { KIND_META } from "@/data/categories";
import type { PromptKind } from "@/data/types";
import { byKind } from "@/lib/prompts";
import { PromptList } from "./PromptList";

function EmptyState({ kind }: { kind: PromptKind }) {
  return (
    <div className="rounded-[28px] border border-dashed border-hairline bg-surface/60 px-6 py-24 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-canvas text-muted">
        {kind === "image" ? (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.4">
            <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
            <circle cx="8.5" cy="10" r="1.6" />
            <path d="M4 17l5-5 4 4 3-2.5 4 3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.4">
            <rect x="3" y="5" width="13" height="14" rx="2.5" />
            <path d="M16 9.5l5-2.5v10l-5-2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <h2 className="mt-5 text-[15px] font-semibold tracking-[-0.01em]">还没有收录</h2>
      <p className="mx-auto mt-2 max-w-[42ch] text-[12.5px] leading-relaxed text-muted">
        这个页面暂时是空的，往数据文件里加条目即可出现。
      </p>
      <p className="mt-4 font-mono text-[11px] text-muted/70">
        src/data/prompts.ts · kind: &quot;{kind}&quot;
      </p>
    </div>
  );
}

export function PromptPage({ kind }: { kind: PromptKind }) {
  const items = byKind(kind);
  const meta = KIND_META[kind];
  const ratio = kind === "image" ? "4/3" : "16/9";

  return (
    <div className="mx-auto w-full max-w-[1120px] px-5">
      <header className="pb-8 pt-16 sm:pb-10 sm:pt-20">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted">
          {kind === "image" ? "Image" : "Video"} Prompts
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h1 className="display text-[38px] sm:text-[52px]">{meta.label}</h1>
          <span className="mb-1.5 rounded-full border border-hairline px-3 py-1 text-[11.5px] text-muted">
            {items.length} 条
          </span>
        </div>
        <p className="mt-4 max-w-[52ch] text-[14px] leading-relaxed text-muted sm:text-[15px]">
          {meta.blurb}
        </p>
      </header>

      {items.length > 0 ? (
        <Suspense fallback={<ListSkeleton />}>
          <PromptList items={items} ratio={ratio} />
        </Suspense>
      ) : (
        <EmptyState kind={kind} />
      )}
    </div>
  );
}

/** useSearchParams 在静态导出下需要一个 Suspense 边界 */
function ListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-[24px] border border-hairline bg-raised p-2.5">
          <div className="aspect-[4/3] animate-pulse rounded-[18px] bg-surface" />
          <div className="space-y-2 px-2 pb-1.5 pt-3.5">
            <div className="h-4 w-2/3 animate-pulse rounded bg-surface" />
            <div className="h-3 w-full animate-pulse rounded bg-surface" />
          </div>
        </div>
      ))}
    </div>
  );
}
