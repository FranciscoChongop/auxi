/**
 * Pieza 3 de la landing v6: «Sobre mí» como escena editorial dentro del mismo universo.
 *
 * El retrato original (public/plataforma/presentacion.webp) aparece una sola vez, con una máscara suave hacia el fondo.
 * La luz del tragaluz se vuelve partículas que caen y forman un arco abierto alrededor de Daniel: la persona como
 * origen de lo que construye. El arco nunca cruza el nombre ni los enlaces (se queda dentro del retrato).
 */
import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { INSTAGRAM_URL, TIKTOK_URL } from "../../components/ApoyaAlCreador";

const WHATSAPP = "https://wa.me/51960650372";
const WHATSAPP_NEGOCIO = `${WHATSAPP}?text=${encodeURIComponent("Hola Daniel, tengo una idea para mi negocio.")}`;

/** Dónde está cada cosa dentro de la foto (fracciones del ancho y alto). */
const FOTO = { tragaluz: [0.5, 0.12], persona: [0.49, 0.62], arco: [0.2, 0.38] } as const;

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
  const quieto = !!useReducedMotion();

  useEffect(() => {
    const el = seccion.current;
    const canvas = lienzo.current;
    const img = foto.current;
    if (!el || !canvas || !img) return;
    let corriente: ReturnType<typeof import("./corriente").crearCorriente> = null;
    let raf = 0;
    let vivo = true;
    let soltarVigia = () => {};

    const medir = () => {
      if (!corriente) return;
      const re = el.getBoundingClientRect();
      const ri = img.getBoundingClientRect();
      const k = el.offsetWidth / (re.width || 1);
      const x = (ri.left - re.left) * k;
      const y = (ri.top - re.top) * k;
      const w = ri.width * k;
      const h = ri.height * k;
      corriente.medir(el.clientWidth, el.clientHeight, {
        inicio: [x + w * FOTO.tragaluz[0], y + h * FOTO.tragaluz[1]],
        centro: [x + w * FOTO.persona[0], y + h * FOTO.persona[1]],
        rx: w * FOTO.arco[0],
        ry: h * FOTO.arco[1],
        giro: -0.08,
        // Abierto hacia el texto (derecha): de abajo a la derecha, pasando por la izquierda, hasta arriba a la derecha.
        arco: [Math.PI * 0.32, Math.PI * 1.36],
      });
      avance();
    };
    const avance = () => {
      raf = 0;
      if (!corriente) return;
      if (quieto) return corriente.dibujar(1, 0);
      const re = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (re.bottom < -50 || re.top > vh + 50) return;
      const t = (vh - re.top) / (vh + re.height);
      corriente.dibujar(suave(0.08, 0.45, t), t * 1.2);
    };
    const alScroll = () => {
      if (!raf) raf = requestAnimationFrame(avance);
    };

    Promise.all([import("./corriente"), import("./bucle")]).then(([{ crearCorriente }, { vigilar }]) => {
      if (!vivo) return;
      try {
        corriente = crearCorriente(canvas, celular ? 1100 : 2400, celular ? 160 : 380, { a: [0.45, 0.62, 1.0], b: [1.0, 0.86, 0.6] }, { dprMax: celular ? 1.5 : 2, vivo: !quieto, fps: celular ? 30 : 60 });
      } catch {
        corriente = null;
      }
      medir();
      if (corriente?.bucle) soltarVigia = vigilar(el, corriente.bucle);
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
      corriente?.destruir();
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
      <canvas ref={lienzo} aria-hidden className="pointer-events-none absolute inset-0 z-10 h-full w-full" />
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
    </section>
  );
}
