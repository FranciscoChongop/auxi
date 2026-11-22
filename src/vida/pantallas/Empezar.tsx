import { motion } from "motion/react";
import { entradaEnCascada } from "../../lib/movimiento";
import { navegar } from "../../lib/rutas";
import { sonidos } from "../../lib/sonidos";
import { actualizarVida, type Objetivo } from "../estado";
import { ICONOS, CaraLeonVida, Encabezado, Pagina } from "../ui";

const OPCIONES: { id: Objetivo; titulo: string; detalle: string; ruta: string; icono: keyof typeof ICONOS }[] = [
  { id: "gastar", titulo: "Saber cuánto puedo gastar", detalle: "3 preguntas y te doy tu número del día.", ruta: "/vida/plan", icono: "hoy" },
  { id: "ahorrar", titulo: "Ahorrar para algo", detalle: "Arma un frasco y míralo crecer.", ruta: "/vida/metas?nuevo=1", icono: "metas" },
  { id: "pagos", titulo: "Ordenar mis pagos", detalle: "Alquiler, luz, internet y fechas importantes.", ruta: "/vida/movimientos?ver=pagos", icono: "movimientos" },
  { id: "estafa", titulo: "Revisar algo sospechoso", detalle: "Un mensaje, un enlace o un vendedor. Sin registrarte.", ruta: "/vida/protegete", icono: "protegete" },
];

/** "¿Qué quieres resolver primero?": nadie tiene que armar un presupuesto para revisar una estafa. */
export default function Empezar() {
  return (
    <Pagina>
      <Encabezado titulo="Empecemos" alVolver={() => navegar("/vida")} />
      <div className="px-5 pt-2">
        <div className="flex items-center gap-3">
          <CaraLeonVida cara="curioso" tamano={48} />
          <h2 className="text-titulo font-black">¿Qué quieres resolver primero?</h2>
        </div>
        <p className="mt-2 text-text-soft">Lo demás lo encuentras después, cuando quieras.</p>
        <div className="mt-5 flex flex-col gap-3">
          {OPCIONES.map((o, i) => (
            <motion.button
              key={o.id}
              {...entradaEnCascada(i)}
              type="button"
              whileTap={{ y: 3, boxShadow: "0 1px 0 var(--surface)" }}
              style={{ boxShadow: "0 4px 0 var(--surface)" }}
              onPointerDown={() => sonidos.toque()}
              onClick={() => {
                // Revisar algo no "inicia" la app: no hace falta dar datos para eso.
                if (o.id !== "estafa") actualizarVida(() => ({ iniciado: true, objetivo: o.id }));
                navegar(o.ruta);
              }}
              className="flex min-h-20 cursor-pointer items-center gap-4 rounded-[20px] border-2 border-surface bg-card p-4 text-left"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-surface text-brand">
                <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
                  {ICONOS[o.icono]}
                </svg>
              </span>
              <span>
                <span className="block text-[18px] font-extrabold">{o.titulo}</span>
                <span className="text-ayuda text-text-soft">{o.detalle}</span>
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </Pagina>
  );
}
