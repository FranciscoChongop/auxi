import { motion, type TargetAndTransition } from "motion/react";
import type { ReactNode } from "react";
import { sonidos } from "../lib/sonidos";
import { vibrar } from "../lib/vibrar";

export type EstadoOpcion = "normal" | "elegida" | "correcta" | "incorrecta";

const CLASES: Record<EstadoOpcion, string> = {
  normal: "bg-card border-surface text-text",
  elegida: "bg-card border-brand text-brand",
  correcta: "bg-success border-success-dark text-text",
  incorrecta: "bg-card border-error text-error-dark",
};

const SOMBRA: Record<EstadoOpcion, string> = {
  normal: "var(--surface)",
  elegida: "var(--brand)",
  correcta: "var(--success-dark)",
  incorrecta: "var(--error)",
};

const ANIMACION: Partial<Record<EstadoOpcion, TargetAndTransition>> = {
  correcta: { scale: [1, 1.05, 1], transition: { duration: 0.4 } },
  incorrecta: { x: [0, -6, 6, -6, 6, -6, 0], transition: { duration: 0.35 } },
};

type Props = {
  children: ReactNode;
  estado?: EstadoOpcion;
  onClick?: () => void;
  bloqueada?: boolean;
};

/** Opción de respuesta: se hunde al tocar; turquesa si acierta, sacudida si falla. */
export function Opcion({ children, estado = "normal", onClick, bloqueada = false }: Props) {
  return (
    <motion.button
      type="button"
      disabled={bloqueada}
      onClick={onClick}
      onPointerDown={() => {
        if (bloqueada) return;
        sonidos.toque();
        vibrar("toque");
      }}
      animate={{ ...(ANIMACION[estado] ?? { scale: 1, x: 0 }), boxShadow: `0 4px 0 ${SOMBRA[estado]}` }}
      whileTap={bloqueada ? undefined : { y: 3, boxShadow: `0 1px 0 ${SOMBRA[estado]}`, transition: { duration: 0.06 } }}
      className={`min-h-14 w-full cursor-pointer rounded-boton border-2 px-4 py-3 text-left text-[17px] font-bold transition-colors duration-150 disabled:cursor-default ${CLASES[estado]}`}
    >
      {children}
    </motion.button>
  );
}
