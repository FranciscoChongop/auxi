/**
 * Héroe v6 (boceto en /propuesta): «Un ecosistema que nace de una mano».
 *
 * La mano digital es de partículas (WebGL propio, ver particulas.ts); la mano humana es la foto de Daniel.
 * Al bajar, la mano digital se suelta desde los dedos y forma las órbitas de «Todo en una cuenta».
 * Texto, botones y nombres de apps son HTML real; el lienzo no recibe clics.
 * Celulares modestos: pocas partículas, se dibuja solo al hacer scroll, imagen quieta si no hay WebGL
 * o si la persona pidió reducir movimiento.
 */
import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { Escena, Geometria } from "./particulas";

const FIGTREE = "Figtree, system-ui, sans-serif";

const ESTILOS_V6 = `
.v6 { --noche:#080E25; --texto:#F4F6FF; --texto-2:#ADB8CF; --cobalto:#2430D9; --turquesa:#5FE3DC; --oro:#F2B341;
  background: var(--noche); color: var(--texto); font-family: ${FIGTREE}; font-weight: 500; }
.v6 a, .v6 button { -webkit-tap-highlight-color: transparent; }
.v6 :focus-visible { outline: 3px solid var(--turquesa); outline-offset: 3px; border-radius: 10px; }
.v6 .v6-h1 { font-family: ${FIGTREE}; font-weight: 700; letter-spacing: -0.035em; margin: 0; color: #fff; text-wrap: balance; }
.v6 .v6-cta { display:inline-flex; align-items:center; justify-content:center; min-height:52px; padding:0 26px; border-radius:14px;
  background:#F4F1E8; color:#080E25; font-weight:700; font-size:17px; text-decoration:none; transition: transform .08s ease-out, background-color .15s; }
.v6 .v6-cta:hover { background:#fff; }
.v6 .v6-cta:active { transform: scale(.97); }
.v6 .v6-nav a, .v6 .v6-nav button { color: var(--texto); text-decoration: none; }
.v6 .v6-nav a:hover { color: #fff; }
.v6 .v6-entrar { display:inline-flex; align-items:center; min-height:44px; padding:0 18px; border-radius:12px; border:1.5px solid rgba(255,255,255,.45); font-weight:600; }
.v6 .v6-entrar:hover { border-color:#fff; background: rgba(255,255,255,.06); }
.v6 .v6-nodo { position:absolute; left:0; top:0; display:grid; place-items:center; border-radius:18px; will-change: transform;
  background: linear-gradient(150deg, rgba(120,150,255,.38), rgba(36,48,217,.28) 55%, rgba(8,14,37,.55));
  border: 1px solid rgba(160,185,255,.55); box-shadow: inset 0 1px 0 rgba(255,255,255,.35), 0 10px 30px rgba(36,48,217,.45), 0 0 0 1px rgba(36,48,217,.2); }
.v6 .v6-nodo.vida { background: linear-gradient(150deg, rgba(95,227,220,.35), rgba(14,91,87,.4) 55%, rgba(8,14,37,.55));
  border-color: rgba(95,227,220,.6); box-shadow: inset 0 1px 0 rgba(255,255,255,.3), 0 10px 30px rgba(14,91,87,.55); }
.v6 .v6-nodo.futuro { filter: blur(3px); opacity:.45; background: rgba(255,255,255,.06); border-color: rgba(255,255,255,.18); box-shadow:none; }
.v6 .v6-etiqueta { position:absolute; left:50%; top:calc(100% + 8px); transform:translateX(-50%); white-space:nowrap; font-size:14px; font-weight:600;
  color:#fff; text-decoration:none; padding:4px 10px; border-radius:999px; background: rgba(8,14,37,.7); border:1px solid rgba(255,255,255,.16); }
.v6 .v6-etiqueta:hover { border-color: rgba(255,255,255,.5); }
@media (prefers-reduced-motion: reduce) { .v6 .v6-cta { transition:none; } }
`;

