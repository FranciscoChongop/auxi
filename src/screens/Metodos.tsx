import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { Boton } from "../components/Boton";
import { textoExamen } from "../components/FilaTema";
import { Leon, type PoseLeon } from "../components/Leon";
import { Moneda, Pantalla } from "../components/Navegacion";
import { SelectorTema } from "../components/SelectorTema";
import { Ventana } from "../components/Ventana";
import { cursoDe, proximoExamen, todasLasTarjetas } from "../lib/curso";
import { actualizar, useEstado } from "../lib/estado";
import { hoy } from "../lib/fechas";
import { entradaEnCascada } from "../lib/movimiento";
import { navegar } from "../lib/rutas";
import { sonidos } from "../lib/sonidos";

type IdMetodo = "tomate" | "cajas" | "leon";

type Metodo = {
  id: IdMetodo;
  nombre: string;
  que: string;
  duracion: string;
  mejorPara: string;
  pasos: string[];
  juego: string;
  pose: PoseLeon;
  color: string;
};

const METODOS: Metodo[] = [
  {
    id: "tomate",
    nombre: "El tomate",
    que: "Estudias con foco total y descansas a tiempo. Tu cerebro rinde más.",
    duracion: "25 min + 5 de descanso",
    mejorPara: "Cuando te cuesta concentrarte",
    pasos: ["Elige tu tema y toca empezar.", "Estudia 25 minutos sin celular: León te acompaña.", "Descansa 5 minutos y revienta burbujas con palabras clave."],
    juego: "Gana 5 monedas por tomate (hasta 3 al día).",
    pose: "concentrado",
    color: "var(--error)",
  },
  {
    id: "cajas",
    nombre: "Las 5 cajas",
    que: "Repasas tarjetas y las que recuerdas suben de caja. Así no se te olvidan.",
    duracion: "5 a 10 min",
    mejorPara: "Memorizar y repasar antes de un examen",
    pasos: ["Ves la pregunta y piensas la respuesta.", "Voltea la tarjeta y di si te acordaste.", "Si te acordaste, sube de caja; si no, vuelve a la caja 1."],
    juego: "Llena las 5 cajas para dominar el tema.",
    pose: "anima",
    color: "var(--success-dark)",
  },
  {
    id: "leon",
    nombre: "Explícaselo a León",
    que: "Si lo puedes explicar fácil, lo entendiste de verdad.",
    duracion: "5 min",
    mejorPara: "Entender y no solo memorizar",
    pasos: ["León te dice un concepto.", "Lo explicas con tus palabras, escribiendo o con tu voz.", "León te da de 1 a 3 estrellas y una pregunta para pensar."],
    juego: "Gana 2 monedas por estrella.",
    pose: "pensativo",
    color: "var(--brand)",
  },
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
  const curso = cursoDe(e);
  const tarjetas = useMemo(() => todasLasTarjetas(curso), [curso]);
  const enCaja5 = tarjetas.filter((t) => (e.cajas[t.id] ?? 1) === 5).length;
  const tomatesHoy = e.tomates[hoy()] ?? 0;
  const recomendado = e.metodoRecomendado as IdMetodo | null;
  const prox = proximoExamen(e);

  // Qué te sugiero hoy: primero lo urgente (examen cercano), luego tu estilo.
  const sugerencia = useMemo<{ id: IdMetodo; texto: string } | null>(() => {
    if (prox && prox.diasExamen! <= 3) return { id: "cajas", texto: `${textoExamen(prox.diasExamen!)}: repasa «${prox.tema.nombre}» con Las 5 cajas.` };
    if (prox && prox.diasExamen! <= 10) return { id: "leon", texto: `${textoExamen(prox.diasExamen!)}: explícale «${prox.tema.nombre}» a León para entenderlo de verdad.` };
    if (recomendado) return { id: recomendado, texto: `Según tu test, hoy te va bien ${METODOS.find((m) => m.id === recomendado)!.nombre}.` };
    return null;
  }, [prox, recomendado]);

  const orden = recomendado ? [...METODOS].sort((a) => (a.id === recomendado ? -1 : 1)) : METODOS;
  const estadistica = (id: IdMetodo) =>
    id === "tomate" ? `Hoy: ${tomatesHoy} de 3 tomates` : id === "cajas" ? `${enCaja5} de ${tarjetas.length} tarjetas en la caja 5` : `Con «${curso.titulo}»`;

  return (
    <Pantalla titulo="Métodos">
      <p className="-mt-2 text-text-soft">Formas de estudiar que funcionan, convertidas en juego.</p>
      <SelectorTema etiqueta="Con este tema" />

      {sugerencia && (
        <motion.button
          {...entradaEnCascada(0)}
          type="button"
          onClick={() => navegar(`/student/metodos/${sugerencia.id}`)}
          className="flex cursor-pointer items-center gap-3 rounded-tarjeta bg-brand p-4 text-left text-white"
          style={{ boxShadow: "0 4px 0 var(--brand-dark)" }}
        >
          <span className="flex-1">
            <span className="block text-ayuda font-bold opacity-90">Hoy te sugiero</span>
            <span className="block font-extrabold">{sugerencia.texto}</span>
          </span>
          <span className="font-black">Ir</span>
        </motion.button>
      )}

      {orden.map((m, i) => (
        <motion.section key={m.id} {...entradaEnCascada(i + 1)} className={`overflow-hidden rounded-tarjeta border-2 bg-card ${m.id === recomendado ? "border-brand" : "border-surface"}`}>
          <div className="h-2" style={{ background: m.color }} />
          <div className="flex items-start gap-3 p-4">
            <div className="flex-1">
              {m.id === recomendado && <span className="mb-2 inline-block rounded-full bg-surface px-3 py-1 text-ayuda font-extrabold text-brand">Recomendado para ti</span>}
              <h2 className="text-tarjeta font-extrabold">{m.nombre}</h2>
              <p className="mt-1 text-text-soft">{m.que}</p>
              <p className="mt-2 flex flex-wrap gap-2 text-[13px] font-extrabold">
                <span className="rounded-full bg-surface px-3 py-1">{m.duracion}</span>
                <span className="rounded-full bg-surface px-3 py-1">{m.mejorPara}</span>
              </p>
            </div>
            <Leon pose={m.pose} alto={88} />
          </div>
          <div className="px-4">
            <details className="group">
              <summary className="flex min-h-11 cursor-pointer items-center font-extrabold text-brand">Cómo funciona</summary>
              <ol className="mb-2 ml-1 flex flex-col gap-2">
                {m.pasos.map((p, k) => (
                  <li key={k} className="flex gap-3 font-semibold">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-surface text-[13px] font-black">{k + 1}</span>
                    {p}
                  </li>
                ))}
              </ol>
            </details>
            <p className="flex items-center gap-2 pb-3 text-ayuda font-bold text-text-soft">
              {m.id === "tomate" && <Moneda className="size-4" />}
              {estadistica(m.id)} · {m.juego}
            </p>
          </div>
          <div className="px-4 pb-4">
            <Boton onClick={() => navegar(`/student/metodos/${m.id}`)}>Empezar</Boton>
          </div>
        </motion.section>
      ))}

      <Boton variante="secundario" onClick={() => setTest(true)}>
        {recomendado ? "Repetir el test: ¿cuál es para mí?" : "¿Cuál es para mí? Test de 3 preguntas"}
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
