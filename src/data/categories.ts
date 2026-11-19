import type { PromptKind } from "./types";

export interface CategoryMeta {
  id: string;
  label: string;
  /** 卡片无预览图时的色块起点 */
  tint: string;
  description: string;
}

/** 图片与视频使用各自的分类体系 */
export const CATEGORIES: Record<PromptKind, CategoryMeta[]> = {
  image: [
    { id: "portrait", label: "人像", tint: "#ff9f7a", description: "肖像、情绪、妆造与肤质" },
    { id: "scene", label: "场景", tint: "#7ed3a4", description: "风光、街景、室内空间" },
    { id: "product", label: "产品", tint: "#8fb8ff", description: "静物、材质、商业布光" },
    { id: "illustration", label: "插画", tint: "#c9a2ff", description: "手绘、动画、平面风格" },
    { id: "architecture", label: "建筑", tint: "#ffd27a", description: "建筑、室内、结构光影" },
    { id: "style", label: "风格", tint: "#ff9ecd", description: "胶片、年代感、色彩倾向" },
  ],
  video: [
    { id: "camera", label: "运镜", tint: "#8fb8ff", description: "推拉摇移、环绕、手持跟随" },
    { id: "light", label: "光影", tint: "#ffd27a", description: "布光、色温、体积光" },
    { id: "material", label: "材质", tint: "#c9a2ff", description: "织物、金属、玻璃、水" },
    { id: "structure", label: "结构", tint: "#7ed3a4", description: "单镜头叙事、分镜、节奏" },
    { id: "style", label: "风格", tint: "#ff9ecd", description: "胶片、动画、年代感" },
    { id: "negative", label: "负向", tint: "#ff9f7a", description: "排除崩坏与伪影" },
    { id: "workflow", label: "流程", tint: "#a8b3c7", description: "首尾帧、参考图、多段接续" },
  ],
};

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

export function categoriesOf(kind: PromptKind): CategoryMeta[] {
  return CATEGORIES[kind];
}

export function categoryMeta(kind: PromptKind, id: string): CategoryMeta | undefined {
  return CATEGORIES[kind].find((c) => c.id === id);
}
