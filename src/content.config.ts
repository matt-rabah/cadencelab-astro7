// src/content.config.ts
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod'; // ✨ Fix: Pull z from its dedicated modern home
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/blog" }), //
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    date: z.date(),
    readTime: z.string(),
    category: z.string(),
  }),
});

export const collections = { blog };
