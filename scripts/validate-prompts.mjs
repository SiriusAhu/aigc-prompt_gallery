/**
 * 提示词数据自检。手写 JSON/TS 最容易出的错是 id 重复、分类拼错、媒体路径指向不存在的文件。
 * 这个脚本在 pnpm dev / pnpm build 之前跑，写错了直接停下并告诉你哪一条、哪个字段。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.resolve(here, "..", process.env.ASSETS_DIR ?? "../assets");

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
  const src = path.resolve(here, "..", "src/data/prompts.ts");
  if (!fs.existsSync(src)) {
    errors.push("找不到 src/data/prompts.ts");
    return [];
  }
  // 用 esbuild 直接转译 TS，避免额外依赖
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
  const dataUrl = `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
  const mod = await import(dataUrl);
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
  if (!file.startsWith(ASSETS_DIR)) {
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
  if (PROMPTS.length === 0) {
    errors.push("PROMPTS 为空");
  }

  const ids = new Set();
  for (const item of PROMPTS) {
    const at = item?.id ? `[${item.id}]` : "[缺少 id]";
    if (!item?.id || typeof item.id !== "string") {
      errors.push(`${at} id 必须是非空字符串`);
      continue;
    }
    if (ids.has(item.id)) errors.push(`${at} id 重复`);
    ids.add(item.id);

    if (!item.title || typeof item.title !== "string") errors.push(`${at} title 不能为空`);
    if (!item.prompt || typeof item.prompt !== "string") errors.push(`${at} prompt 不能为空`);
    if (!VALID_CATEGORIES.includes(item.category)) {
      errors.push(`${at} category 非法：${item.category}，可选 ${VALID_CATEGORIES.join(" | ")}`);
    }
    if (!Array.isArray(item.models) || item.models.length === 0) {
      errors.push(`${at} models 至少要写一个模型名`);
    }
    const aspect = item.params?.aspect;
    if (aspect && !VALID_ASPECTS.includes(aspect)) {
      errors.push(`${at} params.aspect 非法：${aspect}`);
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

  // 分类分布提示
  const dist = PROMPTS.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});

  warnings.forEach((w) => console.warn("  ⚠ " + w));
  if (errors.length) {
    errors.forEach((e) => console.error("  ✗ " + e));
    console.error(`\n数据校验失败：${errors.length} 处错误`);
    process.exit(1);
  }
  console.log(
    `  ✓ 数据校验通过：${PROMPTS.length} 条模板，${Object.keys(dist).length} 个分类` +
      (warnings.length ? `，${warnings.length} 条提醒` : ""),
  );
}

main().catch((e) => {
  console.error("校验脚本自身出错：", e);
  process.exit(1);
});
