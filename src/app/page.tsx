import Link from "next/link";
import { CATEGORIES } from "@/data/categories";
import { PROMPTS } from "@/data/prompts";
import { PromptCard } from "@/components/PromptCard";

const FEATURED = PROMPTS.filter((p) => p.category === "camera" || p.category === "light").slice(0, 4);

export default function HomePage() {
  return (
    <div className="space-y-14">
      <section className="max-w-3xl space-y-4 pt-8">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-accent">
          AI 视频提示词库
        </p>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight text-white sm:text-[42px]">
          把有效的运镜、光位和参数
          <span className="bg-gradient-to-r from-accent to-accent-warm bg-clip-text text-transparent">
            {" "}
            沉淀成可复用的模板
          </span>
        </h1>
        <p className="max-w-2xl text-[13.5px] leading-relaxed text-mist-300">
          每条模板都带正负向提示词、画幅时长帧率参数和实测备注。按分类浏览，悬停卡片看效果，点开任意一条复制使用。
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            href="/all"
            className="rounded-xl bg-accent px-4 py-2 text-[13px] font-semibold text-ink-950 transition-transform hover:scale-[1.02]"
          >
            浏览全部 {PROMPTS.length} 条
          </Link>
          <Link
            href="/c/camera"
            className="rounded-xl border border-white/12 px-4 py-2 text-[13px] text-mist-300 transition-colors hover:border-accent/40 hover:text-accent"
          >
            从运镜开始
          </Link>
        </div>
      </section>

      <section aria-labelledby="categories-heading" className="space-y-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="categories-heading" className="text-[17px] font-semibold tracking-tight text-white">
            按分类浏览
          </h2>
          <Link href="/all" className="text-[11.5px] text-mist-500 hover:text-accent">
            全部模板 →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => {
            const count = PROMPTS.filter((p) => p.category === c.id).length;
            return (
              <Link
                key={c.id}
                href={`/c/${c.id}`}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-ink-900/60 p-4
                           transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:bg-ink-900"
              >
                <div
                  className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-[0.12] blur-2xl transition-opacity group-hover:opacity-25"
                  style={{ background: c.tint }}
                />
                <div className="flex items-start justify-between gap-3">
                  <span className="text-lg" style={{ color: c.tint }}>
                    {c.icon}
                  </span>
                  <span className="font-mono text-[10.5px] text-mist-500">{count} 条</span>
                </div>
                <p className="mt-3 text-[14px] font-semibold text-mist-100 group-hover:text-white">
                  {c.label}
                </p>
                <p className="mt-0.5 text-[11.5px] leading-relaxed text-mist-500">{c.description}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="featured-heading" className="space-y-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="featured-heading" className="text-[17px] font-semibold tracking-tight text-white">
            精选模板
          </h2>
          <span className="font-mono text-[10.5px] text-mist-500">
            {PROMPTS.filter((p) => p.media?.video).length} 条带视频
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED.map((item, i) => (
            <PromptCard key={item.id} item={item} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
