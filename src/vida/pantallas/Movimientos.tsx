import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { Boton } from "../../components/Boton";
import { Ventana } from "../../components/Ventana";
import { bonita, diasEntre, hoy, sumarDias } from "../../lib/fechas";
import { navegar, parametro } from "../../lib/rutas";
import { sonidos } from "../../lib/sonidos";
import { CATEGORIAS_GASTO, CATEGORIAS_INGRESO } from "../entender";
import {
  actualizarVida,
  lunes,
  marcarPagado,
  nuevoId,
  proximaFecha,
  quitarMovimiento,
  resumenSemana,
  soles,
  useVida,
  type Movimiento,
  type Pago,
} from "../estado";
import { aNumero, avisoDeshacer, Cabecera, CampoSoles, Chip, campoTexto, GrupoUnico, LeonVida, Pagina } from "../ui";

export default function Movimientos() {
  const [vista, setVista] = useState<"lista" | "pagos">(parametro("ver") === "pagos" ? "pagos" : "lista");
  return (
    <Pagina conBarra>
      <Cabecera>
        <h1 className="text-titulo font-black">Movimientos</h1>
      </Cabecera>
      <div role="tablist" className="mx-5 mt-4 grid grid-cols-2 gap-1 rounded-[16px] bg-surface p-1">
        {(
          [
            ["lista", "Ingresos y gastos"],
            ["pagos", "Pagos y fechas"],
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
      {vista === "lista" ? <Lista /> : <Pagos />}
    </Pagina>
  );
}

/* ---------- Ingresos y gastos ---------- */

const ORIGEN: Partial<Record<Movimiento["origen"], string>> = { gmail: "de Gmail", reporte: "de un reporte", comprobante: "de un comprobante", texto: "de texto pegado", captura: "de una captura" };

function cambio(actual: number, antes: number) {
  if (!antes) return null;
  const dif = actual - antes;
  if (Math.abs(dif) < 1) return "Igual que la semana pasada.";
  return `${soles(Math.abs(dif))} ${dif > 0 ? "más" : "menos"} que la semana pasada.`;
}

function Lista() {
  const e = useVida();
  const h = hoy();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"todos" | "gasto" | "ingreso">("todos");
  const [editando, setEditando] = useState<Movimiento | null>(null);
  const esta = resumenSemana(e, lunes(h));
  const pasada = resumenSemana(e, sumarDias(lunes(h), -7));

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    const fechaQ = q === "hoy" ? h : q === "ayer" ? sumarDias(h, -1) : null;
    const num = Number(q.replace(",", "."));
    return [...e.movimientos]
      .filter((m) => filtro === "todos" || m.tipo === filtro)
      .filter((m) => {
        if (!q) return true;
        if (fechaQ) return m.fecha === fechaQ;
        if (q && Number.isFinite(num)) return String(m.monto).startsWith(String(num));
        return m.nota.toLowerCase().includes(q) || m.categoria.toLowerCase().includes(q);
      })
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [e.movimientos, busca, filtro, h]);

  const porDia = lista.reduce<Record<string, Movimiento[]>>((acc, m) => ((acc[m.fecha] ??= []).push(m), acc), {});

  return (
    <div className="flex flex-col gap-4 px-5 pt-4">
      <section className="rounded-[20px] bg-card p-4" aria-label="Resumen de la semana">
        <p className="text-ayuda font-extrabold text-text-soft">Esta semana</p>
        <div className="mt-1 grid grid-cols-2 gap-3">
          <div>
            <p className="text-ayuda text-text-soft">Entró</p>
            <p className="numeros text-tarjeta font-black text-brand">{soles(esta.entro)}</p>
          </div>
          <div>
            <p className="text-ayuda text-text-soft">Salió</p>
            <p className="numeros text-tarjeta font-black">{soles(esta.salio)}</p>
          </div>
        </div>
        <p className="mt-2 text-ayuda">
          {cambio(esta.salio, pasada.salio) ?? "La próxima semana te muestro cómo cambió."}
          {esta.top ? ` Lo que más se llevó: ${esta.top.categoria} (${soles(esta.top.monto)}).` : ""}
        </p>
      </section>

      <label className="block">
        <span className="sr-only">Buscar movimientos</span>
        <input value={busca} onChange={(ev) => setBusca(ev.target.value)} placeholder="Busca «comida», «ayer» o un monto" className={campoTexto} type="search" />
      </label>
      <GrupoUnico etiqueta="Filtrar">
        {(
          [
            ["todos", "Todos"],
            ["gasto", "Gastos"],
            ["ingreso", "Ingresos"],
          ] as const
        ).map(([id, n]) => (
          <Chip key={id} radio activo={filtro === id} onClick={() => setFiltro(id)}>
            {n}
          </Chip>
        ))}
      </GrupoUnico>

      {e.movimientos.length === 0 ? (
        <div className="flex flex-col items-center py-4 text-center">
          <LeonVida pose="anima" alto={130} />
          <p className="mt-2 font-extrabold">Aún no tienes movimientos.</p>
          <div className="mt-3 flex w-full flex-col gap-2">
            <Boton onClick={() => navegar("/vida/registrar")}>Registrar el primero</Boton>
            <Boton variante="secundario" onClick={() => navegar("/vida/importar")}>
              Importar movimientos
            </Boton>
          </div>
        </div>
      ) : lista.length === 0 ? (
        <p className="py-4 text-center text-text-soft">No encontré nada con «{busca}».</p>
      ) : (
        Object.entries(porDia).map(([fecha, ms]) => (
          <section key={fecha}>
            <h2 className="px-1 text-ayuda font-extrabold text-text-soft">{fecha === h ? "Hoy" : fecha === sumarDias(h, -1) ? "Ayer" : bonita(fecha)}</h2>
            <ul className="mt-1 flex flex-col gap-2">
              {ms.map((m) => (
                <li key={m.id}>
                  <button type="button" onClick={() => setEditando(m)} className="flex min-h-14 w-full cursor-pointer items-center justify-between gap-3 rounded-[16px] bg-card px-4 py-2 text-left">
                    <span>
                      <span className="block font-extrabold">{m.nota}</span>
                      <span className="text-ayuda text-text-soft">
                        {m.categoria}
                        {m.fijo ? " · pago fijo" : ""}
                        {m.clase === "propia" ? " · no cuenta" : ""}
                        {ORIGEN[m.origen] ? ` · ${ORIGEN[m.origen]}` : ""}
                      </span>
                    </span>
                    <span className={`numeros font-black ${m.tipo === "ingreso" ? "text-brand" : ""}`}>
                      {m.tipo === "ingreso" ? "+ " : "− "}
                      {m.moneda && m.moneda !== "PEN" ? `${m.moneda} ${m.monto}` : soles(m.monto)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      <Editar m={editando} alCerrar={() => setEditando(null)} />
    </div>
  );
}

function Editar({ m, alCerrar }: { m: Movimiento | null; alCerrar: () => void }) {
  const [monto, setMonto] = useState("");
  const [nota, setNota] = useState("");
  const [categoria, setCategoria] = useState("");
  const [fecha, setFecha] = useState("");
  const [abierto, setAbierto] = useState<string | null>(null);
  if (m && abierto !== m.id) {
    setAbierto(m.id);
    setMonto(String(m.monto));
    setNota(m.nota);
    setCategoria(m.categoria);
    setFecha(m.fecha);
  }
  const cerrar = () => {
    setAbierto(null);
    alCerrar();
  };
  return (
    <Ventana abierta={!!m} alCerrar={cerrar} titulo="Editar movimiento">
      {m && (
        <div className="flex max-h-[70dvh] flex-col gap-4 overflow-y-auto pb-1 [&>*]:shrink-0">
          <CampoSoles etiqueta="Monto" valor={monto} alCambiar={setMonto} error={aNumero(monto) ? null : "Escribe un monto mayor a 0."} />
          <label className="block">
            <span className="text-ayuda font-extrabold text-text-soft">Nota</span>
            <input value={nota} onChange={(ev) => setNota(ev.target.value)} className={campoTexto} maxLength={40} />
          </label>
          <GrupoUnico etiqueta="Categoría">
            {(m.tipo === "gasto" ? CATEGORIAS_GASTO : CATEGORIAS_INGRESO).map((c) => (
              <Chip key={c} radio activo={categoria === c} onClick={() => setCategoria(c)}>
                {c}
              </Chip>
            ))}
          </GrupoUnico>
          <label className="block">
            <span className="text-ayuda font-extrabold text-text-soft">Fecha</span>
            <input type="date" value={fecha} max={hoy()} onChange={(ev) => setFecha(ev.target.value)} className={campoTexto} />
          </label>
          <Boton
            deshabilitado={!aNumero(monto) || !fecha}
            onClick={() => {
              actualizarVida((s) => ({ movimientos: s.movimientos.map((x) => (x.id === m.id ? { ...x, monto: aNumero(monto), nota: nota.trim() || categoria, categoria, fecha } : x)) }));
              sonidos.acierto();
              avisoDeshacer("Cambios guardados.");
              cerrar();
            }}
          >
            Guardar cambios
          </Boton>
          <button
            type="button"
            onClick={() => {
              const recuperar = quitarMovimiento(m.id);
              avisoDeshacer("Movimiento borrado.", recuperar);
              cerrar();
            }}
            className="h-11 cursor-pointer font-extrabold text-error"
          >
            Borrar
          </button>
        </div>
      )}
    </Ventana>
  );
}

/* ---------- Pagos y fechas ---------- */

const NOMBRES_PAGO = ["Alquiler", "Luz", "Agua", "Internet", "Celular", "Suscripción", "Cuota"];
const TIPOS_FECHA = ["DNI", "SOAT", "Brevete", "Cumpleaños", "Otro"];

function Pagos() {
  const e = useVida();
  const h = hoy();
  const mes = h.slice(0, 7);
  const [nuevo, setNuevo] = useState<"pago" | "fecha" | null>(null);
  const [editando, setEditando] = useState<Pago | null>(null);
  const totalPagos = e.pagos.reduce((s, p) => s + p.monto, 0);
  const fechas = [...e.pendientes].sort((a, b) => Number(a.hecho) - Number(b.hecho) || a.fecha.localeCompare(b.fecha));

  return (
    <div className="flex flex-col gap-5 px-5 pt-4">
      <section>
        <h2 className="text-tarjeta font-extrabold">Pagos de cada mes</h2>
        <p className="text-ayuda text-text-soft">Alquiler, servicios y suscripciones. Te los recuerdo en Hoy antes de que venzan.</p>
        {e.pagos.length === 0 ? (
          <p className="mt-3 rounded-[20px] border-2 border-dashed border-surface p-4 text-text-soft">Aún no tienes pagos. Agrega el primero y no se te pasa ninguno.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {[...e.pagos]
              .sort((a, b) => proximaFecha(a).localeCompare(proximaFecha(b)))
              .map((p) => {
                const pagado = p.pagados.includes(mes);
                const dias = diasEntre(h, proximaFecha(p));
                return (
                  <li key={p.id} className="flex min-h-16 items-center gap-3 rounded-[16px] bg-card px-4 py-2">
                    <button type="button" onClick={() => setEditando(p)} className="flex-1 cursor-pointer text-left">
                      <span className="block font-extrabold">
                        {p.nombre} · {soles(p.monto)}
                      </span>
                      <span className="text-ayuda text-text-soft">{pagado ? `Pagado este mes ✓ · el próximo: ${bonita(proximaFecha(p))}` : dias < 0 ? "Ya venció" : dias === 0 ? "Vence hoy" : `Vence en ${dias} días · día ${p.dia}`}</span>
                    </button>
                    {!pagado && (
                      <button
                        type="button"
                        onClick={() => {
                          marcarPagado(p.id);
                          sonidos.acierto();
                          avisoDeshacer(`${p.nombre}: pagado este mes.`);
                        }}
                        className="h-11 shrink-0 cursor-pointer rounded-[12px] bg-surface px-3 font-extrabold text-brand"
                      >
                        Ya pagué
                      </button>
                    )}
                  </li>
                );
              })}
          </ul>
        )}
        {e.plan && e.pagos.length > 0 && Math.abs(totalPagos - e.plan.fijos) >= 1 && (
          <p className="mt-2 rounded-[16px] bg-surface p-3 text-ayuda">
            Tus pagos suman {soles(totalPagos)} y en tu plan pusiste {soles(e.plan.fijos)} de fijos.{" "}
            <button type="button" onClick={() => navegar("/vida/plan")} className="cursor-pointer font-extrabold text-brand underline">
              Corregir mi plan
            </button>
          </p>
        )}
        <div className="mt-3">
          <Boton variante="secundario" onClick={() => setNuevo("pago")}>
            Agregar pago
          </Boton>
        </div>
      </section>

      <section>
        <h2 className="text-tarjeta font-extrabold">Fechas importantes</h2>
        <p className="text-ayuda text-text-soft">DNI, SOAT, brevete o cumpleaños.</p>
        {fechas.length > 0 && (
          <ul className="mt-3 flex flex-col gap-2">
            {fechas.map((p) => {
              const dias = diasEntre(h, p.fecha);
              return (
                <li key={p.id} className={`flex min-h-16 items-center gap-3 rounded-[16px] bg-card px-3 py-2 ${p.hecho ? "opacity-60" : ""}`}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={p.hecho}
                    aria-label={`Marcar ${p.titulo} como hecho`}
                    onClick={() => actualizarVida((s) => ({ pendientes: s.pendientes.map((x) => (x.id === p.id ? { ...x, hecho: !x.hecho } : x)) }))}
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
                      {!p.hecho && ` · ${dias < 0 ? "ya pasó" : dias === 0 ? "hoy" : `en ${dias} días`}`}
                    </span>
                  </span>
                  <button
                    type="button"
                    aria-label={`Borrar ${p.titulo}`}
                    onClick={() => {
                      const antes = e.pendientes;
                      actualizarVida((s) => ({ pendientes: s.pendientes.filter((x) => x.id !== p.id) }));
                      avisoDeshacer("Fecha borrada.", () => actualizarVida(() => ({ pendientes: antes })));
                    }}
                    className="grid size-11 cursor-pointer place-items-center text-text-soft"
                  >
                    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
                      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <div className="mt-3">
          <Boton variante="secundario" onClick={() => setNuevo("fecha")}>
            Agregar fecha
          </Boton>
        </div>
      </section>

      <FormPago abierto={nuevo === "pago" || !!editando} pago={editando} alCerrar={() => (setNuevo(null), setEditando(null))} />
      <FormFecha abierto={nuevo === "fecha"} alCerrar={() => setNuevo(null)} />
    </div>
  );
}

function FormPago({ abierto, pago, alCerrar }: { abierto: boolean; pago: Pago | null; alCerrar: () => void }) {
  const [nombre, setNombre] = useState("");
  const [monto, setMonto] = useState("");
  const [dia, setDia] = useState("");
  const [avisar, setAvisar] = useState(3);
  const [cargado, setCargado] = useState<string | null>(null);
  const clave = pago?.id ?? (abierto ? "nuevo" : null);
  if (clave !== cargado) {
    setCargado(clave);
    setNombre(pago?.nombre ?? "");
    setMonto(pago ? String(pago.monto) : "");
    setDia(pago ? String(pago.dia) : "");
    setAvisar(pago?.avisarDias ?? 3);
  }
  const diaN = Math.round(Number(dia));
  const diaOk = diaN >= 1 && diaN <= 31;
  const listo = nombre.trim() && aNumero(monto) && diaOk;

  const guardar = () => {
    if (!listo) return;
    const datos = { nombre: nombre.trim(), monto: aNumero(monto), dia: diaN, avisarDias: avisar };
    if (pago) actualizarVida((s) => ({ pagos: s.pagos.map((x) => (x.id === pago.id ? { ...x, ...datos } : x)) }));
    else actualizarVida((s) => ({ pagos: [...s.pagos, { id: nuevoId("p"), pagados: [], ...datos }] }));
    sonidos.acierto();
    avisoDeshacer(`Listo. Te lo recuerdo en Hoy ${avisar} ${avisar === 1 ? "día" : "días"} antes.`);
    alCerrar();
  };

  return (
    <Ventana abierta={abierto} alCerrar={alCerrar} titulo={pago ? "Editar pago" : "Nuevo pago mensual"}>
      <div className="flex max-h-[72dvh] flex-col gap-4 overflow-y-auto pb-1 [&>*]:shrink-0">
        <div className="flex flex-wrap gap-2">
          {NOMBRES_PAGO.map((n) => (
            <Chip key={n} activo={nombre === n} onClick={() => setNombre(n)}>
              {n}
            </Chip>
          ))}
        </div>
        <label className="block">
          <span className="text-ayuda font-extrabold text-text-soft">Nombre</span>
          <input value={nombre} onChange={(ev) => setNombre(ev.target.value)} placeholder="Alquiler, Netflix…" className={campoTexto} maxLength={30} />
        </label>
        <CampoSoles etiqueta="Monto" valor={monto} alCambiar={setMonto} />
        <label className="block">
          <span className="text-ayuda font-extrabold text-text-soft">¿Qué día del mes vence?</span>
          <input inputMode="numeric" value={dia} onChange={(ev) => setDia(ev.target.value.replace(/\D/g, "").slice(0, 2))} placeholder="Ej.: 5" className={`${campoTexto} ${dia && !diaOk ? "border-error" : ""}`} aria-invalid={!!dia && !diaOk} />
          {dia && !diaOk && <span className="mt-1 block text-ayuda font-bold text-error">Pon un día entre 1 y 31.</span>}
        </label>
        <div>
          <p className="mb-2 text-ayuda font-extrabold text-text-soft">¿Te avisamos antes de que venza?</p>
          <GrupoUnico etiqueta="Cuántos días antes avisar">
            {[1, 3, 7].map((d) => (
              <Chip key={d} radio activo={avisar === d} onClick={() => setAvisar(d)}>
                {d} {d === 1 ? "día antes" : "días antes"}
              </Chip>
            ))}
          </GrupoUnico>
          <p className="mt-2 text-ayuda text-text-soft">Por ahora el aviso sale en tu pantalla Hoy. Los avisos al celular llegan pronto.</p>
        </div>
        <Boton deshabilitado={!listo} onClick={guardar}>
          Guardar pago
        </Boton>
        {pago && (
          <button
            type="button"
            onClick={() => {
              const antes = pago;
              actualizarVida((s) => ({ pagos: s.pagos.filter((x) => x.id !== pago.id) }));
              avisoDeshacer("Pago borrado.", () => actualizarVida((s) => ({ pagos: [...s.pagos, antes] })));
              alCerrar();
            }}
            className="h-11 cursor-pointer font-extrabold text-error"
          >
            Borrar pago
          </button>
        )}
      </div>
    </Ventana>
  );
}

function FormFecha({ abierto, alCerrar }: { abierto: boolean; alCerrar: () => void }) {
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState("DNI");
  const [fecha, setFecha] = useState("");
  return (
    <Ventana abierta={abierto} alCerrar={alCerrar} titulo="Nueva fecha">
      <motion.div className="flex flex-col gap-4">
        <GrupoUnico etiqueta="Tipo">
          {TIPOS_FECHA.map((t) => (
            <Chip key={t} radio activo={tipo === t} onClick={() => setTipo(t)}>
              {t}
            </Chip>
          ))}
        </GrupoUnico>
        <label className="block">
          <span className="text-ayuda font-extrabold text-text-soft">¿Qué es? (opcional)</span>
          <input value={titulo} onChange={(ev) => setTitulo(ev.target.value)} placeholder="Renovar DNI, cumple de mamá…" className={campoTexto} maxLength={40} />
        </label>
        <label className="block">
          <span className="text-ayuda font-extrabold text-text-soft">¿Para cuándo?</span>
          <input type="date" value={fecha} min={hoy()} onChange={(ev) => setFecha(ev.target.value)} className={campoTexto} />
        </label>
        <Boton
          deshabilitado={!fecha}
          onClick={() => {
            actualizarVida((s) => ({ pendientes: [...s.pendientes, { id: nuevoId("f"), titulo: titulo.trim() || tipo, tipo, fecha, hecho: false }] }));
            sonidos.acierto();
            avisoDeshacer("Fecha guardada. Te la muestro en Hoy una semana antes.");
            setTitulo("");
            setFecha("");
            alCerrar();
          }}
        >
          Guardar
        </Boton>
      </motion.div>
    </Ventana>
  );
}
