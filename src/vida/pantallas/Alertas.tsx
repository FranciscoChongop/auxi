import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { Boton } from "../../components/Boton";
import { useAviso } from "../../components/Aviso";
import { Ventana } from "../../components/Ventana";
import { bonita, diasEntre, hoy } from "../../lib/fechas";
import { entradaEnCascada } from "../../lib/movimiento";
import { metricas } from "../../lib/metricas";
import { parametro } from "../../lib/rutas";
import { sonidos } from "../../lib/sonidos";
import { vibrar } from "../../lib/vibrar";
import { actualizarVida, nuevoId, useVida } from "../estado";
import { revisar, type Resultado } from "../estafa";
import { Chip, LeonVida, MarcadoresVida, Pagina } from "../ui";

const NIVEL = {
  bajo: { texto: "Riesgo bajo", clase: "bg-success/40", detalle: "No vi señales comunes. Igual, mantente atento." },
  medio: { texto: "Riesgo medio", clase: "bg-reward/35", detalle: "Hay cosas que huelen raro. Mejor confirma antes." },
  alto: { texto: "Riesgo alto", clase: "bg-error/15", detalle: "Ese mensaje huele raro. Tiene varias señales de estafa." },
} as const;

const TIPOS = ["DNI", "SOAT", "Brevete", "Recibo", "Cumpleaños", "Otro"];

// Reconocimiento de voz del navegador, para dictar pendientes.
type Reconocedor = { lang: string; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null; start: () => void };
const ClaseVoz = (window as unknown as { SpeechRecognition?: new () => Reconocedor }).SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: new () => Reconocedor }).webkitSpeechRecognition;

export default function Alertas() {
  const [vista, setVista] = useState<"estafa" | "pendientes">(parametro("ver") === "pendientes" ? "pendientes" : "estafa");
  return (
    <Pagina conBarra>
      <div className="flex items-center justify-between px-5" style={{ paddingTop: "calc(env(safe-area-inset-top) + 14px)" }}>
        <h1 className="text-titulo font-black">Alertas</h1>
        <MarcadoresVida />
      </div>
      <div role="tablist" className="mx-5 mt-4 grid grid-cols-2 gap-1 rounded-[16px] bg-surface p-1">
        {(
          [
            ["estafa", "¿Esto es estafa?"],
            ["pendientes", "Pendientes"],
          ] as const
        ).map(([id, nombre]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={vista === id}
            onClick={() => {
              sonidos.toque();
              setVista(id);
            }}
            className={`h-11 cursor-pointer rounded-[12px] font-extrabold ${vista === id ? "bg-card text-brand" : "text-text-soft"}`}
          >
            {nombre}
          </button>
        ))}
      </div>
      {vista === "estafa" ? <Estafa /> : <Pendientes />}
    </Pagina>
  );
}

