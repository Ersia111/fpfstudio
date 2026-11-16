import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync } from "fs";

writeFileSync("src/main.jsx", `import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
createRoot(document.getElementById("root")).render(<App />);
`);
const r = await build({
  entryPoints: ["src/main.jsx"], bundle: true, minify: true, write: false,
  format: "iife", jsx: "automatic", define: { "process.env.NODE_ENV": '"production"' },
});
const js = r.outputFiles[0].text.replace(/<\/script/g, "<\\/script");
const css = readFileSync("src/styles.css", "utf8");
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ersia Shemilli · FPF Studio</title>
<meta name="description" content="Ersia Shemilli — social media specialist, marketing expert and Higgsfield AI video director.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400;1,6..96,500&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<style>${css}</style>
</head>
<body>
<div id="root"></div>
<script>${js}</script>
</body>
</html>`;
rmSync("dist", { recursive: true, force: true });
mkdirSync("dist", { recursive: true });
cpSync("media", "dist/media", { recursive: true });
writeFileSync("dist/index.html", html);
console.log("ok", (html.length / 1024).toFixed(0) + "KB");
