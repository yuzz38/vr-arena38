import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.dirname(fileURLToPath(import.meta.url)),
  read = (n) => fs.readFileSync(path.join(root, n), "utf8");
let html = read("index.html");
html = html
  .replace(
    /<link\s+rel="stylesheet"\s+href="fonts.css"\s*\/?>/,
    "<style>" + read("fonts.css") + "</style>",
  )
  .replace(
    /<link\s+rel="stylesheet"\s+href="style.css"\s*\/?>/,
    "<style>" + read("style.css") + "</style>",
  );
html = html
  .replace(/<script\s+src="data.js"\s+defer><\/script>/, "")
  .replace(/<script\s+src="script.js"\s+defer><\/script>/, "");
html = html.replace(
  "</body>",
  '<script>document.addEventListener("DOMContentLoaded",()=>{' +
    read("data.js") +
    "\n" +
    read("script.js") +
    "\n});</script></body>",
);
fs.writeFileSync(path.join(root, "single-file.html"), html);
console.log("single-file.html обновлён");
