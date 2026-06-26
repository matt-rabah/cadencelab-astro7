import { defineConfig } from "astro/config";
import { astroFont } from "astro-font/integration";
import tina from "@tinacms/astro/integration";
import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  output: "static",
  adapter: node({
    mode: "standalone",
  }),
  integrations: [
    tina(),
    astroFont([
      // ==========================================
      // SANS SERIF: Graphik Family
      // ==========================================
      {
        name: "Graphik",
        src: [
          {
            style: "normal",
            weight: "400",
            path: "./public/fonts/Graphik/graphik-regular.woff2",
            preload: true,
          },
          {
            style: "normal",
            weight: "500",
            path: "./public/fonts/Graphik/graphik-medium.woff2",
            preload: false,
          },
          {
            style: "normal",
            weight: "600",
            path: "./public/fonts/Graphik/graphik-semibold.woff2",
            preload: false,
          },
          {
            style: "normal",
            weight: "700",
            path: "./public/fonts/Graphik/graphik-bold.woff2",
            preload: false,
          },
        ],
        display: "swap",
        fallback: "sans-serif",
        cssVariable: "font-graphik",
      },
      {
        name: "Graphik Compact",
        src: [
          {
            style: "normal",
            weight: "400",
            path: "./public/fonts/Graphik/graphik-compact-regular.woff2",
            preload: false,
          },
          {
            style: "normal",
            weight: "700",
            path: "./public/fonts/Graphik/graphik-compact-bold.woff2",
            preload: false,
          },
        ],
        display: "swap",
        fallback: "sans-serif",
        cssVariable: "font-graphik-compact",
      },
      {
        name: "Graphik XX Condensed",
        src: [
          {
            style: "normal",
            weight: "400",
            path: "./public/fonts/Graphik/GraphikXXCond-Regular.woff2",
            preload: false,
          },
          {
            style: "normal",
            weight: "500",
            path: "./public/fonts/Graphik/GraphikXXCond-Medium.woff2",
            preload: false,
          },
          {
            style: "normal",
            weight: "700",
            path: "./public/fonts/Graphik/GraphikXXCond-Bold.woff2",
            preload: false,
          },
        ],
        display: "swap",
        fallback: "sans-serif",
        cssVariable: "font-graphik-xx-condensed",
      },

      // ==========================================
      // SERIF: Tiempos Family
      // ==========================================
      {
        name: "Tiempos Text",
        src: [
          {
            style: "normal",
            weight: "400",
            path: "./public/fonts/Tiempos/tiempos-text-regular.woff2",
            preload: true,
          },
          {
            style: "italic",
            weight: "400",
            path: "./public/fonts/Tiempos/tiempos-text-regular-italic.woff2",
            preload: false,
          },
          {
            style: "normal",
            weight: "500",
            path: "./public/fonts/Tiempos/tiempos-text-medium.woff2",
            preload: false,
          },
          {
            style: "italic",
            weight: "500",
            path: "./public/fonts/Tiempos/tiempos-text-medium-italic.woff2",
            preload: false,
          },
          {
            style: "normal",
            weight: "600",
            path: "./public/fonts/Tiempos/tiempos-text-semibold.woff2",
            preload: false,
          },
        ],
        display: "swap",
        fallback: "serif",
        cssVariable: "font-tiempos-text",
      },
      {
        name: "Tiempos Headline",
        src: [
          {
            style: "normal",
            weight: "300",
            path: "./public/fonts/Tiempos/tiempos-headline-light.woff2",
            preload: false,
          },
          {
            style: "italic",
            weight: "300",
            path: "./public/fonts/Tiempos/tiempos-headline-light-italic.woff",
            preload: false,
          },
        ],
        display: "swap",
        fallback: "serif",
        cssVariable: "font-tiempos-headline",
      },
      {
        name: "Tiempos Fine",
        src: [
          {
            style: "normal",
            weight: "300",
            path: "./public/fonts/Tiempos/tiempos-fine-light.woff2",
            preload: true,
          },
          {
            style: "italic",
            weight: "300",
            path: "./public/fonts/Tiempos/tiempos-fine-light-italic.woff2",
            preload: false,
          },
        ],
        display: "swap",
        fallback: "serif",
        cssVariable: "font-tiempos-fine",
      },
    ]),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      noExternal: ["astro-font"],
    },
  },
});
