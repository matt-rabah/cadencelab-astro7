import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getPostURL, type BlogPost } from "../lib/blog";

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

// RSS 2.0 feed of published blog posts, newest first. Search engines, feed
// readers, and AI tools use it to discover new posts quickly.
export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL("https://cadencelab.co");
  const published: BlogPost[] = await getCollection(
    "blog",
    ({ data }: BlogPost) => !data.draft,
  );
  const posts = published.sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );

  const items = posts
    .map((post) => {
      const url = new URL(getPostURL(post), base).href;
      const description = post.data.description ?? post.data.subtitle ?? "";
      return [
        "<item>",
        `<title>${escapeXml(post.data.title)}</title>`,
        `<link>${url}</link>`,
        `<guid isPermaLink="true">${url}</guid>`,
        `<pubDate>${post.data.date.toUTCString()}</pubDate>`,
        description
          ? `<description>${escapeXml(description)}</description>`
          : "",
        post.data.category
          ? `<category>${escapeXml(post.data.category)}</category>`
          : "",
        "</item>",
      ].join("");
    })
    .join("");

  const feedURL = new URL("/rss.xml", base).href;
  const lastBuildDate = posts[0]?.data.updatedDate ?? posts[0]?.data.date;

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "<channel>",
    "<title>Cadence Lab Blog</title>",
    `<link>${new URL("/blog/", base).href}</link>`,
    "<description>Practical writing on customer experience operations, CRM workflows, and applied AI from Cadence Lab.</description>",
    "<language>en-us</language>",
    `<atom:link href="${feedURL}" rel="self" type="application/rss+xml"/>`,
    lastBuildDate
      ? `<lastBuildDate>${lastBuildDate.toUTCString()}</lastBuildDate>`
      : "",
    items,
    "</channel>",
    "</rss>",
  ].join("");

  return new Response(body, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
};
