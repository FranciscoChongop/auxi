import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/apple-touch-icon.png", "icons/favicon-32.png"],
      manifest: {
        name: "Auxi Studio",
        short_name: "Auxi Studio",
        description: "Mini apps gratis de Daniel Chong: estudia jugando y ordena tu plata.",
        lang: "es-PE",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#F7F8FC",
        theme_color: "#F7F8FC",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,woff2}", "leon/*.webp", "leon/caras/*.webp"],
        // Los lectores de PDF e imágenes son pesados: se descargan solo cuando alguien los usa.
        globIgnores: ["**/pdf.worker*", "**/pdf-*.js", "**/tesseract*", "**/worker.min*"],
        navigateFallback: "/index.html",
      },
    }),
  ],
});
