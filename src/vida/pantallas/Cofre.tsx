import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Boton } from "../../components/Boton";
import { Moneda } from "../../components/Navegacion";
import { hoy } from "../../lib/fechas";
import { sonidos } from "../../lib/sonidos";
import { vibrar } from "../../lib/vibrar";
import { abrirCofre, PREMIOS_COFRE, useVida } from "../estado";
import { confetiVida, Encabezado, Pagina, PieFijo } from "../ui";
import { despuesDelLogro } from "./Logro";

/** Cofre del día: se abre una vez al día, con las probabilidades a la vista. */
export default function Cofre() {
  const e = useVida();
  const [premio, setPremio] = useState<number | null>(null);
  const disponible = e.cofreDia !== hoy() || premio !== null;

  const abrir = () => {
    if (premio !== null || e.cofreDia === hoy()) return;
    sonidos.cofre();
    vibrar("acierto");
    setTimeout(() => {
      setPremio(abrirCofre());
      void confetiVida();
    }, 420);
  };

  return (
    <Pagina className="flex flex-col">
      <Encabezado titulo="Cofre del día" alVolver={despuesDelLogro} />
      <div className="flex flex-1 flex-col items-center px-5 pt-14 text-center">
        <motion.button
          type="button"
          onClick={abrir}
          disabled={!disponible || premio !== null}
          aria-label="Abrir el cofre"
          animate={premio === null && disponible ? { rotate: [0, -4, 4, -4, 0] } : { rotate: 0 }}
          transition={premio === null ? { duration: 0.6, repeat: Infinity, repeatDelay: 1.4 } : {}}
          whileTap={{ scale: 0.92 }}
          className="relative cursor-pointer"
        >
          <svg viewBox="0 0 120 100" className="w-52" aria-hidden="true">
            <rect x="12" y="44" width="96" height="50" rx="10" fill="var(--reward)" stroke="var(--reward-dark)" strokeWidth="4" />
            <motion.path
              d="M12 46V34a22 22 0 0 1 22-22h52a22 22 0 0 1 22 22v12z"
              fill="var(--brand)"
              stroke="var(--brand-dark)"
              strokeWidth="4"
              style={{ transformBox: "fill-box", originX: 0, originY: 1 }}
              animate={premio !== null ? { rotate: -18, y: -14 } : { rotate: 0, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 14 }}
            />
            <rect x="52" y="40" width="16" height="20" rx="4" fill="var(--card)" stroke="var(--reward-dark)" strokeWidth="3" />
          </svg>
          <AnimatePresence>
            {premio !== null && (
              <motion.span
                initial={{ opacity: 0, y: 10, scale: 0.6 }}
                animate={{ opacity: 1, y: -52, scale: 1 }}
                transition={{ type: "spring", stiffness: 380, damping: 14 }}
                className="absolute inset-x-0 top-0 flex items-center justify-center gap-1 text-[36px] font-black"
              >
                <Moneda className="size-9" />+{premio}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <h1 className="mt-4 text-titulo font-black">{premio !== null ? `¡Ganaste ${premio} monedas!` : disponible ? "Toca el cofre" : "Ya abriste el cofre de hoy"}</h1>
        <p className="mt-1 text-text-soft">{disponible ? "Se abre una vez al día, cuando anotas." : "Mañana hay otro."}</p>

        <section className="mt-6 w-full rounded-[20px] bg-card p-4 text-left">
          <h2 className="font-extrabold">Lo que puede salir</h2>
          <ul className="mt-2 flex flex-col gap-1">
            {PREMIOS_COFRE.map((p) => (
              <li key={p.monedas} className="flex justify-between text-ayuda">
                <span className="flex items-center gap-1 font-bold">
                  <Moneda className="size-4" /> {p.monedas} monedas
                </span>
                <span className="numeros font-extrabold">{p.probabilidad} %</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <PieFijo>
        <Boton variante={premio !== null ? "principal" : "secundario"} onClick={despuesDelLogro}>
          {premio !== null ? "Seguir" : "Ahora no"}
        </Boton>
      </PieFijo>
    </Pagina>
  );
}

