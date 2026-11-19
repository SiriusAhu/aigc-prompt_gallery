import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-hairline bg-surface">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-[12px] font-medium text-ink">PromptVault</p>
          <p className="text-[11px] text-muted">个人 AIGC 提示词库 · 静态部署</p>
        </div>
        <nav aria-label="页脚导航" className="flex flex-wrap gap-x-6 gap-y-2">
          {[
            { href: "/image", label: "图片提示词" },
            { href: "/video", label: "视频提示词" },
            { href: "/design", label: "方案预览" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="text-[11px] text-muted hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
