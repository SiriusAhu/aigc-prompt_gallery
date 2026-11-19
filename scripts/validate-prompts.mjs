/**
 * 数据自检。id 重复、kind/category 写错、媒体路径不存在，都会在 dev/build 前报错。
 * 内容允许为空（当前处于结构定稿阶段），空数组只提示、不失败。
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

const VALID_KINDS = ["image", "video"];
const CATEGORIES = {
  image: ["portrait", "scene", "product", "illustration", "architecture", "style"],
  video: ["camera", "light", "material", "structure", "style", "negative", "workflow"],
};
const VALID_ASPECTS = ["1:1", "4:3", "16:9", "9:16", "3:2", "21:9"];
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
  const mod = await import(
    `data:text/javascript;base64,${Buffer.from(out.outputFiles[0].text).toString("base64")}`
  );
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
    warnings.push(`[${item.id}] ${field} 指向的文件不存在：${rel}（页面会显示占位）`);
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

    if (!VALID_KINDS.includes(item.kind)) {
      errors.push(`${at} kind 必须是 image 或 video，当前：${item.kind}`);
    } else if (!CATEGORIES[item.kind].includes(item.category)) {
      errors.push(
        `${at} category 非法：${item.category}（${item.kind} 可选 ${CATEGORIES[item.kind].join(" | ")}）`,
      );
    }
    if (!item.title) errors.push(`${at} title 不能为空`);
    if (!item.prompt) errors.push(`${at} prompt 不能为空`);
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

  const img = PROMPTS.filter((p) => p.kind === "image").length;
  const vid = PROMPTS.filter((p) => p.kind === "video").length;
  console.log(
    PROMPTS.length === 0
      ? "  ✓ 数据校验通过：提示词库为空（结构定稿阶段，符合预期）"
      : `  ✓ 数据校验通过：共 ${PROMPTS.length} 条（图片 ${img} / 视频 ${vid}）`,
  );
}

main().catch((e) => {
  console.error("校验脚本出错：", e);
  process.exit(1);
});
