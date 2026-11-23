/**
 * PROPUESTA VISUAL v2 (solo en desarrollo: /propuesta). Bocetos navegables para aprobar la dirección
 * antes del cambio grande: estructura ordenada (landing → Mi espacio → cada app) con el alma de siempre
 * (León, imágenes de fieltro, premios que se mueven). No es la app real: datos de ejemplo.
 */
import "@fontsource/figtree/latin-500.css";
import "@fontsource/figtree/latin-600.css";
import "@fontsource/figtree/latin-700.css";
import { animate, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Banner, type Tono } from "../components/Banner";
import { CaraDeLeon, Leon, type CaraLeon } from "../components/Leon";
import { Llama, Moneda } from "../components/Navegacion";
import { lanzarConfeti } from "../lib/confeti";
import { sonidos } from "../lib/sonidos";
import { CaraLeonVida, LeonVida } from "../vida/ui";

type Vista = "landing" | "espacio" | "student" | "vida" | "sistema";
type Ancho = "celular" | "computadora";

const NUNITO = "Nunito, ui-rounded, system-ui, sans-serif";

const ESTILOS = `
.pp { --bg:#F7F8FC; --tinta:#141A4D; --gris:#5B6084; --linea:#DDE0EE; --blanco:#FFFFFF; --cobalto:#2430D9; --cobalto-hondo:#1A23A6; --lila:#E6E8FA; --teal:#0E5B57; --teal-hondo:#07403D; --menta:#F3FAF8; --menta-2:#DCF1EE; --turquesa:#5FE3DC; --oro:#F2B341; --oro-hondo:#C98A1C; --indigo:#4A4EDB;
  font-family: Figtree, system-ui, sans-serif; color: var(--tinta); background: var(--bg); font-weight: 500; font-size: 16px; line-height: 24px; }
.pp h1, .pp h2, .pp h3, .pp .disp { font-family: ${NUNITO}; letter-spacing: -0.01em; }
.pp .h1 { font-size: 40px; line-height: 44px; font-weight: 900; }
.pp .h2 { font-size: 30px; line-height: 36px; font-weight: 900; }
.pp .h3 { font-size: 20px; line-height: 26px; font-weight: 800; }
.pp .cuerpo-l { font-size: 18px; line-height: 28px; color: var(--gris); }
.pp .chico { font-size: 14px; line-height: 20px; color: var(--gris); }
.pp .num { font-variant-numeric: tabular-nums; }
@container (min-width: 56rem) { .pp .h1 { font-size: 58px; line-height: 62px; } .pp .h2 { font-size: 40px; line-height: 46px; } }
.pp .btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; min-height:52px; padding:0 22px; border-radius:14px; font-family:${NUNITO}; font-weight:800; font-size:17px; cursor:pointer;
  box-shadow: 0 4px 0 var(--sombra, transparent); transition: transform .06s ease-out, box-shadow .06s ease-out, background-color .15s; }
.pp .btn:active { transform: translateY(3px); box-shadow: 0 1px 0 var(--sombra, transparent); }
.pp .btn:focus-visible, .pp a:focus-visible, .pp button:focus-visible { outline: 3px solid var(--cobalto); outline-offset: 3px; }
.pp .btn-p { background: var(--cobalto); color:#fff; --sombra: var(--cobalto-hondo); }
.pp .btn-s { background: #fff; color: var(--cobalto); border: 2px solid var(--lila); --sombra: var(--lila); }
.pp .btn-t { background: var(--teal); color:#fff; --sombra: var(--teal-hondo); }
.pp .btn-oro { background: var(--oro); color: var(--tinta); --sombra: var(--oro-hondo); }
.pp .btn-b { background:#fff; color: var(--cobalto); --sombra: #B9BEDD; }
.pp .btn-bt { background:#fff; color: var(--teal); --sombra: #9CC9C3; }
.pp .btn-f { background: transparent; color:#fff; border: 2px solid rgba(255,255,255,.6); }
.pp .caja { background: var(--blanco); border: 1px solid var(--linea); border-radius: 20px; }
.pp .captura { background: repeating-linear-gradient(135deg, #EEF0F8 0 10px, #E7EAF6 10px 20px); border: 1.5px dashed #B9BEDD; border-radius: 16px; color: var(--gris); font-size: 13px; line-height: 18px; display:grid; place-items:center; text-align:center; padding: 12px; }
@media (prefers-reduced-motion: reduce) { .pp .btn { transition: none; } }
`;

/* ---------- Piezas con movimiento ---------- */

