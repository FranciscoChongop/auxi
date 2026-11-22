import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { sonidos } from "../lib/sonidos";

type Props = {
  abierta: boolean;
  alCerrar: () => void;
  titulo: string;
  children: ReactNode;
};

/** Ventana que sube desde abajo. Siempre se cierra con la X, tocando afuera o con Escape. */
export function Ventana({ abierta, alCerrar, titulo, children }: Props) {
  const idTitulo = useId();
  const botonX = useRef<HTMLButtonElement>(null);
  const cerrar = useRef(alCerrar);
  cerrar.current = alCerrar;

  useEffect(() => {
    if (!abierta) return;
    const anterior = document.activeElement as HTMLElement | null;
    botonX.current?.focus();
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && cerrar.current();
    document.addEventListener("keydown", tecla);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", tecla);
      document.body.style.overflow = "";
      anterior?.focus?.();
    };
  }, [abierta]);

  return (
    <AnimatePresence>
      {abierta && (
        <div className="fixed inset-0 z-40 flex items-end justify-center">
          <motion.div
            className="absolute inset-0 bg-text/40"
            onClick={alCerrar}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={idTitulo}
            className="relative w-full max-w-md rounded-t-[24px] bg-bg px-5 pt-5"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%", transition: { duration: 0.2, ease: "easeIn" } }}
            transition={{ type: "spring", stiffness: 420, damping: 36 }}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <h2 id={idTitulo} className="pt-2 text-tarjeta font-extrabold">
                {titulo}
              </h2>
              <motion.button
                ref={botonX}
                type="button"
                onClick={alCerrar}
                onPointerDown={() => sonidos.toque()}
                whileTap={{ scale: 0.88 }}
                aria-label="Cerrar"
                className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full bg-surface text-text"
              >
                <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </motion.button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
