import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useRuta } from "../lib/rutas";
import { sonidos } from "../lib/sonidos";
import { Boton } from "./Boton";

const CLAVE = "auxi.intro.v1";
const EVENTO = "auxi:intro";

/** Vuelve a mostrar la ventana de bienvenida (por ejemplo, desde Perfil). */
export function abrirIntro() {
  window.dispatchEvent(new Event(EVENTO));
}

function yaVista() {
  try {
    return !!localStorage.getItem(CLAVE);
  } catch {
    return false;
  }
}

const PUNTOS = [
  { titulo: "Sube lo que te dejaron", texto: "Tu IA favorita lo lee y Auxi lo vuelve juego." },
  { titulo: "Todo en orden", texto: "Cursos, temas, exámenes y entregas en un solo lugar." },
  { titulo: "Gratis y sin culpa", texto: "Si faltas un día, tu racha queda en pausa. Nada se pierde." },
];

/** Ventana emergente breve para quien entra por primera vez. Se cierra con la X, tocando afuera o con Escape. */
export function Intro() {
  const ruta = useRuta();
  const [abierta, setAbierta] = useState(false);
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const enLeccion = ruta.startsWith("/student/leccion") || ruta.startsWith("/catalogo");

  // Primera visita: aparece un instante después de cargar la página.
  useEffect(() => {
    if (yaVista() || enLeccion) return;
    const t = setTimeout(() => setAbierta(true), 500);
    return () => clearTimeout(t);
  }, [enLeccion]);

  // Reabrir a pedido.
  useEffect(() => {
    const abrir = () => setAbierta(true);
    window.addEventListener(EVENTO, abrir);
    return () => window.removeEventListener(EVENTO, abrir);
  }, []);

  function cerrar() {
    setAbierta(false);
    try {
      localStorage.setItem(CLAVE, "1");
    } catch {
      // Sin almacenamiento, volverá a salir la próxima vez.
    }
  }

  useEffect(() => {
    if (!abierta) return;
    cerrarRef.current?.focus();
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && cerrar();
    document.addEventListener("keydown", tecla);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", tecla);
      document.body.style.overflow = "";
    };
  }, [abierta]);

  return (
    <AnimatePresence>
      {abierta && (
        <div className="fixed inset-0 z-[70] grid place-items-center px-5">
          <motion.div
            className="absolute inset-0 bg-text/50"
            onClick={cerrar}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="intro-titulo"
            className="relative w-full max-w-sm overflow-hidden rounded-[24px] bg-bg"
            style={{ boxShadow: "0 8px 0 var(--surface)" }}
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12, transition: { duration: 0.15 } }}
            transition={{ type: "spring", stiffness: 420, damping: 26 }}
          >
            <div className="relative">
              <img src="/marketing/bienvenida.webp" alt="" className="block h-40 w-full object-cover object-left" width={800} height={400} />
              <div className="absolute inset-y-0 right-0 flex w-[52%] flex-col justify-center pr-4 text-white">
                <p className="text-ayuda font-bold opacity-90">Auxi Student</p>
                <p className="text-[24px] leading-7 font-black">
                  Estudia jugando <span className="text-success">con León</span>
                </p>
              </div>
              <button
                ref={cerrarRef}
                type="button"
                onClick={cerrar}
                aria-label="Cerrar"
                className="absolute top-2 right-2 grid size-11 cursor-pointer place-items-center rounded-full bg-white/90 text-text"
              >
                <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="p-5">
              <h2 id="intro-titulo" className="text-tarjeta font-extrabold">
                ¡Hola! Soy León
              </h2>
              <ul className="mt-3 flex flex-col gap-3">
                {PUNTOS.map((p) => (
                  <li key={p.titulo} className="flex gap-3">
                    <span className="mt-1 size-3 shrink-0 rounded-full bg-success" />
                    <span>
                      <span className="block font-extrabold">{p.titulo}</span>
                      <span className="block text-ayuda text-text-soft">{p.texto}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                <Boton
                  onClick={() => {
                    sonidos.acierto();
                    cerrar();
                  }}
                  sinSonido
                >
                  Entendido, vamos
                </Boton>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
