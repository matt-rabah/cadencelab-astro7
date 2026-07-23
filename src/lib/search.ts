import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

type BlogPost = CollectionEntry<"blog">;

export interface SearchEntry {
  title: string;
  description: string;
  category: string;
  readTime: string;
  href: string;
  searchText: string;
}

const getPostURL = (post: BlogPost): string => {
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

export const getSearchEntries = async (): Promise<SearchEntry[]> => {
  const posts = await getCollection("blog", ({ data }) => !data.draft);

  return posts
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
    .map((post) => {
      const description = post.data.description ?? post.data.subtitle;

      return {
        title: post.data.title,
        description,
        category: post.data.category,
        readTime: post.data.readTime,
        href: getPostURL(post),
        searchText: [
          post.data.title,
          post.data.subtitle,
          description,
          post.data.category,
          post.data.author,
        ]
          .join(" ")
          .toLocaleLowerCase(),
      };
    });
};
