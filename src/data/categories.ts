import type { Category } from "./types";

export interface CategoryMeta {
  id: Category;
  label: string;
  icon: string;
  /** 卡片无封面时兜底渐变的起始色 */
  tint: string;
  description: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: "camera", label: "运镜", icon: "⌖", tint: "#38bdf8", description: "推拉摇移、环绕、手持跟随" },
  { id: "light", label: "光影", icon: "◐", tint: "#fbbf24", description: "布光、色温、体积光、反射" },
  { id: "material", label: "材质", icon: "◇", tint: "#a78bfa", description: "织物、金属、玻璃、水" },
  { id: "structure", label: "结构", icon: "▤", tint: "#34d399", description: "单镜头叙事、分镜、节奏" },
  { id: "style", label: "风格", icon: "✦", tint: "#f472b6", description: "胶片、动画、年代感" },
  { id: "negative", label: "负向", icon: "⊘", tint: "#f87171", description: "排除崩坏与伪影" },
  { id: "workflow", label: "流程", icon: "⟳", tint: "#94a3b8", description: "首尾帧、参考图、多段接续" },
];

export const CATEGORY_MAP: Record<Category, CategoryMeta> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<Category, CategoryMeta>;
