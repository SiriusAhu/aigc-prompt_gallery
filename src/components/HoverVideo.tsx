"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { assetUrl } from "@/lib/asset";
import { CATEGORY_MAP } from "@/data/categories";
import type { PromptItem } from "@/data/types";

interface Props {
  item: PromptItem;
  showHint?: boolean;
}

type Phase = "cover" | "loading" | "playing";

/**
 * 封面优先的悬停播放。
 * - 默认只渲染封面图，视频 preload="none"，首屏零视频流量
 * - 鼠标进入 / 键盘聚焦 → 加载并播放；离开 → 暂停并回到片头
 * - 只有真实解码失败或超时才判定不可用并退回封面；play() 被浏览器策略拒绝不算损坏
 */
export function HoverVideo({ item, showHint = true }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const [phase, setPhase] = useState<Phase>("cover");
  const [failed, setFailed] = useState(false);
  const [coverBroken, setCoverBroken] = useState(false);

  const cover = assetUrl(item.media?.cover);
  const video = assetUrl(item.media?.video);
  const meta = CATEGORY_MAP[item.category];
  const hasVideo = Boolean(video) && !failed;

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const start = useCallback(() => {
    const el = videoRef.current;
    if (!el || !hasVideo) return;
    // 触摸设备没有悬停语义，别在点按卡片时意外起播
    if (!window.matchMedia("(hover: hover)").matches) return;

    if (el.readyState >= 2) {
      void el.play().catch(() => {});
      return;
    }

    setPhase("loading");
    el.load();
    void el.play().catch(() => {
      window.clearTimeout(timer.current);
      setPhase("cover");
    });

    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const v = videoRef.current;
      if (!v || v.readyState < 2) {
        setFailed(true);
        setPhase("cover");
      }
    }, 2500);
  }, [hasVideo]);

  const stop = useCallback(() => {
    window.clearTimeout(timer.current);
    const el = videoRef.current;
    if (el && !el.paused) {
      el.pause();
      el.currentTime = 0;
    }
    setPhase("cover");
  }, []);

  return (
    <div
      className="relative aspect-video w-full overflow-hidden bg-ink-900"
      onMouseEnter={start}
      onMouseLeave={stop}
      onFocus={start}
      onBlur={stop}
      data-phase={phase}
    >
      {(!cover || coverBroken) && (
        <div
          className="absolute inset-0 grid place-items-center"
          style={{
            background: `radial-gradient(120% 120% at 20% 0%, ${meta.tint}22, transparent 60%),
                         linear-gradient(150deg, #0e1524 0%, #0a0f1b 100%)`,
          }}
        >
          <div className="flex flex-col items-center gap-2 opacity-40">
            <span className="text-3xl leading-none" style={{ color: meta.tint }}>
              {meta.icon}
            </span>
            <span className="text-[11px] uppercase tracking-[0.3em] text-mist-500">{meta.label}</span>
          </div>
        </div>
      )}

      {cover && !coverBroken && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setCoverBroken(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 ${
            phase === "playing"
              ? "scale-105 opacity-0"
              : "scale-100 opacity-100 group-hover:scale-[1.03]"
          }`}
        />
      )}

      {hasVideo && (
        <video
          ref={videoRef}
          src={video}
          muted
          loop
          playsInline
          preload="none"
          disablePictureInPicture
          onPlaying={() => {
            window.clearTimeout(timer.current);
            setPhase("playing");
          }}
          onError={() => {
            setFailed(true);
            setPhase("cover");
          }}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            phase === "playing" ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink-950/80 to-transparent" />

      {showHint && hasVideo && phase === "cover" && (
        <div className="pointer-events-none absolute right-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-ink-950/70 px-2 py-1 text-[10px] font-medium tracking-wide text-mist-300 backdrop-blur-sm">
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 fill-current text-accent">
            <path d="M3 1.5 10.5 6 3 10.5z" />
          </svg>
          悬停预览
        </div>
      )}

      {phase === "loading" && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-mist-500/30 border-t-accent" />
        </div>
      )}

      {failed && (
        <div className="pointer-events-none absolute left-2.5 top-2.5 rounded-full bg-ink-950/80 px-2 py-1 text-[10px] text-accent-warm/90">
          预览视频不可用
        </div>
      )}
    </div>
  );
}
