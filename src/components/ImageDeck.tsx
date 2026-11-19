"use client";

import { useEffect, useRef, useState } from "react";
import { Lightbox } from "./Lightbox";

export interface DeckImage {
  src: string;
  seed?: number | null;
}

interface Props {
  images: DeckImage[];
  alt: string;
  ratio?: "4/3" | "16/9";
}

/**
 * 同一提示词的多张结果共用一张卡片：
 * 卡片上单图展示 + 左右循环，点击放大进入 Lightbox 逐张查看。
 */
export function ImageDeck({ images, alt, ratio = "4/3" }: Props) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const deckRef = useRef<HTMLDivElement>(null);
  const total = images.length;

  /**
   * 悬停时用滚轮切换。React 的 onWheel 是被动监听，无法阻止页面滚动，
   * 所以挂原生监听并显式声明 passive: false。
   */
  useEffect(() => {
    const el = deckRef.current;
    if (!el || total <= 1) return;

    let acc = 0;
    let last = 0;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 2) return;
      e.preventDefault();

      const now = Date.now();
      if (now - last < 180) return; // 冷却，避免触控板一划连跳好几张

      acc += e.deltaY;
      if (Math.abs(acc) < 40) return;

      const dir = acc > 0 ? 1 : -1;
      acc = 0;
      last = now;
      setIndex((i) => (i + dir + total) % total);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [total]);

  const go = (delta: number) => {
    if (total <= 1) return;
    setIndex((i) => (i + delta + total) % total);
  };

  const box = ratio === "16/9" ? "aspect-video" : "aspect-[4/3]";

  return (
    <div
      ref={deckRef}
      className={`pv-deck relative cursor-zoom-in overflow-hidden rounded-[18px] bg-surface ${box}`}
      onClick={() => setLightbox(true)}
    >
      {images.map((img, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={img.src}
          src={img.src}
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
            className="absolute left-2 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white opacity-90 backdrop-blur-md transition-all hover:bg-black/60 hover:opacity-100"
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
            className="absolute right-2 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white opacity-90 backdrop-blur-md transition-all hover:bg-black/60 hover:opacity-100"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <span className="absolute bottom-2.5 right-2.5 z-10 rounded-full bg-black/35 px-2 py-0.5 font-mono text-[10px] text-white backdrop-blur-md">
            {index + 1}/{total}
          </span>
        </>
      )}

      {lightbox && (
        <Lightbox
          images={images}
          index={index}
          title={alt}
          onNavigate={setIndex}
          onClose={() => setLightbox(false)}
        />
      )}
    </div>
  );
}
