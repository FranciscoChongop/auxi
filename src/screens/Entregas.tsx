import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useAviso } from "../components/Aviso";
import { Boton } from "../components/Boton";
import { Pantalla } from "../components/Navegacion";
import { Ventana } from "../components/Ventana";
import { actualizar, useEstado, type Entrega } from "../lib/estado";
import { bonita, diasEntre, hoy, sumarDias } from "../lib/fechas";
import { sonidos } from "../lib/sonidos";

const AVISOS = [7, 3, 1];
const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const FRANJAS = ["Mañana", "Tarde", "Noche"];

/** Lee líneas con fecha (12/05, 12-05-2026) de un sílabo pegado. Versión simple hasta que llegue la IA. */
function leerSilabo(texto: string): Entrega[] {
  const anio = new Date().getFullYear();
  return texto
    .split(/\n+/)
    .map((linea, i) => {
      const m = linea.match(/(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2,4}))?/);
      if (!m) return null;
      const d = Number(m[1]);
      const mes = Number(m[2]);
      const a = m[3] ? (m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3])) : anio;
      if (d < 1 || d > 31 || mes < 1 || mes > 12) return null;
      const titulo = linea.replace(m[0], "").replace(/^[\s:,.–-]+|[\s:,.–-]+$/g, "").slice(0, 60) || "Entrega";
      return { id: `s${Date.now()}${i}`, titulo, curso: "Sílabo", fecha: `${a}-${String(mes).padStart(2, "0")}-${String(d).padStart(2, "0")}` };
    })
    .filter((x): x is Entrega => !!x && diasEntre(hoy(), x.fecha) >= 0);
}

function Faltan({ fecha }: { fecha: string }) {
  const d = diasEntre(hoy(), fecha);
  const texto = d === 0 ? "Hoy" : d === 1 ? "Mañana" : `En ${d} días`;
  return (
    <span className={`rounded-full px-3 py-1 text-ayuda font-extrabold ${d <= 1 ? "bg-error text-white" : "bg-surface text-text"}`}>{texto}</span>
  );
}

