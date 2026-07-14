import { defineConfig } from "tinacms";

const branch =
  process.env.HEAD ??
  process.env.VERCEL_GIT_COMMIT_REF ??
  process.env.GITHUB_HEAD_REF ??
  process.env.GITHUB_REF_NAME ??
  "main";

// Keep compatibility with older env var names so local/static builds don't fail
const clientId =
  process.env.NEXT_PUBLIC_TINA_CLIENT_ID ?? process.env.TINA_CLIENT_ID;
const readOnlyToken = process.env.TINA_READ_ONLY_TOKEN;
const searchToken = process.env.TINA_SEARCH_TOKEN;

// Do not throw when clientId is missing — allow unauthenticated local/static builds

export default defineConfig({
  branch,
  clientId,

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
            const rawDate = (document as any)._values?.date;
            const slug = document._sys.filename;

            if (!rawDate) {
              return "/blog/";
            }

            const date = new Date(rawDate);

            if (Number.isNaN(date.getTime())) {
              return "/blog/";
            }

            const year = String(date.getUTCFullYear());
            const month = String(date.getUTCMonth() + 1).padStart(2, "0");

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
