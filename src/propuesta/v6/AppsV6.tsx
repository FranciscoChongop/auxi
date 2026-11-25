/**
 * Pieza 2 de la landing v6: Auxi Student, Auxi Vida y la franja de Vendoe.
 *
 * Las partículas siguen el relato: bajan como corriente desde la sección anterior y forman una órbita
 * alrededor del celular (cobalto en Student, turquesa en Vida). El recorrido del celular es el mismo de la v5
 * (MotionApp), solo cambia su marco. Textos: solo lo que la app permite hoy.
 */
import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { MotionApp } from "../motion/Motion";
import { IconoStudent, IconoVida } from "./iconos";

const FIGTREE = "Figtree, system-ui, sans-serif";
const ANCHO_TEL = (celular: boolean) => (celular ? 236 : 270);

type App = {
  id: "student" | "vida";
  nombre: string;
  titulo: string;
  apoyo: string;
  puntos: string[];
  enlace: string;
  href: string;
  /** Colores de partículas (0..1) y de la luz de fondo. */
  colores: { a: [number, number, number]; b: [number, number, number] };
  luz: string;
  acento: string;
};

const APPS: App[] = [
  {
    id: "student",
    nombre: "Auxi Student",
    titulo: "Tus apuntes, listos para jugar.",
    apoyo: "Prepara preguntas con tu IA y practica en Auxi.",
    puntos: ["Pegas lo que preparó tu IA y se vuelve un camino de niveles.", "Repasas lo que fallaste en los días siguientes.", "Te avisa tus entregas 7, 3 y 1 día antes."],
    enlace: "Abrir Auxi Student",
    href: "/student",
    colores: { a: [0.14, 0.28, 1.0], b: [0.62, 0.72, 1.0] },
    luz: "rgba(36,48,217,.42)",
    acento: "#9CA8FF",
  },
  {
    id: "vida",
    nombre: "Auxi Vida",
    titulo: "Dale claridad a tu plata.",
    apoyo: "Registra tus gastos y consulta tu disponible estimado.",
    puntos: ["Anotas un gasto en segundos, escribiendo o con una captura.", "Ves cuánto puedes gastar hoy según lo que registraste.", "Lo que sobra puede ir a tu colchón."],
    enlace: "Abrir Auxi Vida",
    href: "/vida",
    colores: { a: [0.37, 0.89, 0.86], b: [0.75, 1.0, 0.96] },
    luz: "rgba(14,91,87,.55)",
    acento: "#5FE3DC",
  },
];

const suave = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function Flecha() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 10h11M11 5l5 5-5 5" />
    </svg>
  );
}

