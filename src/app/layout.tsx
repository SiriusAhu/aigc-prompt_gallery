import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PromptVault · AI 视频提示词库",
    template: "%s · PromptVault",
  },
  description:
    "AI 视频提示词库：沉淀运镜、光影、材质与参数模板，按分类浏览，悬停预览效果，一键复制。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen antialiased">
        <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col px-4 sm:px-6">
          <SiteHeader />
          <main className="flex-1 pb-20">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
