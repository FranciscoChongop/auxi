/**
 * LANDING v5 del boceto (solo desarrollo, /propuesta). Corta y retentiva: se entiende a la primera.
 * Encabezado · héroe limpio · «Dos apps, una cuenta» (celular con motion graphic + explicación abajo) ·
 * Vendoe en una línea · «Gratis» · preguntas · Daniel Chong, creador de Auxi Studio · pie.
 * Movimiento con propósito: el héroe entra una vez; los motion graphics corren solo a la vista y se pausan.
 */
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useState, type ReactNode } from "react";
import { INSTAGRAM_URL, TIKTOK_URL } from "../components/ApoyaAlCreador";
import { IconoApp } from "../components/IconoApp";
import { Leon } from "../components/Leon";
import { BotonTema, Check, Marca } from "./comun";
import { MotionApp } from "./motion/Motion";

const WHATSAPP = "https://wa.me/51960650372";
const SUAVE = [0.22, 1, 0.36, 1] as const;

/* ---------- Íconos chicos ---------- */
function Ico({ d, className = "size-5" }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
const D = {
  flecha: "M5 12h14M13 6l6 6-6 6",
  whatsapp: "M4 20l1.3-4A8 8 0 1 1 8 18.7zM9 9.5c.3 2 1.8 3.8 4 4.6l1.2-1.2 2 1-.4 1.6c-3.6.3-7.1-3.2-6.8-6.8l1.6-.4 1 2z",
  instagram: "M7.5 3.5h9a4 4 0 0 1 4 4v9a4 4 0 0 1-4 4h-9a4 4 0 0 1-4-4v-9a4 4 0 0 1 4-4zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM17.2 6.8h.01",
  tiktok: "M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.6 2.8 2.5 4.7 5.5 5",
};

const REDES: [string, string, string][] = [
  ["Instagram", INSTAGRAM_URL, D.instagram],
  ["TikTok", TIKTOK_URL, D.tiktok],
  ["WhatsApp", WHATSAPP, D.whatsapp],
];

/* ---------- Encabezado ---------- */
function Encabezado({ celular }: { celular: boolean }) {
  const { scrollY } = useScroll();
  const [solido, setSolido] = useState(false);
  const [menu, setMenu] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => setSolido(v > 60));
  const lleno = solido || menu;
  const secciones: [string, string][] = [
    ["#apps", "Cómo funciona"],
    ["#preguntas", "Preguntas"],
    ["#sobre", "Sobre mí"],
  ];
  return (
    <header className="sticky z-40" style={{ top: "var(--tope)" }}>
      <div className={`border-b transition-colors duration-300 ${lleno ? "border-[color:var(--linea)] bg-[color:var(--bg)]/85 backdrop-blur-xl" : "border-transparent"}`}>
        <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between gap-4 px-5 @4xl:px-8">
          <a href="#inicio" aria-label="Auxi Studio, inicio">
            <Marca clara={!lleno} />
          </a>
          <nav aria-label="Principal" className={`hidden items-center gap-1 text-[15px] font-semibold @4xl:flex ${lleno ? "" : "text-white/90"}`}>
            {secciones.map(([h, n]) => (
              <a key={h} href={h} className={`flex min-h-11 items-center rounded-full px-3.5 transition-colors ${lleno ? "hover:bg-[color:var(--superficie-2)]" : "hover:bg-white/10"}`}>
                {n}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-1.5">
            <BotonTema clara={!lleno} />
            {!celular ? (
              <>
                <a className={`flex min-h-11 items-center rounded-full px-3.5 font-bold ${lleno ? "text-[color:var(--cobalto)]" : "text-white"}`} href="#entrar">
                  Entrar
                </a>
                <a className={`btn min-h-11 px-4 text-[15px] ${lleno ? "btn-p" : "btn-b"}`} href="#crear">
                  Crear cuenta gratis
                </a>
              </>
            ) : (
              <button type="button" aria-expanded={menu} aria-label={menu ? "Cerrar menú" : "Abrir menú"} onClick={() => setMenu(!menu)} className={`grid size-11 place-items-center rounded-full ${lleno ? "" : "text-white"}`}>
                <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
                  {menu ? <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /> : <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
                </svg>
              </button>
            )}
          </div>
        </div>
        <AnimatePresence initial={false}>
          {celular && menu && (
            <motion.nav aria-label="Principal" className="overflow-hidden border-t border-[color:var(--linea)] px-5" initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.25, ease: SUAVE }}>
              <div className="flex flex-col py-2 text-[17px] font-semibold">
                {secciones.map(([h, n]) => (
                  <a key={h} href={h} onClick={() => setMenu(false)} className="flex min-h-12 items-center">
                    {n}
                  </a>
                ))}
                <a href="#entrar" className="flex min-h-12 items-center text-[color:var(--cobalto)]">
                  Entrar
                </a>
                <a className="btn btn-p my-3" href="#crear">
                  Crear cuenta gratis
                </a>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

/* ---------- Héroe: solo lo importante ---------- */
function Heroe({ celular }: { celular: boolean }) {
  const quieto = !!useReducedMotion();
  const palabras = "Estudia jugando y ordena tu plata, gratis.".split(" ");
  const t = celular ? 210 : 400;
  return (
    <section id="inicio" className="relative isolate -mt-[72px] overflow-hidden bg-[color:var(--espacio)] text-white">
      <div className="absolute inset-0 -z-10" aria-hidden="true" style={{ background: "radial-gradient(60% 70% at 78% 45%, rgba(95,227,220,.20) 0%, transparent 60%), radial-gradient(70% 80% at 10% 100%, rgba(36,48,217,.45) 0%, transparent 60%)" }} />
      <div className="absolute inset-0 -z-10 opacity-50" aria-hidden="true" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.12) 1px, transparent 1px)", backgroundSize: "30px 30px", maskImage: "radial-gradient(ellipse at 70% 40%, black 20%, transparent 70%)" }} />
      <div className="mx-auto grid max-w-[1200px] items-center gap-4 px-5 pt-[100px] pb-16 @4xl:min-h-[700px] @4xl:grid-cols-12 @4xl:gap-0 @4xl:px-8 @4xl:pt-[120px] @4xl:pb-20">
        <div className="relative @4xl:order-2 @4xl:col-span-5">
          <div className="relative mx-auto grid place-items-center" style={{ width: t + (celular ? 60 : 80), height: t + 20 }}>
            <svg viewBox="0 0 400 320" className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
              <motion.ellipse cx="200" cy="175" rx="196" ry="62" fill="none" stroke="rgba(95,227,220,.6)" strokeWidth="1.4" transform="rotate(-12 200 175)" initial={quieto ? false : { pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.4, ease: "easeInOut", delay: 0.3 }} />
              <motion.circle cx="18" cy="212" r="7" fill="#F2B341" initial={quieto ? false : { scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.6, type: "spring", stiffness: 400, damping: 14 }} style={{ transformOrigin: "18px 212px" }} />
            </svg>
            <Leon pose="saluda" alto={t} rebote />
          </div>
        </div>
        <div className="@4xl:order-1 @4xl:col-span-7">
          <h1 className="h1 max-w-[12ch]" aria-label="Estudia jugando y ordena tu plata, gratis.">
            {palabras.map((p, k) => (
              <motion.span key={k} className="mr-[0.25em] inline-block" initial={quieto ? false : { opacity: 0, y: 22, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ delay: 0.1 + k * 0.07, duration: 0.55, ease: SUAVE }} aria-hidden="true">
                {p}
              </motion.span>
            ))}
          </h1>
          <motion.p className="mt-5 max-w-[44ch] text-[18px] leading-[28px] text-white/80 @4xl:text-[20px] @4xl:leading-[31px]" initial={quieto ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, duration: 0.5, ease: SUAVE }}>
            Auxi Student convierte tus apuntes en minijuegos. Auxi Vida te dice cuánto puedes gastar hoy. Las dos con una sola cuenta.
          </motion.p>
          <motion.div className="mt-8 flex flex-wrap gap-3" initial={quieto ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.5, ease: SUAVE }}>
            <a className="btn btn-b" href="#crear">
              Crear mi cuenta gratis
            </a>
            <a className="btn btn-f" href="#apps">
              Ver cómo funciona
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Dos apps, una cuenta: celular con motion + explicación abajo ---------- */
function Escenario({ app, nombre, publico, fondo, explicacion, accion, celular }: { app: "student" | "vida"; nombre: string; publico: string; fondo: string; explicacion: string; accion: string; celular: boolean }) {
  return (
    <article className="relative isolate flex flex-col items-center overflow-hidden rounded-[36px] px-6 pt-8 pb-9 text-center text-white shadow-[0_40px_80px_-40px_rgba(10,14,42,.6)] @4xl:px-10 @4xl:pt-10" style={{ background: fondo }}>
      <div className="absolute inset-0 -z-10 opacity-50" aria-hidden="true" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.12) 1px, transparent 1px)", backgroundSize: "22px 22px", maskImage: "radial-gradient(ellipse at 50% 40%, black 30%, transparent 75%)" }} />
      <div className="absolute top-[22%] left-1/2 -z-10 size-[420px] -translate-x-1/2 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
      <div className="flex items-center gap-3 text-left">
        <IconoApp app={app} tamano={52} decorativo />
        <div>
          <h3 className="text-[24px] leading-[28px] font-black">{nombre}</h3>
          <p className="text-[14px] text-white/75">{publico}</p>
        </div>
      </div>
      <div className="mt-9">
        <MotionApp app={app} ancho={celular ? 236 : 270} />
      </div>
      <p className="mt-3 max-w-[40ch] text-[16px] leading-[25px] text-white/85">{explicacion}</p>
      <a className="btn btn-b mt-6" href="#crear">
        {accion}
      </a>
    </article>
  );
}

function Apps({ celular }: { celular: boolean }) {
  return (
    <section id="apps" className="mx-auto max-w-[1200px] px-5 py-20 @4xl:px-8 @4xl:py-28">
      <div className="mx-auto max-w-[640px] text-center">
        <h2 className="h2">Dos apps. Una cuenta.</h2>
        <p className="cuerpo-l mt-4">Mira el camino de cada una en 15 segundos.</p>
      </div>
      <div className="mt-12 grid gap-6 @4xl:grid-cols-2">
        <Escenario
          app="student"
          nombre="Auxi Student"
          publico="Para estudiantes"
          fondo="radial-gradient(120% 90% at 50% 0%, #3A47F2 0%, #2430D9 42%, #10168A 100%)"
          explicacion="Sube tu PDF o tus apuntes y se vuelven un minijuego. Juegas de distintas formas, ganas monedas y repasas lo que fallaste justo a tiempo."
          accion="Empezar con Auxi Student"
          celular={celular}
        />
        <Escenario
          app="vida"
          nombre="Auxi Vida"
          publico="Para tu plata del día"
          fondo="radial-gradient(120% 90% at 50% 0%, #14857F 0%, #0E5B57 45%, #052B29 100%)"
          explicacion="Anota tus gastos en segundos y mira cuánto puedes gastar hoy. Lo que sobra va a tu colchón y, antes de pagar, León revisa si es estafa."
          accion="Probar Auxi Vida"
          celular={celular}
        />
      </div>
      <a id="vendoe" href="#vendoe-externo" className="group mt-6 flex items-center gap-4 rounded-[24px] border border-[color:var(--linea)] bg-[color:var(--blanco)] p-4 transition-colors hover:border-[color:var(--indigo)] @4xl:p-5">
        <IconoApp app="vendoe" tamano={48} decorativo />
        <span className="flex-1 text-[15px] leading-[22px]">
          <span className="font-bold">¿Tienes un negocio?</span> <span className="text-[color:var(--gris)]">Vendoe es otra app que creé para vender desde tu celular, con su propia página.</span>
        </span>
        <span className="hidden items-center gap-1 font-bold text-[color:var(--indigo)] @2xl:flex">
          Conocer Vendoe
          <Ico d={D.flecha} className="size-5 transition-transform group-hover:translate-x-1" />
        </span>
      </a>
    </section>
  );
}

/* ---------- Gratis ---------- */
function Gratis() {
  return (
    <section className="px-5 @4xl:px-8">
      <div className="relative isolate mx-auto max-w-[1200px] overflow-hidden rounded-[36px] bg-[color:var(--espacio)] px-6 py-14 text-center text-white @4xl:py-20">
        <div className="absolute inset-0 -z-10" aria-hidden="true" style={{ background: "radial-gradient(60% 90% at 50% 0%, rgba(242,179,65,.25) 0%, transparent 60%)" }} />
        <h2 className="h2">Gratis, de verdad.</h2>
        <p className="mx-auto mt-4 max-w-[44ch] text-[18px] leading-[28px] text-white/80">Crea tu cuenta en un minuto. No te pedimos tarjeta.</p>
        <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[15px] text-white/85">
          {["Sin tarjeta", "En celular y computadora", "Tus datos en tu cuenta"].map((x) => (
            <li key={x} className="flex items-center gap-1.5">
              <Check color="#5FE3DC" className="size-5" />
              {x}
            </li>
          ))}
        </ul>
        <a className="btn btn-b mt-8" href="#crear">
          Crear mi cuenta gratis
        </a>
      </div>
    </section>
  );
}

/* ---------- Preguntas ---------- */
function Pregunta({ q, children, abierta, alTocar }: { q: string; children: ReactNode; abierta: boolean; alTocar: () => void }) {
  return (
    <div className="border-b border-[color:var(--linea)]">
      <button type="button" aria-expanded={abierta} onClick={alTocar} className="flex min-h-16 w-full items-center justify-between gap-4 py-3 text-left text-[17px] font-bold">
        {q}
        <motion.span className="grid size-8 shrink-0 place-items-center rounded-full bg-[color:var(--superficie-2)]" animate={{ rotate: abierta ? 45 : 0 }} transition={{ duration: 0.2 }} aria-hidden="true">
          <svg viewBox="0 0 20 20" className="size-4">
            <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {abierta && (
          <motion.div className="overflow-hidden" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: SUAVE }}>
            <p className="max-w-[60ch] pb-5 text-[16px] leading-[25px] text-[color:var(--gris)]">{children}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Preguntas() {
  const [abierta, setAbierta] = useState(0);
  const lista: [string, string][] = [
    ["¿De verdad es gratis?", "Sí. Creas tu cuenta y usas Auxi Student y Auxi Vida sin pagar. No pedimos tarjeta."],
    ["¿Cómo se crea el minijuego?", "Pasas tu PDF o tus apuntes por tu propia IA (ChatGPT, Claude o Gemini) con el pedido de Auxi y pegas la respuesta. Revisas las preguntas y a jugar."],
    ["¿Auxi Vida se conecta a mi banco?", "No. No mueve dinero ni ve tu saldo. Tú anotas o importas tus movimientos y el disponible del día es un estimado."],
    ["¿Quién ve mis datos?", "Solo tú. Se guardan en tu cuenta y puedes borrarla cuando quieras desde tu perfil."],
    ["¿Funciona en iPhone y Android?", "Sí, desde el navegador. También puedes agregarla a tu pantalla de inicio y abrirla como una app."],
  ];
  return (
    <section id="preguntas" className="mx-auto max-w-[820px] px-5 py-20 @4xl:px-8 @4xl:py-28">
      <h2 className="h2 text-center">Preguntas frecuentes</h2>
      <div className="mt-10 border-t border-[color:var(--linea)]">
        {lista.map(([q, r], k) => (
          <Pregunta key={q} q={q} abierta={abierta === k} alTocar={() => setAbierta(abierta === k ? -1 : k)}>
            {r}
          </Pregunta>
        ))}
      </div>
    </section>
  );
}

/* ---------- Sobre mí (la única vez que aparece la foto) ---------- */
function SobreMi() {
  return (
    <section id="sobre" className="px-5 pb-20 @4xl:px-8 @4xl:pb-28">
      <div className="relative isolate mx-auto grid max-w-[1000px] items-center gap-8 overflow-hidden rounded-[36px] border border-[color:var(--linea)] bg-[color:var(--blanco)] p-6 @4xl:grid-cols-[300px_1fr] @4xl:gap-12 @4xl:p-10">
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[300px] overflow-hidden rounded-[28px] bg-[#0A0E2A]">
          <img src="/plataforma/presentacion.webp" alt="Daniel Chong" className="size-full scale-[1.35] object-cover" style={{ transformOrigin: "50% 55%" }} draggable={false} />
        </div>
        <div>
          <p className="text-[15px] font-bold text-[color:var(--cobalto)]">Creador de Auxi Studio</p>
          <h2 className="h2 mt-1">Daniel Chong</h2>
          <div className="mt-5 flex flex-col gap-3 text-[17px] leading-[27px] text-[color:var(--gris)]">
            <p>Me apasiona crear soluciones digitales para negocios y para personas. En Auxi Studio reúno las herramientas que construyo.</p>
            <p>Aquí también comparto lo que aprendo en el camino, incluidos mis errores, porque de ellos sale lo que mejor funciona.</p>
            <p className="font-semibold text-[color:var(--tinta)]">Te doy la bienvenida. Este espacio es para ti: sácale todo el provecho posible.</p>
          </div>
          <div className="mt-7 flex flex-wrap gap-2.5">
            {REDES.map(([n, h, d]) => (
              <a key={n} href={h} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center gap-2 rounded-full border border-[color:var(--linea)] px-4 font-bold transition-colors hover:border-[color:var(--cobalto)] hover:text-[color:var(--cobalto)]">
                <Ico d={d} className="size-5" />
                {n}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Pie ---------- */
function Pie() {
  const columnas: [string, [string, string][]][] = [
    [
      "Apps",
      [
        ["Auxi Student", "#apps"],
        ["Auxi Vida", "#apps"],
        ["Vendoe (sitio aparte)", "#vendoe"],
      ],
    ],
    [
      "Contacto",
      [
        ["Instagram", INSTAGRAM_URL],
        ["TikTok", TIKTOK_URL],
        ["WhatsApp", WHATSAPP],
      ],
    ],
    [
      "Legal",
      [
        ["Privacidad", "#privacidad"],
        ["Condiciones", "#terminos"],
      ],
    ],
  ];
  return (
    <footer className="bg-[color:var(--espacio)] text-white">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-14 @4xl:grid-cols-12 @4xl:px-8">
        <div className="@4xl:col-span-6">
          <Marca clara />
          <p className="mt-4 max-w-[32ch] text-[14px] leading-[21px] text-white/65">Apps gratis para estudiar jugando y ordenar tu plata, con una sola cuenta.</p>
        </div>
        {columnas.map(([t, items]) => (
          <div key={t} className="@4xl:col-span-2">
            <p className="text-[14px] font-bold text-white/90">{t}</p>
            <ul className="mt-3">
              {items.map(([n, h]) => (
                <li key={n}>
                  <a href={h} {...(h.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="flex min-h-11 items-center text-[15px] text-white/65 transition-colors hover:text-white">
                    {n}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-[1200px] px-5 py-6 text-[13px] text-white/55 @4xl:px-8">© 2026 Auxi Studio por Daniel Chong</p>
      </div>
    </footer>
  );
}

export function Landing({ celular }: { celular: boolean }) {
  return (
    <div>
      <Encabezado celular={celular} />
      <Heroe celular={celular} />
      <Apps celular={celular} />
      <Gratis />
      <Preguntas />
      <SobreMi />
      <Pie />
    </div>
  );
}