function SeccionApp({ app, celular, invertida, entraDesde }: { app: App; celular: boolean; invertida: boolean; entraDesde: number }) {
  const seccion = useRef<HTMLElement>(null);
  const lienzo = useRef<HTMLCanvasElement>(null);
  const telefono = useRef<HTMLDivElement>(null);
  const quieto = !!useReducedMotion();

  useEffect(() => {
    const el = seccion.current;
    const canvas = lienzo.current;
    const tel = telefono.current;
    if (!el || !canvas || !tel) return;
    let corriente: ReturnType<typeof import("./corriente").crearCorriente> = null;
    let raf = 0;
    let vivo = true;

    const medir = () => {
      if (!corriente) return;
      const W = el.clientWidth;
      const H = el.clientHeight;
      // Posición del celular dentro de la sección, en px de diseño (sirve también con el «zoom» de la propuesta).
      const re = el.getBoundingClientRect();
      const rt = tel.getBoundingClientRect();
      const k = el.offsetWidth / (re.width || 1);
      // El contenedor incluye la barra de pasos: el celular mide ANCHO_TEL y su alto es ~2,05 veces eso.
      const tw = ANCHO_TEL(celular);
      const cx = (rt.left - re.left + rt.width / 2) * k;
      const cy = (rt.top - re.top) * k + tw * 2.05 * 0.5;
      corriente.medir(W, H, {
        inicio: [W * entraDesde, 0],
        centro: [cx, cy],
        rx: tw * (celular ? 0.78 : 0.98),
        ry: tw * 0.34,
        giro: invertida ? 0.32 : -0.3,
      });
      avance();
    };

    const avance = () => {
      raf = 0;
      if (!corriente) return;
      if (quieto) return corriente.dibujar(1, 0);
      const re = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (re.bottom < -50 || re.top > vh + 50) return; // fuera de pantalla: no se dibuja nada
      const t = (vh - re.top) / (vh + re.height);
      corriente.dibujar(suave(0.04, 0.42, t), t * 1.4);
    };
    const alScroll = () => {
      if (!raf) raf = requestAnimationFrame(avance);
    };

    import("./corriente").then(({ crearCorriente }) => {
      if (!vivo) return;
      try {
        corriente = crearCorriente(canvas, celular ? 900 : 1800, app.colores, celular ? 1.5 : 2);
      } catch {
        corriente = null;
      }
      medir();
    });
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    window.addEventListener("scroll", alScroll, { passive: true });
    return () => {
      vivo = false;
      ro.disconnect();
      window.removeEventListener("scroll", alScroll);
      cancelAnimationFrame(raf);
      corriente?.destruir();
    };
  }, [app, celular, invertida, entraDesde, quieto]);

  const Icono = app.id === "student" ? IconoStudent : IconoVida;
  const texto = (
    <div className={celular ? "text-center" : ""} style={{ maxWidth: celular ? 350 : 470 }}>
      <p className={`flex items-center gap-3 ${celular ? "justify-center" : ""}`} style={{ fontSize: 15, fontWeight: 600, letterSpacing: ".04em", color: app.acento }}>
        <span className={`v6-nodo-chico ${app.id}`}>
          <Icono s={20} />
        </span>
        {app.nombre}
      </p>
      <h2 className="v6-h1" style={{ fontSize: celular ? 32 : 50, lineHeight: 1.08, marginTop: 18 }}>
        {app.titulo}
      </h2>
      <p style={{ marginTop: 16, fontSize: celular ? 17 : 19, lineHeight: 1.55, color: "var(--texto-2)" }}>{app.apoyo}</p>
      {!celular && (
        <ul className="v6-puntos" style={{ marginTop: 28 }}>
          {app.puntos.map((p) => (
            <li key={p}>
              <i style={{ background: app.acento }} />
              {p}
            </li>
          ))}
        </ul>
      )}
      {!celular && (
        <a href={app.href} className="v6-cta" style={{ marginTop: 32 }}>
          {app.enlace}
          <Flecha />
        </a>
      )}
    </div>
  );

  const demo = (
    <div ref={telefono} className="relative z-10 flex justify-center">
      <MotionApp app={app.id} ancho={ANCHO_TEL(celular)} />
    </div>
  );

  return (
    <section ref={seccion} id={app.id} className="relative isolate overflow-hidden" style={{ padding: celular ? "72px 20px 80px" : "120px 64px" }}>
      {/* Luz concentrada cerca del producto; el fondo sigue siendo el mismo azul noche. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -z-10"
        style={{
          width: celular ? 420 : 680,
          height: celular ? 420 : 680,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${app.luz}, transparent 68%)`,
          top: celular ? "auto" : "50%",
          bottom: celular ? 120 : "auto",
          left: celular ? "50%" : invertida ? "26%" : "74%",
          transform: celular ? "translateX(-50%)" : "translate(-50%, -50%)",
        }}
      />
      <canvas ref={lienzo} aria-hidden className="pointer-events-none absolute inset-0 -z-10 h-full w-full" />
      {celular ? (
        <div className="flex flex-col items-center">
          {texto}
          <div style={{ marginTop: 40 }}>{demo}</div>
          <ul className="v6-puntos" style={{ marginTop: 8, maxWidth: 350 }}>
            {app.puntos.map((p) => (
              <li key={p}>
                <i style={{ background: app.acento }} />
                {p}
              </li>
            ))}
          </ul>
          <a href={app.href} className="v6-cta" style={{ marginTop: 28, width: "100%", maxWidth: 350 }}>
            {app.enlace}
            <Flecha />
          </a>
        </div>
      ) : (
        <div className="mx-auto grid items-center" style={{ maxWidth: 1100, gridTemplateColumns: "1fr 1fr", gap: 64 }}>
          {invertida ? (
            <>
              {demo}
              <div className="flex justify-end">{texto}</div>
            </>
          ) : (
            <>
              {texto}
              {demo}
            </>
          )}
        </div>
      )}
    </section>
  );
}

function FranjaVendoe({ celular }: { celular: boolean }) {
  return (
    <section id="vendoe" style={{ padding: celular ? "8px 20px 72px" : "24px 64px 120px" }}>
      <div
        className="mx-auto flex items-center justify-between gap-6"
        style={{
          maxWidth: 1100,
          flexDirection: celular ? "column" : "row",
          alignItems: celular ? "flex-start" : "center",
          padding: celular ? "24px 0 0" : "32px 0 0",
          borderTop: "1px solid rgba(255,255,255,.12)",
        }}
      >
        <p style={{ fontSize: celular ? 20 : 24, lineHeight: 1.3, fontWeight: 600, color: "#fff", margin: 0 }}>
          ¿Tienes un negocio? <span style={{ color: "var(--texto-2)", fontWeight: 500 }}>Vendoe tiene su propia página.</span>
        </p>
        {/* /negocio cuenta el clic y redirige a vendoe.es. */}
        <a href="/negocio" target="_blank" rel="noopener" className="v6-enlace-ext" aria-label="Conocer Vendoe (se abre vendoe.es en otra pestaña)">
          Conocer Vendoe
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M8 4H4v12h12v-4M11 4h5v5M16 4l-8 8" />
          </svg>
          <span style={{ fontSize: 13, color: "var(--texto-2)", fontWeight: 500 }}>vendoe.es</span>
        </a>
      </div>
    </section>
  );
}

