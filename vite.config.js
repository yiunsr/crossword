import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  server: {
    host: "0.0.0.0",
    port: 9000,
  },
  build: {
    rollupOptions: {
      input: {
        index: "index.html",
        popup: "popup.html",
        options: "options.html",
      },
    },
  },
});
