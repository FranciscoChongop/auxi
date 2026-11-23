import { AnimatePresence, motion } from "motion/react";
import { Boton } from "./Boton";
import { textoExamen } from "./FilaTema";
import { cursoDe, esVacio, nodos, proximoExamen } from "../lib/curso";
import { actualizar, debidosDeRepaso, type Estado } from "../lib/estado";
import { diasEntre, hoy } from "../lib/fechas";
import { cupoTotal, estudiarTema, importadosUsados } from "../lib/tienda";
import { navegar } from "../lib/rutas";

type Aviso = { id: string; texto: string; boton: string; ir: () => void; tono: "estudio" | "pase" };

/** Recordatorios del día. Se ven dentro de la app, se cierran con la × y vuelven mañana. */
function avisosDe(e: Estado): Aviso[] {
  const lista: Aviso[] = [];
  const curso = cursoDe(e);
  const prox = proximoExamen(e);

  // 1) Lo que toca hoy para estudiar (sin culpas).
  if (prox && prox.diasExamen! <= 7) {
    lista.push({
      id: "examen",
      texto: `Examen de «${prox.tema.nombre}» ${textoExamen(prox.diasExamen!).toLowerCase()}. Hoy toca repasar un poco.`,
      boton: "Estudiar",
      ir: () => estudiarTema(prox, navegar),
      tono: "estudio",
    });
  } else if (!esVacio(curso)) {
    const repaso = debidosDeRepaso(e, curso.id).length;
    const siguiente = nodos(curso, e).find((n) => n.abierto && !n.hecho);
    if (repaso > 0) {
      lista.push({ id: "repaso", texto: `Tienes ${repaso} ${repaso === 1 ? "pregunta" : "preguntas"} para repasar hoy. Son 2 minutos.`, boton: "Repasar", ir: () => navegar("/student/leccion?n=repaso"), tono: "estudio" });
    } else if ((e.diasEstudio[hoy()] ?? 0) === 0 && siguiente) {
      lista.push({ id: "leccion", texto: `Hoy aún no estudias. «${siguiente.titulo}» te toma pocos minutos.`, boton: "Empezar", ir: () => navegar(`/student/leccion?n=${siguiente.clave}`), tono: "estudio" });
    }
  }

  const entrega = [...e.entregas]
    .filter((x) => !x.tipo?.includes("feriado") && diasEntre(hoy(), x.fecha) >= 0 && diasEntre(hoy(), x.fecha) <= 3 && !x.id.startsWith("ex-"))
    .sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
  if (entrega) {
    const d = diasEntre(hoy(), entrega.fecha);
    lista.push({ id: "entrega", texto: `«${entrega.titulo}» ${d === 0 ? "vence hoy" : d === 1 ? "vence mañana" : `vence en ${d} días`}.`, boton: "Ver entregas", ir: () => navegar("/student/entregas"), tono: "estudio" });
  }

  // 2) Cupo de temas y pase libre (siempre a la vista mientras no lo tenga).
  if (!e.pasePorVida && importadosUsados(e) > 0) {
    const usados = importadosUsados(e);
    const total = cupoTotal(e);
    const quedan = Math.max(0, total - usados);
    const texto =
      quedan === 0
        ? `Ya usaste tus ${total} temas gratis. Con el pase libre estudias sin límite, para siempre. Solo cumples unos pasos.`
        : quedan === 1
          ? "Te queda 1 tema gratis. Con el pase libre no tendrás límite, para siempre. Solo cumples unos pasos."
          : `Tienes ${quedan} temas gratis. Con el pase libre no hay límite, para siempre. Solo cumples unos pasos.`;
    lista.push({ id: "pase", texto, boton: "Ver los pasos", ir: () => navegar("/student/apoyo"), tono: "pase" });
  }
  return lista;
}

export function Recordatorios({ e }: { e: Estado }) {
  const hoyClave = hoy();
  const visibles = avisosDe(e).filter((a) => e.recordatorios[a.id] !== hoyClave).slice(0, 2);
  if (!visibles.length) return null;

  return (
    <section className="flex flex-col gap-3" aria-label="Recordatorios de hoy">
      <AnimatePresence initial={false}>
        {visibles.map((a) => (
          <motion.div
            key={a.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className={`relative rounded-tarjeta p-4 ${a.tono === "pase" ? "bg-brand text-white" : "border-2 border-surface bg-card"}`}
            style={a.tono === "pase" ? { boxShadow: "0 4px 0 var(--brand-dark)" } : undefined}
          >
            <button
              type="button"
              aria-label="Cerrar este recordatorio por hoy"
              onClick={() => actualizar((s) => ({ recordatorios: { ...s.recordatorios, [a.id]: hoyClave } }))}
              className={`absolute top-1 right-1 grid size-11 cursor-pointer place-items-center text-[22px] font-black ${a.tono === "pase" ? "text-white" : "text-text-soft"}`}
            >
              ×
            </button>
            <p className="pr-10 font-bold">{a.texto}</p>
            <div className="mt-3">
              <Boton variante={a.tono === "pase" ? "secundario" : "principal"} onClick={a.ir}>
                {a.boton}
              </Boton>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </section>
  );
}
