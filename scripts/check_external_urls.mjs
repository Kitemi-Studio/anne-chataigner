import fs from "fs";
import path from "path";

const files = [];
function findFiles(dir) {
  for (const item of fs.readdirSync(dir)) {
    if (item === "node_modules" || item === ".git" || item === "atmawell-downloader" || item === "scripts") continue;
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) findFiles(full);
    else if (/\.(html|css|js)$/.test(item)) files.push(full);
  }
}
findFiles(process.cwd());

const externalLinks = new Set();
for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  const matches = content.match(/https?:\/\/[^\s"'><\)\(\]]+/g) || [];
  for (const m of matches) {
    if (!m.includes("schema.org") && !m.includes("w3.org")) {
      externalLinks.add(`${path.relative(process.cwd(), file)}: ${m}`);
    }
  }
}
console.log("Remaining external links found:", externalLinks.size);
for (const l of Array.from(externalLinks)) {
  console.log(l);
}
