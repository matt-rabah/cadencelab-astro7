# Step 1: Overview and Worker Strategy

This is the first stage of the overall project plan for a DIY production-ready version of Cloudflare's paid Markdown for Agents feature for this Astro/Tina site.

For this repository, the correct architecture is not a generic API comparison or a separate custom-hostname strategy. The correct implementation is a Cloudflare Worker that inspects `Accept: text/markdown`, resolves the matching generated Markdown artifact, and returns Markdown while preserving standard HTML for browsers.

## Architecture in context

For this project, the practical route is:

1. **Cloudflare Worker (Recommended and required here):** runs at the edge, handles content negotiation, and serves the generated Markdown artifact when an agent asks for it.
2. **Build-time generated Markdown artifacts:** generated during Astro build so the Worker does not need to parse the full HTML page at runtime.
3. **Keep HTML as the default response for browsers:** browser traffic continues to receive the normal site output, while Markdown is only served when the request explicitly asks for it.

This approach matches the core goal of the paid feature without adding unnecessary infrastructure or detached conversion endpoints.

### Core Implementation Steps

- **Detect the Header:** Write a Worker script that reads `request.headers.get('Accept')` to see if it includes `text/markdown`.
- **Fetch the Origin:** If requested, fetch the standard HTML asset from your origin server or cache.
- **Strip & Convert:** Pass the HTML body through a DOM parser or Cloudflare's `ai.toMarkdown()` utility to discard visual chrome and retain only semantic elements (headers, lists, tables).
- **Inject Headers:** Return the response with `Content-Type: text/markdown` and a custom tracking header like `x-markdown-tokens` to signal efficiency to the incoming agent.

## Worker Implementation

1. **Configuration (`wrangler.jsonc`):** Ensure your static assets or build files are bound, setting run_worker_first to intercept requests before static routing handles them:

```json
{
  "$schema": "https://schemastore.org",
  "name": "markdown-for-agents-free",
  "main": "index.js",
  "compatibility_date": "2026-08-15",
  "assets": {
    "directory": "./dist",
    "run_worker_first": ["*"]
  }
}
```

2.**Worker Script (`index.js`):**

```javascript
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const acceptHeader = request.headers.get("Accept") || "";
    const wantsMarkdown = acceptHeader.includes("text/markdown");

    if (wantsMarkdown) {
      // Map path to your pre-built markdown directory, e.g., /about -> /markdown/about.md
      let mdPath = url.pathname.endsWith("/")
        ? `${url.pathname}index.md`
        : `${url.pathname}.md`;

      const mdUrl = new URL(url.origin + "/markdown" + mdPath);
      let mdResponse = await env.ASSETS.fetch(new Request(mdUrl, request));

      if (mdResponse.ok) {
        const markdownText = await mdResponse.text();
        // Approximate token count (approx 4 chars per token)
        const tokenCount = Math.ceil(markdownText.length / 4);

        return new Response(markdownText, {
          status: 200,
          headers: {
            "Content-Type": "text/markdown; charset=UTF-8",
            Vary: "Accept",
            "X-Markdown-Tokens": tokenCount.toString(),
            "Content-Signal": "ai-train=yes, search=yes, ai-input=yes",
          },
        });
      }
    }

    // Fall back to standard asset/HTML handling for browsers
    return env.ASSETS.fetch(request);
  },
};
```

## Production-ready best practices - free Cloudflare tier

- **Pre-generate Markdown at Build Time:** Generate parallel `.md` files during your Astro static site generation (also works with Hugo or Next.js) rather than performing intensive runtime regex or HTML-to-text stripping on the worker.
- **Cache Separation:** Because Cloudflare's free tier cache logic can occasionally conflate responses if `Vary: Accept` isn't handled explicitly at the edge, mapping markdown requests into a distinct `/markdown/...` namespace isolates your cache keys correctly.

To build and deploy a general version of the Markdown for Agents tool while on the Cloudflare Free Tier, follow these exact 8 steps in order.

### Step 1: Install Node.js and Wrangler

Ensure you have the environment needed to develop and deploy Cloudflare Workers.

- Open your terminal.
- Install Node.js (v18 or higher recommended).
- Verify installation with `node -v`.
- Install the Cloudflare CLI globally: `npm install -g wrangler`.

### Step 2: Initialize the Project

Create a dedicated project folder and initialize it with standard Cloudflare configuration files.

- Run `mkdir md-for-agents && cd md-for-agents`.
- Initialize a Node project: `npm init -y`.
- Create the project structure: `mkdir -p dist/markdown`.

### Step 3: Create the Static Assets

Place your standard website code and the corresponding agent-optimized files into the assets directory.

- Create dist/index.html for human browsers (e.g., containing `<h1>Welcome to my site</h1>)`.
- Create `dist/markdown/index.md` for AI bots (e.g., containing `# Welcome to my site\nThis is optimized for LLMs.`).
- Create `dist/markdown/pricing.md` for automated subpage scraping.

### Step 4: Configure Wrangler (`wrangler.jsonc`)

Instruct Cloudflare to run your Worker logic before routing to the static files.

- Create a file named `wrangler.jsonc` in your project root.
- Paste the following configuration block exactly:

```json
{
  "$schema": "https://schemastore.org",
  "name": "md-agents-tool",
  "main": "index.js",
  "compatibility_date": "2026-08-15",
  "assets": {
    "directory": "./dist",
    "run_worker_first": ["*"]
  }
}
```

### Step 5: Write the Worker Code (`index.js`)

Implement the content negotiation engine that detects LLM scrapers.

- Create a file named `index.js` in your project root.
- Paste the Worker code block:

```javascript
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const acceptHeader = request.headers.get("Accept") || "";
    const wantsMarkdown = acceptHeader.includes("text/markdown");

    if (wantsMarkdown) {
      let mdPath = url.pathname.endsWith("/")
        ? `${url.pathname}index.md`
        : `${url.pathname}.md`;

      const mdUrl = new URL(url.origin + "/markdown" + mdPath);
      let mdResponse = await env.ASSETS.fetch(new Request(mdUrl, request));

      if (mdResponse.ok) {
        const text = await mdResponse.text();
        const tokens = Math.ceil(text.length / 4);

        return new Response(text, {
          status: 200,
          headers: {
            "Content-Type": "text/markdown; charset=UTF-8",
            Vary: "Accept",
            "X-Markdown-Tokens": tokens.toString(),
            "Content-Signal": "ai-train=yes, search=yes, ai-input=yes",
          },
        });
      }
    }
    return env.ASSETS.fetch(request);
  },
};
```

### Step 6: Test Locally

Run a simulated local instance of Cloudflare's edge environment to verify execution.

- Run the command: `npx wrangler dev`.
- Keep the terminal window open.

### Step 7: Verify Content Negotiation via Terminal

Use curl commands to prove that humans receive HTML and AI agents receive Markdown from the exact same URL.

- Open a **second** terminal window.
- Test standard browser request: `curl http://localhost:8787/` (Should output HTML).
- Test AI agent request: `curl -H "Accept: text/markdown" http://localhost:8787/` (Should output Markdown and show headers).

### Step 8: Deploy to Production

Publish your tool globally to Cloudflare's edge network for free.

- Run `npx wrangler login` and authenticate via your web browser.
- Run `npx wrangler deploy` to push the code live.
- Record the provided `*.workers.dev` production URL.
