import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-5 pt-28 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">404</p>
      <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        这条提示词不在这里
      </h1>
      <p className="max-w-md text-[13px] leading-relaxed text-mist-300">
        可能是 id 拼错了，或者这条模板还没收录。回到全部模板里找找看。
      </p>
      <div className="flex gap-2">
        <Link
          href="/all"
          className="rounded-xl bg-accent px-4 py-2 text-[13px] font-semibold text-ink-950 transition-transform hover:scale-[1.02]"
        >
          全部模板
        </Link>
        <Link
          href="/"
          className="rounded-xl border border-white/12 px-4 py-2 text-[13px] text-mist-300 transition-colors hover:border-accent/40 hover:text-accent"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
