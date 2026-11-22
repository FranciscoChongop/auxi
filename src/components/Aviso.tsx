import { AnimatePresence, motion } from "motion/react";
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { CaraDeLeon, type CaraLeon } from "./Leon";

export type TipoAviso = "exito" | "error" | "premio" | "info";

type Aviso = { id: number; texto: string; tipo: TipoAviso };

const CARA_POR_TIPO: Record<TipoAviso, CaraLeon> = {
  exito: "feliz",
  error: "tierno",
  premio: "guino",
  info: "feliz",
};

// Una franja de color a la izquierda dice de qué se trata sin gritar.
const FRANJA: Record<TipoAviso, string> = {
  exito: "bg-success",
  error: "bg-error",
  premio: "bg-reward",
  info: "bg-brand",
};

const Contexto = createContext<(texto: string, tipo?: TipoAviso) => void>(() => {});

export function useAviso() {
  return useContext(Contexto);
}

/** Avisos cortos que bajan desde arriba (abajo vive el botón principal). */
export function ProveedorAvisos({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const siguiente = useRef(0);

  const cerrar = useCallback((id: number) => setAvisos((a) => a.filter((x) => x.id !== id)), []);

  const mostrar = useCallback(
    (texto: string, tipo: TipoAviso = "info") => {
      const id = ++siguiente.current;
      setAvisos((a) => [...a.slice(-2), { id, texto, tipo }]);
      setTimeout(() => cerrar(id), 2800);
    },
    [cerrar],
  );

  return (
    <Contexto.Provider value={mostrar}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-50 flex flex-col items-center gap-2 px-5"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)" }}
        role="status"
        aria-live="polite"
      >
        <AnimatePresence initial={false}>
          {avisos.map((a) => (
            <motion.button
              type="button"
              key={a.id}
              layout
              onClick={() => cerrar(a.id)}
              initial={{ opacity: 0, y: -24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, transition: { duration: 0.16 } }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="pointer-events-auto relative flex w-full max-w-sm items-center gap-3 overflow-hidden rounded-tarjeta border-2 border-surface bg-card py-3 pr-4 pl-5 text-left shadow-[0_6px_20px_rgba(20,26,77,0.10)]"
              aria-label={`${a.texto} Toca para cerrar.`}
            >
              <span className={`absolute inset-y-0 left-0 w-1.5 ${FRANJA[a.tipo]}`} />
              <CaraDeLeon cara={CARA_POR_TIPO[a.tipo]} />
              <span className="text-[17px] leading-6 font-bold text-text">{a.texto}</span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </Contexto.Provider>
  );
}
