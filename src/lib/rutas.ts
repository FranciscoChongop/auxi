import { useSyncExternalStore } from "react";

/** Navegación mínima sin librerías. En la Fase 2 se cambia por un enrutador completo si hace falta. */
const oyentes = new Set<() => void>();

function suscribir(o: () => void) {
  oyentes.add(o);
  window.addEventListener("popstate", o);
  return () => {
    oyentes.delete(o);
    window.removeEventListener("popstate", o);
  };
}

export function navegar(ruta: string) {
  if (ruta === window.location.pathname) return;
  window.history.pushState(null, "", ruta);
  window.scrollTo(0, 0);
  oyentes.forEach((o) => o());
}

export function useRuta() {
  return useSyncExternalStore(suscribir, () => window.location.pathname);
}
