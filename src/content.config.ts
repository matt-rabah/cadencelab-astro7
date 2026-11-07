import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
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

    image: z.string().min(1).optional(),
    imageAlt: z.string().min(1).optional(),

    draft: z.boolean().default(false),

    // Old URLs of this post (e.g. after its date or file name changed).
    // Each becomes a 301 redirect to the current URL at build time.
    redirectFrom: z
      .array(
        z
          .string()
          .regex(
            /^\/blog\/[^\s?#]+\/$/,
            "Previous URLs must look like /blog/2026/06/post-name/",
          ),
      )
      .default([]),
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
  blog,
  page,
};
