import { PROMPTS } from "@/data/prompts";
import type { PromptItem, PromptKind } from "@/data/types";

export function byKind(kind: PromptKind): PromptItem[] {
  return PROMPTS.filter((p) => p.kind === kind);
}

export function byId(id: string): PromptItem | undefined {
  return PROMPTS.find((p) => p.id === id);
}
