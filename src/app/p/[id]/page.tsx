import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PROMPTS } from "@/data/prompts";
import { CATEGORY_MAP } from "@/data/categories";
import { assetUrl } from "@/lib/asset";
import { getNeighbors, getPromptById } from "@/lib/prompts";
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
  const item = getPromptById(id);
  if (!item) return { title: "模板不存在" };
  return {
    title: item.title,
    description: item.prompt.slice(0, 150),
  };
}

export default async function PromptPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const item = getPromptById(id);
  if (!item) notFound();

  const meta = CATEGORY_MAP[item.category];
  const cover = assetUrl(item.media?.cover);
  const video = assetUrl(item.media?.video);
  const { prev, next } = getNeighbors(item);

  return (
    <article className="pt-8">
      <nav aria-label="面包屑" className="mb-5 flex flex-wrap items-center gap-1.5 text-[11.5px] text-mist-500">
        <Link href="/" className="transition-colors hover:text-accent">
          首页
        </Link>
        <span aria-hidden>/</span>
        <Link href={`/c/${item.category}`} className="transition-colors hover:text-accent">
          {meta.label}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-mist-300">{item.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-7">
          <header className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <Link
                href={`/c/${item.category}`}
                className="inline-flex items-center gap-1 rounded-full px-2 py-1 font-medium"
                style={{ color: meta.tint, background: `${meta.tint}14` }}
              >
                {meta.icon} {meta.label}
              </Link>
              {item.models.map((m) => (
                <span key={m} className="rounded-full bg-white/[0.05] px-2 py-1 font-mono text-mist-300">
                  {m}
                </span>
              ))}
              {item.added && <span className="font-mono text-mist-500">收录 {item.added}</span>}
            </div>
            <h1 className="text-2xl font-semibold leading-tight tracking-tight text-white sm:text-[34px]">
              {item.title}
            </h1>
          </header>

          <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-950">
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
              <img src={cover} alt={item.title} className="aspect-video w-full object-contain" />
            ) : (
              <div
                className="grid aspect-video w-full place-items-center"
                style={{
                  background: `radial-gradient(100% 100% at 30% 0%, ${meta.tint}1f, transparent 65%), #0a0f1b`,
                }}
              >
                <span className="text-6xl" style={{ color: meta.tint }}>
                  {meta.icon}
                </span>
              </div>
            )}
          </div>

          <Field
            label="正向提示词 Prompt"
            value={item.prompt}
            action={<CopyButton item={item} target="prompt" label="复制" />}
            mono
          />

          {item.negative && (
            <Field
              label="负向提示词 Negative"
              value={item.negative}
              action={<CopyButton item={item} target="negative" label="复制" />}
              mono
            />
          )}

          {item.notes && (
            <section className="space-y-2">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-500">
                实测备注
              </h2>
              <p className="rounded-xl border border-accent/15 bg-accent/[0.04] p-3.5 text-[13px] leading-relaxed text-mist-300">
                {item.notes}
              </p>
            </section>
          )}

          <nav className="flex items-stretch gap-3 border-t border-white/[0.06] pt-5" aria-label="同分类导航">
            {prev ? (
              <Link
                href={`/p/${prev.id}`}
                className="group flex flex-1 flex-col gap-0.5 rounded-xl border border-white/[0.07] px-3.5 py-2.5 transition-colors hover:border-accent/35"
              >
                <span className="text-[10px] uppercase tracking-wider text-mist-500">上一条</span>
                <span className="truncate text-[12.5px] text-mist-300 group-hover:text-accent">
                  {prev.title}
                </span>
              </Link>
            ) : (
              <span className="flex-1" />
            )}
            {next ? (
              <Link
                href={`/p/${next.id}`}
                className="group flex flex-1 flex-col items-end gap-0.5 rounded-xl border border-white/[0.07] px-3.5 py-2.5 text-right transition-colors hover:border-accent/35"
              >
                <span className="text-[10px] uppercase tracking-wider text-mist-500">下一条</span>
                <span className="truncate text-[12.5px] text-mist-300 group-hover:text-accent">
                  {next.title}
                </span>
              </Link>
            ) : (
              <span className="flex-1" />
            )}
          </nav>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          <section className="space-y-2">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-500">参数</h2>
            <dl className="grid grid-cols-3 gap-2 text-[12px]">
              {item.params?.aspect && <Stat label="画幅" value={item.params.aspect} />}
              {item.params?.duration && <Stat label="时长" value={`${item.params.duration}s`} />}
              {item.params?.fps && <Stat label="帧率" value={`${item.params.fps}fps`} />}
              {item.params?.extra &&
                Object.entries(item.params.extra).map(([k, v]) => (
                  <Stat key={k} label={k} value={String(v)} />
                ))}
            </dl>
          </section>

          {item.tags && item.tags.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-500">
                标签
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((t) => (
                  <Link
                    key={t}
                    href={`/all?tag=${encodeURIComponent(t)}`}
                    className="rounded-md bg-white/[0.05] px-2 py-1 text-[11px] text-mist-300 transition-colors hover:bg-white/[0.09] hover:text-accent"
                  >
                    #{t}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {item.source && (
            <a
              href={item.source}
              target="_blank"
              rel="noreferrer"
              className="block truncate text-[11.5px] text-accent/80 underline-offset-2 hover:text-accent hover:underline"
            >
              来源 ↗
            </a>
          )}

          <CopyButton
            item={item}
            label="复制全部（提示词 + 参数 + 备注）"
            className="w-full rounded-xl bg-accent px-4 py-2.5 text-[13px] font-semibold text-ink-950 transition-transform hover:scale-[1.02] active:scale-[0.99]"
          />
        </aside>
      </div>
    </article>
  );
}

function Field({
  label,
  value,
  action,
  mono,
}: {
  label: string;
  value: string;
  action?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-500">{label}</h2>
        {action}
      </div>
      <p
        className={`whitespace-pre-wrap rounded-xl border border-white/[0.06] bg-ink-950/60 p-3.5 text-[13px] leading-relaxed text-mist-300 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </p>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/[0.04] px-2.5 py-2">
      <dt className="text-[10px] text-mist-500">{label}</dt>
      <dd className="font-mono text-mist-100">{value}</dd>
    </div>
  );
}
