import { animate, AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { ContadorAnimado } from "../components/ContadorAnimado";
import { Llama, Moneda } from "../components/Navegacion";
import { lanzarConfeti, COLORES_VIDA } from "../lib/confeti";
import { navegar, reemplazar, useRuta, volver } from "../lib/rutas";
import { sonidos } from "../lib/sonidos";
import { vibrar } from "../lib/vibrar";
import { enEjemplo, NOMBRE_VIDA, obtenerVida, rachaVigente, salirDelEjemplo, soles, useVida } from "./estado";

/** Confeti solo para logros de verdad (meta cumplida). Nunca por gastar. */
export const confetiVida = () => {
  if (!obtenerVida().menosMovimiento) void lanzarConfeti(COLORES_VIDA);
};

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

/** Cara de la hoja B8 en un círculo (avatar del chat y de pantallas de trabajo). */
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
  const texto = mostrado === valor ? soles(valor) : soles(Math.round(mostrado));
  return (
    <span className={`numeros ${className}`} aria-live="polite">
      {valor < 0 ? "− " : ""}
      {texto}
    </span>
  );
}

/** Frasco de ahorro: se llena con resorte y le caen monedas cuando sube. */
export function Frasco({ avance, tamano = 120, lluvia = 0 }: { avance: number; tamano?: number; lluvia?: number }) {
  const v = Math.max(0, Math.min(1, avance));
  const alto = 88 * v;
  return (
    <div className="relative shrink-0" style={{ width: tamano, height: tamano * 1.2 }}>
      <svg viewBox="0 0 100 120" className="size-full" role="img" aria-label={`Frasco al ${Math.round(v * 100)} %`}>
        <defs>
          <clipPath id="frasco-interior">
            <path d="M22 26h56v80a8 8 0 0 1-8 8H30a8 8 0 0 1-8-8z" />
          </clipPath>
        </defs>
        <rect x="28" y="8" width="44" height="14" rx="4" fill="var(--reward)" stroke="var(--reward-dark)" strokeWidth="2.5" />
        <path d="M22 26h56v80a8 8 0 0 1-8 8H30a8 8 0 0 1-8-8z" fill="var(--card)" />
        <g clipPath="url(#frasco-interior)">
          <motion.rect x="22" width="56" fill="var(--reward)" initial={false} animate={{ y: 114 - alto, height: alto }} transition={{ type: "spring", stiffness: 140, damping: 18 }} />
        </g>
        <path d="M22 26h56v80a8 8 0 0 1-8 8H30a8 8 0 0 1-8-8z" fill="none" stroke="var(--brand)" strokeWidth="3" />
        <path d="M30 36v50" stroke="white" strokeOpacity="0.7" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <AnimatePresence>
        {Array.from({ length: lluvia > 0 ? 4 : 0 }).map((_, i) => (
          <motion.span
            key={`${lluvia}-${i}`}
            className="pointer-events-none absolute left-1/2"
            style={{ marginLeft: (i - 1.5) * 12 - 10 }}
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

/* ---------- Marca, marcadores y perfil ---------- */

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
      <span className="flex items-center gap-1 font-black" aria-label={`${e.monedas} monedas`}>
        <Moneda />
        <ContadorAnimado valor={e.monedas} />
      </span>
    </div>
  );
}

export function BotonPerfil() {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      onPointerDown={() => sonidos.toque()}
      onClick={() => navegar("/vida/perfil")}
      aria-label="Perfil y ajustes"
      className="grid size-11 cursor-pointer place-items-center rounded-full border-2 border-surface bg-card text-brand"
    >
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
        <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <circle cx="12" cy="8.5" r="4" />
          <path d="M4.5 20.5c1.2-3.8 4.2-5.5 7.5-5.5s6.3 1.7 7.5 5.5" />
        </g>
      </svg>
    </motion.button>
  );
}

/** Cabecera de las secciones principales: título a la izquierda; racha, monedas y perfil a la derecha. */
export function Cabecera({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 md:px-8" style={{ paddingTop: "calc(env(safe-area-inset-top) + 14px)" }}>
      <div className="min-w-0">{children}</div>
      <div className="flex shrink-0 items-center gap-3">
        <MarcadoresVida />
        <BotonPerfil />
      </div>
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
        onClick={alVolver ?? (() => volver("/vida/hoy"))}
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

/**
 * Marco de pantalla. Con navegación: barra abajo en el celular y menú lateral en computadora.
 * "amplio" deja usar dos columnas en pantallas grandes; los formularios quedan estrechos.
 */
export function Pagina({ children, conBarra = false, amplio = false, className = "" }: { children: ReactNode; conBarra?: boolean; amplio?: boolean; className?: string }) {
  return (
    <div className={conBarra ? "md:pl-64" : ""}>
      <BannerEjemplo />
      <div className={`mx-auto min-h-dvh w-full ${amplio ? "max-w-md md:max-w-5xl" : "max-w-md"} ${className}`} style={{ paddingBottom: conBarra ? "calc(env(safe-area-inset-bottom) + 96px)" : undefined }}>
        {children}
      </div>
      {conBarra && (
        <>
          <BarraVida />
          <MenuLateral />
        </>
      )}
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

function BannerEjemplo() {
  useVida();
  if (!enEjemplo()) return null;
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-reward px-4 py-2 text-[15px] font-extrabold text-text" role="status">
      <span>Estás viendo un ejemplo. Nada se guarda.</span>
      <button
        type="button"
        onClick={() => {
          salirDelEjemplo();
          reemplazar(obtenerVida().iniciado ? "/vida/hoy" : "/vida");
        }}
        className="min-h-11 cursor-pointer rounded-full bg-card px-3"
      >
        Salir
      </button>
    </div>
  );
}

/* ---------- Navegación: Hoy · Movimientos · + Registrar · Metas · Protégete ---------- */

const trazo = { fill: "none", stroke: "currentColor", strokeWidth: 2.4, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const ICONOS = {
  hoy: (
    <g {...trazo}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
    </g>
  ),
  movimientos: <path {...trazo} d="M7 4v16M7 20l-3-3M7 20l3-3M17 20V4M17 4l-3 3M17 4l3 3" />,
  metas: (
    <g {...trazo}>
      <path d="M7 3.5h10M8 3.5v3l-2.5 3V19a1.5 1.5 0 0 0 1.5 1.5h10a1.5 1.5 0 0 0 1.5-1.5V9.5L16 6.5v-3" />
      <path d="M5.5 13h13" />
    </g>
  ),
  protegete: (
    <g {...trazo}>
      <path d="M12 3l7.5 3v5.5c0 4.5-3.2 8-7.5 9.5-4.3-1.5-7.5-5-7.5-9.5V6z" />
      <path d="M8.8 12l2.2 2.2 4.2-4.4" />
    </g>
  ),
  mas: <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />,
};

const SECCIONES = [
  { ruta: "/vida/hoy", nombre: "Hoy", icono: "hoy" },
  { ruta: "/vida/movimientos", nombre: "Movimientos", icono: "movimientos" },
  { ruta: "/vida/metas", nombre: "Metas", icono: "metas" },
  { ruta: "/vida/protegete", nombre: "Protégete", icono: "protegete" },
] as const;

const tocar = () => {
  sonidos.toque();
  vibrar("toque");
};

function Pestana({ s, activa }: { s: (typeof SECCIONES)[number]; activa: boolean }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      onPointerDown={tocar}
      onClick={() => navegar(s.ruta)}
      aria-current={activa ? "page" : undefined}
      className={`flex min-h-14 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-[16px] text-[11.5px] font-extrabold ${activa ? "text-brand" : "text-text-soft"}`}
    >
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
        {ICONOS[s.icono]}
      </svg>
      {s.nombre}
      <motion.span className="h-1 w-5 rounded-full bg-brand" initial={false} animate={{ opacity: activa ? 1 : 0, scaleX: activa ? 1 : 0.3 }} />
    </motion.button>
  );
}

export function BarraVida() {
  const ruta = useRuta();
  const items = [SECCIONES[0], SECCIONES[1], null, SECCIONES[2], SECCIONES[3]];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md px-3 md:hidden" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 8px)" }} aria-label="Secciones de Vida">
      <div className="grid grid-cols-5 items-end rounded-[22px] border-2 border-surface bg-card p-1 shadow-[0_6px_24px_rgba(14,91,87,0.10)]">
        {items.map((s, i) =>
          s ? (
            <Pestana key={s.ruta} s={s} activa={ruta.startsWith(s.ruta)} />
          ) : (
            <div key={i} className="flex flex-col items-center">
              <motion.button
                type="button"
                onPointerDown={tocar}
                onClick={() => navegar("/vida/registrar")}
                whileTap={{ y: 3, boxShadow: "0 1px 0 var(--brand-dark)" }}
                style={{ boxShadow: "0 4px 0 var(--brand-dark)" }}
                className="-mt-7 grid size-16 cursor-pointer place-items-center rounded-full border-4 border-bg bg-brand text-white"
                aria-label="Registrar un gasto o ingreso"
              >
                <svg viewBox="0 0 24 24" className="size-7" aria-hidden="true">
                  {ICONOS.mas}
                </svg>
              </motion.button>
              <span className="pb-1 text-[11.5px] font-extrabold text-text-soft" aria-hidden="true">
                Registrar
              </span>
            </div>
          ),
        )}
      </div>
    </nav>
  );
}

/** En computadora: menú lateral con la marca, el botón de registrar y las secciones. */
function MenuLateral() {
  const ruta = useRuta();
  return (
    <nav className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col gap-2 border-r-2 border-surface bg-card px-4 py-6 md:flex" aria-label="Secciones de Vida">
      <div className="px-2 pb-4">
        <MarcaVida />
      </div>
      <motion.button
        type="button"
        onPointerDown={tocar}
        onClick={() => navegar("/vida/registrar")}
        whileTap={{ y: 3, boxShadow: "0 1px 0 var(--brand-dark)" }}
        style={{ boxShadow: "0 4px 0 var(--brand-dark)" }}
        className="mb-3 flex h-14 cursor-pointer items-center justify-center gap-2 rounded-[16px] bg-brand font-extrabold text-white"
      >
        <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
          {ICONOS.mas}
        </svg>
        Registrar
      </motion.button>
      {SECCIONES.map((s) => {
        const activa = ruta.startsWith(s.ruta);
        return (
          <button
            key={s.ruta}
            type="button"
            onPointerDown={tocar}
            onClick={() => navegar(s.ruta)}
            aria-current={activa ? "page" : undefined}
            className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-[14px] px-3 font-extrabold ${activa ? "bg-surface text-brand" : "text-text-soft hover:bg-bg"}`}
          >
            <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
              {ICONOS[s.icono]}
            </svg>
            {s.nombre}
          </button>
        );
      })}
      <button
        type="button"
        onClick={() => navegar("/vida/perfil")}
        className={`mt-auto flex min-h-12 cursor-pointer items-center gap-3 rounded-[14px] px-3 font-extrabold ${ruta.startsWith("/vida/perfil") ? "bg-surface text-brand" : "text-text-soft hover:bg-bg"}`}
      >
        <CaraLeonVida cara="feliz" tamano={32} />
        Perfil y ajustes
      </button>
    </nav>
  );
}

/* ---------- Controles ---------- */

/** Chip de selección. Con `radio`, se anuncia como opción única de un grupo. */
export function Chip({ activo, children, onClick, radio = false }: { activo: boolean; children: ReactNode; onClick: () => void; radio?: boolean }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      onPointerDown={() => sonidos.toque()}
      onClick={onClick}
      role={radio ? "radio" : undefined}
      aria-checked={radio ? activo : undefined}
      aria-pressed={radio ? undefined : activo}
      className={`min-h-11 cursor-pointer rounded-full border-2 px-4 text-[15px] font-extrabold transition-colors ${activo ? "border-brand bg-brand text-white" : "border-surface bg-card text-text"}`}
    >
      {children}
    </motion.button>
  );
}

export function GrupoUnico({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div role="radiogroup" aria-label={etiqueta} className="flex flex-wrap gap-2">
      {children}
    </div>
  );
}

/** Campo de monto con "S/" fijo y teclado numérico. El error aparece junto al campo. */
export function CampoSoles({ valor, alCambiar, etiqueta, autoFocus = false, error }: { valor: string; alCambiar: (v: string) => void; etiqueta: string; autoFocus?: boolean; error?: string | null }) {
  return (
    <label className="block">
      <span className="text-ayuda font-extrabold text-text-soft">{etiqueta}</span>
      <span className={`mt-1 flex h-16 items-center gap-2 rounded-[16px] border-2 bg-card px-4 focus-within:border-brand ${error ? "border-error" : "border-surface"}`}>
        <span className="text-[24px] font-black text-text-soft">S/</span>
        <input
          inputMode="decimal"
          autoFocus={autoFocus}
          value={valor}
          onChange={(e) => alCambiar(e.target.value.replace(/[^\d.,]/g, "").replace(",", "."))}
          placeholder="0"
          className="numeros w-full bg-transparent text-[28px] font-black text-text outline-none placeholder:text-text-soft/50"
          aria-label={etiqueta}
          aria-invalid={!!error}
        />
      </span>
      {error && <span className="mt-1 block text-ayuda font-bold text-error">{error}</span>}
    </label>
  );
}

export const aNumero = (v: string) => {
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : 0;
};

export const campoTexto = "mt-1 h-14 w-full rounded-[16px] border-2 border-surface bg-card px-4 outline-none placeholder:text-text-soft focus:border-brand";

/* ---------- Aviso con "Deshacer" ---------- */

type Deshacible = { id: number; texto: string; deshacer?: () => void };
let actual: Deshacible | null = null;
const oyentesD = new Set<() => void>();
let temporizador: ReturnType<typeof setTimeout> | undefined;

/** Muestra un aviso abajo; si trae `deshacer`, ofrece el botón por 6 segundos. */
export function avisoDeshacer(texto: string, deshacer?: () => void) {
  actual = { id: Date.now(), texto, deshacer };
  oyentesD.forEach((o) => o());
  clearTimeout(temporizador);
  temporizador = setTimeout(() => {
    actual = null;
    oyentesD.forEach((o) => o());
  }, 6000);
}

export function AvisoDeshacer() {
  const a = useSyncExternalStore(
    (o) => {
      oyentesD.add(o);
      return () => oyentesD.delete(o);
    },
    () => actual,
  );
  return (
    <div className="pointer-events-none fixed inset-x-0 z-40 mx-auto max-w-md px-4 md:left-64" style={{ bottom: "calc(env(safe-area-inset-bottom) + 104px)" }} aria-live="polite">
      <AnimatePresence>
        {a && (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="pointer-events-auto flex items-center justify-between gap-3 rounded-[16px] bg-text px-4 py-2 text-white shadow-lg"
          >
            <span className="font-bold">{a.texto}</span>
            {a.deshacer && (
              <button
                type="button"
                onClick={() => {
                  a.deshacer?.();
                  actual = null;
                  oyentesD.forEach((o) => o());
                  sonidos.toque();
                }}
                className="min-h-11 cursor-pointer px-2 font-extrabold text-success"
              >
                Deshacer
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Tarjeta descartable: se cierra con X y no vuelve a salir. */
export function TarjetaAviso({ children, alCerrar, tono = "suave" }: { children: ReactNode; alCerrar: () => void; tono?: "suave" | "oro" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className={`relative overflow-hidden rounded-[20px] p-4 pr-12 ${tono === "oro" ? "bg-reward/30" : "bg-surface"}`}
    >
      {children}
      <button type="button" onClick={alCerrar} aria-label="Cerrar" className="absolute top-2 right-2 grid size-11 cursor-pointer place-items-center rounded-full text-text-soft">
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </button>
    </motion.div>
  );
}

export { soles };
