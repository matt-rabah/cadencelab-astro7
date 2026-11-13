import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const distDir = path.join(root, "dist");
const outDirs = [
  path.join(root, ".agent-md"),
  path.join(distDir, ".agent-md"),
  path.join(distDir, "markdown"),
];

function cleanText(value) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<aside[\s\S]*?<\/aside>/gi, " ")
    .replace(/<form[\s\S]*?<\/form>/gi, " ")
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n\n# $1\n\n")
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n\n## $1\n\n")
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n\n### $1\n\n")
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "\n\n#### $1\n\n")
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "\n\n$1\n\n")
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "\n- $1")
    .replace(
      /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
      "[$2]($1)",
    )
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**")
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**")
    .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "*$1*")
    .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, "*$1*")
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

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
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const descriptionMatch =
      html.match(
        /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      ) ??
      html.match(
        /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      );

    const markdownParts = [];
    if (titleMatch?.[1]) {
      const title = titleMatch[1]
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim();
      markdownParts.push(`---\ntitle: ${title}\n---\n\n`);
    }
    if (descriptionMatch?.[1]) {
      markdownParts.push(
        `${descriptionMatch[1].replace(/\s+/g, " ").trim()}\n\n`,
      );
    }

    const body = cleanText(html);
    markdownParts.push(body ? `${body}\n` : "");
    const markdown = markdownParts.join("\n").trim() + "\n";

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
