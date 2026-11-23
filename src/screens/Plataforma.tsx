import { motion, useReducedMotion } from "motion/react";
import { useEffect, type MouseEvent } from "react";
import { INSTAGRAM_URL } from "../components/ApoyaAlCreador";
import { Banner, type Tono } from "../components/Banner";
import { Boton } from "../components/Boton";
import { Leon } from "../components/Leon";
import { metricas, registrar } from "../lib/metricas";
import { salir, useCuenta } from "../lib/nube";
import { AUTOR, FRASE_PLATAFORMA, LANDING_URL, MINI_APPS, NOMBRE_PLATAFORMA, VENDOE_URL, type MiniAppInfo } from "../lib/plataforma";
import { navegar, reemplazar, useRuta } from "../lib/rutas";
import { sonidos } from "../lib/sonidos";
import Entrada from "./Entrada";
import Legal from "./Legal";

/** Marca de la plataforma: una órbita con tres puntos de color (uno por mini app). */
export function Orbita({ tamano = 36 }: { tamano?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={tamano} height={tamano} aria-hidden="true">
      <circle cx="20" cy="20" r="13" fill="none" stroke="var(--brand)" strokeWidth="2.4" strokeDasharray="3 4" strokeLinecap="round" />
      <circle cx="20" cy="20" r="5.5" fill="var(--reward)" stroke="var(--reward-dark)" strokeWidth="2" />
      <circle cx="33" cy="20" r="3.6" fill="#2430D9" />
      <circle cx="13.5" cy="31.3" r="3.6" fill="#0E5B57" />
      <circle cx="13.5" cy="8.7" r="3.6" fill="#4A4EDB" />
    </svg>
  );
}

export function MarcaPlataforma({ clara = false }: { clara?: boolean }) {
  return (
    <span className={`flex items-center gap-2 ${clara ? "text-white" : ""}`}>
      <Orbita />
      <span className="leading-tight">
        <span className="block text-[19px] font-black tracking-tight">{NOMBRE_PLATAFORMA}</span>
        <span className={`block text-[12px] font-bold ${clara ? "text-white/80" : "text-text-soft"}`}>por {AUTOR}</span>
      </span>
    </span>
  );
}

/** Imagen y tono de cada mini app (los archivos van en public/plataforma/). */
const ARTE_DE: Record<MiniAppInfo["id"], { imagen: string; tono: Tono }> = {
  student: { imagen: "student", tono: "student" },
  vida: { imagen: "vida", tono: "vida" },
  negocio: { imagen: "vendoe", tono: "vendoe" },
};

/** Enlace interno sin recargar la página (respeta Ctrl o Cmd para abrir en otra pestaña). */
function irA(ruta: string) {
  return (e: Pick<MouseEvent, "metaKey" | "ctrlKey" | "shiftKey" | "preventDefault">) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    navegar(ruta);
  };
}

/** Aparece al llegar a la vista (una sola vez). */
const alVer = (retraso = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.5, ease: "easeOut" as const, delay: retraso },
});

/* ---------- Portada ---------- */

/** La mascota aparece solo aquí, una vez: León dentro de la órbita, con los tres puntos girando alrededor. */
function Heroe() {
  const quieto = !!useReducedMotion();
  return (
    <Banner nombre="hero" nombreMovil="hero-movil" tono="hero" modo="contenido" parallax={false} className="rounded-t-none md:rounded-[32px]">
      <div className="flex flex-col items-center px-5 pt-8 pb-10 text-center text-white md:py-14">
        <div className="relative grid size-64 place-items-center">
          <motion.div className="absolute inset-0" animate={quieto ? {} : { rotate: 360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} aria-hidden="true">
            <svg viewBox="0 0 100 100" className="size-full">
              <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="1" strokeDasharray="2 3" />
              <circle cx="96" cy="50" r="4.4" fill="#2430D9" stroke="#fff" strokeWidth="1.4" />
              <circle cx="27" cy="89.8" r="4.4" fill="#0E5B57" stroke="#fff" strokeWidth="1.4" />
              <circle cx="27" cy="10.2" r="4.4" fill="#4A4EDB" stroke="#fff" strokeWidth="1.4" />
            </svg>
          </motion.div>
          <motion.div
            className="grid size-48 place-items-center rounded-full bg-white/12 ring-1 ring-white/25 backdrop-blur-[2px]"
            animate={quieto ? {} : { y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Leon pose="saluda" alto={170} rebote />
          </motion.div>
        </div>
        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }} className="mt-5 text-[32px] leading-[36px] font-black md:text-[44px] md:leading-[48px]">
          Tu mundo de mini apps
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }} className="mt-2 max-w-sm text-[17px] text-white/90">
          {FRASE_PLATAFORMA} Una sola cuenta para todas.
        </motion.p>
      </div>
    </Banner>
  );
}

