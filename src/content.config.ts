import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const post = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.{md,mdx}',
    base: './src/content/blog'
  }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    date: z.coerce.date(),
    readTime: z.string(),
    category: z.string(),
  }),
});

const page = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.{md,mdx}',
    base: './src/content/pages'
  }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    category: z.string(),
  }),
});

export const collections = { post, page };
