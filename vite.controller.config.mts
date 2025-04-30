import { defineConfig } from "vite";
import path from "node:path";
// https://vitejs.dev/config
export default defineConfig({
  build: {
    lib: {
      entry: "src/utility-processes/controller-process/index.ts",
      name: "controller-process",
      fileName: (format) => {
        return `controller-process-${format}.js`;
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
