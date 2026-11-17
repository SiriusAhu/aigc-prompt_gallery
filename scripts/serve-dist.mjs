/**
 * 最小静态服务器，用来验证 dist 产物（支持 Range）。
 * 单独写一个是因为 vite preview 在自定义 base 下会错误地把 .js 回退成 index.html。
 *
 * 用法：node scripts/serve-dist.mjs [端口] [base]
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const port = Number(process.argv[2] ?? 5190);
const base = `/${(process.argv[3] ?? "").replace(/^\/+|\/+$/g, "")}/`.replace("//", "/");
const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".json": "application/json",
};

http
  .createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url ?? "/").split("?")[0]);
    if (!urlPath.startsWith(base)) {
      res.writeHead(404).end("outside base");
      return;
    }
    let rel = urlPath.slice(base.length);
    if (rel === "" || rel.endsWith("/")) rel += "index.html";

    const file = path.resolve(DIST, rel);
    if (!file.startsWith(DIST + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.writeHead(404).end("not found");
      return;
    }

    const stat = fs.statSync(file);
    const type = MIME[path.extname(file).toLowerCase()] ?? "application/octet-stream";
    res.setHeader("Content-Type", type);
    res.setHeader("Accept-Ranges", "bytes");

    const range = req.headers.range;
    const m = range ? /^bytes=(\d*)-(\d*)$/.exec(range.trim()) : null;
    if (m) {
      const start = m[1] ? Number(m[1]) : 0;
      const end = m[2] ? Math.min(Number(m[2]), stat.size - 1) : stat.size - 1;
      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${stat.size}`,
        "Content-Length": end - start + 1,
      });
      fs.createReadStream(file, { start, end }).pipe(res);
      return;
    }

    res.writeHead(200, { "Content-Length": stat.size });
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, "127.0.0.1", () => {
    console.log(`dist served at http://127.0.0.1:${port}${base}`);
  });
