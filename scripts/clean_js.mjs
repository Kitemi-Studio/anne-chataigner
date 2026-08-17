import fs from "fs";

let js = fs.readFileSync("assets/js/webflow.schunk.483349798732e2a7.js", "utf8");

// Neutralize badge
const badgePattern = /function\s+f\(\)\{var e=o\.children\("\.w-webflow-badge"\)[\s\S]*?c\.on\("page:unload",f\)\}/;
if (badgePattern.test(js)) {
  console.log("Found badge module, neutralizing it...");
  js = js.replace(badgePattern, "function f(){e('.w-webflow-badge').remove()}return n.ready=function(){e('.w-webflow-badge').remove()}");
}

// Remove any remaining badge links / cloudfront SVGs
js = js.replaceAll("https://webflow.com?utm_campaign=brandjs", "#");
js = js.replaceAll("https://d3e54v103j8qbb.cloudfront.net/img/webflow-badge-icon-d2.89e12c322e.svg", "");
js = js.replaceAll("https://d3e54v103j8qbb.cloudfront.net/img/webflow-badge-text-d2.c82cec3b78.svg", "");

// Ensure form submissions locally show success without throwing errors or network failures
// Search for `c="https://webflow.com/api/v1/form/"`
if (js.includes("https://webflow.com/api/v1/form/")) {
  console.log("Adjusting form handler for smooth local submissions...");
  js = js.replaceAll("https://webflow.com/api/v1/form/", "/api/form/");
  js = js.replaceAll("https://formdata.webflow.com", "/api/form");
}

fs.writeFileSync("assets/js/webflow.schunk.483349798732e2a7.js", js, "utf8");
console.log("Done updating webflow.schunk.483349798732e2a7.js");
