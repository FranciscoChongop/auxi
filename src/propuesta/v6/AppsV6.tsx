/**
 * Pieza 2 de la landing v6: Auxi Student, Auxi Vida y la franja de Vendoe.
 *
 * Las partículas siguen el relato: bajan como corriente desde la sección anterior y forman una constelación 3D
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
  puntos: { icono: keyof typeof ICONOS; titulo: string; texto: string }[];
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
    puntos: [
      { icono: "pegar", titulo: "Pega lo que preparó tu IA", texto: "Se vuelve un camino de niveles para jugar." },
      { icono: "repaso", titulo: "Repasa lo que fallaste", texto: "Vuelve a preguntarte en los días siguientes." },
      { icono: "aviso", titulo: "Avisos de tus entregas", texto: "7, 3 y 1 día antes de cada fecha." },
    ],
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
    puntos: [
      { icono: "anotar", titulo: "Anota en segundos", texto: "Escribiendo o con una captura de Yape o Plin." },
      { icono: "hoy", titulo: "Tu disponible de hoy", texto: "Estimado con lo que registraste." },
      { icono: "colchon", titulo: "Arma tu colchón", texto: "Lo que sobra puede ir ahí." },
    ],
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

/** Íconos de trazo para los puntos de cada app (propios, 24 × 24). */
const ICONOS = {
  pegar: "M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1zM8 5H6.5A1.5 1.5 0 0 0 5 6.5v12A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-12A1.5 1.5 0 0 0 17.5 5H16M9 12l2 2 4-4",
  repaso: "M4 12a8 8 0 0 1 13.7-5.6L20 8.7M20 4v4.7h-4.7M20 12a8 8 0 0 1-13.7 5.6L4 15.3M4 20v-4.7h4.7",
  aviso: "M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15zM10 20a2 2 0 0 0 4 0",
  anotar: "M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3zM14 8l3 3",
  hoy: "M12 3a9 9 0 1 0 9 9M12 3v9l6-6M16 3.8A9 9 0 0 1 20.2 8",
  colchon: "M8 3h8M9 3v3.2c-2.4 1-4 3.4-4 6.1V18a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-5.7c0-2.7-1.6-5.1-4-6.1V3M5 14h14",
} as const;

