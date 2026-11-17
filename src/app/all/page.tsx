import type { Metadata } from "next";
import { Suspense } from "react";
import { PROMPTS } from "@/data/prompts";
import { Gallery } from "@/components/Gallery";

export const metadata: Metadata = {
  title: "全部提示词",
  description: `PromptVault 收录的全部 ${PROMPTS.length} 条 AI 视频提示词模板，可按关键词、标签和分类筛选。`,
};

export default function AllPage() {
  return (
    <div className="pt-8">
      <header className="mb-7 space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">全部模板</h1>
        <p className="text-[13px] text-mist-300">
          {PROMPTS.length} 条提示词，覆盖 {new Set(PROMPTS.map((p) => p.category)).size} 个维度。
          搜索和筛选状态会写进 URL，可以直接分享。
        </p>
      </header>

      <Suspense fallback={<div className="h-72 animate-pulse rounded-2xl bg-white/[0.03]" />}>
        <Gallery items={PROMPTS} title="全部模板" />
      </Suspense>
    </div>
  );
}
