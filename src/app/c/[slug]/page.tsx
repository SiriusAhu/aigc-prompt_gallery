import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { CATEGORIES, CATEGORY_MAP } from "@/data/categories";
import { PROMPTS } from "@/data/prompts";
import { Gallery } from "@/components/Gallery";

interface Params {
  slug: string;
}

export function generateStaticParams(): Params[] {
  return CATEGORIES.map((c) => ({ slug: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = CATEGORY_MAP[slug as keyof typeof CATEGORY_MAP];
  if (!meta) return { title: "分类不存在" };
  return {
    title: `${meta.label} · ${meta.description}`,
    description: `${meta.label}类 AI 视频提示词模板：${meta.description}。共 ${
      PROMPTS.filter((p) => p.category === slug).length
    } 条。`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const meta = CATEGORY_MAP[slug as keyof typeof CATEGORY_MAP];
  if (!meta) notFound();

  const items = PROMPTS.filter((p) => p.category === slug);

  return (
    <div className="pt-8">
      <nav aria-label="面包屑" className="mb-5 flex items-center gap-1.5 text-[11.5px] text-mist-500">
        <Link href="/" className="transition-colors hover:text-accent">
          首页
        </Link>
        <span aria-hidden>/</span>
        <Link href="/all" className="transition-colors hover:text-accent">
          全部
        </Link>
        <span aria-hidden>/</span>
        <span className="text-mist-300">{meta.label}</span>
      </nav>

      <header className="mb-7 space-y-2">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl" style={{ color: meta.tint }}>
            {meta.icon}
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {meta.label}
          </h1>
          <span className="rounded-full bg-white/[0.06] px-2 py-0.5 font-mono text-[10.5px] text-mist-300">
            {items.length} 条
          </span>
        </div>
        <p className="text-[13px] text-mist-300">{meta.description}</p>
      </header>

      <Suspense fallback={<GallerySkeleton />}>
        <Gallery items={items} category={slug} title={meta.label} />
      </Suspense>
    </div>
  );
}

function GallerySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-72 animate-pulse rounded-2xl bg-white/[0.03]" />
      ))}
    </div>
  );
}
