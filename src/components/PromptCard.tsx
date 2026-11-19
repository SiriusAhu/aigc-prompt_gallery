"use client";

import { CopyButton } from "./CopyButton";
import { ImageDeck, type DeckImage } from "./ImageDeck";

export interface ViewItem {
  id: string;
  title: string;
  prompt: string;
  /** 分类即标签，第一个显示为角标 */
  tags?: string[];
  /** 同一提示词的多张生成结果，悬停抽牌展开 */
  images?: DeckImage[];
  /** 占位渐变（无图时使用） */
  gradient?: string;
  /** 是否带视频（决定是否显示悬停提示） */
  hasVideo?: boolean;
  /** 生成所用模型，展示时署名 */
  model?: string;
}

interface Props {
  item: ViewItem;
  /** 预览框比例：图片页 4/3，视频页 16/9 */
  ratio?: "4/3" | "16/9";
  href?: string;
  /** 用于错峰入场动画 */
  index?: number;
}

const FALLBACK = "linear-gradient(135deg, var(--tile-1) 0%, var(--tile-2) 60%, var(--tile-1) 100%)";

export function PromptCard({ item, ratio = "4/3", href, index = 0 }: Props) {
  const hasImages = Boolean(item.images && item.images.length > 0);

  return (
    <article
      className="pv-rise group flex flex-col rounded-[24px] border border-hairline bg-raised p-2.5 transition-all duration-300 hover:-translate-y-1 hover:border-ink/15 hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.45)]"
      style={{ boxShadow: "var(--shadow)", animationDelay: `${Math.min(index, 12) * 45}ms` }}
    >
      {hasImages ? (
        <ImageDeck images={item.images!} alt={item.title} ratio={ratio} />
      ) : (
        <div
          className={`relative overflow-hidden rounded-[18px] bg-surface ${
            ratio === "4/3" ? "aspect-[4/3]" : "aspect-video"
          }`}
          style={{ background: item.gradient ?? FALLBACK }}
        >
          <div className="absolute inset-0 grid place-items-center">
            <span className="select-none text-[11px] uppercase tracking-[0.25em] text-muted/50">
              预览占位
            </span>
          </div>
          {item.hasVideo && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/25 px-2 py-1 text-[10px] text-white backdrop-blur-md">
              <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 fill-current">
                <path d="M3 1.5 10.5 6 3 10.5z" />
              </svg>
              悬停预览
            </span>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col px-2 pb-1.5 pt-3.5">
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

        {item.model && (
          <p className="mt-1.5 truncate font-mono text-[10px] text-muted/60" title={item.model}>
            {item.model}
          </p>
        )}
      </div>
    </article>
  );
}