type Props = { celular: boolean };

/* ---------- Geometría: dónde va cada cosa según el tamaño del escenario ---------- */
function geometria(W: number, H: number, celular: boolean, aspectoMano: number) {
  const ASP_HUMANA = 1774 / 879;
  const PUNTA_HUMANA = [0.15, 0.345]; // punta del índice dentro de la foto (fracción)
  const PUNTA_DIGITAL = [0.955, 0.1]; // punta del índice dentro de la plantilla
  if (celular) {
    const k = Math.min(1, H / 760);
    const mw = W * 0.64 * k;
    const mh = mw / aspectoMano;
    const punta: [number, number] = [W * 0.335, H * 0.79];
    const hw = W * 0.78 * k;
    const g: Geometria = {
      mano: { x: punta[0] - PUNTA_DIGITAL[0] * mw, y: punta[1] - PUNTA_DIGITAL[1] * mh, w: mw, h: mh },
      centro0: [W * 0.5, punta[1] - 26 * k],
      centro1: [W * 0.5, H * 0.6],
      escala0: 1 * k,
      escala1: 1.12,
      anillos: [
        { rx: W * 0.36, ry: 44, giro: -0.2 },
        { rx: W * 0.29, ry: 58, giro: 0.34 },
      ],
    };
    return { g, humana: { left: W * 0.665 - PUNTA_HUMANA[0] * hw, top: punta[1] - PUNTA_HUMANA[1] * (hw / ASP_HUMANA), width: hw }, nodo: 46 };
  }
  const k = Math.min(1, H / 820);
  const mw = W * 0.42 * k;
  const mh = mw / aspectoMano;
  const punta: [number, number] = [W * 0.37, H - mh * 0.6];
  const hw = W * 0.5 * k;
  const g: Geometria = {
    mano: { x: punta[0] - PUNTA_DIGITAL[0] * mw, y: punta[1] - PUNTA_DIGITAL[1] * mh, w: mw, h: mh },
    centro0: [W * 0.5, punta[1] - 16 * k],
    centro1: [W * 0.5, H * 0.58],
    escala0: 1 * k,
    escala1: 1.3,
    anillos: [
      { rx: W * 0.205, ry: 78, giro: -0.19 },
      { rx: W * 0.17, ry: 104, giro: 0.33 },
    ],
  };
  return { g, humana: { left: W * 0.63 - PUNTA_HUMANA[0] * hw, top: punta[1] - PUNTA_HUMANA[1] * (hw / ASP_HUMANA), width: hw }, nodo: 64 };
}

/** Nodos de la órbita: anillo (0 = A, 1 = B) y ángulo. */
const NODOS: { id: "student" | "vida" | "f1" | "f2"; anillo: 0 | 1; theta: number }[] = [
  { id: "student", anillo: 0, theta: -2.25 },
  { id: "vida", anillo: 1, theta: -0.95 },
  { id: "f1", anillo: 0, theta: 0.95 },
  { id: "f2", anillo: 1, theta: 2.3 },
];

const suave = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/* ---------- Íconos (SVG propio, sin logos ajenos) ---------- */
const IconoStudent = ({ s }: { s: number }) => (
  <svg width={s} height={s} viewBox="0 0 32 32" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="8" y="5" width="18" height="23" rx="3" />
    <path d="M5 10h5M5 16h5M5 22h5M13 11h9M13 16h9M13 21h6" />
  </svg>
);
const IconoVida = ({ s }: { s: number }) => (
  <svg width={s} height={s} viewBox="0 0 32 32" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M6 10.5V24a3 3 0 0 0 3 3h16a2 2 0 0 0 2-2v-4M6 10.5A3 3 0 0 1 9 7.5h13v3" />
    <path d="M6 10.5h19a2 2 0 0 1 2 2V15" />
    <rect x="19" y="15" width="9" height="6" rx="2" />
    <circle cx="22.5" cy="18" r=".6" fill="#fff" />
  </svg>
);

