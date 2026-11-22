import { motion } from "motion/react";
import type { InfoTema } from "../lib/curso";
import { entradaEnCascada } from "../lib/movimiento";
import { sonidos } from "../lib/sonidos";
import { vibrar } from "../lib/vibrar";
import { COLORES_CURSO } from "./Formulario";

export function textoExamen(d: number) {
  return d === 0 ? "Examen hoy" : d === 1 ? "Examen mañana" : `Examen en ${d} días`;
}

/** Fila grande para elegir qué estudiar: tema, curso, avance y examen. */
export function FilaTema({ info, indice = 0, onClick }: { info: InfoTema; indice?: number; onClick: () => void }) {
  const { tema, curso, contenido, avance, diasExamen } = info;
  const urgente = diasExamen !== undefined && diasExamen <= 3;
  return (
    <motion.button
      {...entradaEnCascada(indice)}
      type="button"
      onClick={onClick}
      onPointerDown={() => {
        sonidos.toque();
        vibrar("toque");
      }}
      whileTap={{ y: 3, boxShadow: "0 1px 0 var(--surface)", transition: { duration: 0.06 } }}
      style={{ boxShadow: "0 4px 0 var(--surface)" }}
      className="flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-tarjeta border-2 border-surface bg-card py-3 pr-3 text-left"
    >
      <span className="w-1.5 self-stretch rounded-r-full" style={{ background: COLORES_CURSO[curso.color] }} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[18px] leading-6 font-extrabold">{tema.nombre}</span>
        <span className="block truncate text-ayuda text-text-soft">{curso.nombre}</span>
        {contenido ? (
          <span className="mt-2 flex items-center gap-2">
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
              <span className="block h-full rounded-full bg-success" style={{ width: `${Math.round(avance * 100)}%` }} />
            </span>
            <span className="numeros text-[12px] font-extrabold text-text-soft">{Math.round(avance * 100)} %</span>
          </span>
        ) : (
          <span className="mt-1 block text-ayuda font-bold text-brand">Falta crear las lecciones</span>
        )}
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1">
        {diasExamen !== undefined && (
          <span className={`rounded-full px-2.5 py-1 text-[12px] font-extrabold ${urgente ? "bg-error text-white" : "bg-surface text-text"}`}>{textoExamen(diasExamen)}</span>
        )}
        <span className="font-black text-brand">{contenido ? (avance > 0 && avance < 1 ? "Seguir" : avance >= 1 ? "Repasar" : "Empezar") : "Crear"}</span>
      </span>
    </motion.button>
  );
}
