import { defineConfig } from 'astro/config';
import tina from '@tinacms/astro/integration';

export default defineConfig({
  integrations: [
    tina()
  ]
});
