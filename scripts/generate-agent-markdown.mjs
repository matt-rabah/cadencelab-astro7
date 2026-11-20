import fs from "node:fs";
import path from "node:path";
// One converter for the pre-rendered files, the Pages middleware and the
// worker, so agents get the same Markdown however they ask for it.
// Node 22.18+ strips TypeScript types on import.
import {
  convertHtmlToMarkdown,
  extractFrontmatter,
} from "../src/lib/html-to-markdown.ts";

const root = process.cwd();
const distDir = path.join(root, "dist");
const outDirs = [
  path.join(root, ".agent-md"),
  path.join(distDir, ".agent-md"),
  path.join(distDir, "markdown"),
];

function writeMarkdownFile(targetDir, subPath, content) {
  const fullPath = path.join(targetDir, subPath);
  const dirName = path.dirname(fullPath);
  fs.mkdirSync(dirName, { recursive: true });
  fs.writeFileSync(fullPath, content, "utf8");
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Don't recurse into generated markdown folders if they exist in dist
      if (entry.name === ".agent-md" || entry.name === "markdown") continue;
      walk(full);
      continue;
    }
    if (!entry.isFile() || !/\.html$/i.test(entry.name)) continue;

    const relative = path.relative(distDir, full).replace(/\\/g, "/");

    const html = fs.readFileSync(full, "utf8");
    const markdown =
      `${extractFrontmatter(html)}${convertHtmlToMarkdown(html)}`.trim() + "\n";

    // Write to all designated directories
    for (const targetDir of outDirs) {
      if (relative === "index.html") {
        writeMarkdownFile(targetDir, "index.md", markdown);
      } else if (relative.endsWith("/index.html")) {
        const base = relative.slice(0, -"/index.html".length);
        writeMarkdownFile(targetDir, `${base}.md`, markdown);
        writeMarkdownFile(targetDir, `${base}/index.md`, markdown);
      } else {
        const mdPath = relative.replace(/\.html$/i, ".md");
        writeMarkdownFile(targetDir, mdPath, markdown);
      }
    }
  }
}

if (!fs.existsSync(distDir)) {
  console.error("dist not found; run astro build first");
  process.exit(1);
}

for (const dir of outDirs) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

walk(distDir);
console.log(`Generated agent markdown under: ${outDirs.join(", ")}`);
