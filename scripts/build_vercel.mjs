import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const OUTPUT = path.join(ROOT, ".vercel", "output");
const STATIC = path.join(OUTPUT, "static");

// Clean and create .vercel/output/static
if (fs.existsSync(OUTPUT)) {
  fs.rmSync(OUTPUT, { recursive: true, force: true });
}
fs.mkdirSync(STATIC, { recursive: true });

// Copy all static files & folders into .vercel/output/static
const itemsToCopy = [
  "index.html",
  "about",
  "appointment",
  "blog",
  "blog-post",
  "contact",
  "home",
  "pricing",
  "program",
  "utility-page",
  "assets"
];

for (const item of itemsToCopy) {
  const src = path.join(ROOT, item);
  const dest = path.join(STATIC, item);
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
    console.log(`Copied ${item} -> .vercel/output/static/${item}`);
  }
}

// Write .vercel/output/config.json
const config = {
  version: 3,
  routes: [
    {
      handle: "filesystem"
    },
    {
      src: "/(.*)",
      dest: "/$1"
    }
  ]
};

fs.writeFileSync(path.join(OUTPUT, "config.json"), JSON.stringify(config, null, 2));
console.log("\n✅ Vercel Static Output API v3 created successfully in .vercel/output/static!");
