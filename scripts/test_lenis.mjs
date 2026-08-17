import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

const require = createRequire(path.join(ROOT_DIR, "atmawell-downloader", "package.json"));
const puppeteer = require("puppeteer");

async function testLenis() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push(msg.text()));

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });

  // 1. Check if window.lenis exists
  const lenisStatus = await page.evaluate(() => {
    return {
      hasLenis: typeof window.lenis !== 'undefined' && window.lenis !== null,
      isStopped: window.lenis ? window.lenis.isStopped : null,
      actualScroll: window.lenis ? window.lenis.actualScroll : null,
      targetScroll: window.lenis ? window.lenis.targetScroll : null,
      animatedScroll: window.lenis ? window.lenis.animatedScroll : null,
      options: window.lenis ? window.lenis.options : null,
      htmlClasses: document.documentElement.className,
      bodyClasses: document.body.className
    };
  });

  console.log('Lenis Status:', JSON.stringify(lenisStatus, null, 2));

  // 2. Attach a scroll listener to measure frames during wheel scroll
  await page.evaluate(() => {
    window.__scrollFrames = [];
    if (window.lenis) {
      window.lenis.on('scroll', (e) => {
        window.__scrollFrames.push({
          time: performance.now(),
          scroll: e.scroll,
          velocity: e.velocity,
          actual: window.lenis.actualScroll,
          animated: window.lenis.animatedScroll,
          target: window.lenis.targetScroll
        });
      });
    }
  });

  // 3. Dispatch a wheel event
  console.log('Dispatching mouse wheel event (deltaY: 300)...');
  await page.mouse.wheel({ deltaY: 300 });

  // 4. Sample frames over 1000ms
  await new Promise(r => setTimeout(r, 1000));

  const scrollFrames = await page.evaluate(() => window.__scrollFrames);
  console.log(`Captured ${scrollFrames.length} scroll frames from Lenis!`);
  if (scrollFrames.length > 0) {
    console.log('First 5 frames:', scrollFrames.slice(0, 5));
    console.log('Last 3 frames:', scrollFrames.slice(-3));
  } else {
    console.log('⚠️ NO FRAMES EMITTED BY LENIS!');
  }

  // 5. Test programmatic scrollTo
  console.log('\nTesting lenis.scrollTo("#accompagnements")...');
  const scrollBefore = await page.evaluate(() => window.scrollY);
  await page.evaluate(() => {
    if (window.lenis) {
      window.lenis.scrollTo('#accompagnements', { duration: 1.0 });
    }
  });
  await new Promise(r => setTimeout(r, 1200));
  const scrollAfter = await page.evaluate(() => window.scrollY);
  console.log(`Scroll position before: ${scrollBefore}px -> after: ${scrollAfter}px`);

  await browser.close();
}

testLenis().catch(console.error);
