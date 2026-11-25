import { motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { navegar } from "../lib/rutas";
import { sonidos } from "../lib/sonidos";
import { Ventana } from "./Ventana";

/**
 * Selector de apps: salta entre Auxi Student, Auxi Vida, el inicio de Auxi Studio y la presentación,
 * desde cualquier pantalla. En celular es un botón con cuadritos; en computadora va en la marca del menú lateral.
 */
type AppActual = "student" | "vida";

const APPS: { id: AppActual | "negocio"; nombre: string; ayuda: string; icono: string; ruta: string; externa?: boolean }[] = [
  { id: "student", nombre: "Auxi Student", ayuda: "Estudia jugando", icono: "/icons/student-192.png", ruta: "/student/inicio" },
  { id: "vida", nombre: "Auxi Vida", ayuda: "Tu plata día a día", icono: "/icons/vida-192.png", ruta: "/vida" },
  { id: "negocio", nombre: "Vendoe", ayuda: "Para tu negocio · se abre aparte", icono: "/brand/vendoe.svg", ruta: "/negocio", externa: true },
];

function IconoCuadritos({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <g fill="currentColor">
        {[5, 12, 19].flatMap((y) => [5, 12, 19].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2.1" />))}
      </g>
    </svg>
  );
}

function Opcion({ icono, titulo, ayuda, actual, onClick, href }: { icono: ReactNode; titulo: string; ayuda: string; actual?: boolean; onClick?: () => void; href?: string }) {
  const contenido = (
    <>
      <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-[14px] bg-surface">{icono}</span>
      <span className="min-w-0 flex-1">
        <span className="block font-extrabold">{titulo}</span>
        <span className="block text-ayuda text-text-soft">{ayuda}</span>
      </span>
      {actual ? <span className="text-ayuda font-extrabold text-brand">Estás aquí</span> : <span className="text-[20px] text-text-soft">›</span>}
    </>
  );
  const clase = `flex min-h-16 w-full cursor-pointer items-center gap-3 rounded-[16px] px-2 text-left ${actual ? "bg-surface/60" : "hover:bg-surface/50"}`;
  return href ? (
    <a href={href} className={clase}>
      {contenido}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={clase} aria-current={actual ? "page" : undefined}>
      {contenido}
    </button>
  );
}

export function CambiarApp({ actual, variante = "icono", marca }: { actual: AppActual; variante?: "icono" | "marca"; marca?: ReactNode }) {
  const [abierta, setAbierta] = useState(false);
  const ir = (ruta: string) => {
    setAbierta(false);
    navegar(ruta);
  };

  return (
    <>
      {variante === "icono" ? (
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onPointerDown={() => sonidos.toque()}
          onClick={() => setAbierta(true)}
          aria-label="Cambiar de app"
          className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full text-text-soft hover:bg-surface"
        >
          <IconoCuadritos />
        </motion.button>
      ) : (
        <button
          type="button"
          onClick={() => setAbierta(true)}
          aria-label="Cambiar de app"
          className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-[14px] px-2 py-2 text-left hover:bg-bg"
        >
          {marca}
          <span className="grid size-8 place-items-center rounded-full text-text-soft">
            <IconoCuadritos className="size-5" />
          </span>
        </button>
      )}

      <Ventana abierta={abierta} alCerrar={() => setAbierta(false)} titulo="Tus apps">
        <div className="flex flex-col gap-1">
          {APPS.map((a) =>
            a.externa ? (
              <Opcion key={a.id} href={a.ruta} icono={<img src={a.icono} alt="" className="size-8" />} titulo={a.nombre} ayuda={a.ayuda} />
            ) : (
              <Opcion
                key={a.id}
                icono={<img src={a.icono} alt="" className="size-12" />}
                titulo={a.nombre}
                ayuda={a.ayuda}
                actual={a.id === actual}
                onClick={() => (a.id === actual ? setAbierta(false) : ir(a.ruta))}
              />
            ),
          )}
        </div>
        <div className="mt-3 flex flex-col gap-1 border-t-2 border-surface pt-3">
          <Opcion icono={<img src="/icons/icon-192.png" alt="" className="size-12" />} titulo="Inicio de Auxi Studio" ayuda="Todas tus apps en un lugar" onClick={() => ir("/")} />
          <Opcion
            icono={<img src="/marca/simbolo.webp" alt="" className="size-8" />}
            titulo="Presentación de Auxi Studio"
            ayuda="La página de bienvenida"
            onClick={() => ir("/?portada")}
          />
        </div>
      </Ventana>
    </>
  );
}
