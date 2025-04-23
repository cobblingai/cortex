import { defineConfig } from "vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config
export default defineConfig({
  build: {
    lib: {
      entry: "./src/main/index.ts",
      name: "cortex",
      formats: ["es"],
      fileName: (format, entryName) => {
        return `${entryName}-${format}.js`;
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
