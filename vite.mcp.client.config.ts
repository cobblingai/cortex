import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
  build: {
    lib: {
      entry: "src/mcp/client.ts",
      name: "mcp-client",
      fileName: "client.js",
    },
  },
});
