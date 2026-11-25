/**
 * Pieza 3 de la landing v6: «Sobre mí» como escena editorial dentro del mismo universo.
 *
 * El retrato original (public/plataforma/presentacion.webp) aparece una sola vez, con una máscara suave hacia el fondo.
 * El haz de luz que baja del tragaluz hacia Daniel está lleno de partículas que flotan, y algunas caen como lluvia
 * a su alrededor hasta el suelo (ver luz.ts). Todo queda dentro del retrato: nunca cruza el nombre ni los enlaces.
 */
import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { INSTAGRAM_URL, TIKTOK_URL } from "../../components/ApoyaAlCreador";

const WHATSAPP = "https://wa.me/51960650372";
const WHATSAPP_NEGOCIO = `${WHATSAPP}?text=${encodeURIComponent("Hola Daniel, tengo una idea para mi negocio.")}`;

/** El cono de luz dentro de la foto (fracciones): del tragaluz (ancho) a los hombros de Daniel (angosto), y el suelo. */
const HAZ = { arriba: 0.16, abajo: 0.44, ancho0: 0.5, ancho1: 0.2, centro: 0.5, suelo: 0.96 };

const suave = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function Icono({ tipo }: { tipo: "instagram" | "tiktok" | "whatsapp" }) {
  const comun = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (tipo === "instagram")
    return (
      <svg {...comun}>
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r=".6" fill="currentColor" />
      </svg>
    );
  if (tipo === "tiktok")
    return (
      <svg {...comun}>
        <path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5" />
        <path d="M14 4c.4 2.6 2.2 4.3 5 4.5" />
      </svg>
    );
  return (
    <svg {...comun}>
      <path d="M4.5 19.5l1.2-3.6A7.8 7.8 0 1 1 8.6 18.6z" />
      <path d="M9.3 9.2c.3 1.9 1.6 3.4 3.6 4.3l1-1 2 .9c-.2 1-1.1 1.7-2.1 1.6-3.2-.4-5.6-2.9-6-6 0-1 .6-1.9 1.6-2.1l.9 2z" strokeWidth="1.4" />
    </svg>
  );
}

