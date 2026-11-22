import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Boton } from "./Boton";
import { Ventana } from "./Ventana";

export const esIphone =
  typeof navigator !== "undefined" &&
  (/iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

export const estaInstalada =
  typeof window !== "undefined" &&
  (window.matchMedia?.("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true);

const PASOS = [
  { titulo: "Toca Compartir", texto: "Es el cuadrado con la flecha, abajo en Safari." },
  { titulo: "Elige «Agregar a inicio»", texto: "Baja un poco en el menú hasta encontrarlo." },
  { titulo: "Toca «Agregar»", texto: "León aparece en tu pantalla y podrá avisarte de tus entregas." },
];

function Dibujo({ paso }: { paso: number }) {
  return (
    <div className="relative grid h-36 place-items-center overflow-hidden rounded-tarjeta bg-surface">
      {paso === 0 && (
        <motion.svg viewBox="0 0 24 24" className="size-16 text-brand" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}>
          <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 9H6.5A1.5 1.5 0 0 0 5 10.5v8A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 17.5 9H16" />
            <path d="M12 14V3M8.5 6.5L12 3l3.5 3.5" />
          </g>
        </motion.svg>
      )}
      {paso === 1 && (
        <motion.div initial={{ y: 30 }} animate={{ y: 0 }} className="flex w-56 flex-col gap-2">
          <div className="h-9 rounded-[10px] bg-card" />
          <motion.div
            className="flex h-11 items-center gap-2 rounded-[10px] border-2 border-brand bg-card px-3 font-extrabold text-brand"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          >
            <span className="grid size-6 place-items-center rounded-md border-2 border-brand text-[14px]">+</span>
            Agregar a inicio
          </motion.div>
          <div className="h-9 rounded-[10px] bg-card" />
        </motion.div>
      )}
      {paso === 2 && (
        <motion.img
          src="/icons/icon-192.png"
          alt=""
          className="size-20 rounded-[22%]"
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 14 }}
        />
      )}
    </div>
  );
}

export function GuiaIphone({ abierta, alCerrar }: { abierta: boolean; alCerrar: () => void }) {
  const [paso, setPaso] = useState(0);
  useEffect(() => {
    if (abierta) setPaso(0);
  }, [abierta]);
  const p = PASOS[paso];
  return (
    <Ventana abierta={abierta} alCerrar={alCerrar} titulo="Pon a León en tu inicio">
      <Dibujo paso={paso} />
      <div className="mt-4 flex items-center gap-2" aria-hidden="true">
        {PASOS.map((_, i) => (
          <span key={i} className={`h-2 flex-1 rounded-full ${i <= paso ? "bg-brand" : "bg-surface"}`} />
        ))}
      </div>
      <p className="mt-4 text-tarjeta font-extrabold">
        {paso + 1}. {p.titulo}
      </p>
      <p className="mt-1 text-text-soft">{p.texto}</p>
      <div className="mt-5">
        <Boton onClick={() => (paso < 2 ? setPaso(paso + 1) : alCerrar())}>{paso < 2 ? "Siguiente" : "Listo"}</Boton>
      </div>
    </Ventana>
  );
}
