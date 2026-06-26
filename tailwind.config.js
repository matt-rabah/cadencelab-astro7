/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        graphik: ["var(--font-graphik)", "sans-serif"],
        "graphik-compact": ["var(--font-graphik-compact)", "sans-serif"],
        "graphik-condensed": ["var(--font-graphik-xx-condensed)", "sans-serif"],
        "tiempos-text": ["var(--font-tiempos-text)", "serif"],
        "tiempos-headline": ["var(--font-tiempos-headline)", "serif"],
        "tiempos-fine": ["var(--font-tiempos-fine)", "serif"],
      },
      fontSize: {
        // fluid sizing: clamp(min, preferred, max)
        "fluid-display": "clamp(2.25rem, 1.25rem + 4vw, 4.5rem)", // Tiempos Fine H1
        "fluid-headline": "clamp(1.75rem, 1.125rem + 2.5vw, 3rem)", // Tiempos Headline H2
        "fluid-subhead": "clamp(1.25rem, 1rem + 1vw, 1.75rem)", // Graphik Subheads
        "fluid-body": "clamp(1rem, 0.95rem + 0.25vw, 1.125rem)", // Tiempos Text Body
        "fluid-meta": "0.875rem", // Stationary UI text
      },
      letterSpacing: {
        display: "-0.02em",
        headline: "-0.01em",
        ui: "0.01em",
        expanded: "0.12em",
      },
      lineHeight: {
        display: "1.05",
        headline: "1.15",
        subhead: "1.25",
        editorial: "1.65", // Expanded slightly to prevent line collision on mobile fluid layouts
      },
    },
  },
};
