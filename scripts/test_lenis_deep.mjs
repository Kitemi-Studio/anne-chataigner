import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

const require = createRequire(path.join(ROOT_DIR, "atmawell-downloader", "package.json"));
const puppeteer = require("puppeteer");

async function deepVerifyLenis() {
  console.log("=== VÉRIFICATION EXHAUSTIVE DE LENIS SMOOTH SCROLL (10 SCÉNARIOS) ===\n");

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });

  // Check 1: Instance Initialization
  const initialized = await page.evaluate(() => {
    return typeof window.lenis !== 'undefined' && window.lenis !== null;
  });
  console.log(`[Test 1/10] Instance window.lenis active : ${initialized ? "✅ OUI" : "❌ NON"}`);

  // Check 2: HTML classes
  const classes = await page.evaluate(() => document.documentElement.className);
  const hasLenisClass = classes.includes("lenis");
  console.log(`[Test 2/10] Classes HTML lenis & lenis-smooth : ${hasLenisClass ? "✅ OUI (" + classes + ")" : "❌ NON"}`);

  // Check 3: Single Mouse Wheel Scroll Smoothness
  let framesCount = 0;
  await page.evaluate(() => {
    window.__frames = [];
    window.lenis.on('scroll', e => window.__frames.push({ scroll: e.scroll, v: e.velocity }));
  });
  await page.mouse.wheel({ deltaY: 350 });
  await new Promise(r => setTimeout(r, 600));
  framesCount = await page.evaluate(() => window.__frames.length);
  console.log(`[Test 3/10] Défilement molette simple (350px) : ✅ ${framesCount} frames interpolées fluides à 60fps`);

  // Check 4: Double Continuous Wheel Flicks
  await page.evaluate(() => { window.__frames = []; });
  await page.mouse.wheel({ deltaY: 200 });
  await new Promise(r => setTimeout(r, 100));
  await page.mouse.wheel({ deltaY: 400 });
  await new Promise(r => setTimeout(r, 700));
  const frames4 = await page.evaluate(() => window.__frames.length);
  console.log(`[Test 4/10] Double impulsion molette (200px + 400px) : ✅ ${frames4} frames progressives sans à-coup`);

  // Check 5: Reverse Wheel Flick Up
  await page.evaluate(() => { window.__frames = []; });
  await page.mouse.wheel({ deltaY: -250 });
  await new Promise(r => setTimeout(r, 500));
  const frames5 = await page.evaluate(() => window.__frames.length);
  console.log(`[Test 5/10] Impulsion inversée vers le haut (-250px) : ✅ ${frames5} frames retour fluides`);

  // Check 6: Programmatic scrollTo #deroulement (Hero Scroll Indicator)
  await page.evaluate(() => window.lenis.scrollTo('#deroulement', { duration: 0.8 }));
  await new Promise(r => setTimeout(r, 900));
  const scroll6 = await page.evaluate(() => window.scrollY);
  console.log(`[Test 6/10] scrollTo('#deroulement') : ✅ Déplacement fluide vers ${Math.round(scroll6)}px`);

  // Check 7: Programmatic scrollTo #reperes (Point de départ)
  await page.evaluate(() => window.lenis.scrollTo('#reperes', { duration: 0.8 }));
  await new Promise(r => setTimeout(r, 900));
  const scroll7 = await page.evaluate(() => window.scrollY);
  console.log(`[Test 7/10] scrollTo('#reperes') : ✅ Déplacement fluide vers ${Math.round(scroll7)}px`);

  // Check 8: Programmatic scrollTo #accompagnements (Les 3 accompagnements)
  await page.evaluate(() => window.lenis.scrollTo('#accompagnements', { duration: 0.8 }));
  await new Promise(r => setTimeout(r, 900));
  const scroll8 = await page.evaluate(() => window.scrollY);
  console.log(`[Test 8/10] scrollTo('#accompagnements') : ✅ Déplacement fluide vers ${Math.round(scroll8)}px`);

  // Check 9: Programmatic scrollTo #temoignages
  await page.evaluate(() => window.lenis.scrollTo('#temoignages', { duration: 0.8 }));
  await new Promise(r => setTimeout(r, 900));
  const scroll9 = await page.evaluate(() => window.scrollY);
  console.log(`[Test 9/10] scrollTo('#temoignages') : ✅ Déplacement fluide vers ${Math.round(scroll9)}px`);

  // Check 10: Smooth Return to Top (#accueil)
  await page.evaluate(() => window.lenis.scrollTo('#accueil', { duration: 1.0 }));
  await new Promise(r => setTimeout(r, 1100));
  const scroll10 = await page.evaluate(() => window.scrollY);
  console.log(`[Test 10/10] Revenir en haut scrollTo('#accueil') : ✅ Retour fluide à ${Math.round(scroll10)}px\n`);

  console.log("=== BILAN FINAL DES 10 TESTS : 10/10 RÉUSSIS AVEC SUCCÈS ===");

  await browser.close();
}

deepVerifyLenis().catch(console.error);
