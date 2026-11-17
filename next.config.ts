import type { NextConfig } from "next";

const basePath = (process.env.BASE ?? "/").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  // 纯静态导出：GitHub Pages 只能托管静态文件
  output: "export",
  // /c/camera -> out/c/camera/index.html，GitHub Pages 直接可访问
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  // 用 127.0.0.1 访问时 Next 默认会把 /_next/hmr 当成跨域拦掉，
  // 导致客户端运行时加载失败、页面不 hydrate（表现为所有交互失效）
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    // 静态导出不支持 Next 的图片优化服务
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
