/// <reference types="vitest" />

import path, { resolve } from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { vitePluginForArco } from "@arco-plugins/vite-vue";
import manifest from "./manifest.json";

let sourcemap = false;
if (process.env.npm_lifecycle_event?.endsWith(":test")) {
  sourcemap = true;
}

const getCRXVersion = () => {
  if (process.env.CRX_VER) {
    let ver = process.env.CRX_VER;
    if (ver.startsWith("v")) {
      ver = ver.slice(1);
    }
    return ver.slice(0, 14);
  }
  return "0.0.0-dev";
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vitePluginForArco({
      style: "css",
    }),
    {
      name: "manifest",
      generateBundle(outputOption, bundle) {
        const entry = Object.values(bundle).find(
          (chunk) =>
            chunk.type == "chunk" && chunk.isEntry && chunk.name == "background"
        );
        manifest.version = getCRXVersion().split("-", 1)[0];
        manifest.version_name = getCRXVersion();
        manifest.background.service_worker = (entry as any).fileName;

        this.emitFile({
          type: "asset",
          fileName: "manifest.json",
          source: JSON.stringify(manifest, undefined, 2),
        });
      },
    },
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
      },
    },
  },
  test: {},
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        popup: resolve(__dirname, "popup.html"),
        background: "src/background.ts",
      },
    },
    sourcemap,
  },
});
