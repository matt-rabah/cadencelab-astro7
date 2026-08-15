# Step 4: TinaCMS page integration

This stage covers the non-blog content managed by TinaCMS and placed under `src/content/pages`.

The project-specific requirement is to integrate those pages into the same build-time Markdown generation pipeline without creating a separate custom route system that can drift from the real site. The key is to generate a Markdown proxy for the same page content and let the Worker serve it only when it is asked for by agents.

This preserves the actual site structure while giving agent requests a clean, compact format.

## Step 1: Update `content.config.ts` for Pages

First, ensure that your pages folder is registered as an official Astro content collection alongside your blog collection so that Astro can query it dynamically.

```typescript
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
  }),
});

// Add the Tina-managed pages loader
const pages = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/pages" }),
  schema: z.any(), // Flexible schema to allow arbitrary TinaCMS frontmatter
});

export const collections = { blog, pages };
```

## Step 2: Create the Catch-All Agent Route

Create a new catch-all page file at `src/pages/markdown/[...slug].astro`. This file intercept all standard marketing layout URLs (such as `/about`, `/features/pricing`, etc.) and output their raw, clean Markdown values for incoming bots.

**File:** `src/pages/markdown/[...slug].astro`

```
---
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const pages = await getCollection('pages');

  return pages.map((page) => {
    // Convert filenames/IDs into URL slug paths
    // e.g., "about.md" becomes slug: "about"
    // e.g., "home.md" or "index.md" becomes slug: undefined (root)
    let slug = page.id.replace(/\.(md|mdx)$/, '');

    if (slug === 'index' || slug === 'home') {
      slug = undefined;
    }

    return {
      params: { slug },
      props: { page },
    };
  });
}

const { page } = Astro.props;
const rawMarkdownBody = page.body;

export const partial = true;
---
# {page.data.title || 'Page Context'}

{rawMarkdownBody}
```

## Step 3: Handle the Cloudflare Worker File Mapping Code

Because a root URL like `https://cadencelab.co/` requests an `index` asset rather than a blank file name, update your Cloudflare Worker `index.js` processing logic slightly to gracefully map root-level requests (`/`) to the built `index.md` file.

Replace the path processing block inside your Worker script with this sanitized configuration:

```
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const acceptHeader = request.headers.get("Accept") || "";
    const wantsMarkdown = acceptHeader.includes("text/markdown");

    if (wantsMarkdown) {
      // 1. Remove trailing slashes
      let cleanPath = url.pathname.endsWith('/') ? url.pathname.slice(0, -1) : url.pathname;

      // 2. Map the base domain path directly to the pre-built index file
      if (cleanPath === "") {
        cleanPath = "/index";
      }

      // 3. Assemble target asset URL location
      const mdUrl = new URL(url.origin + "/markdown" + cleanPath + ".md");
      let mdResponse = await env.ASSETS.fetch(new Request(mdUrl, request));

      if (mdResponse.ok) {
        const text = await mdResponse.text();
        const tokens = Math.ceil(text.length / 4);

        return new Response(text, {
          status: 200,
          headers: {
            "Content-Type": "text/markdown; charset=UTF-8",
            "Vary": "Accept",
            "X-Markdown-Tokens": tokens.toString(),
            "Content-Signal": "ai-train=yes, search=yes, ai-input=yes"
          }
        });
      }
    }
    return env.ASSETS.fetch(request);
  }
};
```

## Resulting Build Structure

Once you execute `npm run build`, Astro merges your customized TinaCMS directories and standard blog collections smoothly into an edge-deliverable directory structure:

```
dist/
├── index.html                   <- Human landing page
├── thanks/
│   └── index.html               <- Human thank you page
├── markdown/
│   ├── index.md                 <- Agent landing page (Generated via [...slug].astro)
│   ├── thanks.md                <- Agent thank you page (Generated via [...slug].astro)
│   ├── blog.md                  <- Agent blog feed directory
│   └── blog/
│       └── 2026/
│           └── 08/
│               └── slug.md      <- Agent specific blog article
```

## Your setup now matches Cloudflare's Native Core Functionality

With these changes in place, your system will now directly mimic Cloudflare's managed Markdown for Agents solution because it hits the same critical pillars:

- **True Content Negotiation:** Your Cloudflare Worker actively sniffs the `Accept: text/markdown` request header, exactly like Cloudflare’s proxy layer does.
- **Vary-Header Support:** By returning `Vary: Accept`, you ensure that browser caches and CDN edge caches never accidentally serve Markdown to humans, or HTML to AI agents.
- **Context Window Optimization:** By mapping routes directly to Astro raw markdown dumps at build time, you bypass heavy scripts, scripts-stripping, and layout menus. This saves massive token counts for the agent.
- **Standard-Compliant Headers:** Your custom worker manually injects `X-Markdown-Tokens` and `Content-Signal` permissions headers, allowing compliance with AI crawler conventions.

## Set up CI/CD Automation via GitHub Actions

> This step is optional but highly recommended so your Markdown and HTML files re-build and deploy to Cloudflare completely automatically every time you update content in TinaCMS.
