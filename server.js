import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".ogv": "video/ogg"
};

function resolveFilePath(reqUrl) {
  let pathname = decodeURIComponent(new URL(reqUrl, `http://localhost:${PORT}`).pathname);
  
  if (pathname === "/") {
    return path.join(ROOT, "index.html");
  }

  // Check direct file
  let candidate = path.join(ROOT, pathname);
  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    return candidate;
  }

  // Check .html extension (e.g. /about -> /about.html)
  if (fs.existsSync(candidate + ".html") && fs.statSync(candidate + ".html").isFile()) {
    return candidate + ".html";
  }

  // Check /index.html inside folder (e.g. /about/ -> /about/index.html)
  let subIndex = path.join(candidate, "index.html");
  if (fs.existsSync(subIndex) && fs.statSync(subIndex).isFile()) {
    return subIndex;
  }

  // 404 fallback
  let notFound = path.join(ROOT, "404.html");
  if (fs.existsSync(notFound)) {
    return notFound;
  }

  return null;
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = parsedUrl.pathname;

  // Handle local form mock API
  if (pathname.startsWith("/api/form")) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, message: "Submission received locally." }));
    return;
  }

  const filePath = resolveFilePath(req.url);

  if (!filePath || !fs.existsSync(filePath)) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
    return;
  }

  const stat = fs.statSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  // Handle Video Streaming / HTTP Range Requests for smooth MP4 playback
  const range = req.headers.range;
  if (range && (ext === ".mp4" || ext === ".webm")) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${stat.size}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": contentType
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": stat.size,
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*"
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

server.listen(PORT, () => {
  console.log(`\n🚀 Atmawell Local Server running at http://localhost:${PORT}/\n`);
});
