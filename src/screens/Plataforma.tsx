import { motion } from "motion/react";
import { lazy, Suspense, useEffect, type MouseEvent } from "react";
import { INSTAGRAM_URL } from "../components/ApoyaAlCreador";
import { Banner, type Tono } from "../components/Banner";
import { PonEnInicio } from "../components/PonEnInicio";
import { metricas, registrar } from "../lib/metricas";
import { salir, useCuenta } from "../lib/nube";
import { AUTOR, LANDING_URL, MINI_APPS, NOMBRE_PLATAFORMA, VENDOE_URL, type MiniAppInfo } from "../lib/plataforma";
import { navegar, reemplazar, useRuta, useRutaCompleta } from "../lib/rutas";
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

/* ---------- Portada ---------- */

/** Portada para quien no ha iniciado sesión: la landing del ecosistema (src/landing), en su propio archivo. */
const LandingV6 = lazy(() => import("../landing"));

function Portada() {
  return (
    <Suspense fallback={<div className="min-h-dvh" style={{ background: "#080E25" }} />}>
      <LandingV6 />
    </Suspense>
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
        <div className="mt-5">
          <PonEnInicio nombre="Auxi Studio" variante="tarjeta" />
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
  const rutaCompleta = useRutaCompleta();
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
  // /?portada muestra la presentación aunque haya sesión (desde el selector de apps, o para revisarla en desarrollo).
  const verPortada = rutaCompleta.includes("?") && new URLSearchParams(rutaCompleta.split("?")[1]).has("portada");
  return (conSesion || libre) && !verPortada ? <Inicio conSesion={conSesion} /> : <Portada />;
}
