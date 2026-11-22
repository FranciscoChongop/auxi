import type { Transition } from "motion/react";

/** Resorte por defecto de auxi-design. */
export const resorte: Transition = { type: "spring", stiffness: 500, damping: 30 };

/** Resorte con un poco más de rebote, para premios y combos. */
export const resorteRebote: Transition = { type: "spring", stiffness: 520, damping: 16 };

/** Entrada de tarjetas: sube 16 px + fundido, en cascada de 40 ms. */
export function entradaEnCascada(indice = 0) {
  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.24, ease: "easeOut" as const, delay: indice * 0.04 },
  };
}
