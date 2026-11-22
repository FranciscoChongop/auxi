import { motion } from "motion/react";
import { Boton } from "./Boton";
import { actualizar, type Estado } from "../lib/estado";
import { navegar } from "../lib/rutas";

const PASOS = [
  { id: "cursos", titulo: "Crea tu primer curso", texto: "Aquí subes tu material y lo vuelves juego.", ruta: "/studio/cursos" },
  { id: "camino", titulo: "Mira tu camino", texto: "Cada lección abre la siguiente.", ruta: "/studio/camino" },
  { id: "metodos", titulo: "Prueba un método", texto: "El tomate, las 5 cajas o explicarle a León.", ruta: "/studio/metodos" },
  { id: "entregas", titulo: "Abre tus entregas", texto: "Pega tu sílabo y ve tus fechas.", ruta: "/studio/entregas" },
  { id: "perfil", titulo: "Conoce tu perfil", texto: "Tu racha, tus monedas y Cerrar sesión.", ruta: "/studio/perfil" },
];

/** Guía de inicio: te lleva, paso a paso, por las partes principales. Se cierra con la X. */
export function GuiaInicio({ e }: { e: Estado }) {
  if (e.guiaCerrada) return null;
  const hechos = PASOS.filter((p) => e.guia.includes(p.id));
  const siguiente = PASOS.find((p) => !e.guia.includes(p.id));
  const cerrar = () => actualizar(() => ({ guiaCerrada: true }));

  return (
    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative rounded-tarjeta border-2 border-brand bg-card p-4" aria-label="Guía de inicio">
      <button type="button" onClick={cerrar} aria-label="Cerrar la guía" className="absolute top-1 right-1 grid size-11 cursor-pointer place-items-center text-[22px] font-black text-text-soft">
        ×
      </button>
      <p className="pr-10 text-ayuda font-extrabold text-brand">
        Guía de inicio: {hechos.length} de {PASOS.length}
      </p>
      <div className="mt-1 flex gap-1.5" aria-hidden="true">
        {PASOS.map((p) => (
          <span key={p.id} className={`h-2 flex-1 rounded-full ${e.guia.includes(p.id) ? "bg-success" : "bg-surface"}`} />
        ))}
      </div>
      {siguiente ? (
        <>
          <p className="mt-3 text-tarjeta font-extrabold">{siguiente.titulo}</p>
          <p className="text-text-soft">{siguiente.texto}</p>
          <motion.div className="mt-3" animate={{ scale: [1, 1.03, 1] }} transition={{ repeat: 3, duration: 1.2 }}>
            <Boton onClick={() => navegar(siguiente.ruta)}>Tocar aquí</Boton>
          </motion.div>
        </>
      ) : (
        <>
          <p className="mt-3 text-tarjeta font-extrabold">¡Ya conoces Auxi!</p>
          <p className="text-text-soft">Si algo no te queda claro, Atención al cliente está en tu perfil.</p>
          <div className="mt-3">
            <Boton variante="secundario" onClick={cerrar}>
              Cerrar guía
            </Boton>
          </div>
        </>
      )}
    </motion.section>
  );
}