/* ---------- Escenario ---------- */
type ModoEscenario = { tipo: "scroll" } | { tipo: "fijo"; p: number };

function Escenario({ celular, modo, conMovimiento }: Props & { modo: ModoEscenario; conMovimiento: boolean }) {
  const raiz = useRef<HTMLDivElement>(null);
  const lienzo = useRef<HTMLCanvasElement>(null);
  const textoHeroe = useRef<HTMLDivElement>(null);
  const textoCuenta = useRef<HTMLDivElement>(null);
  const humana = useRef<HTMLImageElement>(null);
  const orbitas = useRef<SVGGElement>(null);
  const nucleo = useRef<HTMLDivElement>(null);
  const nodos = useRef<Record<string, HTMLDivElement | null>>({});
  const leyenda = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState(false);
  const fijo = modo.tipo === "fijo" ? modo.p : null;

  useEffect(() => {
    const el = raiz.current;
    const canvas = lienzo.current;
    if (!el || !canvas) return;
    let escena: Escena | null = null;
    let geo: ReturnType<typeof geometria> | null = null;
    let aspectoMano = 390 / 325;
    let p = fijo ?? 0;
    let raf = 0;
    let vivo = true;

    const aplicarDom = () => {
      if (!geo) return;
      const { g } = geo;
      const e = suave(0.25, 0.95, p);
      const cx = g.centro0[0] + (g.centro1[0] - g.centro0[0]) * e;
      const cy = g.centro0[1] + (g.centro1[1] - g.centro0[1]) * e;
      const s = g.escala0 + (g.escala1 - g.escala0) * e;
      if (orbitas.current) {
        orbitas.current.setAttribute("transform", `translate(${cx} ${cy}) scale(${s})`);
        orbitas.current.style.opacity = String(0.55 + 0.45 * suave(0.5, 0.95, p));
      }
      if (nucleo.current) {
        const t = 1 + 0.35 * e;
        nucleo.current.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%) scale(${t})`;
      }
      for (const n of NODOS) {
        const nodo = nodos.current[n.id];
        if (!nodo) continue;
        const a = g.anillos[n.anillo];
        const x = a.rx * Math.cos(n.theta);
        const y = a.ry * Math.sin(n.theta);
        const px = cx + (x * Math.cos(a.giro) - y * Math.sin(a.giro)) * s;
        const py = cy + (x * Math.sin(a.giro) + y * Math.cos(a.giro)) * s;
        const tam = geo.nodo * (n.id.startsWith("f") ? 0.85 : 1) * (1 + 0.15 * e);
        nodo.style.width = nodo.style.height = `${tam}px`;
        nodo.style.transform = `translate(${px - tam / 2}px, ${py - tam / 2}px)`;
      }
      const salida = suave(0.03, 0.32, p);
      if (textoHeroe.current) {
        textoHeroe.current.style.opacity = String(1 - salida);
        textoHeroe.current.style.transform = `translateY(${-36 * salida}px)`;
        textoHeroe.current.style.visibility = salida > 0.99 ? "hidden" : "visible";
      }
      const llegada = suave(0.6, 0.88, p);
      if (textoCuenta.current) {
        textoCuenta.current.style.opacity = String(llegada);
        textoCuenta.current.style.transform = `translateY(${24 * (1 - llegada)}px)`;
        textoCuenta.current.style.visibility = llegada < 0.01 ? "hidden" : "visible";
      }
      if (leyenda.current) leyenda.current.style.opacity = String(llegada);
      el.querySelectorAll<HTMLElement>(".v6-etiqueta").forEach((et) => {
        et.style.opacity = String(suave(0.55, 0.85, p));
      });
      if (humana.current) {
        const h = suave(0.08, 0.55, p);
        humana.current.style.transform = `translateX(${h * 22}%)`;
        humana.current.style.opacity = String(1 - h);
      }
    };

    const medir = () => {
      const W = el.clientWidth;
      const H = el.clientHeight;
      geo = geometria(W, H, celular, aspectoMano);
      if (humana.current) {
        Object.assign(humana.current.style, { left: `${geo.humana.left}px`, top: `${geo.humana.top}px`, width: `${geo.humana.width}px` });
      }
      orbitas.current?.querySelectorAll("ellipse").forEach((e, i) => {
        const a = geo!.g.anillos[i];
        e.setAttribute("rx", String(a.rx));
        e.setAttribute("ry", String(a.ry));
        e.setAttribute("transform", `rotate(${(a.giro * 180) / Math.PI})`);
      });
      escena?.medir(W, H, geo.g);
      aplicarDom();
    };

    const avance = () => {
      raf = 0;
      if (fijo !== null) return;
      const pista = el.parentElement!;
      const rp = pista.getBoundingClientRect();
      const re = el.getBoundingClientRect();
      const tope = parseFloat(getComputedStyle(el).top) * (re.height / el.offsetHeight || 1);
      const recorrido = rp.height - re.height;
      const nuevo = Math.min(1, Math.max(0, (tope - rp.top) / recorrido));
      if (Math.abs(nuevo - p) < 0.0005) return;
      p = nuevo;
      escena?.dibujar(p);
      aplicarDom();
    };
    const alScroll = () => {
      if (!raf) raf = requestAnimationFrame(avance);
    };

    const ro = new ResizeObserver(medir);
    ro.observe(el);
    medir();
    if (fijo === null) {
      window.addEventListener("scroll", alScroll, { passive: true });
      avance();
    }

    // Las partículas cargan después del texto: el héroe se entiende aunque esto falle.
    const pocos = celular || (navigator.hardwareConcurrency ?? 8) <= 4;
    import("./particulas").then(async ({ muestrearMano, crearEscena }) => {
      const datos = await muestrearMano("/plataforma/v6/mano-puntos.webp", celular ? 2200 : pocos ? 4200 : 6500);
      if (!vivo) return;
      aspectoMano = datos.aspecto;
      try {
        escena = crearEscena(canvas, datos, { entrada: conMovimiento && fijo === null, dprMax: celular ? 1.5 : 2 });
      } catch {
        return; // sin WebGL ni Canvas: queda el héroe sin partículas, que igual se entiende
      }
      medir();
      escena.dibujar(p);
    });

    return () => {
      vivo = false;
      ro.disconnect();
      window.removeEventListener("scroll", alScroll);
      cancelAnimationFrame(raf);
      escena?.destruir();
    };
  }, [celular, fijo, conMovimiento]);

  const enlaces: [string, string][] = [
    ["#apps", "Herramientas"],
    ["#preguntas", "Preguntas"],
    ["#sobre-mi", "Sobre mí"],
  ];
  const estiloEscenario: CSSProperties =
    modo.tipo === "scroll"
      ? { position: "sticky", top: "var(--tope)", height: "calc(100dvh - var(--tope))", minHeight: celular ? 640 : 600, maxHeight: celular ? 900 : 980 }
      : { position: "relative", height: celular ? 760 : 800 };

  return (
    <div ref={raiz} className="relative overflow-hidden" style={estiloEscenario}>
      {/* Luz de fondo: solo CSS. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 45% at 50% 72%, rgba(36,48,217,.28), transparent 70%), radial-gradient(35% 30% at 18% 80%, rgba(95,227,220,.08), transparent 70%), radial-gradient(40% 30% at 85% 75%, rgba(242,179,65,.06), transparent 70%)",
        }}
      />
      <canvas ref={lienzo} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />

      {/* Órbitas (líneas finas) y núcleo de luz: acompañan a las partículas. */}
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <linearGradient id="v6-linea" x1="0" x2="1">
            <stop offset="0" stopColor="#5FE3DC" stopOpacity=".9" />
            <stop offset=".5" stopColor="#9CB0FF" stopOpacity=".25" />
            <stop offset="1" stopColor="#5FE3DC" stopOpacity=".8" />
          </linearGradient>
        </defs>
        <g ref={orbitas}>
          <ellipse fill="none" stroke="url(#v6-linea)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <ellipse fill="none" stroke="url(#v6-linea)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </g>
      </svg>
      <div
        ref={nucleo}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 rounded-full"
        style={{
          width: celular ? 40 : 58,
          height: celular ? 40 : 58,
          background: "radial-gradient(circle at 38% 32%, #fff 0, #A9C2FF 14%, #2E4BFF 46%, rgba(36,48,217,.0) 72%)",
          boxShadow: "0 0 60px 18px rgba(36,48,217,.35)",
        }}
      />

      {/* Nodos: Student y Vida nítidos (enlaces reales); los futuros, borrosos y sin nombre. */}
      {NODOS.map((n) => (
        <div
          key={n.id}
          ref={(d) => {
            nodos.current[n.id] = d;
          }}
          className={`v6-nodo ${n.id === "vida" ? "vida" : ""} ${n.id.startsWith("f") ? "futuro" : ""}`}
          aria-hidden={n.id.startsWith("f") ? true : undefined}
        >
          {n.id === "student" && <IconoStudent s={celular ? 24 : 32} />}
          {n.id === "vida" && <IconoVida s={celular ? 24 : 32} />}
          {n.id === "student" && (
            <a href="#student" className="v6-etiqueta" style={{ opacity: 0 }}>
              Auxi Student
            </a>
          )}
          {n.id === "vida" && (
            <a href="#vida" className="v6-etiqueta" style={{ opacity: 0 }}>
              Auxi Vida
            </a>
          )}
        </div>
      ))}

      {/* Mano humana (foto de Daniel, sin fondo). */}
      <img
        ref={humana}
        src={celular ? "/plataforma/v6/mano-humana-movil.webp" : "/plataforma/v6/mano-humana.webp"}
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute select-none"
        style={{ maxWidth: "none", filter: "drop-shadow(0 0 28px rgba(242,179,65,.12))" }}
      />

      {/* Cabecera: una sola, real. */}
      <header className="v6-nav absolute inset-x-0 top-0 z-20 flex items-center justify-between" style={{ height: celular ? 64 : 76, padding: celular ? "0 20px" : "0 56px" }}>
        <a href="#" className="flex min-h-11 items-center gap-2.5 font-semibold" style={{ letterSpacing: ".16em", fontSize: celular ? 15 : 17 }}>
          <img src="/marca/simbolo.webp" alt="" width={celular ? 24 : 28} height={celular ? 24 : 28} />
          AUXI STUDIO
        </a>
        {!celular && (
          <nav aria-label="Principal" className="flex items-center gap-9 text-[16px]">
            {enlaces.map(([h, t]) => (
              <a key={h} href={h} className="flex min-h-11 items-center">
                {t}
              </a>
            ))}
          </nav>
        )}
        <div className="flex items-center gap-2">
          <a href="/entrar" className="v6-entrar">
            Entrar
          </a>
          {celular && (
            <button
              type="button"
              aria-expanded={menu}
              aria-controls="v6-menu"
              aria-label={menu ? "Cerrar menú" : "Abrir menú"}
              onClick={() => setMenu((m) => !m)}
              onKeyDown={(e) => e.key === "Escape" && setMenu(false)}
              className="grid h-11 w-11 place-items-center rounded-[12px]"
            >
              <svg width="22" height="22" viewBox="0 0 22 22" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                {menu ? <path d="M5 5l12 12M17 5L5 17" /> : <path d="M3 7h16M3 15h16" />}
              </svg>
            </button>
          )}
        </div>
        {celular && menu && (
          <nav
            id="v6-menu"
            aria-label="Principal"
            className="absolute inset-x-3 top-[60px] rounded-[16px] p-2"
            style={{ background: "rgba(16,24,58,.96)", border: "1px solid rgba(255,255,255,.14)" }}
            onKeyDown={(e) => e.key === "Escape" && setMenu(false)}
          >
            {enlaces.map(([h, t]) => (
              <a key={h} href={h} onClick={() => setMenu(false)} className="flex min-h-12 items-center rounded-[10px] px-3 text-[17px] hover:bg-white/5">
                {t}
              </a>
            ))}
          </nav>
        )}
      </header>

      {/* Texto del héroe. */}
      <div ref={textoHeroe} className="absolute inset-x-0 z-10 flex flex-col items-center px-5 text-center" style={{ top: celular ? 92 : 112 }}>
        <h1 className="v6-h1" style={{ fontSize: celular ? 34 : 76, lineHeight: celular ? "39px" : "78px", maxWidth: celular ? 350 : 900 }}>
          Hecho con IA.
          <br />
          Pensado para tu vida.
        </h1>
        <p style={{ marginTop: celular ? 14 : 20, fontSize: celular ? 16 : 19, lineHeight: 1.5, color: "var(--texto-2)", maxWidth: celular ? 340 : 640 }}>
          Herramientas para estudiar y organizar tu día, creadas por Daniel Chong.
        </p>
        <a href="#apps" className="v6-cta" style={{ marginTop: celular ? 20 : 28 }}>
          Explorar herramientas
        </a>
        <p style={{ marginTop: 10, fontSize: 14, color: "var(--texto-2)" }}>Student y Vida: gratis por ahora</p>
      </div>

      {/* Texto de «Todo en una cuenta» (llega con las partículas). */}
      <div ref={textoCuenta} id="apps" className="absolute inset-x-0 z-10 flex flex-col items-center px-5 text-center" style={{ top: celular ? 96 : 120, opacity: 0, visibility: "hidden" }}>
        <h2 className="v6-h1" style={{ fontSize: celular ? 32 : 52, lineHeight: 1.1 }}>
          Todo en una cuenta.
        </h2>
        <p style={{ marginTop: 14, fontSize: celular ? 16 : 19, color: "var(--texto-2)" }}>Student y Vida, conectadas a tu cuenta de AUXI.</p>
      </div>
      <div
        ref={leyenda}
        className="absolute inset-x-0 z-10 flex justify-center gap-5 text-[14px]"
        style={{ bottom: celular ? 28 : 40, color: "var(--texto-2)", opacity: 0 }}
      >
        <span className="flex items-center gap-2">
          <i className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: "#5FE3DC" }} /> Disponibles
        </span>
        <span className="flex items-center gap-2">
          <i className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: "rgba(255,255,255,.35)", filter: "blur(1px)" }} /> En exploración
        </span>
      </div>
    </div>
  );
}

function Seccion({ id, children }: { id: string; children: ReactNode }) {
  return (
    <section id={id} className="px-6 py-16 text-center" style={{ color: "var(--texto-2)" }}>
      {children}
    </section>
  );
}

export function HeroV6({ celular }: Props) {
  const reducir = !!useReducedMotion();
  return (
    <div className="v6">
      <style>{ESTILOS_V6}</style>
      {reducir ? (
        // Movimiento reducido: dos cuadros quietos, sin scroll animado.
        <>
          <Escenario celular={celular} modo={{ tipo: "fijo", p: 0 }} conMovimiento={false} />
          <Escenario celular={celular} modo={{ tipo: "fijo", p: 1 }} conMovimiento={false} />
        </>
      ) : (
        <div className="relative" style={{ height: `calc((100dvh - var(--tope)) * ${celular ? 2.2 : 2.4})`, minHeight: celular ? 1400 : 1440 }}>
          <Escenario celular={celular} modo={{ tipo: "scroll" }} conMovimiento />
        </div>
      )}
      <Seccion id="siguiente">
        <p className="text-[15px]">Boceto v6 · aquí siguen Auxi Student y Auxi Vida (próxima entrega, cuando apruebes el héroe).</p>
      </Seccion>
    </div>
  );
}
