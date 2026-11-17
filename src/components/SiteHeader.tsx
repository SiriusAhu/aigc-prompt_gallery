"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/data/categories";

export function SiteHeader() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-30 -mx-4 border-b border-white/[0.06] bg-ink-950/85 px-4 backdrop-blur-xl sm:-mx-6 sm:px-6">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent to-accent-warm text-ink-950">
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current">
              <path d="M4 2.2 13 8l-9 5.8z" />
            </svg>
          </span>
          <span className="leading-tight">
            <span className="block text-[14px] font-semibold tracking-tight text-white">
              PromptVault
            </span>
            <span className="block font-mono text-[9.5px] uppercase tracking-[0.16em] text-mist-500">
              AI 视频提示词库
            </span>
          </span>
        </Link>

        <nav aria-label="分类导航" className="flex flex-1 flex-wrap items-center gap-1">
          <NavLink href="/all" active={isActive("/all")}>
            全部
          </NavLink>
          {CATEGORIES.map((c) => (
            <NavLink
              key={c.id}
              href={`/c/${c.id}`}
              active={isActive(`/c/${c.id}`)}
              color={c.tint}
              icon={c.icon}
            >
              {c.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

function NavLink({
  href,
  active,
  color,
  icon,
  children,
}: {
  href: string;
  active: boolean;
  color?: string;
  icon?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[12px] transition-colors ${
        active
          ? "bg-white/[0.09] font-semibold text-white"
          : "text-mist-300 hover:bg-white/[0.05] hover:text-white"
      }`}
    >
      {icon && (
        <span className="text-[10px]" style={{ color: active ? color : color }}>
          {icon}
        </span>
      )}
      {children}
    </Link>
  );
}
