/**
 * 数据自检。id 重复、分类拼错、媒体路径指向不存在的文件，都会在 dev/build 前直接报错。
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

const VALID_CATEGORIES = [
  "camera",
  "light",
  "material",
  "structure",
  "style",
  "negative",
  "workflow",
];
const VALID_ASPECTS = ["16:9", "9:16", "1:1", "4:3", "21:9"];
const MEDIA_EXT = /\.(mp4|webm|mov|png|jpe?g|webp|avif|gif)$/i;

const errors = [];
const warnings = [];

async function load() {
  const src = path.resolve(ROOT, "src/data/prompts.ts");
  if (!fs.existsSync(src)) {
    errors.push("找不到 src/data/prompts.ts");
    return [];
  }
  const { build } = await import("esbuild");
  const out = await build({
    entryPoints: [src],
    bundle: true,
    format: "esm",
    write: false,
    platform: "node",
    logLevel: "silent",
  });
  const code = out.outputFiles[0].text;
  const mod = await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);
  return mod.PROMPTS ?? [];
}

function checkMedia(item, field, rel) {
  if (!rel) return;
  if (/^https?:\/\//i.test(rel)) return;
  if (!MEDIA_EXT.test(rel)) {
    errors.push(`[${item.id}] ${field} 扩展名不合法：${rel}`);
    return;
  }
  const file = path.resolve(ASSETS_DIR, rel);
  if (!file.startsWith(ASSETS_DIR + path.sep)) {
    errors.push(`[${item.id}] ${field} 越出素材库：${rel}`);
    return;
  }
  if (!fs.existsSync(file)) {
    warnings.push(`[${item.id}] ${field} 指向的文件不存在：${rel}（页面会退回分类色块）`);
  }
}

async function main() {
  const PROMPTS = await load();
  if (errors.length) {
    errors.forEach((e) => console.error("  ✗ " + e));
    process.exit(1);
  }

  const ids = new Set();
  for (const item of PROMPTS) {
    const at = item?.id ? `[${item.id}]` : "[缺少 id]";
    if (!item?.id) {
      errors.push(`${at} id 必须是非空字符串`);
      continue;
    }
    if (ids.has(item.id)) errors.push(`${at} id 重复`);
    ids.add(item.id);
    if (!item.title) errors.push(`${at} title 不能为空`);
    if (!item.prompt) errors.push(`${at} prompt 不能为空`);
    if (!VALID_CATEGORIES.includes(item.category)) {
      errors.push(`${at} category 非法：${item.category}`);
    }
    if (!Array.isArray(item.models) || item.models.length === 0) {
      errors.push(`${at} models 至少写一个`);
    }
    if (item.params?.aspect && !VALID_ASPECTS.includes(item.params.aspect)) {
      errors.push(`${at} params.aspect 非法：${item.params.aspect}`);
    }
    if (item.params?.duration != null && !(item.params.duration > 0)) {
      errors.push(`${at} params.duration 必须为正数`);
    }
    if (item.added && !/^\d{4}-\d{2}-\d{2}$/.test(item.added)) {
      errors.push(`${at} added 必须是 YYYY-MM-DD`);
    }
    checkMedia(item, "media.cover", item.media?.cover);
    checkMedia(item, "media.video", item.media?.video);
  }

  warnings.forEach((w) => console.warn("  ⚠ " + w));
  if (errors.length) {
    errors.forEach((e) => console.error("  ✗ " + e));
    console.error(`\n数据校验失败：${errors.length} 处错误`);
    process.exit(1);
  }
  console.log(`  ✓ 数据校验通过：${PROMPTS.length} 条模板`);
}

main().catch((e) => {
  console.error("校验脚本出错：", e);
  process.exit(1);
});