export function SobreMiV6({ celular }: { celular: boolean }) {
  const seccion = useRef<HTMLElement>(null);
  const lienzo = useRef<HTMLCanvasElement>(null);
  const foto = useRef<HTMLImageElement>(null);
  const escena = useRef<HTMLDivElement>(null);
  const quieto = !!useReducedMotion();

  useEffect(() => {
    const el = seccion.current;
    const canvas = lienzo.current;
    const img = foto.current;
    if (!el || !canvas || !img) return;
    let luz: ReturnType<typeof import("./luz").crearLuz> = null;
    let raf = 0;
    let vivo = true;
    let soltarVigia = () => {};

    const medir = () => {
      if (!luz) return;
      const ri = img.getBoundingClientRect();
      const rc = canvas.getBoundingClientRect();
      const k = canvas.offsetWidth / (rc.width || 1);
      luz.medir(canvas.offsetWidth, canvas.offsetHeight, [(ri.left - rc.left) * k, (ri.top - rc.top) * k, ri.width * k, ri.height * k], HAZ);
      avance();
    };
    const avance = () => {
      raf = 0;
      if (quieto) return luz?.dibujar(1);
      const re = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (re.bottom < -50 || re.top > vh + 50) return;
      const t = (vh - re.top) / (vh + re.height);
      // El haz se llena mientras la sección entra.
      luz?.dibujar(suave(0.05, 0.4, t));
      // Daniel aparece desde el fondo, como si la cámara llegara a él (sigue al «hacia adelante» de Vida).
      const ent = suave(0.02, 0.36, t);
      if (escena.current) {
        escena.current.style.transform = `scale(${(0.84 + 0.16 * ent).toFixed(4)})`;
        escena.current.style.opacity = ent.toFixed(3);
      }
    };
    const alScroll = () => {
      if (!raf) raf = requestAnimationFrame(avance);
    };

    Promise.all([import("./luz"), import("./bucle")]).then(([{ crearLuz }, { vigilar }]) => {
      if (!vivo) return;
      try {
        luz = crearLuz(canvas, celular ? 1300 : 3200, celular ? 260 : 650, { dprMax: celular ? 1.5 : 2, vivo: !quieto, fps: celular ? 30 : 60 });
      } catch {
        luz = null;
      }
      medir();
      if (luz?.bucle) soltarVigia = vigilar(el, luz.bucle);
    });
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    img.addEventListener("load", medir);
    window.addEventListener("scroll", alScroll, { passive: true });
    return () => {
      vivo = false;
      soltarVigia();
      ro.disconnect();
      img.removeEventListener("load", medir);
      window.removeEventListener("scroll", alScroll);
      cancelAnimationFrame(raf);
      luz?.destruir();
    };
  }, [celular, quieto]);

  const enlaces: { tipo: "instagram" | "tiktok" | "whatsapp"; nombre: string; href: string; ayuda: string }[] = [
    { tipo: "instagram", nombre: "Instagram", href: INSTAGRAM_URL, ayuda: "@soydanielchong" },
    { tipo: "tiktok", nombre: "TikTok", href: TIKTOK_URL, ayuda: "@soydanielchong" },
    { tipo: "whatsapp", nombre: "WhatsApp", href: WHATSAPP, ayuda: "Escríbeme" },
  ];

  const texto = (
    <div style={{ maxWidth: celular ? 350 : 460 }}>
      <p style={{ fontSize: 15, fontWeight: 600, letterSpacing: ".14em", color: "#F2B341" }}>SOBRE MÍ</p>
      <h2 className="v6-h1" style={{ fontSize: celular ? 34 : 56, lineHeight: 1.04, marginTop: 16 }}>
        De una idea a algo que puedes usar.
      </h2>
      <p style={{ marginTop: 22, fontSize: celular ? 17 : 20, lineHeight: 1.55, color: "#DCE2F2" }}>
        Soy <strong style={{ color: "#fff", fontWeight: 700 }}>Daniel Chong</strong>, creador de AUXI Studio. Uso IA para construir herramientas útiles. Las pruebo, las mejoro y comparto el proceso.
      </p>
    </div>
  );
  const redes = (
    <div style={{ marginTop: celular ? 28 : 36, maxWidth: celular ? 350 : 460 }}>
      <ul className="v6-redes">
        {enlaces.map((e) => (
          <li key={e.tipo}>
            <a href={e.href} target="_blank" rel="noopener" aria-label={`${e.nombre}: ${e.ayuda} (se abre en otra pestaña)`}>
              <Icono tipo={e.tipo} />
              <span>
                <b>{e.nombre}</b>
                <small>{e.ayuda}</small>
              </span>
            </a>
          </li>
        ))}
      </ul>
      <a href={WHATSAPP_NEGOCIO} target="_blank" rel="noopener" className="v6-enlace-ext" style={{ marginTop: 22, fontSize: 16, flexWrap: "wrap", columnGap: 10, rowGap: 0 }}>
        ¿Tienes una idea para tu negocio? Hablemos
        <span style={{ fontSize: 13, color: "var(--texto-2)", fontWeight: 500, width: celular ? "100%" : "auto" }}>por WhatsApp</span>
      </a>
    </div>
  );

  // Máscara suave: el retrato se funde con el azul noche (sin bordes de foto).
  // Dos capas que se cruzan (intersect): un óvalo y un desvanecido arriba y abajo, para que no quede ningún borde recto.
  const mascara = celular
    ? "radial-gradient(ellipse 75% 70% at 50% 50%, #000 55%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 18%, #000 78%, transparent 100%)"
    : "radial-gradient(ellipse 62% 72% at 48% 48%, #000 50%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 16%, #000 80%, transparent 100%)";
  const conMascara = { maskImage: mascara, WebkitMaskImage: mascara, maskComposite: "intersect", WebkitMaskComposite: "source-in" } as const;

  return (
    <section ref={seccion} id="sobre-mi" className="relative isolate overflow-hidden" style={{ padding: celular ? "72px 20px 80px" : "40px 64px" }}>
      <style>{`
        .v6 .v6-redes { list-style:none; margin:0; padding:0; display:flex; flex-wrap:wrap; gap:8px; }
        .v6 .v6-redes a { display:flex; align-items:center; gap:9px; min-height:52px; padding:6px 13px 6px 11px; border-radius:14px; color:#fff; text-decoration:none;
          background: rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.16); transition: background-color .15s, border-color .15s; }
        .v6 .v6-redes a:hover { background: rgba(255,255,255,.1); border-color: rgba(255,255,255,.4); }
        .v6 .v6-redes span { display:flex; flex-direction:column; line-height:1.15; }
        .v6 .v6-redes b { font-weight:600; font-size:15px; }
        .v6 .v6-redes small { font-size:12px; color: var(--texto-2); }
      `}</style>
      <div ref={escena} className="relative" style={{ transformOrigin: "50% 45%", willChange: "transform, opacity" }}>
      {/* El lienzo cubre toda la sección (compensa el padding) y se escala junto con la foto. */}
      <canvas ref={lienzo} aria-hidden className="pointer-events-none absolute z-10" style={{ inset: celular ? "-72px -20px -80px" : "-40px -64px", width: celular ? "calc(100% + 40px)" : "calc(100% + 128px)", height: celular ? "calc(100% + 152px)" : "calc(100% + 80px)" }} />
      {celular ? (
        <div className="flex flex-col items-center">
          <div className="relative z-20">{texto}</div>
          <img
            ref={foto}
            src="/plataforma/presentacion.webp"
            alt="Daniel Chong de espaldas, bajo la luz de un tragaluz"
            loading="lazy"
            decoding="async"
            width={1600}
            height={900}
            className="relative -z-10 block select-none"
            style={{ width: "calc(100% + 40px)", maxWidth: "none", margin: "20px -20px 0", height: "auto", ...conMascara }}
          />
          <div className="relative z-20">{redes}</div>
        </div>
      ) : (
        <div className="relative mx-auto" style={{ maxWidth: 1200, minHeight: 640 }}>
          <img
            ref={foto}
            src="/plataforma/presentacion.webp"
            alt="Daniel Chong de espaldas, bajo la luz de un tragaluz"
            loading="lazy"
            decoding="async"
            width={1600}
            height={900}
            className="absolute -z-10 block select-none"
            style={{ left: "-12%", top: "50%", transform: "translateY(-50%)", width: "86%", maxWidth: "none", height: "auto", ...conMascara }}
          />
          <div className="relative z-20 ml-auto flex min-h-[640px] flex-col justify-center" style={{ width: 460 }}>
            {texto}
            {redes}
          </div>
        </div>
      )}
      </div>
    </section>
  );
}
