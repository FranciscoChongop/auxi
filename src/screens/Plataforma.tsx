import { motion, useReducedMotion } from "motion/react";
import { useEffect, type ReactNode } from "react";
import { Boton } from "../components/Boton";
import { INSTAGRAM_URL } from "../components/ApoyaAlCreador";
import { entradaEnCascada } from "../lib/movimiento";
import { metricas, registrar } from "../lib/metricas";
import { salir, useCuenta } from "../lib/nube";
import { AUTOR, FRASE_PLATAFORMA, LANDING_URL, MINI_APPS, NOMBRE_PLATAFORMA, VENDOE_URL, type MiniAppInfo } from "../lib/plataforma";
import { navegar, reemplazar, useRuta } from "../lib/rutas";
import { sonidos } from "../lib/sonidos";
import { Leon } from "../components/Leon";
import Entrada from "./Entrada";
import Legal from "./Legal";

/** Marca de la plataforma: una órbita con tres puntos de color (uno por mini app). */
function Orbita({ tamano = 36 }: { tamano?: number }) {
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

export function MarcaPlataforma() {
  return (
    <span className="flex items-center gap-2">
      <Orbita />
      <span className="leading-tight">
        <span className="block text-[19px] font-black tracking-tight">{NOMBRE_PLATAFORMA}</span>
        <span className="block text-[12px] font-bold text-text-soft">por {AUTOR}</span>
      </span>
    </span>
  );
}

/** León dentro de la órbita: los tres puntos giran despacio alrededor (quieto si se reduce el movimiento). */
function Heroe() {
  const quieto = useReducedMotion();
  return (
    <div className="relative mx-auto grid size-64 place-items-center">
      <motion.div className="absolute inset-0" animate={quieto ? {} : { rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} aria-hidden="true">
        <svg viewBox="0 0 100 100" className="size-full">
          <circle cx="50" cy="50" r="46" fill="none" stroke="var(--surface)" strokeWidth="1.2" strokeDasharray="2 3" />
          <circle cx="96" cy="50" r="4" fill="#2430D9" />
          <circle cx="27" cy="89.8" r="4" fill="#0E5B57" />
          <circle cx="27" cy="10.2" r="4" fill="#4A4EDB" />
        </svg>
      </motion.div>
      <div className="grid size-48 place-items-center rounded-full bg-surface">
        <Leon pose="saluda" alto={168} rebote />
      </div>
    </div>
  );
}

function Pie() {
  const enlace = "flex min-h-11 items-center font-extrabold text-brand underline underline-offset-4";
  return (
    <footer className="mt-8 flex flex-col items-center gap-1 px-5 pb-6 text-center text-ayuda text-text-soft" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 24px)" }}>
      <p className="font-bold">
        {NOMBRE_PLATAFORMA} por {AUTOR}
      </p>
      <nav className="flex flex-wrap justify-center gap-x-5" aria-label="Enlaces">
        {LANDING_URL && (
          <a className={enlace} href={LANDING_URL} target="_blank" rel="noopener noreferrer">
            Sobre mí
          </a>
        )}
        <a className={enlace} href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
          Instagram
        </a>
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

/** Enlace interno sin recargar la página (respeta Ctrl o Cmd para abrir en otra pestaña). */
function irA(ruta: string) {
  return (e: { metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; preventDefault: () => void }) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    navegar(ruta);
  };
}

function Portada() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col" style={{ paddingTop: "calc(env(safe-area-inset-top) + 20px)" }}>
      <div className="px-5">
        <MarcaPlataforma />
      </div>
      <div className="px-5 pt-6">
        <Heroe />
        <h1 className="mt-4 text-center text-titulo font-black">Tu mundo de mini apps</h1>
        <p className="mt-2 text-center text-text-soft">{FRASE_PLATAFORMA} Una sola cuenta para todas.</p>
        <ul className="mt-5 flex flex-col gap-2">
          {MINI_APPS.map((m, i) => (
            <motion.li key={m.id} {...entradaEnCascada(i + 1)} className="flex items-center gap-3 rounded-[16px] bg-card px-4 py-3">
              <span className="size-3.5 shrink-0 rounded-full" style={{ background: m.color }} aria-hidden="true" />
              <span>
                <span className="block font-extrabold">{m.nombre}</span>
                <span className="text-ayuda text-text-soft">{m.etiqueta}</span>
              </span>
            </motion.li>
          ))}
        </ul>
      </div>
      <div className="sticky bottom-0 mt-auto bg-gradient-to-t from-bg from-70% to-transparent px-5 pt-6">
        <Boton onClick={() => navegar("/entrar")}>Iniciar sesión o crear cuenta</Boton>
        <p className="mt-2 text-center text-ayuda text-text-soft">Gratis. Sin tarjeta.</p>
      </div>
      <Pie />
    </main>
  );
}

