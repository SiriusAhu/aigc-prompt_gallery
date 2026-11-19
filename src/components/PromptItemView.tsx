"use client";

import { CopyButton } from "./CopyButton";

export interface ViewItem {
  id: string;
  title: string;
  prompt: string;
  tag?: string;
  /** 预览图 URL；没有则用 gradient 占位 */
  cover?: string;
  /** 占位渐变（CSS background 值） */
  gradient?: string;
  /** 是否带视频（决定是否显示悬停提示） */
  hasVideo?: boolean;
}

export type ViewVariant = "tile" | "card" | "list";

interface Props {
  item: ViewItem;
  variant: ViewVariant;
  /** 预览框比例，图片页 4/3、视频页 16/9 */
  ratio?: "4/3" | "16/9";
  href?: string;
}

const FALLBACK =
  "linear-gradient(135deg, var(--tile-1) 0%, var(--tile-2) 55%, var(--tile-1) 100%)";

function Preview({
  item,
  ratio,
  className,
}: {
  item: ViewItem;
  ratio: "4/3" | "16/9";
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden bg-surface ${ratio === "4/3" ? "aspect-[4/3]" : "aspect-video"} ${className ?? ""}`}
      style={{ background: item.cover ? undefined : (item.gradient ?? FALLBACK) }}
    >
      {item.cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.cover}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      )}

      {!item.cover && (
        <div className="absolute inset-0 grid place-items-center">
          <span className="select-none text-[11px] uppercase tracking-[0.25em] text-black/25">
            预览占位
          </span>
        </div>
      )}

      {item.tag && (
        <span className="absolute left-3 top-3 rounded-full bg-black/25 px-2.5 py-1 text-[10.5px] font-medium text-white backdrop-blur-md">
          {item.tag}
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
  );
}

export function PromptItemView({ item, variant, ratio = "4/3", href }: Props) {
  const copy = <CopyButton text={item.prompt} label="复制提示词" variant="ghost" />;

  if (variant === "list") {
    return (
      <article className="group flex flex-col gap-4 border-b border-hairline py-6 sm:flex-row sm:gap-7">
        <div className="w-full shrink-0 sm:w-[290px]">
          <div className="overflow-hidden rounded-[20px]">
            <Preview item={item} ratio={ratio} />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-[16px] font-semibold tracking-[-0.01em]">
              <a href={href ?? "#"} className="hover:text-accent">
                {item.title}
              </a>
            </h3>
            <CopyButton text={item.prompt} label="复制" variant="pill" />
          </div>
          <p className="mt-2 line-clamp-3 text-[13px] leading-[1.65] text-muted">{item.prompt}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-muted">
            {item.tag && <span>{item.tag}</span>}
            {item.hasVideo && <span>可悬停预览</span>}
          </div>
        </div>
      </article>
    );
  }

  if (variant === "card") {
    return (
      <article
        className="group rounded-[24px] border border-hairline bg-raised p-2.5 transition-all duration-300 hover:-translate-y-0.5"
        style={{ boxShadow: "var(--shadow)" }}
      >
        <div className="overflow-hidden rounded-[18px]">
          <Preview item={item} ratio={ratio} />
        </div>
        <div className="px-2 pb-1.5 pt-3.5">
          <h3 className="text-[15.5px] font-semibold tracking-[-0.01em]">
            <a href={href ?? "#"} className="hover:text-accent">
              {item.title}
            </a>
          </h3>
          <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-[1.6] text-muted">{item.prompt}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px] text-muted">{item.tag}</span>
            {copy}
          </div>
        </div>
      </article>
    );
  }

  // tile：无卡片边框，靠留白分隔
  return (
    <article className="group">
      <div className="overflow-hidden rounded-[24px]">
        <Preview item={item} ratio={ratio} />
      </div>
      <div className="pt-4">
        <h3 className="text-[16px] font-semibold tracking-[-0.01em]">
          <a href={href ?? "#"} className="hover:text-accent">
            {item.title}
          </a>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-[1.65] text-muted">{item.prompt}</p>
        <div className="mt-3 flex items-center gap-2.5">
          {copy}
          {item.tag && (
            <>
              <span className="text-[11px] text-hairline">|</span>
              <span className="text-[11.5px] text-muted">{item.tag}</span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
