/**
 * next build 之后的收尾：
 * - GitHub Pages 默认跑 Jekyll，会忽略 _next/ 这类下划线目录，必须放 .nojekyll
 * - 顺手报告 out/ 的体积和页面数，方便判断有没有把大文件带进去
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(here, "..", "out");

if (!fs.existsSync(OUT)) {
  console.error("  ✗ 找不到 out/，next build 可能失败了");
  process.exit(1);
}

fs.writeFileSync(path.join(OUT, ".nojekyll"), "");

function walk(dir) {
  let files = 0;
  let bytes = 0;
  let html = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const sub = walk(full);
      files += sub.files;
      bytes += sub.bytes;
      html += sub.html;
    } else {
      files++;
      bytes += fs.statSync(full).size;
      if (entry.name.endsWith(".html")) html++;
    }
  }
  return { files, bytes, html };
}

const { files, bytes, html } = walk(OUT);
const mb = (bytes / 1024 / 1024).toFixed(2);
console.log(`  → 静态导出：out/ 共 ${files} 个文件、${html} 个页面、${mb} MB，已写入 .nojekyll`);
