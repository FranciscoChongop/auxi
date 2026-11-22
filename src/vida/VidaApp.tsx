import { AnimatePresence, motion } from "motion/react";
import { lazy, Suspense, useEffect } from "react";
import { useRuta } from "../lib/rutas";
import { cerrarDiasPasados, useVida } from "./estado";

// Código dividido por pantalla.
const pantallas = {
  bienvenida: lazy(() => import("./pantallas/Bienvenida")),
  plan: lazy(() => import("./pantallas/Plan")),
  inicio: lazy(() => import("./pantallas/Inicio")),
  anotar: lazy(() => import("./pantallas/Anotar")),
  captura: lazy(() => import("./pantallas/Captura")),
  logro: lazy(() => import("./pantallas/Logro")),
  cofre: lazy(() => import("./pantallas/Cofre")),
  cuenta: lazy(() => import("./pantallas/Cuenta")),
  colchon: lazy(() => import("./pantallas/Colchon")),
  aprender: lazy(() => import("./pantallas/Aprender")),
  leccion: lazy(() => import("./pantallas/Leccion")),
  alertas: lazy(() => import("./pantallas/Alertas")),
  perfil: lazy(() => import("./pantallas/Perfil")),
};

type Nombre = keyof typeof pantallas;

/** Auxi Vida: misma cuenta y piezas que Studio, con su propia entrada /vida y su propio color. */
export default function VidaApp() {
  const ruta = useRuta();
  const e = useVida();

  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("vida");
    const meta = document.querySelector('meta[name="theme-color"]');
    const antes = meta?.getAttribute("content");
    meta?.setAttribute("content", "#F3FAF8");
    document.title = "Auxi Vida";
    return () => {
      html.classList.remove("vida");
      if (antes) meta?.setAttribute("content", antes);
    };
  }, []);

  // Al abrir (y al volver a la app), se cierran los días anteriores.
  useEffect(() => {
    cerrarDiasPasados();
    const alVolver = () => document.visibilityState === "visible" && cerrarDiasPasados();
    document.addEventListener("visibilitychange", alVolver);
    return () => document.removeEventListener("visibilitychange", alVolver);
  }, []);

  const seccion = ruta.replace(/\/+$/, "").split("/").filter(Boolean)[1] ?? "";
  let nombre: Nombre;
  if (!e.plan) nombre = seccion === "plan" ? "plan" : "bienvenida";
  else nombre = seccion in pantallas && seccion !== "bienvenida" ? (seccion as Nombre) : "inicio";
  const Pantalla = pantallas[nombre];

  return (
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
  );
}
