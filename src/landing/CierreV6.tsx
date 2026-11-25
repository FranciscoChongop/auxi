/**
 * Pieza 5 de la landing v6: cierre y pie.
 *
 * Cierre: el relato vuelve al inicio al revés. Las partículas empiezan como la órbita del ecosistema y, al bajar,
 * regresan a formar la mano digital mientras la mano humana vuelve a entrar. Arriba aparece la frase final y el
 * acceso. Reusa la geometría del héroe (orbita.ts) y su motor de partículas (particulas.ts).
 * Pie: enlaces reales, entrada en cascada y la marca grande que se revela al final.
 */
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, type CSSProperties } from "react";
import { INSTAGRAM_URL, TIKTOK_URL } from "../components/ApoyaAlCreador";
import { IconoStudent, IconoVida } from "./iconos";
import { geometria, NODOS, suave } from "./orbita";
import type { Escena } from "./particulas";

const WHATSAPP = "https://wa.me/51960650372";
const SUAVE = [0.22, 1, 0.36, 1] as const;

function Escenario({ celular, fijo }: { celular: boolean; fijo: boolean }) {
  const raiz = useRef<HTMLDivElement>(null);
  const lienzo = useRef<HTMLCanvasElement>(null);
  const humana = useRef<HTMLImageElement>(null);
  const orbitas = useRef<SVGGElement>(null);
  const nucleo = useRef<HTMLDivElement>(null);
  const nodos = useRef<Record<string, HTMLDivElement | null>>({});
  const electrones = useRef<(SVGCircleElement | null)[]>([]);
  const texto = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = raiz.current;
    const canvas = lienzo.current;
    if (!el || !canvas) return;
    let escena: Escena | null = null;
    let geo: ReturnType<typeof geometria> | null = null;
    let aspectoMano = 390 / 325;
    // c: avance del cierre (0 → 1). pm: estado de las partículas (1 = órbita, 0 = mano).
    let c = fijo ? 1 : 0;
    const pm = () => 1 - suave(0.05, 0.62, c);
    let reloj = 0;
    let raf = 0;
    let vivo = true;

    const aplicar = () => {
      if (!geo) return;
      const { g } = geo;
      const e = suave(0.25, 0.95, pm());
      const cx = g.centro0[0] + (g.centro1[0] - g.centro0[0]) * e;
      const cy = g.centro0[1] + (g.centro1[1] - g.centro0[1]) * e;
      const s = g.escala0 + (g.escala1 - g.escala0) * e;
      orbitas.current?.setAttribute("transform", `translate(${cx} ${cy}) scale(${s})`);
      if (nucleo.current) nucleo.current.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%) scale(${1 + 0.35 * e})`;
      for (const n of NODOS) {
        const nodo = nodos.current[n.id];
        if (!nodo) continue;
        const a = g.anillos[n.anillo];
        const th = n.theta + (n.anillo === 0 ? reloj * 0.07 : -reloj * 0.055);
        const x = a.rx * Math.cos(th);
        const y = a.ry * Math.sin(th);
        const tam = geo.nodo * (n.id.startsWith("f") ? 0.78 : 1) * (1 + 0.15 * e);
        nodo.style.width = nodo.style.height = `${tam}px`;
        nodo.style.transform = `translate(${cx + (x * Math.cos(a.giro) - y * Math.sin(a.giro)) * s - tam / 2}px, ${cy + (x * Math.sin(a.giro) + y * Math.cos(a.giro)) * s - tam / 2}px)`;
      }
      electrones.current.forEach((ci, k) => {
        if (!ci) return;
        const a = g.anillos[k % 2];
        const th = k * 1.9 + reloj * (k % 2 ? -0.24 : 0.28);
        const x = a.rx * Math.cos(th);
        const y = a.ry * Math.sin(th);
        ci.setAttribute("cx", (x * Math.cos(a.giro) - y * Math.sin(a.giro)).toFixed(1));
        ci.setAttribute("cy", (x * Math.sin(a.giro) + y * Math.cos(a.giro)).toFixed(1));
      });
      // La mano humana vuelve a entrar mientras la digital se forma.
      if (humana.current) {
        const h = suave(0.3, 0.75, c);
        humana.current.style.transform = `translateX(${(1 - h) * 22}%)`;
        humana.current.style.opacity = String(h);
      }
      // La frase final y el acceso llegan cuando las manos ya están juntas.
      if (texto.current) {
        const t = suave(0.5, 0.8, c);
        texto.current.style.opacity = String(t);
        texto.current.style.transform = `translateY(${(1 - t) * 28}px)`;
        texto.current.style.visibility = t < 0.01 ? "hidden" : "visible";
      }
    };

    const medir = () => {
      geo = geometria(el.clientWidth, el.clientHeight, celular, aspectoMano);
      if (humana.current) Object.assign(humana.current.style, { left: `${geo.humana.left}px`, top: `${geo.humana.top}px`, width: `${geo.humana.width}px` });
      orbitas.current?.querySelectorAll("ellipse").forEach((elipse, i) => {
        const a = geo!.g.anillos[i];
        elipse.setAttribute("rx", String(a.rx));
        elipse.setAttribute("ry", String(a.ry));
        elipse.setAttribute("transform", `rotate(${(a.giro * 180) / Math.PI})`);
      });
      escena?.medir(el.clientWidth, el.clientHeight, geo.g);
      aplicar();
    };

    const avance = () => {
      raf = 0;
      if (fijo) return;
      const pista = el.parentElement!;
      const rp = pista.getBoundingClientRect();
      const re = el.getBoundingClientRect();
      const tope = parseFloat(getComputedStyle(el).top) * (re.height / el.offsetHeight || 1);
      // Empieza un poco antes de quedar fijo, para que la vuelta a la mano se vea mientras llega.
      const nuevo = Math.min(1, Math.max(0, (tope + re.height * 0.35 - rp.top) / (rp.height - re.height * 0.65)));
      if (Math.abs(nuevo - c) < 0.0005) return;
      c = nuevo;
      escena?.dibujar(pm());
      aplicar();
    };
    const alScroll = () => {
      if (!raf) raf = requestAnimationFrame(avance);
    };

    const ro = new ResizeObserver(medir);
    ro.observe(el);
    medir();
    if (!fijo) {
      window.addEventListener("scroll", alScroll, { passive: true });
      avance();
    }

    // La órbita sigue girando mientras se ve (30 fps en celular).
    let rafOrbita = 0;
    let ultimo = performance.now();
    let pintado = 0;
    let aLaVista = false;
    const girar = (ahora: number) => {
      rafOrbita = aLaVista ? requestAnimationFrame(girar) : 0;
      reloj += Math.min(0.1, (ahora - ultimo) / 1000);
      ultimo = ahora;
      if (celular && ahora - pintado < 32) return;
      pintado = ahora;
      aplicar();
    };
    const vigia = new IntersectionObserver(([e]) => {
      aLaVista = e.isIntersecting;
      if (aLaVista && !rafOrbita && !fijo) {
        ultimo = performance.now();
        rafOrbita = requestAnimationFrame(girar);
      }
    }, { rootMargin: "100px" });
    vigia.observe(el);

    const pocos = celular || (navigator.hardwareConcurrency ?? 8) <= 4;
    let soltarVigia = () => {};
    Promise.all([import("./particulas"), import("./bucle")]).then(async ([{ muestrearMano, crearEscena }, { vigilar }]) => {
      const datos = await muestrearMano("/plataforma/v6/mano-puntos.webp", celular ? 2600 : pocos ? 5000 : 7500);
      if (!vivo) return;
      aspectoMano = datos.aspecto;
      try {
        escena = crearEscena(canvas, datos, { entrada: false, dprMax: celular ? 1.5 : 2, polvo: celular ? 200 : 500, vivo: !fijo, fps: pocos ? 30 : 60 });
      } catch {
        return;
      }
      medir();
      escena.dibujar(pm());
      if (escena.bucle) soltarVigia = vigilar(el, escena.bucle);
    });

    return () => {
      vivo = false;
      soltarVigia();
      vigia.disconnect();
      cancelAnimationFrame(rafOrbita);
      ro.disconnect();
      window.removeEventListener("scroll", alScroll);
      cancelAnimationFrame(raf);
      escena?.destruir();
    };
  }, [celular, fijo]);

  const estilo: CSSProperties = fijo
    ? { position: "relative", height: celular ? 760 : 800 }
    : { position: "sticky", top: "var(--tope)", height: "calc(100dvh - var(--tope))", minHeight: celular ? 640 : 600, maxHeight: celular ? 900 : 980 };

  return (
    <div ref={raiz} className="relative overflow-hidden" style={estilo}>
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(60% 45% at 50% 72%, rgba(36,48,217,.24), transparent 70%), radial-gradient(40% 30% at 85% 75%, rgba(242,179,65,.06), transparent 70%)" }} />
      <canvas ref={lienzo} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <linearGradient id="v6-linea-cierre" x1="0" x2="1">
            <stop offset="0" stopColor="#5FE3DC" stopOpacity=".9" />
            <stop offset=".5" stopColor="#9CB0FF" stopOpacity=".25" />
            <stop offset="1" stopColor="#5FE3DC" stopOpacity=".8" />
          </linearGradient>
        </defs>
        <g ref={orbitas} style={{ opacity: 0.7 }}>
          <ellipse fill="none" stroke="url(#v6-linea-cierre)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <ellipse fill="none" stroke="url(#v6-linea-cierre)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          {[0, 1, 2, 3].map((k) => (
            <circle
              key={k}
              ref={(ci) => {
                electrones.current[k] = ci;
              }}
              r={celular ? 2.2 : 2.8}
              fill={k % 2 ? "#FFE3A8" : "#CFFBF8"}
              style={{ filter: `drop-shadow(0 0 5px ${k % 2 ? "#F2B341" : "#5FE3DC"})` }}
            />
          ))}
        </g>
      </svg>
      <div ref={nucleo} aria-hidden className="v6-nucleo pointer-events-none absolute left-0 top-0" style={{ width: celular ? 66 : 96, height: celular ? 66 : 96 }}>
        <img src="/marca/simbolo.webp" alt="" width={celular ? 40 : 58} height={celular ? 40 : 58} draggable={false} />
      </div>
      {NODOS.map((n) => (
        <div
          key={n.id}
          ref={(d) => {
            nodos.current[n.id] = d;
          }}
          aria-hidden
          className={`v6-nodo ${n.id === "vida" ? "vida" : ""} ${n.id.startsWith("f") ? "futuro" : ""}`}
        >
          {n.id.startsWith("f") && (
            <>
              <span className="v6-futuro-vidrio" />
              <span className="v6-futuro-puntos">
                <i />
                <i />
                <i />
              </span>
            </>
          )}
          {n.id === "student" && <IconoStudent s={celular ? 24 : 32} />}
          {n.id === "vida" && <IconoVida s={celular ? 24 : 32} />}
        </div>
      ))}
      <img
        ref={humana}
        src={celular ? "/plataforma/v6/mano-humana-movil.webp" : "/plataforma/v6/mano-humana.webp"}
        alt=""
        aria-hidden
        draggable={false}
        loading="lazy"
        className="pointer-events-none absolute select-none"
        style={{ maxWidth: "none", opacity: 0, filter: "drop-shadow(0 0 28px rgba(242,179,65,.12))" }}
      />

      {/* Frase final y acceso. */}
      <div ref={texto} className="absolute inset-x-0 z-10 flex flex-col items-center px-5 text-center" style={{ top: celular ? 64 : 92, opacity: 0, visibility: "hidden" }}>
        <h2 className="v6-h1" style={{ fontSize: celular ? 30 : 60, lineHeight: 1.08, maxWidth: celular ? 350 : 860 }}>
          Hecho con IA, por un humano, <span style={{ color: "#F2B341" }}>para humanos.</span>
        </h2>
        <p style={{ marginTop: celular ? 14 : 18, fontSize: celular ? 16 : 19, color: "var(--texto-2)", maxWidth: 520 }}>Student y Vida son gratis por ahora. Crea tu cuenta y empieza hoy.</p>
        <a href="/entrar" className="v6-cta" style={{ marginTop: celular ? 20 : 28 }}>
          Crear mi cuenta gratis
        </a>
        <a href="/entrar" className="mt-2 flex min-h-11 items-center text-[15px]" style={{ color: "var(--texto-2)", textDecoration: "underline", textUnderlineOffset: 4 }}>
          Ya tengo cuenta
        </a>
      </div>
    </div>
  );
}

function Pie({ celular }: { celular: boolean }) {
  const quieto = !!useReducedMotion();
  const columnas: [string, [string, string, boolean?][]][] = [
    [
      "Herramientas",
      [
        ["Auxi Student", "/student"],
        ["Auxi Vida", "/vida"],
        ["Vendoe (sitio aparte)", "/negocio", true],
      ],
    ],
    [
      "Ayuda",
      [
        ["Preguntas frecuentes", "#preguntas"],
        ["Privacidad", "/privacidad"],
        ["Términos", "/terminos"],
      ],
    ],
    [
      "Sígueme",
      [
        ["Instagram", INSTAGRAM_URL, true],
        ["TikTok", TIKTOK_URL, true],
        ["WhatsApp", WHATSAPP, true],
      ],
    ],
  ];
  const entra = (i: number) =>
    quieto
      ? {}
      : {
          initial: { opacity: 0, y: 22 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-30px" },
          transition: { duration: 0.6, delay: i * 0.08, ease: SUAVE },
        };
  return (
    <footer className="relative overflow-hidden" style={{ padding: celular ? "56px 20px 0" : "80px 64px 0", borderTop: "1px solid rgba(255,255,255,.1)" }}>
      <div className="mx-auto" style={{ maxWidth: 1100, display: "grid", gridTemplateColumns: celular ? "1fr 1fr" : "2fr 1fr 1fr 1fr", gap: celular ? "32px 20px" : 40 }}>
        <motion.div {...entra(0)} style={{ gridColumn: celular ? "1 / -1" : undefined }}>
          <a href="#" className="flex min-h-11 items-center gap-2.5 font-semibold text-white no-underline" style={{ letterSpacing: ".16em", fontSize: 16 }}>
            <img src="/marca/simbolo.webp" alt="" width={28} height={28} />
            AUXI STUDIO
          </a>
          <p style={{ marginTop: 10, fontSize: 15, lineHeight: 1.5, color: "var(--texto-2)", maxWidth: 300 }}>Herramientas con IA, hechas a tu medida.</p>
        </motion.div>
        {columnas.map(([titulo, items], i) => (
          <motion.nav key={titulo} aria-label={titulo} {...entra(i + 1)}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: 0 }}>{titulo}</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "10px 0 0" }}>
              {items.map(([n, h, externo]) => (
                <li key={n}>
                  <a href={h} {...(externo ? { target: "_blank", rel: "noopener" } : {})} className="v6-pie-enlace">
                    {n}
                  </a>
                </li>
              ))}
            </ul>
          </motion.nav>
        ))}
      </div>
      <motion.p
        className="mx-auto"
        style={{ maxWidth: 1100, marginTop: celular ? 36 : 56, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,.08)", fontSize: 13, color: "#9AA6C4" }}
        {...entra(4)}
      >
        © 2026 Auxi Studio por Daniel Chong
      </motion.p>
      {/* La marca grande que sube y se ilumina al llegar al final. */}
      <motion.p
        aria-hidden
        className="v6-pie-marca"
        style={{ fontSize: celular ? 52 : "min(12.5vw, 168px)" }}
        initial={quieto ? false : { y: "40%", opacity: 0, backgroundPosition: "100% 0" }}
        whileInView={{ y: "0%", opacity: 1, backgroundPosition: "0% 0" }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: SUAVE }}
      >
        AUXI STUDIO
      </motion.p>
      <style>{`
        .v6 .v6-pie-enlace { display:flex; align-items:center; min-height:44px; font-size:15px; color: var(--texto-2); text-decoration:none; transition: color .15s, transform .2s; }
        .v6 .v6-pie-enlace:hover { color:#fff; transform: translateX(3px); }
        .v6 .v6-pie-marca { margin: ${celular ? 24 : 32}px 0 -0.18em; text-align:center; font-weight:700; letter-spacing:-0.04em; line-height:1; white-space:nowrap;
          background: linear-gradient(100deg, rgba(255,255,255,.06) 30%, rgba(95,227,220,.35) 45%, rgba(242,179,65,.3) 52%, rgba(255,255,255,.06) 68%);
          background-size: 300% 100%; -webkit-background-clip:text; background-clip:text; color:transparent; user-select:none; }
      `}</style>
    </footer>
  );
}

export function CierreV6({ celular }: { celular: boolean }) {
  const quieto = !!useReducedMotion();
  return (
    <>
      <section id="cierre" aria-label="Empieza">
        {quieto ? (
          <Escenario celular={celular} fijo />
        ) : (
          <div className="relative" style={{ height: `calc((100dvh - var(--tope)) * ${celular ? 1.9 : 2})`, minHeight: celular ? 1250 : 1200 }}>
            <Escenario celular={celular} fijo={false} />
          </div>
        )}
      </section>
      <Pie celular={celular} />
    </>
  );
}
