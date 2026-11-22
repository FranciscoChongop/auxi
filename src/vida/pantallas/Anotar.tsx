import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Boton } from "../../components/Boton";
import { Interruptor } from "../../components/Interruptor";
import { Ventana } from "../../components/Ventana";
import { hoy, sumarDias } from "../../lib/fechas";
import { metricas, primerDiaDeUso } from "../../lib/metricas";
import { parametro, reemplazar } from "../../lib/rutas";
import { sonidos } from "../../lib/sonidos";
import { vibrar } from "../../lib/vibrar";
import { CATEGORIAS_GASTO, CATEGORIAS_INGRESO, entender, type Entendido } from "../entender";
import { anotar, desglose, obtenerVida, soles, useVida } from "../estado";
import { guardarLogro } from "../logro";
import { aNumero, CampoSoles, CaraLeonVida, Chip, Encabezado, LeonVida, type CaraVida } from "../ui";

type Mensaje =
  | { id: number; de: "leon"; texto: string; cara?: CaraVida }
  | { id: number; de: "yo"; texto: string }
  | { id: number; de: "tarjeta"; items: (Entendido & { extra: boolean })[]; estado: "abierta" | "anotada" | "descartada" };

// Reconocimiento de voz del navegador (Chrome en Android y Safari en iPhone lo traen).
type Reconocedor = { lang: string; interimResults: boolean; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null; start: () => void; stop: () => void };
const ClaseVoz = (window as unknown as { SpeechRecognition?: new () => Reconocedor; webkitSpeechRecognition?: new () => Reconocedor }).SpeechRecognition ??
  (window as unknown as { webkitSpeechRecognition?: new () => Reconocedor }).webkitSpeechRecognition;

const RESPUESTAS_GASTO = ["Anotado.", "Listo, ya lo tengo.", "Hecho.", "Anotadito."];
const al = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];

