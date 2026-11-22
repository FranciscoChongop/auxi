import { motion } from "motion/react";
import { useState } from "react";
import { Boton } from "../components/Boton";
import { FilaTema } from "../components/FilaTema";
import { Campo, COLORES_CURSO } from "../components/Formulario";
import { CaraDeLeon } from "../components/Leon";
import { Pantalla } from "../components/Navegacion";
import { Ventana } from "../components/Ventana";
import { temasPorPrioridad } from "../lib/curso";
import { useEstado } from "../lib/estado";
import { entradaEnCascada } from "../lib/movimiento";
import { navegar } from "../lib/rutas";
import { sonidos } from "../lib/sonidos";
import { crearCurso, estudiarTema } from "../lib/tienda";

export default function Cursos() {
  const e = useEstado();
  const [nuevo, setNuevo] = useState(false);
  const [nombre, setNombre] = useState("");
  const temas = temasPorPrioridad(e);
  const listos = temas.filter((t) => t.contenido);
  const pendientes = temas.filter((t) => !t.contenido);
  const hayExamen = temas.some((t) => t.diasExamen !== undefined);

  return (
    <Pantalla titulo="Mis cursos">
      <button
        type="button"
        onClick={() => navegar("/studio/examen")}
        className="flex min-h-14 cursor-pointer items-center gap-3 rounded-tarjeta bg-brand px-4 py-3 text-left text-white"
        style={{ boxShadow: "0 4px 0 var(--brand-dark)" }}
      >
        <CaraDeLeon cara="sorpresa" tamano={44} />
        <span className="flex-1">
          <span className="block font-extrabold">¿Tienes un examen?</span>
          <span className="block text-ayuda font-semibold opacity-90">Cuéntame y lo pongo primero</span>
        </span>
        <span className="font-black">Contar</span>
      </button>

      <section className="flex flex-col gap-3">
        <h2 className="text-tarjeta font-extrabold">¿Qué quieres estudiar?</h2>
        {hayExamen && <p className="-mt-2 text-ayuda text-text-soft">Los exámenes más cercanos van primero.</p>}
        {listos.length === 0 && pendientes.length === 0 && (
          <div className="flex items-center gap-3 rounded-tarjeta border-2 border-dashed border-surface bg-card p-4">
            <CaraDeLeon cara="lentes" tamano={48} />
            <p className="font-bold">Aún no tienes temas. Agrega un curso y su primer tema.</p>
          </div>
        )}
        {listos.map((t, i) => (
          <FilaTema key={t.tema.id} info={t} indice={i} onClick={() => estudiarTema(t, navegar)} />
        ))}
        {pendientes.map((t, i) => (
          <FilaTema key={t.tema.id} info={t} indice={listos.length + i} onClick={() => estudiarTema(t, navegar)} />
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-tarjeta font-extrabold">Mis cursos</h2>
        {e.misCursos.map((c, i) => (
          <motion.button
            key={c.id}
            {...entradaEnCascada(i)}
            type="button"
            onClick={() => navegar(`/studio/cursos/${c.id}`)}
            onPointerDown={() => sonidos.toque()}
            whileTap={{ y: 3, boxShadow: "0 1px 0 var(--surface)", transition: { duration: 0.06 } }}
            style={{ boxShadow: "0 4px 0 var(--surface)" }}
            className="flex cursor-pointer items-center gap-3 overflow-hidden rounded-tarjeta border-2 border-surface bg-card py-4 pr-4 text-left"
          >
            <span className="w-1.5 self-stretch rounded-r-full" style={{ background: COLORES_CURSO[c.color] }} />
            <span className="flex-1">
              <span className="block text-[18px] leading-6 font-extrabold">{c.nombre}</span>
              <span className="block text-ayuda text-text-soft">
                {c.temas.length} {c.temas.length === 1 ? "tema" : "temas"}
              </span>
            </span>
            <svg viewBox="0 0 24 24" className="size-5 text-text-soft" aria-hidden="true">
              <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
        ))}
        <Boton variante={e.misCursos.length ? "secundario" : "principal"} onClick={() => setNuevo(true)}>
          Agregar curso
        </Boton>
      </section>

      <Ventana abierta={nuevo} alCerrar={() => setNuevo(false)} titulo="Nuevo curso">
        <Campo etiqueta="Nombre del curso" value={nombre} onChange={(ev) => setNombre(ev.target.value)} placeholder="Matemática I" autoFocus />
        <p className="mt-2 text-ayuda text-text-soft">Después te pido el primer tema y te paso el prompt para tu IA.</p>
        <div className="mt-4">
          <Boton
            deshabilitado={!nombre.trim()}
            onClick={() => {
              const id = crearCurso(nombre);
              setNombre("");
              setNuevo(false);
              navegar(`/studio/cursos/${id}?nuevoTema=1`);
            }}
          >
            Crear curso
          </Boton>
        </div>
      </Ventana>
    </Pantalla>
  );
}
