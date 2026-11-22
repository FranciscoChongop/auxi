import type { IncomingMessage } from "node:http";
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

/**
 * En desarrollo, sirve las funciones de /api igual que Vercel en producción.
 * La clave se lee de .env.local (que nunca se sube a GitHub).
 */
function funcionesLocales(): Plugin {
  return {
    name: "auxi-funciones-locales",
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), "");
      if (env.ANTHROPIC_API_KEY) process.env.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY;
      server.middlewares.use("/api/leer-horario", async (req: IncomingMessage, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end();
          return;
        }
        const partes: Buffer[] = [];
        for await (const parte of req) partes.push(parte as Buffer);
        const modulo = (await server.ssrLoadModule("/api/leer-horario.ts")) as { POST: (r: Request) => Promise<Response> };
        const r = await modulo.POST(
          new Request("http://localhost/api/leer-horario", { method: "POST", headers: { "content-type": "application/json" }, body: Buffer.concat(partes) }),
        );
        res.statusCode = r.status;
        res.setHeader("content-type", "application/json");
        res.end(await r.text());
      });
    },
  };
}

export default defineConfig({
  plugins: [
    funcionesLocales(),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/apple-touch-icon.png", "icons/favicon-32.png"],
      manifest: {
        name: "Auxi Studio",
        short_name: "Auxi",
        description: "Sube lo que te dejaron y estudia jugando con León.",
        lang: "es-PE",
        start_url: "/studio",
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
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
});