export default function Anotar() {
  const e = useVida();
  const modoIngreso = parametro("tipo") === "ingreso";
  const primero = parametro("primero") === "1";
  const siguienteId = useRef(1);
  const [texto, setTexto] = useState("");
  const [escuchando, setEscuchando] = useState(false);
  const [manual, setManual] = useState(false);
  const voz = useRef<Reconocedor | null>(null);
  const abajo = useRef<HTMLDivElement>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>(() => [
    {
      id: 0,
      de: "leon",
      cara: "feliz",
      texto: primero
        ? "¡Ya tienes tu número! Ahora anota tu primer gasto de hoy. Escríbelo como se lo dirías a un amigo: «menú 12» o «pasaje 3»."
        : modoIngreso
          ? "¿Cuánto entró? Por ejemplo: «me yapearon 50» o «vendí 80»."
          : "¿Qué gastaste? Por ejemplo: «almuerzo 12 y pasaje 3».",
    },
  ]);

  useEffect(() => {
    abajo.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [mensajes]);

  const decir = (m: { texto: string; cara?: CaraVida }) => setMensajes((a) => [...a, { ...m, de: "leon", id: siguienteId.current++ }]);

  const enviar = (frase = texto) => {
    const t = frase.trim();
    if (!t) return;
    setTexto("");
    sonidos.toque();
    let items = entender(t);
    if (modoIngreso) items = items.map((x) => (x.tipo === "gasto" ? { ...x, tipo: "ingreso", categoria: "Otros ingresos" } : x));
    const conExtra = items.map((x) => ({ ...x, extra: false }));
    setMensajes((a) => [
      ...a,
      { id: siguienteId.current++, de: "yo", texto: t },
      ...(items.length
        ? [{ id: siguienteId.current++, de: "tarjeta" as const, items: conExtra, estado: "abierta" as const }]
        : [{ id: siguienteId.current++, de: "leon" as const, cara: "curioso" as const, texto: "No encontré el monto. Prueba así: «almuerzo 12». O usa el formulario de abajo." }]),
    ]);
  };

  const confirmar = (id: number) => {
    const msg = mensajes.find((m) => m.id === id);
    if (!msg || msg.de !== "tarjeta" || msg.estado !== "abierta") return;
    let ultimo = null;
    let algunoPrimero = false;
    for (const it of msg.items) {
      const l = anotar({ tipo: it.tipo, monto: it.monto, categoria: it.categoria, nota: it.nota, fecha: it.fecha, extra: it.extra || undefined, origen: "chat" });
      metricas.vidaAnotado({ tipo: it.tipo, origen: "chat", primero: l.primero, primerDia: primerDiaDeUso("vida") });
      ultimo = ultimo ?? l;
      algunoPrimero ||= l.primero;
    }
    setMensajes((a) => a.map((m) => (m.id === id && m.de === "tarjeta" ? { ...m, estado: "anotada" } : m)));
    sonidos.acierto();
    vibrar("acierto");
    const d = desglose(obtenerVida());
    // Solo el primer registro de todos lleva a una pantalla aparte; lo demás se confirma aquí mismo.
    if (ultimo && algunoPrimero) {
      guardarLogro({ ...ultimo, primero: algunoPrimero, quedan: d.quedan });
      setTimeout(() => reemplazar("/vida/logro"), 650);
      return;
    }
    if (!obtenerVida().plan) decir({ cara: "feliz", texto: `${al(RESPUESTAS_GASTO)}` });
    else if (d.quedan < 0) decir({ cara: "tierno", texto: `Hoy te pasaste ${soles(-d.quedan)}. Mañana ajustamos juntos.` });
    else decir({ cara: "feliz", texto: `${al(RESPUESTAS_GASTO)} Hoy te quedan ${soles(d.quedan)}.` });
  };

  const descartar = (id: number) => {
    setMensajes((a) => a.map((m) => (m.id === id && m.de === "tarjeta" ? { ...m, estado: "descartada" } : m)));
    decir({ cara: "tierno", texto: "Tranqui, no lo anoté. Escríbelo de otra forma o usa el formulario." });
  };

  const editar = (id: number, i: number, cambio: Partial<Entendido & { extra: boolean }>) =>
    setMensajes((a) => a.map((m) => (m.id === id && m.de === "tarjeta" ? { ...m, items: m.items.map((x, j) => (j === i ? { ...x, ...cambio } : x)) } : m)));

  const hablar = () => {
    if (!ClaseVoz) return;
    if (escuchando) {
      voz.current?.stop();
      return;
    }
    const r = new ClaseVoz();
    r.lang = "es-PE";
    r.interimResults = false;
    r.onresult = (ev) => {
      const dicho = ev.results[0]?.[0]?.transcript ?? "";
      if (dicho) enviar(dicho);
    };
    r.onend = () => setEscuchando(false);
    r.onerror = () => {
      setEscuchando(false);
      decir({ cara: "curioso", texto: "No te escuché bien. Prueba de nuevo o escríbelo." });
    };
    voz.current = r;
    setEscuchando(true);
    sonidos.toque();
    r.start();
  };

  return (
    <div className="mx-auto flex h-dvh max-w-md flex-col">
      <Encabezado titulo={modoIngreso ? "Anotar ingreso" : "Anotar con León"} />

      <div className="flex-1 overflow-y-auto px-4 pb-4" aria-live="polite">
        <div className="flex flex-col gap-3 pt-2">
          {mensajes.map((m) =>
            m.de === "yo" ? (
              <motion.p key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-[80%] self-end rounded-[20px] rounded-br-[6px] bg-brand px-4 py-2.5 font-bold text-white">
                {m.texto}
              </motion.p>
            ) : m.de === "leon" ? (
              <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex max-w-[88%] items-end gap-2">
                <CaraLeonVida cara={m.cara} />
                <p className="rounded-[20px] rounded-bl-[6px] bg-card px-4 py-2.5">{m.texto}</p>
              </motion.div>
            ) : (
              <TarjetaConfirmar
                key={m.id}
                msg={m}
                periodo={e.plan?.periodo ?? "dia"}
                alConfirmar={() => confirmar(m.id)}
                alDescartar={() => descartar(m.id)}
                alEditar={(i, c) => editar(m.id, i, c)}
              />
            ),
          )}
          <div ref={abajo} />
        </div>
      </div>

      <div className="border-t-2 border-surface bg-bg px-3 pt-2" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 10px)" }}>
        <form
          onSubmit={(ev) => {
            ev.preventDefault();
            enviar();
          }}
          className="flex items-center gap-2"
        >
          <input
            value={texto}
            onChange={(ev) => setTexto(ev.target.value)}
            placeholder={modoIngreso ? "me pagaron 80" : "almuerzo 12"}
            enterKeyHint="send"
            aria-label="Escribe tu gasto o ingreso"
            className="h-14 min-w-0 flex-1 rounded-full border-2 border-surface bg-card px-5 text-[17px] font-semibold outline-none placeholder:text-text-soft focus:border-brand"
          />
          {ClaseVoz && !texto && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={hablar}
              aria-label={escuchando ? "Dejar de escuchar" : "Dictar con la voz"}
              className={`grid size-14 shrink-0 cursor-pointer place-items-center rounded-full ${escuchando ? "bg-reward text-text" : "bg-surface text-brand"}`}
            >
              <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
                <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <rect x="9" y="3.5" width="6" height="11" rx="3" />
                  <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5" />
                </g>
              </svg>
            </motion.button>
          )}
          {(texto || !ClaseVoz) && (
            <motion.button
              type="submit"
              whileTap={{ scale: 0.9 }}
              aria-label="Enviar"
              disabled={!texto.trim()}
              className="grid size-14 shrink-0 cursor-pointer place-items-center rounded-full bg-brand text-white disabled:bg-surface disabled:text-text-soft"
            >
              <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
                <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.button>
          )}
        </form>
        <button type="button" onClick={() => setManual(true)} className="mt-1 min-h-11 w-full cursor-pointer text-ayuda font-extrabold text-brand">
          Prefiero el formulario
        </button>
      </div>

      <AnimatePresence>
        {escuchando && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-x-0 bottom-36 z-30 mx-auto flex max-w-md flex-col items-center">
            <div className="rounded-[24px] bg-card px-6 pt-4 pb-3 text-center shadow-[0_8px_30px_rgba(14,91,87,0.18)]">
              <LeonVida pose="celular" alto={120} rebote />
              <p className="mt-1 font-extrabold">Te escucho…</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <FormularioManual
        abierto={manual}
        tipoInicial={modoIngreso ? "ingreso" : "gasto"}
        alCerrar={() => setManual(false)}
        alListo={(it) => {
          setManual(false);
          setMensajes((a) => [...a, { id: siguienteId.current++, de: "tarjeta", items: [{ ...it, extra: false }], estado: "abierta" }]);
        }}
      />
    </div>
  );
}

