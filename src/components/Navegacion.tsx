import { motion } from "motion/react";
import type { ReactNode } from "react";
import { rachaEnPausa, rachaVigente, useEstado } from "../lib/estado";
import { navegar, useRuta, volver } from "../lib/rutas";
import { sonidos } from "../lib/sonidos";
import { vibrar } from "../lib/vibrar";
import { CambiarApp } from "./CambiarApp";
import { ContadorAnimado } from "./ContadorAnimado";

/* ---------- Íconos simples (trazo redondeado, sin emojis) ---------- */

const trazo = { fill: "none", stroke: "currentColor", strokeWidth: 2.4, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const Iconos = {
  inicio: <path {...trazo} d="M4 11l8-6.5 8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" />,
  // Camino: dos paradas unidas por una ruta que zigzaguea.
  camino: (
    <g {...trazo}>
      <circle cx="6" cy="19" r="2.6" />
      <circle cx="18" cy="5" r="2.6" />
      <path d="M8.6 19h8.4a3.5 3.5 0 0 0 0-7H7a3.5 3.5 0 0 1 0-7h8.4" />
    </g>
  ),
  cursos: <path {...trazo} d="M5 4.5h11a3 3 0 0 1 3 3v12H8a3 3 0 0 1-3-3zM5 16.5a3 3 0 0 1 3-3h11" />,
  metodos: (
    <g {...trazo}>
      <circle cx="12" cy="13.5" r="7.5" />
      <path d="M12 9.5v4l2.5 2M9.5 3h5" />
    </g>
  ),
  entregas: (
    <g {...trazo}>
      <rect x="4" y="5.5" width="16" height="15" rx="3" />
      <path d="M8 3.5v4M16 3.5v4M4 10.5h16M9 15l2 2 4-4" />
    </g>
  ),
  perfil: (
    <g {...trazo}>
      <circle cx="12" cy="8.5" r="4" />
      <path d="M4.5 20.5c1.2-3.8 4.2-5.5 7.5-5.5s6.3 1.7 7.5 5.5" />
    </g>
  ),
  mas: <path {...trazo} strokeWidth={3} d="M12 5v14M5 12h14" />,
  atras: <path {...trazo} strokeWidth={2.8} d="M15 5l-7 7 7 7" />,
};

export function Icono({ nombre, className = "size-6" }: { nombre: keyof typeof Iconos; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {Iconos[nombre]}
    </svg>
  );
}

export function Llama({ activa, className = "size-6" }: { activa: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 2.5c.6 3.2 5.5 5.6 5.5 11a5.5 5.5 0 0 1-11 0c0-2.4 1.1-4 2.4-5.2.2 1.6.9 2.7 2 3.2-.4-3.4.3-6.4 1.1-9z"
        fill={activa ? "var(--reward)" : "var(--surface)"}
        stroke={activa ? "var(--reward-dark)" : "var(--text-soft)"}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Moneda({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="var(--reward)" />
      <circle cx="12" cy="12" r="6.5" fill="none" stroke="var(--reward-dark)" strokeWidth="2" />
    </svg>
  );
}

export function Escudo({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 2.8l7.5 3v6c0 4.6-3.2 8.2-7.5 9.4C7.7 20 4.5 16.4 4.5 11.8v-6z" fill="var(--success)" stroke="var(--success-dark)" strokeWidth="1.6" />
      <path d="M8.5 12l2.3 2.3 4.7-4.7" fill="none" stroke="var(--text)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------- Racha y monedas ---------- */

export function Marcadores() {
  const e = useEstado();
  const dias = rachaVigente(e);
  const pausa = rachaEnPausa(e);
  return (
    <div className="flex items-center gap-4">
      <span className="flex items-center gap-1 font-black" aria-label={pausa ? "Racha en pausa" : `Racha de ${dias} días`}>
        <Llama activa={dias > 0} />
        <ContadorAnimado valor={dias} className={dias > 0 ? "text-reward-dark" : "text-text-soft"} />
      </span>
      <button
        type="button"
        onClick={() => navegar("/student/monedas")}
        className="-m-2 flex min-h-11 cursor-pointer items-center gap-1 p-2 font-black"
        aria-label={`${e.monedas} monedas. Ver en qué usarlas`}
      >
        <Moneda />
        <ContadorAnimado valor={e.monedas} />
      </button>
    </div>
  );
}

/* ---------- Barra inferior ---------- */

const PESTANAS = [
  { ruta: "/student/inicio", nombre: "Inicio", icono: "inicio" },
  { ruta: "/student/camino", nombre: "Camino", icono: "camino" },
  { ruta: "/student/cursos", nombre: "Cursos", icono: "cursos" },
  { ruta: "/student/metodos", nombre: "Métodos", icono: "metodos" },
  { ruta: "/student/entregas", nombre: "Entregas", icono: "entregas" },
  { ruta: "/student/perfil", nombre: "Perfil", icono: "perfil" },
] as const;

export function BarraInferior() {
  const ruta = useRuta();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t-2 border-surface bg-bg md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Secciones"
    >
      <div className="mx-auto flex max-w-md">
        {PESTANAS.map((p) => {
          const activa = ruta.startsWith(p.ruta);
          return (
            <button
              key={p.ruta}
              type="button"
              aria-current={activa ? "page" : undefined}
              onPointerDown={() => {
                sonidos.toque();
                vibrar("toque");
              }}
              onClick={() => navegar(p.ruta)}
              className={`flex h-16 min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 text-[12px] font-extrabold ${activa ? "text-brand" : "text-text-soft"}`}
            >
              <motion.span
                className={`grid h-8 w-11 place-items-center rounded-full ${activa ? "bg-surface" : ""}`}
                whileTap={{ scale: 0.88 }}
              >
                <Icono nombre={p.icono} />
              </motion.span>
              {p.nombre}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/** Marca de Auxi Student (ícono de León + nombre). */
export function MarcaStudent() {
  return (
    <span className="flex items-center gap-2.5">
      <img src="/icons/student-192.png" alt="" width={36} height={36} className="size-9 rounded-[10px]" />
      <span className="text-[19px] font-black tracking-tight">
        Auxi <span className="text-brand">Student</span>
      </span>
    </span>
  );
}

/**
 * En computadora: menú lateral fijo con la marca (abre el selector de apps), el botón para subir material,
 * las secciones y, abajo, la racha y las monedas.
 */
function MenuLateral() {
  const ruta = useRuta();
  return (
    <nav className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col gap-1.5 border-r-2 border-surface bg-card px-4 py-6 md:flex" aria-label="Secciones de Auxi Student">
      <div className="pb-4">
        <CambiarApp actual="student" variante="marca" marca={<MarcaStudent />} />
      </div>
      <motion.button
        type="button"
        onPointerDown={() => sonidos.toque()}
        onClick={() => navegar("/student/material")}
        whileTap={{ y: 3, boxShadow: "0 1px 0 var(--brand-dark)" }}
        style={{ boxShadow: "0 4px 0 var(--brand-dark)" }}
        className="mb-3 flex h-14 cursor-pointer items-center justify-center gap-2 rounded-[16px] bg-brand font-extrabold text-white"
      >
        <Icono nombre="mas" />
        Subir material
      </motion.button>
      {PESTANAS.map((p) => {
        const activa = ruta.startsWith(p.ruta);
        return (
          <button
            key={p.ruta}
            type="button"
            onPointerDown={() => sonidos.toque()}
            onClick={() => navegar(p.ruta)}
            aria-current={activa ? "page" : undefined}
            className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-[14px] px-3 font-extrabold ${activa ? "bg-surface text-brand" : "text-text-soft hover:bg-bg"}`}
          >
            <Icono nombre={p.icono} />
            {p.nombre}
          </button>
        );
      })}
      <div className="mt-auto rounded-[16px] bg-bg px-3 py-3">
        <Marcadores />
      </div>
    </nav>
  );
}

/* ---------- Estructura de pantalla ---------- */

/**
 * Marco de pantalla. Celular: columna angosta y barra abajo. Computadora (desde 768 px): menú lateral y
 * contenido más ancho; «amplio» deja usar dos columnas (por ejemplo, el inicio).
 */
export function Pantalla({
  titulo,
  children,
  conBarra = true,
  atras,
  derecha,
  amplio = false,
}: {
  titulo?: string;
  children: ReactNode;
  conBarra?: boolean;
  atras?: string;
  derecha?: ReactNode;
  amplio?: boolean;
}) {
  return (
    <div className={conBarra ? "md:pl-64" : ""}>
      <main
        className={`mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 px-5 md:px-8 ${amplio ? "md:max-w-5xl" : "md:max-w-2xl"}`}
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 16px)",
          paddingBottom: conBarra ? "calc(env(safe-area-inset-bottom) + 96px)" : "calc(env(safe-area-inset-bottom) + 20px)",
        }}
      >
        {(titulo || atras) && (
          <header className="flex items-center gap-2">
            {atras && (
              <button
                type="button"
                onClick={() => volver(atras)}
                aria-label="Volver"
                className="-ml-3 grid size-11 cursor-pointer place-items-center rounded-full text-text"
              >
                <Icono nombre="atras" />
              </button>
            )}
            {titulo && <h1 className="flex-1 text-titulo font-black">{titulo}</h1>}
            {derecha}
          </header>
        )}
        {children}
      </main>
      {conBarra && (
        <>
          <BarraInferior />
          <MenuLateral />
        </>
      )}
    </div>
  );
}
