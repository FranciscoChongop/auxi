import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useAviso } from "../components/Aviso";
import { Boton } from "../components/Boton";
import { esIphone, estaInstalada, GuiaIphone } from "../components/GuiaIphone";
import { CaraDeLeon, Leon } from "../components/Leon";
import { Icono, Marcadores, Pantalla } from "../components/Navegacion";
import { Ventana } from "../components/Ventana";
import { avance, cursoDe, nodos, type Nodo } from "../lib/curso";
import { actualizar, rachaEnPausa, useEstado } from "../lib/estado";
import { hoy } from "../lib/fechas";
import { navegar } from "../lib/rutas";
import { sonidos } from "../lib/sonidos";
import { vibrar } from "../lib/vibrar";

const ZIGZAG = [0, 52, 76, 52, 0, -52, -76, -52];

function Estrellas({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${n} de 3 estrellas`}>
      {[0, 1, 2].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className="size-4" aria-hidden="true">
          <path
            d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"
            fill={i < n ? "var(--reward)" : "var(--surface)"}
            stroke={i < n ? "var(--reward-dark)" : "var(--surface)"}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </span>
  );
}

function IconoNodo({ n }: { n: Nodo }) {
  const t = { fill: "none", stroke: "currentColor", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  return (
    <svg viewBox="0 0 24 24" className="size-8" aria-hidden="true">
      {!n.abierto ? (
        <g {...t} strokeWidth={2.4}>
          <rect x="5.5" y="10.5" width="13" height="10" rx="2.5" />
          <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
        </g>
      ) : n.prueba ? (
        <g {...t} strokeWidth={2.4}>
          <path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H4.5a2.5 2.5 0 0 0 2.5 4M17 6h2.5a2.5 2.5 0 0 1-2.5 4M12 14v3M8.5 20.5h7M10 17h4v3.5h-4z" />
        </g>
      ) : n.hecho ? (
        <path {...t} d="M5 12.5l4.5 4.5L19 7.5" />
      ) : (
        <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" fill="currentColor" />
      )}
    </svg>
  );
}

function BotonNodo({ n, actual, desplazamiento, alTocar }: { n: Nodo; actual: boolean; desplazamiento: number; alTocar: () => void }) {
  const tam = n.prueba ? 84 : 72;
  const ref = useRef<HTMLDivElement>(null);
  // Al entrar, el camino se ubica en el nivel que toca.
  useEffect(() => {
    if (actual) ref.current?.scrollIntoView({ block: "center" });
  }, [actual]);
  const [fondo, sombra, texto] = !n.abierto
    ? ["var(--surface)", "#c9cdf0", "var(--text-soft)"]
    : n.hecho
      ? ["var(--success)", "var(--success-dark)", "var(--text)"]
      : ["var(--brand)", "var(--brand-dark)", "#fff"];
  return (
    <div ref={ref} className="relative flex flex-col items-center" style={{ transform: `translateX(${desplazamiento}px)` }}>
      <AnimatePresence>
        {actual && (
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: [0, -4, 0] }}
            transition={{ y: { repeat: Infinity, duration: 1.6 } }}
            className="absolute -top-11 z-10 rounded-[10px] border-2 border-surface bg-card px-3 py-1 text-[14px] font-black whitespace-nowrap text-brand"
          >
            {n.prueba ? "¡Prueba!" : "Empieza aquí"}
          </motion.span>
        )}
      </AnimatePresence>
      {actual && (
        <motion.span
          className="absolute rounded-full border-4 border-brand/30"
          style={{ width: tam + 16, height: tam + 16, top: -8 }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.9, 0.4, 0.9] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        />
      )}
      <motion.button
        type="button"
        aria-label={`${n.titulo}${n.hecho ? ", hecha" : !n.abierto ? ", bloqueada" : ""}`}
        onClick={alTocar}
        onPointerDown={() => {
          sonidos.toque();
          vibrar("toque");
        }}
        initial={actual ? { scale: 0.7 } : false}
        animate={{ scale: 1 }}
        whileTap={{ y: 5, boxShadow: `0 2px 0 ${sombra}`, transition: { duration: 0.06 } }}
        transition={{ type: "spring", stiffness: 420, damping: 14 }}
        style={{ width: tam, height: tam - 6, background: fondo, color: texto, boxShadow: `0 7px 0 ${sombra}` }}
        className="relative grid cursor-pointer place-items-center rounded-full"
      >
        <IconoNodo n={n} />
      </motion.button>
      <div className="mt-2 h-4">{n.resultado && <Estrellas n={n.resultado.estrellas} />}</div>
    </div>
  );
}

export default function Inicio() {
  const e = useEstado();
  const aviso = useAviso();
  const curso = cursoDe(e);
  const lista = nodos(curso, e);
  const actual = lista.find((n) => n.abierto && !n.hecho);
  const [elegido, setElegido] = useState<Nodo | null>(null);
  const [guias, setGuias] = useState<Record<number, boolean>>({});
  const errores = e.errores[curso.id]?.length ?? 0;
  const pausa = rachaEnPausa(e);
  const terminado = !actual;

  const [tarjetaDia, setTarjetaDia] = useState(
    () => e.tarjetaDia !== hoy() && e.totales.lecciones > 0 && e.racha.ultimoDia !== hoy(),
  );
  const [guia, setGuia] = useState(() => esIphone && !estaInstalada && !e.guiaIphoneVista && e.totales.lecciones > 0);

  function cerrarTarjeta() {
    setTarjetaDia(false);
    actualizar(() => ({ tarjetaDia: hoy() }));
  }

  function tocar(n: Nodo) {
    if (!n.abierto) {
      aviso("Termina el nivel anterior para abrir este.", "info");
      return;
    }
    setElegido(n);
  }

  let k = 0;
  return (
    <Pantalla>
      <header className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navegar("/studio/material")}
          className="flex h-11 min-w-0 cursor-pointer items-center gap-2 rounded-boton border-2 border-surface bg-card px-3 font-extrabold"
        >
          <span className="truncate">{curso.titulo}</span>
          <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-text-soft" aria-hidden="true">
            <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </button>
        <Marcadores />
      </header>

      {pausa && (
        <div className="flex items-center gap-3 rounded-tarjeta bg-surface p-3">
          <Leon pose="duerme" alto={72} />
          <p className="font-bold">Tu racha está en pausa. Una lección la vuelve a encender.</p>
        </div>
      )}

      {errores > 0 && (
        <button
          type="button"
          onClick={() => navegar("/studio/leccion?n=repaso")}
          className="flex cursor-pointer items-center gap-3 rounded-tarjeta border-2 border-surface bg-card p-3 text-left"
        >
          <CaraDeLeon cara="lentes" tamano={44} />
          <span className="flex-1">
            <span className="block font-extrabold">Repaso de 2 minutos</span>
            <span className="block text-ayuda text-text-soft">
              {errores} {errores === 1 ? "pregunta que te costó" : "preguntas que te costaron"}
            </span>
          </span>
          <span className="font-black text-brand">Ir</span>
        </button>
      )}

      {curso.unidades.map((u, ui) => (
        <section key={ui} className="flex flex-col">
          <div className="flex items-center gap-3 rounded-tarjeta bg-brand p-4 text-white" style={{ boxShadow: "0 4px 0 var(--brand-dark)" }}>
            <div className="flex-1">
              <p className="text-ayuda font-bold opacity-85">Unidad {ui + 1}</p>
              <p className="text-[18px] leading-6 font-black">{u.titulo}</p>
            </div>
            <button
              type="button"
              onClick={() => setGuias((g) => ({ ...g, [ui]: !g[ui] }))}
              aria-expanded={!!guias[ui]}
              className="h-11 cursor-pointer rounded-boton border-2 border-white/40 px-3 font-extrabold"
            >
              Guía
            </button>
          </div>
          <AnimatePresence initial={false}>
            {guias[ui] && (
              <motion.p
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <span className="mt-2 block rounded-tarjeta bg-surface p-3">{u.resumen}</span>
              </motion.p>
            )}
          </AnimatePresence>
          <div className="flex flex-col items-center gap-12 pt-14 pb-4">
            {lista
              .filter((n) => n.u === ui)
              .map((n) => (
                <BotonNodo key={n.clave} n={n} actual={n === actual} desplazamiento={ZIGZAG[k++ % ZIGZAG.length]} alTocar={() => tocar(n)} />
              ))}
          </div>
        </section>
      ))}

      {terminado && (
        <div className="flex flex-col items-center gap-3 rounded-tarjeta bg-surface p-5 text-center">
          <Leon pose="celebra" alto={140} />
          <p className="text-tarjeta font-extrabold">¡Terminaste este tema!</p>
          <p className="text-text-soft">Repasa lo que te costó o sube otro material.</p>
        </div>
      )}
      <p className="text-center text-ayuda text-text-soft">Avance del tema: {Math.round(avance(curso, e) * 100)} %</p>

      {/* Botón flotante para subir material nuevo */}
      <motion.button
        type="button"
        aria-label="Subir material nuevo"
        onClick={() => navegar("/studio/material")}
        onPointerDown={() => sonidos.toque()}
        whileTap={{ scale: 0.9 }}
        className="fixed right-5 z-20 grid size-14 cursor-pointer place-items-center rounded-full bg-brand text-white"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 84px)", boxShadow: "0 4px 0 var(--brand-dark)" }}
      >
        <Icono nombre="mas" className="size-7" />
      </motion.button>

      <Ventana abierta={!!elegido} alCerrar={() => setElegido(null)} titulo={elegido?.titulo ?? ""}>
        {elegido && (
          <>
            <p className="text-text-soft">
              {elegido.prueba
                ? "Preguntas de toda la unidad. Pásala para abrir la siguiente."
                : `Unidad ${elegido.u + 1} · Lección ${(elegido.l as number) + 1} de ${curso.unidades[elegido.u].lecciones.length}`}
            </p>
            {elegido.resultado && (
              <p className="mt-2 flex items-center gap-2 font-bold">
                <Estrellas n={elegido.resultado.estrellas} /> Tu mejor precisión: {elegido.resultado.precision} %
              </p>
            )}
            <div className="mt-5">
              <Boton onClick={() => navegar(`/studio/leccion?n=${elegido.clave}`)}>{elegido.hecho ? "Repasar" : "Empezar"}</Boton>
            </div>
          </>
        )}
      </Ventana>

      <Ventana abierta={tarjetaDia && !guia} alCerrar={cerrarTarjeta} titulo={errores > 0 ? "Repaso de hoy" : "Reto de hoy"}>
        <div className="flex items-center gap-3">
          <CaraDeLeon cara="guino" tamano={56} />
          <p className="font-bold">
            {errores > 0
              ? `Tienes ${errores} ${errores === 1 ? "pregunta" : "preguntas"} para repasar. Son 2 minutos.`
              : actual
                ? `Termina «${actual.titulo}» y abre tu cofre del día.`
                : "Sube un material nuevo y sigue tu racha."}
          </p>
        </div>
        <div className="mt-5">
          <Boton
            onClick={() => {
              cerrarTarjeta();
              navegar(errores > 0 ? "/studio/leccion?n=repaso" : actual ? `/studio/leccion?n=${actual.clave}` : "/studio/material");
            }}
          >
            Vamos
          </Boton>
        </div>
      </Ventana>

      <GuiaIphone
        abierta={guia}
        alCerrar={() => {
          setGuia(false);
          actualizar(() => ({ guiaIphoneVista: true }));
        }}
      />
    </Pantalla>
  );
}
