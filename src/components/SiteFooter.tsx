import Link from "next/link";
import { CATEGORIES } from "@/data/categories";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.06] py-6">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="space-y-1">
          <p className="text-[12px] font-medium text-mist-300">PromptVault</p>
          <p className="text-[11px] text-mist-500">
            AI 视频提示词库 · 纯静态部署 · 内容与素材分离管理
          </p>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <div className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-mist-500">分类</p>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.id}
                  href={`/c/${c.id}`}
                  className="text-[11px] text-mist-300 transition-colors hover:text-accent"
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-mist-500">入口</p>
            <div className="flex flex-col gap-1">
              <Link href="/" className="text-[11px] text-mist-300 hover:text-accent">
                首页
              </Link>
              <Link href="/all" className="text-[11px] text-mist-300 hover:text-accent">
                全部模板
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
