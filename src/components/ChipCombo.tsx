import { AnimatePresence, motion } from "motion/react";
import { resorteRebote } from "../lib/movimiento";

type Props = {
  /** Aciertos seguidos. El chip aparece desde 2. */
  racha: number;
};

export function ChipCombo({ racha }: Props) {
  return (
    <div className="flex h-9 items-center" aria-live="polite">
      <AnimatePresence mode="popLayout">
        {racha >= 2 && (
          <motion.span
            key={racha}
            initial={{ scale: 0.4, y: 10, opacity: 0 }}
            animate={{ scale: [0.4, 1.18, 1], y: 0, opacity: 1, rotate: [0, -6, 0] }}
            exit={{ scale: 0.6, opacity: 0, transition: { duration: 0.12 } }}
            transition={{ duration: 0.3, ...resorteRebote }}
            className="numeros inline-flex h-9 items-center gap-1 rounded-full bg-success px-4 text-[17px] font-black text-text"
          >
            ¡Combo x{racha}!
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
