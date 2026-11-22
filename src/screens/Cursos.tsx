import { motion } from "motion/react";
import { useState } from "react";
import { Boton } from "../components/Boton";
import { Campo, COLORES_CURSO } from "../components/Formulario";
import { CaraDeLeon } from "../components/Leon";
import { Pantalla } from "../components/Navegacion";
import { Ventana } from "../components/Ventana";
import { actualizar, nuevoId, useEstado } from "../lib/estado";
import { entradaEnCascada } from "../lib/movimiento";
import { navegar } from "../lib/rutas";
import { sonidos } from "../lib/sonidos";

export default function Cursos() {
  const e = useEstado();
  const [nuevo, setNuevo] = useState(false);
  const [nombre, setNombre] = useState("");

  return (
    <Pantalla titulo="Mis cursos">
      <p className="-mt-2 text-text-soft">Cada curso tiene sus temas, y cada tema sus PDF.</p>

      {e.misCursos.length === 0 && (
        <div className="flex items-center gap-3 rounded-tarjeta border-2 border-dashed border-surface bg-card p-4">
          <CaraDeLeon cara="lentes" tamano={48} />
          <p className="font-bold">Agrega tu primer curso y sube los PDF de cada tema.</p>
        </div>
      )}

      {e.misCursos.map((c, i) => {
        const pdfs = c.temas.reduce((n, t) => n + t.archivos.length, 0);
        return (
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
                {c.temas.length} {c.temas.length === 1 ? "tema" : "temas"} · {pdfs} PDF
              </span>
            </span>
            <svg viewBox="0 0 24 24" className="size-5 text-text-soft" aria-hidden="true">
              <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
        );
      })}

      <Boton variante={e.misCursos.length ? "secundario" : "principal"} onClick={() => setNuevo(true)}>
        Agregar curso
      </Boton>

      <Ventana abierta={nuevo} alCerrar={() => setNuevo(false)} titulo="Nuevo curso">
        <Campo etiqueta="Nombre del curso" value={nombre} onChange={(ev) => setNombre(ev.target.value)} placeholder="Matemática I" autoFocus />
        <div className="mt-4">
          <Boton
            deshabilitado={!nombre.trim()}
            onClick={() => {
              const id = nuevoId("c");
              actualizar((s) => ({ misCursos: [...s.misCursos, { id, nombre: nombre.trim(), color: s.misCursos.length % 6, temas: [] }] }));
              setNombre("");
              setNuevo(false);
              navegar(`/studio/cursos/${id}`);
            }}
          >
            Crear curso
          </Boton>
        </div>
      </Ventana>
    </Pantalla>
  );
}
