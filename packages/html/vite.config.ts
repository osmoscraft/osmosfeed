import { defineConfig } from "vite";

// This config is used for building the server, which at runtime, will build the client
export default defineConfig({
  build: {
    rollupOptions: {
      external: ["fs/promises", "vite"],
    },
  },
});
