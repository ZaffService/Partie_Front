import { defineConfig } from "vite"

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    cors: true,
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: true,
  },
  optimizeDeps: {
    include: [],
  },
})
