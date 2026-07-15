// src/content.config.ts

import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const post = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "./src/content/blog",
  }),

  schema: z.object({
    title: z.string().min(1),
    subtitle: z.string().min(1),
    description: z.string().min(1).optional(),
    date: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    readTime: z.string().min(1),
    category: z.string().min(1),
    author: z.string().min(1).default("Cadence Lab"),
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
    title: z.string().min(1),
    subtitle: z.string().min(1),
    description: z.string().min(1).optional(),
    category: z.string().min(1),
    noindex: z.boolean().default(false),
  }),
});

export const collections = {
  post,
  page,
};
