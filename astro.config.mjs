import { defineConfig } from "astro/config";
import astroFont from "astro-font";

export default defineConfig({
  integrations: [
    astroFont([
      {
        name: "Graphik",
        src: [
          // CRITICAL: Only preload regular for immediate UI/navigation rendering
          {
            style: "normal",
            weight: "400",
            path: "./public/fonts/graphik-regular.woff2",
            preload: true,
          },
          {
            style: "normal",
            weight: "500",
            path: "./public/fonts/graphik-medium.woff2",
            preload: false,
          },
          {
            style: "normal",
            weight: "600",
            path: "./public/fonts/graphik-semibold.woff2",
            preload: false,
          },
          {
            style: "normal",
            weight: "700",
            path: "./public/fonts/graphik-bold.woff2",
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
            path: "./public/fonts/graphik-compact-regular.woff2",
            preload: false,
          },
          {
            style: "normal",
            weight: "700",
            path: "./public/fonts/graphik-compact-bold.woff2",
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
            path: "./public/fonts/graphik-xx-condensed-regular.woff2",
            preload: false,
          },
          {
            style: "normal",
            weight: "500",
            path: "./public/fonts/graphik-xx-condensed-medium.woff2",
            preload: false,
          },
          {
            style: "normal",
            weight: "700",
            path: "./public/fonts/graphik-xx-condensed-bold.woff2",
            preload: false,
          },
        ],
        display: "swap",
        fallback: "sans-serif",
        cssVariable: "font-graphik-xx-condensed",
      },
      {
        name: "Tiempos Text",
        src: [
          // CRITICAL: Preload the regular weight for body copy readability paths
          {
            style: "normal",
            weight: "400",
            path: "./public/fonts/tiempos-text-regular.woff2",
            preload: true,
          },
          {
            style: "italic",
            weight: "400",
            path: "./public/fonts/tiempos-text-regular-italic.woff2",
            preload: false,
          },
          {
            style: "normal",
            weight: "500",
            path: "./public/fonts/tiempos-text-medium.woff2",
            preload: false,
          },
          {
            style: "italic",
            weight: "500",
            path: "./public/fonts/tiempos-text-medium-italic.woff2",
            preload: false,
          },
          {
            style: "normal",
            weight: "600",
            path: "./public/fonts/tiempos-text-semibold.woff2",
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
            path: "./public/fonts/tiempos-headline-light.woff2",
            preload: false,
          },
          {
            style: "italic",
            weight: "300",
            path: "./public/fonts/tiempos-headline-light-italic.woff",
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
          // If Tiempos Fine Light is always used in your Hero H1 above the fold, change preload to true here
          {
            style: "normal",
            weight: "300",
            path: "./public/fonts/tiempos-fine-light.woff2",
            preload: true,
          },
          {
            style: "italic",
            weight: "300",
            path: "./public/fonts/tiempos-fine-light-italic.woff2",
            preload: false,
          },
        ],
        display: "swap",
        fallback: "serif",
        cssVariable: "font-tiempos-fine",
      },
    ]),
  ],
});
