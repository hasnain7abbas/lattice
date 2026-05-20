import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// @ts-ignore - process is a Node global available at build time
const host = process.env.TAURI_DEV_HOST;
// @ts-ignore
const isPages = process.env.GITHUB_PAGES === "true";

export default defineConfig(async () => ({
  plugins: [react()],
  clearScreen: false,
  base: isPages ? "/lattice/" : "/",
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host ? { protocol: "ws", host, port: 1421 } : undefined,
    watch: { ignored: ["**/src-tauri/**"] },
  },
}));
