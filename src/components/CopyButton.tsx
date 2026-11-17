"use client";

import { useState } from "react";
import { copyText } from "@/lib/asset";
import type { PromptItem } from "@/data/types";

type Target = "all" | "prompt" | "negative";

function buildText(item: PromptItem, target: Target): string {
  if (target === "prompt") return item.prompt;
  if (target === "negative") return item.negative ?? "";

  const params = item.params
    ? Object.entries({
        aspect: item.params.aspect,
        duration: item.params.duration && `${item.params.duration}s`,
        fps: item.params.fps && `${item.params.fps}fps`,
        ...item.params.extra,
      })
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}=${v}`)
        .join(", ")
    : "";

  return [
    item.title,
    "",
    "Prompt:",
    item.prompt,
    item.negative ? `\nNegative:\n${item.negative}` : "",
    params ? `\nParams: ${params}` : "",
    item.notes ? `\nNotes: ${item.notes}` : "",
  ].join("\n");
}

export function CopyButton({
  item,
  target = "all",
  label,
  className,
}: {
  item: PromptItem;
  target?: Target;
  label: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    if (await copyText(buildText(item, target))) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={
        className ??
        "rounded-lg border border-white/10 px-3 py-1.5 text-[11.5px] text-mist-300 transition-colors hover:border-accent/40 hover:text-accent"
      }
    >
      {copied ? "已复制" : label}
    </button>
  );
}
