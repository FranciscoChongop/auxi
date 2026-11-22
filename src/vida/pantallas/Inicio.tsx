import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Boton } from "../../components/Boton";
import { useAviso } from "../../components/Aviso";
import { Ventana } from "../../components/Ventana";
import { bonita, diasEntre, hoy } from "../../lib/fechas";
import { entradaEnCascada } from "../../lib/movimiento";
import { navegar } from "../../lib/rutas";
import { sonidos } from "../../lib/sonidos";
import { actualizarVida, desglose, soles, totalColchon, useVida, type Movimiento } from "../estado";
import { CaraLeonVida, Frasco, MarcadoresVida, MarcaVida, Pagina, Soles } from "../ui";

const CONSEJOS = [
  "Antes de comprar algo que no planeaste, espera un día. Si mañana lo sigues queriendo, ahí ves.",
  "Anotar el gasto chiquito también cuenta: los S/ 2 de todos los días hacen S/ 60 al mes.",
  "Nadie de verdad te pedirá tu clave ni tu código por mensaje.",
  "Un colchón no se arma de golpe. Lo que importa es que crezca.",
  "Si te pasaste hoy, no pasa nada: mañana ajustamos juntos.",
  "Pagar a tiempo evita intereses y moras. Anota tus vencimientos en Alertas.",
  "Compara el precio total, no solo la cuota mensual.",
];

