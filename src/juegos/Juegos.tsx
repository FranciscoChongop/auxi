import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useId, useMemo, useState, type ReactNode } from "react";
import { Opcion, type EstadoOpcion } from "../components/Opcion";
import type { EjClasificar, EjCompletar, EjEscribir, EjOpcion, EjOrdenar, EjParejas, EjVF, Ejercicio } from "../data/tipos";
import { sonidos } from "../lib/sonidos";
import { vibrar } from "../lib/vibrar";
import { escrituraAceptada, mezclar, type Valor } from "./corregir";

export type PropsJuego<E> = {
  ej: E;
  valor: Valor | null;
  alCambiar: (v: Valor | null) => void;
  /** Resultado del último intento. */
  resultado: "bien" | "mal" | null;
  /** Mostrar la respuesta correcta (solo si la persona la pidió). */
  revelar: boolean;
  /** La persona pidió pista: el juego puede ayudar (por ejemplo, quitando una opción). */
  conPista: boolean;
};

const bloqueado = (p: { resultado: "bien" | "mal" | null }) => p.resultado !== null;

/* ---------- Ficha que se mueve entre zonas ---------- */

function Ficha({
  id,
  children,
  onClick,
  tono = "normal",
  deshabilitada,
  className = "",
}: {
  id: string;
  children: ReactNode;
  onClick?: () => void;
  tono?: "normal" | "bien" | "mal" | "elegida";
  deshabilitada?: boolean;
  className?: string;
}) {
  const colores = {
    normal: ["bg-card border-surface text-text", "var(--surface)"],
    elegida: ["bg-card border-brand text-brand", "var(--brand)"],
    bien: ["bg-success border-success-dark text-text", "var(--success-dark)"],
    mal: ["bg-card border-error text-error-dark", "var(--error)"],
  }[tono];
  return (
    <motion.button
      type="button"
      layoutId={id}
      layout
      disabled={deshabilitada}
      onClick={onClick}
      onPointerDown={() => !deshabilitada && sonidos.toque()}
      style={{ boxShadow: `0 3px 0 ${colores[1]}` }}
      whileTap={deshabilitada ? undefined : { y: 2, boxShadow: `0 1px 0 ${colores[1]}`, transition: { duration: 0.06 } }}
      transition={{ type: "spring", stiffness: 500, damping: 34 }}
      className={`min-h-11 cursor-pointer rounded-[12px] border-2 px-3 py-2 text-[16px] font-bold disabled:cursor-default ${colores[0]} ${className}`}
    >
      {children}
    </motion.button>
  );
}

/* ---------- Opción múltiple ---------- */

export function JuegoOpcion({ ej, valor, alCambiar, resultado, revelar, conPista }: PropsJuego<EjOpcion>) {
  const orden = useMemo(() => mezclar(ej.opciones.map((_, i) => i)), [ej]);
  const quitada = useMemo(() => orden.find((i) => i !== ej.correcta), [orden, ej]);
  const elegida = valor?.tipo === "opcion" ? valor.indice : null;

  function estado(i: number): EstadoOpcion {
    if (resultado && i === elegida) return resultado === "bien" ? "correcta" : "incorrecta";
    if (revelar && i === ej.correcta) return "correcta";
    if (i === elegida) return "elegida";
    return "normal";
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[21px] leading-7 font-extrabold">{ej.pregunta}</p>
      {orden
        .filter((i) => !(conPista && i === quitada))
        .map((i) => (
          <Opcion key={i} estado={estado(i)} bloqueada={bloqueado({ resultado })} onClick={() => alCambiar({ tipo: "opcion", indice: i })}>
            {ej.opciones[i]}
          </Opcion>
        ))}
    </div>
  );
}

/* ---------- Verdadero o falso ---------- */

function Icono({ tipo }: { tipo: "si" | "no" }) {
  return (
    <svg viewBox="0 0 24 24" className="size-8" aria-hidden="true">
      {tipo === "si" ? (
        <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M7 7l10 10M17 7L7 17" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
      )}
    </svg>
  );
}

