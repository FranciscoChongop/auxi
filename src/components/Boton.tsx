import { motion } from "motion/react";
import type { ReactNode } from "react";
import { sonidos } from "../lib/sonidos";
import { vibrar } from "../lib/vibrar";

export type VarianteBoton = "principal" | "exito" | "premio" | "secundario";

const ESTILOS: Record<VarianteBoton, { clase: string; sombra: string }> = {
  principal: { clase: "bg-brand text-white", sombra: "var(--brand-dark)" },
  exito: { clase: "bg-success text-text", sombra: "var(--success-dark)" },
  premio: { clase: "bg-reward text-text", sombra: "var(--reward-dark)" },
  secundario: { clase: "bg-card text-brand border-2 border-surface", sombra: "var(--surface)" },
};

type Props = {
  children: ReactNode;
  variante?: VarianteBoton;
  deshabilitado?: boolean;
  onClick?: () => void;
  /** Sonido al presionar. Por defecto, el pop suave. */
  sinSonido?: boolean;
  anchoCompleto?: boolean;
  tipo?: "button" | "submit";
  className?: string;
};

/** Botón "que se hunde": baja 3 px en 60 ms y vuelve con resorte. */
export function Boton({
  children,
  variante = "principal",
  deshabilitado = false,
  onClick,
  sinSonido = false,
  anchoCompleto = true,
  tipo = "button",
  className = "",
}: Props) {
  const estilo = ESTILOS[variante];

  if (deshabilitado) {
    return (
      <button
        type={tipo}
        disabled
        className={`h-14 rounded-boton bg-surface px-6 text-[17px] font-extrabold text-text-soft ${anchoCompleto ? "w-full" : ""} ${className}`}
      >
        {children}
      </button>
    );
  }

  return (
    <motion.button
      type={tipo}
      onClick={onClick}
      onPointerDown={() => {
        if (!sinSonido) sonidos.toque();
        vibrar("toque");
      }}
      initial={false}
      style={{ boxShadow: `0 4px 0 ${estilo.sombra}` }}
      whileTap={{
        y: 3,
        boxShadow: `0 1px 0 ${estilo.sombra}`,
        transition: { duration: 0.06, ease: "easeOut" },
      }}
      transition={{ type: "spring", stiffness: 600, damping: 22 }}
      className={`h-14 cursor-pointer rounded-boton px-6 text-[17px] font-extrabold ${estilo.clase} ${anchoCompleto ? "w-full" : ""} ${className}`}
    >
      {children}
    </motion.button>
  );
}
