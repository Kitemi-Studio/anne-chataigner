import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

const BASE_URL = "https://atmawell.webflow.io";

const PAGES = [
  "/",
  "/about",
  "/appointment",
  "/blog-post/blog-a",
  "/blog-post/blog-b",
  "/blog-post/blog-c",
  "/blog/building-focus-and-balance-in-daily-work",
  "/blog/creating-stronger-bonds-through-trust",
  "/blog/finding-emotional-clarity-in-quiet-moments",
  "/blog/guided-personal-growth-for-better-living",
  "/blog/improving-communication-in-relationships",
  "/blog/practicing-self-reflection-for-growth",
  "/contact/contact-a",
  "/contact/contact-b",
  "/contact/contact-c",
  "/home/home-b",
  "/home/home-c",
  "/pricing",
  "/program",
  "/program/inner-clarity-program",
  "/program/life-balance-sessions",
  "/program/mindset-reset-program",
  "/program/personal-growth-coaching",
  "/utility-page/changelog",
  "/utility-page/licenses",
  "/utility-page/style-guide",
  "/404"
];

// Directories
const DIRS = {
  css: path.join(ROOT_DIR, "assets", "css"),
  js: path.join(ROOT_DIR, "assets", "js"),
  images: path.join(ROOT_DIR, "assets", "images"),
  fonts: path.join(ROOT_DIR, "assets", "fonts"),
  videos: path.join(ROOT_DIR, "assets", "videos")
};

for (const dir of Object.values(DIRS)) {
  fs.mkdirSync(dir, { recursive: true });
}

function sanitizeFilename(urlStr, defaultExt = "") {
  try {
    const u = new URL(urlStr);
    let pathname = decodeURIComponent(u.pathname);
    let basename = path.basename(pathname);
    basename = basename.split("?")[0];
    if (!path.extname(basename) && defaultExt) {
      basename += defaultExt;
    }
    // Replace non-safe chars
    basename = basename.replace(/[^a-zA-Z0-9._-]/g, "_");
    return basename;
  } catch (e) {
    let clean = decodeURIComponent(urlStr).split("?")[0].replace(/[^a-zA-Z0-9._-]/g, "_");
    if (!path.extname(clean) && defaultExt) {
      clean += defaultExt;
    }
    return clean;
  }
}

async function downloadAsset(url, targetPath) {
  if (fs.existsSync(targetPath) && fs.statSync(targetPath).size > 0) {
    return;
  }
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download ${url}: ${res.status} ${res.statusText}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(targetPath, buffer);
}

