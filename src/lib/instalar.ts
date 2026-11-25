/**
 * Instalar en la pantalla de inicio («Agregar a inicio»).
 *
 * Un mismo dominio tiene tres apps instalables: la plataforma (Auxi Studio, «/»), Auxi Student («/student»)
 * y Auxi Vida («/vida»). Según la ruta se cambia el manifiesto, el nombre y el ícono que lee el celular,
 * así quien instala desde Student tiene «Auxi Student» con su León, y lo mismo con Vida. Todas comparten
 * el dominio, así que la sesión es una sola.
 *
 * En Android (Chrome) se guarda el aviso de instalación para poder lanzarlo con un botón propio.
 * En iPhone no existe ese aviso: se muestra la guía de 3 pasos (Compartir → Agregar a inicio).
 */
import { useSyncExternalStore } from "react";

export type AppInstalable = "plataforma" | "student" | "vida";

const IDENTIDAD: Record<AppInstalable, { manifiesto: string; nombre: string; icono: string; color: string | null }> = {
  // La plataforma deja el color como esté (la portada lo pone oscuro mientras se ve).
  plataforma: { manifiesto: "/manifest.webmanifest", nombre: "Auxi Studio", icono: "/icons/apple-touch-icon.png", color: null },
  student: { manifiesto: "/student.webmanifest", nombre: "Auxi Student", icono: "/icons/student-apple-180.png", color: "#F7F8FC" },
  vida: { manifiesto: "/vida.webmanifest", nombre: "Auxi Vida", icono: "/icons/vida-apple-180.png", color: "#F3FAF8" },
};

export function appDeRuta(ruta: string): AppInstalable {
  if (ruta === "/student" || ruta.startsWith("/student/")) return "student";
  if (ruta === "/vida" || ruta.startsWith("/vida/")) return "vida";
  return "plataforma";
}

/** Busca la etiqueta del <head> y la crea si no existe (en desarrollo el plugin PWA no pone el manifiesto). */
function etiqueta<T extends HTMLElement>(selector: string, crear: () => T): T {
  return (document.head.querySelector(selector) as T | null) ?? document.head.appendChild(crear());
}

/** Pone el manifiesto, el nombre y el ícono de la app que se está viendo. */
export function aplicarIdentidad(app: AppInstalable) {
  if (typeof document === "undefined") return;
  const id = IDENTIDAD[app];
  const manifiesto = etiqueta<HTMLLinkElement>('link[rel="manifest"]', () => Object.assign(document.createElement("link"), { rel: "manifest" }));
  if (manifiesto.getAttribute("href") !== id.manifiesto) manifiesto.setAttribute("href", id.manifiesto);
  etiqueta<HTMLMetaElement>('meta[name="apple-mobile-web-app-title"]', () => Object.assign(document.createElement("meta"), { name: "apple-mobile-web-app-title" })).content = id.nombre;
  etiqueta<HTMLLinkElement>('link[rel="apple-touch-icon"]', () => Object.assign(document.createElement("link"), { rel: "apple-touch-icon" })).href = id.icono;
  if (id.color) ponerColorDeBarra(id.color);
}

/** Color de la barra del navegador y del sistema (Android). */
export function ponerColorDeBarra(color: string) {
  if (typeof document === "undefined") return "";
  const meta = etiqueta<HTMLMetaElement>('meta[name="theme-color"]', () => Object.assign(document.createElement("meta"), { name: "theme-color" }));
  const anterior = meta.content;
  meta.content = color;
  return anterior;
}

/* ---------- Aviso de instalación de Android ---------- */

type EventoInstalar = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

let evento: EventoInstalar | null = null;
const oyentes = new Set<() => void>();
const avisar = () => oyentes.forEach((f) => f());

if (typeof window !== "undefined") {
  // No se cancela: Chrome puede seguir mostrando su propia barrita, y además lo guardamos para nuestro botón.
  window.addEventListener("beforeinstallprompt", (e) => {
    evento = e as EventoInstalar;
    avisar();
  });
  window.addEventListener("appinstalled", () => {
    evento = null;
    avisar();
  });
}

/** true si Chrome ya ofreció instalar y se puede lanzar con un toque. */
export function usePuedeInstalarDirecto() {
  return useSyncExternalStore(
    (f) => {
      oyentes.add(f);
      return () => oyentes.delete(f);
    },
    () => evento !== null,
    () => false,
  );
}

/** Lanza el aviso de instalación de Chrome. Devuelve true si la persona aceptó. */
export async function instalarDirecto() {
  if (!evento) return false;
  const e = evento;
  evento = null;
  avisar();
  await e.prompt();
  return (await e.userChoice).outcome === "accepted";
}

export const esAndroid = typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);
