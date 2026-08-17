import puppeteer from "puppeteer";
import fs from "fs";

const browser = await puppeteer.launch({
  headless: true
});

const page = await browser.newPage();

await page.setViewport({
  width: 1440,
  height: 1000
});

console.log("1/4 - Ouverture du site...");

await page.goto("https://atmawell.webflow.io/", {
  waitUntil: "networkidle2",
  timeout: 60000
});

console.log("2/4 - Scroll de la page...");

await page.evaluate(async () => {
  await new Promise((resolve) => {
    let totalHeight = 0;

    const timer = setInterval(() => {
      window.scrollBy(0, 700);
      totalHeight += 700;

      if (totalHeight >= document.body.scrollHeight) {
        clearInterval(timer);
        resolve();
      }
    }, 300);
  });
});

await new Promise((r) => setTimeout(r, 3000));

console.log("3/4 - Sauvegarde HTML...");

const html = await page.content();

fs.mkdirSync("./rendered", {
  recursive: true
});

fs.writeFileSync("./rendered/index.html", html);

await page.screenshot({
  path: "./rendered/reference.png",
  fullPage: true
});

await browser.close();

console.log("4/4 - Terminé");
