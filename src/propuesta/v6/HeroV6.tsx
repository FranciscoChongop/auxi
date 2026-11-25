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
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AppsV6 } from "./AppsV6";
import { CierreV6 } from "./CierreV6";
import { CapaEstrellas } from "./estrellas";
import { IconoStudent, IconoVida } from "./iconos";
import { PreguntasV6 } from "./PreguntasV6";
import { SobreMiV6 } from "./SobreMiV6";
import { geometria, NODOS, suave } from "./orbita";
import type { Escena } from "./particulas";

const FIGTREE = "Figtree, system-ui, sans-serif";

const ESTILOS_V6 = `
.v6 { --noche:#080E25; --texto:#F4F6FF; --texto-2:#ADB8CF; --cobalto:#2430D9; --turquesa:#5FE3DC; --oro:#F2B341;
  position: relative; isolation: isolate; background: var(--noche); color: var(--texto); font-family: ${FIGTREE}; font-weight: 500; }
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
.v6 .v6-nodo.futuro { background:none; border:0; box-shadow:none; }
.v6 .v6-futuro-vidrio { position:absolute; inset:0; border-radius:16px; filter: blur(1.2px); opacity:.85;
  background: linear-gradient(150deg, rgba(160,180,255,.26), rgba(36,48,217,.12) 60%, rgba(255,255,255,.04)); border:1px solid rgba(200,212,255,.3); }
.v6 .v6-futuro-puntos { position:relative; display:flex; gap:4px; }
.v6 .v6-futuro-puntos i { width:5px; height:5px; border-radius:50%; background: rgba(220,228,255,.75); }
.v6 .v6-nucleo { display:grid; place-items:center; border-radius:50%;
  background: radial-gradient(circle at 34% 28%, rgba(255,255,255,.55) 0, rgba(190,205,255,.18) 22%, rgba(36,48,217,.22) 58%, rgba(10,16,60,.55) 100%);
  border: 1px solid rgba(170,190,255,.45); box-shadow: inset 0 -10px 24px rgba(36,48,217,.45), inset 0 6px 14px rgba(255,255,255,.18), 0 0 70px 16px rgba(36,48,217,.35); }
.v6 .v6-nucleo img { filter: drop-shadow(0 4px 10px rgba(0,0,0,.35)); }
.v6 .v6-etiqueta { position:absolute; left:50%; top:calc(100% + 8px); transform:translateX(-50%); white-space:nowrap; font-size:14px; font-weight:600;
  color:#fff; text-decoration:none; text-shadow: 0 1px 12px rgba(8,14,37,.95), 0 0 3px rgba(8,14,37,.9); }
.v6 .v6-etiqueta:hover { text-decoration: underline; text-underline-offset: 4px; }
@media (prefers-reduced-motion: reduce) { .v6 .v6-cta { transition:none; } }
`;

