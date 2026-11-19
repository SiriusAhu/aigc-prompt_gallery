"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export interface LightboxImage {
  src: string;
  seed?: number | null;
}

interface Props {
  images: LightboxImage[];
  index: number;
  onClose: () => void;
  onNavigate: (next: number) => void;
  title?: string;
}

/**
 * 大图预览。用 Portal 挂到 body —— 卡片 hover 时有 transform，
 * 直接渲染 fixed 元素会被困在卡片坐标系里。
 */
export function Lightbox({ images, index, onClose, onNavigate, title }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const total = images.length;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowLeft" && total > 1) {
        e.preventDefault();
        onNavigate((index - 1 + total) % total);
      } else if (e.key === "ArrowRight" && total > 1) {
        e.preventDefault();
        onNavigate((index + 1) % total);
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [images.length, index, onClose, onNavigate]);

  if (!mounted) return null;
  const current = images[index];
  if (!current) return null;

  const total = images.length;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title ?? "图片大图预览"}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="关闭预览"
        className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
      >
        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
        </svg>
      </button>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={current.src}
        alt={title ? `${title} 第 ${index + 1} 张` : ""}
        className="max-h-[82vh] max-w-[92vw] rounded-2xl object-contain shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
      />

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate((index - 1 + total) % total);
            }}
            aria-label="上一张"
            className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 sm:left-6"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M10 3 5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate((index + 1) % total);
            }}
            aria-label="下一张"
            className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 sm:right-6"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}

      <div
        className="mt-4 flex items-center gap-3 rounded-full bg-white/10 px-3.5 py-1.5 font-mono text-[11px] text-white/90 backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        <span>
          {index + 1}/{total}
        </span>
        <span className="h-3 w-px bg-white/25" />
        <span>{current.seed == null ? "seed N/A" : `seed ${current.seed}`}</span>
      </div>
    </div>,
    document.body,
  );
}
