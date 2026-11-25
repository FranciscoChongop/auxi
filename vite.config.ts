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
      includeAssets: ["icons/apple-touch-icon.png", "icons/favicon-32.png", "student.webmanifest", "vida.webmanifest", "icons/student-*.png", "icons/vida-*.png"],
      manifest: {
        // Cada mini app tiene además su propio manifiesto (public/student.webmanifest y public/vida.webmanifest):
        // la app cambia el enlace según la ruta, así se instala «Auxi Student» o «Auxi Vida» con su ícono.
        id: "/",
        name: "Auxi Studio",
        short_name: "Auxi Studio",
        description: "Mini apps gratis de Daniel Chong: estudia jugando y ordena tu plata.",
        lang: "es-PE",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#080E25",
        theme_color: "#080E25",
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