function Puntos({ app, celular }: { app: App; celular: boolean }) {
  return (
    <ul className="v6-puntos" style={{ marginTop: celular ? 20 : 30, maxWidth: celular ? 350 : 440 }}>
      {app.puntos.map((p) => (
        <li key={p.titulo}>
          <span className={`v6-punto-icono ${app.id}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={app.acento} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d={ICONOS[p.icono]} />
            </svg>
          </span>
          <span>
            <b>{p.titulo}</b>
            <small>{p.texto}</small>
          </span>
        </li>
      ))}
    </ul>
  );
}

function Flecha() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 10h11M11 5l5 5-5 5" />
    </svg>
  );
}

/**
 * entrada «heroe»: la sección está debajo del héroe y aparece creciendo mientras el héroe se desvanece.
 * entrada «zoom»: aparece creciendo al entrar (las estrellas llegan desde más cerca).
 * salida «acercar»: la cámara sigue hacia adelante: el contenido crece y se desvanece, y las estrellas pasan de largo.
 */
type Transicion = { entrada: "heroe" | "zoom"; salida: "acercar" | null };

function SeccionApp({ app, celular, invertida, entraDesde, transicion, trasHeroe = false }: { app: App; celular: boolean; invertida: boolean; entraDesde: number; transicion: Transicion; trasHeroe?: boolean }) {
  const seccion = useRef<HTMLElement>(null);
  const lienzo = useRef<HTMLCanvasElement>(null);
  const telefono = useRef<HTMLDivElement>(null);
  const contenido = useRef<HTMLDivElement>(null);
  const quieto = !!useReducedMotion();

  useEffect(() => {
    const el = seccion.current;
    const canvas = lienzo.current;
    const tel = telefono.current;
    if (!el || !canvas || !tel) return;
    let corriente: ReturnType<typeof import("./constelacion").crearConstelacion> = null;
    let raf = 0;
    let vivo = true;

    // Posición sin transformaciones (offset*): así la entrada con escala o desplazamiento no mueve la medida.
    const posicion = (nodo: HTMLElement) => {
      let x = 0;
      let y = 0;
      let n: HTMLElement | null = nodo;
      while (n && n !== el) {
        x += n.offsetLeft;
        y += n.offsetTop;
        n = n.offsetParent as HTMLElement | null;
      }
      return [x, y];
    };
    let centro: [number, number] = [0, 0];
    let origenContenido: [number, number] = [0, 0];
    const medir = () => {
      const W = el.clientWidth;
      const H = el.clientHeight;
      // El contenedor incluye la barra de pasos: el celular mide ANCHO_TEL y su alto es ~2,05 veces eso.
      const tw = ANCHO_TEL(celular);
      const [tx, ty] = posicion(tel);
      centro = [tx + tel.offsetWidth / 2, ty + tw * 2.05 * 0.5];
      if (contenido.current) {
        const [ox, oy] = posicion(contenido.current);
        origenContenido = [centro[0] - ox, centro[1] - oy];
      }
      // Nube más ancha que alta: se ve alrededor del celular, que tapa su centro.
      corriente?.medir(W, H, { inicio: [W * entraDesde, 0], centro, radio: celular ? [tw * 0.78, tw * 1.25] : [tw * 1.25, tw * 1.3] });
      avance();
    };

    // Transición ligada al scroll (reversible), siempre hacia el celular de la sección: entrar creciendo,
    // salir «hacia adelante» (crece y se desvanece mientras las estrellas pasan cerca).
    const transformar = (t: number, top: number, vh: number, k: number) => {
      const c = contenido.current;
      if (!c) return;
      let ent: number;
      if (transicion.entrada === "heroe") {
        // La sección ya está bajo el héroe: aparece mientras su borde superior llega arriba de la pantalla.
        const tope = (parseFloat(getComputedStyle(el).getPropertyValue("--tope")) || 0) * k;
        ent = 1 - Math.min(1, Math.max(0, (top - tope) / (vh * 0.45)));
        ent = ent * ent * (3 - 2 * ent);
      } else {
        ent = suave(0.02, 0.32, t);
      }
      const sal = transicion.salida ? suave(0.62, 0.93, t) : 0;
      const escala = (0.84 + 0.16 * ent) * (1 + 0.22 * sal);
      const opacidad = ent * (1 - sal);
      c.style.transformOrigin = `${origenContenido[0]}px ${origenContenido[1]}px`;
      c.style.transform = `scale(${escala.toFixed(4)})`;
      c.style.opacity = opacidad.toFixed(3);
      // Las estrellas: llegan desde más cerca (más grandes) y, al salir, pasan de largo hacia la cámara.
      const escalaEstrellas = (1.3 - 0.3 * ent) * (1 + 0.8 * sal);
      canvas.style.transformOrigin = `${centro[0]}px ${centro[1]}px`;
      canvas.style.transform = `scale(${escalaEstrellas.toFixed(4)})`;
      canvas.style.opacity = (Math.max(0.35, ent) * (1 - 0.9 * sal)).toFixed(3);
    };

    // Inclinación del celular 3D: de costado al entrar y de frente cuando la sección está al centro;
    // en computadora, además sigue un poco al mouse.
    const lado = invertida ? 1 : -1;
    let mouse = [0, 0];
    const inclinar = (t: number) => {
      const centro = Math.min(1, Math.abs(t - 0.5) * 2); // 0 en el centro de la pantalla, 1 en los bordes
      const ry = lado * ((celular ? 9 : 12) + (celular ? 10 : 14) * centro) + mouse[0] * 7;
      const rx = (t < 0.5 ? 8 : -5) * centro + 3 - mouse[1] * 5;
      el.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
      el.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
      el.style.setProperty("--brillo", `${(20 + t * 60).toFixed(1)}`);
    };

    let ultimoT = 0.5;
    const avance = () => {
      raf = 0;
      if (quieto) {
        inclinar(0.5);
        corriente?.dibujar(1, 0);
        return;
      }
      const re = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (re.bottom < -50 || re.top > vh + 50) return; // fuera de pantalla: no se dibuja nada
      const t = (vh - re.top) / (vh + re.height);
      ultimoT = t;
      inclinar(t);
      transformar(t, re.top, vh, re.width / (el.offsetWidth || 1));
      corriente?.dibujar(suave(0.04, 0.42, t), t * 1.4);
    };
    const alScroll = () => {
      if (!raf) raf = requestAnimationFrame(avance);
    };
    const alMouse = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = tel.getBoundingClientRect();
      mouse = [Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width * 2))), Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / r.height))];
      inclinar(ultimoT);
    };
    const alSalir = () => {
      mouse = [0, 0];
      inclinar(ultimoT);
    };

    let soltarVigia = () => {};
    Promise.all([import("./constelacion"), import("./bucle")]).then(([{ crearConstelacion }, { vigilar }]) => {
      if (!vivo) return;
      try {
        corriente = crearConstelacion(canvas, celular ? 900 : 1700, celular ? 350 : 800, app.colores, { dprMax: celular ? 1.5 : 2, vivo: !quieto, fps: celular ? 30 : 60, vecinas: 2 });
      } catch {
        corriente = null;
      }
      medir();
      if (corriente?.bucle) soltarVigia = vigilar(el, corriente.bucle);
    });
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    avance();
    window.addEventListener("scroll", alScroll, { passive: true });
    if (!celular && !quieto) {
      el.addEventListener("pointermove", alMouse);
      el.addEventListener("pointerleave", alSalir);
    }
    return () => {
      vivo = false;
      soltarVigia();
      ro.disconnect();
      window.removeEventListener("scroll", alScroll);
      el.removeEventListener("pointermove", alMouse);
      el.removeEventListener("pointerleave", alSalir);
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
      {!celular && <Puntos app={app} celular={false} />}
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
      <MotionApp app={app.id} ancho={ANCHO_TEL(celular)} tresD />
    </div>
  );

  return (
    <section
      ref={seccion}
      id={app.id}
      className="relative isolate overflow-hidden"
      style={{
        padding: celular ? "72px 20px 80px" : "120px 64px",
        marginTop: trasHeroe ? (celular ? "calc(-1 * clamp(640px, 100dvh - var(--tope), 900px))" : "calc(-1 * clamp(600px, 100dvh - var(--tope), 980px))") : undefined,
      }}
    >
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
        <div ref={contenido} className="relative flex flex-col items-center" style={{ willChange: "transform, opacity" }}>
          {texto}
          <div style={{ marginTop: 40 }}>{demo}</div>
          <Puntos app={app} celular />
          <a href={app.href} className="v6-cta" style={{ marginTop: 28, width: "100%", maxWidth: 350 }}>
            {app.enlace}
            <Flecha />
          </a>
        </div>
      ) : (
        <div ref={contenido} className="relative mx-auto grid items-center" style={{ maxWidth: 1100, gridTemplateColumns: "1fr 1fr", gap: 64, willChange: "transform, opacity" }}>
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
.v6 .v6-puntos { list-style:none; padding:0; margin-bottom:0; width:100%; text-align:left; border-top:1px solid rgba(255,255,255,.1); }
.v6 .v6-puntos li { display:flex; gap:14px; align-items:center; padding:14px 0; border-bottom:1px solid rgba(255,255,255,.1); }
.v6 .v6-puntos b { display:block; font-weight:600; font-size:17px; line-height:1.3; color:#fff; }
.v6 .v6-puntos small { display:block; margin-top:2px; font-size:15px; line-height:1.4; color: var(--texto-2); }
.v6 .v6-punto-icono { flex:none; display:grid; place-items:center; width:42px; height:42px; border-radius:12px;
  background: linear-gradient(150deg, rgba(120,150,255,.22), rgba(36,48,217,.14)); border:1px solid rgba(160,185,255,.28); }
.v6 .v6-punto-icono.vida { background: linear-gradient(150deg, rgba(95,227,220,.2), rgba(14,91,87,.22)); border-color: rgba(95,227,220,.3); }
.v6 .v6-cta { gap:10px; }
.v6 .v6-enlace-ext { display:inline-flex; align-items:center; gap:10px; min-height:48px; padding:0 4px; color:#fff; font-weight:600; font-size:17px;
  text-decoration: underline; text-decoration-color: rgba(255,255,255,.35); text-underline-offset: 6px; }
.v6 .v6-enlace-ext:hover { text-decoration-color: #fff; }
`;

export function AppsV6({ celular, trasHeroe = false }: { celular: boolean; trasHeroe?: boolean }) {
  return (
    <div style={{ fontFamily: FIGTREE }}>
      <style>{ESTILOS_APPS}</style>
      {/* En celular la corriente entra por los bordes para no cruzar los títulos. */}
      <SeccionApp app={APPS[0]} celular={celular} invertida={false} entraDesde={celular ? 0.03 : 0.5} trasHeroe={trasHeroe} transicion={{ entrada: trasHeroe ? "heroe" : "zoom", salida: "acercar" }} />
      <SeccionApp app={APPS[1]} celular={celular} invertida entraDesde={celular ? 0.97 : 0.75} transicion={{ entrada: "zoom", salida: "acercar" }} />
      <FranjaVendoe celular={celular} />
    </div>
  );
}
