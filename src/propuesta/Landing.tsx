/**
 * LANDING v4 del boceto (solo desarrollo, /propuesta). Auxi Studio como un ecosistema en órbita:
 * escenarios de «espacio» (héroe, ecosistema, cierre) y secciones de cada app con su color, una historia
 * con celular fijo que cambia al hacer scroll y un bento de funciones con micro-animaciones.
 * Movimiento con propósito: se dibuja o aparece una vez, responde a la persona y respeta «reducir movimiento».
 */
import { AnimatePresence, motion, useInView, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { INSTAGRAM_URL } from "../components/ApoyaAlCreador";
import { Banner, type Tono } from "../components/Banner";
import { IconoApp, type AppConIcono } from "../components/IconoApp";
import { CaraDeLeon, Leon, type CaraLeon } from "../components/Leon";
import { Llama, Moneda } from "../components/Navegacion";
import { lanzarConfeti } from "../lib/confeti";
import { sonidos } from "../lib/sonidos";
import { CaraLeonVida } from "../vida/ui";
import { BotonTema, Barra, Check, Contador, Marca, NUNITO } from "./comun";

const WHATSAPP = "https://wa.me/51960650372";
const N = { fontFamily: NUNITO };
const SUAVE = [0.22, 1, 0.36, 1] as const;

/* =====================================================================================
   Piezas del celular y sus «satélites»
   ===================================================================================== */

/** Marco de celular. La pantalla siempre es clara, como la app. */
function Telefono({ children, fondo, grande = false }: { children: ReactNode; fondo: string; grande?: boolean }) {
  return (
    <div className={`telefono relative z-[1] mx-auto rounded-[38px] bg-[#05081C] p-[7px] shadow-[0_30px_60px_rgba(0,0,0,.45),inset_0_0_0_1px_rgba(255,255,255,.08)] ${grande ? "w-[248px]" : "w-[214px]"}`}>
      <div className={`flex flex-col overflow-hidden rounded-[31px] text-[12px] leading-[16px] text-[#141A4D] ${grande ? "h-[480px]" : "h-[420px]"}`} style={{ background: fondo }}>
        <div className="mx-auto mt-2 h-[5px] w-16 shrink-0 rounded-full bg-black/15" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}

/** Círculo que marca dónde «toca» el dedo. */
function Toque({ retraso, className }: { retraso: number; className: string }) {
  const quieto = !!useReducedMotion();
  if (quieto) return null;
  return (
    <motion.span
      aria-hidden="true"
      className={`pointer-events-none absolute z-10 size-9 rounded-full bg-[#141A4D]/25 ring-2 ring-white ${className}`}
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: [0, 1, 1, 0], scale: [0.4, 1, 1.2, 1.5] }}
      transition={{ delay: retraso, duration: 0.7, times: [0, 0.3, 0.6, 1] }}
    />
  );
}

/** Texto que se escribe solo, letra por letra. */
function Tecleo({ texto, retraso = 0, velocidad = 30 }: { texto: string; retraso?: number; velocidad?: number }) {
  const quieto = !!useReducedMotion();
  const [n, setN] = useState(quieto ? texto.length : 0);
  useEffect(() => {
    if (quieto) return setN(texto.length);
    let intervalo = 0;
    const inicio = window.setTimeout(() => {
      let i = 0;
      intervalo = window.setInterval(() => {
        i += 1;
        setN(i);
        if (i >= texto.length) window.clearInterval(intervalo);
      }, velocidad);
    }, retraso * 1000);
    return () => {
      window.clearTimeout(inicio);
      window.clearInterval(intervalo);
    };
  }, [texto, quieto, retraso, velocidad]);
  return (
    <>
      {texto.slice(0, n)}
      {n < texto.length && <span className="ml-px inline-block h-3 w-px translate-y-0.5 bg-current" />}
    </>
  );
}

/** Aparece desde abajo después de un momento. */
function Entra({ retraso, children, className = "" }: { retraso: number; children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: retraso, type: "spring", stiffness: 420, damping: 26 }}>
      {children}
    </motion.div>
  );
}

function BotonFalso({ texto, color, sombra, toque, tinta = "#FFFFFF" }: { texto: string; color: string; sombra: string; toque?: number; tinta?: string }) {
  return (
    <div className="relative">
      <motion.span
        className="block rounded-[12px] py-2.5 text-center font-black"
        style={{ ...N, background: color, color: tinta, boxShadow: `0 3px 0 ${sombra}` }}
        animate={toque !== undefined ? { y: [0, 0, 2, 0] } : {}}
        transition={toque !== undefined ? { delay: toque, duration: 0.5, times: [0, 0.3, 0.5, 1] } : {}}
      >
        {texto}
      </motion.span>
      {toque !== undefined && <Toque retraso={toque} className="top-0 left-1/2 -translate-x-1/2" />}
    </div>
  );
}

/** Tarjeta que «sale» del celular: aparece con resorte y se queda. */
function Satelite({ retraso, className, children, desde = { x: 0, y: 16 } }: { retraso: number; className: string; children: ReactNode; desde?: { x: number; y: number } }) {
  const quieto = !!useReducedMotion();
  return (
    <motion.div
      className={`absolute z-[2] ${className}`}
      initial={quieto ? { opacity: 0 } : { opacity: 0, scale: 0.6, ...desde }}
      animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      transition={quieto ? { duration: 0.2 } : { delay: retraso, type: "spring", stiffness: 380, damping: 20 }}
    >
      <div className="flex items-center gap-2 rounded-[16px] bg-white/95 px-3 py-2.5 text-[14px] leading-[18px] font-bold text-[#141A4D] shadow-[0_14px_30px_rgba(0,0,0,.28)] ring-1 ring-black/5 backdrop-blur">{children}</div>
    </motion.div>
  );
}

/** Monedas que estallan desde el centro del celular. */
function Estallido({ retraso }: { retraso: number }) {
  const quieto = !!useReducedMotion();
  if (quieto) return null;
  const destinos = [
    [-170, -130],
    [160, -150],
    [-200, 20],
    [205, 0],
    [-130, 160],
    [140, 170],
  ];
  return (
    <div className="pointer-events-none absolute top-1/2 left-1/2 z-[2]" aria-hidden="true">
      {destinos.map(([x, y], k) => (
        <motion.span key={k} className="absolute -translate-x-1/2 -translate-y-1/2" initial={{ x: 0, y: 0, scale: 0.3, opacity: 0 }} animate={{ x, y, scale: [0.3, 1.2, 1], opacity: [0, 1, 1, 0] }} transition={{ delay: retraso + k * 0.05, duration: 1.5, times: [0, 0.3, 0.8, 1], ease: "easeOut" }}>
          <Moneda className="size-9" />
        </motion.span>
      ))}
    </div>
  );
}

