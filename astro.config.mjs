import { defineConfig, fontProviders } from "astro/config";
import tina from "@tinacms/astro/integration";
import { tinaAdminDevRedirect } from "@tinacms/astro/vite";
import tailwindcss from "@tailwindcss/vite";

import sitemap from "@astrojs/sitemap";

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
        resources: [{ resource: "'none'", kind: "attribute" }],
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

  integrations: [tina(), sitemap()],

  vite: {
    plugins: [tailwindcss(), tinaAdminDevRedirect()],
  },
});
