// src/lib/html-to-markdown.ts
// Shared HTML-to-Markdown conversion helpers used by both Cloudflare Pages
// middleware (functions/_middleware.ts) and the edge Worker
// (workers/markdown-negotiation.ts).

export const DEFAULT_CONTENT_SIGNAL = "ai-train=no, search=yes, ai-input=yes";

// Headers for a Markdown body built from another response. The source's
// length, encoding and validators describe a different body, so drop them:
// a stale Content-Length truncates or stalls the download, and a shared ETag
// lets caches serve one representation for the other.
export function markdownHeaders(source: Headers): Headers {
  const headers = new Headers(source);
  for (const name of [
    "content-length",
    "content-encoding",
    "etag",
    "last-modified",
  ]) {
    headers.delete(name);
  }
  headers.set("content-type", "text/markdown; charset=utf-8");
  headers.set("vary", "Accept");
  return headers;
}

export function estimateTokens(value: string): number {
  const words = value.trim().split(/\s+/).filter(Boolean);
  return Math.max(1, Math.ceil(words.length * 1.2));
}

export function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_m, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_m, code) =>
      String.fromCodePoint(parseInt(code, 16)),
    );
}

export function cleanText(value: string): string {
  return decodeHtmlEntities(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMetaValue(html: string, name: string): string | null {
  const patterns = [
    new RegExp(
      `<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+property=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["'][^>]*>`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${name}["'][^>]*>`,
      "i",
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return cleanText(match[1]);
    }
  }

  return null;
}

export function extractFrontmatter(
  html: string,
  { includeImage = false }: { includeImage?: boolean } = {},
): string {
  const title =
    html
      .match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
      ?.replace(/<[^>]+>/g, "")
      .trim() ||
    extractMetaValue(html, "title") ||
    extractMetaValue(html, "og:title") ||
    "";
  const description =
    extractMetaValue(html, "description") ||
    extractMetaValue(html, "og:description") ||
    "";
  const image = includeImage ? (extractMetaValue(html, "og:image") ?? "") : "";

  const rows: string[] = [];
  if (title) rows.push(`title: ${title.replace(/\n+/g, " ")}`);
  if (description)
    rows.push(`description: ${description.replace(/\n+/g, " ")}`);
  if (image) rows.push(`image: ${image}`);

  return rows.length > 0 ? `---\n${rows.join("\n")}\n---\n\n` : "";
}

export function extractJsonLdBlocks(html: string): string[] {
  const blocks: string[] = [];
  const matches = [
    ...html.matchAll(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ];
  for (const match of matches) {
    const json = match[1]?.trim();
    if (json) blocks.push(`\n\n\`\`\`json\n${json}\n\`\`\``);
  }
  return blocks;
}

// The page content lives in <main>; everything outside it (the <head> title,
// skip link, site header and search dialog, footer, consent banner) is chrome.
function extractMainContent(html: string): string {
  const main = html.match(/<main\b[^>]*>([\s\S]*)<\/main>/i)?.[1];
  if (main) return main;
  return html.replace(/<head\b[\s\S]*?<\/head>/i, " ");
}

export function convertHtmlToMarkdown(html: string): string {
  let body = extractMainContent(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<aside[\s\S]*?<\/aside>/gi, " ")
    .replace(/<form[\s\S]*?<\/form>/gi, " ")
    // Links first, so the paragraph, list and heading passes below (which
    // flatten inner tags) keep them as Markdown links.
    .replace(
      /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
      (_match, href, text) => {
        const label = cleanText(text);
        return label && href ? `[${label}](${href})` : label || "";
      },
    )
    .replace(
      /<h1[^>]*>([\s\S]*?)<\/h1>/gi,
      (_match, text) => `\n\n# ${cleanText(text)}\n\n`,
    )
    .replace(
      /<h2[^>]*>([\s\S]*?)<\/h2>/gi,
      (_match, text) => `\n\n## ${cleanText(text)}\n\n`,
    )
    .replace(
      /<h3[^>]*>([\s\S]*?)<\/h3>/gi,
      (_match, text) => `\n\n### ${cleanText(text)}\n\n`,
    )
    .replace(
      /<h4[^>]*>([\s\S]*?)<\/h4>/gi,
      (_match, text) => `\n\n#### ${cleanText(text)}\n\n`,
    )
    .replace(
      /<h5[^>]*>([\s\S]*?)<\/h5>/gi,
      (_match, text) => `\n\n##### ${cleanText(text)}\n\n`,
    )
    .replace(
      /<h6[^>]*>([\s\S]*?)<\/h6>/gi,
      (_match, text) => `\n\n###### ${cleanText(text)}\n\n`,
    )
    .replace(
      /<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi,
      (_match, text) => `\n> ${cleanText(text)}\n\n`,
    )
    .replace(
      /<li[^>]*>([\s\S]*?)<\/li>/gi,
      (_match, text) => `\n- ${cleanText(text)}`,
    )
    .replace(
      /<p[^>]*>([\s\S]*?)<\/p>/gi,
      (_match, text) => `\n\n${cleanText(text)}\n\n`,
    )
    .replace(
      /<strong[^>]*>([\s\S]*?)<\/strong>/gi,
      (_match, text) => `**${cleanText(text)}**`,
    )
    .replace(
      /<b[^>]*>([\s\S]*?)<\/b>/gi,
      (_match, text) => `**${cleanText(text)}**`,
    )
    .replace(
      /<em[^>]*>([\s\S]*?)<\/em>/gi,
      (_match, text) => `*${cleanText(text)}*`,
    )
    .replace(
      /<i[^>]*>([\s\S]*?)<\/i>/gi,
      (_match, text) => `*${cleanText(text)}*`,
    )
    .replace(
      /<code[^>]*>([\s\S]*?)<\/code>/gi,
      (_match, text) => `\`${cleanText(text)}\``,
    )
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ");

  body = decodeHtmlEntities(body)
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\n\s*\n\s*-/g, "\n-")
    .replace(/\n\s*\n\s*\*/g, "\n*")
    .replace(/\n{2,}/g, "\n\n")
    .trim();

  return body;
}