export function JuegoVF({ ej, valor, alCambiar, resultado, revelar }: PropsJuego<EjVF>) {
  const elegido = valor?.tipo === "vf" ? valor.valor : null;
  const estado = (v: boolean): EstadoOpcion => {
    if (resultado && v === elegido) return resultado === "bien" ? "correcta" : "incorrecta";
    if (revelar && v === ej.respuesta) return "correcta";
    return v === elegido ? "elegida" : "normal";
  };
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-tarjeta bg-surface px-5 py-6 text-[21px] leading-7 font-extrabold">{ej.afirmacion}</div>
      <div className="grid grid-cols-2 gap-3">
        {[true, false].map((v) => (
          <Opcion key={String(v)} estado={estado(v)} bloqueada={bloqueado({ resultado })} onClick={() => alCambiar({ tipo: "vf", valor: v })}>
            <span className="flex flex-col items-center gap-1 py-3 text-center text-[18px] font-extrabold">
              <Icono tipo={v ? "si" : "no"} />
              {v ? "Verdadero" : "Falso"}
            </span>
          </Opcion>
        ))}
      </div>
    </div>
  );
}

/* ---------- Completar la frase ---------- */

export function JuegoCompletar({ ej, valor, alCambiar, resultado }: PropsJuego<EjCompletar>) {
  const grupo = useId();
  const opciones = useMemo(() => mezclar(ej.opciones), [ej]);
  const palabra = valor?.tipo === "completar" ? valor.palabra : null;
  const [antes, despues] = ej.frase.split("___");
  const tono = resultado === "bien" ? "bien" : resultado === "mal" ? "mal" : "elegida";

  return (
    <LayoutGroup id={grupo}>
      <div className="flex flex-col gap-8">
        <p className="text-[21px] leading-[44px] font-bold">
          {antes}
          <span className="mx-1 inline-flex min-w-24 justify-center border-b-[3px] border-surface align-middle">
            {palabra ? (
              <Ficha id={`c-${palabra}`} tono={tono} deshabilitada={bloqueado({ resultado })} onClick={() => alCambiar(null)}>
                {palabra}
              </Ficha>
            ) : (
              <span className="h-11" />
            )}
          </span>
          {despues}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {opciones.map((o) =>
            o === palabra ? (
              <span key={o} className="min-h-11 rounded-[12px] bg-surface px-3 py-2 text-[16px] font-bold text-transparent">
                {o}
              </span>
            ) : (
              <Ficha key={o} id={`c-${o}`} deshabilitada={bloqueado({ resultado })} onClick={() => alCambiar({ tipo: "completar", palabra: o })}>
                {o}
              </Ficha>
            ),
          )}
        </div>
      </div>
    </LayoutGroup>
  );
}

/* ---------- Escribir la respuesta ---------- */

export function JuegoEscribir({ ej, valor, alCambiar, resultado, revelar, conPista }: PropsJuego<EjEscribir>) {
  const texto = valor?.tipo === "escribir" ? valor.texto : "";
  const casi = resultado === "bien" && escrituraAceptada(texto, ej.respuestas).casi;
  const borde = resultado === "bien" ? "border-success-dark" : resultado === "mal" ? "border-error" : "border-surface focus:border-brand";
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[21px] leading-7 font-extrabold">{ej.pregunta}</p>
      <input
        type="text"
        value={texto}
        readOnly={bloqueado({ resultado })}
        onChange={(e) => alCambiar(e.target.value.trim() ? { tipo: "escribir", texto: e.target.value } : null)}
        placeholder={conPista ? `${ej.respuestas[0].slice(0, 2)}…` : "Escribe aquí"}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        enterKeyHint="done"
        aria-label="Tu respuesta"
        className={`h-14 w-full rounded-boton border-2 bg-card px-4 text-[18px] font-bold text-text outline-none placeholder:text-text-soft ${borde}`}
      />
      {casi && <p className="text-ayuda text-text-soft">Ojo con la ortografía: se escribe «{ej.respuestas[0]}».</p>}
      {revelar && <p className="text-ayuda font-bold text-text-soft">Se escribe: {ej.respuestas[0]}</p>}
    </div>
  );
}

/* ---------- Ordenar ---------- */

