// tina/config.ts
import { defineConfig } from "tinacms";
var branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || "main";
var config_default = defineConfig({
  branch,
  clientId: process.env.TINA_CLIENT_ID || "0322f8bd-f97c-4ef3-a3d6-013ce0f824fc",
  token: process.env.TINA_READ_ONLY_TOKEN || "79c07460d61d4534d4e576c7bf8eb9917ed00cae",
  build: {
    publicFolder: "public",
    outputFolder: "admin"
  },
  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "public"
    }
  },
  search: {
    tina: {
      indexerToken: process.env.TINA_SEARCH_TOKEN || "12b5c178c053f337637f653ccfd16a3af6510701",
      stopwordLanguages: ["eng"]
    },
    indexBatchSize: 100
  },
  schema: {
    collections: [
      {
        name: "post",
        label: "Blog Posts",
        path: "src/content/blog",
        format: "md",
        ui: {
          router: ({ document }) => {
            const date = new Date(document._values?.date || /* @__PURE__ */ new Date());
            const year = date.getUTCFullYear().toString();
            const month = String(date.getUTCMonth() + 1).padStart(2, "0");
            const slug = document._sys.filename;
            return `/blog/${year}/${month}/${slug}/`;
          }
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true
          },
          {
            type: "string",
            name: "subtitle",
            label: "Subtitle",
            required: true
          },
          {
            type: "datetime",
            name: "date",
            label: "Date",
            required: true
          },
          {
            type: "string",
            name: "readTime",
            label: "Read Time",
            required: true
          },
          {
            type: "string",
            name: "category",
            label: "Category",
            required: true
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true
          }
        ]
      },
      {
        name: "page",
        label: "Pages",
        path: "src/content/pages",
        format: "md",
        ui: {
          router: ({ document }) => {
            if (document._sys.filename === "home") {
              return `/`;
            }
            return `/${document._sys.filename}`;
          }
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true
          },
          {
            type: "string",
            name: "subtitle",
            label: "Subtitle",
            required: true
          },
          {
            type: "string",
            name: "category",
            label: "Category",
            required: true
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true
          }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
