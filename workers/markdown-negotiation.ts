import {
  DEFAULT_CONTENT_SIGNAL,
  cleanText,
  convertHtmlToMarkdown,
  estimateTokens,
  extractFrontmatter,
  extractJsonLdBlocks,
} from "../src/lib/html-to-markdown";

type Env = {
  UPSTREAM_ORIGIN?: string;
  DEFAULT_CONTENT_SIGNAL?: string;
};

function isMarkdownRequested(request: Request): boolean {
  const accept = request.headers.get("accept") ?? "";
  return /text\/markdown/i.test(accept);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Normal browser requests or non-safe methods pass directly through to origin
    if (
      !isMarkdownRequested(request) ||
      (request.method !== "GET" && request.method !== "HEAD")
    ) {
      return fetch(request);
    }

    // Pass the request to the origin (Cloudflare Pages), which executes functions/_middleware.ts
    // or serves the page. Using fetch(request) preserves Cloudflare internal routing without
    // triggering WAF 403 subrequest loops.
    const originResponse = await fetch(request);

    // If origin already responded with markdown (via functions/_middleware.ts or static markdown),
    // return it directly.
    const contentType = originResponse.headers.get("content-type") ?? "";
    if (contentType.includes("text/markdown")) {
      return originResponse;
    }

    // If origin succeeded with HTML, convert HTML to clean Markdown fallback
    if (
      originResponse.ok &&
      /text\/html|application\/xhtml\+xml/i.test(contentType)
    ) {
      const html = await originResponse.text();
      const markdown =
        `${extractFrontmatter(html, { includeImage: true })}${convertHtmlToMarkdown(html)}${extractJsonLdBlocks(html).join("\n")}`.trim() +
        "\n";
      const strippedText = cleanText(html);
      const headers = new Headers(originResponse.headers);

      headers.set("content-type", "text/markdown; charset=utf-8");
      headers.set("vary", "Accept");
      headers.set(
        "content-signal",
        env.DEFAULT_CONTENT_SIGNAL ?? DEFAULT_CONTENT_SIGNAL,
      );
      headers.set("x-markdown-tokens", String(estimateTokens(markdown)));
      headers.set("x-original-tokens", String(estimateTokens(strippedText)));

      return new Response(request.method === "HEAD" ? null : markdown, {
        status: originResponse.status,
        statusText: originResponse.statusText,
        headers,
      });
    }

    return originResponse;
  },
};
