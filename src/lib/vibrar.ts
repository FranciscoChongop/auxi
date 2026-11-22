import { obtenerAjustes } from "./ajustes";

/** La vibración web solo existe en Android. En iPhone compensan el sonido y la animación. */
export const puedeVibrar =
  typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent) && "vibrate" in navigator;

export const patrones = {
  toque: 10,
  acierto: 30,
  error: [20, 40, 20],
} as const;

export function vibrar(tipo: keyof typeof patrones) {
  if (!puedeVibrar || !obtenerAjustes().vibracion) return;
  try {
    navigator.vibrate(patrones[tipo] as number | number[]);
  } catch {
    // Algunos navegadores lo bloquean hasta que la persona toca la pantalla.
  }
}