function Tarjeta({ m, indice }: { m: MiniAppInfo; indice: number }) {
  const abrir = (e: React.MouseEvent) => {
    registrar("plataforma_entrada", { destino: m.id }, "plataforma");
    sonidos.toque();
    if (m.externa) return; // /negocio se abre como una página normal y lleva a Vendoe
    irA(m.ruta)(e);
  };
  return (
    <motion.a
      {...entradaEnCascada(indice)}
      href={m.ruta}
      onClick={abrir}
      whileTap={{ y: 4, boxShadow: `0 1px 0 ${m.sombra}` }}
      style={{ background: m.color, boxShadow: `0 5px 0 ${m.sombra}` }}
      className="flex min-h-32 cursor-pointer flex-col justify-between gap-3 rounded-[24px] p-5 text-white"
      aria-label={`${m.nombre}. ${m.frase}`}
    >
      <span className="flex items-start justify-between gap-3">
        <span className="text-[24px] leading-[28px] font-black">{m.nombre}</span>
        <svg viewBox="0 0 24 24" className="mt-1 size-6 shrink-0" aria-hidden="true">
          {m.externa ? <path d="M9 5h10v10M19 5L8 16M5 9v10h10" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /> : <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />}
        </svg>
      </span>
      <span className="text-[16px] leading-[22px] text-white/90">{m.frase}</span>
      <span className="text-ayuda font-extrabold text-white/85">{m.etiqueta}</span>
    </motion.a>
  );
}

function Inicio({ conSesion }: { conSesion: boolean }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col md:max-w-4xl" style={{ paddingTop: "calc(env(safe-area-inset-top) + 20px)" }}>
      <div className="flex items-center justify-between gap-3 px-5 md:px-8">
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
      <div className="px-5 pt-6 md:px-8">
        <h1 className="text-titulo font-black">¿A dónde quieres entrar?</h1>
        <p className="mt-1 text-text-soft">Todas usan tu misma cuenta. Elige una.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {MINI_APPS.map((m, i) => (
            <Tarjeta key={m.id} m={m} indice={i} />
          ))}
        </div>
        <p className="mt-6 rounded-[16px] bg-surface p-3 text-ayuda">Vendoe es una app aparte, con su propia página. Tu cuenta de Auxi no se comparte con ella.</p>
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
      <div>
        <Leon pose="saluda" alto={140} />
        <p className="mt-3 font-extrabold">Te llevo a Vendoe…</p>
        <a className="mt-2 inline-flex min-h-11 items-center font-extrabold text-brand underline" href={VENDOE_URL}>
          Si no se abre, toca aquí
        </a>
      </div>
    </main>
  );
}

function Fondo({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh bg-bg">{children}</div>;
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
  if (cuenta.modo === "cargando") return <Fondo>{null}</Fondo>;
  if (ruta === "/entrar") return conSesion || libre ? <Fondo>{null}</Fondo> : <Entrada titulo={`${NOMBRE_PLATAFORMA}`} />;
  return conSesion || libre ? <Inicio conSesion={conSesion} /> : <Portada />;
}
