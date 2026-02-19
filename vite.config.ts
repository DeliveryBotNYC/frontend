import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4 MiB
      },
      manifest: {
        name: "DBX Delivery",
        short_name: "DBXDelivery",
        description: "Create and manage deliveries.",
        theme_color: "#be9160",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/icons/logo-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/logo-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          turf: ["@turf/turf"],
          leaflet: ["leaflet", "react-leaflet"],
          vendor: ["react", "react-dom"],
        },
      },
    },
  },
});
