import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://web-production-cfc0.up.railway.app",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
