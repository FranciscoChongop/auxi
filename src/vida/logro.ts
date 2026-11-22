import type { Logro } from "./estado";

/** Lo último que se celebra (pasa del chat a la pantalla de celebración). */
let ultimo: (Logro & { quedan: number }) | null = null;

export function guardarLogro(l: Logro & { quedan: number }) {
  ultimo = l;
}

export function leerLogro() {
  return ultimo;
}
