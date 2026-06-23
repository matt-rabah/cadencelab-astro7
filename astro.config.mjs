import { defineConfig } from 'astro/config';
import astroFont from 'astro-font';

export default defineConfig({
  // Inject the font orchestration engine into Astro's compilation pipeline
  integrations: [
    astroFont([
      // 1. TIEMPOS TEXT (Body/Editorial Copy)
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
        cssVariable: "font-serif-text" // Exposes as var(--font-serif-text)
      },
      // 2. TIEMPOS HEADLINE (Section Headers)
      {
        name: "Tiempos Headline",
        src: [
          { style: 'normal', weight: '700', path: './public/fonts/tiempos/tiempos-headline/tiempos-headline-bold.woff2' } // Add extra weights here if owned
        ],
        preload: true,
        display: "swap",
        fallback: "serif",
        cssVariable: "font-serif-heading"
      },
      // 3. TIEMPOS FINE (Large Hero Statements)
      {
        name: "Tiempos Fine",
        src: [
          { style: 'normal', weight: '700', path: './public/fonts/tiempos/tiempos-fine/tiempos-fine-bold.woff2' }
        ],
        preload: true,
        display: "swap",
        fallback: "serif",
        cssVariable: "font-serif-fine"
      },
      // 4. GRAPHIK NORMAL (Core Utility UI, Inputs, Buttons)
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
      // 5. GRAPHIK CONDENSED (Data, Metrics, Labels)
      {
        name: "Graphik Condensed",
        src: [
          { style: 'normal', weight: '500', path: './public/fonts/graphik/graphik-condensed/graphik-condensed-medium.woff2' }
        ],
        preload: true,
        display: "swap",
        fallback: "sans-serif",
        cssVariable: "font-sans-cond"
      },
      // 6. GRAPHIK COMPACT
      {
        name: "Graphik Compact",
        src: [
          { style: 'normal', weight: '400', path: './public/fonts/graphik/graphik-normal/graphik-compact-regular.woff2' }
        ],
        preload: false,
        display: "swap",
        fallback: "sans-serif",
        cssVariable: "font-sans-compact"
      },
      // 7. GRAPHIK XXCOND (Extra Condensed Accents)
      {
        name: "Graphik XXCond",
        src: [
          { style: 'normal', weight: '400', path: './public/fonts/graphik/graphik-normal/GraphikXXCond-Regular.woff2' }
        ],
        preload: false,
        display: "swap",
        fallback: "sans-serif",
        cssVariable: "font-sans-xxcond"
      }
    ])
  ]
});
