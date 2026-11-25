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

type Sistema = "iphone" | "android";

const PASOS: Record<Sistema, { titulo: string; texto: string }[]> = {
  iphone: [
    { titulo: "Toca Compartir", texto: "Es el cuadrado con la flecha, abajo en Safari." },
    { titulo: "Elige «Agregar a inicio»", texto: "Baja un poco en el menú hasta encontrarlo." },
    { titulo: "Toca «Agregar»", texto: "Aparece en tu pantalla de inicio y se abre como una app, sin la barra del navegador." },
  ],
  android: [
    { titulo: "Toca el menú ⋮", texto: "Son los tres puntos, arriba a la derecha en Chrome." },
    { titulo: "Elige «Instalar app»", texto: "Si no aparece, busca «Agregar a pantalla principal»." },
    { titulo: "Toca «Instalar»", texto: "Aparece en tu pantalla de inicio y se abre como una app, sin la barra del navegador." },
  ],
};

function Dibujo({ paso, sistema, icono }: { paso: number; sistema: Sistema; icono: string }) {
  return (
    <div className="relative grid h-36 place-items-center overflow-hidden rounded-tarjeta bg-surface">
      {paso === 0 && sistema === "android" && (
        <motion.svg viewBox="0 0 24 24" className="size-16 text-brand" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}>
          <g fill="currentColor">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </g>
        </motion.svg>
      )}
      {paso === 0 && sistema === "iphone" && (
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
            {sistema === "iphone" ? "Agregar a inicio" : "Instalar app"}
          </motion.div>
          <div className="h-9 rounded-[10px] bg-card" />
        </motion.div>
      )}
      {paso === 2 && (
        <motion.img
          src={icono}
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

/**
 * Guía de 3 pasos para poner la app en la pantalla de inicio (iPhone por defecto; Android si se pide).
 * El ícono que se muestra es el de la app que se está viendo (Student, Vida o la plataforma).
 */
export function GuiaIphone({ abierta, alCerrar, sistema = "iphone", titulo = "Pon a León en tu inicio" }: { abierta: boolean; alCerrar: () => void; sistema?: Sistema; titulo?: string }) {
  const [paso, setPaso] = useState(0);
  useEffect(() => {
    if (abierta) setPaso(0);
  }, [abierta]);
  const pasos = PASOS[sistema];
  const p = pasos[paso];
  const icono =
    typeof document !== "undefined" ? ((document.head.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement | null)?.getAttribute("href") ?? "/icons/icon-192.png") : "/icons/icon-192.png";
  return (
    <Ventana abierta={abierta} alCerrar={alCerrar} titulo={titulo}>
      <Dibujo paso={paso} sistema={sistema} icono={icono} />
      <div className="mt-4 flex items-center gap-2" aria-hidden="true">
        {pasos.map((_, i) => (
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
