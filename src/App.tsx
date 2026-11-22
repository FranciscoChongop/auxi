import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { lazy, Suspense, useEffect, useState } from "react";
import { ApoyaAlCreador } from "./components/ApoyaAlCreador";
import { ProveedorAvisos, useAviso } from "./components/Aviso";
import { obtener } from "./lib/estado";
import { reemplazar, useRuta } from "./lib/rutas";

// Código dividido por pantalla: cada una se descarga solo cuando se abre.
const pantallas = {
  bienvenida: lazy(() => import("./screens/Bienvenida")),
  material: lazy(() => import("./screens/Material")),
  leccion: lazy(() => import("./screens/Leccion")),
  celebracion: lazy(() => import("./screens/Celebracion")),
  inicio: lazy(() => import("./screens/Inicio")),
  camino: lazy(() => import("./screens/Camino")),
  cofre: lazy(() => import("./screens/Cofre")),
  metodos: lazy(() => import("./screens/Metodos")),
  tomate: lazy(() => import("./screens/Tomate")),
  cajas: lazy(() => import("./screens/Cajas")),
  leon: lazy(() => import("./screens/ExplicaLeon")),
  cursos: lazy(() => import("./screens/Cursos")),
  curso: lazy(() => import("./screens/Curso")),
  entregas: lazy(() => import("./screens/Entregas")),
  perfil: lazy(() => import("./screens/Perfil")),
  catalogo: lazy(() => import("./screens/Catalogo")),
};

function elegir(ruta: string): keyof typeof pantallas {
  const r = ruta.replace(/\/+$/, "");
  if (r === "/catalogo") return "catalogo";
  const partes = r.split("/").filter(Boolean); // ["studio", "metodos", "tomate"]
  const [, seccion, sub] = partes;
  if (!seccion) {
    const e = obtener();
    return e.bienvenidaVista && e.cursoId ? "inicio" : "bienvenida";
  }
  if (seccion === "metodos" && sub && sub in pantallas) return sub as keyof typeof pantallas;
  if (seccion === "cursos" && sub) return "curso";
  if (seccion in pantallas) return seccion as keyof typeof pantallas;
  return "inicio";
}

/** Aviso amable cuando se va el internet. */
function SinConexion() {
  const aviso = useAviso();
  const [offline, setOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const fuera = () => {
      setOffline(true);
      aviso("Sin internet. Lo que ya abriste sigue funcionando.", "info");
    };
    const vuelve = () => setOffline(false);
    window.addEventListener("offline", fuera);
    window.addEventListener("online", vuelve);
    return () => {
      window.removeEventListener("offline", fuera);
      window.removeEventListener("online", vuelve);
    };
  }, [aviso]);
  return offline ? <div className="fixed inset-x-0 top-0 z-50 h-1 bg-error" aria-hidden="true" /> : null;
}

export function App() {
  const ruta = useRuta();
  // "/" lleva a Studio (cada mini app tiene su propia entrada).
  useEffect(() => {
    if (ruta === "/") reemplazar("/studio");
  }, [ruta]);
  const nombre = elegir(ruta);
  const Pantalla = pantallas[nombre];

  return (
    <MotionConfig reducedMotion="user">
      <ProveedorAvisos>
        <SinConexion />
        <ApoyaAlCreador lateral />
        <Suspense fallback={<div className="min-h-dvh bg-bg" />}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={nombre + ruta}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <Pantalla />
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </ProveedorAvisos>
    </MotionConfig>
  );
}
