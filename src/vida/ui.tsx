import { animate, AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ContadorAnimado } from "../components/ContadorAnimado";
import { Llama, Moneda } from "../components/Navegacion";
import { lanzarConfeti, COLORES_VIDA } from "../lib/confeti";
import { navegar, useRuta, volver } from "../lib/rutas";
import { sonidos } from "../lib/sonidos";
import { vibrar } from "../lib/vibrar";
import { NOMBRE_VIDA, rachaVigente, soles, useVida } from "./estado";

export const confetiVida = () => lanzarConfeti(COLORES_VIDA);

/* ---------- León en Vida (imágenes fijas B1 a B9) ---------- */

export const POSES_VIDA = {
  saluda: { archivo: "B1-saluda", alt: "León te saluda con su moneda" },
  celebra: { archivo: "B2-celebra", alt: "León celebra" },
  alcancia: { archivo: "B3-alcancia", alt: "León guarda una moneda en la alcancía" },
  detective: { archivo: "B4-detective", alt: "León revisa con su lupa" },
  alerta: { archivo: "B5-alerta", alt: "León te pide calma" },
  anima: { archivo: "B6-anima", alt: "León te anima" },
  celular: { archivo: "B7-celular", alt: "León habla al celular" },
  icono: { archivo: "B9-icono", alt: "León" },
} as const;

export type PoseVida = keyof typeof POSES_VIDA;

