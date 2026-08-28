import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    if (file.startsWith('.') || file === 'node_modules' || file === 'dist' || file === 'atmawell-downloader') return;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.astro', '.css', '.js', '.html', '.svg', '.json', '.md'].includes(ext)) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

const targetDirs = ['src', 'assets/css', 'assets/js', 'public'];
const files = targetDirs.flatMap(dir => walk(dir));

console.log(`Scanning ${files.length} files...`);

let modifiedFilesCount = 0;

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace occurrences of png, jpg, jpeg in asset paths with webp
  const updatedContent = content.replace(/((\/)?assets\/[^\s"'`\)\>]+\.)(png|jpg|jpeg)/gi, (match, prefix, slash, ext) => {
    return prefix + 'webp';
  }).replace(/(anne%20chataigner%20logo|anne\s+chataigner\s+logo)\.(jpg|jpeg|png)/gi, (match, base) => {
    return base + '.webp';
  });

  if (updatedContent !== originalContent) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    modifiedFilesCount++;
    console.log(`Updated references in: ${filePath}`);
  }
}

console.log(`\nUpdated ${modifiedFilesCount} files successfully!`);
