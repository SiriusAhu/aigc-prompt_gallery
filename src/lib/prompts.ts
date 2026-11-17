import { PROMPTS } from "@/data/prompts";
import { CATEGORIES } from "@/data/categories";
import type { Category, PromptItem } from "@/data/types";

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

export function isCategory(value: string | undefined | null): value is Category {
  return !!value && CATEGORY_IDS.includes(value as Category);
}

export function getPromptsByCategory(category: Category): PromptItem[] {
  return PROMPTS.filter((p) => p.category === category);
}

export function getPromptById(id: string): PromptItem | undefined {
  return PROMPTS.find((p) => p.id === id);
}

/** 详情页的上一条 / 下一条，按分类内顺序 */
export function getNeighbors(item: PromptItem) {
  const siblings = getPromptsByCategory(item.category);
  const idx = siblings.findIndex((p) => p.id === item.id);
  return {
    prev: idx > 0 ? siblings[idx - 1] : null,
    next: idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null,
  };
}
