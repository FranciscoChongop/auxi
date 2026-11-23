import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { lazy, Suspense, useEffect } from "react";
import { useCuenta } from "../lib/nube";
import { useRuta, useRutaCompleta } from "../lib/rutas";
import { cerrarDiasPasados, useVida } from "./estado";
import { AvisoDeshacer } from "./ui";

// Código dividido por pantalla.
const pantallas = {
  bienvenida: lazy(() => import("./pantallas/Bienvenida")),
  empezar: lazy(() => import("./pantallas/Empezar")),
  plan: lazy(() => import("./pantallas/Plan")),
  hoy: lazy(() => import("./pantallas/Hoy")),
  registrar: lazy(() => import("./pantallas/Registrar")),
  anotar: lazy(() => import("./pantallas/Anotar")),
  importar: lazy(() => import("./pantallas/Importar")),
  movimientos: lazy(() => import("./pantallas/Movimientos")),
  metas: lazy(() => import("./pantallas/Metas")),
  protegete: lazy(() => import("./pantallas/Protegete")),
  perfil: lazy(() => import("./pantallas/Perfil")),
  logro: lazy(() => import("./pantallas/Logro")),
  cofre: lazy(() => import("./pantallas/Cofre")),
  cuenta: lazy(() => import("./pantallas/Cuenta")),
};

type Nombre = keyof typeof pantallas;

/** Se puede usar sin armar el presupuesto: por ejemplo, para revisar un mensaje. */
const SIN_EMPEZAR: Nombre[] = ["bienvenida", "empezar", "plan", "protegete"];

/** Auxi Vida: misma cuenta y piezas que Studio, con su propia entrada /vida y su propio color. */
export default function VidaApp() {
  const ruta = useRuta();
  const completa = useRutaCompleta();
  const e = useVida();
  // Hasta saber qué cuenta hay, no se muestran datos (así no se ve el espacio equivocado).
  const cargandoCuenta = useCuenta().modo === "cargando";

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
  const pedido: Nombre = seccion === "inicio" ? "hoy" : seccion === "captura" ? "importar" : seccion in pantallas ? (seccion as Nombre) : e.iniciado ? "hoy" : "bienvenida";
  const nombre: Nombre = e.iniciado ? (pedido === "bienvenida" ? "hoy" : pedido) : SIN_EMPEZAR.includes(pedido) ? pedido : "bienvenida";
  const Pantalla = pantallas[nombre];
  if (cargandoCuenta) return <div className="min-h-dvh bg-bg" role="status" aria-label="Cargando" />;

  return (
    <MotionConfig reducedMotion={e.menosMovimiento ? "always" : "user"}>
      <Suspense fallback={<div className="min-h-dvh bg-bg" />}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={nombre + completa} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2, ease: "easeOut" }}>
            <Pantalla />
          </motion.div>
        </AnimatePresence>
      </Suspense>
      <AvisoDeshacer />
    </MotionConfig>
  );
}
