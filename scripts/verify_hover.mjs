import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const require = createRequire(path.join(ROOT_DIR, 'atmawell-downloader', 'package.json'));
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });

  // Hover over the primary CTA in the hero
  const ctaBtn = await page.$('.hero-full-buttons .primary-button');
  if (ctaBtn) {
    await ctaBtn.hover();
    await new Promise((r) => setTimeout(r, 180)); // Halfway through hover animation
    await page.screenshot({ path: path.join(ROOT_DIR, 'button_hover_mid.png') });
    await new Promise((r) => setTimeout(r, 300)); // Completed hover
    await page.screenshot({ path: path.join(ROOT_DIR, 'button_hover_done.png') });
    console.log('Button hover test captured successfully!');
  }
  await browser.close();
})();
