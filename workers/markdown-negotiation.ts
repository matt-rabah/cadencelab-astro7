type Env = {
  UPSTREAM_ORIGIN?: string;
  DEFAULT_CONTENT_SIGNAL?: string;
};

const DEFAULT_ORIGIN = "https://cadencelab.co";
const DEFAULT_CONTENT_SIGNAL = "ai-train=no, search=yes, ai-input=yes";

type JsonRecord = Record<string, unknown>;

function jsonResponse(status: number, payload: JsonRecord, headers?: HeadersInit): Response {
  const responseHeaders = new Headers(headers);
  responseHeaders.set("content-type", "application/json; charset=utf-8");
  responseHeaders.set("cache-control", "no-store");
  return new Response(JSON.stringify(payload), {
    status,
    headers: responseHeaders,
  });
}

function getOrigin(env: Env, requestUrl: URL): string {
  if (env.UPSTREAM_ORIGIN) {
    return env.UPSTREAM_ORIGIN;
  }

  return `${requestUrl.protocol}//${requestUrl.host}`;
}

function parseJsonBody(request: Request): Promise<JsonRecord> {
  return request.json().catch(() => ({} as JsonRecord));
}

function getBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function unauthorizedWithDiscovery(origin: string, details?: JsonRecord): Response {
  const headerValue = [
    'Bearer realm="cadencelab"',
    `resource_metadata="${origin}/.well-known/oauth-protected-resource"`,
    'error="invalid_token"',
    'error_description="A valid bearer token is required for this endpoint."',
  ].join(", ");

  return jsonResponse(401, {
    error: "invalid_token",
    error_description: "A valid bearer token is required for this endpoint.",
    ...(details ?? {}),
  }, {
    "WWW-Authenticate": headerValue,
  });
}

async function handleAgentIdentity(request: Request, origin: string): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse(405, {
      error: "method_not_allowed",
      message: "Use POST for agent identity registration.",
    });
  }

  const body = await parseJsonBody(request);
  const identityType = body.identity_type;
  if (identityType !== "anonymous") {
    return jsonResponse(400, {
      error: "unsupported_identity_type",
      identity_types_supported: ["anonymous"],
    });
  }

  const assertion = `cadence-anon-${crypto.randomUUID()}`;
  return jsonResponse(201, {
    identity_type: "anonymous",
    identity_assertion: assertion,
    claim_required: false,
    token_endpoint: `${origin}/oauth2/token`,
    revocation_endpoint: `${origin}/oauth2/revoke`,
    expires_in: 600,
  });
}

async function handleAgentClaim(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse(405, {
      error: "method_not_allowed",
      message: "Use POST for claim confirmation.",
    });
  }

  const body = await parseJsonBody(request);
  const assertion = typeof body.identity_assertion === "string" ? body.identity_assertion : "";
  if (!assertion.startsWith("cadence-anon-")) {
    return jsonResponse(400, {
      error: "invalid_request",
      error_description: "identity_assertion must be issued by /agent/identity.",
    });
  }

  return jsonResponse(200, {
    status: "claimed",
    claimed: true,
    identity_assertion: assertion,
  });
}

async function handleToken(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse(405, {
      error: "method_not_allowed",
      message: "Use POST for token exchange.",
    });
  }

  const contentType = request.headers.get("content-type") ?? "";
  let params: URLSearchParams;

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const form = await request.formData();
    params = new URLSearchParams();
    for (const [key, value] of form.entries()) {
      if (typeof value === "string") {
        params.set(key, value);
      }
    }
  } else {
    const body = await parseJsonBody(request);
    params = new URLSearchParams();
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === "string") {
        params.set(key, value);
      }
    }
  }

  const grantType = params.get("grant_type") ?? "";
  const assertion = params.get("identity_assertion") ?? params.get("assertion") ?? "";

  if (grantType !== "client_credentials" && grantType !== "urn:workos:agent-auth:grant-type:claim") {
    return jsonResponse(400, {
      error: "unsupported_grant_type",
      grant_types_supported: [
        "client_credentials",
        "urn:workos:agent-auth:grant-type:claim",
      ],
    });
  }

  if (grantType === "urn:workos:agent-auth:grant-type:claim" && !assertion.startsWith("cadence-anon-")) {
    return jsonResponse(400, {
      error: "invalid_grant",
      error_description: "Provide an identity_assertion issued by /agent/identity.",
    });
  }

  return jsonResponse(200, {
    token_type: "Bearer",
    access_token: `cadence-public-${crypto.randomUUID()}`,
    expires_in: 3600,
    scope: "public read",
  });
}

async function handleRevoke(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse(405, {
      error: "method_not_allowed",
      message: "Use POST for token revocation.",
    });
  }

  return new Response(null, {
    status: 200,
    headers: {
      "cache-control": "no-store",
    },
  });
}