/** Cinta con frases que se desplazan sin parar (quieta si se reduce el movimiento). */
function Cinta() {
  const quieto = !!useReducedMotion();
  const frases = ["Estudia jugando", "Ordena tu plata", "Protégete de estafas", "Una sola cuenta", "Gratis", "Para tu negocio"];
  const colores = ["#2430D9", "#0E5B57", "#F2B341", "#4A4EDB", "#5FE3DC", "#7B7FF0"];
  const fila = (
    <span className="flex shrink-0 items-center gap-6 pr-6">
      {frases.map((f, i) => (
        <span key={f} className="flex items-center gap-6">
          <span>{f}</span>
          <span className="size-2.5 rounded-full" style={{ background: colores[i % colores.length] }} aria-hidden="true" />
        </span>
      ))}
    </span>
  );
  return (
    <div className="overflow-hidden bg-[#141A4D] py-3 text-[15px] font-extrabold whitespace-nowrap text-white" aria-hidden="true">
      <motion.div className="flex w-max" animate={quieto ? {} : { x: ["0%", "-50%"] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}>
        {fila}
        {fila}
      </motion.div>
    </div>
  );
}

/** Tarjeta-banner de una mini app. */
function TarjetaBanner({ m, indice, alAbrir, nota }: { m: MiniAppInfo; indice: number; alAbrir: (e: MouseEvent<HTMLAnchorElement>) => void; nota?: string }) {
  const { imagen, tono } = ARTE_DE[m.id];
  return (
    <motion.a
      {...alVer(indice * 0.1)}
      href={m.externa ? m.ruta : m.ruta}
      onClick={alAbrir}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      className="group block cursor-pointer rounded-[28px] shadow-[0_8px_0_rgba(20,26,77,.12)]"
      aria-label={`${m.nombre}. ${m.frase}`}
    >
      <Banner nombre={imagen} tono={tono} velo="fuerte" className="aspect-[16/10] md:aspect-[4/5]">
        <div className="flex h-full flex-col justify-between p-5 text-white">
          <span className="flex items-start justify-between gap-3">
            <span className="text-[26px] leading-[30px] font-black drop-shadow-[0_2px_6px_rgba(0,0,0,.35)]">{m.nombre}</span>
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/20 backdrop-blur-sm transition-transform group-hover:translate-x-1">
              <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
                {m.externa ? <path d="M9 5h10v10M19 5L8 16M5 9v10h10" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /> : <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />}
              </svg>
            </span>
          </span>
          <span>
            <span className="block text-[16px] leading-[22px] text-white/95 drop-shadow-[0_1px_4px_rgba(0,0,0,.4)]">{m.frase}</span>
            <span className="mt-2 inline-block rounded-full bg-black/30 px-3 py-1 text-ayuda font-extrabold backdrop-blur-sm">{nota ?? m.etiqueta}</span>
          </span>
        </div>
      </Banner>
    </motion.a>
  );
}

function BannerCuenta() {
  return (
    <motion.div {...alVer()}>
      <Banner nombre="cuenta" tono="cuenta" velo="izquierda" className="aspect-[4/3] md:aspect-[21/8]">
        <div className="flex h-full flex-col justify-end p-6 text-white md:max-w-[52%] md:justify-center">
          <p className="text-[28px] leading-[32px] font-black drop-shadow-[0_2px_6px_rgba(0,0,0,.35)] md:text-[34px] md:leading-[38px]">Una sola cuenta, todas las mini apps</p>
          <p className="mt-2 text-[16px] text-white/95 drop-shadow-[0_1px_4px_rgba(0,0,0,.4)]">Entras una vez y eliges a dónde ir. Vendoe es una app aparte, con su propia página.</p>
        </div>
      </Banner>
    </motion.div>
  );
}

function BannerAutor() {
  const boton = "inline-flex min-h-11 items-center rounded-full bg-white px-4 font-extrabold text-brand";
  return (
    <motion.div {...alVer()}>
      <Banner nombre="autor" tono="autor" velo="izquierda" className="aspect-[4/3] md:aspect-[21/8]">
        <div className="flex h-full flex-col justify-end p-6 text-white md:max-w-[52%] md:justify-center">
          <p className="text-[28px] leading-[32px] font-black drop-shadow-[0_2px_6px_rgba(0,0,0,.35)] md:text-[34px] md:leading-[38px]">Creado por {AUTOR}</p>
          <p className="mt-2 text-[16px] text-white/95 drop-shadow-[0_1px_4px_rgba(0,0,0,.4)]">Estas mini apps salen de mi estudio, una a una. Mira lo que viene.</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <a className={boton} href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
            {LANDING_URL && (
              <a className={boton} href={LANDING_URL} target="_blank" rel="noopener noreferrer">
                Sobre mí
              </a>
            )}
          </div>
        </div>
      </Banner>
    </motion.div>
  );
}

function Pie() {
  const enlace = "flex min-h-11 items-center font-extrabold text-brand underline underline-offset-4";
  return (
    <footer className="mt-10 flex flex-col items-center gap-1 px-5 text-center text-ayuda text-text-soft" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 24px)" }}>
      <p className="font-bold">
        {NOMBRE_PLATAFORMA} por {AUTOR}
      </p>
      <nav className="flex flex-wrap justify-center gap-x-5" aria-label="Enlaces">
        <a className={enlace} href="/privacidad" onClick={irA("/privacidad")}>
          Privacidad
        </a>
        <a className={enlace} href="/terminos" onClick={irA("/terminos")}>
          Condiciones
        </a>
      </nav>
    </footer>
  );
}

