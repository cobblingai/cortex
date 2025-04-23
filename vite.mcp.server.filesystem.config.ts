import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import path from "node:path";
// https://vitejs.dev/config
export default defineConfig({
  build: {
    target: "esnext",
    lib: {
      entry: "src/scripts/servers/filesystem.mts",
      name: "filesystem-server",
      formats: ["es"],
      fileName: (format, entryName) => {
        return `${entryName}-${format}.js`;
      },
    },
    rollupOptions: {
      external: ["electron", "fs", "path", "os", "zod", "zod-to-json-schema"],
      output: {
        inlineDynamicImports: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
