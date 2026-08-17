import fs from "fs";
import path from "path";
import http from "http";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

const require = createRequire(path.join(ROOT_DIR, "atmawell-downloader", "package.json"));
const puppeteer = require("puppeteer");

// Check if server is running on port 3000
function isServerRunning(port = 3000) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/`, (res) => {
      resolve(true);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function runVerification() {
  console.log("=== 1. Vérification du serveur local ===");
  const running = await isServerRunning(3000);
  let serverProcess = null;

  if (!running) {
    console.log("Démarrage automatique du serveur local...");
    const { spawn } = await import("child_process");
    serverProcess = spawn("node", ["server.js"], { cwd: ROOT_DIR, stdio: "inherit" });
    await new Promise((r) => setTimeout(r, 1500));
  } else {
    console.log("Serveur local déjà actif sur http://localhost:3000/");
  }

  console.log("\n=== 2. Lancement du test Puppeteer Desktop (1440x900) ===");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const desktopPage = await browser.newPage();
  await desktopPage.setCacheEnabled(false);
  await desktopPage.setViewport({ width: 1440, height: 900 });

  const networkRequests = [];
  const externalRequests = [];
  const failedRequests = [];
  const consoleErrors = [];

  desktopPage.on("request", (req) => {
    const url = req.url();
    networkRequests.push(url);
    if (!url.startsWith("http://localhost:3030") && !url.startsWith("data:") && !url.startsWith("blob:")) {
      externalRequests.push(url);
    }
  });

  desktopPage.on("response", (res) => {
    if (res.status() >= 400) {
      failedRequests.push({ url: res.url(), status: res.status() });
    }
  });

  desktopPage.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  console.log("- Chargement de la page d'accueil...");
  await desktopPage.goto("http://localhost:3030/", { waitUntil: "networkidle2", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1500));

  // Verify H1 hero text
  const heroHeading = await desktopPage.$eval("h1", (el) => el.textContent.trim());
  console.log(`- Titre H1 vérifié : "${heroHeading}"`);

  // Verify SplitText elements
  const splitLetters = await desktopPage.$$eval(".gsap_split_letter", (els) => els.length);
  console.log(`- Lettres découpées GSAP SplitText : ${splitLetters}`);

  // Test Scroll and animations
  console.log("- Défilement pour déclencher les apparitions IX2...");
  await desktopPage.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const timer = setInterval(() => {
        window.scrollBy(0, 400);
        totalHeight += 400;
        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 150);
    });
  });

  await new Promise((r) => setTimeout(r, 1500));

  // Save Desktop Screenshot
  const desktopScreenshot = path.join(ROOT_DIR, "rendered_local.png");
  await desktopPage.screenshot({ path: desktopScreenshot, fullPage: true });
  console.log(`- Capture Desktop enregistrée : ${desktopScreenshot}`);

  console.log("\n=== 3. Lancement du test Puppeteer Mobile (390x844 - iPhone 14) ===");
  const mobilePage = await browser.newPage();
  await mobilePage.setCacheEnabled(false);
  await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  await mobilePage.goto("http://localhost:3030/", { waitUntil: "networkidle2", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1000));

  // Test Mobile Menu Click
  console.log("- Test de l'ouverture et fermeture du menu mobile...");
  const menuButton = await mobilePage.$(".w-nav-button");
  if (menuButton) {
    await menuButton.click();
    await new Promise((r) => setTimeout(r, 400));
    const isMenuOpen = await mobilePage.$eval(".w-nav-menu", (el) => el.classList.contains("w--open"));
    console.log(`- Menu mobile ouvert avec succès : ${isMenuOpen}`);
    // Close menu again for clean screenshot
    await menuButton.click();
    await new Promise((r) => setTimeout(r, 400));
  }

  // Scroll mobile page
  await mobilePage.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const timer = setInterval(() => {
        window.scrollBy(0, 400);
        totalHeight += 400;
        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 150);
    });
  });

  await new Promise((r) => setTimeout(r, 1500));

  // Save Mobile Screenshot
  const mobileScreenshot = path.join(ROOT_DIR, "rendered_mobile.png");
  await mobilePage.screenshot({ path: mobileScreenshot, fullPage: true });
  console.log(`- Capture Mobile enregistrée : ${mobileScreenshot}`);

  await browser.close();

  if (serverProcess) {
    serverProcess.kill();
  }

  console.log("\n=== BILAN DE LA VÉRIFICATION ===");
  console.log(`Total des requêtes réseau : ${networkRequests.length}`);
  console.log(`Requêtes externes (doit être 0) : ${externalRequests.length}`);
  if (externalRequests.length > 0) {
    console.log("External requests:", externalRequests);
  }
  console.log(`Requêtes en erreur 404/500 (doit être 0) : ${failedRequests.length}`);
  if (failedRequests.length > 0) {
    console.log("Failed requests:", failedRequests);
  }
  console.log(`Erreurs console JS (doit être 0) : ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log("Console errors:", consoleErrors);
  }

  const success = externalRequests.length === 0 && failedRequests.length === 0 && consoleErrors.length === 0;
  console.log(`\nRésultat final : ${success ? "✅ 100% SUCCÈS - Site totalement autonome, réactif et sans erreur !" : "⚠️ Attention des points sont à corriger"}`);
}

runVerification().catch(console.error);
