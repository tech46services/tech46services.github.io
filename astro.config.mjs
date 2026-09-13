import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://tech46services.fr",
  output: "static",
  build: {
    format: "file",
  },
});