function Portada() {
  const abrir = (m: MiniAppInfo) => (e: MouseEvent<HTMLAnchorElement>) => {
    sonidos.toque();
    if (m.externa) return; // /negocio se abre como página normal y lleva a Vendoe
    irA("/entrar")(e);
  };
  return (
    <main className="min-h-dvh">
      <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-5 pb-3 md:max-w-4xl md:px-8" style={{ paddingTop: "calc(env(safe-area-inset-top) + 16px)" }}>
        <MarcaPlataforma />
        <button type="button" onClick={() => navegar("/entrar")} className="hidden min-h-11 cursor-pointer rounded-full border-2 border-surface bg-card px-4 text-ayuda font-extrabold text-brand md:block">
          Iniciar sesión
        </button>
      </div>
      <div className="mx-auto max-w-md md:max-w-4xl md:px-8">
        <Heroe />
      </div>
      <div className="mt-6">
        <Cinta />
      </div>
      <div className="mx-auto mt-8 max-w-md px-5 md:max-w-4xl md:px-8">
        <motion.h2 {...alVer()} className="text-titulo font-black">
          Elige tu mini app
        </motion.h2>
        <motion.p {...alVer(0.05)} className="mt-1 text-text-soft">
          Inicia sesión una vez y entra a la que quieras.
        </motion.p>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {MINI_APPS.map((m, i) => (
            <TarjetaBanner key={m.id} m={m} indice={i} alAbrir={abrir(m)} nota={m.externa ? m.etiqueta : `${m.etiqueta} · inicia sesión`} />
          ))}
        </div>
        <div className="mt-8 flex flex-col gap-5">
          <BannerCuenta />
          <BannerAutor />
        </div>
      </div>
      <div className="sticky bottom-0 z-10 mx-auto mt-8 max-w-md bg-gradient-to-t from-bg from-60% to-transparent px-5 pt-8 md:static md:max-w-sm md:bg-none md:pt-0" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}>
        <Boton onClick={() => navegar("/entrar")}>Iniciar sesión o crear cuenta</Boton>
        <p className="mt-2 text-center text-ayuda text-text-soft">Gratis. Sin tarjeta.</p>
      </div>
      <Pie />
    </main>
  );
}