export default function Inicio() {
  const e = useVida();
  const aviso = useAviso();
  const h = hoy();
  const d = desglose(e, h);
  const [verCuenta, setVerCuenta] = useState(false);
  const [elegido, setElegido] = useState<Movimiento | null>(null);
  const deHoy = e.movimientos.filter((m) => m.fecha === h).reverse();
  const pasado = d.quedan < 0;
  const avance = d.disponible > 0 ? Math.max(0, d.quedan) / d.disponible : 0;
  const colchon = totalColchon(e);
  const consejo = CONSEJOS[Math.floor(Date.now() / 86_400_000) % CONSEJOS.length];
  const proximo = e.pendientes
    .filter((p) => !p.hecho && p.fecha >= h && diasEntre(h, p.fecha) <= 7)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))[0];

  const borrar = (m: Movimiento) => {
    actualizarVida((s) => ({ movimientos: s.movimientos.filter((x) => x.id !== m.id) }));
    setElegido(null);
    aviso("Listo, lo borré y rehíce la cuenta.", "info");
  };

  return (
    <Pagina conBarra>
      <div className="flex items-center justify-between px-5" style={{ paddingTop: "calc(env(safe-area-inset-top) + 14px)" }}>
        <MarcaVida />
        <MarcadoresVida />
      </div>

      {/* Saldo del día: la tarjeta principal de Vida. */}
      <motion.section {...entradaEnCascada(0)} className="mx-4 mt-4 rounded-[28px] bg-[var(--vida-hondo)] p-5 text-white" aria-label="Tu plata de hoy">
        <div className="flex items-start justify-between gap-2">
          <p className="font-extrabold text-white/85">{pasado ? "Hoy te pasaste" : "Hoy te quedan"}</p>
          <button
            type="button"
            onClick={() => {
              sonidos.toque();
              setVerCuenta(true);
            }}
            className="-m-2 min-h-11 cursor-pointer rounded-full p-2 text-ayuda font-extrabold text-success underline-offset-4 hover:underline"
          >
            ¿Cómo se calcula?
          </button>
        </div>
        <Soles valor={Math.abs(d.quedan)} className="block text-[52px] leading-[58px] font-black" />
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-label="Lo que te queda de hoy" aria-valuenow={Math.round(avance * 100)} aria-valuemin={0} aria-valuemax={100}>
          <motion.div className="h-full rounded-full bg-success" initial={false} animate={{ width: `${avance * 100}%` }} transition={{ type: "spring", stiffness: 200, damping: 24 }} />
        </div>
        <p className="mt-2 text-ayuda text-white/85">
          {pasado ? "Mañana ajustamos juntos. No pasa nada." : `De ${soles(d.disponible)} para hoy · gastaste ${soles(d.gastado)}`}
        </p>
      </motion.section>

      {/* Acciones rápidas */}
      <div className="mx-4 mt-4 grid grid-cols-3 gap-2">
        {[
          { texto: "Anotar gasto", ruta: "/vida/anotar", icono: "M5 12h14" },
          { texto: "Anotar ingreso", ruta: "/vida/anotar?tipo=ingreso", icono: "M12 5v14M5 12h14" },
          { texto: "Subir captura", ruta: "/vida/captura", icono: "M4 8h3l2-2.5h6L17 8h3v11H4zM12 16.5a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z" },
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

      {/* Tarjeta del día (se cierra con X) */}
      <AnimatePresence>
        {e.tarjetaCerrada !== h && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="mx-4 mt-4 flex items-start gap-3 overflow-hidden rounded-[20px] bg-surface p-4"
          >
            <CaraLeonVida cara="tierno" />
            <div className="flex-1">
              <p className="text-ayuda font-extrabold text-brand">Dato del día</p>
              <p className="text-[15px] leading-[21px]">{consejo}</p>
            </div>
            <button
              type="button"
              onClick={() => actualizarVida(() => ({ tarjetaCerrada: h }))}
              aria-label="Cerrar dato del día"
              className="-m-2 grid size-11 shrink-0 cursor-pointer place-items-center rounded-full text-text-soft"
            >
              <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Colchón */}
      <motion.button
        {...entradaEnCascada(4)}
        type="button"
        onPointerDown={() => sonidos.toque()}
        onClick={() => navegar("/vida/colchon")}
        className="mx-4 mt-4 flex w-[calc(100%-2rem)] cursor-pointer items-center gap-4 rounded-[20px] border-2 border-surface bg-card p-4 text-left"
      >
        <Frasco avance={e.colchon.meta ? colchon / e.colchon.meta : 0} tamano={64} />
        <span className="flex-1">
          <span className="block text-ayuda font-extrabold text-text-soft">Tu colchón</span>
          <span className="block text-tarjeta font-black">
            <Soles valor={colchon} /> <span className="text-ayuda font-bold text-text-soft">de {soles(e.colchon.meta)}</span>
          </span>
          <span className="text-ayuda font-extrabold text-brand">¿Te aguantaste un antojo? Súmalo</span>
        </span>
      </motion.button>

      {proximo && (
        <button
          type="button"
          onClick={() => navegar("/vida/alertas?ver=pendientes")}
          className="mx-4 mt-3 flex min-h-14 w-[calc(100%-2rem)] cursor-pointer items-center justify-between rounded-[20px] bg-reward/25 px-4 text-left"
        >
          <span className="font-extrabold">{proximo.titulo}</span>
          <span className="text-ayuda font-extrabold">{proximo.fecha === h ? "Hoy" : `En ${diasEntre(h, proximo.fecha)} días`}</span>
        </button>
      )}

      {/* Movimientos de hoy */}
      <section className="mx-4 mt-6">
        <h2 className="px-1 text-tarjeta font-extrabold">Hoy, {bonita(h).split(" ").slice(1).join(" ")}</h2>
        {deHoy.length === 0 ? (
          <p className="mt-2 rounded-[20px] border-2 border-dashed border-surface p-4 text-text-soft">Aún no anotas nada hoy. Toca el + de abajo y escribe, por ejemplo, «almuerzo 12».</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {deHoy.map((m, i) => (
              <motion.li key={m.id} {...entradaEnCascada(i)}>
                <button
                  type="button"
                  onClick={() => setElegido(m)}
                  className="flex min-h-14 w-full cursor-pointer items-center justify-between gap-3 rounded-[16px] bg-card px-4 py-2 text-left"
                >
                  <span>
                    <span className="block font-extrabold">{m.nota}</span>
                    <span className="text-ayuda text-text-soft">{m.categoria}</span>
                  </span>
                  <span className={`numeros font-black ${m.tipo === "ingreso" ? "text-brand" : ""}`}>
                    {m.tipo === "ingreso" ? "+ " : "− "}
                    {soles(m.monto)}
                  </span>
                </button>
              </motion.li>
            ))}
          </ul>
        )}
      </section>

      <Ventana abierta={verCuenta} alCerrar={() => setVerCuenta(false)} titulo="Así sale tu número">
        <dl className="flex flex-col gap-2">
          <Fila etiqueta="Para un día normal" valor={soles(d.base)} />
          {d.arrastre !== 0 && <Fila etiqueta={d.arrastre > 0 ? "Lo que sobró ayer" : "Lo que faltó ayer"} valor={`${d.arrastre > 0 ? "+" : "−"} ${soles(d.arrastre)}`} />}
          {d.ajusteIngresos !== 0 && <Fila etiqueta="Por tus ingresos de hoy" valor={`${d.ajusteIngresos > 0 ? "+" : "−"} ${soles(d.ajusteIngresos)}`} />}
          <Fila etiqueta="Gastaste hoy" valor={`− ${soles(d.gastado)}`} />
          <div className="mt-1 border-t-2 border-surface pt-2">
            <Fila etiqueta={pasado ? "Te pasaste" : "Te queda"} valor={soles(d.quedan)} fuerte />
          </div>
        </dl>
        <p className="mt-4 text-ayuda text-text-soft">
          Un día normal = (lo que ganas al mes − tus fijos − lo que guardas) ÷ días del mes. Al día siguiente, lo que sobra pasa a mañana o a tu colchón; lo eliges en Perfil.
        </p>
        <div className="mt-4">
          <Boton
            variante="secundario"
            onClick={() => {
              setVerCuenta(false);
              navegar("/vida/plan");
            }}
          >
            Cambiar mis números
          </Boton>
        </div>
      </Ventana>

      <Ventana abierta={!!elegido} alCerrar={() => setElegido(null)} titulo={elegido?.nota ?? ""}>
        {elegido && (
          <>
            <p className="text-text-soft">
              {elegido.tipo === "ingreso" ? "Ingreso" : "Gasto"} · {elegido.categoria} · {soles(elegido.monto)}
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <Boton variante="secundario" onClick={() => borrar(elegido)}>
                Borrar
              </Boton>
              <Boton onClick={() => setElegido(null)}>Dejarlo así</Boton>
            </div>
          </>
        )}
      </Ventana>
    </Pagina>
  );
}

function Fila({ etiqueta, valor, fuerte = false }: { etiqueta: string; valor: string; fuerte?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className={fuerte ? "font-extrabold" : "text-text-soft"}>{etiqueta}</dt>
      <dd className={`numeros ${fuerte ? "text-tarjeta font-black" : "font-extrabold"}`}>{valor}</dd>
    </div>
  );
}
