import { motion } from "motion/react";
import { navegar } from "../../lib/rutas";
import { sonidos } from "../../lib/sonidos";
import { useVida } from "../estado";
import { CAMINO } from "../lecciones";
import { LeonVida, MarcadoresVida, Pagina } from "../ui";

const DESPLAZA = [0, 56, 0, -56];

/** Camino de plata: lecciones de 1 minuto con quiz, una detrás de otra. */
export default function Aprender() {
  const e = useVida();
  const todas = CAMINO.flatMap((t) => t.lecciones.map((l) => l.id));
  const siguiente = todas.find((id) => !e.lecciones[id]);
  let n = 0;

  return (
    <Pagina conBarra>
      <div className="flex items-center justify-between px-5" style={{ paddingTop: "calc(env(safe-area-inset-top) + 14px)" }}>
        <h1 className="text-titulo font-black">Camino de plata</h1>
        <MarcadoresVida />
      </div>
      <p className="px-5 pt-1 text-text-soft">Un minuto por lección. Información general, sin vender nada.</p>

      <div className="mt-6 flex flex-col gap-6 px-5">
        {CAMINO.map((tema, ti) => (
          <section key={tema.id} aria-label={tema.titulo}>
            <div className={`rounded-[20px] px-4 py-3 ${tema.lecciones.length ? "bg-brand text-white" : "bg-surface text-text"}`}>
              <p className={`text-ayuda font-extrabold ${tema.lecciones.length ? "text-white/80" : "text-text-soft"}`}>Tema {ti + 1}</p>
              <h2 className="text-tarjeta font-black">{tema.titulo}</h2>
              {!tema.lecciones.length && <p className="text-ayuda text-text-soft">Muy pronto.</p>}
            </div>
            <div className={`flex flex-col items-center gap-5 ${tema.lecciones.length ? "mt-5" : ""}`}>
              {tema.lecciones.map((l) => {
                const i = n++;
                const hecha = e.lecciones[l.id];
                const actual = l.id === siguiente;
                const abierta = hecha || actual;
                return (
                  <motion.div key={l.id} className="flex flex-col items-center" style={{ x: DESPLAZA[i % 4] }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}>
                    <motion.button
                      type="button"
                      disabled={!abierta}
                      onPointerDown={() => abierta && sonidos.toque()}
                      onClick={() => navegar(`/vida/leccion?id=${l.id}`)}
                      whileTap={abierta ? { y: 4, boxShadow: `0 2px 0 ${hecha ? "var(--reward-dark)" : "var(--brand-dark)"}` } : undefined}
                      animate={actual ? { scale: [1, 1.06, 1] } : {}}
                      transition={actual ? { duration: 1.6, repeat: Infinity } : {}}
                      style={{ boxShadow: `0 6px 0 ${hecha ? "var(--reward-dark)" : abierta ? "var(--brand-dark)" : "var(--surface)"}` }}
                      aria-label={`${l.titulo}${hecha ? `, ${hecha} estrellas` : actual ? ", siguiente" : ", bloqueada"}`}
                      className={`grid size-20 cursor-pointer place-items-center rounded-full text-[28px] font-black disabled:cursor-default ${hecha ? "bg-reward text-text" : abierta ? "bg-brand text-white" : "bg-card text-text-soft"}`}
                    >
                      {hecha ? "★".repeat(hecha).slice(0, 3) : i + 1}
                    </motion.button>
                    <p className={`mt-2 max-w-40 text-center text-ayuda font-extrabold ${abierta ? "" : "text-text-soft"}`}>{l.titulo}</p>
                  </motion.div>
                );
              })}
            </div>
          </section>
        ))}
        {!siguiente && (
          <div className="flex flex-col items-center text-center">
            <LeonVida pose="celebra" alto={140} />
            <p className="mt-2 font-extrabold">¡Terminaste lo que hay! Pronto llegan más temas.</p>
          </div>
        )}
      </div>
    </Pagina>
  );
}
