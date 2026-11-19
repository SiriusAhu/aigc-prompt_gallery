import type { Metadata } from "next";
import Link from "next/link";
import { PromptItemView, type ViewItem, type ViewVariant } from "@/components/PromptItemView";
import { CopyButton } from "@/components/CopyButton";

export const metadata: Metadata = {
  title: "方案预览",
  description: "条目呈现方式的三个候选方案，用于确定最终版式。",
};

const MOCK: ViewItem[] = [
  {
    id: "m1",
    title: "晨雾中的木屋",
    tag: "场景",
    prompt:
      "清晨薄雾笼罩着林间木屋，暖光从窗口溢出，前景是湿润的苔藓与蕨类，空气中有细微水汽颗粒，浅景深，35mm 视角，冷暖对比较强。",
    gradient: "linear-gradient(135deg,#f3e3cf 0%,#e4cfb4 52%,#cdb494 100%)",
  },
  {
    id: "m2",
    title: "极简产品特写",
    tag: "产品",
    prompt: "哑光黑色的无线耳机置于深色反光台面，柔光箱在表面形成渐变高光。",
    gradient: "linear-gradient(135deg,#dfe6f3 0%,#c3cfe3 55%,#9fb0c9 100%)",
    hasVideo: true,
  },
  {
    id: "m3",
    title: "霓虹雨夜街景",
    tag: "场景",
    prompt:
      "雨夜霓虹街道，湿润路面反射粉色与青色光晕，远处行人撑伞虚化成光斑，低机位广角，轻微手持感，胶片颗粒。",
    gradient: "linear-gradient(135deg,#f2d7ea 0%,#d9b8dc 48%,#a88fc0 100%)",
    hasVideo: true,
  },
];

const SECTION = "scroll-mt-24";

function OptionHeader({
  index,
  title,
  desc,
  recommend,
}: {
  index: string;
  title: string;
  desc: string;
  recommend?: boolean;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-start justify-between gap-4 border-t border-hairline pt-8">
      <div className="max-w-[54ch]">
        <div className="flex items-center gap-2.5">
          <span className="rounded-full bg-surface px-2.5 py-1 font-mono text-[10.5px] text-muted">
            {index}
          </span>
          <h2 className="text-[20px] font-semibold tracking-[-0.02em]">{title}</h2>
          {recommend && (
            <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[10.5px] font-medium text-accent">
              推荐
            </span>
          )}
        </div>
        <p className="mt-2 text-[12.5px] leading-relaxed text-muted">{desc}</p>
      </div>
    </div>
  );
}

