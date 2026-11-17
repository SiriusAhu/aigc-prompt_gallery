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

const MEDIA_RE = /"([^"\n]+\.(?:mp4|webm|mov|png|jpe?g|webp|avif|gif))"/gi;

function collectRefs() {
  if (!fs.existsSync(DATA_FILE)) return [];
  const refs = new Set();
  for (const m of fs.readFileSync(DATA_FILE, "utf8").matchAll(MEDIA_RE)) refs.add(m[1]);
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

  console.log(
    `  → 媒体同步：${ASSETS_DIR} → public/media/，复制 ${copied} 个，缺失 ${missing} 个`,
  );
}

main();
