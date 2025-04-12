import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import path from "node:path";
// https://vitejs.dev/config
export default defineConfig({
  build: {
    lib: {
      entry: "src/mcp/client.ts",
      name: "mcp-client",
      fileName: "mcp-client",
    },
    rollupOptions: {
      external: [
        fileURLToPath(
          new URL("src/lib/mcp/client/utility-process.js", import.meta.url)
        ),
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
