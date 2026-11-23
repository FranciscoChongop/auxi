import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, useState, type ReactNode } from "react";

export type Tono = "hero" | "student" | "vida" | "vendoe" | "cuenta" | "autor";

type Forma = { t: "circulo" | "anillo" | "cuadro" | "estrella" | "moneda"; x: number; y: number; s: number; c: string; d?: number; r?: number };

/** Fondo de respaldo de cada banner: se ve mientras no exista su imagen en /plataforma/<nombre>.webp. */
const ARTE: Record<Tono, { fondo: string; formas: Forma[] }> = {
  hero: {
    fondo: "linear-gradient(160deg,#0B1140 0%,#1A23A6 58%,#0E5B57 100%)",
    formas: [
      { t: "estrella", x: 8, y: 14, s: 16, c: "#F2B341" },
      { t: "estrella", x: 86, y: 20, s: 22, c: "#fff", d: 1 },
      { t: "estrella", x: 74, y: 74, s: 14, c: "#5FE3DC", d: 2 },
      { t: "estrella", x: 14, y: 70, s: 12, c: "#fff", d: 0.6 },
      { t: "circulo", x: 90, y: 56, s: 10, c: "#5FE3DC" },
      { t: "anillo", x: -8, y: 60, s: 150, c: "rgba(255,255,255,.14)", d: 1.5 },
    ],
  },
  student: {
    fondo: "linear-gradient(135deg,#1A23A6 0%,#2430D9 58%,#4A4EDB 100%)",
    formas: [
      { t: "cuadro", x: 56, y: 22, s: 44, c: "rgba(255,255,255,.92)", r: -10 },
      { t: "cuadro", x: 78, y: 32, s: 32, c: "#F2B341", d: 1, r: 12 },
      { t: "cuadro", x: 34, y: 30, s: 24, c: "#5FE3DC", d: 2, r: -6 },
      { t: "estrella", x: 26, y: 22, s: 14, c: "#fff", d: 0.5 },
      { t: "estrella", x: 90, y: 22, s: 12, c: "#F2B341", d: 1.5 },
    ],
  },
  vida: {
    fondo: "linear-gradient(135deg,#07403D 0%,#0E5B57 55%,#2FB7B0 100%)",
    formas: [
      { t: "moneda", x: 58, y: 20, s: 42, c: "#F2B341" },
      { t: "moneda", x: 80, y: 32, s: 30, c: "#F2B341", d: 1 },
      { t: "moneda", x: 36, y: 30, s: 24, c: "#F2B341", d: 2 },
      { t: "estrella", x: 26, y: 22, s: 14, c: "#5FE3DC", d: 0.4 },
    ],
  },
  vendoe: {
    fondo: "linear-gradient(135deg,#2B2FA8 0%,#4A4EDB 58%,#7B7FF0 100%)",
    formas: [
      { t: "cuadro", x: 56, y: 22, s: 44, c: "rgba(255,255,255,.9)", r: 8 },
      { t: "cuadro", x: 78, y: 32, s: 32, c: "#F2B341", d: 1, r: -12 },
      { t: "cuadro", x: 34, y: 30, s: 24, c: "#5FE3DC", d: 2, r: 14 },
      { t: "estrella", x: 90, y: 22, s: 12, c: "#fff", d: 0.8 },
    ],
  },
  cuenta: {
    fondo: "linear-gradient(120deg,#2430D9 0%,#0E5B57 52%,#4A4EDB 100%)",
    formas: [
      { t: "circulo", x: 58, y: 8, s: 44, c: "#2430D9" },
      { t: "circulo", x: 72, y: 20, s: 44, c: "#0E5B57", d: 1 },
      { t: "circulo", x: 86, y: 8, s: 44, c: "#4A4EDB", d: 2 },
      { t: "anillo", x: 54, y: 2, s: 96, c: "rgba(242,179,65,.8)", d: 0.5 },
      { t: "estrella", x: 46, y: 6, s: 14, c: "#F2B341", d: 1 },
    ],
  },
  autor: {
    fondo: "linear-gradient(135deg,#141A4D 0%,#2430D9 100%)",
    formas: [
      { t: "cuadro", x: 60, y: 8, s: 34, c: "#2430D9", r: -8 },
      { t: "cuadro", x: 74, y: 3, s: 30, c: "#5FE3DC", d: 1, r: 10 },
      { t: "cuadro", x: 88, y: 14, s: 32, c: "#4A4EDB", d: 2, r: -4 },
      { t: "estrella", x: 50, y: 22, s: 14, c: "#F2B341", d: 0.7 },
    ],
  },
};

