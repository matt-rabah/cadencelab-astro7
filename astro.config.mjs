import { defineConfig } from 'astro/config';
import astroFont from 'astro-font';
import { storyblok } from '@storyblok/astro';
import { loadEnv } from 'vite';

// Securely load environment variables so Astro 7 can read your token at boot time
const env = loadEnv("", process.cwd(), 'STORYBLOK');

export default defineConfig({
  integrations: [
    // 🎨 1. YOUR PREMIUM EDITORIAL TYPOGRAPHY ENGINE
    astroFont([
      {
        name: "Tiempos Text",
        src: [
          { style: 'normal', weight: '400', path: './public/fonts/tiempos/tiempos-text/tiempos-text-regular.woff2' },
          { style: 'italic', weight: '400', path: './public/fonts/tiempos/tiempos-text/tiempos-text-regular-italic.woff2' },
          { style: 'normal', weight: '500', path: './public/fonts/tiempos/tiempos-text/tiempos-text-medium.woff2' },
          { style: 'italic', weight: '500', path: './public/fonts/tiempos/tiempos-text/tiempos-text-medium-italic.woff2' },
          { style: 'normal', weight: '600', path: './public/fonts/tiempos/tiempos-text/tiempos-text-semibold.woff2' }
        ],
        preload: true,
        display: "swap",
        fallback: "serif",
        cssVariable: "font-serif-text"
      },
      {
        name: "Tiempos Headline",
        src: [{ style: 'normal', weight: '700', path: './public/fonts/tiempos/tiempos-headline/tiempos-headline-bold.woff2' }],
        preload: true,
        display: "swap",
        fallback: "serif",
        cssVariable: "font-serif-heading"
      },
      {
        name: "Tiempos Fine",
        src: [{ style: 'normal', weight: '700', path: './public/fonts/tiempos/tiempos-fine/tiempos-fine-bold.woff2' }],
        preload: true,
        display: "swap",
        fallback: "serif",
        cssVariable: "font-serif-fine"
      },
      {
        name: "Graphik",
        src: [
          { style: 'normal', weight: '400', path: './public/fonts/graphik/graphik-normal/graphik-regular.woff2' },
          { style: 'normal', weight: '500', path: './public/fonts/graphik/graphik-normal/graphik-medium.woff2' },
          { style: 'normal', weight: '600', path: './public/fonts/graphik/graphik-normal/graphik-semibold.woff2' },
          { style: 'normal', weight: '700', path: './public/fonts/graphik/graphik-normal/graphik-bold.woff2' }
        ],
        preload: true,
        display: "swap",
        fallback: "sans-serif",
        cssVariable: "font-sans"
      },
      {
        name: "Graphik Condensed",
        src: [{ style: 'normal', weight: '500', path: './public/fonts/graphik/graphik-condensed/graphik-condensed-medium.woff2' }],
        preload: true,
        display: "swap",
        fallback: "sans-serif",
        cssVariable: "font-sans-cond"
      }
    ]),

    // 🌐 2. YOUR VISUAL EDITING CONTENT ENGINE
    storyblok({
      accessToken: env.STORYBLOK_TOKEN,
      components: {
        // This maps your Storyblok content blueprints to your actual Astro components
        page: "storyblok/Page",
        hero: "components/Hero",
        approach: "components/Approach",
        framework: "components/Framework",
      },
      apiOptions: {
        region: 'us', // Switch to 'eu' if your Storyblok account space was initialized in Europe
      }
    })
  ]
});
