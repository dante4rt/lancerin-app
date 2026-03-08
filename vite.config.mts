import path from "node:path";
import { defineConfig } from "vite";
import vinext from "vinext";

export default defineConfig({
  plugins: [vinext()],
  resolve: {
    alias: {
      "@panva/hkdf": path.resolve(__dirname, "src/shims/panva-hkdf.ts"),
    },
  },
});
