import type { Metadata } from "next";
import { PromptPage } from "@/components/PromptPage";

export const metadata: Metadata = {
  title: "视频提示词",
  description: "视频提示词模板：运镜、光影、材质、结构与节奏。",
};

export default function VideoPromptsPage() {
  return <PromptPage kind="video" />;
}
