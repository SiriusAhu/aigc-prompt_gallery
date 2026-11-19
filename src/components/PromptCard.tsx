"use client";

import { CopyButton } from "./CopyButton";

export interface ViewItem {
  id: string;
  title: string;
  prompt: string;
  /** 分类即标签，第一个显示为角标 */
  tags?: string[];
  /** 预览图 URL；没有则用 gradient 占位 */
  cover?: string;
  /** 占位渐变（CSS background 值） */
  gradient?: string;
  /** 是否带视频（决定是否显示悬停提示） */
  hasVideo?: boolean;
}

interface Props {
  item: ViewItem;
  /** 预览框比例：图片页 4/3，视频页 16/9 */
  ratio?: "4/3" | "16/9";
  href?: string;
}

const FALLBACK = "linear-gradient(135deg, var(--tile-1) 0%, var(--tile-2) 60%, var(--tile-1) 100%)";

export function PromptCard({ item, ratio = "4/3", href }: Props) {
  return (
    <article
      className="group rounded-[24px] border border-hairline bg-raised p-2.5 transition-all duration-300 hover:-translate-y-0.5"
      style={{ boxShadow: "var(--shadow)" }}
    >
      <div
        className={`relative overflow-hidden rounded-[18px] bg-surface ${
          ratio === "4/3" ? "aspect-[4/3]" : "aspect-video"
        }`}
        style={{ background: item.cover ? undefined : (item.gradient ?? FALLBACK) }}
      >
        {item.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.cover}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <span className="select-none text-[11px] uppercase tracking-[0.25em] text-muted/50">
              预览占位
            </span>
          </div>
        )}

        {item.tags?.[0] && (
          <span className="absolute left-3 top-3 rounded-full bg-black/25 px-2.5 py-1 text-[10.5px] font-medium text-white backdrop-blur-md">
            {item.tags[0]}
          </span>
        )}

        {item.hasVideo && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/25 px-2 py-1 text-[10px] text-white backdrop-blur-md">
            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 fill-current">
              <path d="M3 1.5 10.5 6 3 10.5z" />
            </svg>
            悬停预览
          </span>
        )}
      </div>

      <div className="px-2 pb-1.5 pt-3.5">
        <h3 className="text-[15.5px] font-semibold tracking-[-0.01em]">
          <a href={href ?? "#"} className="hover:text-accent">
            {item.title}
          </a>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-[1.6] text-muted">{item.prompt}</p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="truncate text-[11px] text-muted">
            {(item.tags ?? []).slice(0, 3).join(" · ")}
          </span>
          <CopyButton text={item.prompt} label="复制提示词" variant="ghost" />
        </div>
      </div>
    </article>
  );
}
