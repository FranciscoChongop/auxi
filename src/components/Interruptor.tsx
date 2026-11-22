import { motion } from "motion/react";
import { useId } from "react";
import { cambiarAjuste, useAjustes } from "../lib/ajustes";
import { sonidos } from "../lib/sonidos";
import { puedeVibrar, vibrar } from "../lib/vibrar";

type Props = {
  etiqueta: string;
  ayuda?: string;
  activo: boolean;
  alCambiar: (v: boolean) => void;
};

export function Interruptor({ etiqueta, ayuda, activo, alCambiar }: Props) {
  const id = useId();
  return (
    <div className="flex min-h-11 items-center justify-between gap-4">
      <label htmlFor={id} className="flex-1">
        <span className="block text-[17px] font-bold">{etiqueta}</span>
        {ayuda && <span className="block text-ayuda text-text-soft">{ayuda}</span>}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={activo}
        onClick={() => alCambiar(!activo)}
        className={`relative h-8 w-[52px] shrink-0 cursor-pointer rounded-full transition-colors duration-150 ${activo ? "bg-brand" : "bg-surface"}`}
        style={{ boxShadow: "inset 0 0 0 2px rgba(20,26,77,0.06)" }}
      >
        {/* Área táctil de 44 px aunque el interruptor se vea más chico */}
        <span className="absolute -inset-2" aria-hidden="true" />
        <motion.span
          className="absolute top-1 left-1 size-6 rounded-full bg-card shadow-[0_2px_0_rgba(20,26,77,0.15)]"
          initial={false}
          animate={{ x: activo ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}

/** Interruptores de sonido (y de vibración, solo en Android). */
export function AjustesDeSonido() {
  const { sonido, vibracion } = useAjustes();
  return (
    <div className="flex flex-col gap-3">
      <Interruptor
        etiqueta="Sonidos"
        ayuda="En iPhone, revisa que no esté en silencio."
        activo={sonido}
        alCambiar={(v) => {
          cambiarAjuste("sonido", v);
          if (v) sonidos.toque();
        }}
      />
      {puedeVibrar && (
        <Interruptor
          etiqueta="Vibración"
          activo={vibracion}
          alCambiar={(v) => {
            cambiarAjuste("vibracion", v);
            if (v) vibrar("acierto");
          }}
        />
      )}
    </div>
  );
}
