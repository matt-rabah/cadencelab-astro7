import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getPostURL, type BlogPost } from "../lib/blog";

// Cloudflare Pages redirect rules for blog posts whose URL changed, built from
// each post's `redirectFrom` list. The build step in astro.config.mjs appends
// this file to dist/_redirects and then deletes it.
export const GET: APIRoute = async () => {
  const posts: BlogPost[] = await getCollection(
    "blog",
    ({ data }: BlogPost) => !data.draft,
  );
  const liveURLs = new Set(posts.map(getPostURL));
  const seen = new Map<string, string>();
  const rules: string[] = [];

  for (const post of posts) {
    const target = getPostURL(post);
    for (const from of post.data.redirectFrom) {
      if (liveURLs.has(from)) {
        throw new Error(
          `Blog post "${post.id}" lists ${from} in redirectFrom, but that is a live post URL.`,
        );
      }
      const owner = seen.get(from);
      if (owner) {
        throw new Error(
          `${from} is listed in redirectFrom by both "${owner}" and "${post.id}".`,
        );
      }
      seen.set(from, post.id);
      // Match the old URL with and without its trailing slash.
      rules.push(`${from} ${target} 301`, `${from.slice(0, -1)} ${target} 301`);
    }
  }

  return new Response(rules.length ? `${rules.join("\n")}\n` : "", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
