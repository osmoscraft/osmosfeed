import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// This config is used for building the server, which at runtime, will build the client
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: ["fs/promises", "vite"],
    },
  },
});