function HomeVariant({
  layout,
  title,
  desc,
}: {
  layout: "side" | "stack";
  title: string;
  desc: string;
}) {
  const tiles = [
    {
      label: "图片提示词",
      tone: "linear-gradient(135deg,#ffe8d6 0%,#ffd3b6 100%)",
      eyebrow: "Image",
    },
    {
      label: "视频提示词",
      tone: "linear-gradient(135deg,#e6dcff 0%,#d3c6ff 100%)",
      eyebrow: "Video",
    },
  ];

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[13px] font-medium">{title}</p>
        <p className="mt-1 text-[11.5px] text-muted">{desc}</p>
      </div>
      <div
        className={`grid gap-3 ${layout === "side" ? "sm:grid-cols-2" : "grid-cols-1"}`}
      >
        {tiles.map((t) => (
          <div
            key={t.label}
            className={`relative overflow-hidden rounded-[22px] border border-hairline ${
              layout === "stack" ? "flex items-center gap-5 p-4" : "p-5"
            }`}
            style={{ background: "var(--surface)" }}
          >
            <div
              className={`shrink-0 rounded-[14px] ${layout === "stack" ? "h-16 w-24" : "mb-4 aspect-[4/3] w-full"}`}
              style={{ background: t.tone }}
            />
            <div>
              <p className="text-[9.5px] uppercase tracking-[0.18em] text-muted">{t.eyebrow}</p>
              <p className="mt-1 text-[15px] font-semibold tracking-[-0.01em]">{t.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PaletteSwatch({
  mode,
  canvas,
  surface,
  ink,
  muted,
  accent,
}: {
  mode: string;
  canvas: string;
  surface: string;
  ink: string;
  muted: string;
  accent: string;
}) {
  return (
    <div className="overflow-hidden rounded-[20px] border border-hairline">
      <div className="p-5" style={{ background: canvas }}>
        <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: muted }}>
          {mode}
        </p>
        <p className="mt-2 text-[20px] font-semibold tracking-[-0.02em]" style={{ color: ink }}>
          Aa 苹果风格
        </p>
        <div className="mt-4 flex gap-2">
          <span className="h-7 flex-1 rounded-md" style={{ background: surface }} />
          <span className="h-7 flex-1 rounded-md" style={{ background: ink }} />
          <span className="h-7 flex-1 rounded-md" style={{ background: muted }} />
          <span className="h-7 flex-1 rounded-md" style={{ background: accent }} />
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-hairline bg-canvas px-4 py-2.5 text-[10.5px] text-muted">
        <span className="font-mono">{canvas}</span>
        <span className="font-mono" style={{ color: accent }}>
          {accent}
        </span>
      </div>
    </div>
  );
}

const OPTIONS: { id: string; index: string; title: string; desc: string; variant: ViewVariant }[] = [
  {
    id: "tiles",
    index: "A",
    title: "无卡片媒体块",
    desc: "预览图直接作为视觉主体，文字落在背景上，靠留白分隔。最接近苹果 App Store「今日推荐」的排布，页面更整体、不碎。",
    variant: "tile",
  },
  {
    id: "cards",
    index: "B",
    title: "传统卡片",
    desc: "每条内容是一个独立圆角卡片，带细边框与极轻阴影。边界清晰、更容易做出「可点」的暗示，但卡片一多页面会显得方块化。",
    variant: "card",
  },
  {
    id: "list",
    index: "C",
    title: "编辑式列表",
    desc: "左图右文，一行一条。提示词能多露两行，更适合阅读长文本，但一屏能看到的条目少，浏览效率偏低。",
    variant: "list",
  },
];

export default function DesignPage() {
  return (
    <div className="mx-auto w-full max-w-[1120px] px-5">
      <header className="pb-8 pt-16 sm:pt-20">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted">Design Review</p>
        <h1 className="display mt-3 text-[38px] sm:text-[52px]">方案预览</h1>
        <p className="mt-4 max-w-[56ch] text-[14px] leading-relaxed text-muted sm:text-[15px]">
          页面骨架已经搭好，条目怎么呈现还没定。下面三种方案用同一组示例数据渲染，
          可以直接对比间距、层级和复制按钮的位置。所有预览图都是占位色块，不是真实素材。
        </p>
        <nav className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[12px]">
          {OPTIONS.map((o) => (
            <a key={o.id} href={`#${o.id}`} className="text-accent hover:underline underline-offset-4">
              方案 {o.index} · {o.title}
            </a>
          ))}
          <a href="#home" className="text-accent hover:underline underline-offset-4">
            首页布局
          </a>
          <a href="#theme" className="text-accent hover:underline underline-offset-4">
            明暗色板
          </a>
        </nav>
      </header>

      <section className="rounded-[24px] border border-hairline bg-surface px-6 py-5">
        <p className="text-[12.5px] leading-relaxed text-muted">
          <span className="font-medium text-ink">共用模板：</span>
          /image 与 /video 使用同一个列表组件，只有两点不同——视频条目多一个「悬停预览」角标与播放能力，
          预览框比例分别为 4:3 与 16:9。下面按 4:3 展示。
        </p>
      </section>

      {OPTIONS.map((o) => (
        <section key={o.id} id={o.id} className={SECTION}>
          <OptionHeader
            index={o.index}
            title={o.title}
            desc={o.desc}
            recommend={o.variant === "tile"}
          />
          {o.variant === "list" ? (
            <div className="max-w-[860px]">
              {MOCK.map((m) => (
                <PromptItemView key={m.id} item={m} variant="list" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {MOCK.map((m) => (
                <PromptItemView key={m.id} item={m} variant={o.variant} />
              ))}
            </div>
          )}
        </section>
      ))}

      <section id="home" className={SECTION}>
        <OptionHeader
          index="D"
          title="首页入口布局"
          desc="两个大按钮承担分流作用。并排更适合宽屏、信息密度高；堆叠更适合强调「先选一类」的顺序感。"
        />
        <div className="grid gap-8 lg:grid-cols-2">
          <HomeVariant
            layout="side"
            title="并排两栏"
            desc="宽屏下左右各占一半，一屏内同时看到两个入口。"
          />
          <HomeVariant
            layout="stack"
            title="上下堆叠"
            desc="纵向排列，视线上更专注，移动端天然一致。"
          />
        </div>
      </section>

      <section id="theme" className={SECTION}>
        <OptionHeader
          index="E"
          title="明暗色板"
          desc="默认跟随系统偏好，也可在右上角手动切换。两套都使用同一组语义色，组件不需要为明暗分别写样式。"
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <PaletteSwatch
            mode="Light"
            canvas="#ffffff"
            surface="#f5f5f7"
            ink="#1d1d1f"
            muted="#6e6e73"
            accent="#0071e3"
          />
          <PaletteSwatch
            mode="Dark"
            canvas="#000000"
            surface="#161617"
            ink="#f5f5f7"
            muted="#86868b"
            accent="#2997ff"
          />
        </div>
      </section>

      <section className="mt-16 rounded-[24px] border border-hairline bg-surface px-6 py-6">
        <h2 className="text-[14px] font-semibold tracking-[-0.01em]">怎么选</h2>
        <ul className="mt-3 space-y-2 text-[12.5px] leading-relaxed text-muted">
          <li>
            <span className="font-medium text-ink">A（推荐）</span>
            ：视觉最干净，预览图成为主体，适合以「看效果」为主的使用方式。
          </li>
          <li>
            <span className="font-medium text-ink">B</span>
            ：如果你更在意每条内容的边界感、或者以后要加收藏/删除这类操作按钮，卡片更好放。
          </li>
          <li>
            <span className="font-medium text-ink">C</span>
            ：如果提示词普遍很长、你更常「读」而不是「扫」，列表更合适。
          </li>
        </ul>
        <p className="mt-4 text-[12px] text-muted">
          也可以混搭：图片页用 A、视频页用 C。告诉我编号即可，我按选择定版。
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            href="/image"
            className="rounded-full border border-hairline bg-canvas px-4 py-2 text-[12.5px] text-ink transition-colors hover:border-ink/25"
          >
            看图片页骨架
          </Link>
          <Link
            href="/video"
            className="rounded-full border border-hairline bg-canvas px-4 py-2 text-[12.5px] text-ink transition-colors hover:border-ink/25"
          >
            看视频页骨架
          </Link>
          <CopyButton text="design-review" label="示例复制按钮" variant="solid" />
        </div>
      </section>
    </div>
  );
}