function TarjetaConfirmar({
  msg,
  periodo,
  alConfirmar,
  alDescartar,
  alEditar,
}: {
  msg: Extract<Mensaje, { de: "tarjeta" }>;
  periodo: string;
  alConfirmar: () => void;
  alDescartar: () => void;
  alEditar: (i: number, c: Partial<Entendido & { extra: boolean }>) => void;
}) {
  const [editando, setEditando] = useState<number | null>(null);
  const abierta = msg.estado === "abierta";
  const h = hoy();
  return (
    <motion.div initial={{ opacity: 0, y: 12, scale: 0.97 }} animate={{ opacity: msg.estado === "descartada" ? 0.5 : 1, y: 0, scale: 1 }} className="ml-12 rounded-[20px] border-2 border-surface bg-card p-4">
      <ul className="flex flex-col gap-3">
        {msg.items.map((it, i) => (
          <li key={i}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-extrabold">{it.nota}</p>
                <button
                  type="button"
                  disabled={!abierta}
                  onClick={() => setEditando(editando === i ? null : i)}
                  className="-mx-1 mt-0.5 min-h-8 cursor-pointer rounded-full px-1 text-ayuda font-extrabold text-brand disabled:text-text-soft"
                >
                  {it.categoria} · {it.fecha === h ? "hoy" : it.fecha === sumarDias(h, -1) ? "ayer" : "anteayer"}
                  {abierta && " ✎"}
                </button>
              </div>
              <p className={`numeros text-tarjeta font-black ${it.tipo === "ingreso" ? "text-brand" : ""}`}>
                {it.tipo === "ingreso" ? "+ " : "− "}
                {soles(it.monto)}
              </p>
            </div>
            <AnimatePresence>
              {editando === i && abierta && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="flex flex-wrap gap-2 pt-3">
                    {(it.tipo === "gasto" ? CATEGORIAS_GASTO : CATEGORIAS_INGRESO).map((c) => (
                      <Chip key={c} activo={it.categoria === c} onClick={() => alEditar(i, { categoria: c })}>
                        {c}
                      </Chip>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-3">
                    {[
                      ["Hoy", h],
                      ["Ayer", sumarDias(h, -1)],
                    ].map(([n, f]) => (
                      <Chip key={f} activo={it.fecha === f} onClick={() => alEditar(i, { fecha: f })}>
                        {n}
                      </Chip>
                    ))}
                    <Chip activo={false} onClick={() => alEditar(i, { tipo: it.tipo === "gasto" ? "ingreso" : "gasto", categoria: it.tipo === "gasto" ? "Otros ingresos" : "Otros" })}>
                      Era {it.tipo === "gasto" ? "ingreso" : "gasto"}
                    </Chip>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {it.tipo === "ingreso" && periodo !== "dia" && abierta && (
              <div className="mt-3">
                <Interruptor etiqueta="Es extra (suma a hoy)" ayuda="Apágalo si es tu sueldo de siempre: ya está en tu plan." activo={it.extra} alCambiar={(v) => alEditar(i, { extra: v })} />
              </div>
            )}
          </li>
        ))}
      </ul>
      {abierta ? (
        <div className="mt-4 flex gap-2">
          <Boton variante="secundario" onClick={alDescartar} className="flex-1 px-2">
            No es eso
          </Boton>
          <Boton onClick={alConfirmar} className="flex-1">
            Anotar
          </Boton>
        </div>
      ) : (
        <p className="mt-3 text-ayuda font-extrabold text-text-soft">{msg.estado === "anotada" ? "✓ Anotado" : "No se anotó"}</p>
      )}
    </motion.div>
  );
}

function FormularioManual({ abierto, tipoInicial, alCerrar, alListo }: { abierto: boolean; tipoInicial: "gasto" | "ingreso"; alCerrar: () => void; alListo: (it: Entendido) => void }) {
  const [tipo, setTipo] = useState(tipoInicial);
  const [monto, setMonto] = useState("");
  const [nota, setNota] = useState("");
  const [categoria, setCategoria] = useState<string>(tipoInicial === "gasto" ? "Comida" : "Trabajo");
  const [fecha, setFecha] = useState(hoy());
  const h = hoy();
  const listo = () => {
    alListo({ tipo, monto: aNumero(monto), categoria, nota: nota.trim() || categoria, fecha });
    setMonto("");
    setNota("");
  };
  return (
    <Ventana abierta={abierto} alCerrar={alCerrar} titulo="Anotar a mano">
      <div className="flex max-h-[70dvh] flex-col gap-4 overflow-y-auto pb-1 [&>*]:shrink-0">
        <div className="flex gap-2">
          <Chip
            activo={tipo === "gasto"}
            onClick={() => {
              setTipo("gasto");
              setCategoria("Comida");
            }}
          >
            Gasto
          </Chip>
          <Chip
            activo={tipo === "ingreso"}
            onClick={() => {
              setTipo("ingreso");
              setCategoria("Trabajo");
            }}
          >
            Ingreso
          </Chip>
        </div>
        <CampoSoles etiqueta="Monto" valor={monto} alCambiar={setMonto} />
        <label className="block">
          <span className="text-ayuda font-extrabold text-text-soft">¿En qué? (opcional)</span>
          <input value={nota} onChange={(ev) => setNota(ev.target.value)} placeholder="Menú, pasaje…" className="mt-1 h-14 w-full rounded-[16px] border-2 border-surface bg-card px-4 outline-none focus:border-brand" />
        </label>
        <div className="flex flex-wrap gap-2">
          {(tipo === "gasto" ? CATEGORIAS_GASTO : CATEGORIAS_INGRESO).map((c) => (
            <Chip key={c} activo={categoria === c} onClick={() => setCategoria(c)}>
              {c}
            </Chip>
          ))}
        </div>
        <div className="flex gap-2">
          {[
            ["Hoy", h],
            ["Ayer", sumarDias(h, -1)],
          ].map(([n, f]) => (
            <Chip key={f} activo={fecha === f} onClick={() => setFecha(f)}>
              {n}
            </Chip>
          ))}
        </div>
        <Boton deshabilitado={!aNumero(monto)} onClick={listo}>
          Revisar y anotar
        </Boton>
      </div>
    </Ventana>
  );
}
