import { defineConfig, transformWithEsbuild } from "vite";
import react from "@vitejs/plugin-react";

// CRA used JSX inside .js files; teach Vite/esbuild to parse those as JSX.
function jsxInJs() {
  return {
    name: "jsx-in-js",
    enforce: "pre",
    async transform(code, id) {
      if (!id.includes("/src/") || !id.endsWith(".js")) {
        return null;
      }
      return transformWithEsbuild(code, id, {
        loader: "jsx",
        jsx: "automatic",
      });
    },
  };
}

export default defineConfig({
  plugins: [jsxInJs(), react()],
  server: {
    port: 3000,
    proxy: {
      // Optional: forward API calls to the local backend
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },
  build: {
    outDir: "build",
  },
});
