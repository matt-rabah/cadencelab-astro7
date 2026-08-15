# Step 2: Astro integration for this repo

This stage is meant to fit the actual project structure in this repo, not as a generic Astro tutorial.

For this site, the safest implementation is to keep Astro's static HTML output intact and generate agent-friendly Markdown artifacts during the build. The Worker then serves those generated files based on the `Accept` header instead of relying on a second, separate route tree or runtime HTML stripping as the primary path.

This avoids route duplication and matches the repository's architecture more reliably than building a second full parallel website for agents.

## Step 1: Restructure Your Astro Project

To map your endpoints cleanly to the Cloudflare Worker setup, maintain your HTML files inside src/pages/ as normal, and dedicate a src/pages/markdown/ folder specifically for the bot endpoints.

```text
my-astro-project/
├── src/
│   └── pages/
│       ├── index.astro        <- Human entry point (Outputs: /index.html)
│       ├── pricing.astro      <- Human subpage (Outputs: /pricing/index.html)
│       └── markdown/
│           ├── index.md.astro <- Agent homepage (Outputs: /markdown/index.md)
│           └── pricing.md.astro <- Agent subpage (Outputs: /markdown/pricing.md)
```

## Step 2: Create the Agent Pages using Astro 7.2 Dynamic Assets

Inside your .md.astro files, enforce strict text-only formatting. Disable Astro’s default HTML layout wrapper entirely so that the raw build output matches your exact Markdown string. File: src/pages/markdown/index.md.astro

```md
---
// Tell Astro to output plain text instead of an HTML page template
import { getEntry } from 'astro:content';

// Optional: If you manage your content via Content Collections,
// you can pull the raw body text instantly using Astro 7's Rust loader.
// const post = await getEntry('docs', 'homepage');

export const partial = true;
---

# Welcome to my Site (AI Agent Route)

This content is programmatically tailored for context-window optimization.

## Key Navigation

- Pricing Data: Refer to `/pricing` with `Accept: text/markdown`
- Documentation: Refer to `/docs`
```

## Step 3: Configure Your Astro Build Output

Ensure your astro.config.mjs is structured for a static export (output: 'static') so that all assets exist directly on disk for Cloudflare's global edge network.

```js
import { defineConfig } from "astro:config";

export default defineConfig({
  output: "static",
  build: {
    // Keeps routes clean so /markdown/index.md builds exactly as a file,
    // rather than /markdown/index.md/index.html
    format: "file",
  },
  experimental: {
    // Astro 7.2 optimization: Speeds up rebuilding heavy markdown/agent structures
    incrementalBuild: true,
  },
});
```

## Step 4: Map the Cloudflare Assets Directory

When you compile your Astro project (`npm run build`), Astro automatically outputs all static production files into the `./dist` folder. See [Astro documentation](https://docs.astro.build/en/reference/cli-reference/)

Update your Cloudflare Worker `wrangler.jsonc` file to reference Astro's `./dist` directory so your content negotiation script can access the built markdown payloads:

```jsonc
{
  "$schema": "https://schemastore.org",
  "name": "astro-markdown-agents",
  "main": "index.js",
  "compatibility_date": "2026-08-15",
  "assets": {
    "directory": "./dist",
    "run_worker_first": ["*"],
  },
}
```

Now, whenever a bot hits `://yourdomain.com` with an `Accept: text/markdown` header, your Worker will seamlessly grab `./dist/markdown/pricing.md` behind the scenes and return it cleanly with the appropriate `X-Markdown-Tokens` context length analytics!
