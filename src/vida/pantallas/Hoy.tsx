import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Boton } from "../../components/Boton";
import { Ventana } from "../../components/Ventana";
import { obtener as obtenerStudio } from "../../lib/estado";
import { hoy } from "../../lib/fechas";
import { entradaEnCascada } from "../../lib/movimiento";
import { navegar } from "../../lib/rutas";
import { sonidos } from "../../lib/sonidos";
import {
  compromisos,
  consejoDelDia,
  dejarDatosSinCuentaAparte,
  hayDatosSinCuenta,
  pasarDatosSinCuenta,
  desglose,
  enEjemplo,
  frascoActivo,
  ingresoMensual,
  marcarPagado,
  separadoDelMes,
  soles,
  totalFrasco,
  useVida,
} from "../estado";
import { descartarSugerencia, marcarVista, sugerenciaDeHoy } from "../sugerencias";
import { avisoDeshacer, Cabecera, CaraLeonVida, Frasco, ICONOS, Pagina, Soles, TarjetaAviso } from "../ui";

function cuando(dias: number) {
  if (dias < 0) return "ya venció";
  if (dias === 0) return "vence hoy";
  if (dias === 1) return "vence mañana";
  return `vence en ${dias} días`;
}

export default function Hoy() {
  const e = useVida();
  const h = hoy();
  const [verCuenta, setVerCuenta] = useState(false);
  const d = desglose(e, h);
  const sep = separadoDelMes(e, h);
  const pasado = d.quedan < 0;
  const avance = d.disponible > 0 ? Math.max(0, d.quedan) / d.disponible : 0;
  const nombre = enEjemplo() ? "" : (obtenerStudio().datos?.nombre?.split(" ")[0] ?? "");
  const proximo = compromisos(e, h).find((c) => c.dias <= 7);
  const meta = frascoActivo(e);
  const consejo = consejoDelDia(e);
  const deHoy = e.movimientos.filter((m) => m.fecha === h).reverse();
  const anotoHoy = e.racha.ultimoDia === h;
  const sugerencia = sugerenciaDeHoy(e);
  const sinCuenta = !enEjemplo() && hayDatosSinCuenta();
  useEffect(() => {
    if (sugerencia) marcarVista(sugerencia.id);
  }, [sugerencia]);

  return (
    <Pagina conBarra amplio>
      <Cabecera>
        <div className="flex items-center gap-2">
          <CaraLeonVida cara="feliz" tamano={40} />
          <h1 className="truncate text-tarjeta font-black">{nombre ? `Hola, ${nombre}` : "Hola"}</h1>
        </div>
      </Cabecera>

      <div className="mt-4 grid gap-4 px-4 md:grid-cols-2 md:gap-6 md:px-8">
        <div className="flex flex-col gap-4">
          {!e.plan ? (
            <motion.section {...entradaEnCascada(0)} className="rounded-[28px] bg-[var(--vida-hondo)] p-5 text-white">
              <p className="font-extrabold text-white/85">Disponible estimado para hoy</p>
              <p className="mt-1 text-tarjeta font-black">Aún no tengo tus números</p>
              <p className="mt-1 text-ayuda text-white/85">Con 3 preguntas te digo cuánto puedes gastar cada día.</p>
              <button type="button" onClick={() => navegar("/vida/plan")} className="mt-4 h-12 w-full cursor-pointer rounded-[14px] bg-card font-extrabold text-brand">
                Armar mi número
              </button>
            </motion.section>
          ) : (
            <motion.section {...entradaEnCascada(0)} className="rounded-[28px] bg-[var(--vida-hondo)] p-5 text-white" aria-label="Tu plata de hoy">
              <div className="flex items-start justify-between gap-2">
                <p className="font-extrabold text-white/85">{pasado ? "Hoy te pasaste" : "Disponible estimado para hoy"}</p>
                <button
                  type="button"
                  onClick={() => {
                    sonidos.toque();
                    setVerCuenta(true);
                  }}
                  className="-m-2 min-h-11 shrink-0 cursor-pointer rounded-full p-2 text-ayuda font-extrabold text-success underline-offset-4 hover:underline"
                >
                  ¿Cómo se calcula?
                </button>
              </div>
              <Soles valor={Math.abs(d.quedan)} className="block text-[52px] leading-[58px] font-black" />
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-label="Lo que te queda de hoy" aria-valuenow={Math.round(avance * 100)} aria-valuemin={0} aria-valuemax={100}>
                <motion.div className="h-full rounded-full bg-success" initial={false} animate={{ width: `${avance * 100}%` }} transition={{ type: "spring", stiffness: 200, damping: 24 }} />
              </div>
              <p className="mt-2 text-ayuda text-white/85">
                {pasado ? "Mañana ajustamos juntos. No pasa nada." : deHoy.length ? `Gastaste ${soles(d.gastado)} de ${soles(d.disponible)}.` : "Aún no registras nada hoy."}
              </p>
              <p className="mt-2 border-t border-white/15 pt-2 text-[13px] leading-[18px] text-white/75">
                Ya separé {soles(sep.fijos)} de pagos fijos{sep.pagosPendientes > 0 ? ` (${soles(sep.pagosPendientes)} por pagar)` : ""} y {soles(sep.ahorro)} de ahorro este mes. Es un estimado, no el saldo de tu banco.
              </p>
            </motion.section>
          )}

          <div className="grid grid-cols-3 gap-2">
            {[
              { texto: "Registrar gasto", ruta: "/vida/registrar", icono: "M5 12h14" },
              { texto: "Añadir ingreso", ruta: "/vida/registrar?tipo=ingreso", icono: "M12 5v14M5 12h14" },
              { texto: "Revisar mensaje", ruta: "/vida/protegete?tipo=mensaje", icono: "M4 5.5h16v10H9l-5 4z" },
            ].map((a, i) => (
              <motion.button
                key={a.texto}
                {...entradaEnCascada(i + 1)}
                type="button"
                whileTap={{ y: 3, boxShadow: "0 1px 0 var(--surface)" }}
                style={{ boxShadow: "0 4px 0 var(--surface)" }}
                onPointerDown={() => sonidos.toque()}
                onClick={() => navegar(a.ruta)}
                className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-[20px] border-2 border-surface bg-card px-1 text-[14px] leading-[18px] font-extrabold"
              >
                <span className="grid size-10 place-items-center rounded-full bg-surface text-brand">
                  <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
                    <path d={a.icono} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {a.texto}
              </motion.button>
            ))}
          </div>

          {sinCuenta && (
            <section className="rounded-[20px] border-2 border-brand bg-card p-4" aria-label="Datos sin cuenta">
              <p className="font-extrabold">Hay datos de Vida guardados en este navegador sin cuenta</p>
              <p className="mt-1 text-ayuda text-text-soft">¿Quieres pasarlos a tu cuenta? Así los verás también en tus otros equipos. Si no son tuyos, déjalos aparte.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={pasarDatosSinCuenta} className="min-h-11 cursor-pointer rounded-[12px] bg-brand px-4 font-extrabold text-white">
                  Pasarlos a mi cuenta
                </button>
                <button type="button" onClick={dejarDatosSinCuentaAparte} className="min-h-11 cursor-pointer rounded-[12px] bg-surface px-4 font-extrabold text-brand">
                  Dejarlos aparte
                </button>
              </div>
            </section>
          )}

          {anotoHoy && e.cofreDia !== h && (
            <button type="button" onClick={() => navegar("/vida/cofre")} className="flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-[20px] bg-reward/30 px-4 py-3 text-left">
              <span className="font-extrabold">Registraste hoy: tu cofre del día está listo</span>
              <span className="shrink-0 font-extrabold text-brand">Abrir</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => navegar("/vida/importar")}
            className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[16px] border-2 border-dashed border-surface font-extrabold text-brand"
          >
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
              <path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Importar movimientos
          </button>

          <AnimatePresence>
            {sugerencia && (
              <TarjetaAviso key={sugerencia.id} tono={sugerencia.tono} alCerrar={() => descartarSugerencia(sugerencia.id)}>
                <p className="font-extrabold">{sugerencia.titulo}</p>
                <p className="text-ayuda">{sugerencia.texto}</p>
                <button type="button" onClick={() => navegar(sugerencia.ruta)} className="mt-2 min-h-11 cursor-pointer font-extrabold text-brand">
                  {sugerencia.boton}
                </button>
              </TarjetaAviso>
            )}
          </AnimatePresence>

          <section className="flex items-start gap-3 rounded-[20px] bg-surface p-4" aria-label="Consejo de León">
            <CaraLeonVida cara="tierno" />
            <div className="flex-1">
              <p className="text-ayuda font-extrabold text-brand">León te sugiere</p>
              <p className="text-[15px] leading-[21px]">{consejo.texto}</p>
              {consejo.accion && (
                <button type="button" onClick={() => navegar(consejo.accion!.ruta)} className="mt-1 min-h-11 cursor-pointer font-extrabold text-brand">
                  {consejo.accion.texto}
                </button>
              )}
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-4">
          {proximo && (
            <section className="rounded-[20px] border-2 border-surface bg-card p-4" aria-label="Próximo compromiso">
              <p className="text-ayuda font-extrabold text-text-soft">Próximo compromiso</p>
              <p className="mt-1 text-[18px] font-extrabold">
                {proximo.tipo === "pago" ? `Tu pago de ${proximo.titulo.toLowerCase()} ${cuando(proximo.dias)}` : `${proximo.titulo}: ${cuando(proximo.dias)}`}
              </p>
              {proximo.monto ? <p className="text-ayuda text-text-soft">{soles(proximo.monto)}</p> : null}
              <div className="mt-2 flex gap-4">
                {proximo.tipo === "pago" && (
                  <button
                    type="button"
                    onClick={() => {
                      marcarPagado(proximo.id);
                      sonidos.acierto();
                      avisoDeshacer(`Listo, ${proximo.titulo} pagado este mes.`);
                    }}
                    className="min-h-11 cursor-pointer font-extrabold text-brand"
                  >
                    Ya lo pagué
                  </button>
                )}
                <button type="button" onClick={() => navegar("/vida/movimientos?ver=pagos")} className="min-h-11 cursor-pointer font-extrabold text-text-soft">
                  Ver todos
                </button>
              </div>
            </section>
          )}

          <motion.button
            {...entradaEnCascada(3)}
            type="button"
            onClick={() => navegar("/vida/protegete?tipo=compra")}
            className="flex min-h-16 cursor-pointer items-center gap-3 rounded-[20px] border-2 border-brand bg-card px-4 py-3 text-left"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface text-brand">
              <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
                {ICONOS.protegete}
              </svg>
            </span>
            <span className="flex-1">
              <span className="block font-extrabold">¿Vas a pagar? Revísalo con León</span>
              <span className="text-ayuda text-text-soft">Un vendedor, un enlace o un mensaje, antes de actuar.</span>
            </span>
          </motion.button>

          {meta && (
            <motion.button
              {...entradaEnCascada(4)}
              type="button"
              onPointerDown={() => sonidos.toque()}
              onClick={() => navegar(`/vida/metas?id=${meta.id}`)}
              className="flex cursor-pointer items-center gap-4 rounded-[20px] border-2 border-surface bg-card p-4 text-left"
            >
              <Frasco avance={meta.meta ? totalFrasco(meta) / meta.meta : 0} tamano={56} />
              <span className="flex-1">
                <span className="block text-ayuda font-extrabold text-text-soft">Meta: {meta.nombre}</span>
                <span className="block text-tarjeta font-black">
                  <Soles valor={totalFrasco(meta)} /> <span className="text-ayuda font-bold text-text-soft">de {soles(meta.meta)}</span>
                </span>
                <span className="mt-1 block h-2 overflow-hidden rounded-full bg-surface">
                  <motion.span className="block h-full rounded-full bg-reward" initial={false} animate={{ width: `${meta.meta ? Math.min(100, (100 * totalFrasco(meta)) / meta.meta) : 0}%` }} />
                </span>
              </span>
            </motion.button>
          )}

          <section aria-label="Lo de hoy">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-tarjeta font-extrabold">Lo de hoy</h2>
              {deHoy.length > 0 && (
                <button type="button" onClick={() => navegar("/vida/movimientos")} className="min-h-11 cursor-pointer font-extrabold text-brand">
                  Ver todos
                </button>
              )}
            </div>
            {deHoy.length === 0 ? (
              <div className="mt-1 rounded-[20px] border-2 border-dashed border-surface p-4">
                <p className="text-text-soft">Aún no tienes movimientos hoy.</p>
                <button type="button" onClick={() => navegar("/vida/registrar")} className="mt-1 min-h-11 cursor-pointer font-extrabold text-brand">
                  Registrar el primero
                </button>
              </div>
            ) : (
              <ul className="mt-1 flex flex-col gap-2">
                {deHoy.slice(0, 4).map((m) => (
                  <li key={m.id} className="flex min-h-14 items-center justify-between gap-3 rounded-[16px] bg-card px-4 py-2">
                    <span>
                      <span className="block font-extrabold">{m.nota}</span>
                      <span className="text-ayuda text-text-soft">
                        {m.categoria}
                        {m.fijo ? " · pago fijo" : ""}
                      </span>
                    </span>
                    <span className={`numeros font-black ${m.tipo === "ingreso" ? "text-brand" : ""}`}>
                      {m.tipo === "ingreso" ? "+ " : "− "}
                      {soles(m.monto)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <Ventana abierta={verCuenta} alCerrar={() => setVerCuenta(false)} titulo="Así sale tu número">
        {e.plan && (
          <>
            <dl className="flex flex-col gap-2">
              <Fila etiqueta="Entra al mes (estimado)" valor={soles(Math.round(ingresoMensual(e.plan)))} />
              <Fila etiqueta="Pagos fijos separados" valor={`− ${soles(sep.fijos)}`} />
              {sep.pagosPendientes > 0 && <Fila etiqueta="  · de eso, aún por pagar" valor={soles(sep.pagosPendientes)} suave />}
              <Fila etiqueta="Ahorro reservado" valor={`− ${soles(sep.ahorro)}`} />
              <Fila etiqueta="Para un día normal" valor={soles(d.base)} fuerte />
              {d.arrastre !== 0 && <Fila etiqueta={d.arrastre > 0 ? "Lo que sobró ayer" : "Lo que faltó ayer"} valor={`${d.arrastre > 0 ? "+" : "−"} ${soles(d.arrastre)}`} />}
              {d.ajusteIngresos !== 0 && <Fila etiqueta="Por tus ingresos de hoy" valor={`${d.ajusteIngresos > 0 ? "+" : "−"} ${soles(d.ajusteIngresos)}`} />}
              <Fila etiqueta="Gastaste hoy" valor={`− ${soles(d.gastado)}`} />
              <div className="mt-1 border-t-2 border-surface pt-2">
                <Fila etiqueta={pasado ? "Te pasaste" : "Disponible estimado"} valor={soles(d.quedan)} fuerte />
              </div>
            </dl>
            <p className="mt-4 text-ayuda text-text-soft">
              Un día normal = (lo que entra al mes − fijos − ahorro) ÷ días del mes. Es un estimado con lo que registras: no es el saldo de tu banco. Si faltan gastos por registrar, el número sale más alto de lo real.
            </p>
            <div className="mt-4">
              <Boton
                variante="secundario"
                onClick={() => {
                  setVerCuenta(false);
                  navegar("/vida/plan");
                }}
              >
                Corregir mis números
              </Boton>
            </div>
          </>
        )}
      </Ventana>
    </Pagina>
  );
}

function Fila({ etiqueta, valor, fuerte = false, suave = false }: { etiqueta: string; valor: string; fuerte?: boolean; suave?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className={fuerte ? "font-extrabold" : suave ? "pl-3 text-ayuda text-text-soft" : "text-text-soft"}>{etiqueta}</dt>
      <dd className={`numeros ${fuerte ? "text-tarjeta font-black" : suave ? "text-ayuda" : "font-extrabold"}`}>{valor}</dd>
    </div>
  );
}
