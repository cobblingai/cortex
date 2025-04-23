import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config
export default defineConfig({
  build: {
    // target: "esnext",
    lib: {
      entry: "src/scripts/servers/filesystem.ts",
      name: "filesystem-server",
      formats: ["es"],
      fileName: (format, entryName) => {
        return `${entryName}-${format}.js`;
      },
    },
    // rollupOptions: {
    //   external: ["electron", "fs", "path", "os"],
    //   output: {
    //     inlineDynamicImports: true,
    //   },
    // },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
