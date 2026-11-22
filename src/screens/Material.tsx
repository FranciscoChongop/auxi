import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { BarraProgreso } from "../components/BarraProgreso";
import { Boton } from "../components/Boton";
import { Leon } from "../components/Leon";
import { Pantalla } from "../components/Navegacion";
import { Ventana } from "../components/Ventana";
import { CELULA, FOTOSINTESIS } from "../data/cursos";
import { entradaEnCascada } from "../lib/movimiento";
import { actualizar, useEstado } from "../lib/estado";
import { navegar, reemplazar } from "../lib/rutas";
import { sonidos } from "../lib/sonidos";

const FRASES = ["Leyendo tu material…", "Buscando lo importante…", "Armando preguntas…", "Casi listo…"];

function IconoMaterial({ tipo }: { tipo: "pdf" | "foto" | "texto" }) {
  const t = { fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  return (
    <span className="grid size-14 shrink-0 place-items-center rounded-[14px] bg-surface text-brand">
      <svg viewBox="0 0 24 24" className="size-7" aria-hidden="true">
        {tipo === "pdf" && (
          <g {...t}>
            <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
            <path d="M14 3v5h5M9 13h6M9 17h4" />
          </g>
        )}
        {tipo === "foto" && (
          <g {...t}>
            <path d="M4 8a2 2 0 0 1 2-2h2l1.5-2h5L16 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
            <circle cx="12" cy="13" r="3.5" />
          </g>
        )}
        {tipo === "texto" && (
          <g {...t}>
            <path d="M5 6h14M5 10h14M5 14h9M5 18h6" />
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
  const pdf = useRef<HTMLInputElement>(null);
  const foto = useRef<HTMLInputElement>(null);
  const [texto, setTexto] = useState("");
  const [pegando, setPegando] = useState(false);
  const [ejemplos, setEjemplos] = useState(false);
  const [cargando, setCargando] = useState<string | null>(null);
  const [avance, setAvance] = useState(0);

  // Estado de carga: León piensa mientras la barra avanza.
  useEffect(() => {
    if (!cargando) return;
    const inicio = Date.now();
    const t = setInterval(() => {
      const p = Math.min(1, (Date.now() - inicio) / 3200);
      setAvance(p);
      if (p >= 1) {
        clearInterval(t);
        empezar(FOTOSINTESIS.id);
      }
    }, 120);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargando]);

  function empezar(cursoId: string) {
    actualizar(() => ({ cursoId, bienvenidaVista: true }));
    // La primera lección se juega antes de pedir cuenta.
    reemplazar(`/studio/leccion?n=0-0`);
  }

  function subir(nombre: string | undefined) {
    if (!nombre) return;
    setPegando(false);
    setCargando(nombre);
  }

  if (cargando) {
    const frase = FRASES[Math.min(FRASES.length - 1, Math.floor(avance * FRASES.length))];
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-8 text-center">
        <Leon pose="pensativo" alto={240} rebote />
        <AnimatePresence mode="wait">
          <motion.p
            key={frase}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-tarjeta font-extrabold"
          >
            {frase}
          </motion.p>
        </AnimatePresence>
        <div className="w-full">
          <BarraProgreso valor={avance} etiqueta="Preparando tu lección" />
        </div>
        <p className="text-ayuda text-text-soft">
          Versión de prueba: mientras conectamos la IA, practicarás con el tema de ejemplo.
        </p>
      </main>
    );
  }

  return (
    <Pantalla titulo="Sube lo que tengas" conBarra={!!e.cursoId} atras={e.cursoId ? "/studio/inicio" : undefined}>
      <p className="-mt-2 text-text-soft">León lo convierte en preguntas para que estudies jugando.</p>
      <Opcion indice={0} titulo="Subir PDF" ayuda="Separatas, libros o diapositivas" icono={<IconoMaterial tipo="pdf" />} onClick={() => pdf.current?.click()} />
      <Opcion indice={1} titulo="Tomar foto de apuntes" ayuda="Tu cuaderno o la pizarra" icono={<IconoMaterial tipo="foto" />} onClick={() => foto.current?.click()} />
      <Opcion indice={2} titulo="Pegar texto" ayuda="Lo que copiaste de cualquier lado" icono={<IconoMaterial tipo="texto" />} onClick={() => setPegando(true)} />

      <input ref={pdf} type="file" accept="application/pdf" className="hidden" onChange={(ev) => subir(ev.target.files?.[0]?.name)} />
      <input ref={foto} type="file" accept="image/*" capture="environment" className="hidden" onChange={(ev) => subir(ev.target.files?.[0]?.name)} />

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

      <Ventana abierta={pegando} alCerrar={() => setPegando(false)} titulo="Pega tu texto">
        <textarea
          value={texto}
          onChange={(ev) => setTexto(ev.target.value)}
          placeholder="Pega aquí el tema que te dejaron…"
          className="h-44 w-full resize-none rounded-boton border-2 border-surface bg-card p-3 text-[16px] font-semibold text-text outline-none focus:border-brand"
          aria-label="Texto para estudiar"
        />
        <div className="mt-4">
          <Boton deshabilitado={texto.trim().length < 20} onClick={() => subir("texto")}>
            {texto.trim().length < 20 ? "Pega un poco más de texto" : "Crear lección"}
          </Boton>
        </div>
      </Ventana>
    </Pantalla>
  );
}

export function irAMaterial() {
  navegar("/studio/material");
}
