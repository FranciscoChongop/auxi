import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Boton } from "../components/Boton";
import { Leon, type PoseLeon } from "../components/Leon";
import { actualizar } from "../lib/estado";
import { reemplazar } from "../lib/rutas";

type Paso = { pose: PoseLeon; titulo: string; texto: string; chips?: string[] };

const PASOS: Paso[] = [
  { pose: "saluda", titulo: "Hola, soy León", texto: "Te muestro Auxi en pocos toques. No tienes que hacer nada: solo toca «Siguiente»." },
  {
    pose: "concentrado",
    titulo: "Sube lo que te dejaron",
    texto: "Le pasas tu material a tu IA (ChatGPT, Claude o Gemini), copias lo que te da y lo pegas aquí. Auxi lo vuelve juego. Cuando lo hagas, te digo cada paso.",
  },
  {
    pose: "sorprendido",
    titulo: "7 formas de jugar",
    texto: "Cada lección mezcla estos juegos para que no te aburras:",
    chips: ["Opción múltiple", "Verdadero o falso", "Completar la frase", "Escribir la respuesta", "Unir parejas", "Ordenar pasos", "Clasificar"],
  },
  { pose: "pensativo", titulo: "Repasa sin acordarte", texto: "Lo que falles vuelve al día siguiente, luego a los 3 y a los 7 días. Así se queda en la memoria." },
  {
    pose: "anima",
    titulo: "Métodos de estudio",
    texto: "Con minijuegos para estudiar a tu manera:",
    chips: ["El tomate (Pomodoro)", "Las 5 cajas", "Explícaselo a León"],
  },
  { pose: "concentrado", titulo: "Tus fechas en orden", texto: "Pega tu sílabo y verás tus entregas, exámenes y feriados en un calendario, con tu semana de estudio." },
  {
    pose: "celebra",
    titulo: "Racha, cofre y monedas",
    texto: "Estudiar suma racha, que tiene protector. Cada día hay un cofre y siempre ves sus probabilidades. Las monedas abren extras. Nunca te regaño por faltar un día.",
  },
  { pose: "saluda", titulo: "¡Listo!", texto: "Ahora te llevo a tu inicio. Allí te iré mostrando dónde tocar, paso a paso." },
];

/** Recorrido de bienvenida: solo hay que tocar «Siguiente». No pide jugar ni leer de más. */
export default function Tour() {
  const [i, setI] = useState(0);
  const p = PASOS[i];
  const ultimo = i === PASOS.length - 1;

  function terminar() {
    actualizar(() => ({ tourVisto: true }));
    reemplazar("/studio/inicio");
  }

  return (
    <main
      className="mx-auto flex min-h-dvh max-w-md flex-col px-5"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 20px)", paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}
    >
      <div className="flex items-center gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={PASOS.length} aria-valuenow={i + 1} aria-label="Avance de la guía">
        {PASOS.map((_, k) => (
          <span key={k} className={`h-2 flex-1 rounded-full ${k <= i ? "bg-brand" : "bg-surface"}`} />
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -28 }}
          transition={{ duration: 0.2 }}
          className="flex flex-1 flex-col items-center justify-center gap-4 py-4 text-center"
        >
          <Leon pose={p.pose} alto={190} rebote />
          <h1 className="text-titulo font-black">{p.titulo}</h1>
          <p className="max-w-[34ch] text-[17px] text-text-soft">{p.texto}</p>
          {p.chips && (
            <ul className="flex flex-wrap justify-center gap-2">
              {p.chips.map((c) => (
                <li key={c} className="rounded-full bg-surface px-3 py-2 text-ayuda font-extrabold text-brand">
                  {c}
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-col gap-2">
        <Boton onClick={() => (ultimo ? terminar() : setI(i + 1))}>{ultimo ? "Ir a mi inicio" : "Siguiente"}</Boton>
        <button
          type="button"
          onClick={() => setI(i - 1)}
          disabled={i === 0}
          className={`h-11 cursor-pointer font-extrabold text-brand ${i === 0 ? "invisible" : ""}`}
        >
          Atrás
        </button>
      </div>
    </main>
  );
}
