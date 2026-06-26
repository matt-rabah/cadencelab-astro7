/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        'graphik': ['var(--font-graphik)', 'sans-serif'],
        'graphik-compact': ['var(--font-graphik-compact)', 'sans-serif'],
        'graphik-condensed': ['var(--font-graphik-xx-condensed)', 'sans-serif'],
        'tiempos-text': ['var(--font-tiempos-text)', 'serif'],
        'tiempos-headline': ['var(--font-tiempos-headline)', 'serif'],
        'tiempos-fine': ['var(--font-tiempos-fine)', 'serif'],
      },
      fontSize: {
        // clamp fluid rules: min, dynamic viewport reference, max
        'fluid-display': 'clamp(2.25rem, 1.25rem + 4vw, 4.5rem)',
        'fluid-headline': 'clamp(1.75rem, 1.125rem + 2.5vw, 3rem)',
        'fluid-subhead': 'clamp(1.25rem, 1rem + 1vw, 1.75rem)',
        'fluid-body': 'clamp(1rem, 0.95rem + 0.25vw, 1.125rem)',
        'fluid-meta': '0.875rem',
      },
      letterSpacing: {
        'display': '-0.02em',
        'headline': '-0.01em',
        'ui': '0.01em',
        'expanded': '0.12em',
      },
      lineHeight: {
        'display': '1.05',
        'headline': '1.15',
        'subhead': '1.25',
        'editorial': '1.65',
      }
    },
  },
  plugins: [],
};
