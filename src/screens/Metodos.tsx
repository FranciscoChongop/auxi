import { motion } from "motion/react";
import { useState } from "react";
import { Boton } from "../components/Boton";
import { Leon, type PoseLeon } from "../components/Leon";
import { Pantalla } from "../components/Navegacion";
import { Ventana } from "../components/Ventana";
import { entradaEnCascada } from "../lib/movimiento";
import { actualizar, useEstado } from "../lib/estado";
import { navegar } from "../lib/rutas";
import { sonidos } from "../lib/sonidos";

type IdMetodo = "tomate" | "cajas" | "leon";

const METODOS: { id: IdMetodo; nombre: string; que: string; juego: string; pose: PoseLeon }[] = [
  { id: "tomate", nombre: "El tomate", que: "25 minutos de foco y 5 de descanso.", juego: "En el descanso, revienta burbujas.", pose: "concentrado" },
  { id: "cajas", nombre: "Las 5 cajas", que: "Tarjetas que suben de caja cuando las recuerdas.", juego: "Llena las 5 cajas.", pose: "anima" },
  { id: "leon", nombre: "Explícaselo a León", que: "Si lo puedes explicar fácil, lo entendiste.", juego: "Gana hasta 3 estrellas.", pose: "pensativo" },
];

const PREGUNTAS: { texto: string; opciones: [string, IdMetodo][] }[] = [
  {
    texto: "¿Qué te cuesta más?",
    opciones: [
      ["Concentrarme mucho rato", "tomate"],
      ["Acordarme días después", "cajas"],
      ["Entender de verdad el tema", "leon"],
    ],
  },
  {
    texto: "¿Cómo te gusta estudiar?",
    opciones: [
      ["Con tiempos claros", "tomate"],
      ["Repasando tarjetas", "cajas"],
      ["Explicando en voz alta", "leon"],
    ],
  },
  {
    texto: "¿Cuánto tiempo tienes hoy?",
    opciones: [
      ["Media hora o más", "tomate"],
      ["Ratos cortos entre clases", "cajas"],
      ["Lo justo para un tema", "leon"],
    ],
  },
];

function Test({ alTerminar }: { alTerminar: (m: IdMetodo) => void }) {
  const [paso, setPaso] = useState(0);
  const [votos, setVotos] = useState<IdMetodo[]>([]);
  const p = PREGUNTAS[paso];
  function elegir(m: IdMetodo) {
    const nuevos = [...votos, m];
    if (paso < PREGUNTAS.length - 1) {
      setVotos(nuevos);
      setPaso(paso + 1);
      return;
    }
    const cuenta = (id: IdMetodo) => nuevos.filter((v) => v === id).length;
    const ganador = (["tomate", "cajas", "leon"] as IdMetodo[]).sort((a, b) => cuenta(b) - cuenta(a))[0];
    alTerminar(cuenta(ganador) > 1 ? ganador : nuevos[0]);
  }
  return (
    <motion.div key={paso} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <p className="text-ayuda font-bold text-text-soft">
        Pregunta {paso + 1} de {PREGUNTAS.length}
      </p>
      <p className="mt-1 text-tarjeta font-extrabold">{p.texto}</p>
      <div className="mt-4 flex flex-col gap-3">
        {p.opciones.map(([texto, m]) => (
          <Boton key={texto} variante="secundario" onClick={() => elegir(m)}>
            {texto}
          </Boton>
        ))}
      </div>
    </motion.div>
  );
}

export default function Metodos() {
  const e = useEstado();
  const [test, setTest] = useState(false);
  const recomendado = e.metodoRecomendado as IdMetodo | null;
  const orden = recomendado ? [...METODOS].sort((a) => (a.id === recomendado ? -1 : 1)) : METODOS;

  return (
    <Pantalla titulo="Métodos">
      <p className="-mt-2 text-text-soft">Formas de estudiar que funcionan, convertidas en juego.</p>

      {orden.map((m, i) => (
        <motion.button
          key={m.id}
          {...entradaEnCascada(i)}
          type="button"
          onClick={() => navegar(`/studio/metodos/${m.id}`)}
          onPointerDown={() => sonidos.toque()}
          whileTap={{ y: 3, boxShadow: "0 1px 0 var(--surface)", transition: { duration: 0.06 } }}
          style={{ boxShadow: "0 4px 0 var(--surface)" }}
          className={`flex cursor-pointer items-center gap-3 rounded-tarjeta border-2 bg-card p-4 text-left ${m.id === recomendado ? "border-brand" : "border-surface"}`}
        >
          <div className="flex-1">
            {m.id === recomendado && (
              <span className="mb-2 inline-block rounded-full bg-surface px-3 py-1 text-ayuda font-extrabold text-brand">
                Recomendado para ti
              </span>
            )}
            <p className="text-tarjeta font-extrabold">{m.nombre}</p>
            <p className="mt-1 text-text-soft">{m.que}</p>
            <p className="mt-1 text-ayuda font-bold text-brand">{m.juego}</p>
          </div>
          <Leon pose={m.pose} alto={96} />
        </motion.button>
      ))}

      <Boton variante="secundario" onClick={() => setTest(true)}>
        {recomendado ? "Repetir el test" : "¿Cuál es para mí? Test de 3 preguntas"}
      </Boton>

      <Ventana abierta={test} alCerrar={() => setTest(false)} titulo="¿Cuál es para ti?">
        <Test
          alTerminar={(m) => {
            actualizar(() => ({ metodoRecomendado: m }));
            setTest(false);
            sonidos.acierto();
          }}
        />
      </Ventana>
    </Pantalla>
  );
}