function handleProtectedExample(request: Request, origin: string): Response {
  if (request.method !== "GET") {
    return jsonResponse(405, {
      error: "method_not_allowed",
      message: "Use GET for this protected resource.",
    });
  }

  const token = getBearerToken(request);
  if (!token || !token.startsWith("cadence-public-")) {
    return unauthorizedWithDiscovery(origin);
  }

  return jsonResponse(200, {
    ok: true,
    resource: "agent-protected-example",
    access: "granted",
  });
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

function extractMetaValue(html: string, name: string): string | null {
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
    extractMetaValue(html, "title") ||
    extractMetaValue(html, "og:title") ||
    "";
  const description =
    extractMetaValue(html, "description") ||
    extractMetaValue(html, "og:description") ||
    "";
  const image = extractMetaValue(html, "og:image") ?? "";

  const rows: string[] = [];
  if (title) rows.push(`title: ${title.replace(/\n+/g, " ")}`);
  if (description) rows.push(`description: ${description.replace(/\n+/g, " ")}`);
  if (image) rows.push(`image: ${image}`);

  return rows.length > 0 ? `---\n${rows.join("\n")}\n---\n\n` : "";
}

function extractJsonLdBlocks(html: string): string[] {
  const blocks: string[] = [];
  const matches = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const match of matches) {
    const json = match[1]?.trim();
    if (json) blocks.push(`\n\n\`\`\`json\n${json}\n\`\`\``);
  }
  return blocks;
}

function stripUnwantedBlocks(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<aside[\s\S]*?<\/aside>/gi, " ")
    .replace(/<form[\s\S]*?<\/form>/gi, " ");
}

function replaceAnchorTag(match: string, href: string, text: string): string {
  const label = cleanText(text).replace(/\s+/g, " ").trim();
  return label && href ? `[${label}](${href})` : label || "";
}

function convertHtmlToMarkdown(html: string): string {
  const reduced = stripUnwantedBlocks(html);
  let markdown = reduced;

  markdown = markdown
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_match, body) => `\n\n# ${cleanText(body)}\n\n`)
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_match, body) => `\n\n## ${cleanText(body)}\n\n`)
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_match, body) => `\n\n### ${cleanText(body)}\n\n`)
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_match, body) => `\n\n#### ${cleanText(body)}\n\n`)
    .replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, (_match, body) => `\n\n##### ${cleanText(body)}\n\n`)
    .replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, (_match, body) => `\n\n###### ${cleanText(body)}\n\n`)
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_match, body) => `\n\n${cleanText(body)}\n\n`)
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_match, body) => `\n> ${cleanText(body)}\n\n`)
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_match, body) => `\n- ${cleanText(body)}`)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, (_match, body) => `**${cleanText(body)}**`)
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, (_match, body) => `**${cleanText(body)}**`)
    .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, (_match, body) => `*${cleanText(body)}*`)
    .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, (_match, body) => `*${cleanText(body)}*`)
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_match, body) => `\`\`${cleanText(body)}\`\``)
    .replace(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (match, href, text) => replaceAnchorTag(match, href, text))
    .replace(/<[^>]+>/g, " ");

  markdown = markdown
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\n\s*\n\s*-/g, "\n-")
    .replace(/\n\s*\n\s*\*/g, "\n*")
    .replace(/\n{2,}/g, "\n\n")
    .trim();

  return markdown;
}

function getEstimatedTokens(value: string): number {
  const words = value.trim().split(/\s+/).filter(Boolean);
  return Math.max(1, Math.ceil(words.length * 1.2));
}

function isMarkdownRequested(request: Request): boolean {
  const accept = request.headers.get("accept") ?? "";
  return /text\/markdown/i.test(accept);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = getOrigin(env, url);

    if (url.pathname === "/agent/identity") {
      return handleAgentIdentity(request, origin);
    }

    if (url.pathname === "/agent/identity/claim") {
      return handleAgentClaim(request);
    }

    if (url.pathname === "/oauth2/token") {
      return handleToken(request);
    }

    if (url.pathname === "/oauth2/revoke") {
      return handleRevoke(request);
    }

    if (url.pathname === "/agent/protected-resource") {
      return handleProtectedExample(request, origin);
    }

    // Normal browser requests or non-safe methods pass directly through to origin
    if (!isMarkdownRequested(request) || (request.method !== "GET" && request.method !== "HEAD")) {
      return fetch(request);
    }

    // Pass the request to the origin (Cloudflare Pages), which executes functions/_middleware.ts
    // or serves the page. Using fetch(request) preserves Cloudflare internal routing without
    // triggering WAF 403 subrequest loops.
    const originResponse = await fetch(request);

    // If origin already responded with markdown (via functions/_middleware.ts or static markdown),
    // return it directly!
    const contentType = originResponse.headers.get("content-type") ?? "";
    if (contentType.includes("text/markdown")) {
      return originResponse;
    }

    // If origin succeeded with HTML, convert HTML to clean Markdown fallback
    if (originResponse.ok && /text\/html|application\/xhtml\+xml/i.test(contentType)) {
      const html = await originResponse.text();
      const markdown = `${extractFrontmatter(html)}${convertHtmlToMarkdown(html)}${extractJsonLdBlocks(html).join("\n")}`.trim() + "\n";
      const strippedText = cleanText(html);
      const headers = new Headers(originResponse.headers);

      headers.set("content-type", "text/markdown; charset=utf-8");
      headers.set("vary", "Accept");
      headers.set("content-signal", env.DEFAULT_CONTENT_SIGNAL ?? DEFAULT_CONTENT_SIGNAL);
      headers.set("x-markdown-tokens", String(getEstimatedTokens(markdown)));
      headers.set("x-original-tokens", String(getEstimatedTokens(strippedText)));

      return new Response(request.method === "HEAD" ? null : markdown, {
        status: originResponse.status,
        statusText: originResponse.statusText,
        headers,
      });
    }

    return originResponse;
  },
};