/* ---------- Inicio con sesión ---------- */

function Inicio({ conSesion }: { conSesion: boolean }) {
  const abrir = (m: MiniAppInfo) => (e: MouseEvent<HTMLAnchorElement>) => {
    registrar("plataforma_entrada", { destino: m.id }, "plataforma");
    sonidos.toque();
    if (m.externa) return;
    irA(m.ruta)(e);
  };
  return (
    <main className="min-h-dvh">
      <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-5 md:max-w-4xl md:px-8" style={{ paddingTop: "calc(env(safe-area-inset-top) + 16px)" }}>
        <MarcaPlataforma />
        {conSesion && (
          <button
            type="button"
            onClick={async () => {
              await salir();
              reemplazar("/");
            }}
            className="min-h-11 cursor-pointer rounded-full border-2 border-surface bg-card px-4 text-ayuda font-extrabold text-text-soft"
          >
            Cerrar sesión
          </button>
        )}
      </div>
      <div className="mx-auto mt-6 max-w-md px-5 md:max-w-4xl md:px-8">
        <h1 className="text-titulo font-black">¿A dónde quieres entrar?</h1>
        <p className="mt-1 text-text-soft">Todas usan tu misma cuenta. Elige una.</p>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {MINI_APPS.map((m, i) => (
            <TarjetaBanner key={m.id} m={m} indice={i} alAbrir={abrir(m)} />
          ))}
        </div>
        <div className="mt-8">
          <BannerAutor />
        </div>
      </div>
      <Pie />
    </main>
  );
}

/** /negocio: cuenta el clic y lleva a Vendoe, que tiene su propio dominio. */
function IrAVendoe() {
  useEffect(() => {
    metricas.clicVendoe("plataforma");
    window.location.replace(VENDOE_URL);
  }, []);
  return (
    <main className="grid min-h-dvh place-items-center px-5 text-center" role="status">
      <div className="flex flex-col items-center">
        <Orbita tamano={64} />
        <p className="mt-3 font-extrabold">Te llevo a Vendoe…</p>
        <a className="mt-2 inline-flex min-h-11 items-center font-extrabold text-brand underline" href={VENDOE_URL}>
          Si no se abre, toca aquí
        </a>
      </div>
    </main>
  );
}

/** La plataforma: portada, inicio de sesión único, elección de mini app y páginas legales. */
export default function Plataforma() {
  const ruta = useRuta().replace(/\/+$/, "") || "/";
  const cuenta = useCuenta();
  const conSesion = cuenta.modo === "conectado";
  // Sin la nube configurada (por ejemplo, en desarrollo) se puede elegir sin iniciar sesión.
  const libre = cuenta.modo === "sin-nube";

  useEffect(() => {
    document.title = `${NOMBRE_PLATAFORMA} por ${AUTOR} · Mini apps gratis`;
    metricas.appAbierta("plataforma");
  }, []);

  // Al iniciar sesión desde /entrar, se vuelve al inicio.
  useEffect(() => {
    if (ruta === "/entrar" && (conSesion || libre)) reemplazar("/");
  }, [ruta, conSesion, libre]);

  if (ruta === "/negocio") return <IrAVendoe />;
  if (ruta === "/privacidad" || ruta === "/terminos") return <Legal />;
  if (cuenta.modo === "cargando") return <div className="min-h-dvh bg-bg" />;
  if (ruta === "/entrar") return conSesion || libre ? <div className="min-h-dvh bg-bg" /> : <Entrada titulo={NOMBRE_PLATAFORMA} cabecera={<Orbita tamano={56} />} />;
  return conSesion || libre ? <Inicio conSesion={conSesion} /> : <Portada />;
}
