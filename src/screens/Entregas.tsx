import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useAviso } from "../components/Aviso";
import { Boton } from "../components/Boton";
import { COLORES_CURSO } from "../components/Formulario";
import { Pantalla } from "../components/Navegacion";
import { Ventana } from "../components/Ventana";
import { actualizar, useEstado } from "../lib/estado";
import { bonita, clave, diasEntre, hoy, sumarDias } from "../lib/fechas";
import { navegar, parametro } from "../lib/rutas";
import { sonidos } from "../lib/sonidos";

const AVISOS = [7, 3, 1];
const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const FRANJAS = ["Mañana", "Tarde", "Noche"];

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
  const [nueva, setNueva] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [fecha, setFecha] = useState(sumarDias(hoy(), 7));
  const lista = [...e.entregas].filter((x) => x.tipo !== "feriado").sort((a, b) => a.fecha.localeCompare(b.fecha));

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
                    {x.tipo ? ` · ${x.tipo}` : ""}
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
      {lista.length === 0 && <p className="py-6 text-center text-text-soft">No tienes entregas. Importa tu sílabo para empezar.</p>}

      <div className="grid grid-cols-2 gap-3">
        <Boton onClick={() => navegar("/teach/silabo")}>Importar sílabo</Boton>
        <Boton variante="secundario" onClick={() => setNueva(true)}>
          Agregar una
        </Boton>
      </div>
      <p className="text-center text-ayuda text-text-soft">Los avisos en tu celular se activan en la próxima versión.</p>

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


const MESES_LARGOS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre", "Diciembre"];