type Props = { celular: boolean };

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
  const mundo = useRef<HTMLDivElement>(null);
  const electrones = useRef<(SVGCircleElement | null)[]>([]);
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
    // Reloj de la órbita: los cuadritos y los puntos de luz giran solos desde el inicio.
    let reloj = 0;

    // Fases del recorrido: A (la mano se vuelve órbita) y Z (zoom hacia Auxi Student).
    // En los cuadros fijos (movimiento reducido) no hay zoom.
    const fases = () => (fijo !== null ? { pa: p, z: 0 } : { pa: Math.min(1, p / 0.58), z: suave(0.64, 1, p) });

    const aplicarDom = () => {
      if (!geo) return;
      const { g } = geo;
      const { pa, z } = fases();
      const e = suave(0.25, 0.95, pa);
      const cx = g.centro0[0] + (g.centro1[0] - g.centro0[0]) * e;
      const cy = g.centro0[1] + (g.centro1[1] - g.centro0[1]) * e;
      const s = g.escala0 + (g.escala1 - g.escala0) * e;
      if (orbitas.current) {
        orbitas.current.setAttribute("transform", `translate(${cx} ${cy}) scale(${s})`);
        orbitas.current.style.opacity = String((0.55 + 0.45 * suave(0.5, 0.95, pa)) * (1 - suave(0, 0.35, z)));
      }
      if (nucleo.current) {
        const t = 1 + 0.35 * e;
        nucleo.current.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%) scale(${t})`;
      }
      let foco: [number, number] = [cx, cy];
      for (const n of NODOS) {
        const nodo = nodos.current[n.id];
        if (!nodo) continue;
        const a = g.anillos[n.anillo];
        const th = n.theta + (n.anillo === 0 ? reloj * 0.07 : -reloj * 0.055);
        const x = a.rx * Math.cos(th);
        const y = a.ry * Math.sin(th);
        const px = cx + (x * Math.cos(a.giro) - y * Math.sin(a.giro)) * s;
        const py = cy + (x * Math.sin(a.giro) + y * Math.cos(a.giro)) * s;
        const futuro = n.id.startsWith("f");
        const tam = geo.nodo * (futuro ? 0.78 : 1) * (1 + 0.15 * e);
        nodo.style.width = nodo.style.height = `${tam}px`;
        nodo.style.transform = `translate(${px - tam / 2}px, ${py - tam / 2}px)`;
        if (n.id === "student") {
          foco = [px, py];
          const icono = nodo.querySelector<SVGElement>("svg");
          if (icono) icono.style.opacity = String(1 - suave(0.2, 0.5, z));
        } else {
          nodo.style.opacity = String(1 - suave(0, 0.35, z));
        }
      }
      // Puntos de luz que recorren las órbitas (coordenadas locales del grupo de órbitas).
      electrones.current.forEach((c, k) => {
        if (!c) return;
        const a = g.anillos[k % 2];
        const th = k * 1.9 + reloj * (k % 2 ? -0.24 : 0.28);
        const x = a.rx * Math.cos(th);
        const y = a.ry * Math.sin(th);
        c.setAttribute("cx", (x * Math.cos(a.giro) - y * Math.sin(a.giro)).toFixed(1));
        c.setAttribute("cy", (x * Math.sin(a.giro) + y * Math.cos(a.giro)).toFixed(1));
      });
      // Zoom: la «cámara» entra al cuadrito de Auxi Student hasta que llena la pantalla.
      if (mundo.current) {
        mundo.current.style.transformOrigin = `${foco[0]}px ${foco[1]}px`;
        mundo.current.style.transform = z > 0 ? `scale(${(1 + 26 * z * z * z).toFixed(3)})` : "";
      }
      canvas.style.opacity = String(1 - suave(0.15, 0.6, z));
      if (nucleo.current) nucleo.current.style.opacity = String(1 - suave(0.1, 0.45, z));
      // Al final del zoom el héroe se desvanece y deja ver la sección de Student, que ya está debajo:
      // no hay corte ni raya al seguir bajando.
      if (fijo === null) {
        el.style.opacity = String(1 - suave(0.8, 1, z));
        el.style.pointerEvents = z > 0.97 ? "none" : "";
      }
      const salida = suave(0.03, 0.32, pa);
      if (textoHeroe.current) {
        textoHeroe.current.style.opacity = String(1 - salida);
        textoHeroe.current.style.transform = `translateY(${-36 * salida}px)`;
        textoHeroe.current.style.visibility = salida > 0.99 ? "hidden" : "visible";
      }
      const llegada = suave(0.6, 0.88, pa) * (1 - suave(0, 0.22, z));
      if (textoCuenta.current) {
        textoCuenta.current.style.opacity = String(llegada);
        textoCuenta.current.style.transform = `translateY(${24 * (1 - llegada)}px)`;
        textoCuenta.current.style.visibility = llegada < 0.01 ? "hidden" : "visible";
      }
      if (leyenda.current) leyenda.current.style.opacity = String(llegada);
      // Los nombres se ven desde el inicio; se van al empezar el zoom.
      el.querySelectorAll<HTMLElement>(".v6-etiqueta").forEach((et) => {
        et.style.opacity = String(1 - suave(0, 0.18, z));
      });
      if (humana.current) {
        const h = suave(0.08, 0.55, pa);
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
      escena?.dibujar(fases().pa);
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

    // Bucle de la órbita: solo con movimiento, solo mientras el héroe se ve; 30 fps en celular.
    let rafOrbita = 0;
    let ultimo = performance.now();
    let pintado = 0;
    let aLaVista = true;
    const girar = (ahora: number) => {
      rafOrbita = aLaVista ? requestAnimationFrame(girar) : 0;
      const dt = Math.min(0.1, (ahora - ultimo) / 1000);
      ultimo = ahora;
      // Durante el zoom la órbita se congela, para que el cuadrito enfocado no tiemble.
      if (fases().z <= 0) reloj += dt;
      if (celular && ahora - pintado < 32) return;
      pintado = ahora;
      aplicarDom();
    };
    const vigia = new IntersectionObserver(([e]) => {
      aLaVista = e.isIntersecting;
      if (aLaVista && !rafOrbita && conMovimiento) {
        ultimo = performance.now();
        rafOrbita = requestAnimationFrame(girar);
      }
    }, { rootMargin: "100px" });
    if (conMovimiento) vigia.observe(el);

    // Las partículas cargan después del texto: el héroe se entiende aunque esto falle.
    const pocos = celular || (navigator.hardwareConcurrency ?? 8) <= 4;
    let soltarVigia = () => {};
    Promise.all([import("./particulas"), import("./bucle")]).then(async ([{ muestrearMano, crearEscena }, { vigilar }]) => {
      const datos = await muestrearMano("/plataforma/v6/mano-puntos.webp", celular ? 2600 : pocos ? 5000 : 7500);
      if (!vivo) return;
      aspectoMano = datos.aspecto;
      try {
        escena = crearEscena(canvas, datos, {
          entrada: conMovimiento && fijo === null,
          dprMax: celular ? 1.5 : 2,
          polvo: celular ? 500 : pocos ? 900 : 1400,
          vivo: conMovimiento,
          fps: celular || pocos ? 30 : 60,
        });
      } catch {
        return; // sin WebGL ni Canvas: queda el héroe sin partículas, que igual se entiende
      }
      medir();
      escena.dibujar(fases().pa);
      // Movimiento continuo solo mientras el héroe está a la vista.
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
  }, [celular, fijo, conMovimiento]);

  const enlaces: [string, string][] = [
    ["#apps", "Herramientas"],
    ["#preguntas", "Preguntas"],
    ["#sobre-mi", "Sobre mí"],
  ];
  const estiloEscenario: CSSProperties =
    modo.tipo === "scroll"
      ? { position: "sticky", top: "var(--tope)", height: "calc(100dvh - var(--tope))", minHeight: celular ? 640 : 600, maxHeight: celular ? 900 : 980, background: "#080E25" }
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
      <div ref={mundo} className="absolute inset-0" style={{ willChange: "transform" }}>
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
          {[0, 1, 2, 3].map((k) => (
            <circle
              key={k}
              ref={(c) => {
                electrones.current[k] = c;
              }}
              r={celular ? 2.2 : 2.8}
              fill={k % 2 ? "#FFE3A8" : "#CFFBF8"}
              style={{ filter: `drop-shadow(0 0 5px ${k % 2 ? "#F2B341" : "#5FE3DC"})` }}
            />
          ))}
        </g>
      </svg>
      {/* Núcleo: esfera de vidrio con el isotipo de AUXI dentro. */}
      <div ref={nucleo} aria-hidden className="v6-nucleo pointer-events-none absolute left-0 top-0" style={{ width: celular ? 66 : 96, height: celular ? 66 : 96 }}>
        <img src="/marca/simbolo.webp" alt="" width={celular ? 40 : 58} height={celular ? 40 : 58} draggable={false} />
      </div>

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
          {n.id.startsWith("f") && (
            <>
              <span className="v6-futuro-vidrio" />
              {/* Herramientas que vendrán: vidrio apenas borroso con tres puntos, sin nombre. */}
              <span className="v6-futuro-puntos">
                <i />
                <i />
                <i />
              </span>
            </>
          )}
          {n.id === "student" && <IconoStudent s={celular ? 24 : 32} />}
          {n.id === "vida" && <IconoVida s={celular ? 24 : 32} />}
          {n.id === "student" && (
            <a href="#student" className="v6-etiqueta">
              Auxi Student
            </a>
          )}
          {n.id === "vida" && (
            <a href="#vida" className="v6-etiqueta" style={celular ? { top: "auto", bottom: "calc(100% + 8px)" } : undefined}>
              Auxi Vida
            </a>
          )}
        </div>
      ))}
      </div>

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
        <h1 className="v6-h1" style={{ fontSize: celular ? 31 : 74, lineHeight: celular ? "36px" : "78px", maxWidth: celular ? 360 : 940 }}>
          Herramientas con IA,
          <br />
          hechas a tu medida.
        </h1>
        <p style={{ marginTop: celular ? 14 : 20, fontSize: celular ? 16 : 19, lineHeight: 1.5, color: "var(--texto-2)", maxWidth: celular ? 340 : 640 }}>
          Estudia jugando y ordena tu plata, con una sola cuenta.
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
    </div>
  );
}

export function HeroV6({ celular }: Props) {
  const reducir = !!useReducedMotion();
  // Rueda del mouse pausada y suave (solo con mouse de verdad; el dedo en celular queda natural).
  useEffect(() => {
    if (reducir || !window.matchMedia("(pointer: fine)").matches) return;
    let soltar: (() => void) | undefined;
    let vivo = true;
    import("./rueda").then(({ suavizarRueda }) => {
      if (vivo) soltar = suavizarRueda();
    });
    return () => {
      vivo = false;
      soltar?.();
    };
  }, [reducir]);
  return (
    <div className="v6">
      <style>{ESTILOS_V6}</style>
      {/* Puntos de luz que caen sin parar detrás de toda la página. */}
      <CapaEstrellas celular={celular} />
      {reducir ? (
        // Movimiento reducido: dos cuadros quietos, sin scroll animado.
        <>
          <Escenario celular={celular} modo={{ tipo: "fijo", p: 0 }} conMovimiento={false} />
          <Escenario celular={celular} modo={{ tipo: "fijo", p: 1 }} conMovimiento={false} />
        </>
      ) : (
        <div className="relative z-[2]" style={{ height: `calc((100dvh - var(--tope)) * ${celular ? 3.1 : 3.4})`, minHeight: celular ? 2000 : 2040 }}>
          <Escenario celular={celular} modo={{ tipo: "scroll" }} conMovimiento />
        </div>
      )}
      <AppsV6 celular={celular} trasHeroe={!reducir} />
      <SobreMiV6 celular={celular} />
      <PreguntasV6 celular={celular} />
      <CierreV6 celular={celular} />
    </div>
  );
}
