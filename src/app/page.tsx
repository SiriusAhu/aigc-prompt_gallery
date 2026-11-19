import Link from "next/link";
import { KIND_META } from "@/data/categories";
import { PROMPTS } from "@/data/prompts";
import type { PromptKind } from "@/data/types";

const KINDS: PromptKind[] = ["image", "video"];

const TILE_GRADIENTS: Record<PromptKind, string[]> = {
  image: [
    "linear-gradient(135deg,#ffe8d6,#ffd3b6)",
    "linear-gradient(135deg,#d9f2e4,#bfe8d2)",
    "linear-gradient(135deg,#dfe7ff,#c8d6ff)",
  ],
  video: [
    "linear-gradient(135deg,#e6dcff,#d3c6ff)",
    "linear-gradient(135deg,#ffe3ef,#ffc9dd)",
    "linear-gradient(135deg,#fff3cf,#ffe6a8)",
  ],
};

function KindTile({ kind }: { kind: PromptKind }) {
  const meta = KIND_META[kind];
  const count = PROMPTS.filter((p) => p.kind === kind).length;

  return (
    <Link
      href={meta.href}
      className="group relative flex flex-col justify-between overflow-hidden rounded-[32px] border border-hairline bg-surface p-7 transition-all duration-500 hover:-translate-y-1 sm:p-9"
      style={{ minHeight: "clamp(320px, 42vh, 460px)" }}
    >
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-60 blur-3xl transition-opacity duration-500 group-hover:opacity-90"
        style={{
          background: kind === "image" ? "rgba(255,180,140,0.35)" : "rgba(160,140,255,0.35)",
        }}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
            {kind === "image" ? "Image" : "Video"}
          </p>
          <h2 className="mt-2 text-[30px] font-semibold tracking-[-0.03em] sm:text-[36px]">
            {meta.label}
          </h2>
          <p className="mt-2 max-w-[24ch] text-[13px] leading-relaxed text-muted">{meta.blurb}</p>
        </div>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-hairline bg-canvas text-ink transition-transform duration-300 group-hover:translate-x-0.5">
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      {/* 预览条：三条占位，正式内容接入后替换为真实缩略图 */}
      <div className="relative mt-8 flex items-end gap-2.5">
        {TILE_GRADIENTS[kind].map((g, i) => (
          <div
            key={i}
            className="flex-1 overflow-hidden rounded-[14px] border border-white/30 transition-transform duration-500 group-hover:-translate-y-1"
            style={{
              background: g,
              aspectRatio: i === 0 ? "4 / 3" : "4 / 3",
              transform: `translateY(${i === 1 ? -10 : 0}px)`,
              transitionDelay: `${i * 40}ms`,
              opacity: 0.9,
            }}
          >
            <div className="h-full w-full bg-gradient-to-t from-black/[0.06] to-transparent" />
          </div>
        ))}
      </div>

      <div className="relative mt-5 flex items-center gap-2 text-[12px] text-muted">
        <span className="rounded-full bg-canvas px-2.5 py-1 font-medium text-ink">
          {count} 条模板
        </span>
        <span>进入 {meta.label} →</span>
      </div>
    </Link>
  );
}

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-[1120px] px-5">
      <section className="pb-14 pt-20 sm:pb-20 sm:pt-28">
        <p className="pv-rise text-[12px] font-medium uppercase tracking-[0.2em] text-muted">
          Personal AIGC Library
        </p>
        <h1
          className="display pv-rise mt-4 max-w-[18ch] text-[34px] sm:text-[48px] lg:text-[64px]"
          style={{ animationDelay: "60ms" }}
        >
          把好用的提示词
          <br />
          收进一个地方
        </h1>
        <p className="pv-rise mt-6 max-w-[46ch] text-[15px] leading-[1.6] text-muted sm:text-[17px]" style={{ animationDelay: "120ms" }}>
          图片与视频分开管理，每条都能一键复制。
          <br className="hidden sm:block" />
          先选一个方向开始。
        </p>
      </section>

      <section aria-label="内容入口" className="grid gap-5 pb-8 sm:grid-cols-2 sm:gap-6">
        {KINDS.map((k) => (
          <KindTile key={k} kind={k} />
        ))}
      </section>
    </div>
  );
}
