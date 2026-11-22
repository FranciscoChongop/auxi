import { motion } from "motion/react";

type Props = {
  /** De 0 a 1. */
  valor: number;
  etiqueta?: string;
};

/** Barra turquesa que se llena con resorte. */
export function BarraProgreso({ valor, etiqueta = "Avance de la lección" }: Props) {
  const v = Math.max(0, Math.min(1, valor));
  return (
    <div
      role="progressbar"
      aria-label={etiqueta}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v * 100)}
      className="h-4 w-full overflow-hidden rounded-full bg-surface"
    >
      <motion.div
        className="relative h-full rounded-full bg-success"
        initial={false}
        animate={{ width: `${v * 100}%` }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
      >
        {/* Brillo fijo arriba para dar volumen, sin degradados. */}
        <span className="absolute top-[3px] right-2 left-2 h-[4px] rounded-full bg-white/45" />
      </motion.div>
    </div>
  );
}
