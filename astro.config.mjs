import { defineConfig } from "astro/config";
import tina from "@tinacms/astro/integration";
import node from "@astrojs/node";

export default defineConfig({
  adapter: node({
    mode: "standalone",
  }),
  integrations: [tina()],
});
