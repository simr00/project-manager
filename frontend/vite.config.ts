import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],

  resolve: {
    tsconfigPaths: true,
    alias: {
      "react-is": path.resolve(__dirname, "node_modules/react-is"),
    },
  },

  optimizeDeps: {
    include: ["react-is"],
  },

  build: {
    commonjsOptions: {
      include: [/node_modules/, /react-is/],
    },
  },
});