export const ESTILOS_APPS = `
.v6 .v6-nodo-chico { display:grid; place-items:center; width:40px; height:40px; border-radius:12px;
  background: linear-gradient(150deg, rgba(120,150,255,.38), rgba(36,48,217,.3) 55%, rgba(8,14,37,.55)); border:1px solid rgba(160,185,255,.5); }
.v6 .v6-nodo-chico.vida { background: linear-gradient(150deg, rgba(95,227,220,.35), rgba(14,91,87,.45) 55%, rgba(8,14,37,.55)); border-color: rgba(95,227,220,.55); }
.v6 .v6-puntos { list-style:none; padding:0; margin-bottom:0; display:flex; flex-direction:column; gap:14px; text-align:left; }
.v6 .v6-puntos li { display:flex; gap:12px; align-items:flex-start; font-size:17px; line-height:1.5; color:#DCE2F2; }
.v6 .v6-puntos i { flex:none; width:7px; height:7px; border-radius:50%; margin-top:10px; box-shadow: 0 0 10px currentColor; }
.v6 .v6-cta { gap:10px; }
.v6 .v6-enlace-ext { display:inline-flex; align-items:center; gap:10px; min-height:48px; padding:0 4px; color:#fff; font-weight:600; font-size:17px;
  text-decoration: underline; text-decoration-color: rgba(255,255,255,.35); text-underline-offset: 6px; }
.v6 .v6-enlace-ext:hover { text-decoration-color: #fff; }
`;

export function AppsV6({ celular }: { celular: boolean }) {
  return (
    <div style={{ fontFamily: FIGTREE }}>
      <style>{ESTILOS_APPS}</style>
      {/* En celular la corriente entra por los bordes para no cruzar los títulos. */}
      <SeccionApp app={APPS[0]} celular={celular} invertida={false} entraDesde={celular ? 0.03 : 0.5} />
      <SeccionApp app={APPS[1]} celular={celular} invertida entraDesde={celular ? 0.97 : 0.75} />
      <FranjaVendoe celular={celular} />
    </div>
  );
}
