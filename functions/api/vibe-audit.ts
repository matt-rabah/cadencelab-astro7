// functions/api/vibe-audit.ts
// Cloudflare Pages Function behind the free Vibe Code Audit tool.
//
// POST JSON { url, token } -> JSON AuditResult (see src/lib/vibe-audit/checks.ts)
//
// It only requests what any browser could: the page, /robots.txt,
// /sitemap.xml, the page's own scripts and stylesheets, and whether those
// scripts' source maps are public. It doesn't probe paths, submit forms, or
// test the target's backend. Nothing is stored.
//
// Abuse controls: Turnstile on every scan, same-origin requests only, a
// small JSON body, strict URL rules (public http/https hostnames on default
// ports, re-checked on every redirect), per-request timeouts, response size
// caps, and a cap on the number of files fetched.

import { runAudit, type FetchedAsset } from "../../src/lib/vibe-audit/checks";

interface Env {
  TURNSTILE_SECRET_KEY?: string;
  [key: string]: unknown;
}

interface PagesContext {
  request: Request;
  env: Env;
}

const TURNSTILE_ACTION = "vibe-audit";
const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const USER_AGENT =
  "CadenceLabVibeAudit/1.0 (+https://cadencelab.co/resources/ai-tools/vibe-code-audit/)";

const MAX_BODY_BYTES = 4_096;
const MAX_PAGE_BYTES = 1_500_000;
const MAX_SCRIPT_BYTES = 1_200_000;
const MAX_TOTAL_SCRIPT_BYTES = 4_000_000;
const MAX_STYLE_BYTES = 400_000;
const MAX_SMALL_FILE_BYTES = 100_000;
const MAX_SCRIPTS = 6;
const MAX_STYLES = 4;
const MAX_REDIRECTS = 4;
const FETCH_TIMEOUT_MS = 8_000;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

const fail = (message: string, status: number) =>
  json({ error: message }, status);

// ---------- URL safety ----------

const BLOCKED_HOST_SUFFIXES = [
  ".localhost",
  ".local",
  ".internal",
  ".intranet",
  ".lan",
  ".home",
  ".corp",
  ".arpa",
];

export function normalizeTarget(raw: string): URL | null {
  let value = raw.trim();
  if (!value || value.length > 2_000) return null;
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) value = `https://${value}`;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  return isAllowedUrl(url) ? url : null;
}

export function isAllowedUrl(url: URL): boolean {
  if (url.protocol !== "https:" && url.protocol !== "http:") return false;
  if (url.username || url.password) return false;
  if (url.port && url.port !== "80" && url.port !== "443") return false;
  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  if (!host.includes(".")) return false;
  if (
    host === "localhost" ||
    BLOCKED_HOST_SUFFIXES.some((s) => host.endsWith(s))
  )
    return false;
  // Reject IP literals outright (IPv4, IPv6, and numeric shorthand); public
  // sites are reached by name, and this closes off private-range tricks.
  if (/^\[.*\]$/.test(host) || host.includes(":")) return false;
  if (/^[0-9.]+$/.test(host) || /^0x[0-9a-f.]+$/i.test(host)) return false;
  return true;
}

// ---------- Fetch helpers ----------

async function readCapped(
  response: Response,
  cap: number,
): Promise<string | null> {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > cap) {
      await reader.cancel();
      chunks.push(
        value.slice(0, Math.max(0, value.byteLength - (total - cap))),
      );
      total = cap;
      break;
    }
    chunks.push(value);
  }
  const all = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    all.set(c, offset);
    offset += c.byteLength;
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(all);
}

interface SafeFetchResult {
  response: Response;
  finalUrl: URL;
}

/** GET with manual redirects; every hop must pass the URL rules. */
async function safeFetch(
  start: URL,
  method: "GET" | "HEAD" = "GET",
  accept = "*/*",
): Promise<SafeFetchResult | null> {
  let current = start;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (!isAllowedUrl(current)) return null;
    let response: Response;
    try {
      response = await fetch(current.toString(), {
        method,
        redirect: "manual",
        headers: { "User-Agent": USER_AGENT, Accept: accept },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
    } catch {
      return null;
    }
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("Location");
      await response.body?.cancel();
      if (!location) return null;
      try {
        current = new URL(location, current);
      } catch {
        return null;
      }
      continue;
    }
    return { response, finalUrl: current };
  }
  return null;
}