function ListaEntregas() {
  const e = useEstado();
  const aviso = useAviso();
  const [silabo, setSilabo] = useState(false);
  const [nueva, setNueva] = useState(false);
  const [texto, setTexto] = useState("");
  const [titulo, setTitulo] = useState("");
  const [fecha, setFecha] = useState(sumarDias(hoy(), 7));
  const lista = [...e.entregas].sort((a, b) => a.fecha.localeCompare(b.fecha));

  return (
    <>
      <AnimatePresence initial={false}>
        {lista.map((x, i) => {
          const d = diasEntre(hoy(), x.fecha);
          return (
            <motion.div
              key={x.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
              exit={{ opacity: 0, x: 60, transition: { duration: 0.2 } }}
              className="rounded-tarjeta border-2 border-surface bg-card p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[18px] leading-6 font-extrabold">{x.titulo}</p>
                  <p className="text-ayuda text-text-soft">
                    {x.curso} · {bonita(x.fecha)}
                  </p>
                </div>
                <Faltan fecha={x.fecha} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-ayuda font-bold text-text-soft">
                Avisos:
                {AVISOS.map((a) => (
                  <span key={a} className={`rounded-full border-2 px-2 py-0.5 ${d < a ? "border-surface line-through" : "border-brand text-brand"}`}>
                    {a} {a === 1 ? "día" : "días"} antes
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  sonidos.acierto();
                  actualizar((s) => ({ entregas: s.entregas.filter((y) => y.id !== x.id) }));
                  aviso("¡Entregado! Uno menos.", "exito");
                }}
                className="mt-2 h-11 cursor-pointer font-extrabold text-brand"
              >
                Marcar como entregado
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
      {lista.length === 0 && <p className="py-6 text-center text-text-soft">No tienes entregas. Pega tu sílabo para empezar.</p>}

      <div className="grid grid-cols-2 gap-3">
        <Boton onClick={() => setSilabo(true)}>Pegar sílabo</Boton>
        <Boton variante="secundario" onClick={() => setNueva(true)}>
          Agregar una
        </Boton>
      </div>
      <p className="text-center text-ayuda text-text-soft">Los avisos en tu celular se activan en la próxima versión.</p>

      <Ventana abierta={silabo} alCerrar={() => setSilabo(false)} titulo="Pega tu sílabo">
        <p className="mb-3 text-ayuda text-text-soft">Una entrega por línea, con su fecha. Ejemplo: «Informe 1 – 15/12».</p>
        <textarea
          value={texto}
          onChange={(ev) => setTexto(ev.target.value)}
          placeholder={"Práctica 1 – 05/12\nExamen parcial – 19/12"}
          className="h-40 w-full resize-none rounded-boton border-2 border-surface bg-card p-3 text-[16px] font-semibold outline-none focus:border-brand"
          aria-label="Texto del sílabo"
        />
        <div className="mt-4">
          <Boton
            deshabilitado={!texto.trim()}
            onClick={() => {
              const nuevas = leerSilabo(texto);
              if (!nuevas.length) {
                aviso("No encontré fechas. Usa el formato 15/12.", "error");
                return;
              }
              actualizar((s) => ({ entregas: [...s.entregas, ...nuevas] }));
              aviso(`Agregué ${nuevas.length} ${nuevas.length === 1 ? "entrega" : "entregas"}.`, "exito");
              setTexto("");
              setSilabo(false);
            }}
          >
            Leer fechas
          </Boton>
        </div>
      </Ventana>

      <Ventana abierta={nueva} alCerrar={() => setNueva(false)} titulo="Nueva entrega">
        <label className="block font-bold">
          ¿Qué entregas?
          <input
            value={titulo}
            onChange={(ev) => setTitulo(ev.target.value)}
            placeholder="Informe, práctica, exposición…"
            className="mt-1 h-12 w-full rounded-boton border-2 border-surface bg-card px-3 font-semibold outline-none focus:border-brand"
          />
        </label>
        <label className="mt-3 block font-bold">
          ¿Para cuándo?
          <input
            type="date"
            value={fecha}
            min={hoy()}
            onChange={(ev) => setFecha(ev.target.value)}
            className="mt-1 h-12 w-full rounded-boton border-2 border-surface bg-card px-3 font-semibold outline-none focus:border-brand"
          />
        </label>
        <div className="mt-4">
          <Boton
            deshabilitado={!titulo.trim() || !fecha}
            onClick={() => {
              actualizar((s) => ({ entregas: [...s.entregas, { id: `n${Date.now()}`, titulo: titulo.trim(), curso: "Mis cursos", fecha }] }));
              setTitulo("");
              setNueva(false);
              aviso("Entrega guardada.", "exito");
            }}
          >
            Guardar
          </Boton>
        </div>
      </Ventana>
    </>
  );
}

/** "Tu semana en 5 minutos": marca tus huecos libres y León arma bloques de estudio. */
function Semana() {
  const e = useEstado();
  const huecos = new Set(e.huecos);
  const [plan, setPlan] = useState<string[] | null>(null);

  function alternar(id: string) {
    sonidos.toque();
    actualizar((s) => ({ huecos: s.huecos.includes(id) ? s.huecos.filter((h) => h !== id) : [...s.huecos, id] }));
    setPlan(null);
  }

  function armar() {
    const pendientes = [...e.entregas].sort((a, b) => a.fecha.localeCompare(b.fecha));
    const orden = DIAS.flatMap((_, d) => FRANJAS.map((_, f) => `${d}-${f}`)).filter((h) => huecos.has(h));
    const bloques = orden.map((h, i) => {
      const [d, f] = h.split("-").map(Number);
      const tema = pendientes.length ? pendientes[i % pendientes.length].titulo : "Repaso de tu tema";
      return `${DIAS[d]} ${FRANJAS[f].toLowerCase()}: ${tema} · 1 tomate`;
    });
    setPlan(bloques);
    sonidos.acierto();
  }

  return (
    <>
      <p className="text-text-soft">Toca los ratos libres que tienes entre el trabajo y las clases.</p>
      <div className="overflow-hidden rounded-tarjeta border-2 border-surface bg-card p-2">
        <div className="grid grid-cols-[48px_repeat(3,1fr)] gap-1.5">
          <span />
          {FRANJAS.map((f) => (
            <span key={f} className="py-1 text-center text-ayuda font-extrabold text-text-soft">
              {f}
            </span>
          ))}
          {DIAS.map((d, di) => (
            <div key={d} className="contents">
              <span className="flex items-center text-ayuda font-extrabold text-text-soft">{d}</span>
              {FRANJAS.map((f, fi) => {
                const id = `${di}-${fi}`;
                const activo = huecos.has(id);
                return (
                  <motion.button
                    key={id}
                    type="button"
                    aria-pressed={activo}
                    aria-label={`${d} ${f}`}
                    onClick={() => alternar(id)}
                    whileTap={{ scale: 0.85 }}
                    animate={{ backgroundColor: activo ? "var(--success)" : "var(--surface)" }}
                    className="h-11 cursor-pointer rounded-[10px]"
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <Boton deshabilitado={huecos.size === 0} onClick={armar}>
        {huecos.size === 0 ? "Marca al menos un rato libre" : `Armar mi semana (${huecos.size} bloques)`}
      </Boton>
      {plan && (
        <div className="flex flex-col gap-2">
          {plan.map((b, i) => (
            <motion.p
              key={b}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-boton bg-surface px-4 py-3 font-bold"
            >
              {b}
            </motion.p>
          ))}
        </div>
      )}
    </>
  );
}

export default function Entregas() {
  const [pestana, setPestana] = useState<"lista" | "semana">("lista");
  return (
    <Pantalla titulo="Entregas">
      <div className="grid grid-cols-2 gap-1 rounded-full bg-surface p-1" role="tablist">
        {(["lista", "semana"] as const).map((p) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={pestana === p}
            onClick={() => setPestana(p)}
            className={`relative h-11 cursor-pointer rounded-full font-extrabold ${pestana === p ? "text-brand" : "text-text-soft"}`}
          >
            {pestana === p && <motion.span layoutId="pestana-entregas" className="absolute inset-0 rounded-full bg-card" />}
            <span className="relative">{p === "lista" ? "Mis entregas" : "Tu semana"}</span>
          </button>
        ))}
      </div>
      {pestana === "lista" ? <ListaEntregas /> : <Semana />}
    </Pantalla>
  );
}
