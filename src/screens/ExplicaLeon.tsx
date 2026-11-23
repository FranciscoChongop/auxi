import { motion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { Boton } from "../components/Boton";
import { CaraDeLeon, Leon } from "../components/Leon";
import { Pantalla } from "../components/Navegacion";
import { SinTema } from "../components/SinTema";
import { SelectorTema } from "../components/SelectorTema";
import { normalizar } from "../juegos/corregir";
import { lanzarConfeti } from "../lib/confeti";
import { cursoDe, todasLasTarjetas } from "../lib/curso";
import { actualizar, useEstado } from "../lib/estado";
import { sonidos } from "../lib/sonidos";

const COMUNES = new Set(["para", "como", "pero", "porque", "sobre", "entre", "desde", "hasta", "donde", "cuando", "tiene", "hace", "esta", "este", "esto", "ejemplo", "sobre", "también", "tambien", "siguiente"]);

/** Palabras importantes de la explicación correcta (las que León espera escuchar). */
function claves(texto: string) {
  // Se quedan los sustantivos probables: fuera las palabras comunes y las que parecen verbos.
  const pareceVerbo = (p: string) => /(an|en|ar|er|ir|ando|iendo|ado|ido)$/.test(p);
  return [...new Set(normalizar(texto).split(" ").filter((p) => p.length >= 5 && !COMUNES.has(p) && !pareceVerbo(p)))].slice(0, 6);
}

type Evaluacion = { estrellas: number; faltan: string[]; pregunta: string };

/** Evaluación de prueba, sin IA: cuenta palabras e ideas clave. La IA real llega después. */
function evaluar(explicacion: string, reverso: string): Evaluacion {
  const palabras = normalizar(explicacion).split(" ").filter(Boolean);
  const esperadas = claves(reverso);
  const dichas = esperadas.filter((c) => palabras.some((p) => p.startsWith(c.slice(0, 5))));
  const faltan = esperadas.filter((c) => !dichas.includes(c));
  let estrellas = 1;
  if (palabras.length >= 20) estrellas++;
  if (dichas.length >= Math.min(2, esperadas.length)) estrellas++;
  const pregunta =
    palabras.length < 20
      ? "Me quedé con ganas de más. ¿Me lo cuentas con un ejemplo?"
      : faltan.length
        ? `¿Y qué tiene que ver «${faltan[0]}» con esto?`
        : "¡Clarísimo! ¿Dónde lo ves en tu vida diaria?";
  return { estrellas, faltan, pregunta };
}

type Reconocimiento = { lang: string; interimResults: boolean; onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void; onend: () => void; start: () => void; stop: () => void };

export default function ExplicaLeon() {
  const e = useEstado();
  const tarjetas = useMemo(() => todasLasTarjetas(cursoDe(e)), [e.cursoId]); // eslint-disable-line react-hooks/exhaustive-deps
  const [indice, setIndice] = useState(0);
  const [texto, setTexto] = useState("");
  const [resultado, setResultado] = useState<Evaluacion | null>(null);
  const [escuchando, setEscuchando] = useState(false);
  const rec = useRef<Reconocimiento | null>(null);
  const t = tarjetas.length ? tarjetas[indice % tarjetas.length] : undefined;

  const Voz = (window as unknown as { SpeechRecognition?: new () => Reconocimiento; webkitSpeechRecognition?: new () => Reconocimiento })
    .SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: new () => Reconocimiento }).webkitSpeechRecognition;

  function hablar() {
    if (!Voz) return;
    if (escuchando) {
      rec.current?.stop();
      return;
    }
    const r = new Voz();
    r.lang = "es-PE";
    r.interimResults = false;
    r.onresult = (ev) => setTexto((x) => `${x} ${ev.results[ev.results.length - 1][0].transcript}`.trim());
    r.onend = () => setEscuchando(false);
    rec.current = r;
    setEscuchando(true);
    r.start();
  }

  function enviar() {
    if (!t) return;
    const ev = evaluar(texto, t.reverso);
    setResultado(ev);
    if (ev.estrellas === 3) {
      sonidos.leccionCompleta();
      void lanzarConfeti();
    } else sonidos.acierto();
    actualizar((s) => ({ monedas: s.monedas + ev.estrellas * 2 }));
  }

  function otro() {
    setIndice((i) => i + 1);
    setTexto("");
    setResultado(null);
  }

  if (!t) {
    return (
      <Pantalla titulo="Explícaselo a León" atras="/teach/metodos" conBarra={false}>
        <SinTema texto="Para explicárselo a León necesitas un tema. Agrega el primero." />
      </Pantalla>
    );
  }

  return (
    <Pantalla titulo="Explícaselo a León" atras="/teach/metodos" conBarra={false}>
      <SelectorTema etiqueta="Explicas" />
      <div className="flex items-center gap-3">
        <Leon pose="pensativo" alto={110} />
        <div className="relative flex-1 rounded-tarjeta border-2 border-surface bg-card p-3 font-bold">
          {resultado ? resultado.pregunta : <>Explícame qué es <span className="text-brand">«{t.frente}»</span> como si tuviera 10 años.</>}
        </div>
      </div>

      {!resultado ? (
        <>
          <textarea
            value={texto}
            onChange={(ev) => setTexto(ev.target.value)}
            placeholder="Escribe tu explicación con tus palabras…"
            className="h-44 w-full resize-none rounded-boton border-2 border-surface bg-card p-3 text-[17px] font-semibold text-text outline-none focus:border-brand"
            aria-label="Tu explicación"
          />
          {Voz && (
            <Boton variante="secundario" onClick={hablar}>
              {escuchando ? "Escuchando… toca para parar" : "Explicar con mi voz"}
            </Boton>
          )}
          <div className="mt-auto flex flex-col gap-3">
            <Boton deshabilitado={texto.trim().split(/\s+/).length < 5} onClick={enviar}>
              {texto.trim().split(/\s+/).length < 5 ? "Escribe al menos una frase" : "Enviar a León"}
            </Boton>
            <button type="button" onClick={otro} className="h-11 cursor-pointer font-extrabold text-brand">
              Cambiar de tema
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col items-center gap-2 py-4">
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.svg
                  key={i}
                  viewBox="0 0 24 24"
                  className="size-14"
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2 + i * 0.2, type: "spring", stiffness: 400, damping: 12 }}
                >
                  <path
                    d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"
                    fill={i < resultado.estrellas ? "var(--reward)" : "var(--surface)"}
                    stroke={i < resultado.estrellas ? "var(--reward-dark)" : "var(--surface)"}
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              ))}
            </div>
            <p className="text-tarjeta font-extrabold">
              {resultado.estrellas === 3 ? "¡Lo explicaste muy bien!" : resultado.estrellas === 2 ? "¡Vas bien!" : "Buen comienzo"}
            </p>
            <p className="text-ayuda text-text-soft">+{resultado.estrellas * 2} monedas</p>
          </div>
          <div className="flex items-start gap-3 rounded-tarjeta bg-surface p-3">
            <CaraDeLeon cara="lentes" />
            <p>
              <span className="font-extrabold">Así lo dice tu material: </span>
              {t.reverso}
            </p>
          </div>
          <p className="text-center text-ayuda text-text-soft">León de prueba: la IA que te escucha de verdad llega pronto.</p>
          <div className="mt-auto flex flex-col gap-3">
            <Boton onClick={() => setResultado(null)}>Responderle a León</Boton>
            <Boton variante="secundario" onClick={otro}>
              Otro tema
            </Boton>
          </div>
        </>
      )}
    </Pantalla>
  );
}
