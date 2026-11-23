import { AnimatePresence, motion } from "motion/react";
import { useAviso } from "../components/Aviso";
import { abrirCofreEnServidor } from "../lib/billetera";
import { useState } from "react";
import { Boton } from "../components/Boton";
import { Leon } from "../components/Leon";
import { Escudo, Moneda } from "../components/Navegacion";
import { Ventana } from "../components/Ventana";
import { lanzarConfeti } from "../lib/confeti";
import { actualizar, useEstado } from "../lib/estado";
import { hoy } from "../lib/fechas";
import { reemplazar } from "../lib/rutas";
import { sonidos } from "../lib/sonidos";
import { vibrar } from "../lib/vibrar";

/** Premios posibles con su probabilidad real. Se muestran tal cual a la persona. */
export const PREMIOS = [
  { id: "m10", texto: "10 monedas", monedas: 10, protector: 0, prob: 50 },
  { id: "m20", texto: "20 monedas", monedas: 20, protector: 0, prob: 30 },
  { id: "p1", texto: "1 protector de racha", monedas: 0, protector: 1, prob: 15 },
  { id: "m50", texto: "50 monedas", monedas: 50, protector: 0, prob: 5 },
] as const;

function sortear() {
  let r = Math.random() * 100;
  for (const p of PREMIOS) {
    if (r < p.prob) return p;
    r -= p.prob;
  }
  return PREMIOS[0];
}

function DibujoCofre({ abierto }: { abierto: boolean }) {
  return (
    <svg viewBox="0 0 120 110" className="w-44" aria-hidden="true">
      <rect x="14" y="50" width="92" height="52" rx="8" fill="var(--reward)" stroke="var(--reward-dark)" strokeWidth="4" />
      <path d="M14 66h92" stroke="var(--reward-dark)" strokeWidth="4" />
      <rect x="52" y="58" width="16" height="18" rx="4" fill="var(--brand)" />
      <motion.g
        style={{ originX: "14px", originY: "50px" }}
        animate={abierto ? { rotate: -38, y: -6 } : { rotate: 0, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 14 }}
      >
        <path d="M14 50V40a26 18 0 0 1 26-18h40a26 18 0 0 1 26 18v10z" fill="var(--reward)" stroke="var(--reward-dark)" strokeWidth="4" strokeLinejoin="round" />
        <path d="M60 22v28" stroke="var(--reward-dark)" strokeWidth="4" />
      </motion.g>
    </svg>
  );
}

export default function Cofre() {
  const e = useEstado();
  const aviso = useAviso();
  const [fase, setFase] = useState<"cerrado" | "abriendo" | "abierto">("cerrado");
  const [premio, setPremio] = useState<(typeof PREMIOS)[number] | null>(null);
  const [probabilidades, setProbabilidades] = useState(false);
  const yaAbierto = e.cofreDia === hoy() && fase === "cerrado";

  async function abrir() {
    setFase("abriendo");
    sonidos.cofre();
    vibrar("acierto");
    const espera = new Promise((r) => setTimeout(r, 1500));
    const servidor = await abrirCofreEnServidor();
    await espera;
    if (servidor) {
      // El servidor sorteó y ya sumó el premio (con las mismas probabilidades que se muestran).
      if ("sinRed" in servidor || !servidor.ok) {
        setFase("cerrado");
        if ("sinRed" in servidor) aviso("Necesitas internet para abrir el cofre.", "info");
        return;
      }
      setPremio(PREMIOS.find((x) => x.id === servidor.premio) ?? null);
      setFase("abierto");
      sonidos.acierto();
      void lanzarConfeti();
      return;
    }
    {
      const p = sortear();
      setPremio(p);
      setFase("abierto");
      actualizar((s) => ({
        cofreDia: hoy(),
        monedas: s.monedas + p.monedas,
        racha: { ...s.racha, protectores: s.racha.protectores + p.protector },
      }));
      sonidos.acierto();
      void lanzarConfeti();
    }
  }

  return (
    <main
      className="mx-auto flex min-h-dvh max-w-md flex-col px-5"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 16px)", paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}
    >
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => reemplazar("/student/inicio")}
          aria-label="Cerrar"
          className="grid size-11 cursor-pointer place-items-center rounded-full bg-surface"
        >
          <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-titulo font-black">
          {fase === "abierto" ? "¡Mira lo que salió!" : yaAbierto ? "Ya abriste el cofre de hoy" : "Tu cofre del día"}
        </h1>
        <p className="text-text-soft">
          {fase === "abierto" ? "Ya está en tu cuenta." : yaAbierto ? "Mañana hay otro." : "Lo ganaste por tu primera lección de hoy."}
        </p>

        <div className="relative mt-4 grid h-64 w-full place-items-center">
          {fase === "abierto" && <Leon pose="sorprendido" alto={120} className="absolute bottom-0 left-0" rebote />}
          <motion.div
            animate={
              fase === "abriendo"
                ? { rotate: [0, -4, 4, -6, 6, -8, 8, 0], scale: [1, 1.04, 1.04, 1.08, 1.08, 1.12, 1.12, 1.05] }
                : fase === "cerrado" && !yaAbierto
                  ? { rotate: [0, -2, 2, 0], transition: { repeat: Infinity, repeatDelay: 1.6, duration: 0.5 } }
                  : { rotate: 0, scale: 1 }
            }
            transition={{ duration: 1.5 }}
            className="relative"
          >
            {fase === "abriendo" && (
              <motion.span
                className="absolute inset-0 -z-10 rounded-full bg-reward/40 blur-2xl"
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1.6, opacity: 1 }}
                transition={{ duration: 1.5 }}
              />
            )}
            <DibujoCofre abierto={fase === "abierto"} />
          </motion.div>
          <AnimatePresence>
            {premio && (
              <motion.div
                initial={{ y: 30, opacity: 0, scale: 0.6 }}
                animate={{ y: -110, opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 16 }}
                className="absolute flex items-center gap-2 rounded-full border-2 border-reward-dark bg-card px-5 py-3 text-[20px] font-black shadow-[0_4px_0_var(--reward-dark)]"
              >
                {premio.protector ? <Escudo className="size-7" /> : <Moneda className="size-7" />}
                {premio.texto}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={() => setProbabilidades(true)}
          className="h-11 cursor-pointer text-[16px] font-extrabold text-brand underline underline-offset-4"
        >
          ¿Qué puede salir?
        </button>
      </div>

      {fase === "abierto" || yaAbierto ? (
        <Boton onClick={() => reemplazar("/student/inicio")}>Continuar</Boton>
      ) : (
        <Boton variante="premio" sinSonido deshabilitado={fase === "abriendo"} onClick={abrir}>
          {fase === "abriendo" ? "Abriendo…" : "Abrir cofre"}
        </Boton>
      )}

      <Ventana abierta={probabilidades} alCerrar={() => setProbabilidades(false)} titulo="¿Qué puede salir?">
        <p className="text-text-soft">Cada cofre trae uno de estos premios. Estas son las probabilidades reales:</p>
        <ul className="mt-4 flex flex-col gap-2">
          {PREMIOS.map((p) => (
            <li key={p.id} className="flex items-center justify-between rounded-boton bg-surface px-4 py-3 font-bold">
              <span className="flex items-center gap-2">
                {p.protector ? <Escudo /> : <Moneda />}
                {p.texto}
              </span>
              <span className="numeros font-black">{p.prob} %</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-ayuda text-text-soft">Hay un cofre al día, por tu primera lección. No se compra con dinero.</p>
      </Ventana>
    </main>
  );
}
