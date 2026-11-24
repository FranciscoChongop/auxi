/**
 * Piezas comunes del boceto (solo desarrollo, /propuesta): tokens v4 con modo claro y oscuro,
 * contadores, barras, íconos chicos y la marca. Se vuelven el sistema de diseño real en la fase B.
 */
import { animate, motion, useReducedMotion } from "motion/react";
import { createContext, useContext, useEffect, useState } from "react";

export const NUNITO = "Nunito, ui-rounded, system-ui, sans-serif";

/* ---------- Tema ---------- */
export type Tema = "claro" | "oscuro";
export const TemaContexto = createContext<{ tema: Tema; alternar: () => void }>({ tema: "claro", alternar: () => {} });
export const useTema = () => useContext(TemaContexto);

/**
 * Tokens v4. El «espacio» (azul noche) es el escenario de las secciones de marca y no cambia con el tema;
 * el resto (fondo, superficies, texto) sí. Contrastes de texto ≥ 4,5 en ambos modos.
 */
export const ESTILOS = `
.pp { --tope: 0px;
  --bg:#F5F6FB; --tinta:#141A4D; --gris:#555B82; --linea:#DFE2F0; --blanco:#FFFFFF; --superficie-2:#EEF0FA;
  --cobalto:#2430D9; --boton:#2430D9; --boton-hondo:#1A23A6; --cobalto-hondo:#1A23A6; --lila:#ECEEFB;
  --teal:#0E5B57; --teal-texto:#0E5B57; --teal-hondo:#07403D; --menta:#F3FAF8; --menta-2:#DCF1EE;
  --turquesa:#5FE3DC; --oro:#F2B341; --oro-hondo:#C98A1C; --oro-suave:#FFF6E2; --oro-linea:#F2D9A2; --oro-texto:#6B4A0A;
  --indigo:#4A4EDB; --error:#C2412D; --tinte-student:#ECEEFB; --tinte-vida:#E3F3F1;
  --espacio:#0A0E2A; --espacio-2:#121844; --espacio-linea:rgba(255,255,255,.12);
  font-family: Figtree, system-ui, sans-serif; color: var(--tinta); background: var(--bg); font-weight: 500; font-size: 16px; line-height: 24px; }
.pp[data-tema="oscuro"] { color-scheme: dark;
  --bg:#080B22; --tinta:#EEF0FF; --gris:#A6ACD8; --linea:#252B5C; --blanco:#10153D; --superficie-2:#161C4B;
  --cobalto:#9CA3FF; --lila:#1A2056; --teal-texto:#6FE6DF; --menta:#08201F; --menta-2:#15403F;
  --oro-suave:rgba(242,179,65,.12); --oro-linea:rgba(242,179,65,.32); --oro-texto:#F5CD7A; --indigo:#9A9EFF;
  --tinte-student:#161C52; --tinte-vida:#0B2A2B; }
.pp h1, .pp h2, .pp h3, .pp .disp { font-family: ${NUNITO}; letter-spacing: -0.02em; }
.pp .h1 { font-size: 42px; line-height: 46px; font-weight: 900; }
.pp .h2 { font-size: 32px; line-height: 38px; font-weight: 900; }
.pp .h3 { font-size: 20px; line-height: 26px; font-weight: 800; }
.pp .cuerpo-l { font-size: 18px; line-height: 28px; color: var(--gris); }
.pp .chico { font-size: 14px; line-height: 20px; color: var(--gris); }
.pp .num { font-variant-numeric: tabular-nums; }
@container (min-width: 56rem) { .pp .h1 { font-size: 66px; line-height: 68px; } .pp .h2 { font-size: 46px; line-height: 50px; } }
.pp .btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; min-height:52px; padding:0 22px; border-radius:14px; font-family:${NUNITO}; font-weight:800; font-size:17px; cursor:pointer;
  box-shadow: 0 4px 0 var(--sombra, transparent); transition: transform .06s ease-out, box-shadow .06s ease-out, background-color .15s, border-color .15s; }
.pp .btn:active { transform: translateY(3px); box-shadow: 0 1px 0 var(--sombra, transparent); }
.pp .btn:focus-visible, .pp a:focus-visible, .pp button:focus-visible, .pp summary:focus-visible { outline: 3px solid var(--turquesa); outline-offset: 3px; }
.pp .btn-p { background: var(--boton); color:#fff; --sombra: var(--boton-hondo); }
.pp .btn-s { background: var(--blanco); color: var(--cobalto); border: 2px solid var(--linea); --sombra: var(--linea); }
.pp .btn-t { background: var(--teal); color:#fff; --sombra: var(--teal-hondo); }
.pp .btn-oro { background: var(--oro); color: #141A4D; --sombra: var(--oro-hondo); }
.pp .btn-b { background:#fff; color: #2430D9; --sombra: rgba(255,255,255,.35); }
.pp .btn-bt { background:#fff; color: #0E5B57; --sombra: #9CC9C3; }
.pp .btn-f { background: rgba(255,255,255,.06); color:#fff; border: 1.5px solid rgba(255,255,255,.35); backdrop-filter: blur(8px); }
.pp .btn-f:hover { background: rgba(255,255,255,.12); border-color: rgba(255,255,255,.6); }
.pp .caja { background: var(--blanco); border: 1px solid var(--linea); border-radius: 20px; }
.pp .vidrio { background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.14); backdrop-filter: blur(14px); }
/* Modo oscuro en las pantallas de las apps del boceto (las pantallas dentro de un celular siguen claras). */
.pp[data-tema="oscuro"] .bg-white:not(.telefono *) { background-color: var(--blanco); }
.pp[data-tema="oscuro"] .text-\\[color\\:var\\(--teal\\)\\] { color: var(--teal-texto); }
.pp[data-tema="oscuro"] .bg-\\[\\#FFF6E2\\]:not(.telefono *) { background-color: var(--oro-suave); }
.pp[data-tema="oscuro"] .ring-\\[\\#F2D9A2\\] { --tw-ring-color: var(--oro-linea); }
.pp[data-tema="oscuro"] .text-\\[\\#8A5A08\\] { color: var(--oro-texto); }
.pp[data-tema="oscuro"] .divide-\\[color\\:var\\(--linea\\)\\] > * + * { border-color: var(--linea); }
@media (prefers-reduced-motion: reduce) { .pp .btn { transition: none; } }
`;

