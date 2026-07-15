import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "./src/content/blog",
  }),

  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    description: z.string().optional(),

    date: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),

    readTime: z.string(),
    category: z.string(),

    author: z.string().default("Cadence Lab"),

    image: z.string().optional(),
    imageAlt: z.string().optional(),

    draft: z.boolean().default(false),
  }),
});

const page = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "./src/content/pages",
  }),

  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    description: z.string().optional(),
    category: z.string(),
    noindex: z.boolean().default(false),
  }),
});

export const collections = {
  blog,
  page,
};
