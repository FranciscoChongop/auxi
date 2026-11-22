import { motion } from "motion/react";
import type { ReactNode } from "react";
import { Boton } from "../components/Boton";
import { Leon } from "../components/Leon";
import { actualizar } from "../lib/estado";
import { navegar } from "../lib/rutas";

const t = { fill: "none", stroke: "currentColor", strokeWidth: 2.3, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const PUNTOS: { titulo: string; texto: string; icono: ReactNode }[] = [
  {
    titulo: "Sube lo que te dejaron",
    texto: "Tu IA lo lee, Auxi lo vuelve juego.",
    icono: <path {...t} d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8zM18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />,
  },
  {
    titulo: "Todo en orden",
    texto: "Cursos, temas, exámenes y calendario.",
    icono: <path {...t} d="M5 5.5h14a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1zM4 10h16M8 3.5v4M16 3.5v4" />,
  },
  {
    titulo: "Sin culpa, con premios",
    texto: "Racha con protector y cofre diario.",
    icono: <path {...t} d="M12 2.5c.6 3.2 5.5 5.6 5.5 11a5.5 5.5 0 0 1-11 0c0-2.4 1.1-4 2.4-5.2.2 1.6.9 2.7 2 3.2-.4-3.4.3-6.4 1.1-9z" />,
  },
];

/** Primera pantalla. No pide cuenta: primero se juega. */
export default function Bienvenida() {
  function jugar() {
    // Una lección de ejemplo, ya: la cuenta llega después del primer logro.
    actualizar(() => ({ bienvenidaVista: true, cursoId: "fotosintesis" }));
    navegar("/studio/leccion?n=0-0");
  }

  return (
    <main
      className="mx-auto flex min-h-dvh max-w-md flex-col px-5"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 20px)", paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}
    >
      <p className="text-center text-ayuda font-extrabold tracking-wide text-brand">Auxi Studio</p>

      <div className="flex flex-col items-center pt-2 text-center">
        <Leon pose="saluda" alto={210} rebote />
        <h1 className="mt-4 text-titulo font-black">Estudia jugando con León</h1>
        <p className="mt-2 max-w-[32ch] text-text-soft">Sube lo que te dejaron y estudia jugando, con una IA que te pregunta en vez de copiarte.</p>
      </div>

      <ul className="mt-6 flex flex-col gap-2">
        {PUNTOS.map((p, i) => (
          <motion.li
            key={p.titulo}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + i * 0.1, duration: 0.24 }}
            className="flex items-center gap-3 rounded-tarjeta bg-surface px-4 py-3"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-card text-brand">
              <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
                {p.icono}
              </svg>
            </span>
            <span>
              <span className="block font-extrabold">{p.titulo}</span>
              <span className="block text-ayuda text-text-soft">{p.texto}</span>
            </span>
          </motion.li>
        ))}
      </ul>

      <div className="mt-auto flex flex-col gap-3 pt-6">
        <Boton onClick={jugar}>Probar una lección ya</Boton>
        <Boton
          variante="secundario"
          onClick={() => {
            actualizar(() => ({ bienvenidaVista: true }));
            navegar("/studio/material");
          }}
        >
          Tengo mi material
        </Boton>
        <button
          type="button"
          onClick={() => {
            actualizar(() => ({ bienvenidaVista: true }));
            navegar("/studio/cuenta?volver=/studio/inicio");
          }}
          className="h-11 cursor-pointer text-[16px] font-extrabold text-brand"
        >
          Ya tengo cuenta
        </button>
        <p className="text-center text-ayuda text-text-soft">Gratis. Sin tarjeta.</p>
      </div>
    </main>
  );
}