export function LeonVida({ pose, alto = 180, rebote = false, className = "" }: { pose: PoseVida; alto?: number; rebote?: boolean; className?: string }) {
  const [falla, setFalla] = useState(false);
  const { archivo, alt } = POSES_VIDA[pose];
  return (
    <motion.div
      className={`flex justify-center ${className}`}
      style={{ height: alto }}
      initial={rebote ? { opacity: 0, scale: 0.85, y: 12 } : { opacity: 0 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={rebote ? { type: "spring", stiffness: 420, damping: 14 } : { duration: 0.24 }}
    >
      {falla ? (
        <div className="grid aspect-square h-full max-h-40 place-items-center rounded-full bg-brand font-black text-white" role="img" aria-label="León">
          León
        </div>
      ) : (
        <img
          src={`/leon/vida/${archivo}.webp`}
          alt={alt}
          onError={() => setFalla(true)}
          className={`h-full w-auto object-contain ${pose === "icono" ? "rounded-[22%]" : ""}`}
          decoding="async"
          draggable={false}
        />
      )}
    </motion.div>
  );
}

export type CaraVida = "feliz" | "risa" | "sorpresa" | "serio" | "tierno" | "curioso";

/** Avatar del chat: cara de la hoja B8 en un círculo de 40 px. */
export function CaraLeonVida({ cara = "feliz", tamano = 40 }: { cara?: CaraVida; tamano?: number }) {
  return (
    <span className="inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-surface" style={{ width: tamano, height: tamano }}>
      <img src={`/leon/vida/caras/${cara}.webp`} alt="" className="size-full object-cover" style={{ objectPosition: "50% 20%" }} draggable={false} />
    </span>
  );
}

/* ---------- Plata ---------- */

/** Monto en soles que cuenta hacia el nuevo valor (600 ms), con decimales solo si hacen falta. */
export function Soles({ valor, className = "" }: { valor: number; className?: string }) {
  const [mostrado, setMostrado] = useState(valor);
  const anterior = useRef(valor);
  const reducido = useReducedMotion();
  useEffect(() => {
    const desde = anterior.current;
    anterior.current = valor;
    if (reducido || desde === valor) {
      setMostrado(valor);
      return;
    }
    const c = animate(desde, valor, { duration: 0.6, ease: "easeOut", onUpdate: setMostrado });
    return () => c.stop();
  }, [valor, reducido]);
  // Mientras cuenta se muestran enteros; al final, el valor exacto.
  const texto = mostrado === valor ? soles(valor) : soles(Math.round(mostrado));
  return (
    <span className={`numeros ${className}`} aria-live="polite">
      {valor < 0 ? "− " : ""}
      {texto}
    </span>
  );
}

/** Frasco del colchón: se llena con resorte y le caen monedas cuando sube. */
export function Frasco({ avance, tamano = 120, lluvia = 0 }: { avance: number; tamano?: number; lluvia?: number }) {
  const v = Math.max(0, Math.min(1, avance));
  const alto = 92 * v;
  return (
    <div className="relative" style={{ width: tamano, height: tamano * 1.2 }}>
      <svg viewBox="0 0 100 120" className="size-full" role="img" aria-label={`Colchón al ${Math.round(v * 100)} %`}>
        <defs>
          <clipPath id="frasco-interior">
            <path d="M22 26h56v80a8 8 0 0 1-8 8H30a8 8 0 0 1-8-8z" />
          </clipPath>
        </defs>
        <rect x="28" y="8" width="44" height="14" rx="4" fill="var(--reward)" stroke="var(--reward-dark)" strokeWidth="2.5" />
        <path d="M22 26h56v80a8 8 0 0 1-8 8H30a8 8 0 0 1-8-8z" fill="var(--card)" />
        <g clipPath="url(#frasco-interior)">
          <motion.rect
            x="22"
            width="56"
            fill="var(--reward)"
            initial={false}
            animate={{ y: 114 - alto, height: alto }}
            transition={{ type: "spring", stiffness: 140, damping: 18 }}
          />
          {v > 0.08 &&
            [0, 1, 2].map((i) => (
              <motion.circle key={i} cx={34 + i * 16} r="5" fill="none" stroke="var(--reward-dark)" strokeWidth="2" initial={false} animate={{ cy: Math.min(108, 120 - alto + 10 + i * 4) }} />
            ))}
        </g>
        <path d="M22 26h56v80a8 8 0 0 1-8 8H30a8 8 0 0 1-8-8z" fill="none" stroke="var(--brand)" strokeWidth="3" />
        <path d="M30 36v50" stroke="white" strokeOpacity="0.7" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <AnimatePresence>
        {Array.from({ length: lluvia > 0 ? 5 : 0 }).map((_, i) => (
          <motion.span
            key={`${lluvia}-${i}`}
            className="pointer-events-none absolute left-1/2"
            style={{ marginLeft: (i - 2) * 12 - 10 }}
            initial={{ y: -tamano * 0.9, opacity: 0, rotate: -30 }}
            animate={{ y: tamano * 0.45, opacity: [0, 1, 1, 0], rotate: 20 }}
            transition={{ duration: 0.7, delay: i * 0.09, ease: "easeIn" }}
          >
            <Moneda className="size-5" />
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Estructura de pantalla ---------- */

/** Marca de Vida: moneda + "Auxi Vida". Así se distingue de Studio de un vistazo. */
export function MarcaVida() {
  const [auxi, ...resto] = NOMBRE_VIDA.split(" ");
  return (
    <span className="flex items-center gap-2 text-[19px] font-black tracking-tight">
      <span className="grid size-8 place-items-center rounded-full bg-reward shadow-[0_2px_0_var(--reward-dark)]">
        <span className="size-3.5 rounded-full border-[2.5px] border-reward-dark" />
      </span>
      <span>
        {auxi} <span className="text-brand">{resto.join(" ")}</span>
      </span>
    </span>
  );
}

export function MarcadoresVida() {
  const e = useVida();
  const dias = rachaVigente(e);
  return (
    <div className="flex items-center gap-3">
      <span className="flex items-center gap-1 font-black" aria-label={`Racha de ${dias} días anotando`}>
        <Llama activa={dias > 0} />
        <ContadorAnimado valor={dias} className={dias > 0 ? "text-reward-dark" : "text-text-soft"} />
      </span>
      <button
        type="button"
        onClick={() => navegar("/vida/perfil")}
        className="-m-2 flex min-h-11 cursor-pointer items-center gap-1 p-2 font-black"
        aria-label={`${e.monedas} monedas`}
      >
        <Moneda />
        <ContadorAnimado valor={e.monedas} />
      </button>
    </div>
  );
}

/** Encabezado de pantallas internas: flecha atrás + título. */
export function Encabezado({ titulo, alVolver }: { titulo: string; alVolver?: () => void }) {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-2 bg-bg/95 px-3 pb-2 backdrop-blur" style={{ paddingTop: "calc(env(safe-area-inset-top) + 8px)" }}>
      <motion.button
        type="button"
        whileTap={{ scale: 0.88 }}
        onPointerDown={() => sonidos.toque()}
        onClick={alVolver ?? (() => volver("/vida/inicio"))}
        aria-label="Volver"
        className="grid size-11 cursor-pointer place-items-center rounded-full text-text"
      >
        <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
          <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.button>
      <h1 className="text-tarjeta font-extrabold">{titulo}</h1>
    </header>
  );
}

export function Pagina({ children, conBarra = false, className = "" }: { children: ReactNode; conBarra?: boolean; className?: string }) {
  return (
    <div className={`mx-auto min-h-dvh w-full max-w-md ${className}`} style={{ paddingBottom: conBarra ? "calc(env(safe-area-inset-bottom) + 96px)" : undefined }}>
      {children}
      {conBarra && <BarraVida />}
    </div>
  );
}

/** Zona fija abajo para el botón principal (al alcance del pulgar). */
export function PieFijo({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 mt-auto bg-gradient-to-t from-bg from-70% to-transparent px-5 pt-6" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}>
      {children}
    </div>
  );
}

/* ---------- Barra inferior con botón central "+" ---------- */

const trazo = { fill: "none", stroke: "currentColor", strokeWidth: 2.4, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const ICONOS = {
  inicio: (
    <g {...trazo}>
      <rect x="3.5" y="6" width="17" height="13" rx="3" />
      <path d="M3.5 10.5h17M15 15h2" />
    </g>
  ),
  aprender: <path {...trazo} d="M12 6.5c-2-1.6-5-2-8-1.5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6-.1-8 1.5zM12 6.5V19" />,
  alertas: (
    <g {...trazo}>
      <path d="M12 3l7.5 3v5.5c0 4.5-3.2 8-7.5 9.5-4.3-1.5-7.5-5-7.5-9.5V6z" />
      <path d="M12 8.5v4M12 16h.01" />
    </g>
  ),
  perfil: (
    <g {...trazo}>
      <circle cx="12" cy="8.5" r="4" />
      <path d="M4.5 20.5c1.2-3.8 4.2-5.5 7.5-5.5s6.3 1.7 7.5 5.5" />
    </g>
  ),
};

const PESTANAS = [
  { ruta: "/vida/inicio", nombre: "Inicio", icono: "inicio" },
  { ruta: "/vida/aprender", nombre: "Aprender", icono: "aprender" },
  null,
  { ruta: "/vida/alertas", nombre: "Alertas", icono: "alertas" },
  { ruta: "/vida/perfil", nombre: "Perfil", icono: "perfil" },
] as const;

export function BarraVida() {
  const ruta = useRuta();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md px-3" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 8px)" }} aria-label="Secciones de Vida">
      <div className="grid grid-cols-5 items-end rounded-[22px] border-2 border-surface bg-card px-1 pt-1 pb-1 shadow-[0_6px_24px_rgba(14,91,87,0.10)]">
        {PESTANAS.map((p, i) => {
          if (!p)
            return (
              <div key={i} className="flex justify-center">
                <motion.button
                  type="button"
                  onPointerDown={() => {
                    sonidos.toque();
                    vibrar("toque");
                  }}
                  onClick={() => navegar("/vida/anotar")}
                  whileTap={{ y: 3, boxShadow: "0 1px 0 var(--brand-dark)" }}
                  style={{ boxShadow: "0 4px 0 var(--brand-dark)" }}
                  className="-mt-7 grid size-16 cursor-pointer place-items-center rounded-full border-4 border-bg bg-brand text-white"
                  aria-label="Anotar un gasto o ingreso"
                >
                  <svg viewBox="0 0 24 24" className="size-7" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
                  </svg>
                </motion.button>
              </div>
            );
          const activa = ruta.startsWith(p.ruta);
          return (
            <motion.button
              key={p.ruta}
              type="button"
              whileTap={{ scale: 0.9 }}
              onPointerDown={() => {
                sonidos.toque();
                vibrar("toque");
              }}
              onClick={() => navegar(p.ruta)}
              aria-current={activa ? "page" : undefined}
              className={`flex min-h-14 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-[16px] text-[12px] font-extrabold ${activa ? "text-brand" : "text-text-soft"}`}
            >
              <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
                {ICONOS[p.icono]}
              </svg>
              {p.nombre}
              <motion.span className="h-1 w-5 rounded-full bg-brand" initial={false} animate={{ opacity: activa ? 1 : 0, scaleX: activa ? 1 : 0.3 }} />
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}

/** Chips de selección rápida (se hunden al tocar). */
export function Chip({ activo, children, onClick }: { activo: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      onPointerDown={() => sonidos.toque()}
      onClick={onClick}
      aria-pressed={activo}
      className={`min-h-11 cursor-pointer rounded-full border-2 px-4 text-[15px] font-extrabold transition-colors ${activo ? "border-brand bg-brand text-white" : "border-surface bg-card text-text"}`}
    >
      {children}
    </motion.button>
  );
}

/** Campo de monto con "S/" fijo y teclado numérico. */
export function CampoSoles({ valor, alCambiar, etiqueta, autoFocus = false }: { valor: string; alCambiar: (v: string) => void; etiqueta: string; autoFocus?: boolean }) {
  return (
    <label className="block">
      <span className="text-ayuda font-extrabold text-text-soft">{etiqueta}</span>
      <span className="mt-1 flex h-16 items-center gap-2 rounded-[16px] border-2 border-surface bg-card px-4 focus-within:border-brand">
        <span className="text-[24px] font-black text-text-soft">S/</span>
        <input
          inputMode="decimal"
          autoFocus={autoFocus}
          value={valor}
          onChange={(e) => alCambiar(e.target.value.replace(/[^\d.,]/g, "").replace(",", "."))}
          placeholder="0"
          className="numeros w-full bg-transparent text-[28px] font-black text-text outline-none placeholder:text-text-soft/50"
          aria-label={etiqueta}
        />
      </span>
    </label>
  );
}

export const aNumero = (v: string) => {
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : 0;
};
