import { defineConfig } from "tinacms";

const branch =
  process.env.CF_PAGES_BRANCH ??
  process.env.HEAD ??
  process.env.VERCEL_GIT_COMMIT_REF ??
  process.env.GITHUB_HEAD_REF ??
  process.env.GITHUB_REF_NAME ??
  "main";

const clientId =
  process.env.NEXT_PUBLIC_TINA_CLIENT_ID ??
  process.env.TINA_CLIENT_ID;

const readOnlyToken = process.env.TINA_READ_ONLY_TOKEN;
const searchToken = process.env.TINA_SEARCH_TOKEN;

export default defineConfig({
  branch,
  clientId,

  ...(readOnlyToken
    ? {
        token: readOnlyToken,
      }
    : {}),

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
        name: "blog",
        label: "Blog posts",
        path: "src/content/blog",
        format: "md",

        ui: {
          router: ({ document }) => {
            const rawDate = (
              document as {
                _values?: {
                  date?: string;
                };
              }
            )._values?.date;

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
            ui: {
              component: "textarea",
            },
          },
          {
            type: "string",
            name: "description",
            label: "Search description",
            description:
              "Optional summary used for search results and social previews.",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "datetime",
            name: "date",
            label: "Publication date",
            required: true,
          },
          {
            type: "datetime",
            name: "updatedDate",
            label: "Updated date",
            description:
              "Use only when the article has been meaningfully revised.",
          },
          {
            type: "string",
            name: "readTime",
            label: "Reading time",
            required: true,
            description: 'Example: "6 min read"',
          },
          {
            type: "string",
            name: "category",
            label: "Category",
            required: true,
          },
          {
            type: "string",
            name: "author",
            label: "Author",
            description:
              "Defaults to Cadence Lab when no author is entered.",
            ui: {
              defaultValue: "Cadence Lab",
            },
          },
          {
            type: "image",
            name: "image",
            label: "Featured image",
          },
          {
            type: "string",
            name: "imageAlt",
            label: "Image alternative text",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "boolean",
            name: "draft",
            label: "Draft",
            description:
              "Draft articles are excluded from the public site.",
            ui: {
              defaultValue: false,
            },
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
            const breadcrumbs =
              document._sys.breadcrumbs?.filter(Boolean) ?? [];

            const slug =
              breadcrumbs.length > 0
                ? breadcrumbs.join("/")
                : document._sys.filename;

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
            ui: {
              component: "textarea",
            },
          },
          {
            type: "string",
            name: "description",
            label: "Search description",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "string",
            name: "category",
            label: "Category",
            required: true,
          },
          {
            type: "boolean",
            name: "noindex",
            label: "Exclude from search engines",
            ui: {
              defaultValue: false,
            },
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
