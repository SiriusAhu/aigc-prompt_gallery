import { useCallback, useEffect, useRef, useState } from "react";
import { CATEGORY_MAP } from "../data/categories";
import type { PromptItem } from "../data/types";
import { assetUrl, copyText } from "../lib/asset";

interface Props {
  item: PromptItem | null;
  onClose: () => void;
}

function CopyField({
  label,
  value,
  mono = true,
}: {
  label: string;
  value?: string;
  mono?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;

  const copy = async () => {
    if (await copyText(value)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-500">
          {label}
        </h4>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-2 py-1
                     text-[11px] text-mist-300 transition-colors hover:border-accent/40 hover:text-accent"
        >
          {copied ? "已复制" : "复制"}
        </button>
      </div>
      <p
        className={`max-h-56 overflow-y-auto whitespace-pre-wrap rounded-xl border border-white/[0.06]
                    bg-ink-950/60 p-3 text-[12.5px] leading-relaxed text-mist-300 ${
                      mono ? "font-mono" : ""
                    }`}
      >
        {value}
      </p>
    </section>
  );
}

/** 弹窗内容。以 item.id 作 key 挂载，换了条目就是全新组件，不需要在 effect 里重置状态。 */
function DialogBody({ item, onClose }: { item: PromptItem; onClose: () => void }) {
  const [coverBroken, setCoverBroken] = useState(false);
  const meta = CATEGORY_MAP[item.category];
  const cover = assetUrl(item.media?.cover);
  const video = assetUrl(item.media?.video);

  const copyAll = useCallback(async () => {
    const parts = [
      item.title,
      "",
      "Prompt:",
      item.prompt,
      item.negative ? `\nNegative:\n${item.negative}` : "",
      item.params
        ? `\nParams: ${Object.entries({
            aspect: item.params.aspect,
            duration: item.params.duration && `${item.params.duration}s`,
            fps: item.params.fps && `${item.params.fps}fps`,
            ...item.params.extra,
          })
            .filter(([, v]) => v)
            .map(([k, v]) => `${k}=${v}`)
            .join(", ")}`
        : "",
      item.notes ? `\nNotes: ${item.notes}` : "",
    ];
    await copyText(parts.join("\n"));
  }, [item]);

  return (
    <div
      className="pv-fade-up my-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10
                 bg-ink-900 shadow-[0_40px_120px_-30px_rgba(0,0,0,1)] outline-none"
    >
      {/* 顶部媒体区 */}
      <div className="relative aspect-video w-full bg-ink-950">
        {video ? (
          <video
            src={video}
            controls
            muted
            loop
            playsInline
            preload="metadata"
            poster={cover}
            className="h-full w-full object-contain"
          />
        ) : cover && !coverBroken ? (
          <img
            src={cover}
            alt={item.title}
            onError={() => setCoverBroken(true)}
            className="h-full w-full object-contain"
          />
        ) : (
          <div
            className="grid h-full w-full place-items-center"
            style={{
              background: `radial-gradient(100% 100% at 30% 0%, ${meta.tint}1f, transparent 65%), #0a0f1b`,
            }}
          >
            <span className="text-5xl" style={{ color: meta.tint }}>
              {meta.icon}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          aria-label="关闭"
          className="absolute right-3 top-3 rounded-full bg-ink-950/80 p-2 text-mist-300
                     backdrop-blur transition-colors hover:bg-ink-950 hover:text-white"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
            <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* 正文区 */}
      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0 space-y-5">
          <header className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-1 font-medium"
                style={{ color: meta.tint, background: `${meta.tint}14` }}
              >
                {meta.icon} {meta.label}
              </span>
              {item.models.map((m) => (
                <span
                  key={m}
                  className="rounded-full bg-white/[0.05] px-2 py-1 font-mono text-mist-300"
                >
                  {m}
                </span>
              ))}
              {item.added && <span className="font-mono text-mist-500">收录 {item.added}</span>}
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              {item.title}
            </h2>
          </header>

          <CopyField label="正向提示词 Prompt" value={item.prompt} />
          <CopyField label="负向提示词 Negative" value={item.negative} />
          {item.notes && (
            <section className="space-y-2">
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-500">
                实测备注
              </h4>
              <p className="rounded-xl border border-accent/15 bg-accent/[0.04] p-3 text-[12.5px] leading-relaxed text-mist-300">
                {item.notes}
              </p>
            </section>
          )}
        </div>

        {/* 侧栏 */}
        <aside className="space-y-5 lg:border-l lg:border-white/[0.06] lg:pl-6">
          <section className="space-y-2">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-500">
              参数
            </h4>
            <dl className="grid grid-cols-2 gap-2 text-[12px]">
              {item.params?.aspect && (
                <div className="rounded-lg bg-white/[0.04] px-2.5 py-2">
                  <dt className="text-[10px] text-mist-500">画幅</dt>
                  <dd className="font-mono text-mist-100">{item.params.aspect}</dd>
                </div>
              )}
              {item.params?.duration && (
                <div className="rounded-lg bg-white/[0.04] px-2.5 py-2">
                  <dt className="text-[10px] text-mist-500">时长</dt>
                  <dd className="font-mono text-mist-100">{item.params.duration}s</dd>
                </div>
              )}
              {item.params?.fps && (
                <div className="rounded-lg bg-white/[0.04] px-2.5 py-2">
                  <dt className="text-[10px] text-mist-500">帧率</dt>
                  <dd className="font-mono text-mist-100">{item.params.fps}fps</dd>
                </div>
              )}
              {item.params?.extra &&
                Object.entries(item.params.extra).map(([k, v]) => (
                  <div key={k} className="rounded-lg bg-white/[0.04] px-2.5 py-2">
                    <dt className="text-[10px] text-mist-500">{k}</dt>
                    <dd className="font-mono text-mist-100">{v}</dd>
                  </div>
                ))}
            </dl>
          </section>

          {item.tags && item.tags.length > 0 && (
            <section className="space-y-2">
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-500">
                标签
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-md bg-white/[0.05] px-2 py-1 text-[11px] text-mist-300"
                  >
                    #{t}
                  </span>
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

          <button
            type="button"
            onClick={copyAll}
            className="w-full rounded-xl bg-accent px-4 py-2.5 text-[13px] font-semibold text-ink-950
                       transition-transform hover:scale-[1.02] active:scale-[0.99]"
          >
            复制全部（提示词 + 参数 + 备注）
          </button>
        </aside>
      </div>
    </div>
  );
}

export function DetailModal({ item, onClose }: Props) {
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!item) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    shellRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-950/80 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={shellRef}
        role="dialog"
        aria-modal="true"
        aria-label={item.title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="my-auto w-full max-w-5xl outline-none"
      >
        <DialogBody key={item.id} item={item} onClose={onClose} />
      </div>
    </div>
  );
}
