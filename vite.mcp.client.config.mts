import { defineConfig } from "vite";
import path from "node:path";
// https://vitejs.dev/config
export default defineConfig({
  build: {
    lib: {
      entry: "src/scripts/client.ts",
      name: "mcp-client",
      fileName: "mcp-client",
    },
    rollupOptions: {
      // external: [
      //   fileURLToPath(
      //     new URL("src/lib/mcp/client/utility-process.js", import.meta.url)
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
