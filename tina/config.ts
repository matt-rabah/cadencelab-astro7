import { defineConfig } from "tinacms";

const branch =
  process.env.HEAD ??
  process.env.VERCEL_GIT_COMMIT_REF ??
  process.env.GITHUB_HEAD_REF ??
  process.env.GITHUB_REF_NAME ??
  "main";

const clientId = process.env.NEXT_PUBLIC_TINA_CLIENT_ID;
const readOnlyToken = process.env.TINA_READ_ONLY_TOKEN;
const searchToken = process.env.TINA_SEARCH_TOKEN;

if (!clientId) {
  throw new Error(
    "Missing NEXT_PUBLIC_TINA_CLIENT_ID environment variable",
  );
}

export default defineConfig({
  branch,
  clientId,

  /*
   * Server-side only. This value is intentionally unavailable inside the
   * browser-based Tina admin bundle, so only include it when it exists.
   */
  ...(readOnlyToken ? { token: readOnlyToken } : {}),

  build: {
    publicFolder: "public",
    outputFolder: "admin",
  },

  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "public",
    },
  },

  /*
   * Search indexing is optional during local development. Only configure it
   * when the server-side search token is available.
   */
  ...(searchToken
    ? {
        search: {
          tina: {
            indexerToken: searchToken,
            stopwordLanguages: ["eng"],
          },
          indexBatchSize: 100,
        },
      }
    : {}),

  schema: {
    collections: [
      {
        name: "post",
        label: "Blog Posts",
        path: "src/content/blog",
        format: "md",

        ui: {
          router: ({ document }) => {
            const rawDate = document._values?.date;
            const date = rawDate ? new Date(rawDate) : new Date();

            const year = String(date.getUTCFullYear());
            const month = String(date.getUTCMonth() + 1).padStart(2, "0");
            const slug = document._sys.filename;

            return `/blog/${year}/${month}/${slug}/`;
          },
        },

        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "subtitle",
            label: "Subtitle",
            required: true,
          },
          {
            type: "datetime",
            name: "date",
            label: "Date",
            required: true,
          },
          {
            type: "string",
            name: "readTime",
            label: "Read Time",
            required: true,
          },
          {
            type: "string",
            name: "category",
            label: "Category",
            required: true,
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },

      {
        name: "page",
        label: "Pages",
        path: "src/content/pages",
        format: "md",

        ui: {
          router: ({ document }) => {
            const slug = document._sys.filename;

            if (slug === "home") {
              return "/";
            }

            return `/${slug}/`;
          },
        },

        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "subtitle",
            label: "Subtitle",
            required: true,
          },
          {
            type: "string",
            name: "category",
            label: "Category",
            required: true,
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
    ],
  },
});
