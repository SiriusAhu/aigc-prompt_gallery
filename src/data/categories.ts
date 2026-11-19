import type { PromptKind } from "./types";

export const KIND_META: Record<PromptKind, { label: string; href: string; blurb: string }> = {
  image: {
    label: "图片提示词",
    href: "/image",
    blurb: "以静帧的方式积累构图、光线与风格。",
  },
  video: {
    label: "视频提示词",
    href: "/video",
    blurb: "沉淀运镜、节奏与动态表现，鼠标悬停即可预览。",
  },
};
