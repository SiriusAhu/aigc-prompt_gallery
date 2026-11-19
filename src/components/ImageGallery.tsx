"use client";

import { useState } from "react";
import { Lightbox, type LightboxImage } from "./Lightbox";

interface Props {
  images: LightboxImage[];
  title: string;
}

/** 详情页的图片网格，点击任意一张打开大图预览 */
export function ImageGallery({ images, title }: Props) {
  const [index, setIndex] = useState<number | null>(null);

  return (
    <>
      <div
        className={`grid gap-3 ${images.length > 1 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}
      >
        {images.map((img, i) => (
          <figure key={img.src} className="space-y-1.5">
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`查看第 ${i + 1} 张大图`}
              className="group block w-full cursor-zoom-in overflow-hidden rounded-[20px] border border-hairline bg-surface"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={`${title} 第 ${i + 1} 张`}
                loading={i === 0 ? "eager" : "lazy"}
                className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
              />
            </button>
            <figcaption className="flex items-center justify-between px-1 font-mono text-[10.5px] text-muted">
              <span>
                {i + 1}/{images.length}
              </span>
              <span>{img.seed == null ? "seed N/A" : `seed ${img.seed}`}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      {index !== null && (
        <Lightbox
          images={images}
          index={index}
          title={title}
          onNavigate={setIndex}
          onClose={() => setIndex(null)}
        />
      )}
    </>
  );
}
