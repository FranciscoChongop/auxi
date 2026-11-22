import { motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { Boton } from "../components/Boton";
import { Leon } from "../components/Leon";
import { Pantalla } from "../components/Navegacion";
import { CELULA, FOTOSINTESIS } from "../data/cursos";
import { actualizar, useEstado } from "../lib/estado";
import { entradaEnCascada } from "../lib/movimiento";
import { navegar, reemplazar } from "../lib/rutas";
import { sonidos } from "../lib/sonidos";

function Icono({ tipo }: { tipo: "ia" | "curso" }) {
  const t = { fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  return (
    <span className="grid size-14 shrink-0 place-items-center rounded-[14px] bg-surface text-brand">
      <svg viewBox="0 0 24 24" className="size-7" aria-hidden="true">
        {tipo === "ia" ? (
          <g {...t}>
            <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" />
            <path d="M18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
          </g>
        ) : (
          <g {...t}>
            <path d="M5 4.5h11a3 3 0 0 1 3 3v12H8a3 3 0 0 1-3-3zM5 16.5a3 3 0 0 1 3-3h11" />
          </g>
        )}
      </svg>
    </span>
  );
}

function Opcion({ indice, titulo, ayuda, icono, onClick }: { indice: number; titulo: string; ayuda: string; icono: ReactNode; onClick: () => void }) {
  return (
    <motion.button
      {...entradaEnCascada(indice)}
      type="button"
      onClick={onClick}
      onPointerDown={() => sonidos.toque()}
      whileTap={{ y: 3, boxShadow: "0 1px 0 var(--surface)", transition: { duration: 0.06 } }}
      style={{ boxShadow: "0 4px 0 var(--surface)" }}
      className="flex w-full cursor-pointer items-center gap-4 rounded-tarjeta border-2 border-surface bg-card p-4 text-left"
    >
      {icono}
      <span>
        <span className="block text-tarjeta font-extrabold">{titulo}</span>
        <span className="block text-ayuda text-text-soft">{ayuda}</span>
      </span>
    </motion.button>
  );
}

export default function Material() {
  const e = useEstado();
  const [ejemplos, setEjemplos] = useState(false);
  const importados = Object.keys(e.importados).length;

  function empezar(cursoId: string) {
    actualizar(() => ({ cursoId, bienvenidaVista: true }));
    // La primera lección se juega antes de pedir cuenta.
    reemplazar("/studio/leccion?n=0-0");
  }

  return (
    <Pantalla titulo="Sube lo que tengas" conBarra={!!e.cursoId} atras={e.cursoId ? "/studio/inicio" : undefined}>
      <p className="-mt-2 text-text-soft">Pásalo por tu IA favorita y pega el resultado. León lo convierte en juego.</p>

      <Opcion
        indice={0}
        titulo="Crear con mi IA"
        ayuda="ChatGPT, Claude o Gemini lo leen; tú pegas lo que te dan"
        icono={<Icono tipo="ia" />}
        onClick={() => navegar("/studio/importar")}
      />
      {importados > 0 && (
        <Opcion
          indice={1}
          titulo="Elegir de Mis cursos"
          ayuda={`${importados} ${importados === 1 ? "tema listo" : "temas listos"} para estudiar`}
          icono={<Icono tipo="curso" />}
          onClick={() => navegar("/studio/cursos")}
        />
      )}

      <div className="mt-2">
        {!ejemplos ? (
          <Boton variante="secundario" onClick={() => setEjemplos(true)}>
            Probar con un tema de ejemplo
          </Boton>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
            <p className="font-extrabold">Elige un tema</p>
            {[FOTOSINTESIS, CELULA].map((c, i) => (
              <Opcion
                key={c.id}
                indice={i}
                titulo={c.titulo}
                ayuda={`${c.materia} · ${c.unidades.reduce((n, u) => n + u.lecciones.length, 0)} lecciones`}
                icono={<Leon pose={i === 0 ? "concentrado" : "pensativo"} alto={56} />}
                onClick={() => empezar(c.id)}
              />
            ))}
          </motion.div>
        )}
      </div>
    </Pantalla>
  );
}
