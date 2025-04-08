import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
  build: {
    lib: {
      entry: "src/mcp/server.ts",
      name: "mcp-server",
      fileName: "server.js",
    },
  },
});