async function fetchText(url: URL, cap: number, accept?: string) {
  const r = await safeFetch(url, "GET", accept);
  if (!r) return null;
  if (!r.response.ok) {
    await r.response.body?.cancel();
    return {
      status: r.response.status,
      text: null as string | null,
      finalUrl: r.finalUrl,
      headers: r.response.headers,
    };
  }
  const text = await readCapped(r.response, cap);
  return {
    status: r.response.status,
    text,
    finalUrl: r.finalUrl,
    headers: r.response.headers,
  };
}

function sameSite(a: URL, b: URL): boolean {
  const base = (h: string) => h.split(".").slice(-2).join(".");
  return base(a.hostname) === base(b.hostname);
}

function collectAssetUrls(html: string, pageUrl: URL) {
  const scripts: URL[] = [];
  const styles: URL[] = [];
  for (const tag of html.match(
    /<script\b[^>]*\ssrc\s*=\s*["'][^"']+["'][^>]*>/gi,
  ) || []) {
    const src = tag.match(/\ssrc\s*=\s*["']([^"']+)["']/i)?.[1];
    if (!src) continue;
    try {
      const u = new URL(src, pageUrl);
      if (sameSite(u, pageUrl) && isAllowedUrl(u)) scripts.push(u);
    } catch {
      /* ignore bad URLs */
    }
  }
  for (const tag of html.match(/<link\b[^>]*>/gi) || []) {
    if (!/rel\s*=\s*["']?stylesheet/i.test(tag)) continue;
    const href = tag.match(/\shref\s*=\s*["']([^"']+)["']/i)?.[1];
    if (!href) continue;
    try {
      const u = new URL(href, pageUrl);
      if (sameSite(u, pageUrl) && isAllowedUrl(u)) styles.push(u);
    } catch {
      /* ignore bad URLs */
    }
  }
  const dedupe = (list: URL[]) => [
    ...new Map(list.map((u) => [u.toString(), u])).values(),
  ];
  return {
    scripts: dedupe(scripts).slice(0, MAX_SCRIPTS),
    styles: dedupe(styles).slice(0, MAX_STYLES),
  };
}

async function sourceMapExposed(
  scriptUrl: URL,
  text: string,
): Promise<boolean> {
  const ref = text
    .slice(-2_000)
    .match(/\/\/[#@]\s*sourceMappingURL=([^\s'"]+)/)?.[1];
  let mapUrl: URL;
  try {
    mapUrl =
      ref && !ref.startsWith("data:")
        ? new URL(ref, scriptUrl)
        : new URL(`${scriptUrl.toString()}.map`);
  } catch {
    return false;
  }
  if (!sameSite(mapUrl, scriptUrl)) return false;
  const r = await safeFetch(mapUrl, "GET", "application/json");
  if (!r) return false;
  if (!r.response.ok) {
    await r.response.body?.cancel();
    return false;
  }
  const head = await readCapped(r.response, 2_000);
  return (
    !!head &&
    /"version"\s*:\s*3/.test(head) &&
    /"(mappings|sources)"/.test(head)
  );
}

// ---------- Turnstile ----------

async function verifyTurnstile(
  request: Request,
  secret: string,
  token: string,
) {
  const body = new FormData();
  body.set("secret", secret);
  body.set("response", token);
  body.set("idempotency_key", crypto.randomUUID());
  const ip = request.headers.get("CF-Connecting-IP");
  if (ip) body.set("remoteip", ip);
  try {
    const r = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(5_000),
    });
    const data = (await r.json()) as { success?: boolean; action?: string };
    // Cloudflare's always-pass test keys report an empty action.
    return !!data.success && (!data.action || data.action === TURNSTILE_ACTION);
  } catch {
    return false;
  }
}

// ---------- Handler ----------

export const onRequest = async ({
  request,
  env,
}: PagesContext): Promise<Response> => {
  if (request.method !== "POST") {
    return new Response("Method not allowed.", {
      status: 405,
      headers: { Allow: "POST" },
    });
  }

  const requestUrl = new URL(request.url);
  const origin = request.headers.get("Origin");
  if (origin && origin !== requestUrl.origin) return fail("Forbidden.", 403);

  if (
    !(request.headers.get("Content-Type") || "").startsWith("application/json")
  ) {
    return fail("Unsupported request format.", 415);
  }
  const raw = await readCapped(new Response(request.body), MAX_BODY_BYTES + 1);
  if (raw === null || raw.length > MAX_BODY_BYTES)
    return fail("Request is too large.", 413);

  let payload: { url?: unknown; token?: unknown };
  try {
    payload = JSON.parse(raw);
  } catch {
    return fail("The request couldn't be read.", 400);
  }

  if (!env.TURNSTILE_SECRET_KEY) {
    console.error("Vibe audit Turnstile verification is not configured.");
    return fail(
      "The scanner is temporarily unavailable. Please try again later.",
      503,
    );
  }
  if (typeof payload.token !== "string" || !payload.token) {
    return fail("Please complete the security check, then scan again.", 400);
  }
  if (
    !(await verifyTurnstile(request, env.TURNSTILE_SECRET_KEY, payload.token))
  ) {
    return fail(
      "The security check didn't pass. Refresh the page and try again.",
      403,
    );
  }

  const target =
    typeof payload.url === "string" ? normalizeTarget(payload.url) : null;
  if (!target) {
    return fail(
      "Enter a public website address, like example.com. Private, local, and IP addresses can't be scanned.",
      400,
    );
  }

  const page = await fetchText(
    target,
    MAX_PAGE_BYTES,
    "text/html,application/xhtml+xml",
  );
  if (!page) {
    return fail(
      "That site didn't respond in time, or it redirected somewhere that can't be scanned.",
      502,
    );
  }
  if (page.text === null) {
    return fail(
      `That page returned an error (HTTP ${page.status}), so there's nothing to scan.`,
      502,
    );
  }
  const contentType = page.headers.get("Content-Type") || "";
  if (contentType && !/html/i.test(contentType)) {
    return fail("That address isn't a web page (it didn't return HTML).", 422);
  }

  const finalUrl = page.finalUrl;
  const headers: Record<string, string> = {};
  page.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  const { scripts: scriptUrls, styles: styleUrls } = collectAssetUrls(
    page.text,
    finalUrl,
  );
  const root = new URL("/", finalUrl);

  const [robots, sitemap, ...assetResults] = await Promise.all([
    fetchText(new URL("/robots.txt", root), MAX_SMALL_FILE_BYTES, "text/plain"),
    fetchText(
      new URL("/sitemap.xml", root),
      MAX_SMALL_FILE_BYTES,
      "application/xml,text/xml",
    ),
    ...scriptUrls.map((u) => fetchText(u, MAX_SCRIPT_BYTES, "*/*")),
    ...styleUrls.map((u) => fetchText(u, MAX_STYLE_BYTES, "text/css")),
  ]);

  const scripts: FetchedAsset[] = [];
  let totalScriptBytes = 0;
  for (let i = 0; i < scriptUrls.length; i++) {
    const r = assetResults[i];
    if (!r?.text || totalScriptBytes > MAX_TOTAL_SCRIPT_BYTES) continue;
    const bytes =
      Number(r.headers.get("Content-Length")) ||
      new TextEncoder().encode(r.text).byteLength;
    totalScriptBytes += bytes;
    scripts.push({ url: r.finalUrl.toString(), text: r.text, bytes });
  }
  // Check source maps for the first few scripts only.
  await Promise.all(
    scripts.slice(0, 3).map(async (s) => {
      s.sourceMapExposed = await sourceMapExposed(new URL(s.url), s.text);
    }),
  );

  const stylesheets: FetchedAsset[] = [];
  for (let i = 0; i < styleUrls.length; i++) {
    const r = assetResults[scriptUrls.length + i];
    if (r?.text)
      stylesheets.push({
        url: r.finalUrl.toString(),
        text: r.text,
        bytes: r.text.length,
      });
  }

  const robotsTxt = robots?.text ?? null;
  const sitemapFound =
    (!!sitemap?.text && /<(urlset|sitemapindex)\b/i.test(sitemap.text)) ||
    /^\s*sitemap\s*:/im.test(robotsTxt ?? "");

  const result = runAudit({
    requestedUrl: target.toString(),
    finalUrl: finalUrl.toString(),
    status: page.status,
    headers,
    html: page.text,
    robotsTxt: robotsTxt && /^\s*</.test(robotsTxt) ? null : robotsTxt,
    sitemapFound,
    scripts,
    stylesheets,
    totalScriptBytes,
  });

  return json(result);
};
