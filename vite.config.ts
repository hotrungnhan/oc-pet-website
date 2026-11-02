import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/oc-pet-website/",
  build: {
    rollupOptions: {
      input: {
        index: fileURLToPath(new URL("./index.html", import.meta.url)),
        terms: fileURLToPath(new URL("./terms.html", import.meta.url)),
        privacy: fileURLToPath(new URL("./privacy.html", import.meta.url)),
      },
    },
  },
});
