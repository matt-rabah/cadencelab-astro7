import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const post = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.{md,mdx}',
    base: './src/content/blog' // Tells Astro to look in your clean blog folder
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
    base: './src/content/pages' // Tells Astro to look in your clean pages folder
  }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    category: z.string(),
  }),
});

export const collections = { post, page };
