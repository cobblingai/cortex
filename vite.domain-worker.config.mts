import { defineConfig } from "vite";
import path from "node:path";
// https://vitejs.dev/config
export default defineConfig({
  build: {
    lib: {
      entry: "src/utility-processes/domain-worker/index.ts",
      name: "domain-worker",
      fileName: (format) => {
        return `domain-worker-${format}.js`;
      },
    },
    rollupOptions: {
      external: ["electron"],
      // , "fs", "path", "os"
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
