import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

/**
 * 素材库目录。默认是仓库上一级的 assets/，也就是 AI_Video/assets。
 * CI（GitHub Actions）里没有上一级目录，自动切到仓内 assets/。
 * 手动指定：ASSETS_DIR=assets pnpm dev
 */
const ASSETS_DIR = path.resolve(
  here,
  process.env.ASSETS_DIR ?? (process.env.CI ? "assets" : "../assets"),
);

const DATA_FILE = path.resolve(here, "src/data/prompts.ts");
const MEDIA_RE = /"([^"\n]+\.(?:mp4|webm|mov|png|jpe?g|webp|avif|gif))"/gi;

const MIME: Record<string, string> = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
};

/** 只收集数据里真正引用到的媒体，避免把整个素材库搬进产物 */
function collectMediaRefs(): string[] {
  if (!fs.existsSync(DATA_FILE)) return [];
  const refs = new Set<string>();
  for (const m of fs.readFileSync(DATA_FILE, "utf8").matchAll(MEDIA_RE)) refs.add(m[1]);
  return [...refs].filter((r) => !/^https?:\/\//i.test(r));
}

function assetLibrary(): Plugin {
  return {
    name: "prompt-vault-assets",

    /** 开发期：把 /__assets__/* 直通到素材库，支持 Range，视频才能正常加载与拖动 */
    configureServer(server) {
      server.middlewares.use("/__assets__", (req, res) => {
        let rel: string;
        try {
          rel = path.posix.normalize(
            decodeURIComponent((req.url ?? "/").split("?")[0]).replace(/^\/+/, ""),
          );
        } catch {
          res.statusCode = 400;
          res.end("bad path");
          return;
        }

        const file = path.resolve(ASSETS_DIR, rel);
        const inside =
          rel.length > 0 && !rel.split("/").includes("..") && file.startsWith(ASSETS_DIR + path.sep);
        if (!inside || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
          res.statusCode = 404;
          res.end("asset not found");
          return;
        }

        const stat = fs.statSync(file);
        const type = MIME[path.extname(file).toLowerCase()] ?? "application/octet-stream";
        res.setHeader("Content-Type", type);
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("Cache-Control", "no-cache");

        const range = req.headers.range;
        if (range) {
          const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
          if (m) {
            const start = m[1] ? Number(m[1]) : 0;
            const end = m[2] ? Math.min(Number(m[2]), stat.size - 1) : stat.size - 1;
            if (start <= end && start < stat.size) {
              res.statusCode = 206;
              res.setHeader("Content-Range", `bytes ${start}-${end}/${stat.size}`);
              res.setHeader("Content-Length", end - start + 1);
              fs.createReadStream(file, { start, end }).pipe(res);
              return;
            }
          }
          res.statusCode = 416;
          res.setHeader("Content-Range", `bytes */${stat.size}`);
          res.end();
          return;
        }

        res.setHeader("Content-Length", stat.size);
        fs.createReadStream(file).pipe(res);
      });
    },

    /** 构建期：把被引用的媒体复制进 dist/media/，与 Vite 自己的 dist/assets/ 分开，避免混淆 */
    closeBundle() {
      const dist = path.resolve(here, "dist");
      let copied = 0;
      let missing = 0;
      for (const rel of collectMediaRefs()) {
        const src = path.resolve(ASSETS_DIR, rel);
        if (!fs.existsSync(src)) {
          console.warn(`  ⚠ 素材缺失，已跳过：${rel}`);
          missing++;
          continue;
        }
        const dest = path.join(dist, "media", rel);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(src, dest);
        copied++;
      }
      console.log(`  → 媒体：复制 ${copied} 个，缺失 ${missing} 个`);
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), assetLibrary()],
  // GitHub Pages 地址形如 https://<user>.github.io/<repo>/，由 Actions 注入 BASE=/<repo>/
  base: process.env.BASE ?? "/",
  server: {
    host: "127.0.0.1",
    fs: { allow: [here, path.dirname(here)] },
  },
});
