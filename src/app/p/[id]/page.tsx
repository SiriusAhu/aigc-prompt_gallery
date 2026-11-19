import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PROMPTS } from "@/data/prompts";
import { KIND_META } from "@/data/categories";
import { assetUrl } from "@/lib/asset";
import { byId } from "@/lib/prompts";
import { CopyButton } from "@/components/CopyButton";

interface Params {
  id: string;
}

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return PROMPTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const item = byId(id);
  if (!item) return { title: "模板不存在" };
  return { title: item.title, description: item.prompt.slice(0, 150) };
}

export default async function PromptDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const item = byId(id);
  if (!item) notFound();

  const kindMeta = KIND_META[item.kind];
  const cover = assetUrl(item.media?.cover);
  const video = assetUrl(item.media?.video);

  return (
    <article className="mx-auto w-full max-w-[860px] px-5 pb-12 pt-12 sm:pt-16">
      <nav aria-label="面包屑" className="flex items-center gap-1.5 text-[11.5px] text-muted">
        <Link href="/" className="hover:text-ink">
          首页
        </Link>
        <span>/</span>
        <Link href={kindMeta.href} className="hover:text-ink">
          {kindMeta.label}
        </Link>
        <span>/</span>
        <span className="truncate text-ink">{item.title}</span>
      </nav>

      <header className="mt-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          {item.tags.map((t) => (
            <span key={t} className="rounded-full bg-surface px-2.5 py-1 text-muted">
              #{t}
            </span>
          ))}
          {item.added && <span className="font-mono text-muted/70">{item.added}</span>}
        </div>
        <h1 className="display text-[30px] sm:text-[40px]">{item.title}</h1>
        {item.models && item.models.length > 0 && (
          <p className="font-mono text-[11.5px] text-muted">{item.models.join(" · ")}</p>
        )}
      </header>

      <div className="mt-8 overflow-hidden rounded-[28px] border border-hairline bg-surface">
        {video ? (
          <video
            src={video}
            controls
            muted
            loop
            playsInline
            preload="metadata"
            poster={cover}
            className="aspect-video w-full object-contain"
          />
        ) : cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={item.title} className="w-full object-contain" />
        ) : (
          <div className="grid aspect-video w-full place-items-center">
            <span className="text-[11px] uppercase tracking-[0.25em] text-muted/60">预览占位</span>
          </div>
        )}
      </div>

      <section className="mt-8 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">提示词</h2>
          <CopyButton text={item.prompt} label="复制" variant="pill" />
        </div>
        <p className="whitespace-pre-wrap rounded-[20px] border border-hairline bg-surface p-4 font-mono text-[13px] leading-[1.75] text-ink">
          {item.prompt}
        </p>
      </section>

      {item.negative && (
        <section className="mt-6 space-y-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">负向</h2>
          <p className="whitespace-pre-wrap rounded-[20px] border border-hairline bg-surface p-4 font-mono text-[13px] leading-[1.75] text-ink">
            {item.negative}
          </p>
        </section>
      )}

      {item.params && (
        <section className="mt-6 space-y-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">参数</h2>
          <dl className="flex flex-wrap gap-2">
            {item.params.aspect && (
              <div className="rounded-xl bg-surface px-3 py-2 text-[12px]">
                <dt className="text-[10px] text-muted">画幅</dt>
                <dd className="font-mono text-ink">{item.params.aspect}</dd>
              </div>
            )}
            {item.params.duration != null && (
              <div className="rounded-xl bg-surface px-3 py-2 text-[12px]">
                <dt className="text-[10px] text-muted">时长</dt>
                <dd className="font-mono text-ink">{item.params.duration}s</dd>
              </div>
            )}
            {item.params.fps && (
              <div className="rounded-xl bg-surface px-3 py-2 text-[12px]">
                <dt className="text-[10px] text-muted">帧率</dt>
                <dd className="font-mono text-ink">{item.params.fps}fps</dd>
              </div>
            )}
            {item.params.extra &&
              Object.entries(item.params.extra).map(([k, v]) => (
                <div key={k} className="rounded-xl bg-surface px-3 py-2 text-[12px]">
                  <dt className="text-[10px] text-muted">{k}</dt>
                  <dd className="font-mono text-ink">{v}</dd>
                </div>
              ))}
          </dl>
        </section>
      )}

      {item.notes && (
        <section className="mt-6 rounded-[20px] border border-hairline bg-surface p-4 text-[13px] leading-relaxed text-ink">
          {item.notes}
        </section>
      )}

      <div className="mt-10">
        <CopyButton text={item.prompt} label="复制提示词" variant="solid" />
      </div>
    </article>
  );
}
