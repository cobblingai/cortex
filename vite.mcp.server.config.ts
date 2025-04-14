import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import path from "node:path";
// https://vitejs.dev/config
export default defineConfig({
  build: {
    lib: {
      entry: "src/mcp/server.ts",
      name: "mcp-server",
      fileName: "mcp-server",
    },
    rollupOptions: {
      // external: [
      //   fileURLToPath(
      //     new URL("src/lib/mcp/server/utility-process.js", import.meta.url)
      //   ),
      // ],
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
