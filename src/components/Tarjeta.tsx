import { motion } from "motion/react";
import type { ReactNode } from "react";
import { entradaEnCascada } from "../lib/movimiento";

type Props = {
  children: ReactNode;
  /** "elevada" es blanca; "suave" usa el lila de superficie. */
  tono?: "elevada" | "suave";
  /** Posición en la lista, para la entrada en cascada. */
  indice?: number;
  className?: string;
};

export function Tarjeta({ children, tono = "elevada", indice = 0, className = "" }: Props) {
  const fondo = tono === "elevada" ? "bg-card border-2 border-surface" : "bg-surface";
  return (
    <motion.div {...entradaEnCascada(indice)} className={`rounded-tarjeta p-4 ${fondo} ${className}`}>
      {children}
    </motion.div>
  );
}