function Estafa() {
  const [texto, setTexto] = useState("");
  const [analizando, setAnalizando] = useState(false);
  const [res, setRes] = useState<Resultado | null>(null);

  const analizar = () => {
    if (!texto.trim()) return;
    sonidos.toque();
    setRes(null);
    setAnalizando(true);
    // Una pausa corta para que se vea a León revisando (el análisis es inmediato).
    setTimeout(() => {
      const r = revisar(texto);
      setRes(r);
      setAnalizando(false);
      actualizarVida((s) => ({ revisiones: s.revisiones + 1 }));
      metricas.vidaRevisionEstafa(r.nivel);
      if (r.nivel === "alto") {
        sonidos.error();
        vibrar("error");
      } else sonidos.acierto();
    }, 700);
  };

  return (
    <div className="px-5 pt-5">
      <div className="flex items-center gap-3">
        <LeonVida pose={res?.nivel === "alto" ? "alerta" : "detective"} alto={110} rebote key={res?.nivel ?? "lupa"} />
        <p className="flex-1 rounded-[20px] rounded-bl-[6px] bg-card p-3 text-[15px] leading-[21px]">
          {analizando ? "Déjame revisar con mi lupa…" : res ? NIVEL[res.nivel].detalle : "Pega el mensaje que te llegó y lo revisamos juntos."}
        </p>
      </div>

      <label className="mt-4 block">
        <span className="sr-only">Mensaje sospechoso</span>
        <textarea
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            setRes(null);
          }}
          rows={5}
          placeholder="Ej.: «BCP: su cuenta será bloqueada hoy. Ingrese aquí y confirme su clave…»"
          className="w-full resize-none rounded-[20px] border-2 border-surface bg-card p-4 text-[17px] outline-none placeholder:text-text-soft focus:border-brand"
        />
      </label>
      <div className="mt-3">
        <Boton deshabilitado={!texto.trim() || analizando} onClick={analizar}>
          {analizando ? "Revisando…" : "Revisar mensaje"}
        </Boton>
      </div>
      <p className="mt-2 text-center text-ayuda text-text-soft">El mensaje no se guarda. Pronto también podrás subir la captura.</p>

      <AnimatePresence>
        {res && (
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-5 flex flex-col gap-3">
            <div className={`rounded-[20px] p-4 ${NIVEL[res.nivel].clase}`}>
              <p className="text-tarjeta font-black">{NIVEL[res.nivel].texto}</p>
              <p className="text-ayuda">León revisa señales comunes; no puede asegurar al 100 % si es estafa o no.</p>
            </div>
            {res.senales.length > 0 && (
              <div className="rounded-[20px] bg-card p-4">
                <h2 className="font-extrabold">Lo que vi</h2>
                <ul className="mt-2 flex flex-col gap-3">
                  {res.senales.map((s, i) => (
                    <motion.li key={s.id} {...entradaEnCascada(i)}>
                      <p className="font-extrabold">{s.titulo}</p>
                      <p className="text-ayuda text-text-soft">{s.detalle}</p>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}
            <div className="rounded-[20px] bg-card p-4">
              <h2 className="font-extrabold">Qué hacer</h2>
              <ul className="mt-2 flex list-disc flex-col gap-1 pl-5">
                {res.consejos.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <p className="mt-5 rounded-[20px] border-2 border-brand p-4 font-extrabold">Nadie de verdad te pedirá tu clave ni tu código por mensaje.</p>
    </div>
  );
}

function Pendientes() {
  const e = useVida();
  const aviso = useAviso();
  const h = hoy();
  const [abierta, setAbierta] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState("Recibo");
  const [fecha, setFecha] = useState("");
  const [escuchando, setEscuchando] = useState(false);
  const entrada = useRef<HTMLInputElement>(null);
  const lista = [...e.pendientes].sort((a, b) => Number(a.hecho) - Number(b.hecho) || a.fecha.localeCompare(b.fecha));

  const agregar = () => {
    actualizarVida((s) => ({ pendientes: [...s.pendientes, { id: nuevoId("p"), titulo: titulo.trim() || tipo, tipo, fecha, hecho: false }] }));
    sonidos.acierto();
    setAbierta(false);
    setTitulo("");
    setFecha("");
    aviso("Anotado. Te lo recuerdo en tu inicio cuando se acerque.", "exito");
  };

  const dictar = () => {
    if (!ClaseVoz) return;
    const r = new ClaseVoz();
    r.lang = "es-PE";
    r.onresult = (ev) => setTitulo(ev.results[0]?.[0]?.transcript ?? "");
    r.onend = () => setEscuchando(false);
    r.onerror = () => setEscuchando(false);
    setEscuchando(true);
    r.start();
  };

  return (
    <div className="px-5 pt-5">
      <p className="text-text-soft">DNI, SOAT, brevete, recibos y cumpleaños. Te los muestro en tu inicio una semana antes.</p>
      {lista.length === 0 ? (
        <div className="mt-6 flex flex-col items-center text-center">
          <LeonVida pose="anima" alto={140} />
          <p className="mt-2 font-extrabold">Nada pendiente por ahora.</p>
          <p className="text-ayuda text-text-soft">Anota la fecha de tu SOAT o tu próximo recibo.</p>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {lista.map((p, i) => {
            const dias = diasEntre(h, p.fecha);
            return (
              <motion.li key={p.id} {...entradaEnCascada(i)} className={`flex min-h-16 items-center gap-3 rounded-[16px] bg-card px-3 py-2 ${p.hecho ? "opacity-60" : ""}`}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={p.hecho}
                  aria-label={`Marcar ${p.titulo} como hecho`}
                  onClick={() => {
                    sonidos.toque();
                    actualizarVida((s) => ({ pendientes: s.pendientes.map((x) => (x.id === p.id ? { ...x, hecho: !x.hecho } : x)) }));
                  }}
                  className={`grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border-2 ${p.hecho ? "border-brand bg-brand text-white" : "border-surface"}`}
                >
                  {p.hecho && (
                    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <span className="flex-1">
                  <span className={`block font-extrabold ${p.hecho ? "line-through" : ""}`}>{p.titulo}</span>
                  <span className="text-ayuda text-text-soft">
                    {p.tipo} · {bonita(p.fecha)}
                  </span>
                </span>
                {!p.hecho && (
                  <span className={`rounded-full px-2.5 py-1 text-ayuda font-extrabold ${dias < 0 ? "bg-surface" : dias <= 3 ? "bg-reward/40" : "bg-surface"}`}>
                    {dias < 0 ? "Ya pasó" : dias === 0 ? "Hoy" : dias === 1 ? "Mañana" : `${dias} días`}
                  </span>
                )}
              </motion.li>
            );
          })}
        </ul>
      )}
      <div className="mt-5">
        <Boton
          onClick={() => {
            setAbierta(true);
            setTimeout(() => entrada.current?.focus(), 300);
          }}
        >
          Agregar pendiente
        </Boton>
      </div>

      <Ventana abierta={abierta} alCerrar={() => setAbierta(false)} titulo="Nuevo pendiente">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {TIPOS.map((t) => (
              <Chip key={t} activo={tipo === t} onClick={() => setTipo(t)}>
                {t}
              </Chip>
            ))}
          </div>
          <label className="block">
            <span className="text-ayuda font-extrabold text-text-soft">¿Qué es?</span>
            <span className="mt-1 flex gap-2">
              <input ref={entrada} value={titulo} onChange={(ev) => setTitulo(ev.target.value)} placeholder="Pagar la luz, cumple de mamá…" className="h-14 min-w-0 flex-1 rounded-[16px] border-2 border-surface bg-card px-4 outline-none focus:border-brand" />
              {ClaseVoz && (
                <button type="button" onClick={dictar} aria-label="Dictar con la voz" className={`grid size-14 shrink-0 cursor-pointer place-items-center rounded-[16px] ${escuchando ? "bg-reward" : "bg-surface text-brand"}`}>
                  <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
                    <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                      <rect x="9" y="3.5" width="6" height="11" rx="3" />
                      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5" />
                    </g>
                  </svg>
                </button>
              )}
            </span>
          </label>
          <label className="block">
            <span className="text-ayuda font-extrabold text-text-soft">¿Para cuándo?</span>
            <input type="date" value={fecha} min={h} onChange={(ev) => setFecha(ev.target.value)} className="mt-1 h-14 w-full rounded-[16px] border-2 border-surface bg-card px-4 outline-none focus:border-brand" />
          </label>
          <Boton deshabilitado={!fecha} onClick={agregar}>
            Guardar
          </Boton>
        </div>
      </Ventana>
    </div>
  );
}
