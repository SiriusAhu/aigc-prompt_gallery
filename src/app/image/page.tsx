import type { Metadata } from "next";
import { PromptPage } from "@/components/PromptPage";

export const metadata: Metadata = {
  title: "图片提示词",
  description: "图片提示词模板：人像、场景、产品、插画、建筑与风格。",
};

export default function ImagePromptsPage() {
  return <PromptPage kind="image" />;
}
