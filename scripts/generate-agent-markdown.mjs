import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const distDir = path.join(root, "dist");
const outDir = path.join(root, ".agent-md");

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (!entry.isFile() || !/\.html$/i.test(entry.name)) continue;

    const relative = path.relative(distDir, full).replace(/\\/g, "/");
    let markdownPath = relative.replace(/\.html$/i, ".md");
    if (markdownPath === "index.html") markdownPath = "index.md";

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
      markdownParts.push(
        `---\ntitle: ${titleMatch[1]
          .replace(/<[^>]+>/g, "")
          .replace(/\s+/g, " ")
          .trim()}\n---\n\n`,
      );
    }
    if (descriptionMatch?.[1]) {
      markdownParts.push(
        `${descriptionMatch[1].replace(/\s+/g, " ").trim()}\n\n`,
      );
    }

    const body = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<header[\s\S]*?<\/header>/gi, " ")
      .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
      .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
      .replace(/<aside[\s\S]*?<\/aside>/gi, " ")
      .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n\n# $1\n\n")
      .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n\n## $1\n\n")
      .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n\n### $1\n\n")
      .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "\n\n$1\n\n")
      .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "\n- $1")
      .replace(
        /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
        "[$2]($1)",
      )
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/\s+/g, " ")
      .trim();

    markdownParts.push(body ? `${body}\n` : "");
    const markdown = markdownParts.join("\n").trim() + "\n";

    const outputPath = path.join(outDir, markdownPath.replace(/\/[^/]+$/, ""));
    fs.mkdirSync(outputPath, { recursive: true });
    fs.writeFileSync(
      path.join(outputPath, path.basename(markdownPath)),
      markdown,
      "utf8",
    );
  }
}

if (!fs.existsSync(distDir)) {
  console.error("dist not found; run astro build first");
  process.exit(1);
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
walk(distDir);
console.log(`Generated agent markdown under ${outDir}`);
