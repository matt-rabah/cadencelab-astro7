// functions/_middleware.ts
// Cloudflare Pages middleware for AI Agent Markdown Content Negotiation.
// When an incoming request includes `Accept: text/markdown`, returns a clean
// Markdown version with Content-Type: text/markdown, Vary: Accept, and x-markdown-tokens.
// Human browser requests without text/markdown continue to receive regular HTML.
// https://isitagentready.com/.well-known/agent-skills/markdown-negotiation/SKILL.md
// https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/

interface Env {
  UPSTREAM_ORIGIN?: string;
  DEFAULT_CONTENT_SIGNAL?: string;
  [key: string]: unknown;
}

interface EventContext {
  request: Request;
  functionPath: string;
  waitUntil: (promise: Promise<unknown>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  env: Env;
  params: Record<string, string | string[]>;
  data: Record<string, unknown>;
}

const DEFAULT_CONTENT_SIGNAL = "ai-train=no, search=yes, ai-input=yes";

function estimateTokens(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return Math.max(1, Math.ceil(words.length * 1.2));
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;/gi, "'")
    .replace(/&apos;/gi, "'");
}

function cleanText(value: string): string {
  return decodeHtmlEntities(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMeta(html: string, name: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+property=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${name}["'][^>]*>`, "i"),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return cleanText(match[1]);
    }
  }

  return null;
}

function extractFrontmatter(html: string): string {
  const title =
    html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<[^>]+>/g, "").trim() ||
    extractMeta(html, "title") ||
    extractMeta(html, "og:title") ||
    "";
  const description =
    extractMeta(html, "description") ||
    extractMeta(html, "og:description") ||
    "";

  const rows: string[] = [];
  if (title) rows.push(`title: ${title.replace(/\n+/g, " ")}`);
  if (description) rows.push(`description: ${description.replace(/\n+/g, " ")}`);

  return rows.length > 0 ? `---\n${rows.join("\n")}\n---\n\n` : "";
}

function convertHtmlToMarkdown(html: string): string {
  let body = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<aside[\s\S]*?<\/aside>/gi, " ")
    .replace(/<form[\s\S]*?<\/form>/gi, " ")
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_match, text) => `\n\n# ${cleanText(text)}\n\n`)
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_match, text) => `\n\n## ${cleanText(text)}\n\n`)
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_match, text) => `\n\n### ${cleanText(text)}\n\n`)
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_match, text) => `\n\n#### ${cleanText(text)}\n\n`)
    .replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, (_match, text) => `\n\n##### ${cleanText(text)}\n\n`)
    .replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, (_match, text) => `\n\n###### ${cleanText(text)}\n\n`)
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_match, text) => `\n> ${cleanText(text)}\n\n`)
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_match, text) => `\n- ${cleanText(text)}`)
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_match, text) => `\n\n${cleanText(text)}\n\n`)
    .replace(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_match, href, text) => {
      const label = cleanText(text);
      return label && href ? `[${label}](${href})` : label || "";
    })
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, (_match, text) => `**${cleanText(text)}**`)
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, (_match, text) => `**${cleanText(text)}**`)
    .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, (_match, text) => `*${cleanText(text)}*`)
    .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, (_match, text) => `*${cleanText(text)}*`)
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_match, text) => `\`${cleanText(text)}\``)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ");

  body = body
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\n\s*\n\s*-/g, "\n-")
    .replace(/\n{2,}/g, "\n\n")
    .trim();

  return body;
}

export const onRequest = async (context: EventContext): Promise<Response> => {
  const { request, next } = context;
  const accept = request.headers.get("accept") ?? "";
  const wantsMarkdown = /text\/markdown/i.test(accept);

  // Non-markdown requests and non-safe methods pass directly to standard handling
  if (!wantsMarkdown || (request.method !== "GET" && request.method !== "HEAD")) {
    return next();
  }

  const url = new URL(request.url);

  // Attempt to load pre-rendered markdown from static assets first
  const normalizedPath = url.pathname.replace(/\/$/, "") || "/index";
  const candidatePaths = [
    `/.agent-md${normalizedPath}.md`,
    `/.agent-md${url.pathname === "/" ? "/index" : url.pathname}.md`,
    `/markdown${normalizedPath}.md`,
  ];

  for (const candidate of candidatePaths) {
    try {
      const mdRequest = new Request(new URL(candidate, request.url), {
        method: "GET",
        headers: { accept: "text/markdown" },
      });
      const candidateResponse = await next(mdRequest);
      if (candidateResponse.ok) {
        const text = await candidateResponse.text();
        if (text.trim()) {
          const tokens = estimateTokens(text);
          const headers = new Headers(candidateResponse.headers);
          headers.set("content-type", "text/markdown; charset=utf-8");
          headers.set("vary", "Accept");
          headers.set("x-markdown-tokens", String(tokens));
          headers.set("content-signal", DEFAULT_CONTENT_SIGNAL);
          return new Response(request.method === "HEAD" ? null : text, {
            status: 200,
            headers,
          });
        }
      }
    } catch {
      // Continue to next candidate or fallback
    }
  }

  // Fall back to fetching regular page and converting HTML to markdown
  const response = await next();
  if (!response.ok) {
    return response;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!/text\/html|application\/xhtml\+xml/i.test(contentType)) {
    return response;
  }

  const html = await response.text();
  const frontmatter = extractFrontmatter(html);
  const markdownBody = convertHtmlToMarkdown(html);
  const markdown = `${frontmatter}${markdownBody}`.trim() + "\n";
  const tokens = estimateTokens(markdown);

  const headers = new Headers(response.headers);
  headers.set("content-type", "text/markdown; charset=utf-8");
  headers.set("vary", "Accept");
  headers.set("x-markdown-tokens", String(tokens));
  headers.set("content-signal", DEFAULT_CONTENT_SIGNAL);

  return new Response(request.method === "HEAD" ? null : markdown, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

