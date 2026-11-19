"use client";

import { useState } from "react";

export interface DeckImage {
  src: string;
  seed?: number | null;
}

interface Props {
  images: DeckImage[];
  alt: string;
  ratio?: "4/3" | "16/9";
}

function seedLabel(seed?: number | null) {
  return seed == null ? "seed N/A" : `seed ${seed}`;
}

/**
 * 同一提示词的多张结果共用一张卡片：
 * - 桌面端悬停时像抽牌一样把全部结果展开，每张标注种子
 * - 触屏没有 hover，退化为单图 + 左右按钮循环
 */
export function ImageDeck({ images, alt, ratio = "4/3" }: Props) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const total = images.length;
  const mid = (total - 1) / 2;

  const canHover =
    typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches;

  const go = (delta: number) => {
    if (total <= 1) return;
    setIndex((i) => (i + delta + total) % total);
  };

  const box = ratio === "16/9" ? "aspect-video" : "aspect-[4/3]";

  return (
    <div
      className={`pv-deck relative overflow-hidden bg-surface ${box} rounded-[18px]`}
      onMouseEnter={() => canHover && total > 1 && setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* 基础层：当前图 */}
      {images.map((img, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={img.src}
          src={img.src}
          alt={i === index ? alt : ""}
          aria-hidden={i !== index}
          loading="eager"
          decoding="async"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* 悬停抽牌：全部结果展开 */}
      {total > 1 && (
        <div
          className={`pv-fan pointer-events-none absolute inset-0 z-20 ${open ? "is-open" : ""}`}
          aria-hidden="true"
        >
          {images.map((img, i) => (
            <figure
              key={img.src}
              className="pv-fan-card absolute left-1/2 top-1/2 w-[40%]"
              style={
                {
                  "--pv-rot": `${(i - mid) * 13}deg`,
                  "--pv-dx": `${(i - mid) * 55}%`,
                  "--pv-dy": `${Math.abs(i - mid) * 8 - 6}%`,
                  zIndex: 30 - Math.round(Math.abs(i - mid) * 10),
                } as React.CSSProperties
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt=""
                className="aspect-square w-full rounded-[10px] object-cover shadow-[0_12px_32px_rgba(0,0,0,0.45)] ring-1 ring-black/20"
              />
              <figcaption className="absolute inset-x-2 top-2 rounded-full bg-black/65 px-1.5 py-0.5 text-center font-mono text-[9px] leading-tight text-white backdrop-blur-sm">
                {seedLabel(img.seed)}
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      {/* 触屏 / 无 hover 时的循环切换 */}
      {total > 1 && (
        <div
          className={`absolute inset-0 z-30 transition-opacity duration-200 ${
            open ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              go(-1);
            }}
            aria-label="上一张"
            className="absolute left-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white opacity-90 backdrop-blur-md transition-all hover:bg-black/60 hover:opacity-100"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M10 3 5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              go(1);
            }}
            aria-label="下一张"
            className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white opacity-90 backdrop-blur-md transition-all hover:bg-black/60 hover:opacity-100"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <span className="absolute bottom-2.5 right-2.5 rounded-full bg-black/35 px-2 py-0.5 font-mono text-[10px] text-white backdrop-blur-md">
            {index + 1}/{total}
          </span>
        </div>
      )}

      {/* 数量角标（悬停展开时隐藏） */}
      {total > 1 && (
        <span
          className={`absolute bottom-2.5 left-2.5 z-10 rounded-full bg-black/35 px-2 py-0.5 font-mono text-[10px] text-white backdrop-blur-md transition-opacity ${
            open ? "opacity-0" : "opacity-100"
          }`}
        >
          ×{total}
        </span>
      )}
    </div>
  );
}