/** Número que cuenta hacia su valor (nunca salta). Quieto si se reduce el movimiento. */
function Contador({ valor, prefijo = "", retraso = 0 }: { valor: number; prefijo?: string; retraso?: number }) {
  const quieto = !!useReducedMotion();
  const [v, setV] = useState(quieto ? valor : 0);
  useEffect(() => {
    if (quieto) return setV(valor);
    const c = animate(0, valor, { duration: 0.9, delay: retraso, ease: "easeOut", onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [valor, quieto, retraso]);
  return (
    <span className="num">
      {prefijo}
      {v}
    </span>
  );
}

/** Barra de avance que se llena con resorte al verse. */
function Barra({ pct, color = "var(--cobalto)", fondo = "var(--lila)", alto = 10 }: { pct: number; color?: string; fondo?: string; alto?: number }) {
  return (
    <span className="block overflow-hidden rounded-full" style={{ height: alto, background: fondo }} aria-hidden="true">
      <motion.span className="block h-full rounded-full" style={{ background: color }} initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.2 }} />
    </span>
  );
}

/** Chip de premio que aparece de golpe y luego flota despacio (solo en el héroe). */
function Chip({ children, retraso, className }: { children: ReactNode; retraso: number; className: string }) {
  const quieto = !!useReducedMotion();
  return (
    <motion.div
      className={`absolute z-10 ${className}`}
      initial={quieto ? { opacity: 0 } : { opacity: 0, scale: 0.4, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={quieto ? { duration: 0.2, delay: retraso } : { type: "spring", stiffness: 500, damping: 16, delay: retraso }}
    >
      <motion.div
        animate={quieto ? {} : { y: [0, -7, 0] }}
        transition={{ duration: 3.6 + retraso, repeat: Infinity, ease: "easeInOut", delay: retraso + 0.6 }}
        className="flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-[14px] leading-[18px] font-extrabold whitespace-nowrap text-[color:var(--tinta)] shadow-[0_5px_0_rgba(11,17,64,.28)] @4xl:text-[16px]"
        style={{ fontFamily: NUNITO }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function Check({ color = "#2430D9", className = "size-5" }: { color?: string; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={`shrink-0 ${className}`} aria-hidden="true">
      <path d="M5 10.5l3 3 7-7" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Candado({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="5" y="10.5" width="14" height="10" rx="3" fill="currentColor" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
    </svg>
  );
}

/* ---------- Marca: la órbita de tres puntos (gira despacio solo en la landing) ---------- */
function Marca({ chica = false, clara = false, gira = false }: { chica?: boolean; clara?: boolean; gira?: boolean }) {
  const quieto = !!useReducedMotion();
  const t = chica ? 30 : 38;
  return (
    <span className={`flex items-center gap-2.5 ${clara ? "text-white" : ""}`}>
      <span className="relative" style={{ width: t, height: t }}>
        <motion.svg viewBox="0 0 40 40" className="absolute inset-0 size-full" animate={gira && !quieto ? { rotate: 360 } : {}} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} aria-hidden="true">
          <circle cx="20" cy="20" r="13" fill="none" stroke={clara ? "#fff" : "#2430D9"} strokeWidth="2.4" strokeDasharray="3 4" strokeLinecap="round" />
          <circle cx="33" cy="20" r="3.6" fill="#2430D9" stroke="#fff" strokeWidth="1.2" />
          <circle cx="13.5" cy="31.3" r="3.6" fill="#0E5B57" stroke="#fff" strokeWidth="1.2" />
          <circle cx="13.5" cy="8.7" r="3.6" fill="#4A4EDB" stroke="#fff" strokeWidth="1.2" />
        </motion.svg>
        <svg viewBox="0 0 40 40" className="absolute inset-0 size-full" aria-hidden="true">
          <circle cx="20" cy="20" r="5.5" fill="#F2B341" stroke="#C98A1C" strokeWidth="2" />
        </svg>
      </span>
      <span className="leading-none">
        <span className="block text-[19px] font-black tracking-[-0.01em]" style={{ fontFamily: NUNITO }}>
          Auxi Studio
        </span>
        {!chica && <span className={`mt-1 block text-[12px] font-semibold ${clara ? "text-white/80" : "text-[color:var(--gris)]"}`}>por Daniel Chong</span>}
      </span>
    </span>
  );
}

/* ---------- 1. Landing ---------- */

/** El momento memorable: León dentro de la órbita y los premios que aparecen uno tras otro. */
function EscenaLeon({ celular }: { celular: boolean }) {
  const quieto = !!useReducedMotion();
  const t = celular ? 232 : 360;
  return (
    <div className="relative mx-auto" style={{ width: celular ? 340 : 520, height: t + (celular ? 56 : 80) }}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: t, height: t }}>
        <motion.svg
          viewBox="0 0 100 100"
          className="absolute inset-0 size-full"
          initial={{ opacity: 0 }}
          animate={quieto ? { opacity: 1 } : { opacity: 1, rotate: 360 }}
          transition={{ opacity: { duration: 0.6, delay: 0.2 }, rotate: { duration: 60, repeat: Infinity, ease: "linear" } }}
          aria-hidden="true"
        >
          <circle cx="50" cy="50" r="47" fill="none" stroke="rgba(255,255,255,.45)" strokeWidth=".8" strokeDasharray="2 3" />
          <circle cx="97" cy="50" r="3.6" fill="#2430D9" stroke="#fff" strokeWidth="1.2" />
          <circle cx="26.5" cy="90.7" r="3.6" fill="#0E5B57" stroke="#fff" strokeWidth="1.2" />
          <circle cx="26.5" cy="9.3" r="3.6" fill="#4A4EDB" stroke="#fff" strokeWidth="1.2" />
        </motion.svg>
        <div className="absolute inset-[12%] rounded-full bg-white/12 ring-1 ring-white/25" aria-hidden="true" />
        <motion.div className="absolute inset-0 grid place-items-center" animate={quieto ? {} : { y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
          <Leon pose="saluda" alto={Math.round(t * 0.8)} rebote />
        </motion.div>
      </div>
      <Chip retraso={0.7} className="top-[6%] left-0">
        <Moneda className="size-6" />
        +15 monedas
      </Chip>
      <Chip retraso={0.95} className="top-[20%] right-0">
        <Llama activa className="size-6" />
        Racha de 4 días
      </Chip>
      <Chip retraso={1.2} className="bottom-[18%] left-[1%]">
        <span className="grid size-6 place-items-center rounded-full bg-[color:var(--teal)] text-[11px] font-black text-white">S/</span>
        <span className="num">31 para hoy</span>
      </Chip>
      <Chip retraso={1.45} className="right-[3%] bottom-[2%]">
        <span className="grid size-6 place-items-center rounded-full bg-[color:var(--turquesa)]">
          <Check color="#141A4D" className="size-4" />
        </span>
        ¡Eso! 5 de 5
      </Chip>
    </div>
  );
}

/** Cinta con frases que se desplazan (se queda quieta si se reduce el movimiento). */
function Cinta() {
  const quieto = !!useReducedMotion();
  const frases = ["Estudia jugando", "Ordena tu plata", "Revisa antes de pagar", "Una sola cuenta", "Gratis", "Con León"];
  const colores = ["#5FE3DC", "#F2B341", "#7B7FF0"];
  const fila = (
    <span className="flex shrink-0 items-center gap-6 pr-6">
      {frases.map((f, i) => (
        <span key={f} className="flex items-center gap-6">
          <span>{f}</span>
          <span className="size-2.5 rounded-full" style={{ background: colores[i % colores.length] }} />
        </span>
      ))}
    </span>
  );
  return (
    <div className="overflow-hidden bg-[color:var(--tinta)] py-3 text-[16px] font-extrabold whitespace-nowrap text-white" style={{ fontFamily: NUNITO }} aria-hidden="true">
      <motion.div className="flex w-max" animate={quieto ? {} : { x: ["0%", "-50%"] }} transition={{ duration: 32, repeat: Infinity, ease: "linear" }}>
        {fila}
        {fila}
      </motion.div>
    </div>
  );
}

function TarjetaApp({ banner, tono, nombre, etiqueta, beneficio, capacidades, principal, teal = false }: { banner: string; tono: Tono; nombre: string; etiqueta: string; beneficio: string; capacidades: string[]; principal: string; teal?: boolean }) {
  return (
    <motion.article whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="flex flex-col rounded-[32px] border border-[color:var(--linea)] bg-white p-1.5 shadow-[0_8px_0_rgba(20,26,77,.07)]">
      <Banner nombre={banner} tono={tono} velo="fuerte" parallax={false} className="aspect-[16/9]">
        <div className="flex h-full flex-col justify-between p-5 text-white">
          <span className="self-start rounded-full bg-white/90 px-3 py-1 text-[13px] font-extrabold text-[color:var(--tinta)]" style={{ fontFamily: NUNITO }}>
            {etiqueta}
          </span>
          <span className="text-[30px] leading-[34px] font-black drop-shadow-[0_2px_6px_rgba(0,0,0,.35)]" style={{ fontFamily: NUNITO }}>
            {nombre}
          </span>
        </div>
      </Banner>
      <div className="flex flex-1 flex-col p-5 @4xl:p-7">
        <h3 className="h3">{beneficio}</h3>
        <ul className="mt-4 flex flex-col gap-2.5">
          {capacidades.map((c) => (
            <li key={c} className="flex gap-2.5 text-[15px] leading-[22px]">
              <Check color={teal ? "#0E5B57" : "#2430D9"} className="mt-0.5 size-5" />
              {c}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-wrap gap-3 pt-6">
          <a className={`btn ${teal ? "btn-t" : "btn-p"}`} href="#abrir">
            {principal}
          </a>
          <a className="btn btn-s" href="#detalle">
            Ver cómo funciona
          </a>
        </div>
      </div>
    </motion.article>
  );
}

/** Mini prueba de Auxi Student dentro de la landing: se siente el juego antes de crear la cuenta. */
function PruebaPregunta() {
  const quieto = !!useReducedMotion();
  const opciones = ["2/4", "2/3", "3/5"];
  const [elegida, setElegida] = useState<number | null>(null);
  const [monedas, setMonedas] = useState(0);
  const bien = elegida === 0;
  const responder = (i: number) => {
    if (bien) return;
    setElegida(i);
    if (i === 0) {
      sonidos.acierto();
      void lanzarConfeti();
      setMonedas(10);
    } else sonidos.error();
  };
  const cara: CaraLeon = elegida === null ? "lentes" : bien ? "feliz" : "tierno";
  const mensaje = elegida === null ? "Toca una respuesta. Si fallas, te doy una pista." : bien ? "¡Eso! 1/2 y 2/4 son la misma parte del total." : "Casi. Pista: multiplica arriba y abajo por el mismo número.";
  return (
    <div className="rounded-[28px] border border-[color:var(--linea)] bg-white p-5 shadow-[0_8px_0_rgba(20,26,77,.07)] @4xl:p-7">
      <div className="flex items-center gap-3">
        <span className="flex-1">
          <Barra pct={bien ? 100 : 60} color="var(--turquesa)" />
        </span>
        <span className="flex items-center gap-1.5 text-[16px] font-extrabold" style={{ fontFamily: NUNITO }}>
          <Moneda className="size-6" />
          <Contador key={monedas} valor={monedas} />
        </span>
      </div>
      <p className="chico mt-5">Matemática · pregunta de ejemplo</p>
      <p className="disp mt-1 text-[24px] leading-[30px] font-black">¿Qué fracción es igual a 1/2?</p>
      <div className="mt-5 grid grid-cols-3 gap-3">
        {opciones.map((o, i) => {
          const esta = elegida === i;
          const estilo = esta ? (i === 0 ? "border-[color:var(--success,#2FB7B0)] bg-[color:var(--turquesa)]" : "border-[#C2412D] bg-[#FBEAE7]") : "border-[color:var(--linea)] bg-white hover:border-[color:var(--cobalto)]";
          return (
            <motion.button
              key={o}
              type="button"
              onClick={() => responder(i)}
              animate={esta && !quieto ? (i === 0 ? { scale: [1, 1.06, 1] } : { x: [0, -6, 6, -6, 6, 0] }) : {}}
              transition={{ duration: 0.35 }}
              whileTap={{ scale: 0.96 }}
              className={`num min-h-16 rounded-[16px] border-2 border-b-[5px] text-[24px] font-black ${estilo}`}
              style={{ fontFamily: NUNITO }}
              aria-pressed={esta}
            >
              {o}
            </motion.button>
          );
        })}
      </div>
      <div className="mt-5 flex items-center gap-3 rounded-[16px] bg-[color:var(--bg)] p-3" aria-live="polite">
        <CaraDeLeon cara={cara} tamano={44} />
        <p className="text-[15px] leading-[21px] font-semibold">{mensaje}</p>
      </div>
      {elegida !== null && (
        <button type="button" onClick={() => (setElegida(null), setMonedas(0))} className="mt-3 inline-flex min-h-11 items-center font-semibold text-[color:var(--cobalto)] underline">
          Probar otra vez
        </button>
      )}
    </div>
  );
}

function Landing({ celular }: { celular: boolean }) {
  const [menu, setMenu] = useState(false);
  return (
    <div>
      <header className="bg-[color:var(--bg)]">
        <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between gap-4 px-4 @4xl:px-8">
          <Marca gira />
          <nav aria-label="Principal" className="hidden items-center gap-7 font-semibold @4xl:flex">
            <a href="#apps">Apps</a>
            <a href="#prueba">Pruébalo</a>
            <a href="#sobre">Sobre mí</a>
          </nav>
          <div className="flex items-center gap-2">
            <a className="btn btn-s min-h-11 px-4 text-[15px]" href="#entrar">
              Entrar
            </a>
            {celular && (
              <button type="button" aria-expanded={menu} aria-label="Abrir menú" onClick={() => setMenu(!menu)} className="grid size-12 place-items-center rounded-[12px]">
                <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
                  <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        </div>
        {celular && menu && (
          <nav aria-label="Principal" className="flex flex-col border-t border-[color:var(--linea)] px-4 py-2 font-semibold">
            {["Apps", "Pruébalo", "Sobre mí"].map((x) => (
              <a key={x} href="#apps" className="flex min-h-12 items-center">
                {x}
              </a>
            ))}
          </nav>
        )}
      </header>

      {/* Héroe: imagen de fieltro, León en su órbita y los premios que aparecen. Un solo momento orquestado. */}
      <section className="px-3 @4xl:px-8">
        <div className="mx-auto max-w-[1200px]">
          <Banner key={celular ? "m" : "c"} nombre={celular ? "hero-movil" : "hero"} tono="hero" modo="contenido" velo="izquierda" parallax={false}>
            <div className="grid items-center gap-4 px-5 pt-6 pb-8 text-white @4xl:grid-cols-12 @4xl:gap-0 @4xl:px-14 @4xl:py-14">
              <div className="@4xl:order-2 @4xl:col-span-6">
                <EscenaLeon celular={celular} />
              </div>
              <div className="@4xl:order-1 @4xl:col-span-6">
                <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.45, ease: "easeOut" }} className="h1 max-w-[15ch] drop-shadow-[0_2px_10px_rgba(0,0,0,.25)]">
                  Apps gratis para estudiar jugando y ordenar tu plata.
                </motion.h1>
                <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.45, ease: "easeOut" }} className="mt-4 max-w-[44ch] text-[18px] leading-[28px] text-white/90">
                  Auxi Studio reúne las apps que creo para el día a día. Entras con una sola cuenta y León te acompaña en cada una.
                </motion.p>
                <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.45, ease: "easeOut" }} className="mt-7 flex flex-wrap gap-3">
                  <a className="btn btn-b" href="#crear">
                    Crear mi cuenta gratis
                  </a>
                  <a className="btn btn-f" href="#apps">
                    Ver las apps
                  </a>
                </motion.div>
                <p className="mt-3 text-[14px] text-white/80">Sin tarjeta. Lo básico siempre es gratis.</p>
              </div>
            </div>
          </Banner>
        </div>
      </section>

      <div className="mt-8">
        <Cinta />
      </div>

      <section id="apps" className="mx-auto max-w-[1200px] px-4 py-14 @4xl:px-8 @4xl:py-20">
        <h2 className="h2">Elige tu app</h2>
        <p className="cuerpo-l mt-3 max-w-[52ch]">Cada una resuelve una cosa. Puedes ver cómo funciona antes de crear tu cuenta.</p>
        <div className="mt-8 grid gap-6 @4xl:grid-cols-2">
          <TarjetaApp
            banner="student"
            tono="student"
            nombre="Auxi Student"
            etiqueta="Para estudiantes · gratis"
            beneficio="Convierte tus apuntes en lecciones que se juegan."
            capacidades={["Lecciones con preguntas a partir de tu material, usando tu propia IA", "Racha, monedas y un cofre diario por estudiar", "Repasa lo que fallaste y organiza tus entregas"]}
            principal="Abrir Auxi Student"
          />
          <TarjetaApp
            banner="vida"
            tono="vida"
            nombre="Auxi Vida"
            etiqueta="Tu plata del día · gratis"
            beneficio="Sabe cuánto puedes gastar hoy y cuida tus metas."
            capacidades={["Un disponible estimado para cada día, con el cálculo a la vista", "Importa movimientos de reportes, capturas o texto", "Protégete: revisa un mensaje o un vendedor antes de pagar"]}
            principal="Probar sin dar mis datos"
            teal
          />
        </div>
        <div className="mt-6">
          <Banner nombre="vendoe" tono="vendoe" modo="contenido" velo="izquierda" parallax={false}>
            <div className="flex flex-col items-start gap-4 p-6 text-white @4xl:flex-row @4xl:items-center @4xl:justify-between @4xl:px-10">
              <div>
                <p className="disp text-[24px] leading-[30px] font-black">¿Tienes un negocio?</p>
                <p className="mt-1 max-w-[46ch] text-white/90">Vendoe es otra app que creé, con su propia página y su propia cuenta.</p>
              </div>
              <a className="btn btn-b" href="#vendoe">
                Conocer Vendoe
              </a>
            </div>
          </Banner>
        </div>
      </section>

      <section id="prueba" className="bg-[color:var(--lila)]">
        <div className="mx-auto grid max-w-[1200px] items-center gap-8 px-4 py-14 @4xl:grid-cols-12 @4xl:gap-12 @4xl:px-8 @4xl:py-20">
          <div className="@4xl:col-span-5">
            <h2 className="h2">Pruébalo aquí mismo</h2>
            <p className="cuerpo-l mt-3">Así se siente una pregunta en Auxi Student. Si aciertas, ganas monedas. Si fallas, León te da una pista en vez de la respuesta.</p>
            <ol className="mt-8 flex flex-col gap-5">
              {[
                ["Crea tu cuenta gratis", "Una sola cuenta para todas las apps."],
                ["Elige la app que necesitas hoy", "No tienes que usarlas todas."],
                ["Vuelve cuando quieras", "Mi espacio te deja donde te quedaste."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-4">
                  <span className="num grid size-10 shrink-0 place-items-center rounded-full bg-[color:var(--cobalto)] text-[18px] font-black text-white" style={{ fontFamily: NUNITO }}>
                    {i + 1}
                  </span>
                  <span>
                    <span className="block font-bold">{t}</span>
                    <span className="chico">{d}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div className="@4xl:col-span-7">
            <PruebaPregunta />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 py-14 @4xl:px-8 @4xl:py-20">
        <Banner nombre="cuenta" tono="cuenta" modo="contenido" velo="izquierda" parallax={false}>
          <div className="grid gap-8 p-6 text-white @4xl:grid-cols-12 @4xl:p-12">
            <div className="@4xl:col-span-5">
              <h2 className="h2">Una cuenta. Tus datos, bajo tu control.</h2>
              <a href="#privacidad" className="mt-4 inline-flex min-h-11 items-center font-semibold text-white underline">
                Leer la política de privacidad
              </a>
            </div>
            <dl className="grid gap-6 @2xl:grid-cols-3 @4xl:col-span-7">
              {[
                ["Auxi Student", "Tu avance se guarda en tu cuenta para seguir en otro equipo."],
                ["Auxi Vida", "Tus datos se quedan en tu celular. Los descargas o borras cuando quieras."],
                ["Borrar tu cuenta", "Está en tu perfil. Se borra todo, sin trámites."],
              ].map(([t, d]) => (
                <div key={t} className="rounded-[18px] bg-[#0B1140]/70 p-4 ring-1 ring-white/20 backdrop-blur-sm">
                  <dt className="font-bold">{t}</dt>
                  <dd className="mt-1 text-[15px] leading-[22px] text-white/90">{d}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Banner>
      </section>

      <section id="estudio" className="mx-auto max-w-[1200px] px-4 pb-14 @4xl:px-8 @4xl:pb-20">
        <div className="grid items-center gap-6 rounded-[28px] border-2 border-dashed border-[#B9BEDD] bg-white p-6 @4xl:grid-cols-12 @4xl:p-10">
          <div className="@4xl:col-span-6">
            <p className="flex items-center gap-2 font-bold text-[color:var(--indigo)]">
              <Candado className="size-5" />
              En el estudio
            </p>
            <h2 className="h2 mt-2">Vienen más apps</h2>
            <p className="cuerpo-l mt-3">Estoy preparando nuevas herramientas. Cuando estén listas, aparecerán aquí y en tu espacio, con la misma cuenta.</p>
          </div>
          <div className="captura aspect-[16/9] @4xl:col-span-6">Imagen «En el estudio» (I-04): módulos de fieltro sin nombres ni fechas</div>
        </div>
      </section>

      <section id="sobre" className="bg-white">
        <div className="mx-auto grid max-w-[1200px] items-center gap-8 px-4 py-14 @4xl:grid-cols-12 @4xl:gap-12 @4xl:px-8 @4xl:py-20">
          <div className="@4xl:col-span-5">
            <Banner nombre="autor" tono="autor" parallax={false} className="aspect-[4/3] @4xl:aspect-[4/5]" />
            <p className="chico mt-2">Si me pasas una foto tuya, va aquí. Si no, se queda esta imagen.</p>
          </div>
          <div className="@4xl:col-span-6 @4xl:col-start-7">
            <h2 className="h2">Hola, soy Daniel Chong</h2>
            <div className="cuerpo-l mt-5 flex max-w-[54ch] flex-col gap-4 text-[color:var(--tinta)]">
              <p>Me apasiona crear soluciones digitales para negocios y para personas. Auxi Studio es el lugar donde reúno lo que construyo.</p>
              <p>Aquí también comparto lo que aprendo en el camino, incluidos mis errores, porque de ellos sale lo que mejor funciona.</p>
              <p>Te doy la bienvenida. Este espacio es para ti: sácale todo el provecho posible.</p>
            </div>
            <a href="#instagram" className="mt-6 inline-flex min-h-11 items-center font-semibold text-[color:var(--cobalto)] underline">
              Sígueme en Instagram
            </a>
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--cobalto)] text-white">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-6 px-4 py-14 text-center @4xl:flex-row @4xl:gap-10 @4xl:px-8 @4xl:text-left">
          <Leon pose="anima" alto={celular ? 150 : 190} />
          <div className="flex-1">
            <h2 className="h2 max-w-[20ch]">Empieza hoy con la app que necesitas.</h2>
            <p className="mt-2 text-white/85">Gratis. Sin tarjeta.</p>
          </div>
          <a className="btn btn-b" href="#crear">
            Crear mi cuenta gratis
          </a>
        </div>
      </section>
      <footer className="mx-auto grid max-w-[1200px] gap-8 px-4 py-10 text-[15px] @4xl:grid-cols-4 @4xl:px-8">
        <Marca />
        {[
          ["Apps", ["Auxi Student", "Auxi Vida", "Vendoe (sitio aparte)"]],
          ["Ayuda", ["Preguntas frecuentes", "Escríbeme por WhatsApp"]],
          ["Legal", ["Privacidad", "Condiciones"]],
        ].map(([t, items]) => (
          <div key={t as string}>
            <p className="font-bold">{t as string}</p>
            <ul className="mt-2">
              {(items as string[]).map((x) => (
                <li key={x}>
                  <a href="#f" className="flex min-h-10 items-center text-[color:var(--gris)] hover:text-[color:var(--tinta)]">
                    {x}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </footer>
    </div>
  );
}

/* ---------- AppShell compartido (Mi espacio, Student, Vida) ---------- */
type Item = { nombre: string; activo?: boolean };
function AppShell({ celular, producto, color, items, children, inferior, fondo = "var(--bg)", flotante = false }: { celular: boolean; producto: string; color: string; items: Item[]; children: ReactNode; inferior?: string[]; fondo?: string; flotante?: boolean }) {
  if (celular)
    return (
      <div className="flex min-h-[844px] flex-col" style={{ background: fondo }}>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-[color:var(--linea)] px-4" style={{ background: fondo }}>
          <button type="button" className="flex min-h-11 items-center gap-2 rounded-[10px] px-1 font-black" style={{ fontFamily: NUNITO }} aria-label={`Cambiar de app. Ahora: ${producto}`}>
            <span className="size-2.5 rounded-full" style={{ background: color }} aria-hidden="true" />
            {producto}
            <svg viewBox="0 0 20 20" className="size-4" aria-hidden="true">
              <path d="M5 8l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <span className="grid size-10 place-items-center rounded-full bg-[color:var(--lila)] text-[14px] font-bold" aria-label="Tu cuenta">
            DC
          </span>
        </header>
        <div className="flex-1 px-4 pt-5 pb-8">{children}</div>
        {inferior && !flotante && (
          <nav aria-label={`Secciones de ${producto}`} className="sticky bottom-0 grid grid-cols-5 border-t border-[color:var(--linea)] bg-white px-1 pt-1 pb-3">
            {inferior.map((x, i) => (
              <span key={x} className={`flex min-h-12 flex-col items-center justify-center gap-1 text-[11px] font-bold ${i === 0 ? "" : "text-[color:var(--gris)]"}`} style={i === 0 ? { color } : undefined}>
                <span className="size-6 rounded-[8px]" style={{ background: i === 0 ? color : "#DDE0EE" }} aria-hidden="true" />
                {x}
              </span>
            ))}
          </nav>
        )}
        {inferior && flotante && (
          <nav aria-label={`Secciones de ${producto}`} className="sticky bottom-3 mx-3 grid grid-cols-5 items-end rounded-[26px] bg-white px-1 pt-1 pb-2 shadow-[0_8px_24px_rgba(14,91,87,.18)]">
            {inferior.map((x, i) =>
              i === 2 ? (
                <span key={x} className="flex flex-col items-center gap-1 text-[11px] font-bold" style={{ color }}>
                  <span className="-mt-6 grid size-14 place-items-center rounded-full text-[30px] leading-none font-black text-white shadow-[0_4px_0_#07403D]" style={{ background: color }} aria-hidden="true">
                    +
                  </span>
                  {x}
                </span>
              ) : (
                <span key={x} className={`flex min-h-12 flex-col items-center justify-center gap-1 text-[11px] font-bold ${i === 0 ? "" : "text-[color:var(--gris)]"}`} style={i === 0 ? { color } : undefined}>
                  <span className="size-6 rounded-full" style={{ background: i === 0 ? color : "#D5E4E1" }} aria-hidden="true" />
                  {x}
                </span>
              ),
            )}
          </nav>
        )}
      </div>
    );
  return (
    <div className="grid min-h-[820px] grid-cols-[248px_1fr]" style={{ background: fondo }}>
      <aside className="flex flex-col gap-1 border-r border-[color:var(--linea)] bg-white p-4">
        <div className="px-2 pt-1 pb-4">
          <Marca chica />
        </div>
        <button type="button" className="mb-3 flex min-h-11 items-center justify-between rounded-[12px] border border-[color:var(--linea)] px-3 font-black" style={{ fontFamily: NUNITO }}>
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ background: color }} aria-hidden="true" />
            {producto}
          </span>
          <svg viewBox="0 0 20 20" className="size-4" aria-hidden="true">
            <path d="M5 8l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        {items.map((it) => (
          <span key={it.nombre} className={`flex min-h-11 items-center rounded-[12px] px-3 font-bold ${it.activo ? "bg-[color:var(--lila)]" : "text-[color:var(--gris)]"}`} style={it.activo ? { color } : undefined}>
            {it.nombre}
          </span>
        ))}
        <div className="mt-auto flex flex-col gap-1 border-t border-[color:var(--linea)] pt-3 text-[color:var(--gris)]">
          <span className="flex min-h-10 items-center px-3 font-semibold">Ajustes</span>
          <span className="flex min-h-10 items-center px-3 font-semibold">Ayuda</span>
          <span className="flex min-h-12 items-center gap-2 px-3 font-semibold text-[color:var(--tinta)]">
            <span className="grid size-8 place-items-center rounded-full bg-[color:var(--lila)] text-[12px] font-bold">DC</span>
            Daniel
          </span>
        </div>
      </aside>
      <main className="px-10 py-8">{children}</main>
    </div>
  );
}

function Stat({ children, etiqueta }: { children: ReactNode; etiqueta: string }) {
  return (
    <span className="flex min-h-10 items-center gap-1.5 rounded-full border border-[color:var(--linea)] bg-white px-3 text-[16px] font-black" style={{ fontFamily: NUNITO }} aria-label={etiqueta}>
      {children}
    </span>
  );
}

/* ---------- 2. Mi espacio ---------- */
function MiEspacio({ celular }: { celular: boolean }) {
  return (
    <AppShell celular={celular} producto="Mi espacio" color="#141A4D" items={[{ nombre: "Mi espacio", activo: true }, { nombre: "Auxi Student" }, { nombre: "Auxi Vida" }, { nombre: "Vendoe (sitio aparte)" }]}>
      <Banner nombre="hero" tono="hero" modo="contenido" velo="izquierda" parallax={false}>
        <div className="flex items-center gap-2 p-5 text-white @4xl:px-10 @4xl:py-6">
          <div className="flex-1">
            <p className="text-[15px] text-white/85">Domingo 23 de noviembre</p>
            <h1 className="h2 mt-1">Hola, Daniel</h1>
            <p className="mt-1 text-white/90">¿Qué hacemos hoy?</p>
            <div className="mt-4 flex flex-wrap gap-2 text-[color:var(--tinta)]">
              <Stat etiqueta="Racha de 4 días">
                <Llama activa className="size-5" />4 días
              </Stat>
              <Stat etiqueta="120 monedas">
                <Moneda className="size-5" />
                <Contador valor={120} />
              </Stat>
            </div>
          </div>
          <Leon pose="saluda" alto={celular ? 130 : 170} rebote />
        </div>
      </Banner>

      <section className="mt-8" aria-labelledby="continua">
        <h2 id="continua" className="h3">
          Continúa donde te quedaste
        </h2>
        <div className="mt-4 grid gap-4 @4xl:grid-cols-2">
          <div className="caja flex gap-4 p-3">
            <Banner nombre="student" tono="student" parallax={false} className="w-24 shrink-0 self-stretch @4xl:w-32" />
            <div className="flex-1 py-1 pr-1">
              <p className="text-[14px] font-bold text-[color:var(--cobalto)]">Auxi Student</p>
              <p className="mt-0.5 text-[18px] leading-[24px] font-black" style={{ fontFamily: NUNITO }}>
                Fracciones equivalentes
              </p>
              <p className="chico">Lección 3 de 6 · 5 preguntas por repasar</p>
              <div className="mt-2">
                <Barra pct={50} />
              </div>
              <a className="btn btn-p mt-3 min-h-11 px-4 text-[15px]" href="#c">
                Continuar
              </a>
            </div>
          </div>
          <div className="caja flex gap-4 p-3">
            <Banner nombre="vida" tono="vida" parallax={false} className="w-24 shrink-0 self-stretch @4xl:w-32" />
            <div className="flex-1 py-1 pr-1">
              <p className="text-[14px] font-bold text-[color:var(--teal)]">Auxi Vida</p>
              <p className="mt-0.5 text-[18px] leading-[24px] font-black" style={{ fontFamily: NUNITO }}>
                Tu día en Vida
              </p>
              <p className="chico">Por privacidad, los montos no se muestran aquí.</p>
              <a className="btn btn-t mt-3 min-h-11 px-4 text-[15px]" href="#v">
                Abrir Hoy
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="apps">
        <h2 id="apps" className="h3">
          Todas las apps de Auxi Studio
        </h2>
        <ul className="mt-4 grid grid-cols-2 gap-4 @4xl:grid-cols-4">
          {(
            [
              ["student", "student", "Auxi Student", "Estudia jugando"],
              ["vida", "vida", "Auxi Vida", "Tu plata del día"],
              ["vendoe", "vendoe", "Vendoe", "Para negocios · sitio aparte"],
            ] as [string, Tono, string, string][]
          ).map(([img, tono, n, d]) => (
            <motion.li key={n} whileHover={{ y: -5 }} whileTap={{ scale: 0.97 }} className="cursor-pointer">
              <Banner nombre={img} tono={tono} velo="fuerte" parallax={false} className="aspect-square">
                <div className="flex h-full flex-col justify-end p-4 text-white">
                  <span className="text-[19px] leading-[22px] font-black" style={{ fontFamily: NUNITO }}>
                    {n}
                  </span>
                  <span className="text-[13px] text-white/85">{d}</span>
                </div>
              </Banner>
            </motion.li>
          ))}
          <li className="grid aspect-square place-items-center rounded-[28px] border-2 border-dashed border-[#B9BEDD] bg-white p-4 text-center text-[color:var(--gris)]">
            <span>
              <Candado className="mx-auto size-7 text-[color:var(--indigo)]" />
              <span className="mt-2 block font-black text-[color:var(--tinta)]" style={{ fontFamily: NUNITO }}>
                Próximamente
              </span>
              <span className="text-[13px]">En el estudio</span>
            </span>
          </li>
        </ul>
      </section>
    </AppShell>
  );
}

/* ---------- 3. Auxi Student: inicio ---------- */
function Camino() {
  const quieto = !!useReducedMotion();
  return (
    <div className="mt-5 flex items-center" aria-label="Camino del tema: lección 3 de 6">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <span key={i} className="flex flex-1 items-center last:flex-none">
          <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 22, delay: 0.1 + i * 0.06 }}
            className={`relative grid size-9 shrink-0 place-items-center rounded-full text-[15px] font-black ${i < 2 ? "bg-[color:var(--oro)] text-[color:var(--tinta)] shadow-[0_3px_0_#C98A1C]" : i === 2 ? "bg-white text-[color:var(--cobalto)] shadow-[0_3px_0_#B9BEDD]" : "bg-white/20 text-white/70"}`}
            style={{ fontFamily: NUNITO }}
          >
            {i < 2 ? <Check color="#141A4D" className="size-5" /> : i + 1}
            {i === 2 && !quieto && <motion.span className="absolute inset-0 rounded-full ring-4 ring-white/70" animate={{ scale: [1, 1.45], opacity: [0.8, 0] }} transition={{ duration: 1.6, repeat: Infinity }} aria-hidden="true" />}
          </motion.span>
          {i < 5 && <span className={`mx-1 h-1 flex-1 rounded-full ${i < 2 ? "bg-[color:var(--oro)]" : "bg-white/20"}`} aria-hidden="true" />}
        </span>
      ))}
    </div>
  );
}

function StudentInicio({ celular, nuevo }: { celular: boolean; nuevo: boolean }) {
  const items = ["Inicio", "Cursos", "Camino", "Métodos", "Entregas"].map((n, i) => ({ nombre: n, activo: i === 0 }));
  const principal = nuevo ? (
    <div className="caja relative overflow-hidden p-6">
      <div className="flex items-start gap-4">
        <Leon pose="saluda" alto={celular ? 110 : 140} rebote className="shrink-0" />
        <div className="relative mt-2 rounded-[18px] bg-[color:var(--lila)] p-4">
          <p className="disp text-[19px] leading-[25px] font-black">¡Hola! Soy León.</p>
          <p className="mt-1 text-[15px] leading-[21px]">Empecemos con tu primer tema. Toma unos 5 minutos.</p>
        </div>
      </div>
      <ol className="mt-5 grid gap-3 @2xl:grid-cols-3">
        {["Copia el pedido de Auxi", "Pégalo en tu IA con tu PDF o apuntes", "Pega aquí la respuesta y revísala"].map((p, i) => (
          <li key={p} className="flex gap-3 rounded-[14px] bg-[color:var(--bg)] p-3 text-[15px] leading-[21px]">
            <span className="num grid size-7 shrink-0 place-items-center rounded-full bg-[color:var(--cobalto)] text-[14px] font-black text-white" style={{ fontFamily: NUNITO }}>
              {i + 1}
            </span>
            {p}
          </li>
        ))}
      </ol>
      <a className="btn btn-p mt-5 w-full @2xl:w-auto" href="#crear">
        Crear mi primer tema
      </a>
    </div>
  ) : (
    <div className="relative overflow-hidden rounded-[24px] bg-[color:var(--cobalto)] p-6 text-white shadow-[0_6px_0_#1A23A6]">
      <div className={celular ? "pr-[92px]" : "pr-[200px]"}>
        <p className="text-[14px] font-semibold text-white/80">Matemática · Fracciones</p>
        <h2 className="h3 mt-1 text-[24px] leading-[30px]">Fracciones equivalentes</h2>
        <p className="text-[15px] text-white/80">Lección 3 de 6 · unos 4 minutos</p>
      </div>
      <Leon pose="concentrado" alto={celular ? 104 : 190} rebote className={`absolute ${celular ? "top-3 right-2" : "right-6 bottom-0"}`} />
      <div className={celular ? "" : "pr-[200px]"}>
        <Camino />
        <div className="mt-6 flex flex-wrap gap-3">
          <a className="btn btn-b" href="#c">
            Continuar
          </a>
          <a className="btn btn-f" href="#r">
            Repasar 5 preguntas
          </a>
        </div>
      </div>
    </div>
  );
  return (
    <AppShell celular={celular} producto="Auxi Student" color="#2430D9" items={items} inferior={["Inicio", "Cursos", "Camino", "Métodos", "Entregas"]}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="h2">¿Qué estudiamos hoy?</h1>
          <p className="chico mt-1 text-[15px]">{nuevo ? "Empieza con un tema. Lo demás aparece cuando lo necesites." : "Meta de hoy: 1 de 2 lecciones"}</p>
        </div>
        {!nuevo && (
          <div className="flex gap-2">
            <Stat etiqueta="Racha de 4 días">
              <Llama activa className="size-5" />4
            </Stat>
            <Stat etiqueta="120 monedas">
              <Moneda className="size-5" />
              <Contador valor={120} />
            </Stat>
          </div>
        )}
      </div>
      <div className="mt-6 grid gap-6 @4xl:grid-cols-12">
        <div className="flex flex-col gap-6 @4xl:col-span-8">
          {principal}
          {!nuevo && (
            <section className="caja p-5" aria-labelledby="cursos">
              <div className="flex items-center justify-between">
                <h2 id="cursos" className="h3">
                  Mis cursos
                </h2>
                <a href="#todos" className="min-h-11 content-center font-semibold text-[color:var(--cobalto)]">
                  Ver todos
                </a>
              </div>
              <ul className="mt-3 divide-y divide-[color:var(--linea)]">
                {(
                  [
                    ["Matemática", "Fracciones", 33],
                    ["Comunicación", "Textos argumentativos", 60],
                    ["Historia", "Independencia", 10],
                  ] as [string, string, number][]
                ).map(([c, t, p]) => (
                  <li key={c} className="grid min-h-16 grid-cols-[1fr_110px] items-center gap-4 @2xl:grid-cols-[1fr_200px]">
                    <span>
                      <span className="block font-bold">{c}</span>
                      <span className="chico">
                        {t} · <span className="num">{p} %</span>
                      </span>
                    </span>
                    <Barra pct={p} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
        <aside className="flex flex-col gap-4 @4xl:col-span-4" aria-label="Tu semana">
          {!nuevo && (
            <div className="rounded-[20px] bg-[#FFF6E2] p-5 ring-1 ring-[#F2D9A2]">
              <p className="disp flex items-center gap-2 text-[18px] font-black">
                <Moneda className="size-6" />
                Cofre del día
              </p>
              <p className="mt-1 text-[15px] leading-[21px]">Termina 1 lección y ábrelo.</p>
              <a href="#prob" className="mt-1 inline-flex min-h-11 items-center font-semibold text-[#8A5A08] underline">
                Ver probabilidades
              </a>
            </div>
          )}
          <div className="caja p-5">
            <p className="chico">Próximo examen</p>
            <p className="mt-1 font-bold">{nuevo ? "Aún no tienes exámenes" : "Matemática · viernes 28 nov"}</p>
            <a href="#examen" className="mt-1 inline-flex min-h-11 items-center font-semibold text-[color:var(--cobalto)]">
              {nuevo ? "Agregar examen" : "Ver plan de repaso"}
            </a>
          </div>
          <div className="caja p-5">
            <p className="chico">Esta semana</p>
            <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[12px] font-bold">
              {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
                <span key={i} className="flex flex-col items-center gap-1">
                  <motion.span
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.2 + i * 0.05 }}
                    className={`grid size-8 place-items-center rounded-full ${!nuevo && i < 4 ? "bg-[color:var(--oro)]" : "bg-[color:var(--lila)]"}`}
                    aria-hidden="true"
                  >
                    {!nuevo && i < 4 && <Llama activa className="size-4" />}
                  </motion.span>
                  {d}
                </span>
              ))}
            </div>
          </div>
          <div className="caja p-5">
            <p className="chico">Métodos</p>
            <ul className="mt-2">
              {[
                ["El tomate", "25 min de foco", "#C2412D"],
                ["Las 5 cajas", "Repaso espaciado", "#F2B341"],
                ["Explícaselo a León", "Con tus palabras", "#2430D9"],
              ].map(([n, d, c]) => (
                <li key={n} className="flex min-h-12 items-center gap-3">
                  <span className="size-3 rounded-full" style={{ background: c }} aria-hidden="true" />
                  <span className="flex-1 font-bold">{n}</span>
                  <span className="chico">{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

/* ---------- 4. Auxi Vida: Hoy ---------- */
function VidaHoy({ celular }: { celular: boolean }) {
  const [oculto, setOculto] = useState(false);
  const m = (v: string) => (oculto ? "S/ •••" : v);
  return (
    <AppShell
      celular={celular}
      producto="Auxi Vida"
      color="#0E5B57"
      fondo="var(--menta)"
      flotante
      items={["Hoy", "Movimientos", "Registrar", "Metas", "Protégete"].map((n, i) => ({ nombre: n, activo: i === 0 }))}
      inferior={["Hoy", "Movim.", "Registrar", "Metas", "Protégete"]}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="h2">Hoy</h1>
          <p className="chico mt-1 text-[15px]">Domingo 23 de noviembre</p>
        </div>
        <button type="button" aria-pressed={oculto} onClick={() => setOculto(!oculto)} className="btn btn-s min-h-11 border-[color:var(--menta-2)] px-4 text-[15px] text-[color:var(--teal)]">
          {oculto ? "Mostrar montos" : "Ocultar montos"}
        </button>
      </div>
      <div className="mt-6 grid gap-6 @4xl:grid-cols-12">
        <section className="relative overflow-hidden rounded-[28px] bg-[color:var(--teal)] p-6 text-white shadow-[0_6px_0_#07403D] @4xl:col-span-7" aria-labelledby="disp">
          <LeonVida pose="saluda" alto={celular ? 110 : 170} rebote className={`absolute ${celular ? "top-2 right-1" : "right-4 bottom-0"}`} />
          <div className={celular ? "pr-[96px]" : "pr-[170px]"}>
            <h2 id="disp" className="font-semibold text-white/90" style={{ fontFamily: "Figtree, sans-serif", letterSpacing: 0 }}>
              Disponible estimado para hoy
            </h2>
            <p className="mt-1 text-[52px] leading-[56px] font-black" style={{ fontFamily: NUNITO }}>
              {oculto ? "S/ •••" : <Contador valor={31} prefijo="S/ " />}
            </p>
            <p className="text-[14px] text-white/80">Es un estimado con lo que registras, no el saldo de tu banco.</p>
          </div>
          <dl className={`num mt-5 grid grid-cols-3 gap-3 border-t border-white/20 pt-4 text-[14px] ${celular ? "" : "mr-[170px]"}`}>
            {[
              ["Día normal", m("S/ 27")],
              ["Sobró ayer", m("+ S/ 4")],
              ["Gastaste hoy", m("S/ 0")],
            ].map(([a, b]) => (
              <div key={a}>
                <dt className="text-white/75">{a}</dt>
                <dd className="font-bold">{b}</dd>
              </div>
            ))}
          </dl>
          {!celular && (
            <a href="#r" className="btn btn-bt mt-5">
              Registrar
            </a>
          )}
        </section>
        <aside className="flex flex-col gap-4 @4xl:col-span-5">
          <div className="flex items-start gap-3 rounded-[20px] bg-white p-4 ring-1 ring-[color:var(--menta-2)]">
            <CaraLeonVida cara="feliz" tamano={44} />
            <p className="text-[15px] leading-[21px]">
              <span className="font-bold">Vas bien.</span> Ayer te sobraron {m("S/ 4")} y se suman a hoy.
            </p>
          </div>
          <div className="rounded-[20px] bg-white p-5 ring-1 ring-[color:var(--menta-2)]">
            <p className="chico">Próximo pago</p>
            <p className="mt-1 font-bold">Internet vence mañana</p>
            <p className="num chico">{m("S/ 60")}</p>
          </div>
          <div className="rounded-[20px] bg-white p-5 ring-1 ring-[color:var(--menta-2)]">
            <p className="chico">Meta activa</p>
            <p className="mt-1 font-bold">Colchón</p>
            <div className="mt-3">
              <Barra pct={20} color="var(--oro)" fondo="var(--menta-2)" />
            </div>
            <p className="num chico mt-2">{m("S/ 60 de S/ 300")} · 20 %</p>
          </div>
        </aside>
        <section className="rounded-[20px] bg-white p-5 ring-1 ring-[color:var(--menta-2)] @4xl:col-span-12" aria-labelledby="ult">
          <div className="flex items-center justify-between">
            <h2 id="ult" className="h3">
              Últimos movimientos
            </h2>
            <a href="#mov" className="min-h-11 content-center font-semibold text-[color:var(--teal)]">
              Ver todos
            </a>
          </div>
          <table className="num mt-3 w-full text-left text-[15px]">
            <thead className="chico">
              <tr>
                <th className="py-2 font-semibold">Movimiento</th>
                {!celular && <th className="py-2 font-semibold">Categoría</th>}
                <th className="py-2 text-right font-semibold">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--menta-2)]">
              {[
                ["Menú", "Comida", "− S/ 12"],
                ["Pasaje", "Transporte", "− S/ 3"],
                ["Turno", "Trabajo", "+ S/ 75"],
              ].map(([a, b, c]) => (
                <tr key={a} className="h-12">
                  <td className="font-semibold">{a}</td>
                  {!celular && <td className="text-[color:var(--gris)]">{b}</td>}
                  <td className="text-right font-semibold">{m(c)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <div className="flex flex-wrap gap-x-6 gap-y-1 @4xl:col-span-12">
          <a href="#imp" className="inline-flex min-h-11 items-center font-semibold text-[color:var(--teal)] underline">
            Importar movimientos
          </a>
          <a href="#pro" className="inline-flex min-h-11 items-center font-semibold text-[color:var(--teal)] underline">
            ¿Vas a pagar? Revísalo antes
          </a>
        </div>
      </div>
    </AppShell>
  );
}

/* ---------- 5. Sistema ---------- */
function Sistema() {
  const colores = [
    ["Fondo", "#F7F8FC", "Casi blanco, nunca crema"],
    ["Tinta", "#141A4D", "Texto principal · 15:1"],
    ["Gris", "#5B6084", "Texto secundario · 5,7:1"],
    ["Cobalto", "#2430D9", "Acciones y Auxi Student · blanco 8,4:1"],
    ["Teal", "#0E5B57", "Auxi Vida · blanco 7,9:1"],
    ["Turquesa", "#5FE3DC", "Aciertos y progreso, con texto oscuro"],
    ["Oro", "#F2B341", "Solo premios: monedas, racha, cofre, metas"],
    ["Índigo", "#4A4EDB", "Vendoe y lo que viene"],
  ];
  return (
    <div className="mx-auto max-w-[1000px] px-4 py-10 @4xl:px-8">
      <h1 className="h2">Sistema v2: estructura adulta, alma de León</h1>
      <h2 className="h3 mt-8">Color</h2>
      <div className="mt-3 grid gap-3 @2xl:grid-cols-4">
        {colores.map(([n, h, d]) => (
          <div key={n} className="caja overflow-hidden">
            <div className="h-14" style={{ background: h }} />
            <div className="p-3">
              <p className="font-bold">
                {n} <span className="num font-medium text-[color:var(--gris)]">{h}</span>
              </p>
              <p className="chico">{d}</p>
            </div>
          </div>
        ))}
      </div>
      <h2 className="h3 mt-10">Tipografía</h2>
      <div className="caja mt-3 flex flex-col gap-4 p-6">
        <p className="h1">Títulos en Nunito 900</p>
        <p className="h3">Bloques en Nunito 800</p>
        <p>Texto, tablas y datos en Figtree 500: se lee mejor en párrafos y montos.</p>
        <p className="chico">Ayuda 14/20 · Figtree 500</p>
        <p className="num text-[32px] font-black" style={{ fontFamily: NUNITO }}>
          S/ 1 234,50 · números tabulares
        </p>
      </div>
      <h2 className="h3 mt-10">Botones que se hunden (tócalos)</h2>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className="btn btn-p" onClick={() => sonidos.toque()}>
          Principal
        </button>
        <button type="button" className="btn btn-s" onClick={() => sonidos.toque()}>
          Secundario
        </button>
        <button type="button" className="btn btn-t" onClick={() => sonidos.toque()}>
          Auxi Vida
        </button>
        <button type="button" className="btn btn-oro" onClick={() => sonidos.cofre()}>
          Premio
        </button>
      </div>
      <h2 className="h3 mt-10">Movimiento</h2>
      <ul className="chico mt-3 flex list-disc flex-col gap-1 pl-5 text-[15px]">
        <li>Un momento orquestado al cargar la landing: León entra con rebote, la órbita aparece y los premios saltan uno tras otro.</li>
        <li>Movimiento continuo y lento solo en tres lugares: la órbita, la cinta y León flotando en el héroe.</li>
        <li>Todo lo demás responde a la persona: botones que se hunden, tarjetas que suben al pasar el mouse, aciertos con confeti y sonido.</li>
        <li>Números que cuentan y barras que se llenan con resorte. Con movimiento reducido, todo queda quieto.</li>
      </ul>
      <h2 className="h3 mt-10">León: dónde aparece</h2>
      <div className="mt-3 grid gap-3 @2xl:grid-cols-2">
        {[
          ["Landing", "A1 saluda en el héroe y A5 anima en el cierre; caras chicas en la prueba."],
          ["Mi espacio", "A1 saluda junto a tu nombre, tu racha y tus monedas."],
          ["Auxi Student", "A3 concentrado en «Continuar»; A1 saluda en la cuenta nueva."],
          ["Auxi Vida", "B1 saluda en el disponible y su cara (B8) para los consejos."],
        ].map(([t, d]) => (
          <div key={t} className="caja p-4">
            <p className="font-bold">{t}</p>
            <p className="chico mt-1">{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Marco de la propuesta ---------- */
export default function Propuesta() {
  const [vista, setVista] = useState<Vista>("landing");
  const [ancho, setAncho] = useState<Ancho>("computadora");
  const [nuevo, setNuevo] = useState(false);
  const zona = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState(1);
  const px = ancho === "celular" ? 390 : 1280;

  useEffect(() => {
    document.title = "Propuesta visual v2 · Auxi Studio";
    const medir = () => setEscala(Math.min(1, ((zona.current?.clientWidth ?? px) - 32) / px));
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, [px]);

  const pestanas: [Vista, string][] = [
    ["landing", "Landing"],
    ["espacio", "Mi espacio"],
    ["student", "Auxi Student"],
    ["vida", "Auxi Vida"],
    ["sistema", "Sistema"],
  ];
  const celular = ancho === "celular";

  return (
    <div className="min-h-dvh bg-[#E4E6EF]" style={{ fontFamily: "Figtree, system-ui, sans-serif" }}>
      <style>{ESTILOS}</style>
      <div className="sticky top-0 z-30 flex flex-wrap items-center gap-2 border-b border-[#C9CDE0] bg-white px-4 py-2 text-[14px] font-semibold text-[#141A4D]">
        <span className="mr-2">Propuesta v2 · boceto</span>
        <div role="tablist" className="flex flex-wrap gap-1">
          {pestanas.map(([id, n]) => (
            <button key={id} role="tab" aria-selected={vista === id} onClick={() => setVista(id)} className={`min-h-10 rounded-[8px] px-3 ${vista === id ? "bg-[#141A4D] text-white" : "hover:bg-[#ECEEFB]"}`}>
              {n}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-1" role="radiogroup" aria-label="Tamaño">
          {(["celular", "computadora"] as Ancho[]).map((a) => (
            <button key={a} role="radio" aria-checked={ancho === a} onClick={() => setAncho(a)} className={`min-h-10 rounded-[8px] px-3 ${ancho === a ? "bg-[#2430D9] text-white" : "hover:bg-[#ECEEFB]"}`}>
              {a === "celular" ? "Celular 390" : "Computadora 1280"}
            </button>
          ))}
        </div>
        {vista === "student" && (
          <label className="flex min-h-10 items-center gap-2 px-2">
            <input type="checkbox" checked={nuevo} onChange={(e) => setNuevo(e.target.checked)} />
            Cuenta nueva
          </label>
        )}
      </div>
      <div ref={zona} className="overflow-x-hidden p-4">
        <div className="mx-auto" style={{ width: px * escala }}>
          <div key={`${vista}-${ancho}-${nuevo}`} className="pp @container overflow-clip rounded-[12px] shadow-[0_10px_30px_rgba(20,26,77,.15)]" style={{ width: px, zoom: escala }}>
            {vista === "landing" && <Landing celular={celular} />}
            {vista === "espacio" && <MiEspacio celular={celular} />}
            {vista === "student" && <StudentInicio celular={celular} nuevo={nuevo} />}
            {vista === "vida" && <VidaHoy celular={celular} />}
            {vista === "sistema" && <Sistema />}
          </div>
        </div>
      </div>
    </div>
  );
}
