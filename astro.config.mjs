import fs from "node:fs";
import path from "node:path";
import { defineConfig, fontProviders } from "astro/config";
import tina from "@tinacms/astro/integration";
import { tinaAdminDevRedirect } from "@tinacms/astro/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

// <lastmod> for blog URLs in the sitemap, read from post frontmatter
// (`updatedDate`, falling back to `date`). The blog index gets the newest one.
// Only blog URLs get a date: other pages have no reliable modified date, and
// Google ignores sitemaps whose lastmod values are not accurate.
const blogLastModified = (() => {
  const dir = "src/content/blog";
  const dates = new Map();
  const field = (frontmatter, name) =>
    frontmatter
      .match(new RegExp(`^${name}:\\s*["']?([^"'\\n]+)`, "m"))?.[1]
      ?.trim();

  for (const file of fs.readdirSync(dir)) {
    if (!/\.mdx?$/.test(file)) continue;
    const frontmatter =
      fs.readFileSync(path.join(dir, file), "utf8").split(/^---\s*$/m)[1] ?? "";
    if (field(frontmatter, "draft") === "true") continue;

    const published = new Date(field(frontmatter, "date") ?? "");
    if (Number.isNaN(published.getTime())) continue;
    const updated = new Date(field(frontmatter, "updatedDate") ?? "");
    const modified = Number.isNaN(updated.getTime()) ? published : updated;

    const year = published.getUTCFullYear();
    const month = String(published.getUTCMonth() + 1).padStart(2, "0");
    const slug = file.replace(/\.mdx?$/, "");
    dates.set(`https://cadencelab.co/blog/${year}/${month}/${slug}/`, modified);
  }

  const newest = [...dates.values()].sort((a, b) => b - a)[0];
  if (newest) dates.set("https://cadencelab.co/blog/", newest);

  return new Map([...dates].map(([url, date]) => [url, date.toISOString()]));
})();

// Appends the blog redirect rules (src/pages/blog-redirects.txt.ts) to
// Cloudflare's dist/_redirects after the build, then removes the generated file.
const blogRedirects = {
  name: "blog-redirects",
  hooks: {
    "astro:build:done": ({ dir }) => {
      const rulesFile = new URL("blog-redirects.txt", dir);
      const redirectsFile = new URL("_redirects", dir);
      const rules = fs.readFileSync(rulesFile, "utf8");
      fs.rmSync(rulesFile);
      if (!rules.trim()) return;

      const existing = fs.existsSync(redirectsFile)
        ? fs.readFileSync(redirectsFile, "utf8")
        : "";
      const separator = existing && !existing.endsWith("\n") ? "\n" : "";
      fs.writeFileSync(
        redirectsFile,
        `${existing}${separator}\n# Blog posts whose URL changed (redirectFrom)\n${rules}`,
      );
    },
  },
};

const excludedSitemapPages = new Set([
  "https://cadencelab.co/404/",
  "https://cadencelab.co/search/",
  "https://cadencelab.co/thanks/",
]);

export default defineConfig({
  output: "static",
  site: "https://cadencelab.co",

  security: {
    csp: {
      algorithm: "SHA-256",
      directives: [
        "base-uri 'none'",
        "form-action 'self'",
        "object-src 'none'",
      ],
      scriptDirective: {
        resources: [
          { resource: "'none'", kind: "attribute" },
          // Listing any script-src resource replaces Astro's default 'self',
          // so it must be listed explicitly. Without it the browser blocks
          // every same-origin script (the site's own bundles and Rocket Loader).
          "'self'",
          // Cloudflare Web Analytics beacon. Google Analytics runs in Cloudflare
          // Zaraz (server-side; its loader is served from /cdn-cgi/zaraz/), so
          // no Google script host is needed.
          "https://static.cloudflareinsights.com",
          // Allows the inline <script type="speculationrules"> in Layout.astro
          // (Astro does not hash it). Covers speculation rules only, never
          // executable inline script.
          "'inline-speculation-rules'",
        ],
      },
      styleDirective: {
        resources: [{ resource: "'unsafe-inline'", kind: "attribute" }],
      },
    },
  },

  fonts: [
    {
      provider: fontProviders.local(),
      name: "Graphik",
      cssVariable: "--font-graphik",
      fallbacks: ["Helvetica Neue", "Arial", "sans-serif"],
      options: {
        variants: [
          {
            weight: 400,
            style: "normal",
            src: ["./src/assets/fonts/graphik-regular.woff2"],
          },
          {
            weight: 500,
            style: "normal",
            src: ["./src/assets/fonts/graphik-medium.woff2"],
          },
          {
            weight: 600,
            style: "normal",
            src: ["./src/assets/fonts/graphik-semibold.woff2"],
          },
        ],
      },
    },

    {
      provider: fontProviders.local(),
      name: "Tiempos Text",
      cssVariable: "--font-tiempos-text",
      fallbacks: ["Georgia", "Times New Roman", "serif"],
      options: {
        variants: [
          {
            weight: 400,
            style: "normal",
            src: ["./src/assets/fonts/tiempos-text-regular.woff2"],
          },
          {
            weight: 400,
            style: "italic",
            src: ["./src/assets/fonts/tiempos-text-regular-italic.woff2"],
          },
          {
            weight: 500,
            style: "normal",
            src: ["./src/assets/fonts/tiempos-text-medium.woff2"],
          },
          {
            weight: 500,
            style: "italic",
            src: ["./src/assets/fonts/tiempos-text-medium-italic.woff2"],
          },
        ],
      },
    },

    {
      provider: fontProviders.local(),
      name: "Tiempos Headline",
      cssVariable: "--font-tiempos-headline",
      fallbacks: ["Georgia", "Times New Roman", "serif"],
      options: {
        variants: [
          {
            weight: 300,
            style: "normal",
            src: ["./src/assets/fonts/tiempos-headline-light.woff2"],
          },
          {
            weight: 300,
            style: "italic",
            src: ["./src/assets/fonts/tiempos-headline-light-italic.woff2"],
          },
        ],
      },
    },
  ],

  integrations: [
    react(),
    tina(),
    blogRedirects,
    sitemap({
      filter: (page) => !excludedSitemapPages.has(page),
      serialize(item) {
        const lastmod = blogLastModified.get(item.url);
        if (lastmod) item.lastmod = lastmod;
        return item;
      },
    }),
  ],

  vite: {
    plugins: [tailwindcss(), tinaAdminDevRedirect()],
  },
});