function extractAllUrlsFromHtml(html) {
  const urls = new Set();

  // 1. src and href attributes
  const attrRegex = /\b(?:src|href|data-poster-url|data-video-urls|poster)\s*=\s*["']([^"']+)["']/gi;
  let match;
  while ((match = attrRegex.exec(html)) !== null) {
    const rawVal = match[1];
    // Handle comma-separated data-video-urls
    const parts = rawVal.split(",");
    for (let p of parts) {
      p = p.trim().replace(/&amp;/g, "&");
      if (p.startsWith("http://") || p.startsWith("https://")) {
        urls.add(p);
      }
    }
  }

  // 2. srcset
  const srcsetRegex = /\bsrcset\s*=\s*["']([^"']+)["']/gi;
  let sMatch;
  while ((sMatch = srcsetRegex.exec(html)) !== null) {
    const rawVal = sMatch[1];
    const items = rawVal.split(",");
    for (let item of items) {
      const u = item.trim().split(/\s+/)[0].replace(/&amp;/g, "&");
      if (u.startsWith("http://") || u.startsWith("https://")) {
        urls.add(u);
      }
    }
  }

  // 3. Schema.org or JSON-LD images/logos
  const jsonLdRegex = /"url"\s*:\s*"(https:\/\/[^"]+)"/gi;
  let jMatch;
  while ((jMatch = jsonLdRegex.exec(html)) !== null) {
    urls.add(jMatch[1].replace(/&amp;/g, "&"));
  }

  // 4. Open Graph & Twitter meta tags
  const metaRegex = /<meta\s+(?:property|name)=["'](?:og:image|twitter:image)["']\s+content=["']([^"']+)["']/gi;
  let mMatch;
  while ((mMatch = metaRegex.exec(html)) !== null) {
    urls.add(mMatch[1].replace(/&amp;/g, "&"));
  }

  return urls;
}

function categorizeAndRegisterAsset(url, assetMap) {
  // Strip url queries for classification
  const cleanUrl = url.split("?")[0];
  const decoded = decodeURIComponent(cleanUrl);
  const ext = path.extname(decoded).toLowerCase();

  let type = "images";
  let folderName = "images";

  if (ext === ".css") {
    type = "css";
    folderName = "css";
  } else if (ext === ".js") {
    type = "js";
    folderName = "js";
  } else if ([".ttf", ".otf", ".woff", ".woff2", ".eot"].includes(ext)) {
    type = "fonts";
    folderName = "fonts";
  } else if ([".mp4", ".webm", ".mov", ".ogg"].includes(ext)) {
    type = "videos";
    folderName = "videos";
  } else if ([".avif", ".webp", ".png", ".jpg", ".jpeg", ".svg", ".gif", ".ico"].includes(ext)) {
    type = "images";
    folderName = "images";
  }

  const filename = sanitizeFilename(url, ext || ".bin");
  const localFilePath = path.join(DIRS[folderName], filename);
  const webPath = `/assets/${folderName}/${filename}`;

  assetMap.set(url, {
    url,
    type,
    folderName,
    filename,
    localFilePath,
    webPath
  });
}

async function main() {
  console.log("=== 1. Téléchargement des 27 pages HTML sources ===");
  const rawPages = new Map();

  for (const pagePath of PAGES) {
    const fullUrl = BASE_URL + (pagePath === "/" ? "" : pagePath);
    console.log(`Fetching ${fullUrl}...`);
    try {
      const res = await fetch(fullUrl);
      if (!res.ok) {
        console.warn(`Warning: ${fullUrl} returned ${res.status}`);
        continue;
      }
      const html = await res.text();
      rawPages.set(pagePath, html);
    } catch (err) {
      console.error(`Error fetching ${fullUrl}:`, err.message);
    }
  }

  console.log(`\n=== 2. Extraction complète de tous les assets du site ===`);
  const assetMap = new Map();

  for (const [pagePath, html] of rawPages.entries()) {
    const urls = extractAllUrlsFromHtml(html);
    for (const u of urls) {
      if (
        u.includes("cdn.prod.website-files.com") ||
        u.includes("cloudfront.net") ||
        u.includes("gsap")
      ) {
        categorizeAndRegisterAsset(u, assetMap);
      }
    }
  }

  console.log(`Found ${assetMap.size} unique assets in HTML.`);

  console.log(`\n=== 3. Scan approfondi des CSS et assets imbriqués ===`);
  for (const [url, info] of Array.from(assetMap.entries())) {
    if (info.type === "css") {
      console.log(`Downloading & analyzing CSS: ${url}`);
      await downloadAsset(url, info.localFilePath);
      const cssContent = fs.readFileSync(info.localFilePath, "utf8");

      const cssUrlRegex = /url\((['"]?)(https:\/\/cdn\.prod\.website-files\.com\/[^'")]+)\1\)/gi;
      let cMatch;
      while ((cMatch = cssUrlRegex.exec(cssContent)) !== null) {
        const nestedUrl = cMatch[2];
        if (!assetMap.has(nestedUrl)) {
          categorizeAndRegisterAsset(nestedUrl, assetMap);
        }
      }
    }
  }

  console.log(`\n=== 4. Téléchargement de tous les assets (${assetMap.size} total) ===`);
  let count = 0;
  for (const [url, info] of assetMap.entries()) {
    try {
      await downloadAsset(url, info.localFilePath);
      count++;
      process.stdout.write(`\r[${count}/${assetMap.size}] OK: ${info.filename}`);
    } catch (err) {
      console.error(`\nFailed to download ${url}:`, err.message);
    }
  }
  console.log("\nAll assets downloaded.");

  console.log(`\n=== 5. Réécriture des fichiers CSS ===`);
  for (const [url, info] of assetMap.entries()) {
    if (info.type === "css") {
      let cssContent = fs.readFileSync(info.localFilePath, "utf8");
      for (const [assetUrl, assetInfo] of assetMap.entries()) {
        if (assetInfo.type !== "css") {
          const relativeAssetPath = `../${assetInfo.folderName}/${assetInfo.filename}`;
          cssContent = cssContent.split(assetUrl).join(relativeAssetPath);
          // Also handle decodeURIComponent version if any
          try {
            cssContent = cssContent.split(decodeURIComponent(assetUrl)).join(relativeAssetPath);
          } catch(e) {}
        }
      }
      fs.writeFileSync(info.localFilePath, cssContent, "utf8");
      console.log(`Rewrote paths in: ${info.localFilePath}`);
    }
  }

  console.log(`\n=== 6. Réécriture des fichiers JS ===`);
  for (const [url, info] of assetMap.entries()) {
    if (info.type === "js") {
      let jsContent = fs.readFileSync(info.localFilePath, "utf8");
      for (const [assetUrl, assetInfo] of assetMap.entries()) {
        jsContent = jsContent.split(assetUrl).join(assetInfo.webPath);
        try {
          jsContent = jsContent.split(decodeURIComponent(assetUrl)).join(assetInfo.webPath);
        } catch(e) {}
      }
      fs.writeFileSync(info.localFilePath, jsContent, "utf8");
    }
  }

  console.log(`\n=== 7. Réécriture et génération des pages HTML ===`);
  // Sort asset URLs by length descending to avoid partial matching of prefix URLs
  const sortedAssetEntries = Array.from(assetMap.entries()).sort((a, b) => b[0].length - a[0].length);

  for (const [pagePath, rawHtml] of rawPages.entries()) {
    let html = rawHtml;

    // Remove Webflow comments and preconnect
    html = html.replace(/<!-- This site was created in Webflow[\s\S]*?-->/gi, "");
    html = html.replace(/<link[^>]+preconnect[^>]+cdn\.prod\.website-files\.com[^>]*>/gi, "");
    html = html.replace(/<meta content="Webflow" name="generator">/gi, '<meta content="Atmawell" name="generator">');

    // Replace Webflow template purchase button URL with /appointment or /contact/contact-a
    html = html.replace(/https:\/\/webflow\.com\/templates\/html\/atmawell-website-template/g, "/appointment");

    // Replace "Powered by Webflow" in footer if present
    html = html.replace(/© 2026 Kahade Studio\. Powered by Webflow/g, "© 2026 Atmawell. Tous droits réservés.");

    // Remove Cloudflare turnstile script
    html = html.replace(/<script src="https:\/\/challenges\.cloudflare\.com\/turnstile\/v0\/api\.js"><\/script>/gi, "");

    // Rewrite all assets (encoded and raw)
    for (const [assetUrl, assetInfo] of sortedAssetEntries) {
      html = html.split(assetUrl).join(assetInfo.webPath);
      try {
        const decodedUrl = decodeURIComponent(assetUrl);
        if (decodedUrl !== assetUrl) {
          html = html.split(decodedUrl).join(assetInfo.webPath);
        }
      } catch(e) {}
    }

    // Rewrite data-video-urls comma-separated paths if needed
    // E.g. data-video-urls="url1,url2" -> already handled if both were replaced
    // Also rewrite internal links
    html = html.replace(/https:\/\/atmawell\.webflow\.io\//g, "/");
    html = html.replace(/https:\/\/atmawell\.webflow\.io/g, "");

    // Write file
    let targetHtmlPath;
    if (pagePath === "/") {
      targetHtmlPath = path.join(ROOT_DIR, "index.html");
    } else if (pagePath === "/404") {
      targetHtmlPath = path.join(ROOT_DIR, "404.html");
    } else {
      const cleanRoute = pagePath.replace(/^\//, "");
      targetHtmlPath = path.join(ROOT_DIR, `${cleanRoute}.html`);
      const dirOfFile = path.dirname(targetHtmlPath);
      fs.mkdirSync(dirOfFile, { recursive: true });

      // Clean directory index.html
      const subFolderDir = path.join(ROOT_DIR, cleanRoute);
      fs.mkdirSync(subFolderDir, { recursive: true });
      fs.writeFileSync(path.join(subFolderDir, "index.html"), html, "utf8");
    }

    fs.writeFileSync(targetHtmlPath, html, "utf8");
    console.log(`Saved: ${pagePath} -> ${targetHtmlPath}`);
  }

  console.log(`\nLocalisation terminée avec succès !`);
}

main().catch(console.error);
