# Step 3: Blog route integration

This stage handles the nested blog structure in this repo: `/blog/[year]/[month]/[slug]`.

The correct pattern is not to create a second duplicate article route tree under a separate agent-only structure. Instead, the build should generate Markdown artifacts that match the same route paths, and the Worker should resolve those artifacts based on the request URL and `Accept` header.

This keeps the blog pages in sync with the existing HTML routes while still exposing a clean Markdown variant to agent requests.

## Step 1: Update `content.config.ts`

Astro 7.2 relies on loaders inside `content.config.ts`. Ensure your blog collection uses the built-in `glob` loader targeting your markdown files.

```ts
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    // Add other frontmatter fields used by your TinaCMS configuration
  }),
});

export const collections = { blog };
```

## Step 2: Create the Dynamic Agent Endpoint

Because your blog structure uses nested dynamic parameters `([year]/[month]/[slug])`, create a matching dynamic route inside your agent directory: `src/pages/markdown/blog/[year]/[month]/[slug].astro`.

This script will run at build time, pull raw text content via Astro's data loader, and output clean markdown.

**File:** `src/pages/markdown/blog/[year]/[month]/[slug].astro`

```astro
---
import { getCollection, render } from "astro:content";

export async function getStaticPaths() {
  const posts = await getCollection("blog");

  return posts.map((post) => {
    // Extract year and month from the Date object or filename
    const date = new Date(post.data.date);
    const year = date.getFullYear().toString();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    // Fallback slug handling if id contains subdirectories
    const slug =
      post.id
        .split("/")
        .pop()
        ?.replace(/\.(md|mdx)$/, "") || post.id;

    return {
      params: { year, month, slug },
      props: { post },
    };
  });
}

const { post } = Astro.props;

// Compile the body to extract raw text elements, bypasses HTML wrappers
const { remarkPluginFrontmatter } = await render(post);
const rawMarkdownBody = post.body;

export const partial = true;
---

# {post.data.title}
Published on: {post.data.date.toISOString().split("T")[0]}

{rawMarkdownBody}
```

## Step 3: Handle the Blog Listing Page

You also need to expose the blog index feed to agents so they can discover individual blog post URLs. Create a single static route mapping to your main blog listing.

**File:** `src/pages/markdown/blog/index.astro`

```astro
---
import { getCollection } from "astro:content";

const posts = await getCollection("blog");
// Sort newest first
const sortedPosts = posts.sort(
  (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
);

export const partial = true;
---

# Blog Archive (AI Agent Context Feed) Here is a list of all historical
articles. To crawl individual posts, use the specific route with an `Accept:
text/markdown` header.

{
  sortedPosts
    .map((post) => {
      const date = new Date(post.data.date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const slug =
        post.id
          .split("/")
          .pop()
          ?.replace(/\.(md|mdx)$/, "") || post.id;

      return `* [${post.data.title}](/blog/${year}/${month}/${slug})`;
    })
    .join("\n")
}
```

## Step 4: Adjust the Cloudflare Worker Logic

Your worker script now needs to append `.md` slightly differently because your Astro configuration generates a flat file structure inside the asset directory (e.g., `/dist/markdown/blog/2026/08/my-post.md`). Update your Worker's `index.js` file to strip any trailing slashes cleanly before resolving paths:

```js
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const acceptHeader = request.headers.get("Accept") || "";
    const wantsMarkdown = acceptHeader.includes("text/markdown");

    if (wantsMarkdown) {
      // Clear out trailing slash if present: /blog/2026/08/slug/ -> /blog/2026/08/slug
      let cleanPath = url.pathname.endsWith("/")
        ? url.pathname.slice(0, -1)
        : url.pathname;

      // Handle the homepage edge case
      if (cleanPath === "") {
        cleanPath = "/index";
      }

      const mdUrl = new URL(url.origin + "/markdown" + cleanPath + ".md");
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

## Resulting Dist Directory after Running `npm run build`

When Astro finishes compiling, your build artifacts will map perfectly to the asset layer of the worker:

```text
dist/
├── blog/
│   ├── index.html
│   └── 2026/
│       └── 08/
│           └── post-slug/index.html   <- Human hits /blog/2026/08/post-slug
└── markdown/
    ├── blog.md                        <- Agent hits /blog with Accept header
    └── blog/
        └── 2026/
            └── 08/
                └── post-slug.md       <- Agent hits /blog/2026/08/post-slug with Accept header
```