/* ---------- Piezas con movimiento ---------- */

/** Número que cuenta hacia su valor (nunca salta). Quieto si se reduce el movimiento. */
export function Contador({ valor, desde = 0, prefijo = "", sufijo = "", retraso = 0, duracion = 0.9 }: { valor: number; desde?: number; prefijo?: string; sufijo?: string; retraso?: number; duracion?: number }) {
  const quieto = !!useReducedMotion();
  const [v, setV] = useState(quieto ? valor : desde);
  useEffect(() => {
    if (quieto) return setV(valor);
    const c = animate(desde, valor, { duration: duracion, delay: retraso, ease: "easeOut", onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [valor, desde, quieto, retraso, duracion]);
  return (
    <span className="num">
      {prefijo}
      {v}
      {sufijo}
    </span>
  );
}

/** Barra de avance que se llena con resorte al verse. */
export function Barra({ pct, color = "var(--boton)", fondo = "var(--lila)", alto = 10 }: { pct: number; color?: string; fondo?: string; alto?: number }) {
  return (
    <span className="block overflow-hidden rounded-full" style={{ height: alto, background: fondo }} aria-hidden="true">
      <motion.span className="block h-full rounded-full" style={{ background: color }} initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.2 }} />
    </span>
  );
}

export function Check({ color = "#2430D9", className = "size-5" }: { color?: string; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={`shrink-0 ${className}`} aria-hidden="true">
      <path d="M5 10.5l3 3 7-7" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Candado({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="5" y="10.5" width="14" height="10" rx="3" fill="currentColor" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
    </svg>
  );
}

/* ---------- Marca: el símbolo del logo (la A con su órbita) + «Auxi Studio» ---------- */
export function Marca({ chica = false, clara = false }: { chica?: boolean; clara?: boolean }) {
  const t = chica ? 34 : 40;
  const [simbolo, setSimbolo] = useState(true);
  return (
    <span className={`flex items-center gap-2.5 ${clara ? "text-white" : ""}`}>
      {simbolo ? (
        <img src="/marca/simbolo.webp" alt="" width={t} height={t} onError={() => setSimbolo(false)} draggable={false} className={clara ? "drop-shadow-[0_0_10px_rgba(95,227,220,.35)]" : ""} />
      ) : (
        <svg viewBox="0 0 40 40" width={t} height={t} aria-hidden="true">
          <circle cx="20" cy="20" r="13" fill="none" stroke={clara ? "#fff" : "#2430D9"} strokeWidth="2.4" strokeDasharray="3 4" strokeLinecap="round" />
          <circle cx="20" cy="20" r="5.5" fill="#F2B341" stroke="#C98A1C" strokeWidth="2" />
        </svg>
      )}
      <span className="leading-none">
        <span className="block text-[19px] font-black tracking-[-0.01em]" style={{ fontFamily: NUNITO }}>
          Auxi Studio
        </span>
        {!chica && <span className={`mt-1 block text-[12px] font-semibold ${clara ? "text-white/75" : "text-[color:var(--gris)]"}`}>por Daniel Chong</span>}
      </span>
    </span>
  );
}

/** Botón sol/luna para cambiar entre modo claro y oscuro. */
export function BotonTema({ clara = false }: { clara?: boolean }) {
  const { tema, alternar } = useTema();
  const oscuro = tema === "oscuro";
  return (
    <button
      type="button"
      onClick={alternar}
      aria-pressed={oscuro}
      aria-label={oscuro ? "Usar modo claro" : "Usar modo oscuro"}
      className={`grid size-11 place-items-center rounded-full transition-colors ${clara ? "text-white hover:bg-white/10" : "text-[color:var(--tinta)] hover:bg-[color:var(--superficie-2)]"}`}
    >
      <motion.svg key={tema} viewBox="0 0 24 24" className="size-5" initial={{ rotate: -40, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.25 }} aria-hidden="true">
        {oscuro ? (
          <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </g>
        ) : (
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        )}
      </motion.svg>
    </button>
  );
}
