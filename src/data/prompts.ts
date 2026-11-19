import type { PromptItem } from "./types";

/**
 * 提示词库。目前刻意留空——页面结构与视觉还在定稿阶段。
 *
 * 新增条目时按 PromptItem 结构填写，kind 决定它出现在 /image 还是 /video：
 *   { id, kind: "image" | "video", title, category, prompt, media?: { cover, video } }
 *
 * 媒体路径相对于素材库根目录（默认 AI_Video/assets）：
 *   media: { cover: "covers/<文件名>.png", video: "videos/<文件名>.mp4" }
 * 没有 media.video 的条目不会出现悬停播放。
 *
 * 历史上曾收录 12 条视频提示词，已从工作区移除；
 * 需要取回时见 README「找回早期模板」一节。
 */
export const PROMPTS: PromptItem[] = [];

export function promptsOf(kind: PromptItem["kind"]): PromptItem[] {
  return PROMPTS.filter((p) => p.kind === kind);
}
