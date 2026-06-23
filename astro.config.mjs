import { defineConfig } from 'astro/config';
import { storyblok } from '@storyblok/astro';
import { loadEnv } from 'vite';

// Securely load environment variables so Astro 7 can read your token at boot time
const env = loadEnv("", process.cwd(), 'STORYBLOK');

export default defineConfig({
  integrations: [
    // 🌐 YOUR VISUAL EDITING CONTENT ENGINE
    storyblok({
      accessToken: env.STORYBLOK_TOKEN,
      components: {
        page: "storyblok/Page",
        hero: "components/Hero",
        approach: "components/Approach",
        framework: "components/Framework",
      },
      apiOptions: {
        region: 'us',
      }
    })
  ]
});
