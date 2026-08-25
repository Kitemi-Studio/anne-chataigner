import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const indexHtml = fs.readFileSync(path.join(ROOT, "index.html"), "utf-8");

// Extract content between <main id="main-content"> and </main>
const mainStart = indexHtml.indexOf('<main id="main-content">');
const mainEnd = indexHtml.indexOf('</main>') + '</main>'.length;

if (mainStart === -1 || mainEnd === -1) {
  console.error("Could not find <main> tags in index.html");
  process.exit(1);
}

const mainContent = indexHtml.substring(mainStart, mainEnd);

const astroPageContent = `---
import Layout from '../layouts/Layout.astro';
import Navbar from '../components/Navbar.astro';
import Footer from '../components/Footer.astro';
---

<Layout 
  title="Anne Chataigner — Coaching · Thérapies brèves · Hypnose Ericksonienne"
  description="Quand la vie change, retrouver un chemin qui vous ressemble. Accompagnements individuels en coaching, thérapies brèves et hypnose Ericksonienne à Voisins-le-Bretonneux."
>
  <Navbar slot="navbar" />

  ${mainContent}

  <Footer slot="footer" />
</Layout>
`;

fs.writeFileSync(path.join(ROOT, "src", "pages", "index.astro"), astroPageContent);
console.log("✅ Successfully generated src/pages/index.astro from index.html!");