/** Calendario del mes con un punto de color (por curso) en cada día con entregas. */
function Calendario() {
  const e = useEstado();
  const [ahora] = useState(() => new Date());
  const [mes, setMes] = useState(() => {
    const prox = [...e.entregas].filter((x) => diasEntre(hoy(), x.fecha) >= 0).sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
    const [a, m] = (prox?.fecha ?? hoy()).split("-").map(Number);
    return { a, m: m - 1 };
  });
  const [dia, setDia] = useState<string | null>(null);

  const primero = new Date(mes.a, mes.m, 1);
  const huecos = (primero.getDay() + 6) % 7; // lunes = 0
  const diasMes = new Date(mes.a, mes.m + 1, 0).getDate();
  const celdas = [...Array(huecos).fill(null), ...Array.from({ length: diasMes }, (_, i) => i + 1)];
  const clavesDia = (d: number) => clave(new Date(mes.a, mes.m, d));
  const colorDe = (x: { curso: string; tipo?: string }) =>
    x.tipo === "feriado" ? "var(--reward-dark)" : COLORES_CURSO[e.misCursos.find((c) => c.nombre.toLowerCase() === x.curso.toLowerCase())?.color ?? 0];
  const cae = (x: { fecha: string; hasta?: string }, k: string) => x.fecha <= k && k <= (x.hasta ?? x.fecha);
  const mesTxt = `${mes.a}-${String(mes.m + 1).padStart(2, "0")}`;
  const delMes = e.entregas.filter((x) => x.fecha.startsWith(mesTxt) || (x.hasta && x.hasta.startsWith(mesTxt))).sort((a, b) => a.fecha.localeCompare(b.fecha));
  const mostradas = dia ? e.entregas.filter((x) => cae(x, dia)) : delMes;
  const cambiar = (n: number) => {
    const f = new Date(mes.a, mes.m + n, 1);
    setMes({ a: f.getFullYear(), m: f.getMonth() });
    setDia(null);
    sonidos.toque();
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => cambiar(-1)} aria-label="Mes anterior" className="grid size-11 cursor-pointer place-items-center rounded-full bg-surface">
          <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h2 className="text-tarjeta font-extrabold" aria-live="polite">
          {MESES_LARGOS[mes.m]} {mes.a}
        </h2>
        <button type="button" onClick={() => cambiar(1)} aria-label="Mes siguiente" className="grid size-11 cursor-pointer place-items-center rounded-full bg-surface">
          <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
            <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="rounded-tarjeta border-2 border-surface bg-card p-2">
        <div className="grid grid-cols-7 text-center">
          {DIAS.map((d) => (
            <span key={d} className="py-1 text-[12px] font-extrabold text-text-soft">
              {d}
            </span>
          ))}
          {celdas.map((d, i) => {
            if (d === null) return <span key={`v${i}`} />;
            const k = clavesDia(d);
            const entregas = e.entregas.filter((x) => cae(x, k));
            const esHoy = k === clave(ahora);
            const activo = dia === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => {
                  sonidos.toque();
                  setDia(activo ? null : k);
                }}
                aria-label={`${d} de ${MESES_LARGOS[mes.m]}${entregas.length ? `, ${entregas.length} ${entregas.length === 1 ? "entrega" : "entregas"}` : ""}`}
                aria-pressed={activo}
                className={`flex h-12 cursor-pointer flex-col items-center justify-center rounded-[12px] text-[15px] font-bold ${activo ? "bg-brand text-white" : esHoy ? "bg-surface text-brand ring-2 ring-brand" : "text-text"}`}
              >
                <span className="numeros">{d}</span>
                <span className="flex h-2 items-center gap-0.5">
                  {entregas.slice(0, 3).map((x) => (
                    <span key={x.id} className="size-1.5 rounded-full" style={{ background: activo ? "#fff" : colorDe(x) }} />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <h3 className="font-extrabold">{dia ? bonita(dia) : `Entregas de ${MESES_LARGOS[mes.m].toLowerCase()}`}</h3>
      {mostradas.length === 0 && <p className="rounded-tarjeta bg-surface p-4 text-center text-text-soft">{dia ? "Nada para este día." : "No hay entregas este mes."}</p>}
      {mostradas.map((x) => (
        <div key={x.id} className="flex items-center gap-3 overflow-hidden rounded-tarjeta border-2 border-surface bg-card py-3 pr-3">
          <span className="w-1.5 self-stretch rounded-r-full" style={{ background: colorDe(x) }} />
          <span className="flex-1">
            <span className="block font-extrabold">{x.titulo}</span>
            <span className="block text-ayuda text-text-soft">
              {x.curso}
              {x.tipo ? ` · ${x.tipo}` : ""}
              {!dia ? ` · ${bonita(x.fecha)}${x.hasta ? ` al ${bonita(x.hasta)}` : ""}` : ""}
            </span>
          </span>
          {x.tipo !== "feriado" && <Faltan fecha={x.fecha} />}
        </div>
      ))}
      <Boton variante="secundario" onClick={() => navegar("/teach/silabo")}>
        Importar sílabo
      </Boton>
    </>
  );
}

export default function Entregas() {
  const [pestana, setPestana] = useState<"lista" | "calendario" | "semana">(() => (parametro("ver") === "calendario" ? "calendario" : "lista"));
  return (
    <Pantalla titulo="Entregas">
      <div className="grid grid-cols-3 gap-1 rounded-full bg-surface p-1" role="tablist">
        {(["lista", "calendario", "semana"] as const).map((p) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={pestana === p}
            onClick={() => setPestana(p)}
            className={`relative h-11 cursor-pointer rounded-full font-extrabold ${pestana === p ? "text-brand" : "text-text-soft"}`}
          >
            {pestana === p && <motion.span layoutId="pestana-entregas" className="absolute inset-0 rounded-full bg-card" />}
            <span className="relative text-[15px]">{p === "lista" ? "Entregas" : p === "calendario" ? "Calendario" : "Tu semana"}</span>
          </button>
        ))}
      </div>
      {pestana === "lista" ? <ListaEntregas /> : pestana === "calendario" ? <Calendario /> : <Semana />}
    </Pantalla>
  );
}
