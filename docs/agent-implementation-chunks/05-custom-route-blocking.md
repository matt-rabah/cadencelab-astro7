# Step 6: Hardening and validation

This is the optional hardening layer. It is not the central requirement for matching the paid Markdown for Agents functionality.

The real parity targets are the HTTP behavior and route generation. The security and bot-blocking logic can be layered on top after the core content negotiation and auth metadata are working.

This means the final implementation should keep the core feature set stable first, then add bot filtering, route controls, or SEO hardening only if they do not interfere with the production behavior or add unnecessary complexity.

## Step 1: Update the Cloudflare Worker Logic (`index.js`)

We will update your Worker script to check incoming requests against a known Malicious Agent Blocklist. If a bad bot tries to scrape your site, the Worker instantly drops the request with a `403 Forbidden` response code at the edge, saving your CPU time and keeping your content safe.

Replace your existing `index.js` file with this production-grade, firewall-enabled code:

```js
// Strict blocklist for verified malicious/unethical scrapers
// These bots ignore robots.txt, rip content, or cause high server load
const MALICIOUS_AI_BOTS = [
  "bytespider", // Aggressive Bytedance scraper
  "cohere-ai", // Often ignores standard scrapings rules
  "anthropic-ai", // Block only if you want to restrict Claude explicitly
  "ccbot", // Common Crawl (massive resource hog)
  "imagesiftbot", // Scrapes images aggressively
  "aihitbot", // Unethical business intelligence scraper
  "turnitinbot", // Plagiarism scraper that ignores limits
];

// Explicit allowlist for high-value SEO, AEO, and GEO agents
const GOOD_AI_BOTS = [
  "gptbot", // OpenAI Search / ChatGPT
  "chatgpt-user", // Web browsing via ChatGPT user requests
  "google-extended", // Google Gemini training / search components
  "perplexitybot", // Perplexity AI Answer Engine (Crucial for GEO)
  "applebot-extended", // Apple Intelligence
  "bingbot", // Microsoft Bing/Copilot
  "googlebot", // Google Search
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const userAgent = (request.headers.get("User-Agent") || "").toLowerCase();
    const acceptHeader = request.headers.get("Accept") || "";
    const wantsMarkdown = acceptHeader.includes("text/markdown");

    // 1. Edge Firewall Check: Identify and block malicious bots instantly
    const isMalicious = MALICIOUS_AI_BOTS.some((bot) =>
      userAgent.includes(bot),
    );
    if (isMalicious) {
      return new Response(
        "Access Denied: Malicious crawler activity detected.",
        {
          status: 403,
          statusText: "Forbidden",
          headers: { "Content-Type": "text/plain" },
        },
      );
    }

    // 2. Safe-Routing for Markdown-ready Agents
    if (wantsMarkdown) {
      let cleanPath = url.pathname.endsWith("/")
        ? url.pathname.slice(0, -1)
        : url.pathname;
      if (cleanPath === "") {
        cleanPath = "/index";
      }

      const mdUrl = new URL(url.origin + "/markdown" + cleanPath + ".md");
      let mdResponse = await env.ASSETS.fetch(new Request(mdUrl, request));

      if (mdResponse.ok) {
        const text = await mdResponse.text();
        const tokens = Math.ceil(text.length / 4);

        // Tell standard search engines NOT to index the raw markdown files directly,
        // so your main HTML pages retain 100% of your SEO authority.
        return new Response(text, {
          status: 200,
          headers: {
            "Content-Type": "text/markdown; charset=UTF-8",
            Vary: "Accept",
            "X-Markdown-Tokens": tokens.toString(),
            "X-Robots-Tag": "noindex, nofollow",
            "Content-Signal": "ai-train=yes, search=yes, ai-input=yes",
          },
        });
      }
    }

    // 3. Fallback to serving regular static HTML for standard browsers and Googlebot
    return env.ASSETS.fetch(request);
  },
};
```

Step 2: Implement a Strategic `public/robots.txt`

The Worker code handles the technical enforcement, but good AI agents check your `robots.txt` file first to see how they are expected to behave.

Create or overwrite the `public/robots.txt` file in your Astro project to clearly instruct good bots where to look, while flashing a warning sign to bad ones:

```txt
# ==========================================
# 1. OPTIMIZATION FOR GOOD AI (SEO, AEO, GEO)
# ==========================================
User-agent: GPTBot
Allow: /
Crawl-delay: 1

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

# ==========================================
# 2. COMPLETE BLOCK FOR MALICIOUS / BAD BOTS
# ==========================================
User-agent: ByteSpider
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: Anthropic-AI
Disallow: /

# ==========================================
# 3. GLOBAL RULES FOR DEFAULT ENGINES
# ==========================================
User-agent: *
Allow: /

```

## Summary of What This Layer Accomplishes

- **Shields Your Resources:** Aggressive crawlers like `ByteSpider` or `CCBot` can scrape hundreds of pages a second, which drains your free tier limits. Your worker stops them at the gate.

- **Maximizes Discovery (GEO & AEO):** By explicitly welcoming `PerplexityBot`, `GPTBot`, `Google-Extended`, `OpenClaw`, and `ClaudBot`, you ensure that when users ask AI platforms questions, those engines crawl your high-utility markdown variants to cite you as an authoritative reference source.
- **Prevents Duplicate Content Penalties:** By adding the `"X-Robots-Tag": "noindex, nofollow"` header to the Markdown responses, search engines understand that the Markdown file is an alternative format of your content. This passes 100% of the ranking juice right back to your core HTML files (`/blog/...`), keeping your web visibility high.
  With all six steps now in place, your tool is now a fully production-ready, secure, automated via GitHub Actions, integrated with TinaCMS, and perfectly tuned to balance AI visibility with platform security. Everything is set up to deploy
