"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/", label: "首页" },
  { href: "/image", label: "图片提示词" },
  { href: "/video", label: "视频提示词" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/72 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-12 w-full max-w-[1120px] items-center gap-6 px-5">
        <Link href="/" className="flex items-center gap-2" aria-label="PromptVault 首页">
          <span className="grid h-6 w-6 place-items-center rounded-[7px] bg-ink text-canvas">
            <svg viewBox="0 0 16 16" className="h-3 w-3 fill-current">
              <path d="M4.5 2.5 12.5 8l-8 5.5z" />
            </svg>
          </span>
          <span className="text-[13px] font-semibold tracking-[-0.01em]">PromptVault</span>
        </Link>

        <nav aria-label="主导航" className="hidden flex-1 items-center justify-center gap-7 sm:flex">
          {NAV.map((n) => {
            const active =
              n.href === "/" ? pathname === "/" : pathname === n.href || pathname.startsWith(`${n.href}/`);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={`text-[12px] transition-colors ${
                  active ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3 sm:ml-0">
          <ThemeToggle />
        </div>
      </div>

      {/* 移动端次级导航 */}
      <nav
        aria-label="主导航（移动端）"
        className="flex items-center gap-5 overflow-x-auto border-t border-hairline px-5 py-2 sm:hidden"
      >
        {NAV.slice(1).map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="shrink-0 text-[12px] text-muted transition-colors hover:text-ink"
          >
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
