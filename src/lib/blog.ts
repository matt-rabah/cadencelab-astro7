import type { CollectionEntry } from "astro:content";

export type BlogPost = CollectionEntry<"blog">;

/** Public URL for a post: /blog/YYYY/MM/slug/, dated from the post's `date`. */
export const getPostURL = (post: BlogPost): string => {
  const year = String(post.data.date.getUTCFullYear());
  const month = String(post.data.date.getUTCMonth() + 1).padStart(2, "0");
  const slug = post.id
    .replace(/\.(md|mdx)$/i, "")
    .split("/")
    .filter(Boolean)
    .at(-1);

  if (!slug) {
    throw new Error(`Unable to determine a slug for blog entry: ${post.id}`);
  }

  return `/blog/${year}/${month}/${slug}/`;
};
