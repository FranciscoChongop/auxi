import { useSyncExternalStore } from "react";

/** Navegación mínima sin librerías: rutas simples con parámetros en la URL. */
const oyentes = new Set<() => void>();

function suscribir(o: () => void) {
  oyentes.add(o);
  window.addEventListener("popstate", o);
  return () => {
    oyentes.delete(o);
    window.removeEventListener("popstate", o);
  };
}

function avisar() {
  window.scrollTo(0, 0);
  oyentes.forEach((o) => o());
}

export function navegar(ruta: string) {
  if (ruta === window.location.pathname + window.location.search) return;
  window.history.pushState(null, "", ruta);
  avisar();
}

/** Cambia de pantalla sin dejar la anterior en el historial (por ejemplo, al terminar una lección). */
export function reemplazar(ruta: string) {
  window.history.replaceState(null, "", ruta);
  avisar();
}

export function volver(porDefecto = "/studio/inicio") {
  if (window.history.length > 1) window.history.back();
  else reemplazar(porDefecto);
}

export function useRuta() {
  return useSyncExternalStore(suscribir, () => window.location.pathname);
}

export function parametro(nombre: string) {
  return new URLSearchParams(window.location.search).get(nombre);
}

/** Ruta con parámetros (?tipo=…): sirve cuando una misma pantalla cambia según la búsqueda. */
export function useRutaCompleta() {
  return useSyncExternalStore(suscribir, () => window.location.pathname + window.location.search);
}
