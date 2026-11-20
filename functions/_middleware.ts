// functions/_middleware.ts
// Cloudflare Pages middleware for AI Agent Markdown Content Negotiation.
// When an incoming request includes `Accept: text/markdown`, returns a clean
// Markdown version with Content-Type: text/markdown, Vary: Accept, and x-markdown-tokens.
// Human browser requests without text/markdown continue to receive regular HTML.
// https://isitagentready.com/.well-known/agent-skills/markdown-negotiation/SKILL.md
// https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/

import {
  DEFAULT_CONTENT_SIGNAL,
  convertHtmlToMarkdown,
  estimateTokens,
  extractFrontmatter,
  markdownHeaders,
} from "../src/lib/html-to-markdown";

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

export const onRequest = async (context: EventContext): Promise<Response> => {
  const { request, next } = context;
  const accept = request.headers.get("accept") ?? "";
  const wantsMarkdown = /text\/markdown/i.test(accept);

  // Non-markdown requests and non-safe methods pass directly to standard handling
  if (
    !wantsMarkdown ||
    (request.method !== "GET" && request.method !== "HEAD")
  ) {
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
      const candidateType = candidateResponse.headers.get("content-type") ?? "";
      if (
        candidateResponse.ok &&
        !/text\/html|application\/xhtml\+xml/i.test(candidateType)
      ) {
        const text = await candidateResponse.text();
        if (text.trim()) {
          const tokens = estimateTokens(text);
          const headers = markdownHeaders(candidateResponse.headers);
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

  const headers = markdownHeaders(response.headers);
  headers.set("x-markdown-tokens", String(tokens));
  headers.set("content-signal", DEFAULT_CONTENT_SIGNAL);

  return new Response(request.method === "HEAD" ? null : markdown, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};
