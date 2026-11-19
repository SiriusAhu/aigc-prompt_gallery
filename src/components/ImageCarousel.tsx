"use client";

import { useState } from "react";

interface Props {
  /** 图片 URL 列表 */
  images: string[];
  alt: string;
  /** 预览框比例，与卡片一致 */
  ratio?: "4/3" | "16/9" | "1/1";
  /** 圆角由外层控制，这里只负责铺满 */
  className?: string;
}

/**
 * 多图轮播。同一条提示词的多张结果共用一个卡片位置，
 * 左右按钮循环切换，触屏上按钮常驻、桌面端悬停出现。
 */
export function ImageCarousel({ images, alt, ratio = "4/3", className }: Props) {
  const [index, setIndex] = useState(0);
  const total = images.length;

  const go = (delta: number) => {
    if (total <= 1) return;
    setIndex((i) => (i + delta + total) % total);
  };

  const box = ratio === "16/9" ? "aspect-video" : ratio === "1/1" ? "aspect-square" : "aspect-[4/3]";

  return (
    <div className={`group/carousel relative overflow-hidden bg-surface ${box} ${className ?? ""}`}>
      {images.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt={i === index ? alt : ""}
          aria-hidden={i !== index}
          loading={i === 0 ? "eager" : "lazy"}
          decoding="async"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              go(-1);
            }}
            aria-label="上一张"
            className="absolute left-2 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full
                       bg-black/35 text-white opacity-90 backdrop-blur-md transition-all
                       hover:bg-black/60 hover:opacity-100"
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
            className="absolute right-2 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full
                       bg-black/35 text-white opacity-90 backdrop-blur-md transition-all
                       hover:bg-black/60 hover:opacity-100"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="absolute bottom-2.5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
            {images.map((src, i) => (
              <span
                key={src}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-4 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>

          <span className="absolute bottom-2.5 right-2.5 z-10 rounded-full bg-black/35 px-2 py-0.5 font-mono text-[10px] text-white backdrop-blur-md">
            {index + 1}/{total}
          </span>
        </>
      )}
    </div>
  );
}
