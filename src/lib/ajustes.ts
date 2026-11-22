import { useSyncExternalStore } from "react";

/** Ajustes de la persona que se guardan en este dispositivo. */
export type Ajustes = {
  sonido: boolean;
  vibracion: boolean;
};

const CLAVE = "auxi.ajustes";
const POR_DEFECTO: Ajustes = { sonido: true, vibracion: true };

function leer(): Ajustes {
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (crudo) return { ...POR_DEFECTO, ...JSON.parse(crudo) };
  } catch {
    // Modo privado o almacenamiento bloqueado: seguimos con lo de siempre.
  }
  return POR_DEFECTO;
}

let actuales = leer();
const oyentes = new Set<() => void>();

export function obtenerAjustes(): Ajustes {
  return actuales;
}

export function cambiarAjuste<K extends keyof Ajustes>(clave: K, valor: Ajustes[K]) {
  actuales = { ...actuales, [clave]: valor };
  try {
    localStorage.setItem(CLAVE, JSON.stringify(actuales));
  } catch {
    // Sin almacenamiento, el cambio dura mientras la app esté abierta.
  }
  oyentes.forEach((o) => o());
}

function suscribir(o: () => void) {
  oyentes.add(o);
  return () => oyentes.delete(o);
}

export function useAjustes(): Ajustes {
  return useSyncExternalStore(suscribir, obtenerAjustes, obtenerAjustes);
}
