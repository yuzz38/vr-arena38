import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.dirname(fileURLToPath(import.meta.url));
const input = process.argv[2];
if (!input)
  throw Error(
    "Укажите HTTPS-домен: node configure-domain.mjs https://ваш-домен.ru/",
  );
const base = new URL(input);
if (
  base.protocol !== "https:" ||
  base.username ||
  base.password ||
  base.hash ||
  base.search
)
  throw Error("Нужен HTTPS URL без параметров");
if (!base.pathname.endsWith("/")) base.pathname += "/";
const esc = (s) =>
  s.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
let html = fs.readFileSync(path.join(root, "index.html"), "utf8");
html = html
  .replace(/\s*<link\s+rel="canonical"[^>]*>/g, "")
  .replace(/\s*<meta\s+property="og:url"[^>]*>/g, "");
html = html.replace(
  "</head>",
  '<link rel="canonical" href="' +
    esc(base.href) +
    '"><meta property="og:url" content="' +
    esc(base.href) +
    '"></head>',
);
html = html.replace(
  /(<meta\s+property="og:image"\s+content=")[^"]*("\s*\/?\s*>)/,
  "$1" + esc(new URL("assets/share.jpg", base).href) + "$2",
);
fs.writeFileSync(path.join(root, "index.html"), html);
fs.writeFileSync(
  path.join(root, "robots.txt"),
  "User-agent: *\nAllow: /\nSitemap: " +
    new URL("sitemap.xml", base).href +
    "\n",
);
fs.writeFileSync(
  path.join(root, "sitemap.xml"),
  '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>' +
    esc(base.href) +
    "</loc></url></urlset>",
);
console.log("Домен настроен: " + base.href);
