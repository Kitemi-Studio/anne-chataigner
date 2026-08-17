import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const require = createRequire(path.join(ROOT_DIR, "atmawell-downloader", "package.json"));
const puppeteer = require("puppeteer");

async function testButtonHover() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on("pageerror", (err) => console.log("PAGE ERROR:", err.message));
  page.on("console", (msg) => {
    console.log("CONSOLE:", msg.type(), msg.text());
  });

  page.on("response", (res) => {
    if (res.url().includes("anne-init")) {
      console.log("Script anne-init.js status:", res.status(), "size:", res.headers()["content-length"]);
    }
  });

  await page.goto("http://localhost:3000/", { waitUntil: "networkidle0" });

  const globalInfo = await page.evaluate(() => {
    return {
      hasGsap: typeof gsap !== "undefined",
      hasSplitText: typeof SplitText !== "undefined",
      splitTextType: typeof SplitText,
      windowSplitText: typeof window.SplitText
    };
  });
  console.log("Global Info:", globalInfo);

  const buttonInspection = await page.evaluate(async () => {
    const btns = Array.from(document.querySelectorAll(".primary-button"));
    const data = [];

    for (let i = 0; i < btns.length; i++) {
      const btn = btns[i];
      const textEls = btn.querySelectorAll("[button-text]");
      const firstLine = textEls[0];
      const secondLine = textEls[1];

      const firstChars = firstLine ? firstLine.querySelectorAll(".btn-split-char").length : 0;
      const secondChars = secondLine ? secondLine.querySelectorAll(".btn-split-char").length : 0;

      data.push({
        btnIndex: i,
        text: btn.innerText.trim().replace(/\n/g, " / "),
        textElsCount: textEls.length,
        firstChars,
        secondChars
      });
    }

    return data;
  });
  console.log("Button Inspection:", JSON.stringify(buttonInspection, null, 2));

  // Test hover on Hero CTA
  const heroCta = await page.$(".section.hero-anne-full .primary-button");
  if (heroCta) {
    const beforeHover = await page.evaluate(() => {
      const char1 = document.querySelector(".section.hero-anne-full .primary-button [button-text]:first-child .btn-split-char");
      const char2 = document.querySelector(".section.hero-anne-full .primary-button [button-text]:last-child .btn-split-char");
      return {
        char1Transform: char1 ? char1.style.transform : "none",
        char2Transform: char2 ? char2.style.transform : "none"
      };
    });
    console.log("Before Hover:", beforeHover);

    await heroCta.hover();
    await new Promise((r) => setTimeout(r, 450));

    const duringHover = await page.evaluate(() => {
      const char1 = document.querySelector(".section.hero-anne-full .primary-button [button-text]:first-child .btn-split-char");
      const char2 = document.querySelector(".section.hero-anne-full .primary-button [button-text]:last-child .btn-split-char");
      return {
        char1Transform: char1 ? char1.style.transform : "none",
        char2Transform: char2 ? char2.style.transform : "none"
      };
    });
    console.log("During Hover (should be translated UP):", duringHover);

    // Mouse move away
    await page.mouse.move(0, 0);
    await new Promise((r) => setTimeout(r, 450));

    const afterHover = await page.evaluate(() => {
      const char1 = document.querySelector(".section.hero-anne-full .primary-button [button-text]:first-child .btn-split-char");
      const char2 = document.querySelector(".section.hero-anne-full .primary-button [button-text]:last-child .btn-split-char");
      return {
        char1Transform: char1 ? char1.style.transform : "none",
        char2Transform: char2 ? char2.style.transform : "none"
      };
    });
    console.log("After Hover (should be back to initial):", afterHover);
  }

  await browser.close();
}

testButtonHover().catch(console.error);
