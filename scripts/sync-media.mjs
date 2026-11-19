/**
 * 把素材库里被引用的媒体同步到 public/media/，供 Next 静态托管读取。
 *
 * 素材库默认在仓库上一级（AI_Video/assets），CI 里切到仓内 assets/。
 * 只复制数据里真正引用到的文件，不会把整个素材库搬进 public。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "..");
const ASSETS_DIR = path.resolve(
  ROOT,
  process.env.ASSETS_DIR ?? (process.env.CI ? "assets" : "../assets"),
);
const PUBLIC_MEDIA = path.resolve(ROOT, "public/media");
const DATA_FILE = path.resolve(ROOT, "src/data/prompts.ts");

const MEDIA_RE = /"([^"<>\n]+\.(?:mp4|webm|mov|png|jpe?g|webp|avif|gif))"/gi;

/** 去掉注释，避免把文档示例（covers/<文件名>.png 之类）误当成真实引用 */
function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}

function collectRefs() {
  if (!fs.existsSync(DATA_FILE)) return [];
  const source = stripComments(fs.readFileSync(DATA_FILE, "utf8"));
  const refs = new Set();
  for (const m of source.matchAll(MEDIA_RE)) refs.add(m[1]);
  return [...refs].filter((r) => !/^https?:\/\//i.test(r));
}

function main() {
  const refs = collectRefs();
  fs.mkdirSync(PUBLIC_MEDIA, { recursive: true });

  let copied = 0;
  let missing = 0;
  for (const rel of refs) {
    const src = path.resolve(ASSETS_DIR, rel);
    if (!src.startsWith(ASSETS_DIR + path.sep) || !fs.existsSync(src)) {
      console.warn(`  ⚠ 素材缺失，已跳过：${rel}`);
      missing++;
      continue;
    }
    const dest = path.join(PUBLIC_MEDIA, rel);
    if (fs.existsSync(dest)) {
      const [a, b] = [fs.statSync(src), fs.statSync(dest)];
      if (a.size === b.size && a.mtimeMs <= b.mtimeMs) continue;
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    copied++;
  }

  // 清理不再被引用的陈旧文件（public/media 是生成目录，可以安全删除）
  let removed = 0;
  const referenced = new Set(refs.map((r) => path.normalize(r)));
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        if (fs.readdirSync(full).length === 0) fs.rmdirSync(full);
      } else {
        const rel = path.relative(PUBLIC_MEDIA, full);
        if (!referenced.has(path.normalize(rel))) {
          fs.unlinkSync(full);
          removed++;
        }
      }
    }
  };
  if (fs.existsSync(PUBLIC_MEDIA)) walk(PUBLIC_MEDIA);

  console.log(
    `  → 媒体同步：${ASSETS_DIR} → public/media/，复制 ${copied} 个，清理 ${removed} 个，缺失 ${missing} 个`,
  );
}

main();