export function JuegoOrdenar({ ej, valor, alCambiar, resultado }: PropsJuego<EjOrdenar>) {
  const grupo = useId();
  const banco = useMemo(() => {
    let m = mezclar(ej.pasos.map((_, i) => i));
    if (m.every((x, i) => x === i)) m = m.reverse();
    return m;
  }, [ej]);
  const orden = valor?.tipo === "ordenar" ? valor.orden : [];
  const [parcial, setParcial] = useState<number[]>(orden);
  const elegidos = valor?.tipo === "ordenar" ? valor.orden : parcial;

  function poner(lista: number[]) {
    setParcial(lista);
    alCambiar(lista.length === ej.pasos.length ? { tipo: "ordenar", orden: lista } : null);
  }
  const tono = (pos: number, i: number) => (resultado ? (i === pos ? "bien" : "mal") : "normal");

  return (
    <LayoutGroup id={grupo}>
      <div className="flex flex-col gap-4">
        <p className="text-[21px] leading-7 font-extrabold">{ej.instruccion}</p>
        <div className="flex min-h-40 flex-col gap-2 rounded-tarjeta border-2 border-dashed border-surface p-3">
          {elegidos.length === 0 && <p className="m-auto text-ayuda text-text-soft">Toca los pasos en orden.</p>}
          {elegidos.map((i, pos) => (
            <Ficha
              key={i}
              id={`o-${i}`}
              tono={tono(pos, i) as "normal"}
              deshabilitada={bloqueado({ resultado })}
              onClick={() => poner(elegidos.filter((x) => x !== i))}
              className="flex items-center gap-3 text-left"
            >
              <span className="numeros grid size-6 shrink-0 place-items-center rounded-full bg-surface text-[13px] font-black text-text">
                {pos + 1}
              </span>
              {ej.pasos[i]}
            </Ficha>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {banco
            .filter((i) => !elegidos.includes(i))
            .map((i) => (
              <Ficha key={i} id={`o-${i}`} deshabilitada={bloqueado({ resultado })} onClick={() => poner([...elegidos, i])} className="text-left">
                {ej.pasos[i]}
              </Ficha>
            ))}
        </div>
      </div>
    </LayoutGroup>
  );
}

/* ---------- Clasificar en dos grupos ---------- */

export function JuegoClasificar({ ej, valor, alCambiar, resultado, revelar }: PropsJuego<EjClasificar>) {
  const grupo = useId();
  const orden = useMemo(() => mezclar(ej.items.map((_, i) => i)), [ej]);
  const [asignados, setAsignados] = useState<(0 | 1 | null)[]>(() =>
    valor?.tipo === "clasificar" ? valor.grupos : ej.items.map(() => null),
  );
  const pendientes = orden.filter((i) => asignados[i] === null);
  const actual = pendientes[0];

  function asignar(i: number, g: 0 | 1 | null) {
    const nuevos = asignados.slice();
    nuevos[i] = g;
    setAsignados(nuevos);
    alCambiar(nuevos.every((x) => x !== null) ? { tipo: "clasificar", grupos: nuevos as (0 | 1)[] } : null);
  }

  return (
    <LayoutGroup id={grupo}>
      <div className="flex flex-col gap-4">
        <p className="text-[21px] leading-7 font-extrabold">{ej.instruccion}</p>
        <div className="grid h-24 place-items-center">
          <AnimatePresence mode="popLayout">
            {actual !== undefined ? (
              <Ficha key={actual} id={`k-${actual}`} tono="elegida" className="px-6 py-3 text-[20px]">
                {ej.items[actual].texto}
              </Ficha>
            ) : (
              <motion.p key="listo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-text-soft">
                {resultado ? "" : "Listo. Toca una ficha si quieres moverla."}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {ej.grupos.map((nombre, g) => (
            <motion.div
              key={nombre}
              role="button"
              tabIndex={0}
              aria-label={`Poner en ${nombre}`}
              onClick={() => actual !== undefined && !resultado && asignar(actual, g as 0 | 1)}
              onKeyDown={(e) => e.key === "Enter" && actual !== undefined && !resultado && asignar(actual, g as 0 | 1)}
              whileTap={actual !== undefined && !resultado ? { scale: 0.97 } : undefined}
              onPointerDown={() => actual !== undefined && !resultado && (sonidos.toque(), vibrar("toque"))}
              className="flex min-h-44 cursor-pointer flex-col gap-2 rounded-tarjeta border-2 border-surface bg-surface/60 p-2"
            >
              <p className="py-1 text-center font-extrabold text-brand">{nombre}</p>
              {ej.items.map((it, i) =>
                asignados[i] === g ? (
                  <Ficha
                    key={i}
                    id={`k-${i}`}
                    deshabilitada={!!resultado}
                    tono={resultado || revelar ? (it.grupo === g ? "bien" : "mal") : "normal"}
                    onClick={() => asignar(i, null)}
                    className="text-[15px]"
                  >
                    {it.texto}
                  </Ficha>
                ) : null,
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </LayoutGroup>
  );
}

/* ---------- Une las parejas ---------- */

export function JuegoParejas({ ej, alCambiar, resultado }: PropsJuego<EjParejas>) {
  const izq = useMemo(() => mezclar(ej.pares.map((_, i) => i)), [ej]);
  const der = useMemo(() => mezclar(ej.pares.map((_, i) => i)), [ej]);
  const [sel, setSel] = useState<{ lado: 0 | 1; i: number } | null>(null);
  const [hechos, setHechos] = useState<number[]>([]);
  const [error, setError] = useState<{ a: number; b: number; n: number } | null>(null);
  const [errores, setErrores] = useState(0);

  function tocar(lado: 0 | 1, i: number) {
    if (resultado || hechos.includes(i)) return;
    if (!sel || sel.lado === lado) {
      setSel({ lado, i });
      return;
    }
    const a = lado === 0 ? i : sel.i;
    const b = lado === 1 ? i : sel.i;
    setSel(null);
    if (a === b) {
      const nuevos = [...hechos, a];
      setHechos(nuevos);
      sonidos.acierto();
      vibrar("toque");
      if (nuevos.length === ej.pares.length) alCambiar({ tipo: "parejas", errores });
    } else {
      setErrores((e) => e + 1);
      setError({ a, b, n: Date.now() });
      sonidos.error();
      vibrar("error");
    }
  }

  function boton(lado: 0 | 1, i: number) {
    const listo = hechos.includes(i);
    const elegido = sel?.lado === lado && sel.i === i;
    const falla = error && (lado === 0 ? error.a : error.b) === i;
    const clase = listo
      ? "bg-success border-success-dark text-text opacity-60"
      : elegido
        ? "bg-card border-brand text-brand"
        : "bg-card border-surface text-text";
    return (
      <motion.button
        key={`${lado}-${i}-${falla ? error!.n : 0}`}
        type="button"
        disabled={listo}
        onClick={() => tocar(lado, i)}
        onPointerDown={() => !listo && sonidos.toque()}
        animate={falla ? { x: [0, -6, 6, -6, 6, 0] } : listo ? { scale: [1, 1.06, 1] } : {}}
        transition={{ duration: 0.32 }}
        whileTap={{ y: 2 }}
        style={{ boxShadow: `0 3px 0 ${listo ? "var(--success-dark)" : elegido ? "var(--brand)" : "var(--surface)"}` }}
        className={`min-h-16 cursor-pointer rounded-[12px] border-2 px-2 py-2 text-center text-[15px] leading-5 font-bold ${clase}`}
      >
        {ej.pares[i][lado]}
      </motion.button>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[21px] leading-7 font-extrabold">Toca un término y luego su pareja.</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-3">{izq.map((i) => boton(0, i))}</div>
        <div className="flex flex-col gap-3">{der.map((i) => boton(1, i))}</div>
      </div>
      {errores > 0 && !resultado && (
        <p className="text-center text-ayuda text-text-soft">
          {errores === 1 ? "Un cruce. Se vale uno." : `${errores} cruces. Sigue, ya casi.`}
        </p>
      )}
    </div>
  );
}

/* ---------- Selector ---------- */

export function Juego(p: PropsJuego<Ejercicio>) {
  switch (p.ej.tipo) {
    case "opcion":
      return <JuegoOpcion {...(p as PropsJuego<EjOpcion>)} />;
    case "vf":
      return <JuegoVF {...(p as PropsJuego<EjVF>)} />;
    case "completar":
      return <JuegoCompletar {...(p as PropsJuego<EjCompletar>)} />;
    case "escribir":
      return <JuegoEscribir {...(p as PropsJuego<EjEscribir>)} />;
    case "ordenar":
      return <JuegoOrdenar {...(p as PropsJuego<EjOrdenar>)} />;
    case "clasificar":
      return <JuegoClasificar {...(p as PropsJuego<EjClasificar>)} />;
    case "parejas":
      return <JuegoParejas {...(p as PropsJuego<EjParejas>)} />;
  }
}
