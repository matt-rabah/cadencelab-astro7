// src/content.config.ts
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    date: z.coerce.date(),
    readTime: z.string(),
    category: z.string(),
  }),
});

const page = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./content/pages" }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    category: z.string(),
  }),
});

export const collections = { blog, page };

