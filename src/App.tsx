import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { lazy, Suspense } from "react";
import { ProveedorAvisos } from "./components/Aviso";
import { useRuta } from "./lib/rutas";

// Código dividido por pantalla: cada una se descarga solo cuando se abre.
const Portada = lazy(() => import("./screens/Portada"));
const Catalogo = lazy(() => import("./screens/Catalogo"));

function pantallaPara(ruta: string) {
  if (ruta.startsWith("/catalogo")) return <Catalogo />;
  return <Portada />;
}

export function App() {
  const ruta = useRuta();
  return (
    <MotionConfig reducedMotion="user">
      <ProveedorAvisos>
        <Suspense fallback={<div className="min-h-dvh bg-bg" />}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={ruta}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {pantallaPara(ruta)}
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </ProveedorAvisos>
    </MotionConfig>
  );
}
