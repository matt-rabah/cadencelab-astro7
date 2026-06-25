import { defineConfig } from 'astro/config';
import tina from '@tinacms/astro/integration';
import node from '@astrojs/node';

export default defineConfig({
  output: 'hybrid',
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [
    tina()
  ]
});
