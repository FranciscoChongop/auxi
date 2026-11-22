import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { BarraProgreso } from "../components/BarraProgreso";
import { Boton } from "../components/Boton";
import { ChipCombo } from "../components/ChipCombo";
import { CaraDeLeon, Leon } from "../components/Leon";
import { Ventana } from "../components/Ventana";
import { Vidas } from "../components/Vidas";
import { NOMBRE_TIPO } from "../data/tipos";
import { esCorrecto, pistaDe, respuestaEnTexto, type Valor } from "../juegos/corregir";
import { Juego } from "../juegos/Juegos";
import { TarjetaVolteable } from "../juegos/TarjetaVolteable";
import { armarCola, cursoDe, tituloDe, type Paso } from "../lib/curso";
import { metricas, primerDiaDeUso } from "../lib/metricas";
import { obtener, registrarLeccion, registrarRepaso } from "../lib/estado";
import { parametro, reemplazar } from "../lib/rutas";
import { sonidos } from "../lib/sonidos";
import { vibrar } from "../lib/vibrar";

const VIDAS = 3;
type Fase = "jugando" | "bien" | "pista" | "respuesta";

export default function Leccion() {
  const [clave] = useState(() => parametro("n") ?? "0-0");
  const [curso] = useState(() => cursoDe(obtener()));
  const [cola, setCola] = useState<Paso[]>(() => armarCola(curso, clave, obtener()));
  const [indice, setIndice] = useState(0);
  const [fase, setFase] = useState<Fase>("jugando");
  const [valor, setValor] = useState<Valor | null>(null);
  const [conPista, setConPista] = useState(false);
  const [intento, setIntento] = useState(0);
  const [volteada, setVolteada] = useState(false);
  const [vidas, setVidas] = useState(VIDAS);
  const [combo, setCombo] = useState(0);
  const [cuentas, setCuentas] = useState({ respuestas: 0, aciertos: 0 });
  const [salir, setSalir] = useState(false);
  const [agotado, setAgotado] = useState(false);
  const fallados = useRef(new Set<string>());
  const acertados = useRef(new Set<string>());
  const inicio = useRef(Date.now());

  const paso = cola[indice];
  const hechos = indice + (fase === "bien" || fase === "respuesta" ? 1 : 0);

  // Las parejas se corrigen solas al terminar de unirlas.
  useEffect(() => {
    if (paso?.tipo === "ej" && paso.ej.tipo === "parejas" && valor && fase === "jugando") comprobar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor]);

  if (!paso && cola.length === 0) {
    return (
      <Vacia
        titulo="Aún no hay nada que repasar"
        texto="Termina una lección y aquí aparecerá lo que más te cuesta."
      />
    );
  }

  function comprobar() {
    if (!paso || paso.tipo !== "ej" || !valor) return;
    const ok = esCorrecto(paso.ej, valor);
    setCuentas((c) => ({ respuestas: c.respuestas + 1, aciertos: c.aciertos + (ok ? 1 : 0) }));
    if (ok) {
      const nuevo = combo + 1;
      setCombo(nuevo);
      if (nuevo >= 2) sonidos.combo(nuevo);
      else sonidos.acierto();
      vibrar("acierto");
      acertados.current.add(paso.ref);
      setFase("bien");
    } else {
      setCombo(0);
      sonidos.error();
      vibrar("error");
      fallados.current.add(paso.ref);
      setVidas((v) => Math.max(0, v - 1));
      setFase(conPista ? "respuesta" : "pista");
    }
  }

  function pedirPista() {
    if (vidas === 0) return setAgotado(true);
    setConPista(true);
    setValor(null);
    setIntento((i) => i + 1);
    setFase("jugando");
  }

  function continuar() {
    if (vidas === 0) return setAgotado(true);
    if (paso?.tipo === "ej" && fase === "respuesta" && !paso.reintento) {
      // Lo fallado vuelve al final de la lección, una vez.
      setCola((c) => [...c, { ...paso, id: paso.id + "-r", reintento: true }]);
    }
    if (indice + 1 >= cola.length && !(fase === "respuesta" && paso?.tipo === "ej" && !paso.reintento)) {
      terminar();
      return;
    }
    setIndice((i) => i + 1);
    setFase("jugando");
    setValor(null);
    setConPista(false);
    setVolteada(false);
  }

  function terminar() {
    const curso_ = curso;
    if (clave === "repaso") registrarRepaso(curso_.id, [...acertados.current].filter((r) => !fallados.current.has(r)), [...fallados.current]);
    const hecha = registrarLeccion({
      cursoId: curso_.id,
      claveNodo: clave,
      titulo: tituloDe(curso_, clave),
      respuestas: cuentas.respuestas,
      aciertos: cuentas.aciertos,
      segundos: Math.round((Date.now() - inicio.current) / 1000),
      fallados: [...fallados.current],
    });
    metricas.leccionCompletada({ precision: hecha.precision, primera: hecha.primera, primerDia: primerDiaDeUso() });
    reemplazar("/studio/celebracion");
  }

  function reintentar() {
    setCola(armarCola(curso, clave, obtener()));
    setIndice(0);
    setFase("jugando");
    setValor(null);
    setConPista(false);
    setVidas(VIDAS);
    setAgotado(false);
    setCombo(0);
    setCuentas({ respuestas: 0, aciertos: 0 });
    inicio.current = Date.now();
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-bg">
      {/* Arriba: salir, avance y vidas */}
      <header className="sticky top-0 z-10 bg-bg px-5 pb-2" style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)" }}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSalir(true)}
            aria-label="Salir de la lección"
            className="-ml-2 grid size-11 shrink-0 cursor-pointer place-items-center rounded-full text-text-soft"
          >
            <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </button>
          <div className="flex-1">
            <BarraProgreso valor={hechos / cola.length} />
          </div>
          <Vidas total={VIDAS} restantes={vidas} />
        </div>
        <div className="flex h-9 items-center justify-center">
          <ChipCombo racha={combo} />
        </div>
      </header>

      {/* Centro: el juego */}
      <main className="flex-1 px-5 pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={paso.id + intento}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {paso.tipo === "tarjeta" ? (
              <div className="flex flex-col gap-4 pt-2">
                <p className="text-ayuda font-extrabold text-text-soft">Aprende esta idea</p>
                <TarjetaVolteable tarjeta={paso.tarjeta} volteada={volteada} alVoltear={() => setVolteada((v) => !v)} />
              </div>
            ) : (
              <div className="flex flex-col gap-3 pt-2">
                <p className="text-ayuda font-extrabold text-text-soft">
                  {paso.reintento ? "Otra vez, con calma" : NOMBRE_TIPO[paso.ej.tipo]}
                </p>
                {conPista && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 rounded-tarjeta bg-surface p-3"
                  >
                    <CaraDeLeon cara="lentes" />
                    <p className="font-bold">{pistaDe(paso.ej)}</p>
                  </motion.div>
                )}
                <Juego
                  ej={paso.ej}
                  valor={valor}
                  alCambiar={setValor}
                  resultado={fase === "bien" ? "bien" : fase === "jugando" ? null : "mal"}
                  revelar={fase === "respuesta"}
                  conPista={conPista}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Abajo: franja de resultado y botón principal */}
      <footer className="sticky bottom-0">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={fase}
            initial={{ y: fase === "jugando" ? 0 : 40, opacity: fase === "jugando" ? 1 : 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 34 }}
            className={`px-5 pt-4 ${fase === "bien" ? "bg-success" : fase === "jugando" ? "bg-bg" : "bg-error text-white"}`}
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}
          >
            {fase === "bien" && paso.tipo === "ej" && (
              <Mensaje cara="feliz" titulo={combo >= 3 ? `¡Eso! Vas ${combo} seguidas.` : "¡Eso!"} texto={paso.ej.explicacion} />
            )}
            {fase === "pista" && <Mensaje cara="tierno" titulo="Casi." texto="¿Quieres una pista para intentarlo otra vez?" oscuro />}
            {fase === "respuesta" && paso.tipo === "ej" && (
              <Mensaje cara="tierno" titulo={`Respuesta: ${respuestaEnTexto(paso.ej)}`} texto={paso.ej.explicacion} oscuro />
            )}

            {paso.tipo === "tarjeta" ? (
              <Boton deshabilitado={!volteada} onClick={continuar}>
                {volteada ? "Entendido" : "Voltea la tarjeta"}
              </Boton>
            ) : fase === "jugando" ? (
              paso.ej.tipo === "parejas" ? (
                <Boton deshabilitado>Une todas las parejas</Boton>
              ) : (
                <Boton deshabilitado={!valor} onClick={comprobar}>
                  Comprobar
                </Boton>
              )
            ) : fase === "pista" ? (
              <div className="flex flex-col gap-2">
                <Boton variante="secundario" onClick={pedirPista}>
                  Ver pista
                </Boton>
                <button
                  type="button"
                  onClick={() => setFase("respuesta")}
                  className="h-11 cursor-pointer text-[16px] font-extrabold text-white underline underline-offset-4"
                >
                  Prefiero ver la respuesta
                </button>
              </div>
            ) : (
              <Boton variante={fase === "bien" ? "principal" : "secundario"} onClick={continuar}>
                Continuar
              </Boton>
            )}
          </motion.div>
        </AnimatePresence>
      </footer>

      {/* Sin vidas: nunca hay que esperar, se puede reintentar al toque */}
      <AnimatePresence>
        {agotado && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 mx-auto flex max-w-md flex-col bg-bg px-5"
            style={{ paddingTop: "calc(env(safe-area-inset-top) + 40px)", paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}
          >
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
              <Leon pose="anima" alto={220} rebote />
              <h1 className="text-titulo font-black">Se acabaron las vidas de esta lección</h1>
              <p className="max-w-[32ch] text-text-soft">
                Lo que fallaste queda en tu repaso. Puedes intentarlo otra vez ahora mismo.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Boton onClick={reintentar}>Intentar de nuevo</Boton>
              <Boton variante="secundario" onClick={() => reemplazar("/studio/inicio")}>
                Volver al camino
              </Boton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Ventana abierta={salir} alCerrar={() => setSalir(false)} titulo="¿Sales de la lección?">
        <p className="text-text-soft">Lo que avanzaste en esta lección no se guarda.</p>
        <div className="mt-6 flex flex-col gap-3">
          <Boton onClick={() => setSalir(false)}>Seguir estudiando</Boton>
          <Boton variante="secundario" onClick={() => reemplazar("/studio/inicio")}>
            Salir
          </Boton>
        </div>
      </Ventana>
    </div>
  );
}

function Mensaje({ cara, titulo, texto, oscuro }: { cara: "feliz" | "tierno"; titulo: string; texto: string; oscuro?: boolean }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <CaraDeLeon cara={cara} tamano={44} />
      <div>
        <p className={`text-[19px] leading-6 font-black ${oscuro ? "text-white" : "text-text"}`}>{titulo}</p>
        <p className={`mt-1 text-[15px] leading-[22px] font-semibold ${oscuro ? "text-white" : "text-text"}`}>{texto}</p>
      </div>
    </div>
  );
}

function Vacia({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-5 py-10">
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <Leon pose="anima" alto={200} rebote />
        <h1 className="text-titulo font-black">{titulo}</h1>
        <p className="text-text-soft">{texto}</p>
      </div>
      <Boton onClick={() => reemplazar("/studio/inicio")}>Volver al camino</Boton>
    </main>
  );
}
