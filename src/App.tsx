import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { lazy, Suspense, useEffect, useState } from "react";
import { ApoyaAlCreador } from "./components/ApoyaAlCreador";
import { ProveedorAvisos, useAviso } from "./components/Aviso";
import { actualizar, obtener, useEstado } from "./lib/estado";
import { useCuenta } from "./lib/nube";
import { reemplazar, useRuta } from "./lib/rutas";

// Código dividido por pantalla: cada una se descarga solo cuando se abre.
const pantallas = {
  bienvenida: lazy(() => import("./screens/Bienvenida")),
  material: lazy(() => import("./screens/Material")),
  leccion: lazy(() => import("./screens/Leccion")),
  celebracion: lazy(() => import("./screens/Celebracion")),
  inicio: lazy(() => import("./screens/Inicio")),
  camino: lazy(() => import("./screens/Camino")),
  importar: lazy(() => import("./screens/Importar")),
  monedas: lazy(() => import("./screens/Monedas")),
  silabo: lazy(() => import("./screens/Silabo")),
  examen: lazy(() => import("./screens/Examen")),
  ayuda: lazy(() => import("./screens/Ayuda")),
  apoyo: lazy(() => import("./screens/Apoyo")),
  revision: lazy(() => import("./screens/Revision")),
  cofre: lazy(() => import("./screens/Cofre")),
  metodos: lazy(() => import("./screens/Metodos")),
  tomate: lazy(() => import("./screens/Tomate")),
  cajas: lazy(() => import("./screens/Cajas")),
  leon: lazy(() => import("./screens/ExplicaLeon")),
  cursos: lazy(() => import("./screens/Cursos")),
  curso: lazy(() => import("./screens/Curso")),
  entregas: lazy(() => import("./screens/Entregas")),
  perfil: lazy(() => import("./screens/Perfil")),
  cuenta: lazy(() => import("./screens/Cuenta")),
  entrada: lazy(() => import("./screens/Entrada")),
  tour: lazy(() => import("./screens/Tour")),
  privacidad: lazy(() => import("./screens/Legal")),
  terminos: lazy(() => import("./screens/Legal")),
  datos: lazy(() => import("./screens/Datos")),
  catalogo: lazy(() => import("./screens/Catalogo")),
};

// Auxi Vida (mini app 2): su propia entrada /vida, cargada aparte.
const VidaApp = lazy(() => import("./vida/VidaApp"));

// La plataforma (Auxi Studio): portada, inicio de sesión único y elección de mini app.
const Plataforma = lazy(() => import("./screens/Plataforma"));
const NoEncontrado = lazy(() => import("./screens/NoEncontrado"));
const RUTAS_PLATAFORMA = ["/", "/entrar", "/negocio", "/privacidad", "/terminos"];

/** Las direcciones viejas /studio/... ahora son /student/... (así no se rompen enlaces ni instalaciones). */
function RedirigirAlStudent() {
  useEffect(() => {
    reemplazar(location.pathname.replace(/^\/studio/, "/student") + location.search);
  }, []);
  return <div className="min-h-dvh bg-bg" />;
}

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
  const limpia = ruta.replace(/\/+$/, "") || "/";
  if (limpia === "/studio" || limpia.startsWith("/studio/")) return <RedirigirAlStudent />;
  if (RUTAS_PLATAFORMA.includes(limpia)) {
    return (
      <MotionConfig reducedMotion="user">
        <ProveedorAvisos>
          <SinConexion />
          <Suspense fallback={<div className="min-h-dvh bg-bg" />}>
            <Plataforma />
          </Suspense>
        </ProveedorAvisos>
      </MotionConfig>
    );
  }
  if (ruta === "/vida" || ruta.startsWith("/vida/")) {
    return (
      <MotionConfig reducedMotion="user">
        <ProveedorAvisos>
          <SinConexion />
          <Suspense fallback={<div className="min-h-dvh bg-bg" />}>
            <VidaApp />
          </Suspense>
        </ProveedorAvisos>
      </MotionConfig>
    );
  }
  // Solo Auxi Student vive fuera de estas rutas; el catálogo técnico de componentes es solo para desarrollo.
  const esStudent = limpia === "/student" || limpia.startsWith("/student/");
  const esCatalogo = limpia === "/catalogo" && import.meta.env.DEV;
  if (!esStudent && !esCatalogo) {
    return (
      <Suspense fallback={<div className="min-h-dvh bg-bg" />}>
        <NoEncontrado />
      </Suspense>
    );
  }
  return <AppStudio />;
}

function AppStudio() {
  const ruta = useRuta();
  useEffect(() => {
    document.title = "Auxi Student · Estudia jugando con León";
  }, []);
  const cuenta = useCuenta();
  // Hay que iniciar sesión para entrar (el catálogo de diseño queda libre).
  const destino = elegir(ruta);
  const estado = useEstado();
  // Sin configuración de cuentas en producción se trata como visitante: no se entra sin cuenta.
  const invitado = (cuenta.modo === "invitado" || cuenta.modo === "sin-configuracion") && ruta !== "/catalogo";
  // Sin cuenta: solo la portada y el inicio de sesión.
  const bloqueada = invitado && !["bienvenida", "privacidad", "terminos"].includes(destino);
  const listo = cuenta.modo === "conectado" && cuenta.sincronizado;
  const pideDatos = listo && !estado.datos && ruta !== "/catalogo";
  // Recorrido de bienvenida (solo tocar «Siguiente») antes de ver la app por primera vez.
  const pideTour = listo && !pideDatos && !estado.tourVisto && ruta !== "/catalogo";
  const nombre =
    cuenta.modo === "cargando" || (cuenta.modo === "conectado" && !cuenta.sincronizado)
      ? null
      : bloqueada
        ? "entrada"
        : invitado
          ? destino === "privacidad" || destino === "terminos" ? destino : "bienvenida"
          : pideDatos
            ? "datos"
            : pideTour
              ? "tour"
              : destino;

  // Guía de inicio: anota las partes de la app que ya abrió.
  useEffect(() => {
    if (!listo) return;
    const id = ruta.split("/").filter(Boolean)[1];
    if (id && ["cursos", "camino", "metodos", "entregas", "perfil"].includes(id) && !obtener().guia.includes(id)) {
      actualizar((s) => ({ guia: [...s.guia, id] }));
    }
  }, [ruta, listo]);
  const Pantalla = nombre ? pantallas[nombre] : null;

  return (
    <MotionConfig reducedMotion="user">
      <ProveedorAvisos>
        <SinConexion />
        {!bloqueada && !invitado && <ApoyaAlCreador lateral />}
        <Suspense fallback={<div className="min-h-dvh bg-bg" />}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={String(nombre) + (bloqueada ? "" : ruta)}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {Pantalla ? <Pantalla /> : <div className="min-h-dvh bg-bg" />}
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </ProveedorAvisos>
    </MotionConfig>
  );
}
