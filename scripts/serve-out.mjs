/**
 * 最小静态服务器，验证 out/ 产物（支持 Range 与目录 index 回退）。
 * 用法：node scripts/serve-out.mjs [端口] [base]
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const port = Number(process.argv[2] ?? 5190);
const base = `/${(process.argv[3] ?? "").replace(/^\/+|\/+$/g, "")}/`.replace("//", "/");
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "out");

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
  ".woff2": "font/woff2",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
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

    let file = path.resolve(OUT, rel);
    if (!file.startsWith(OUT + path.sep)) {
      res.writeHead(403).end("forbidden");
      return;
    }
    if (!fs.existsSync(file) && fs.existsSync(`${file}.html`)) file = `${file}.html`;
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
      const nf = path.join(OUT, "404.html");
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      if (fs.existsSync(nf)) fs.createReadStream(nf).pipe(res);
      else res.end("not found");
      return;
    }

    const stat = fs.statSync(file);
    const type = MIME[path.extname(file).toLowerCase()] ?? "application/octet-stream";
    res.setHeader("Content-Type", type);
    res.setHeader("Accept-Ranges", "bytes");

    const m = req.headers.range ? /^bytes=(\d*)-(\d*)$/.exec(req.headers.range.trim()) : null;
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
    console.log(`out/ served at http://127.0.0.1:${port}${base}`);
  });