function Figura({ f, quieto }: { f: Forma; quieto: boolean }) {
  const giro = f.r ?? 0;
  const mov = quieto
    ? {}
    : f.t === "estrella"
      ? { scale: [1, 1.3, 1], opacity: [0.55, 1, 0.55] }
      : { y: [0, -14, 0], rotate: [giro, giro + 6, giro] };
  return (
    <motion.span
      className="absolute block"
      style={{ left: `${f.x}%`, top: `${f.y}%`, width: f.s, height: f.s, rotate: giro }}
      animate={mov}
      transition={{ duration: 5 + (f.d ?? 0), repeat: Infinity, ease: "easeInOut", delay: f.d ?? 0 }}
      aria-hidden="true"
    >
      {f.t === "circulo" && <span className="block size-full rounded-full" style={{ background: f.c }} />}
      {f.t === "anillo" && <span className="block size-full rounded-full border-[3px]" style={{ borderColor: f.c }} />}
      {f.t === "cuadro" && <span className="block size-full rounded-[24%] shadow-[0_6px_0_rgba(0,0,0,.18)]" style={{ background: f.c }} />}
      {f.t === "estrella" && (
        <svg viewBox="0 0 24 24" className="size-full">
          <path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" fill={f.c} />
        </svg>
      )}
      {f.t === "moneda" && (
        <svg viewBox="0 0 24 24" className="size-full drop-shadow-[0_3px_0_rgba(0,0,0,.2)]">
          <circle cx="12" cy="12" r="11" fill={f.c} />
          <circle cx="12" cy="12" r="7.2" fill="none" stroke="#C98A1C" strokeWidth="1.8" />
          <path d="M12 8l1.2 2.7 2.9.3-2.2 1.9.7 2.9L12 14.4 9.4 15.8l.7-2.9-2.2-1.9 2.9-.3z" fill="#C98A1C" />
        </svg>
      )}
    </motion.span>
  );
}

type Props = {
  /** Imagen: /plataforma/<nombre>.webp. Si no existe, se muestra el fondo animado. */
  nombre: string;
  /** Versión vertical para celulares (solo si existe). */
  nombreMovil?: string;
  tono: Tono;
  alt?: string;
  className?: string;
  /** "caja": el contenido llena el banner (con aspect-ratio). "contenido": el banner crece con el contenido. */
  modo?: "caja" | "contenido";
  parallax?: boolean;
  /** Velo oscuro para que el texto blanco se lea: "abajo" (normal), "fuerte" (tarjetas) o "izquierda" (texto a la izquierda). */
  velo?: "abajo" | "fuerte" | "izquierda";
  children?: ReactNode;
};

/**
 * Banner de imagen para la plataforma. La imagen se mueve un poco al hacer scroll (parallax) y, mientras
 * no exista, se ve un fondo propio con figuras que flotan. Todo queda quieto si se reduce el movimiento.
 */
export function Banner({ nombre, nombreMovil, tono, alt = "", className = "", modo = "caja", parallax = true, velo = "abajo", children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const quieto = !!useReducedMotion();
  const [lista, setLista] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const arte = ARTE[tono];

  return (
    <div ref={ref} className={`relative isolate overflow-hidden rounded-[28px] bg-[#141A4D] ${className}`}>
      <motion.div className="absolute inset-[-8%]" style={parallax && !quieto ? { y } : undefined} aria-hidden={alt ? undefined : true}>
        <div className="absolute inset-0" style={{ background: arte.fondo }} />
        {!lista && arte.formas.map((f, i) => <Figura key={i} f={f} quieto={quieto} />)}
        <picture>
          {nombreMovil && <source media="(max-width: 767px)" srcSet={`/plataforma/${nombreMovil}.webp`} />}
          <img
            src={`/plataforma/${nombre}.webp`}
            alt={alt}
            loading="lazy"
            decoding="async"
            draggable={false}
            onLoad={() => setLista(true)}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
            className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ${lista ? "opacity-100" : "opacity-0"}`}
          />
        </picture>
      </motion.div>
      {/* Velo oscuro: el texto blanco siempre se lee, sea cual sea la imagen. */}
      <div
        className={`absolute inset-0 bg-gradient-to-t to-transparent ${velo === "fuerte" ? "from-[#0B1140]/90 via-[#0B1140]/45" : velo === "izquierda" ? "from-black/45 via-black/5" : "from-black/60 via-black/10"}`}
        aria-hidden="true"
      />
      {velo === "izquierda" && <div className="absolute inset-0 bg-gradient-to-r from-[#141A4D]/85 via-[#141A4D]/45 to-transparent md:via-[#141A4D]/30" aria-hidden="true" />}
      <div className={modo === "caja" ? "absolute inset-0" : "relative"}>{children}</div>
    </div>
  );
}