function IcoTrazo({ d, className = "size-4" }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
const D = {
  chat: "M8 9h8M8 13h5M5 4h14a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-7l-4 3v-3H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z",
  foco: "M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z",
  dado: "M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM8.5 8.5h.01M15.5 15.5h.01M12 12h.01",
  nube: "M7 18a4 4 0 0 1-.6-8A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9H7zM10 14l1.5 1.5L15 12",
  escudo: "M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z",
  candado: "M7 11V8a5 5 0 0 1 10 0v3M6 11h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z",
  campana: "M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4",
  ojo: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  ojoNo: "M3 3l18 18M10.6 5.1A10.6 10.6 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.2 3.9M6.6 6.6C3.8 8.4 2 12 2 12s4 7 10 7a9.7 9.7 0 0 0 4.4-1",
  flecha: "M5 12h14M13 6l6 6-6 6",
  whatsapp: "M4 20l1.3-4A8 8 0 1 1 8 18.7zM9 9.5c.3 2 1.8 3.8 4 4.6l1.2-1.2 2 1-.4 1.6c-3.6.3-7.1-3.2-6.8-6.8l1.6-.4 1 2z",
};

/* =====================================================================================
   Escenas de cada app (lo que pasa dentro del celular + lo que sale de él)
   ===================================================================================== */

type Escena = { titulo: string; detalle: string; puntos: string[]; pantalla: ReactNode; satelites: ReactNode };

const ESCENAS_STUDENT: Escena[] = [
  {
    titulo: "Pega tus apuntes",
    detalle: "Pasa tu PDF o tus apuntes por tu IA con el pedido de Auxi y pega la respuesta. En segundos tienes una lección.",
    puntos: ["Funciona con ChatGPT, Claude o Gemini", "Revisas las preguntas antes de jugar"],
    pantalla: (
      <div className="flex flex-1 flex-col px-3 pt-3">
        <p className="text-[15px] font-black" style={N}>
          Crear tema
        </p>
        <p className="text-[11px] text-[#5B6084]">Pega lo que te respondió tu IA</p>
        <div className="mt-2 h-[170px] rounded-[12px] border-2 border-[#DDE0EE] bg-[#FFFFFF] p-2 text-[11px] leading-[15px]">
          <Tecleo texto="1. ¿Qué fracción es igual a 1/2? a) 2/4  b) 2/3  c) 3/5 — 2. ¿Cuál es mayor, 3/4 o 2/3? — 3. Simplifica 6/8 …" retraso={0.9} velocidad={18} />
        </div>
        <Entra retraso={3.0} className="mt-2 flex items-center gap-1.5 rounded-[10px] bg-[#ECEEFB] p-2 text-[11px] font-bold">
          <Check className="size-4" />8 preguntas listas
        </Entra>
        <div className="mt-auto pb-4">
          <BotonFalso texto="Crear lección" color="#2430D9" sombra="#1A23A6" toque={3.3} />
        </div>
      </div>
    ),
    satelites: (
      <>
        <motion.div
          className="absolute top-[14%] left-[2%] z-[2] w-[150px] rounded-[16px] bg-[#FFFFFF] p-3 text-[#141A4D] shadow-[0_14px_30px_rgba(0,0,0,.3)]"
          initial={{ opacity: 0, x: -60, rotate: -8 }}
          animate={{ opacity: [0, 1, 1, 0], x: [-60, 0, 0, 110], rotate: [-8, -4, -4, 0], scale: [1, 1, 1, 0.35] }}
          transition={{ duration: 1.9, times: [0, 0.25, 0.62, 1], ease: "easeInOut" }}
        >
          <span className="flex items-center gap-1.5 text-[12px] font-black" style={N}>
            <span className="grid size-6 place-items-center rounded-[6px] bg-[#C2412D] text-[8px] text-white">PDF</span>
            Mis apuntes
          </span>
          <span className="mt-2 block h-1.5 w-full rounded-full bg-[#E6E8FA]" />
          <span className="mt-1.5 block h-1.5 w-4/5 rounded-full bg-[#E6E8FA]" />
          <span className="mt-1.5 block h-1.5 w-3/5 rounded-full bg-[#E6E8FA]" />
        </motion.div>
        <Satelite retraso={0.5} className="top-[5%] right-[2%]" desde={{ x: 30, y: 0 }}>
          <span className="grid size-7 place-items-center rounded-full bg-[#ECEEFB] text-[#2430D9]">
            <IcoTrazo d={D.chat} />
          </span>
          Con tu propia IA
        </Satelite>
        <Satelite retraso={3.1} className="right-[2%] bottom-[16%]" desde={{ x: 40, y: 0 }}>
          <span className="grid size-7 place-items-center rounded-full bg-[#5FE3DC]">
            <Check color="#141A4D" className="size-4" />
          </span>
          8 preguntas creadas
        </Satelite>
      </>
    ),
  },
  {
    titulo: "Responde jugando",
    detalle: "Cada acierto suma monedas y llena tu barra. Si fallas, León te da una pista antes que la respuesta.",
    puntos: ["Vidas, combos y sonidos", "Pista primero, respuesta solo si la pides"],
    pantalla: (
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-2 px-3 pt-3">
          <span className="block h-2 flex-1 overflow-hidden rounded-full bg-[#E6E8FA]">
            <motion.span className="block h-full rounded-full bg-[#5FE3DC]" initial={{ width: "40%" }} animate={{ width: "60%" }} transition={{ delay: 1.6, type: "spring", stiffness: 140, damping: 18 }} />
          </span>
          <span className="flex items-center gap-1 font-black" style={N}>
            <Moneda className="size-4" />
            <Contador valor={130} desde={120} retraso={1.7} />
          </span>
        </div>
        <p className="mt-4 px-3 text-[11px] font-semibold text-[#5B6084]">Matemática · Fracciones</p>
        <p className="px-3 text-[16px] leading-[20px] font-black" style={N}>
          ¿Qué fracción es igual a 1/2?
        </p>
        <div className="mt-3 flex flex-col gap-2 px-3">
          {["2/4", "2/3", "3/5"].map((o, k) => (
            <div key={o} className="relative">
              <motion.span
                className="num block rounded-[12px] border-2 border-b-[4px] px-3 py-2 text-[15px] font-black"
                style={N}
                initial={{ backgroundColor: "#FFFFFF", borderColor: "#DDE0EE" }}
                animate={k === 0 ? { backgroundColor: "#5FE3DC", borderColor: "#2FB7B0", scale: [1, 1.05, 1] } : {}}
                transition={{ delay: 1.3, duration: 0.35 }}
              >
                {o}
              </motion.span>
              {k === 0 && <Toque retraso={1.0} className="top-0.5 left-4" />}
            </div>
          ))}
        </div>
        <motion.div className="mt-auto bg-[#DDF8F6] px-3 pt-3 pb-4" initial={{ y: 100 }} animate={{ y: 0 }} transition={{ delay: 1.6, type: "spring", stiffness: 380, damping: 30 }}>
          <span className="flex items-center gap-2">
            <CaraDeLeon cara="feliz" tamano={30} />
            <span className="font-bold">¡Eso! Vas en racha.</span>
          </span>
          <span className="mt-2 block">
            <BotonFalso texto="Continuar" color="#2430D9" sombra="#1A23A6" />
          </span>
        </motion.div>
      </div>
    ),
    satelites: (
      <>
        <Satelite retraso={0.4} className="top-[8%] left-[2%]" desde={{ x: -30, y: 0 }}>
          <span className="grid size-7 place-items-center rounded-full bg-[#FFF6E2] text-[#C98A1C]">
            <IcoTrazo d={D.foco} />
          </span>
          Pista antes que respuesta
        </Satelite>
        <motion.div className="absolute top-[30%] right-[6%] z-[2] flex items-center gap-1.5 rounded-full bg-[#F2B341] px-3.5 py-2 text-[20px] font-black text-[#141A4D] shadow-[0_6px_0_#C98A1C,0_16px_30px_rgba(0,0,0,.3)]" style={N} initial={{ opacity: 0, y: 50, scale: 0.4 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 1.6, type: "spring", stiffness: 420, damping: 14 }}>
          <Moneda className="size-6" />
          +10
        </motion.div>
        <Satelite retraso={2.0} className="right-[2%] bottom-[10%]" desde={{ x: 30, y: 10 }}>
          <span className="grid size-7 place-items-center rounded-full bg-[#FFF1E6]">
            <Llama activa className="size-5" />
          </span>
          Combo x3
        </Satelite>
      </>
    ),
  },
  {
    titulo: "Gana y vuelve mañana",
    detalle: "Terminas con monedas, sumas un día de racha y Auxi te guarda un repaso de lo que fallaste, justo cuando te toca.",
    puntos: ["Cofre diario con probabilidades a la vista", "Protector de racha: un mal día no lo borra todo"],
    pantalla: (
      <div className="flex flex-1 flex-col items-center px-3 pt-4 text-center">
        <Leon pose="celebra" alto={120} rebote />
        <p className="mt-1 text-[17px] font-black" style={N}>
          ¡Lección completa!
        </p>
        <div className="mt-3 grid w-full grid-cols-2 gap-2">
          <Entra retraso={0.4} className="rounded-[12px] bg-[#FFF6E2] p-2">
            <span className="flex items-center justify-center gap-1 text-[20px] font-black" style={N}>
              <Moneda className="size-5" />+<Contador valor={10} retraso={0.5} />
            </span>
            <span className="text-[10px] text-[#6B4A0A]">monedas</span>
          </Entra>
          <Entra retraso={0.7} className="rounded-[12px] bg-[#FFF1E6] p-2">
            <span className="flex items-center justify-center gap-1 text-[20px] font-black" style={N}>
              <Llama activa className="size-5" />
              <Contador valor={5} desde={4} retraso={1} />
            </span>
            <span className="text-[10px] text-[#7A3A12]">días de racha</span>
          </Entra>
        </div>
        <Entra retraso={1.6} className="mt-2 w-full rounded-[12px] bg-[#FFFFFF] p-2 text-left text-[11px] ring-1 ring-[#DDE0EE]">
          <span className="font-bold">Mañana:</span> repasa las 2 preguntas que fallaste.
        </Entra>
        <div className="mt-auto w-full pb-4">
          <BotonFalso texto="Abrir el cofre" color="#F2B341" sombra="#C98A1C" tinta="#141A4D" toque={3.0} />
        </div>
      </div>
    ),
    satelites: (
      <>
        <Estallido retraso={0.3} />
        <Satelite retraso={1.0} className="top-[12%] right-[2%]" desde={{ x: 30, y: 0 }}>
          <Llama activa className="size-6" />
          Racha de 5 días
        </Satelite>
        <Satelite retraso={1.7} className="bottom-[14%] left-[2%]" desde={{ x: -30, y: 0 }}>
          <span className="grid size-7 place-items-center rounded-[8px] bg-[#ECEEFB] text-[12px] font-black text-[#2430D9]" style={N}>
            2
          </span>
          Repaso para mañana
        </Satelite>
      </>
    ),
  },
];

const ESCENAS_VIDA: Escena[] = [
  {
    titulo: "Anota en segundos",
    detalle: "Monto, categoría y listo. O importa de golpe tus reportes, capturas o texto, y revisas antes de guardar.",
    puntos: ["Detecta movimientos repetidos", "También por voz"],
    pantalla: (
      <div className="flex flex-1 flex-col px-3 pt-3">
        <p className="text-[15px] font-black" style={N}>
          Registrar gasto
        </p>
        <div className="mt-2 flex h-14 items-center gap-2 rounded-[14px] border-2 border-[#0E5B57] bg-[#FFFFFF] px-3">
          <span className="text-[20px] font-black text-[#4E6470]" style={N}>
            S/
          </span>
          <span className="num text-[24px] font-black" style={N}>
            <Tecleo texto="12" retraso={0.5} velocidad={260} />
          </span>
        </div>
        <p className="mt-3 text-[11px] font-bold text-[#4E6470]">Categoría</p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {["Comida", "Pasaje", "Casa", "Otros"].map((c, k) => (
            <div key={c} className="relative">
              <motion.span
                className="block rounded-full border-2 px-2.5 py-1 font-bold"
                initial={{ backgroundColor: "#FFFFFF", borderColor: "#DCF1EE", color: "#141A4D" }}
                animate={k === 0 ? { backgroundColor: "#0E5B57", borderColor: "#0E5B57", color: "#FFFFFF" } : {}}
                transition={{ delay: 1.5, duration: 0.2 }}
              >
                {c}
              </motion.span>
              {k === 0 && <Toque retraso={1.2} className="-top-1 left-2" />}
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] font-bold text-[#4E6470]">Nota</p>
        <div className="mt-1 rounded-[12px] border-2 border-[#DCF1EE] bg-[#FFFFFF] px-2 py-2">
          <Tecleo texto="Menú" retraso={1.9} velocidad={90} />
        </div>
        <div className="mt-auto pb-4">
          <BotonFalso texto="Guardar" color="#0E5B57" sombra="#07403D" toque={2.7} />
        </div>
      </div>
    ),
    satelites: (
      <>
        <Satelite retraso={0.4} className="top-[6%] left-[2%]" desde={{ x: -30, y: 0 }}>
          <span className="grid size-7 place-items-center rounded-full bg-[#DCF1EE] text-[#0E5B57]">
            <IcoTrazo d={D.candado} />
          </span>
          Sin conectar tu banco
        </Satelite>
        <Satelite retraso={3.0} className="right-[2%] bottom-[18%]" desde={{ x: 40, y: 0 }}>
          <span className="grid size-7 place-items-center rounded-full bg-[#5FE3DC]">
            <Check color="#141A4D" className="size-4" />
          </span>
          <span>
            Guardado
            <span className="block text-[12px] font-semibold text-[#4E6470]">Menú · S/ 12</span>
          </span>
        </Satelite>
      </>
    ),
  },
  {
    titulo: "Mira tu día",
    detalle: "Te dice cuánto puedes gastar hoy sin pasarte, con el cálculo a la vista. Lo que te sobra, se suma mañana o va a tu colchón.",
    puntos: ["Es un estimado, nunca tu saldo del banco", "Ocultas los montos con un toque"],
    pantalla: (
      <div className="flex flex-1 flex-col px-3 pt-3">
        <p className="text-[15px] font-black" style={N}>
          Hoy
        </p>
        <div className="mt-2 rounded-[16px] bg-[#0E5B57] p-3 text-white">
          <p className="text-white/85">Disponible estimado</p>
          <p className="text-[30px] leading-[34px] font-black" style={N}>
            <Contador valor={31} desde={43} prefijo="S/ " retraso={0.8} />
          </p>
          <p className="text-[10px] text-white/75">No es tu saldo del banco</p>
        </div>
        <div className="mt-2 flex flex-col rounded-[12px] bg-[#FFFFFF] px-2">
          <motion.span className="flex justify-between border-b border-[#DCF1EE] py-2" initial={{ opacity: 0, backgroundColor: "#FFF6E2" }} animate={{ opacity: 1, backgroundColor: "#FFFFFF" }} transition={{ delay: 0.5, duration: 0.4, backgroundColor: { delay: 1.8, duration: 0.6 } }}>
            <span>Menú</span>
            <span className="num font-bold">− S/ 12</span>
          </motion.span>
          {[
            ["Pasaje", "− S/ 3"],
            ["Turno", "+ S/ 75"],
          ].map(([a, b]) => (
            <span key={a} className="flex justify-between border-b border-[#DCF1EE] py-2 last:border-0">
              <span>{a}</span>
              <span className="num font-bold">{b}</span>
            </span>
          ))}
        </div>
        <Entra retraso={2.0} className="mt-2 flex items-center gap-2 rounded-[12px] bg-[#FFFFFF] p-2 ring-1 ring-[#DCF1EE]">
          <CaraLeonVida cara="feliz" tamano={26} />
          <span>Vas bien. Ayer te sobraron S/ 4.</span>
        </Entra>
      </div>
    ),
    satelites: (
      <>
        <motion.div className="absolute top-[16%] left-[2%] z-[2] rounded-[20px] bg-[#FFFFFF] px-4 py-3 text-[#141A4D] shadow-[0_14px_30px_rgba(0,0,0,.3)]" initial={{ opacity: 0, x: -40, scale: 0.7 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ delay: 0.5, type: "spring", stiffness: 320, damping: 20 }}>
          <span className="block text-[13px] font-bold text-[#4E6470]">Para hoy te quedan</span>
          <span className="block text-[40px] leading-[44px] font-black text-[#0E5B57]" style={N}>
            <Contador valor={31} desde={43} prefijo="S/ " retraso={0.8} />
          </span>
        </motion.div>
        <Satelite retraso={1.6} className="right-[2%] bottom-[24%]" desde={{ x: 30, y: 0 }}>
          <span className="grid size-7 place-items-center rounded-full bg-[#FFF6E2]">
            <Moneda className="size-5" />
          </span>
          + S/ 4 que sobró ayer
        </Satelite>
      </>
    ),
  },
  {
    titulo: "Revisa antes de pagar",
    detalle: "Pega un mensaje o los datos de un vendedor y León te dice si tiene señales de estafa, antes de que muevas un sol.",
    puntos: ["Te explica cada señal", "Qué hacer si ya pagaste"],
    pantalla: (
      <div className="flex flex-1 flex-col px-3 pt-3">
        <p className="text-[15px] font-black" style={N}>
          Protégete
        </p>
        <Entra retraso={0.2} className="mt-2 rounded-[14px] rounded-tl-[4px] bg-[#FFFFFF] p-2.5 ring-1 ring-[#DCF1EE]">
          <span className="text-[10px] font-bold text-[#4E6470]">Mensaje que te llegó</span>
          <span className="mt-0.5 block">Hola, te deposité S/ 200 por error. Devuélvelo hoy a este otro número, porfa.</span>
        </Entra>
        <Entra retraso={1.0} className="mt-3 flex items-center gap-2">
          <CaraLeonVida cara="serio" tamano={30} />
          <span className="font-bold">Esto parece estafa.</span>
        </Entra>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#F4E1DD]">
          <motion.span className="block h-full rounded-full bg-[#C2412D]" initial={{ width: "0%" }} animate={{ width: "85%" }} transition={{ delay: 1.3, type: "spring", stiffness: 90, damping: 18 }} />
        </div>
        <ul className="mt-2 flex flex-col gap-1.5">
          {["Te apura para que actúes hoy", "Pide devolver a otro número", "Revisa tu cuenta antes de mover nada"].map((x, k) => (
            <Entra key={x} retraso={1.8 + k * 0.35} className="flex items-start gap-1.5">
              <span className="mt-1 size-2 shrink-0 rounded-full bg-[#C2412D]" />
              <span>{x}</span>
            </Entra>
          ))}
        </ul>
      </div>
    ),
    satelites: (
      <>
        <Satelite retraso={0.4} className="top-[6%] left-[2%]" desde={{ x: -30, y: 0 }}>
          <span className="grid size-7 place-items-center rounded-full bg-[#DCF1EE] text-[#0E5B57]">
            <IcoTrazo d={D.escudo} />
          </span>
          Antes de pagar, revisa
        </Satelite>
        <motion.div className="absolute top-[34%] right-[2%] z-[2] w-[180px] rounded-[18px] bg-[#FFFFFF] p-3 text-[#141A4D] shadow-[0_14px_30px_rgba(0,0,0,.3)]" initial={{ opacity: 0, x: 40, scale: 0.7 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ delay: 1.3, type: "spring", stiffness: 320, damping: 18 }}>
          <span className="flex items-center gap-2 text-[15px] font-black text-[#C2412D]" style={N}>
            <CaraLeonVida cara="serio" tamano={28} />
            Riesgo alto
          </span>
          <span className="mt-2 block h-2 overflow-hidden rounded-full bg-[#F4E1DD]">
            <motion.span className="block h-full rounded-full bg-[#C2412D]" initial={{ width: "0%" }} animate={{ width: "85%" }} transition={{ delay: 1.5, type: "spring", stiffness: 90, damping: 18 }} />
          </span>
          <span className="mt-1.5 block text-[12px] font-semibold text-[#4E6470]">3 señales de alerta</span>
        </motion.div>
      </>
    ),
  },
];

/* =====================================================================================
   Escenario (celular + satélites), historia con scroll y carrusel para celular
   ===================================================================================== */

const BRILLO = [
  { x: "-15%", y: "-25%" },
  { x: "45%", y: "5%" },
  { x: "10%", y: "40%" },
];

type Estilo = { fondo: string; brillo: string; pantallaFondo: string; color: string };

function Escenario({ escena, i, estilo, grande }: { escena: Escena; i: number; estilo: Estilo; grande: boolean }) {
  const quieto = !!useReducedMotion();
  return (
    <div className={`relative isolate overflow-hidden rounded-[36px] ${grande ? "h-[580px]" : "h-[480px]"}`} style={{ background: estilo.fondo }} aria-hidden="true">
      <div className="absolute inset-0 -z-10 opacity-60" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.12) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
      <motion.div className="absolute -z-10 size-[480px] rounded-full opacity-45 blur-3xl" style={{ background: estilo.brillo }} animate={quieto ? BRILLO[0] : BRILLO[i % BRILLO.length]} transition={{ type: "spring", stiffness: 30, damping: 16 }} />
      <svg viewBox="0 0 600 600" className="absolute top-1/2 left-1/2 -z-10 size-[620px] -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
        <circle cx="300" cy="300" r="230" fill="none" stroke="rgba(255,255,255,.10)" strokeWidth="1" />
        <circle cx="300" cy="300" r="290" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="1" strokeDasharray="2 6" />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="relative grid place-items-center" style={{ width: grande ? 600 : 340, height: grande ? 540 : 450 }}>
          <Telefono fondo={estilo.pantallaFondo} grande={grande}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={i} className="relative flex flex-1 flex-col" initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -28 }} transition={{ duration: 0.22, ease: "easeOut" }}>
                {escena.pantalla}
              </motion.div>
            </AnimatePresence>
          </Telefono>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={`s${i}`} className="absolute inset-0" exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {escena.satelites}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/** Un paso de la historia: se activa cuando cruza el centro de la pantalla. */
function PasoHistoria({ k, escena, activo, alActivar, color }: { k: number; escena: Escena; activo: boolean; alActivar: () => void; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const dentro = useInView(ref, { margin: "-45% 0px -45% 0px" });
  useEffect(() => {
    if (dentro) alActivar();
  }, [dentro, alActivar]);
  return (
    <div ref={ref} className="relative flex min-h-[560px] items-center pl-16">
      <motion.span
        className="absolute top-1/2 left-0 grid size-10 -translate-y-1/2 place-items-center rounded-full text-[16px] font-black"
        style={N}
        animate={activo ? { backgroundColor: color, color: "#FFFFFF", scale: 1.1 } : { backgroundColor: "var(--blanco)", color: "var(--gris)", scale: 1 }}
        transition={{ duration: 0.25 }}
      >
        {k + 1}
      </motion.span>
      <motion.div animate={{ opacity: activo ? 1 : 0.32, x: activo ? 0 : -6 }} transition={{ duration: 0.35, ease: SUAVE }}>
        <h3 className="text-[40px] leading-[44px] font-black">{escena.titulo}</h3>
        <p className="cuerpo-l mt-4 max-w-[38ch]">{escena.detalle}</p>
        <ul className="mt-6 flex flex-col gap-2.5">
          {escena.puntos.map((p) => (
            <li key={p} className="flex items-center gap-2.5 font-semibold">
              <span className="grid size-6 place-items-center rounded-full" style={{ background: `${color}22` }}>
                <Check color={color} className="size-4" />
              </span>
              {p}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}

/** Computadora: el celular queda fijo y cambia de pantalla mientras los pasos pasan al lado. */
function Historia({ escenas, estilo, colorTexto }: { escenas: Escena[]; estilo: Estilo; colorTexto: string }) {
  const [activo, setActivo] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start center", "end center"] });
  const activadores = useRef(escenas.map((_, k) => () => setActivo(k))).current;
  return (
    <div ref={ref} className="relative mt-10 grid grid-cols-12 gap-10">
      <div className="relative col-span-5">
        <div className="absolute top-[280px] bottom-[280px] left-[19px] w-[2px] overflow-hidden rounded-full bg-[color:var(--linea)]" aria-hidden="true">
          <motion.div className="h-full w-full origin-top" style={{ scaleY: scrollYProgress, background: colorTexto }} />
        </div>
        {escenas.map((e, k) => (
          <PasoHistoria key={e.titulo} k={k} escena={e} activo={activo === k} alActivar={activadores[k]} color={colorTexto} />
        ))}
      </div>
      <div className="col-span-7">
        <div className="sticky" style={{ top: "calc(var(--tope) + 100px)" }}>
          <Escenario escena={escenas[activo]} i={activo} estilo={estilo} grande />
        </div>
      </div>
    </div>
  );
}

/** Celular: el escenario avanza solo (barras tipo historias), con pausa y saltos. */
function Carrusel({ escenas, estilo, nombre }: { escenas: Escena[]; estilo: Estilo; nombre: string }) {
  const DUR = 4200;
  const quieto = !!useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { amount: 0.4 });
  const [i, setI] = useState(0);
  const [pausa, setPausa] = useState(false);
  const corre = visible && !pausa && !quieto;
  useEffect(() => {
    if (!corre) return;
    const t = window.setTimeout(() => setI((x) => (x + 1) % escenas.length), DUR);
    return () => window.clearTimeout(t);
  }, [corre, i, escenas.length]);
  return (
    <div ref={ref} className="mt-10">
      <Escenario escena={escenas[i]} i={i} estilo={estilo} grande={false} />
      <div className="mt-4 flex gap-2" role="tablist" aria-label={`Pasos de ${nombre}`}>
        {escenas.map((e, k) => (
          <button key={e.titulo} type="button" role="tab" aria-selected={k === i} aria-label={`Paso ${k + 1}: ${e.titulo}`} onClick={() => setI(k)} className="flex min-h-11 flex-1 items-center">
            <span className="block h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--linea)]">
              {k < i && <span className="block h-full w-full rounded-full" style={{ background: estilo.color }} />}
              {k === i && (corre ? <motion.span key={`a${i}`} className="block h-full rounded-full" style={{ background: estilo.color }} initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: DUR / 1000, ease: "linear" }} /> : <span className="block h-full w-full rounded-full" style={{ background: estilo.color }} />)}
            </span>
          </button>
        ))}
      </div>
      <div className="min-h-[150px]" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28 }}>
            <p className="chico font-bold">
              Paso {i + 1} de {escenas.length}
            </p>
            <h3 className="mt-1 text-[28px] leading-[32px] font-black">{escenas[i].titulo}</h3>
            <p className="mt-2 text-[16px] leading-[24px] text-[color:var(--gris)]">{escenas[i].detalle}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      {!quieto && (
        <button type="button" onClick={() => setPausa(!pausa)} aria-pressed={pausa} className="mt-2 flex min-h-11 items-center gap-2 font-semibold" style={{ color: estilo.color }}>
          <svg viewBox="0 0 20 20" className="size-4" aria-hidden="true">
            {pausa ? <path d="M6 4l10 6-10 6z" fill="currentColor" /> : <path d="M6 4h3v12H6zM11 4h3v12h-3z" fill="currentColor" />}
          </svg>
          {pausa ? "Seguir el recorrido" : "Pausar el recorrido"}
        </button>
      )}
    </div>
  );
}

/* =====================================================================================
   Bento: cada tarjeta demuestra su función con una micro-animación (una vez, al verse)
   ===================================================================================== */

function Celda({ titulo, texto, children, className = "", tinte, retraso = 0 }: { titulo: string; texto: string; children: ReactNode; className?: string; tinte: string; retraso?: number }) {
  const ref = useRef<HTMLElement>(null);
  const [luz, setLuz] = useState<{ x: number; y: number } | null>(null);
  const mover = (e: MouseEvent<HTMLElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (r) setLuz({ x: e.clientX - r.left, y: e.clientY - r.top });
  };
  return (
    <motion.article
      ref={ref}
      onMouseMove={mover}
      onMouseLeave={() => setLuz(null)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: retraso, ease: SUAVE }}
      className={`group relative flex flex-col overflow-hidden rounded-[28px] border border-[color:var(--linea)] bg-[color:var(--blanco)] transition-shadow hover:shadow-[0_20px_50px_rgba(20,26,77,.12)] ${className}`}
    >
      {luz && <div className="pointer-events-none absolute inset-0 z-[1]" style={{ background: `radial-gradient(340px circle at ${luz.x}px ${luz.y}px, rgba(95,227,220,.14), transparent 70%)` }} aria-hidden="true" />}
      <div className="relative grid min-h-[200px] flex-1 place-items-center overflow-hidden p-6" style={{ background: tinte }}>
        {children}
      </div>
      <div className="relative p-6">
        <h4 className="text-[19px] leading-[24px] font-black" style={N}>
          {titulo}
        </h4>
        <p className="mt-1.5 text-[15px] leading-[22px] text-[color:var(--gris)]">{texto}</p>
      </div>
    </motion.article>
  );
}

function useVisto<T extends Element>() {
  const ref = useRef<T>(null);
  const visto = useInView(ref, { once: true, amount: 0.5 });
  return [ref, visto] as const;
}

function DemoRepaso() {
  const [ref, visto] = useVisto<HTMLDivElement>();
  const pasos = [
    ["Hoy", "Fallaste 2"],
    ["Mañana", "Repasas"],
    ["En 3 días", "Otra vez"],
    ["En 7 días", "Ya lo sabes"],
  ];
  return (
    <div ref={ref} className="relative w-full max-w-[320px]">
      <span className="absolute top-[16px] right-8 left-8 h-[3px] rounded-full bg-[color:var(--linea)]" />
      <motion.span className="absolute top-[16px] right-8 left-8 h-[3px] origin-left rounded-full bg-[#5FE3DC]" initial={{ scaleX: 0 }} animate={visto ? { scaleX: 1 } : {}} transition={{ duration: 2, ease: "easeInOut", delay: 0.4 }} />
      <div className="relative flex justify-between">
        {pasos.map(([d, e], k) => (
          <div key={d} className="flex w-[72px] flex-col items-center text-center">
            <motion.span className="grid size-9 place-items-center rounded-full text-[13px] font-black text-white" style={{ background: k === 0 ? "#C2412D" : "#2FB7B0" }} initial={{ scale: 0 }} animate={visto ? { scale: [0, 1.25, 1] } : {}} transition={{ delay: 0.3 + k * 0.6, duration: 0.45 }}>
              {k === 0 ? "2" : <Check color="#FFFFFF" className="size-4" />}
            </motion.span>
            <span className="mt-2 text-[13px] font-bold">{d}</span>
            <span className="text-[12px] text-[color:var(--gris)]">{e}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DemoEntregas() {
  const [ref, visto] = useVisto<HTMLDivElement>();
  const items = [
    ["Ensayo de Historia", "En 7 días", "var(--lila)", "var(--cobalto)"],
    ["Examen de Matemática", "En 3 días", "var(--oro-suave)", "var(--oro-texto)"],
    ["Exposición de Biología", "Mañana", "rgba(194,65,45,.14)", "#C2412D"],
  ];
  return (
    <div ref={ref} className="flex w-full max-w-[300px] flex-col gap-2">
      {items.map(([t, c, fondo, tinta], k) => (
        <motion.div key={t} className="flex items-center gap-3 rounded-[14px] bg-[color:var(--blanco)] p-2.5 shadow-[0_4px_14px_rgba(20,26,77,.08)] ring-1 ring-[color:var(--linea)]" initial={{ opacity: 0, x: 40 }} animate={visto ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.2 + k * 0.35, type: "spring", stiffness: 300, damping: 24 }}>
          <motion.span className="grid size-8 place-items-center rounded-[10px]" style={{ background: fondo, color: tinta }} animate={visto && k === 2 ? { rotate: [0, -14, 12, -8, 0] } : {}} transition={{ delay: 1.3, duration: 0.6 }}>
            <IcoTrazo d={D.campana} />
          </motion.span>
          <span className="flex-1 text-[13px] font-bold">{t}</span>
          <span className="rounded-full px-2 py-0.5 text-[11px] font-black" style={{ background: fondo, color: tinta }}>
            {c}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function DemoMetodos() {
  const [ref, visto] = useVisto<HTMLDivElement>();
  return (
    <div ref={ref} className="flex items-center gap-5">
      <div className="relative size-28">
        <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden="true">
          <circle cx="60" cy="60" r="50" fill="none" stroke="var(--linea)" strokeWidth="10" />
          <motion.circle cx="60" cy="60" r="50" fill="none" stroke="#C2412D" strokeWidth="10" strokeLinecap="round" initial={{ pathLength: 0 }} animate={visto ? { pathLength: 0.72 } : {}} transition={{ duration: 1.8, ease: "easeInOut", delay: 0.2 }} />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-center">
          <span>
            <span className="block text-[24px] leading-none font-black" style={N}>
              {visto ? <Contador valor={25} retraso={0.2} duracion={1.6} /> : 0}
            </span>
            <span className="text-[11px] font-bold text-[color:var(--gris)]">min de foco</span>
          </span>
        </span>
      </div>
      <ul className="flex flex-col gap-2 text-[13px] font-bold">
        {["El tomate", "Las 5 cajas", "Explícaselo a León"].map((m, k) => (
          <motion.li key={m} className="flex items-center gap-2 rounded-full bg-[color:var(--blanco)] py-1 pr-3 pl-1 ring-1 ring-[color:var(--linea)]" initial={{ opacity: 0, y: 8 }} animate={visto ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.5 + k * 0.25 }}>
            {k === 2 ? <CaraDeLeon cara="lentes" tamano={24} /> : <span className="size-6 rounded-full" style={{ background: k === 0 ? "#C2412D" : "#F2B341" }} />}
            {m}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function DemoCofre() {
  const [ref, visto] = useVisto<HTMLDivElement>();
  const filas: [string, number][] = [
    ["10 monedas", 50],
    ["20 monedas", 30],
    ["Protector de racha", 15],
    ["50 monedas", 5],
  ];
  return (
    <div ref={ref} className="flex w-full max-w-[300px] flex-col gap-2.5">
      {filas.map(([n, p], k) => (
        <div key={n}>
          <div className="flex justify-between text-[13px] font-bold">
            <span>{n}</span>
            <span className="num">{visto ? <Contador valor={p} sufijo=" %" retraso={0.2 + k * 0.15} /> : "0 %"}</span>
          </div>
          <span className="mt-1 block h-2 overflow-hidden rounded-full bg-[color:var(--linea)]">
            <motion.span className="block h-full rounded-full bg-[#F2B341]" initial={{ width: 0 }} animate={visto ? { width: `${p}%` } : {}} transition={{ delay: 0.2 + k * 0.15, type: "spring", stiffness: 90, damping: 18 }} />
          </span>
        </div>
      ))}
    </div>
  );
}

function DemoImportar() {
  const [ref, visto] = useVisto<HTMLDivElement>();
  const campos = [
    ["Monto", "S/ 25.00"],
    ["Fecha", "22 de noviembre"],
    ["Para", "Bodega Rosita"],
    ["N.º de operación", "12345678"],
  ];
  return (
    <div ref={ref} className="flex w-full flex-col items-center gap-5 @2xl:flex-row @2xl:justify-center">
      <div className="relative h-[170px] w-[140px] overflow-hidden rounded-[16px] bg-[#FFFFFF] p-3 text-[#141A4D] shadow-[0_10px_30px_rgba(20,26,77,.15)]">
        <span className="text-[10px] font-bold text-[#4E6470]">Comprobante</span>
        <span className="mt-1 block text-[22px] font-black" style={N}>
          S/ 25
        </span>
        {[90, 70, 80, 55, 75].map((w, k) => (
          <span key={k} className="mt-2 block h-1.5 rounded-full bg-[#E6E8FA]" style={{ width: `${w}%` }} />
        ))}
        <motion.span className="absolute inset-x-0 h-8 bg-gradient-to-b from-transparent via-[#5FE3DC]/60 to-transparent" initial={{ top: "-20%" }} animate={visto ? { top: ["-20%", "100%"] } : {}} transition={{ duration: 1.4, ease: "easeInOut", delay: 0.3 }} />
      </div>
      <motion.span className="text-[color:var(--gris)]" initial={{ opacity: 0 }} animate={visto ? { opacity: 1 } : {}} transition={{ delay: 1.2 }}>
        <IcoTrazo d={D.flecha} className="size-6 rotate-90 @2xl:rotate-0" />
      </motion.span>
      <div className="flex w-[230px] flex-col gap-1.5">
        {campos.map(([a, b], k) => (
          <motion.div key={a} className="flex justify-between rounded-[10px] bg-[color:var(--blanco)] px-3 py-1.5 text-[13px] ring-1 ring-[color:var(--linea)]" initial={{ opacity: 0, x: 16 }} animate={visto ? { opacity: 1, x: 0 } : {}} transition={{ delay: 1.4 + k * 0.2 }}>
            <span className="text-[color:var(--gris)]">{a}</span>
            <span className="font-bold">{b}</span>
          </motion.div>
        ))}
        <motion.span className="mt-1 flex items-center gap-1.5 text-[13px] font-bold text-[color:var(--teal-texto)]" initial={{ opacity: 0 }} animate={visto ? { opacity: 1 } : {}} transition={{ delay: 2.4 }}>
          <Check color="currentColor" className="size-4" />
          Sin duplicados. Listo para revisar.
        </motion.span>
      </div>
    </div>
  );
}

function DemoOcultar() {
  const [ref, visto] = useVisto<HTMLDivElement>();
  const [oculto, setOculto] = useState(false);
  useEffect(() => {
    if (!visto) return;
    const t = window.setTimeout(() => setOculto(true), 1400);
    return () => window.clearTimeout(t);
  }, [visto]);
  return (
    <div ref={ref} className="w-full max-w-[250px] rounded-[20px] bg-[#0E5B57] p-4 text-white shadow-[0_10px_30px_rgba(14,91,87,.3)]">
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-white/85">Disponible estimado</span>
        <button type="button" onClick={() => setOculto(!oculto)} aria-pressed={oculto} aria-label={oculto ? "Mostrar montos" : "Ocultar montos"} className="grid size-11 place-items-center rounded-full hover:bg-white/10">
          <IcoTrazo d={oculto ? D.ojoNo : D.ojo} className="size-5" />
        </button>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.p key={oculto ? "o" : "v"} className="num text-[36px] leading-[40px] font-black" style={N} initial={{ opacity: 0, filter: "blur(6px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0, filter: "blur(6px)" }} transition={{ duration: 0.25 }}>
          {oculto ? "S/ •••" : "S/ 31"}
        </motion.p>
      </AnimatePresence>
      <p className="text-[12px] text-white/75">Tócalo: así lo muestras en público.</p>
    </div>
  );
}

function DemoMeta() {
  const [ref, visto] = useVisto<HTMLDivElement>();
  return (
    <div ref={ref} className="flex items-center gap-5">
      <svg viewBox="0 0 100 120" className="h-32 w-28" aria-hidden="true">
        <defs>
          <clipPath id="frasco">
            <path d="M22 28h56v8c6 4 8 9 8 16v50a12 12 0 0 1-12 12H26a12 12 0 0 1-12-12V52c0-7 2-12 8-16z" />
          </clipPath>
        </defs>
        <rect x="26" y="8" width="48" height="16" rx="6" fill="#5FE3DC" />
        <g clipPath="url(#frasco)">
          <rect x="0" y="0" width="100" height="120" fill="var(--menta-2)" />
          <motion.rect x="0" width="100" height="120" fill="#F2B341" initial={{ y: 114 }} animate={visto ? { y: 114 - 86 * 0.2 } : {}} transition={{ delay: 0.3, type: "spring", stiffness: 60, damping: 14 }} />
        </g>
        <path d="M22 28h56v8c6 4 8 9 8 16v50a12 12 0 0 1-12 12H26a12 12 0 0 1-12-12V52c0-7 2-12 8-16z" fill="none" stroke="#2FB7B0" strokeWidth="3" />
      </svg>
      <div>
        <p className="text-[13px] font-bold text-[color:var(--gris)]">Colchón</p>
        <p className="text-[26px] leading-[30px] font-black" style={N}>
          {visto ? <Contador valor={60} prefijo="S/ " retraso={0.3} /> : "S/ 0"}
        </p>
        <p className="text-[13px] text-[color:var(--gris)]">de S/ 300 · 20 %</p>
      </div>
    </div>
  );
}

function DemoPagos() {
  const [ref, visto] = useVisto<HTMLDivElement>();
  const pagos = [
    ["Internet", "Vence mañana", "S/ 60", true],
    ["Celular", "En 5 días", "S/ 35", false],
  ] as const;
  return (
    <div ref={ref} className="flex w-full max-w-[280px] flex-col gap-2">
      {pagos.map(([n, c, m, urgente], k) => (
        <motion.div key={n} className="flex items-center gap-3 rounded-[14px] bg-[color:var(--blanco)] p-3 ring-1 ring-[color:var(--linea)]" initial={{ opacity: 0, y: 14 }} animate={visto ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 + k * 0.3, type: "spring", stiffness: 300, damping: 24 }}>
          <motion.span className="grid size-9 place-items-center rounded-full" style={{ background: urgente ? "var(--oro-suave)" : "var(--menta-2)", color: urgente ? "var(--oro-texto)" : "var(--teal-texto)" }} animate={visto && urgente ? { rotate: [0, -14, 12, -8, 0] } : {}} transition={{ delay: 1, duration: 0.6 }}>
            <IcoTrazo d={D.campana} />
          </motion.span>
          <span className="flex-1">
            <span className="block text-[14px] font-bold">{n}</span>
            <span className="block text-[12px] text-[color:var(--gris)]">{c}</span>
          </span>
          <span className="num font-black" style={N}>
            {m}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function DemoBanco() {
  const [ref, visto] = useVisto<HTMLDivElement>();
  return (
    <div ref={ref} className="relative grid size-32 place-items-center">
      <svg viewBox="0 0 120 120" className="absolute inset-0 size-full" aria-hidden="true">
        <motion.circle cx="60" cy="60" r="54" fill="none" stroke="#2FB7B0" strokeWidth="3" strokeDasharray="4 8" initial={{ pathLength: 0, opacity: 0 }} animate={visto ? { pathLength: 1, opacity: 1 } : {}} transition={{ duration: 1.4, ease: "easeInOut" }} />
      </svg>
      <motion.span className="grid size-20 place-items-center rounded-full bg-[#0E5B57] text-white shadow-[0_10px_30px_rgba(14,91,87,.35)]" initial={{ scale: 0.6, opacity: 0 }} animate={visto ? { scale: 1, opacity: 1 } : {}} transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 16 }}>
        <IcoTrazo d={D.escudo} className="size-9" />
      </motion.span>
    </div>
  );
}

/** Mini prueba de Auxi Student: se siente el juego antes de crear la cuenta. */
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
    <div className="w-full max-w-[460px] rounded-[22px] bg-[color:var(--blanco)] p-5 shadow-[0_10px_30px_rgba(20,26,77,.10)] ring-1 ring-[color:var(--linea)]">
      <div className="flex items-center gap-3">
        <span className="flex-1">
          <Barra pct={bien ? 100 : 60} color="var(--turquesa)" />
        </span>
        <span className="flex items-center gap-1.5 text-[16px] font-extrabold" style={N}>
          <Moneda className="size-6" />
          <Contador key={monedas} valor={monedas} />
        </span>
      </div>
      <p className="disp mt-4 text-[22px] leading-[28px] font-black">¿Qué fracción es igual a 1/2?</p>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {opciones.map((o, i) => {
          const esta = elegida === i;
          const estilo = esta ? (i === 0 ? "border-[#2FB7B0] bg-[#5FE3DC] text-[#141A4D]" : "border-[#C2412D] bg-[#FBEAE7] text-[#141A4D]") : "border-[color:var(--linea)] bg-[color:var(--blanco)] hover:border-[color:var(--cobalto)]";
          return (
            <motion.button
              key={o}
              type="button"
              onClick={() => responder(i)}
              animate={esta && !quieto ? (i === 0 ? { scale: [1, 1.06, 1] } : { x: [0, -6, 6, -6, 6, 0] }) : {}}
              transition={{ duration: 0.35 }}
              whileTap={{ scale: 0.96 }}
              className={`num min-h-14 rounded-[16px] border-2 border-b-[5px] text-[22px] font-black ${estilo}`}
              style={N}
              aria-pressed={esta}
            >
              {o}
            </motion.button>
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-3 rounded-[16px] bg-[color:var(--superficie-2)] p-3" aria-live="polite">
        <CaraDeLeon cara={cara} tamano={40} />
        <p className="text-[15px] leading-[21px] font-semibold">{mensaje}</p>
      </div>
      {elegida !== null && (
        <button type="button" onClick={() => (setElegida(null), setMonedas(0))} className="mt-2 inline-flex min-h-11 items-center font-semibold text-[color:var(--cobalto)] underline">
          Probar otra vez
        </button>
      )}
    </div>
  );
}

/* =====================================================================================
   Secciones
   ===================================================================================== */

function Encabezado({ celular }: { celular: boolean }) {
  const { scrollY } = useScroll();
  const [solido, setSolido] = useState(false);
  const [menu, setMenu] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => setSolido(v > 80));
  const lleno = solido || menu;
  const secciones: [string, string][] = [
    ["#ecosistema", "Ecosistema"],
    ["#student", "Auxi Student"],
    ["#vida", "Auxi Vida"],
    ["#precios", "Precios"],
    ["#preguntas", "Preguntas"],
  ];
  return (
    <header className="sticky z-40" style={{ top: "var(--tope)" }}>
      <div className={`border-b transition-colors duration-300 ${lleno ? "border-[color:var(--linea)] bg-[color:var(--bg)]/85 backdrop-blur-xl" : "border-transparent bg-transparent"}`}>
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
            {!celular && (
              <>
                <a className={`flex min-h-11 items-center rounded-full px-3.5 font-bold ${lleno ? "text-[color:var(--cobalto)]" : "text-white"}`} href="#entrar">
                  Entrar
                </a>
                <a className={`btn min-h-11 px-4 text-[15px] ${lleno ? "btn-p" : "btn-b"}`} href="#crear">
                  Crear cuenta gratis
                </a>
              </>
            )}
            {celular && (
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

/** Chip de premio del héroe: aparece una sola vez. */
function Chip({ children, retraso, className }: { children: ReactNode; retraso: number; className: string }) {
  const quieto = !!useReducedMotion();
  return (
    <motion.div className={`absolute z-10 ${className}`} initial={quieto ? { opacity: 0 } : { opacity: 0, scale: 0.4, y: 14 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={quieto ? { duration: 0.2, delay: retraso } : { type: "spring", stiffness: 500, damping: 16, delay: retraso }}>
      <div className="flex items-center gap-2 rounded-full bg-[#FFFFFF] px-3.5 py-2 text-[14px] leading-[18px] font-extrabold whitespace-nowrap text-[#141A4D] shadow-[0_10px_30px_rgba(0,0,0,.35)] @4xl:text-[15px]" style={N}>
        {children}
      </div>
    </motion.div>
  );
}

/** León en su órbita: las órbitas se dibujan una vez y aparecen los puntos de cada app. */
function EscenaLeon({ celular }: { celular: boolean }) {
  const t = celular ? 230 : 360;
  const w = celular ? 340 : 500;
  const dibujo = (retraso: number) => ({ initial: { pathLength: 0, opacity: 0 }, animate: { pathLength: 1, opacity: 1 }, transition: { duration: 1.4, ease: "easeInOut" as const, delay: retraso } });
  return (
    <div className="relative mx-auto" style={{ width: w, height: t + 50 }}>
      <svg viewBox="0 0 500 410" className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
        <defs>
          <linearGradient id="orbita-a" x1="0" x2="1">
            <stop offset="0" stopColor="#5FE3DC" stopOpacity="0" />
            <stop offset=".5" stopColor="#5FE3DC" stopOpacity=".9" />
            <stop offset="1" stopColor="#9CA3FF" stopOpacity=".2" />
          </linearGradient>
          <radialGradient id="halo">
            <stop offset="0" stopColor="#5FE3DC" stopOpacity=".28" />
            <stop offset="1" stopColor="#5FE3DC" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="250" cy="215" r="170" fill="url(#halo)" />
        <motion.ellipse cx="250" cy="225" rx="238" ry="74" fill="none" stroke="url(#orbita-a)" strokeWidth="1.6" transform="rotate(-12 250 225)" {...dibujo(0.2)} />
        <motion.ellipse cx="250" cy="225" rx="200" ry="56" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="1" strokeDasharray="3 6" transform="rotate(16 250 225)" {...dibujo(0.5)} />
        {(
          [
            [32, 268, "#2430D9"],
            [462, 168, "#0E5B57"],
            [430, 300, "#4A4EDB"],
          ] as [number, number, string][]
        ).map(([x, y, c], k) => (
          <motion.circle key={k} cx={x} cy={y} r="8" fill={c} stroke="#fff" strokeWidth="2.5" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.4 + k * 0.15, type: "spring", stiffness: 400, damping: 14 }} style={{ transformOrigin: `${x}px ${y}px` }} />
        ))}
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <Leon pose="saluda" alto={Math.round(t * 0.92)} rebote />
      </div>
      <Chip retraso={0.9} className="top-[4%] left-[2%]">
        <Moneda className="size-6" />
        +15 monedas
      </Chip>
      <Chip retraso={1.1} className="top-[36%] right-[-2%]">
        <Llama activa className="size-6" />
        Racha de 4 días
      </Chip>
      <Chip retraso={1.3} className="bottom-[6%] left-[6%]">
        <span className="grid size-6 place-items-center rounded-full bg-[#0E5B57] text-[11px] font-black text-white">S/</span>
        <span className="num">31 para hoy</span>
      </Chip>
    </div>
  );
}

function Heroe({ celular }: { celular: boolean }) {
  const quieto = !!useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yFondo = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const yLeon = useTransform(scrollYProgress, [0, 1], ["0%", "-16%"]);
  const palabras = "Estudia jugando y ordena tu plata, gratis.".split(" ");
  return (
    <section ref={ref} id="inicio" className="relative isolate -mt-[72px] overflow-hidden bg-[color:var(--espacio)] text-white">
      <motion.div className="absolute inset-0 -z-10" style={quieto ? undefined : { y: yFondo }} aria-hidden="true">
        <Banner key={celular ? "m" : "c"} nombre={celular ? "hero-movil" : "hero"} tono="hero" velo="ninguno" parallax={false} className="absolute! inset-0 rounded-none!" />
        <div className="absolute inset-0" style={{ background: celular ? "linear-gradient(180deg, rgba(10,14,42,.15) 0%, rgba(10,14,42,.25) 32%, rgba(10,14,42,.92) 52%, #0A0E2A 70%)" : "linear-gradient(90deg, #0A0E2A 0%, rgba(10,14,42,.94) 32%, rgba(10,14,42,.5) 52%, rgba(10,14,42,.05) 72%)" }} />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-[#0A0E2A]" />
      </motion.div>
      <div className="mx-auto grid max-w-[1200px] items-center px-5 pt-[96px] pb-16 @4xl:min-h-[780px] @4xl:grid-cols-12 @4xl:px-8 @4xl:pt-[110px] @4xl:pb-24">
        <motion.div className="@4xl:order-2 @4xl:col-span-5" style={quieto ? undefined : { y: yLeon }}>
          <EscenaLeon celular={celular} />
        </motion.div>
        <div className="mt-2 @4xl:order-1 @4xl:col-span-7 @4xl:mt-0">
          <h1 className="h1 max-w-[13ch]" aria-label="Estudia jugando y ordena tu plata, gratis.">
            {palabras.map((p, k) => (
              <motion.span key={k} className="mr-[0.25em] inline-block" initial={quieto ? { opacity: 0 } : { opacity: 0, y: 22, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ delay: 0.15 + k * 0.07, duration: 0.55, ease: SUAVE }} aria-hidden="true">
                {p}
              </motion.span>
            ))}
          </h1>
          <motion.p className="mt-5 max-w-[46ch] text-[18px] leading-[28px] text-white/80 @4xl:text-[20px] @4xl:leading-[30px]" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.5, ease: SUAVE }}>
            Auxi Student convierte tus apuntes en preguntas que se juegan. Auxi Vida te dice cuánto puedes gastar hoy. Las dos con una sola cuenta.
          </motion.p>
          <motion.div className="mt-8 flex flex-wrap gap-3" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85, duration: 0.5, ease: SUAVE }}>
            <a className="btn btn-b" href="#crear">
              Crear mi cuenta gratis
            </a>
            <a className="btn btn-f" href="#ecosistema">
              Ver cómo funciona
            </a>
          </motion.div>
          <motion.div className="mt-10 flex flex-wrap gap-2.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.05, duration: 0.5 }}>
            {(
              [
                ["#student", "student", "Auxi Student", "Estudia jugando"],
                ["#vida", "vida", "Auxi Vida", "Tu plata del día"],
                ["#vendoe", "vendoe", "Vendoe", "Para tu negocio"],
              ] as [string, AppConIcono, string, string][]
            ).map(([h, a, n, d]) => (
              <a key={h} href={h} className="vidrio group flex items-center gap-2.5 rounded-[18px] py-2 pr-4 pl-2 transition-colors hover:bg-white/15">
                <IconoApp app={a} tamano={34} decorativo />
                <span className="leading-tight">
                  <span className="block text-[14px] font-bold">{n}</span>
                  <span className="block text-[12px] text-white/70">{d}</span>
                </span>
              </a>
            ))}
          </motion.div>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[14px] text-white/75">
            {["Lo básico siempre gratis", "Sin tarjeta", "En celular y computadora"].map((x) => (
              <li key={x} className="flex items-center gap-1.5">
                <Check color="#5FE3DC" className="size-4" />
                {x}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** Mapa del ecosistema: tu cuenta al centro y cada app en su órbita. Se dibuja una vez al verse. */
function MapaOrbital() {
  const ref = useRef<HTMLDivElement>(null);
  const visto = useInView(ref, { once: true, amount: 0.4 });
  const quieto = !!useReducedMotion();
  const nodos: { x: number; y: number; app?: AppConIcono; nombre: string; dato: string; href: string; lado: "izq" | "der" }[] = [
    { x: 70.8, y: 34.6, app: "student", nombre: "Auxi Student", dato: "Estudia jugando", href: "#student", lado: "der" },
    { x: 40.2, y: 71, app: "vida", nombre: "Auxi Vida", dato: "Tu plata del día", href: "#vida", lado: "izq" },
    { x: 87.9, y: 63.8, app: "vendoe", nombre: "Vendoe", dato: "Para negocios", href: "#vendoe", lado: "izq" },
    { x: 16.9, y: 26.9, nombre: "Próximamente", dato: "En el estudio", href: "#ecosistema", lado: "der" },
  ];
  const dibuja = (retraso: number) => (quieto ? {} : { initial: { pathLength: 0, opacity: 0 }, animate: visto ? { pathLength: 1, opacity: 1 } : {}, transition: { duration: 1.2, ease: "easeInOut" as const, delay: retraso } });
  return (
    <div ref={ref} className="relative mx-auto aspect-square w-full max-w-[520px]">
      <svg viewBox="0 0 520 520" className="absolute inset-0 size-full" aria-hidden="true">
        <defs>
          <radialGradient id="nucleo">
            <stop offset="0" stopColor="#5FE3DC" stopOpacity=".35" />
            <stop offset="1" stopColor="#5FE3DC" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="rayo" x1="0" x2="1">
            <stop offset="0" stopColor="#5FE3DC" stopOpacity=".7" />
            <stop offset="1" stopColor="#9CA3FF" stopOpacity=".15" />
          </linearGradient>
        </defs>
        <circle cx="260" cy="260" r="110" fill="url(#nucleo)" />
        <motion.circle cx="260" cy="260" r="120" fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="1.2" {...dibuja(0)} />
        <motion.circle cx="260" cy="260" r="210" fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="1.2" strokeDasharray="3 7" {...dibuja(0.3)} />
        <motion.circle cx="260" cy="260" r="250" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="1" {...dibuja(0.5)} />
        {nodos.map((n, k) => (
          <motion.line key={n.nombre} x1="260" y1="260" x2={(n.x / 100) * 520} y2={(n.y / 100) * 520} stroke="url(#rayo)" strokeWidth="1.5" strokeDasharray={n.app ? undefined : "4 6"} {...dibuja(0.9 + k * 0.15)} />
        ))}
        {!quieto &&
          visto &&
          nodos
            .filter((n) => n.app)
            .map((n, k) => (
              <motion.circle key={`p${n.nombre}`} r="4" fill="#5FE3DC" initial={{ cx: 260, cy: 260, opacity: 0 }} animate={{ cx: (n.x / 100) * 520, cy: (n.y / 100) * 520, opacity: [0, 1, 1, 0] }} transition={{ delay: 1.7 + k * 0.25, duration: 0.9, ease: "easeInOut" }} />
            ))}
      </svg>
      {/* Centro: tu cuenta */}
      <motion.div className="absolute top-1/2 left-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center text-center" initial={{ scale: 0.6, opacity: 0 }} animate={visto ? { scale: 1, opacity: 1 } : {}} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
        <span className="grid size-[92px] place-items-center rounded-full bg-[#121844] ring-1 ring-white/20 shadow-[0_0_60px_rgba(95,227,220,.35)] @4xl:size-[110px]">
          <img src="/marca/simbolo.webp" alt="" className="size-[60px] @4xl:size-[72px]" draggable={false} />
        </span>
        <span className="mt-2 hidden text-[13px] font-bold text-white/85 @2xl:block">Tu cuenta Auxi</span>
      </motion.div>
      {/* Apps */}
      {nodos.map((n, k) => (
        <motion.a
          key={n.nombre}
          href={n.href}
          className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 ${n.lado === "izq" ? "flex-row-reverse text-right" : ""}`}
          style={{ left: `${n.x}%`, top: `${n.y}%` }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={visto ? { opacity: 1, scale: 1 } : {}}
          whileHover={{ scale: 1.06 }}
          transition={{ delay: 1.1 + k * 0.15, type: "spring", stiffness: 380, damping: 18 }}
        >
          {n.app ? (
            <span className="rounded-[16px] shadow-[0_0_30px_rgba(95,227,220,.25)]">
              <IconoApp app={n.app} tamano={50} decorativo />
            </span>
          ) : (
            <span className="grid size-[50px] place-items-center rounded-[16px] border-2 border-dashed border-white/35 text-[24px] font-black text-white/70">+</span>
          )}
          <span className="vidrio hidden rounded-[12px] px-2.5 py-1.5 leading-tight whitespace-nowrap @2xl:block">
            <span className="block text-[13px] font-bold">{n.nombre}</span>
            <span className="block text-[11px] text-white/70">{n.dato}</span>
          </span>
        </motion.a>
      ))}
    </div>
  );
}

function Ecosistema() {
  const principios: [string, string, string][] = [
    [D.foco, "Te pregunta, no te copia", "Pista primero. La respuesta solo si la pides."],
    [D.chat, "Tu propia IA, sin costo", "Creas lecciones con ChatGPT, Claude o Gemini."],
    [D.dado, "Premios sin trampas", "Probabilidades a la vista, sin cuentas regresivas falsas."],
    [D.nube, "Todo en tu cuenta", "Student y Vida se guardan. Solo tú los ves."],
  ];
  return (
    <section id="ecosistema" className="relative isolate overflow-hidden bg-[color:var(--espacio)] text-white">
      <div className="absolute inset-0 -z-10 opacity-50" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.10) 1px, transparent 1px)", backgroundSize: "28px 28px", maskImage: "radial-gradient(ellipse at 70% 50%, black 30%, transparent 75%)" }} aria-hidden="true" />
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 py-20 @4xl:grid-cols-12 @4xl:gap-10 @4xl:px-8 @4xl:py-32">
        <div className="@4xl:order-2 @4xl:col-span-6">
          <MapaOrbital />
        </div>
        <div className="@4xl:order-1 @4xl:col-span-6">
          <h2 className="h2 max-w-[14ch]">Un ecosistema de apps. Una sola cuenta.</h2>
          <p className="mt-5 max-w-[46ch] text-[18px] leading-[28px] text-white/75">Auxi Studio reúne apps que hacen una cosa bien. Entras una vez, tu avance viaja contigo y lo nuevo aparece en tu espacio.</p>
          <ul className="mt-10 grid gap-x-8 gap-y-7 @2xl:grid-cols-2">
            {principios.map(([d, t, x]) => (
              <li key={t} className="flex gap-4">
                <span className="vidrio grid size-11 shrink-0 place-items-center rounded-[14px] text-[#5FE3DC]">
                  <IcoTrazo d={d} className="size-5" />
                </span>
                <span>
                  <span className="block text-[16px] font-bold">{t}</span>
                  <span className="mt-0.5 block text-[14px] leading-[20px] text-white/70">{x}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function SeccionApp(p: { id: string; app: AppConIcono; nombre: string; publico: string; titulo: string; texto: string; principal: string; secundario: [string, string]; arte: string; tono: Tono; colorTexto: string; boton: string; tinte: string; tinteDemo: string; estilo: Estilo; escenas: Escena[]; bentoTitulo: string; bento: ReactNode; celular: boolean }) {
  return (
    <section id={p.id} className="relative py-20 @4xl:py-28" style={{ background: p.tinte }}>
      <div className="mx-auto max-w-[1200px] px-5 @4xl:px-8">
        <div className="grid items-center gap-10 @4xl:grid-cols-12">
          <div className="@4xl:col-span-7">
            <div className="flex items-center gap-3">
              <IconoApp app={p.app} tamano={56} decorativo />
              <div>
                <p className="text-[22px] leading-[26px] font-black" style={{ ...N, color: p.colorTexto }}>
                  {p.nombre}
                </p>
                <p className="chico">{p.publico}</p>
              </div>
            </div>
            <h2 className="h2 mt-7 max-w-[17ch]">{p.titulo}</h2>
            <p className="cuerpo-l mt-5 max-w-[50ch]">{p.texto}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className={`btn ${p.boton}`} href="#abrir">
                {p.principal}
              </a>
              <a className="btn btn-s" href={p.secundario[1]}>
                {p.secundario[0]}
              </a>
            </div>
          </div>
          <div className="@4xl:col-span-5">
            <Banner nombre={p.arte} tono={p.tono} velo="ninguno" parallax={false} className="mx-auto aspect-[5/4] max-w-[460px] shadow-[0_30px_60px_rgba(20,26,77,.18)]" />
          </div>
        </div>
        {p.celular ? <Carrusel escenas={p.escenas} estilo={p.estilo} nombre={p.nombre} /> : <Historia escenas={p.escenas} estilo={p.estilo} colorTexto={p.colorTexto} />}
        <div className="mt-20 @4xl:mt-12">
          <h3 className="text-[28px] leading-[34px] font-black @4xl:text-[34px] @4xl:leading-[40px]">{p.bentoTitulo}</h3>
          <div className="mt-8 grid gap-5 @2xl:grid-cols-2 @4xl:grid-cols-3">{p.bento}</div>
        </div>
      </div>
    </section>
  );
}

function Vendoe() {
  return (
    <section id="vendoe" className="px-5 py-16 @4xl:px-8 @4xl:py-24">
      <div className="relative isolate mx-auto grid max-w-[1200px] items-center gap-8 overflow-hidden rounded-[36px] p-8 text-white @4xl:grid-cols-12 @4xl:p-14" style={{ background: "radial-gradient(120% 120% at 100% 0%, #6A6EF0 0%, #4A4EDB 35%, #2B2FA8 100%)" }}>
        <div className="absolute inset-0 -z-10 opacity-40" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.14) 1px, transparent 1px)", backgroundSize: "22px 22px" }} aria-hidden="true" />
        <div className="@4xl:col-span-7">
          <div className="flex items-center gap-3">
            <IconoApp app="vendoe" tamano={52} decorativo />
            <div>
              <p className="text-[22px] leading-[26px] font-black" style={N}>
                Vendoe
              </p>
              <p className="text-[14px] text-white/75">Para negocios · sitio aparte</p>
            </div>
          </div>
          <h2 className="h2 mt-6 max-w-[16ch]">¿Tienes un negocio? Vende desde tu celular.</h2>
          <p className="mt-4 max-w-[46ch] text-[18px] leading-[28px] text-white/80">Vendoe es otra app que creé para negocios, con su propia página y su propia cuenta.</p>
          <a className="btn btn-b mt-8" href="#vendoe-externo">
            Conocer Vendoe
            <IcoTrazo d={D.flecha} className="size-5" />
          </a>
        </div>
        <div className="@4xl:col-span-5">
          <Banner nombre="app-vendoe" tono="vendoe" velo="ninguno" parallax={false} className="mx-auto aspect-square max-w-[340px] shadow-[0_30px_60px_rgba(0,0,0,.3)]" />
        </div>
      </div>
    </section>
  );
}

function Precios() {
  return (
    <section id="precios" className="mx-auto max-w-[1200px] px-5 py-16 @4xl:px-8 @4xl:py-24">
      <div className="max-w-[640px]">
        <h2 className="h2">Precios claros</h2>
        <p className="cuerpo-l mt-4">No pagas nada para usar Auxi. Las monedas solo abren extras y se ganan usando la app.</p>
      </div>
      <div className="mt-12 grid gap-5 @4xl:grid-cols-3">
        <div className="flex flex-col rounded-[28px] border border-[color:var(--linea)] bg-[color:var(--blanco)] p-7">
          <p className="text-[18px] font-black" style={N}>
            Gratis
          </p>
          <p className="mt-3 flex items-baseline gap-2">
            <span className="text-[56px] leading-none font-black" style={N}>
              S/ 0
            </span>
            <span className="text-[color:var(--gris)]">para siempre</span>
          </p>
          <ul className="mt-7 flex flex-1 flex-col gap-3 text-[15px]">
            {["Lecciones, repaso y camino de niveles", "Métodos: El tomate, Las 5 cajas y Explícaselo a León", "Exámenes y entregas con avisos", "Auxi Vida completa", "2 temas creados con tu IA"].map((x) => (
              <li key={x} className="flex gap-2.5">
                <Check color="var(--cobalto)" className="mt-0.5 size-5" />
                {x}
              </li>
            ))}
          </ul>
          <a className="btn btn-p mt-8" href="#crear">
            Crear mi cuenta gratis
          </a>
        </div>
        <div className="relative flex flex-col overflow-hidden rounded-[28px] bg-[color:var(--blanco)] p-7 ring-2 ring-[#F2B341] shadow-[0_24px_60px_rgba(242,179,65,.18)]">
          <div className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-[#F2B341]/20 blur-3xl" aria-hidden="true" />
          <p className="flex items-center gap-2 text-[18px] font-black" style={N}>
            <Moneda className="size-7" />
            Lo extra, con monedas
          </p>
          <dl className="mt-5 flex flex-col divide-y divide-[color:var(--oro-linea)]">
            {[
              ["Un tema más creado con IA", "60"],
              ["Pase libre de por vida para crear temas", "500"],
            ].map(([a, b]) => (
              <div key={a} className="flex items-center justify-between gap-4 py-3.5">
                <dt className="text-[15px]">{a}</dt>
                <dd className="num flex shrink-0 items-center gap-1 text-[20px] font-black" style={N}>
                  <Moneda className="size-5" />
                  {b}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-[14px] font-bold">Cómo las ganas</p>
          <ul className="mt-2 flex flex-1 flex-col gap-2 text-[15px]">
            {["Terminando lecciones", "Con el cofre del día", "Con misiones opcionales"].map((x) => (
              <li key={x} className="flex gap-2.5">
                <Check color="#C98A1C" className="mt-0.5 size-5" />
                {x}
              </li>
            ))}
          </ul>
          <p className="mt-6 rounded-[14px] bg-[color:var(--oro-suave)] p-3 text-[14px] leading-[20px] text-[color:var(--oro-texto)]">Lo que ya creaste nunca se bloquea.</p>
        </div>
        <div className="flex flex-col rounded-[28px] border border-[color:var(--linea)] bg-[color:var(--blanco)] p-7">
          <p className="flex items-center gap-2 text-[18px] font-black" style={N}>
            <IconoApp app="vendoe" tamano={28} decorativo />
            Vendoe para negocios
          </p>
          <p className="mt-4 flex-1 text-[15px] leading-[23px] text-[color:var(--gris)]">Es la única app de pago del ecosistema. Tiene sus propios planes, en su propia página.</p>
          <a className="btn btn-s mt-8" href="#vendoe-externo">
            Ver planes de Vendoe
          </a>
        </div>
      </div>
    </section>
  );
}

function Pregunta({ q, children, abierta, alTocar }: { q: string; children: ReactNode; abierta: boolean; alTocar: () => void }) {
  return (
    <div className="border-b border-[color:var(--linea)]">
      <button type="button" aria-expanded={abierta} onClick={alTocar} className="flex min-h-16 w-full items-center justify-between gap-4 py-3 text-left text-[17px] font-bold @4xl:text-[18px]">
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
    ["¿De verdad es gratis?", "Sí. Lo básico de Auxi Student y toda Auxi Vida son gratis. Las monedas solo abren extras y se ganan usando la app."],
    ["¿Necesito crear una cuenta?", "Sí, con tu correo o con Google. Así tu avance y tus datos se guardan y puedes seguir en otro equipo. Auxi Vida tiene un modo de ejemplo para mirarla antes."],
    ["¿Cómo se crean las lecciones?", "Copias el pedido de Auxi, lo pegas en tu IA (ChatGPT, Claude o Gemini) junto con tu PDF o tus apuntes, y pegas aquí la respuesta. Revisas las preguntas y listo."],
    ["¿Auxi Vida se conecta a mi banco?", "No. No mueve dinero ni ve tu saldo. Tú anotas o importas tus movimientos y el disponible del día es un estimado."],
    ["¿Quién ve mis datos?", "Solo tú. Se guardan en tu cuenta, puedes descargarlos y puedes borrar tu cuenta desde tu perfil."],
    ["¿Funciona en iPhone y Android?", "Sí, desde el navegador. También puedes agregarla a tu pantalla de inicio y abrirla como una app."],
  ];
  return (
    <section id="preguntas" className="border-t border-[color:var(--linea)] bg-[color:var(--superficie-2)]/50">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-5 py-16 @4xl:grid-cols-12 @4xl:px-8 @4xl:py-24">
        <div className="@4xl:col-span-5">
          <h2 className="h2">Preguntas frecuentes</h2>
          <p className="cuerpo-l mt-4 max-w-[36ch]">Si tu duda no está aquí, escríbeme. Te respondo yo.</p>
          <div className="mt-8 flex items-center gap-4 rounded-[24px] border border-[color:var(--linea)] bg-[color:var(--blanco)] p-5">
            <span className="block size-14 shrink-0 overflow-hidden rounded-full bg-[#0B1140]">
              <img src="/plataforma/presentacion.webp" alt="" className="size-full scale-[2.1] object-cover" style={{ transformOrigin: "50% 62%" }} />
            </span>
            <div className="flex-1">
              <p className="font-bold">Daniel Chong</p>
              <p className="chico">Creador de Auxi Studio</p>
            </div>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="btn btn-t min-h-11 px-4 text-[15px]">
              <IcoTrazo d={D.whatsapp} className="size-5" />
              WhatsApp
            </a>
          </div>
        </div>
        <div className="border-t border-[color:var(--linea)] @4xl:col-span-7">
          {lista.map(([q, r], k) => (
            <Pregunta key={q} q={q} abierta={abierta === k} alTocar={() => setAbierta(abierta === k ? -1 : k)}>
              {r}
            </Pregunta>
          ))}
        </div>
      </div>
    </section>
  );
}

function Cierre({ celular }: { celular: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const visto = useInView(ref, { once: true, amount: 0.3 });
  return (
    <section className="relative isolate overflow-hidden bg-[color:var(--espacio)] text-white">
      <svg viewBox="0 0 1200 600" className="absolute inset-0 -z-10 size-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <motion.ellipse cx="900" cy="320" rx="520" ry="150" fill="none" stroke="rgba(95,227,220,.25)" strokeWidth="1.2" transform="rotate(-10 900 320)" initial={{ pathLength: 0 }} animate={visto ? { pathLength: 1 } : {}} transition={{ duration: 1.8, ease: "easeInOut" }} />
        <motion.ellipse cx="900" cy="320" rx="420" ry="110" fill="none" stroke="rgba(255,255,255,.12)" strokeDasharray="3 7" transform="rotate(14 900 320)" initial={{ pathLength: 0 }} animate={visto ? { pathLength: 1 } : {}} transition={{ duration: 1.8, ease: "easeInOut", delay: 0.3 }} />
      </svg>
      <div ref={ref} className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 py-20 @4xl:grid-cols-12 @4xl:px-8 @4xl:py-28">
        <div className="@4xl:col-span-7">
          <h2 className="h2 max-w-[15ch]">Empieza hoy. Es gratis.</h2>
          <p className="mt-4 max-w-[44ch] text-[18px] leading-[28px] text-white/75">Crea tu cuenta en un minuto y elige la app que necesitas. León te acompaña desde el primer día.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="btn btn-b" href="#crear">
              Crear mi cuenta gratis
            </a>
            <a className="btn btn-f" href={WHATSAPP} target="_blank" rel="noopener noreferrer">
              <IcoTrazo d={D.whatsapp} className="size-5" />
              Escribir por WhatsApp
            </a>
          </div>
          <div id="sobre" className="vidrio mt-12 flex max-w-[560px] flex-col gap-4 rounded-[24px] p-5 @2xl:flex-row @2xl:items-center">
            <span className="block size-20 shrink-0 overflow-hidden rounded-[18px] bg-[#0B1140]">
              <img src="/plataforma/presentacion.webp" alt="Daniel Chong" className="size-full scale-[1.8] object-cover" style={{ transformOrigin: "50% 60%" }} />
            </span>
            <div>
              <p className="text-[17px] font-black" style={N}>
                Hola, soy Daniel Chong
              </p>
              <p className="mt-1 text-[15px] leading-[22px] text-white/75">Me apasiona crear soluciones digitales para negocios y personas. Aquí comparto lo que aprendo, también mis errores. Te doy la bienvenida: sácale todo el provecho.</p>
              <div className="mt-1 flex flex-wrap gap-x-5">
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-semibold text-[#5FE3DC] underline">
                  Sígueme en Instagram
                </a>
                <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-semibold text-[#5FE3DC] underline">
                  Contáctame por privado
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center @4xl:col-span-5">
          <Leon pose="anima" alto={celular ? 200 : 320} />
        </div>
      </div>
    </section>
  );
}

function Pie() {
  const columnas: [string, [string, string][]][] = [
    [
      "Apps",
      [
        ["Auxi Student", "#student"],
        ["Auxi Vida", "#vida"],
        ["Vendoe (sitio aparte)", "#vendoe"],
      ],
    ],
    [
      "Ayuda",
      [
        ["Preguntas frecuentes", "#preguntas"],
        ["WhatsApp", WHATSAPP],
        ["Instagram", INSTAGRAM_URL],
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
    <footer className="border-t border-white/10 bg-[color:var(--espacio)] text-white">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-14 @4xl:grid-cols-12 @4xl:px-8">
        <div className="@4xl:col-span-4">
          <Marca clara />
          <p className="mt-4 max-w-[30ch] text-[14px] leading-[21px] text-white/65">Un ecosistema de apps gratis para estudiar y ordenar tu plata.</p>
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

/* =====================================================================================
   Landing
   ===================================================================================== */

const ESTILO_STUDENT: Estilo = { fondo: "radial-gradient(120% 100% at 20% 0%, #3B47F0 0%, #2430D9 40%, #141C8F 100%)", brillo: "#5FE3DC", pantallaFondo: "#F7F8FC", color: "var(--cobalto)" };
const ESTILO_VIDA: Estilo = { fondo: "radial-gradient(120% 100% at 20% 0%, #13807A 0%, #0E5B57 45%, #06302E 100%)", brillo: "#F2B341", pantallaFondo: "#F3FAF8", color: "var(--teal-texto)" };

export function Landing({ celular }: { celular: boolean }) {
  return (
    <div>
      <Encabezado celular={celular} />
      <Heroe celular={celular} />
      <Ecosistema />
      <SeccionApp
        id="student"
        app="student"
        nombre="Auxi Student"
        publico="Para estudiantes · gratis"
        titulo="Convierte tus apuntes en lecciones que se juegan."
        texto="Sube lo que te dejaron, juega con preguntas hechas de tu propio material y vuelve justo cuando te toca repasar."
        principal="Empezar con Auxi Student"
        secundario={["Probar una pregunta", "#prueba"]}
        arte="app-student"
        tono="student"
        colorTexto="var(--cobalto)"
        boton="btn-p"
        tinte="var(--tinte-student)"
        tinteDemo="var(--tinte-student)"
        estilo={ESTILO_STUDENT}
        escenas={ESCENAS_STUDENT}
        celular={celular}
        bentoTitulo="Todo lo que trae Auxi Student"
        bento={
          <>
            <Celda className="@2xl:col-span-2" tinte="var(--tinte-student)" titulo="Pruébalo tú" texto="Así se siente cada pregunta. Si aciertas, ganas monedas; si fallas, León te da una pista.">
              <div id="prueba" className="w-full">
                <PruebaPregunta />
              </div>
            </Celda>
            <Celda tinte="var(--tinte-student)" titulo="Repaso que vuelve" texto="Lo que fallaste regresa mañana, en 3 días y en una semana." retraso={0.08}>
              <DemoRepaso />
            </Celda>
            <Celda tinte="var(--tinte-student)" titulo="Exámenes y entregas" texto="Sube tu sílabo y recibe avisos 7, 3 y 1 día antes.">
              <DemoEntregas />
            </Celda>
            <Celda tinte="var(--tinte-student)" titulo="Métodos de estudio" texto="El tomate, Las 5 cajas y Explícaselo a León, convertidos en juegos." retraso={0.08}>
              <DemoMetodos />
            </Celda>
            <Celda tinte="var(--tinte-student)" titulo="Cofre con probabilidades a la vista" texto="Al terminar tu primera lección del día. Sabes lo que puede salir." retraso={0.16}>
              <DemoCofre />
            </Celda>
          </>
        }
      />
      <SeccionApp
        id="vida"
        app="vida"
        nombre="Auxi Vida"
        publico="Tu plata del día · gratis"
        titulo="Sabe cuánto puedes gastar hoy sin pasarte."
        texto="Anota en segundos, mira tu disponible del día y revisa cualquier mensaje sospechoso antes de pagar."
        principal="Probar con datos de ejemplo"
        secundario={["Ver preguntas", "#preguntas"]}
        arte="app-vida"
        tono="vida"
        colorTexto="var(--teal-texto)"
        boton="btn-t"
        tinte="var(--tinte-vida)"
        tinteDemo="var(--tinte-vida)"
        estilo={ESTILO_VIDA}
        escenas={ESCENAS_VIDA}
        celular={celular}
        bentoTitulo="Todo lo que trae Auxi Vida"
        bento={
          <>
            <Celda className="@2xl:col-span-2" tinte="var(--tinte-vida)" titulo="Importa movimientos" texto="Reportes, capturas o texto: Auxi Vida lee monto, fecha y destino, y tú revisas antes de guardar.">
              <DemoImportar />
            </Celda>
            <Celda tinte="var(--tinte-vida)" titulo="Ocultar montos" texto="Un toque y tus montos desaparecen de la pantalla." retraso={0.08}>
              <DemoOcultar />
            </Celda>
            <Celda tinte="var(--tinte-vida)" titulo="Tu colchón" texto="Metas de ahorro que crecen con lo que te sobra.">
              <DemoMeta />
            </Celda>
            <Celda tinte="var(--tinte-vida)" titulo="Pagos con aviso" texto="Internet, celular, alquiler: te avisa antes de que venzan." retraso={0.08}>
              <DemoPagos />
            </Celda>
            <Celda tinte="var(--tinte-vida)" titulo="Sin conectar tu banco" texto="No mueve dinero ni ve tu saldo. Tus datos se guardan en tu cuenta y solo tú los ves." retraso={0.16}>
              <DemoBanco />
            </Celda>
          </>
        }
      />
      <Vendoe />
      <Precios />
      <Preguntas />
      <Cierre celular={celular} />
      <Pie />
    </div>
  );
}
