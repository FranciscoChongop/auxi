import { motion } from "motion/react";
import type { TarjetaEstudio } from "../data/tipos";
import { sonidos } from "../lib/sonidos";

/** Tarjeta para aprender: se voltea al tocarla. */
export function TarjetaVolteable({
  tarjeta,
  volteada,
  alVoltear,
}: {
  tarjeta: TarjetaEstudio;
  volteada: boolean;
  alVoltear: () => void;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        sonidos.toque();
        alVoltear();
      }}
      className="block w-full cursor-pointer [perspective:900px]"
      aria-label={volteada ? tarjeta.reverso : `${tarjeta.frente}. Toca para ver la explicación.`}
    >
      <motion.div
        className="relative h-72 [transform-style:preserve-3d]"
        animate={{ rotateY: volteada ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-[20px] border-2 border-b-[6px] border-brand bg-card p-6 text-center [backface-visibility:hidden]">
          <span className="text-[26px] leading-8 font-black text-text">{tarjeta.frente}</span>
          <span className="text-ayuda font-bold text-brand">Toca para voltear</span>
        </div>
        <div className="absolute inset-0 flex items-center justify-center rounded-[20px] border-2 border-b-[6px] border-success-dark bg-surface p-6 text-center text-[19px] leading-7 font-bold [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {tarjeta.reverso}
        </div>
      </motion.div>
    </button>
  );
}
