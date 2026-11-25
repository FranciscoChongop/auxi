/**
 * MOTION GRAPHICS de cada app (boceto, solo desarrollo). Muestran EL CAMINO, no la práctica:
 * - Auxi Student: sube tu PDF → se vuelve un minijuego → juegas de distintas formas → ganas y repasas.
 * - Auxi Vida: anotas en segundos → ves tu día → ahorras lo que sobra → revisas antes de pagar.
 * Cada escena dura ~3,5 s y el bucle completo ~15 s. Corre solo a la vista, se puede pausar y elegir un paso.
 * Si existe un video en public/motion/<app>.mp4 (hecho por agentes de motion), se usa ese en su lugar.
 */
import { AnimatePresence, MotionConfig, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { IconoApp } from "../../components/IconoApp";
import { CaraDeLeon, Leon } from "../../components/Leon";
import { Llama, Moneda } from "../../components/Navegacion";
import { CaraLeonVida } from "../../vida/ui";
import { Check, Contador, NUNITO } from "../comun";

/** Tamaño lógico de la pantalla: todo se diseña aquí y luego se escala. */
const W = 270;
const H = 576;
const N = { fontFamily: NUNITO };
const RESORTE = { type: "spring" as const, stiffness: 320, damping: 22 };

export type AppMotion = "student" | "vida";

/* =====================================================================================
   Celular realista
   ===================================================================================== */

export function TelefonoPro({ ancho, children }: { ancho: number; children: ReactNode }) {
  const bisel = Math.max(7, Math.round(ancho * 0.034));
  const escala = (ancho - bisel * 2) / W;
  const alto = Math.round(H * escala + bisel * 2);
  return (
    <div className="relative shrink-0" style={{ width: ancho, height: alto }}>
      <div className="absolute -bottom-7 left-1/2 h-10 w-[78%] -translate-x-1/2 rounded-[50%] bg-black/50 blur-2xl" aria-hidden="true" />
      <span className="absolute top-[17%] -left-[3px] h-[6%] w-[4px] rounded-l-[3px] bg-[#2E3462]" aria-hidden="true" />
      <span className="absolute top-[26%] -left-[3px] h-[10%] w-[4px] rounded-l-[3px] bg-[#2E3462]" aria-hidden="true" />
      <span className="absolute top-[23%] -right-[3px] h-[13%] w-[4px] rounded-r-[3px] bg-[#2E3462]" aria-hidden="true" />
      <div
        className="relative size-full rounded-[17%/7.9%]"
        style={{
          padding: bisel,
          background: "linear-gradient(145deg,#454C82 0%,#171B3B 26%,#0A0D24 62%,#343A6E 100%)",
          boxShadow: "0 60px 100px -36px rgba(0,0,0,.7), 0 24px 40px -24px rgba(0,0,0,.5), inset 0 0 0 1px rgba(255,255,255,.14), inset 0 2px 2px rgba(255,255,255,.18)",
        }}
      >
        <div className="telefono relative size-full overflow-hidden rounded-[14.6%/6.8%] bg-[#F7F8FC] text-left text-[#141A4D]">
          <div className="absolute top-0 left-0 origin-top-left" style={{ width: W, height: H, transform: `scale(${escala})` }}>
            {children}
          </div>
          <div className="absolute top-[1.7%] left-1/2 z-30 h-[3.5%] w-[31%] -translate-x-1/2 rounded-full bg-[#05071A]" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-0 z-30" style={{ background: "linear-gradient(118deg, rgba(255,255,255,.24) 0%, rgba(255,255,255,.06) 20%, transparent 38%)" }} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

/** Barra de estado y cabecera de la app dentro de la pantalla. */
function Cabecera({ app, derecha }: { app: AppMotion; derecha?: ReactNode }) {
  return (
    <>
      <div className="absolute top-0 right-0 left-0 flex h-[30px] items-center justify-between px-6 text-[11px] font-bold text-[#141A4D]" aria-hidden="true">
        <span>9:41</span>
        <span className="flex items-center gap-1">
          <span className="h-[7px] w-[12px] rounded-[2px] border border-[#141A4D]/60" />
        </span>
      </div>
      <div className="absolute top-[38px] right-4 left-4 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[13px] font-black" style={N}>
          <IconoApp app={app} tamano={22} decorativo />
          {app === "student" ? "Auxi Student" : "Auxi Vida"}
        </span>
        {derecha}
      </div>
    </>
  );
}

/**
 * Dedo que toca: la yema se acerca desde abajo con su sombra, se hunde y suelta una onda.
 * Se ve como un toque real, no como un círculo que parpadea.
 */
function Toque({ x, y, retraso }: { x: number; y: number; retraso: number }) {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute z-20" style={{ left: x, top: y }}>
      <motion.span
        className="absolute block size-11 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle at 45% 40%, rgba(255,255,255,.95), rgba(255,255,255,.55) 45%, rgba(255,255,255,.12) 70%)", boxShadow: "0 10px 18px rgba(20,26,77,.28)" }}
        initial={{ opacity: 0, x: 14, y: 34, scale: 1.15 }}
        animate={{ opacity: [0, 0.95, 0.95, 0], x: [14, 0, 0, 6], y: [34, 0, 0, 18], scale: [1.15, 1, 0.86, 1] }}
        transition={{ delay: retraso - 0.25, duration: 1.05, times: [0, 0.32, 0.55, 1], ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.span
        className="absolute block size-11 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/90"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: [0, 0.9, 0], scale: [0.6, 1, 1.9] }}
        transition={{ delay: retraso + 0.12, duration: 0.6, ease: "easeOut" }}
      />
    </span>
  );
}

function Boton({ texto, color, sombra, toque, tinta = "#FFFFFF", className = "" }: { texto: string; color: string; sombra: string; toque?: number; tinta?: string; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <motion.span
        className="block rounded-[14px] py-3 text-center text-[14px] font-black"
        style={{ ...N, background: color, color: tinta, boxShadow: `0 4px 0 ${sombra}` }}
        animate={toque !== undefined ? { y: [0, 0, 3, 0] } : {}}
        transition={toque !== undefined ? { delay: toque + 0.15, duration: 0.45, times: [0, 0.2, 0.5, 1] } : {}}
      >
        {texto}
      </motion.span>
      {toque !== undefined && <Toque x={W / 2 - 16} y={22} retraso={toque} />}
    </div>
  );
}

function Destellos({ retraso, color = "#F2B341" }: { retraso: number; color?: string }) {
  const rayos = Array.from({ length: 8 }, (_, k) => (k * Math.PI * 2) / 8);
  return (
    <div className="pointer-events-none absolute top-1/2 left-1/2" aria-hidden="true">
      {rayos.map((a, k) => (
        <motion.span key={k} className="absolute block size-2 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: color }} initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }} animate={{ x: Math.cos(a) * 70, y: Math.sin(a) * 70, opacity: [0, 1, 0], scale: [0.5, 1.2, 0.6] }} transition={{ delay: retraso, duration: 0.8, ease: "easeOut" }} />
      ))}
    </div>
  );
}

/* =====================================================================================
   AUXI STUDENT
   ===================================================================================== */

function MonedasArriba({ desde, hasta, retraso = 0 }: { desde: number; hasta: number; retraso?: number }) {
  return (
    <span className="flex items-center gap-1 rounded-full bg-[#FFF6E2] px-2 py-0.5 text-[12px] font-black text-[#141A4D]" style={N}>
      <Moneda className="size-4" />
      <Contador valor={hasta} desde={desde} retraso={retraso} />
    </span>
  );
}

/** 1 · Sube tu PDF */
function StudentSube() {
  return (
    <div className="absolute inset-0">
      <Cabecera app="student" derecha={<MonedasArriba desde={120} hasta={120} />} />
      <div className="absolute top-[82px] right-4 left-4">
        <p className="text-[22px] leading-[26px] font-black" style={N}>
          Nuevo tema
        </p>
        <p className="mt-0.5 text-[12px] text-[#5B6084]">Sube tu PDF, una foto de tus apuntes o pega texto</p>
        <motion.div className="relative mt-4 grid h-[230px] place-items-center overflow-visible rounded-[20px] border-2 border-dashed" initial={{ borderColor: "#C9CDE6", backgroundColor: "#FFFFFF" }} animate={{ borderColor: "#2430D9", backgroundColor: "#EEF0FF" }} transition={{ delay: 0.95, duration: 0.3 }}>
          <motion.span className="absolute bottom-4 text-[12px] font-bold text-[#8A90B8]" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ delay: 0.8 }}>
            Suelta tu archivo aquí
          </motion.span>
          <motion.div className="w-[140px] rounded-[16px] bg-[#FFFFFF] p-3 shadow-[0_22px_34px_rgba(20,26,77,.28)]" initial={{ y: -330, rotate: -16, scale: 0.92 }} animate={{ y: 0, rotate: -3, scale: 1 }} transition={{ delay: 0.15, type: "spring", stiffness: 150, damping: 14 }}>
            <span className="flex items-center gap-1.5">
              <span className="grid h-6 w-8 place-items-center rounded-[5px] bg-[#E5484D] text-[9px] font-black text-white">PDF</span>
              <span className="text-[11px] font-black">Fracciones.pdf</span>
            </span>
            {[92, 78, 86, 60, 72].map((w, k) => (
              <span key={k} className="mt-2 block h-[5px] rounded-full bg-[#E6E8FA]" style={{ width: `${w}%` }} />
            ))}
            <span className="mt-2 block text-[9px] font-bold text-[#8A90B8]">12 páginas</span>
          </motion.div>
        </motion.div>
        <div className="mt-5">
          <div className="relative h-4 text-[12px] font-bold">
            <motion.span className="absolute left-0 text-[#5B6084]" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0] }} transition={{ delay: 1.0, duration: 1.6, times: [0, 0.1, 0.85, 1] }}>
              Leyendo tu PDF…
            </motion.span>
            <motion.span className="absolute left-0 flex items-center gap-1 text-[#0E8A84]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.6 }}>
              <Check color="#0E8A84" className="size-4" />
              Listo: 8 preguntas
            </motion.span>
          </div>
          <span className="mt-2 block h-2 overflow-hidden rounded-full bg-[#E6E8FA]">
            <motion.span className="block h-full rounded-full bg-[#2430D9]" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ delay: 1.05, duration: 1.5, ease: "easeInOut" }} />
          </span>
        </div>
      </div>
      <div className="absolute right-4 bottom-6 left-4">
        <Boton texto="Crear mi minijuego" color="#2430D9" sombra="#1A23A6" toque={2.85} />
      </div>
    </div>
  );
}

const JUEGOS = [
  { nombre: "Elige la correcta", color: "#2430D9", claro: "#ECEEFB", icono: "M5 7h14M5 12h10M5 17h6" },
  { nombre: "Verdadero o falso", color: "#0E8A84", claro: "#DDF8F6", icono: "M5 12l4 4 10-10" },
  { nombre: "Une las parejas", color: "#C98A1C", claro: "#FFF6E2", icono: "M6 7h3M6 17h3M15 7h3M15 17h3M9 7l6 10M9 17l6-10" },
  { nombre: "Completa la frase", color: "#4A4EDB", claro: "#ECECFD", icono: "M4 12h4M10 12h4M16 12h4M10 15h4" },
];

/** 2 · Se vuelve un minijuego */
function StudentMinijuego() {
  const destinos = [
    [-62, -64],
    [62, -64],
    [-62, 64],
    [62, 64],
  ];
  return (
    <div className="absolute inset-0">
      <Cabecera app="student" derecha={<MonedasArriba desde={120} hasta={120} />} />
      <div className="absolute top-[82px] right-4 left-4">
        <p className="text-[22px] leading-[26px] font-black" style={N}>
          Tu minijuego
        </p>
        <motion.span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#ECEEFB] px-2 py-0.5 text-[11px] font-bold text-[#2430D9]" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }}>
          <svg viewBox="0 0 24 24" className="size-3.5" aria-hidden="true">
            <path d="M12 2l2.2 6.6L21 11l-6.8 2.4L12 20l-2.2-6.6L3 11l6.8-2.4z" fill="currentColor" />
          </svg>
          Hecho con tu propia IA
        </motion.span>
      </div>
      <div className="absolute top-[150px] left-1/2 h-[270px] w-0">
        {/* El PDF se transforma */}
        <motion.div className="absolute top-[110px] left-0 w-[110px] -translate-x-1/2 rounded-[14px] bg-[#FFFFFF] p-2.5 shadow-[0_16px_30px_rgba(20,26,77,.25)]" initial={{ scale: 1, opacity: 1, rotate: -3 }} animate={{ scale: [1, 1.08, 0.2], opacity: [1, 1, 0], rotate: [-3, 0, 20] }} transition={{ duration: 0.75, times: [0, 0.4, 1], ease: "easeIn" }}>
          <span className="grid h-5 w-7 place-items-center rounded-[4px] bg-[#E5484D] text-[8px] font-black text-white">PDF</span>
          <span className="mt-1.5 block h-1 w-full rounded-full bg-[#E6E8FA]" />
          <span className="mt-1 block h-1 w-3/4 rounded-full bg-[#E6E8FA]" />
        </motion.div>
        <div className="absolute top-[135px] left-0">
          <Destellos retraso={0.6} />
        </div>
        {JUEGOS.map((j, k) => (
          <motion.div
            key={j.nombre}
            className="absolute top-[135px] left-0 flex h-[112px] w-[112px] flex-col justify-between rounded-[18px] p-2.5 shadow-[0_14px_26px_rgba(20,26,77,.18)]"
            style={{ background: "#FFFFFF", marginLeft: -56, marginTop: -56 }}
            initial={{ x: 0, y: 0, scale: 0.2, opacity: 0, rotate: 0 }}
            animate={{ x: destinos[k][0], y: destinos[k][1], scale: 1, opacity: 1, rotate: [0, k % 2 ? 4 : -4, 0] }}
            transition={{ delay: 0.7 + k * 0.12, ...RESORTE }}
          >
            <span className="grid size-9 place-items-center rounded-[11px]" style={{ background: j.claro, color: j.color }}>
              <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
                <path d={j.icono} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="text-[12px] leading-[14px] font-black" style={N}>
              {j.nombre}
            </span>
          </motion.div>
        ))}
      </div>
      <motion.div className="absolute right-4 bottom-6 left-4 flex items-center gap-2.5 rounded-[18px] bg-[#FFFFFF] p-3 shadow-[0_10px_24px_rgba(20,26,77,.12)]" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8, ...RESORTE }}>
        <CaraDeLeon cara="feliz" tamano={38} />
        <span className="text-[13px] leading-[17px] font-bold">¡Listo! Tienes 8 preguntas para jugar.</span>
      </motion.div>
    </div>
  );
}

/* Vistas previas de cada forma de jugar */
function VistaElige() {
  return (
    <>
      <p className="text-[12px] font-black" style={N}>
        ¿Qué fracción es igual a 1/2?
      </p>
      {["2/4", "2/3", "3/5"].map((o, k) => (
        <motion.span key={o} className="mt-1.5 block rounded-[10px] border-2 px-2 py-1.5 text-[12px] font-black" style={N} initial={{ backgroundColor: "#FFFFFF", borderColor: "#E6E8FA" }} animate={k === 0 ? { backgroundColor: "#5FE3DC", borderColor: "#2FB7B0" } : {}} transition={{ delay: 0.45 }}>
          {o}
        </motion.span>
      ))}
    </>
  );
}
function VistaVF() {
  return (
    <>
      <p className="text-[12px] font-black" style={N}>
        3/4 es mayor que 2/3
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <motion.span className="grid h-16 place-items-center rounded-[12px] text-[13px] font-black text-white" style={N} initial={{ backgroundColor: "#9AA0C0" }} animate={{ backgroundColor: "#0E8A84", scale: [1, 1.08, 1] }} transition={{ delay: 0.45 }}>
          Verdadero
        </motion.span>
        <span className="grid h-16 place-items-center rounded-[12px] bg-[#E6E8FA] text-[13px] font-black text-[#5B6084]" style={N}>
          Falso
        </span>
      </div>
    </>
  );
}
function VistaParejas() {
  const izq = ["1/2", "3/4", "1/3"];
  const der = ["2/6", "2/4", "6/8"];
  const lineas = [
    [0, 1],
    [1, 2],
    [2, 0],
  ];
  return (
    <div className="relative h-[118px]">
      {izq.map((t, k) => (
        <span key={t} className="absolute left-0 rounded-[8px] bg-[#FFF6E2] px-2 py-1 text-[11px] font-black" style={{ ...N, top: k * 40 }}>
          {t}
        </span>
      ))}
      {der.map((t, k) => (
        <span key={t} className="absolute right-0 rounded-[8px] bg-[#FFF6E2] px-2 py-1 text-[11px] font-black" style={{ ...N, top: k * 40 }}>
          {t}
        </span>
      ))}
      <svg className="absolute inset-0 size-full" viewBox="0 0 160 118" aria-hidden="true">
        {lineas.map(([a, b], k) => (
          <motion.line key={k} x1="40" y1={a * 40 + 12} x2="120" y2={b * 40 + 12} stroke="#C98A1C" strokeWidth="2.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3 + k * 0.15, duration: 0.3 }} />
        ))}
      </svg>
    </div>
  );
}
function VistaTomate() {
  return (
    <div className="flex flex-col items-center">
      <div className="relative size-[96px]">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden="true">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#F4E1DD" strokeWidth="9" />
          <motion.circle cx="50" cy="50" r="42" fill="none" stroke="#E5484D" strokeWidth="9" strokeLinecap="round" initial={{ pathLength: 1 }} animate={{ pathLength: 0.7 }} transition={{ delay: 0.2, duration: 0.6 }} />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-[16px] font-black" style={N}>
          25:00
        </span>
      </div>
      <span className="mt-1 text-[11px] font-bold text-[#5B6084]">25 minutos de foco</span>
    </div>
  );
}
function VistaLeon() {
  return (
    <div className="flex flex-col items-center">
      <CaraDeLeon cara="lentes" tamano={52} />
      <span className="mt-2 rounded-[10px] bg-[#ECEEFB] px-2 py-1 text-[11px] font-bold">Explícamelo con tus palabras</span>
      <div className="mt-2 flex h-6 items-end gap-1" aria-hidden="true">
        {[10, 18, 8, 22, 14, 20, 9].map((h, k) => (
          <motion.span key={k} className="w-1.5 rounded-full bg-[#2430D9]" initial={{ height: 4 }} animate={{ height: [4, h, 6, h * 0.7, 4] }} transition={{ delay: 0.2 + k * 0.04, duration: 0.8 }} />
        ))}
      </div>
    </div>
  );
}

const FORMAS: { nombre: string; vista: () => ReactNode; color: string }[] = [
  { nombre: "Elige la correcta", vista: VistaElige, color: "#2430D9" },
  { nombre: "Verdadero o falso", vista: VistaVF, color: "#0E8A84" },
  { nombre: "Une las parejas", vista: VistaParejas, color: "#C98A1C" },
  { nombre: "El tomate", vista: VistaTomate, color: "#E5484D" },
  { nombre: "Explícaselo a León", vista: VistaLeon, color: "#4A4EDB" },
];

/** 3 · Juega de distintas formas (carrusel en 3D) */
function StudentFormas() {
  const [k, setK] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setK((x) => Math.min(x + 1, FORMAS.length - 1)), 900);
    return () => window.clearInterval(t);
  }, []);
  return (
    <div className="absolute inset-0">
      <Cabecera app="student" derecha={<MonedasArriba desde={120} hasta={120} />} />
      <div className="absolute top-[82px] right-4 left-4">
        <p className="text-[22px] leading-[26px] font-black" style={N}>
          ¿Cómo quieres jugar?
        </p>
        <p className="mt-0.5 text-[12px] text-[#5B6084]">El mismo tema, de muchas formas</p>
      </div>
      <div className="absolute top-[160px] right-0 left-0 h-[300px]" style={{ perspective: 700 }}>
        {FORMAS.map((f, idx) => {
          const d = idx - k;
          const Vista = f.vista;
          return (
            <motion.div
              key={f.nombre}
              className="absolute top-0 left-1/2 h-[280px] w-[190px] -ml-[95px] rounded-[22px] bg-[#FFFFFF] p-3.5 shadow-[0_20px_40px_rgba(20,26,77,.22)]"
              animate={{ x: d * 122, scale: d === 0 ? 1 : 0.8, rotateY: d === 0 ? 0 : d > 0 ? -32 : 32, opacity: Math.abs(d) > 1 ? 0 : d === 0 ? 1 : 0.7, zIndex: 10 - Math.abs(d) }}
              transition={RESORTE}
            >
              <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-black text-white" style={{ ...N, background: f.color }}>
                {f.nombre}
              </span>
              <div className="mt-3">{d === 0 && <Vista />}</div>
            </motion.div>
          );
        })}
      </div>
      <div className="absolute right-0 bottom-[72px] left-0 flex justify-center gap-1.5" aria-hidden="true">
        {FORMAS.map((f, idx) => (
          <motion.span key={f.nombre} className="h-1.5 rounded-full" animate={{ width: idx === k ? 18 : 6, backgroundColor: idx === k ? "#2430D9" : "#C9CDE6" }} />
        ))}
      </div>
      <div className="absolute right-4 bottom-6 left-4">
        <Boton texto="Jugar" color="#2430D9" sombra="#1A23A6" />
      </div>
    </div>
  );
}

/** 4 · Gana y vuelve mañana */
function StudentGana() {
  return (
    <div className="absolute inset-0">
      <Cabecera app="student" derecha={<MonedasArriba desde={120} hasta={150} retraso={0.9} />} />
      <div className="absolute top-[86px] right-4 left-4 flex flex-col items-center text-center">
        <div className="relative">
          <Leon pose="celebra" alto={150} rebote />
          <div className="absolute top-1/2 left-1/2">
            <Destellos retraso={0.35} />
          </div>
        </div>
        <p className="mt-1 text-[22px] font-black" style={N}>
          ¡Tema completado!
        </p>
        <div className="mt-4 grid w-full grid-cols-2 gap-2">
          <motion.div className="rounded-[16px] bg-[#FFF6E2] p-3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, ...RESORTE }}>
            <span className="flex items-center justify-center gap-1 text-[24px] font-black" style={N}>
              <Moneda className="size-6" />+<Contador valor={30} retraso={0.7} />
            </span>
            <span className="text-[11px] font-bold text-[#6B4A0A]">monedas</span>
          </motion.div>
          <motion.div className="rounded-[16px] bg-[#FFF1E6] p-3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, ...RESORTE }}>
            <span className="flex items-center justify-center gap-1 text-[24px] font-black" style={N}>
              <motion.span initial={{ scale: 0.6 }} animate={{ scale: [0.6, 1.35, 1] }} transition={{ delay: 1.2, duration: 0.5 }}>
                <Llama activa className="size-6" />
              </motion.span>
              <Contador valor={5} desde={4} retraso={1.2} />
            </span>
            <span className="text-[11px] font-bold text-[#7A3A12]">días de racha</span>
          </motion.div>
        </div>
        <motion.div className="mt-2 flex w-full items-center gap-2 rounded-[16px] bg-[#FFFFFF] p-3 text-left text-[12px] shadow-[0_8px_20px_rgba(20,26,77,.10)]" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6, ...RESORTE }}>
          <span className="grid size-8 shrink-0 place-items-center rounded-[10px] bg-[#ECEEFB] text-[13px] font-black text-[#2430D9]" style={N}>
            2
          </span>
          <span>
            <span className="block font-black">Mañana repasas</span>
            <span className="text-[#5B6084]">las 2 preguntas que fallaste</span>
          </span>
        </motion.div>
      </div>
    </div>
  );
}

/* =====================================================================================
   AUXI VIDA
   ===================================================================================== */

/** 1 · Anota en segundos */
function VidaAnota() {
  const teclas = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ",", "0", "⌫"];
  const toques: Record<string, number> = { "1": 0.45, "2": 0.85 };
  return (
    <div className="absolute inset-0 bg-[#F3FAF8]">
      <Cabecera app="vida" />
      <div className="absolute top-[82px] right-4 left-4">
        <p className="text-[22px] leading-[26px] font-black" style={N}>
          Registrar gasto
        </p>
        <div className="mt-3 flex h-[64px] items-center gap-2 rounded-[18px] border-2 border-[#0E5B57] bg-[#FFFFFF] px-4">
          <span className="text-[24px] font-black text-[#4E6470]" style={N}>
            S/
          </span>
          <span className="num text-[34px] font-black" style={N}>
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
              1
            </motion.span>
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.95 }}>
              2
            </motion.span>
          </span>
        </div>
        <div className="mt-3 flex gap-1.5">
          {["Comida", "Pasaje", "Casa", "Otros"].map((c, k) => (
            <div key={c} className="relative">
              <motion.span className="block rounded-full border-2 px-2.5 py-1 text-[12px] font-bold" initial={{ backgroundColor: "#FFFFFF", borderColor: "#DCF1EE", color: "#141A4D" }} animate={k === 0 ? { backgroundColor: "#0E5B57", borderColor: "#0E5B57", color: "#FFFFFF" } : {}} transition={{ delay: 1.5, duration: 0.2 }}>
                {c}
              </motion.span>
            </div>
          ))}
        </div>
        <Toque x={36} y={128} retraso={1.3} />
      </div>
      <div className="absolute top-[300px] right-4 left-4 grid grid-cols-3 gap-1.5">
        {teclas.map((t) => (
          <motion.span key={t} className="grid h-[42px] place-items-center rounded-[12px] bg-[#FFFFFF] text-[18px] font-black shadow-[0_2px_0_#DCF1EE]" style={N} animate={toques[t] ? { backgroundColor: ["#FFFFFF", "#DCF1EE", "#FFFFFF"], y: [0, 2, 0] } : {}} transition={toques[t] ? { delay: toques[t], duration: 0.3 } : {}}>
            {t}
          </motion.span>
        ))}
      </div>
      <Toque x={54} y={321} retraso={0.35} />
      <Toque x={135} y={321} retraso={0.75} />
      <div className="absolute right-4 bottom-6 left-4">
        <Boton texto="Guardar" color="#0E5B57" sombra="#07403D" toque={2.2} />
      </div>
      <motion.div className="absolute top-[34px] right-4 left-4 z-20 flex items-center gap-2 rounded-[16px] bg-[#141A4D] px-3 py-2.5 text-[13px] font-bold text-white shadow-[0_14px_30px_rgba(0,0,0,.25)]" initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 2.6, ...RESORTE }}>
        <span className="grid size-6 place-items-center rounded-full bg-[#5FE3DC]">
          <Check color="#141A4D" className="size-4" />
        </span>
        Guardado: Comida · S/ 12
      </motion.div>
    </div>
  );
}

/** 2 · Mira tu día */
function VidaDia() {
  const r = 78;
  return (
    <div className="absolute inset-0 bg-[#F3FAF8]">
      <Cabecera app="vida" />
      <div className="absolute top-[82px] right-4 left-4">
        <p className="text-[22px] leading-[26px] font-black" style={N}>
          Hoy
        </p>
        <div className="relative mx-auto mt-3 size-[200px]">
          <svg viewBox="0 0 200 200" className="size-full -rotate-90" aria-hidden="true">
            <circle cx="100" cy="100" r={r} fill="none" stroke="#DCF1EE" strokeWidth="16" />
            <motion.circle cx="100" cy="100" r={r} fill="none" stroke="#0E5B57" strokeWidth="16" strokeLinecap="round" initial={{ pathLength: 1 }} animate={{ pathLength: 0.72 }} transition={{ delay: 0.7, duration: 1, ease: "easeInOut" }} />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <span>
              <span className="block text-[12px] font-bold text-[#4E6470]">Te quedan hoy</span>
              <span className="block text-[38px] leading-[42px] font-black text-[#0E5B57]" style={N}>
                <Contador valor={31} desde={43} prefijo="S/ " retraso={0.7} duracion={1} />
              </span>
              <span className="block text-[10px] text-[#4E6470]">estimado, no es tu banco</span>
            </span>
          </div>
        </div>
        <motion.div className="mt-3 flex items-center justify-between rounded-[14px] px-3 py-2.5 text-[13px]" initial={{ opacity: 0, x: 40, backgroundColor: "#FFF6E2" }} animate={{ opacity: 1, x: 0, backgroundColor: "#FFFFFF" }} transition={{ delay: 0.3, ...RESORTE, backgroundColor: { delay: 1.8, duration: 0.6 } }}>
          <span className="font-bold">Menú</span>
          <span className="num font-black">− S/ 12</span>
        </motion.div>
        <div className="mt-1.5 flex items-center justify-between rounded-[14px] bg-[#FFFFFF] px-3 py-2.5 text-[13px]">
          <span className="font-bold">Turno</span>
          <span className="num font-black text-[#0E5B57]">+ S/ 75</span>
        </div>
      </div>
      <motion.div className="absolute right-4 bottom-6 left-4 flex items-center gap-2.5 rounded-[18px] bg-[#FFFFFF] p-3 shadow-[0_10px_24px_rgba(14,91,87,.12)]" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.0, ...RESORTE }}>
        <CaraLeonVida cara="feliz" tamano={36} />
        <span className="text-[13px] leading-[17px] font-bold">Vas bien. Te alcanza para hoy.</span>
      </motion.div>
    </div>
  );
}

/** 3 · Ahorra lo que sobra */
function VidaAhorra() {
  return (
    <div className="absolute inset-0 bg-[#F3FAF8]">
      <Cabecera app="vida" />
      <div className="absolute top-[82px] right-4 left-4">
        <p className="text-[22px] leading-[26px] font-black" style={N}>
          Tu colchón
        </p>
        <motion.span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-[#FFF6E2] px-2.5 py-1 text-[12px] font-bold text-[#6B4A0A]" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Moneda className="size-4" />
          Ayer te sobraron S/ 4
        </motion.span>
      </div>
      <div className="absolute top-[150px] left-1/2 h-[250px] w-[180px] -translate-x-1/2">
        {[0, 1, 2].map((k) => (
          <motion.span key={k} className="absolute left-1/2 z-10" style={{ marginLeft: (k - 1) * 26 - 14 }} initial={{ y: -40, opacity: 0, rotate: 0 }} animate={{ y: [-40, 120, 112], opacity: [0, 1, 0], rotate: [0, 180, 200] }} transition={{ delay: 0.55 + k * 0.22, duration: 0.8, times: [0, 0.8, 1], ease: "easeIn" }}>
            <Moneda className="size-7" />
          </motion.span>
        ))}
        <svg viewBox="0 0 180 250" className="absolute inset-0 size-full" aria-hidden="true">
          <defs>
            <clipPath id="frasco-motion">
              <path d="M40 60h100v14c12 8 16 18 16 30v110a22 22 0 0 1-22 22H46a22 22 0 0 1-22-22V104c0-12 4-22 16-30z" />
            </clipPath>
            <linearGradient id="oro-frasco" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FFD36B" />
              <stop offset="1" stopColor="#E09A1E" />
            </linearGradient>
          </defs>
          <rect x="48" y="34" width="84" height="26" rx="9" fill="#5FE3DC" />
          <g clipPath="url(#frasco-motion)">
            <rect x="0" y="0" width="180" height="250" fill="#E3F3F1" />
            <motion.rect x="0" width="180" height="250" fill="url(#oro-frasco)" initial={{ y: 236 - 176 * 0.2 }} animate={{ y: 236 - 176 * 0.32 }} transition={{ delay: 1.2, type: "spring", stiffness: 60, damping: 14 }} />
          </g>
          <path d="M40 60h100v14c12 8 16 18 16 30v110a22 22 0 0 1-22 22H46a22 22 0 0 1-22-22V104c0-12 4-22 16-30z" fill="none" stroke="#2FB7B0" strokeWidth="4" />
          <path d="M44 110c0-10 4-18 12-22" fill="none" stroke="#FFFFFF" strokeOpacity=".7" strokeWidth="5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="absolute right-4 bottom-6 left-4 rounded-[18px] bg-[#FFFFFF] p-3.5 shadow-[0_10px_24px_rgba(14,91,87,.10)]">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] font-bold text-[#4E6470]">Colchón</span>
          <span className="text-[20px] font-black" style={N}>
            <Contador valor={96} desde={60} prefijo="S/ " retraso={1.2} />
            <span className="text-[12px] font-bold text-[#4E6470]"> de S/ 300</span>
          </span>
        </div>
        <span className="mt-2 block h-2.5 overflow-hidden rounded-full bg-[#DCF1EE]">
          <motion.span className="block h-full rounded-full bg-[#F2B341]" initial={{ width: "20%" }} animate={{ width: "32%" }} transition={{ delay: 1.2, type: "spring", stiffness: 80, damping: 16 }} />
        </span>
      </div>
    </div>
  );
}

/** 4 · Revisa antes de pagar */
function VidaRevisa() {
  return (
    <div className="absolute inset-0 bg-[#F3FAF8]">
      <Cabecera app="vida" />
      <div className="absolute top-[82px] right-4 left-4">
        <p className="text-[22px] leading-[26px] font-black" style={N}>
          Protégete
        </p>
        <p className="mt-0.5 text-[12px] text-[#4E6470]">Pega el mensaje que te llegó</p>
        <motion.div className="relative mt-3 overflow-hidden rounded-[18px] rounded-tl-[6px] bg-[#FFFFFF] p-3 text-[13px] leading-[18px] shadow-[0_8px_20px_rgba(14,91,87,.10)]" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15, ...RESORTE }}>
          <span className="block text-[10px] font-bold text-[#4E6470]">+51 9•• ••• •••</span>
          Hola, te deposité S/ 200 por error. Devuélvelo hoy a este otro número, porfa.
          <motion.span className="pointer-events-none absolute inset-x-0 h-10 bg-gradient-to-b from-transparent via-[#5FE3DC]/55 to-transparent" initial={{ top: "-40%" }} animate={{ top: ["-40%", "110%"] }} transition={{ delay: 0.8, duration: 1, ease: "easeInOut" }} />
        </motion.div>
      </div>
      <motion.div className="absolute top-[262px] right-4 left-4 rounded-[20px] bg-[#FFFFFF] p-3.5 shadow-[0_16px_34px_rgba(194,65,45,.18)] ring-2 ring-[#C2412D]/40" initial={{ opacity: 0, scale: 0.85, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 1.8, ...RESORTE }}>
        <span className="flex items-center gap-2">
          <CaraLeonVida cara="serio" tamano={34} />
          <span>
            <span className="block text-[16px] font-black text-[#C2412D]" style={N}>
              Riesgo alto
            </span>
            <span className="block text-[11px] font-bold text-[#4E6470]">No pagues todavía</span>
          </span>
        </span>
        <span className="mt-2.5 block h-2 overflow-hidden rounded-full bg-[#F4E1DD]">
          <motion.span className="block h-full rounded-full bg-[#C2412D]" initial={{ width: "0%" }} animate={{ width: "86%" }} transition={{ delay: 2.0, type: "spring", stiffness: 90, damping: 18 }} />
        </span>
        <ul className="mt-2.5 flex flex-col gap-1.5 text-[12px]">
          {["Te apura para que actúes hoy", "Pide devolver a otro número", "Revisa tu cuenta antes de mover nada"].map((x, k) => (
            <motion.li key={x} className="flex items-start gap-1.5" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2.3 + k * 0.25 }}>
              <span className="mt-1 size-2 shrink-0 rounded-full bg-[#C2412D]" />
              {x}
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}

/* =====================================================================================
   Línea de tiempo y reproductor
   ===================================================================================== */

type EscenaMotion = { titulo: string; dur: number; Pantalla: () => ReactNode };

export const ESCENAS: Record<AppMotion, EscenaMotion[]> = {
  student: [
    { titulo: "Sube tu PDF", dur: 3600, Pantalla: StudentSube },
    { titulo: "Se vuelve un minijuego", dur: 3400, Pantalla: StudentMinijuego },
    { titulo: "Juega de distintas formas", dur: 4800, Pantalla: StudentFormas },
    { titulo: "Gana y vuelve mañana", dur: 3600, Pantalla: StudentGana },
  ],
  vida: [
    { titulo: "Anota en segundos", dur: 3600, Pantalla: VidaAnota },
    { titulo: "Mira cuánto te queda hoy", dur: 3400, Pantalla: VidaDia },
    { titulo: "Ahorra lo que sobra", dur: 3200, Pantalla: VidaAhorra },
    { titulo: "Revisa antes de pagar", dur: 4000, Pantalla: VidaRevisa },
  ],
};

/** Si un agente de motion dejó un video en public/motion/<app>.mp4, se usa ese. */
function useVideo(app: AppMotion) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let vivo = true;
    fetch(`/motion/${app}.mp4`, { method: "HEAD" })
      .then((r) => {
        if (vivo && r.ok && (r.headers.get("content-type") ?? "").startsWith("video")) setSrc(`/motion/${app}.mp4`);
      })
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, [app]);
  return src;
}

/**
 * Celular con el motion graphic y, debajo, los pasos (barras tipo historias) con el nombre del paso actual.
 * Pensado para ir sobre un escenario oscuro o de color (textos en blanco).
 */
/**
 * Celular con cuerpo en 3D (bordes laterales y tapa reales con preserve-3d) y un reflejo que recorre el vidrio
 * en cada cambio de paso. La inclinación la decide quien lo usa con las variables CSS --rx, --ry y --brillo
 * (la landing v6 las cambia con el scroll). Sin variables queda de frente.
 */
function Telefono3D({ ancho, paso, children }: { ancho: number; paso: number; children: ReactNode }) {
  const grosor = Math.round(ancho * 0.045);
  const borde = { background: "linear-gradient(180deg,#4A5290 0%,#1A1F48 18%,#0B0E26 50%,#1A1F48 82%,#4A5290 100%)" };
  return (
    <div style={{ perspective: 1100 }}>
      <div
        className="relative"
        style={{ transformStyle: "preserve-3d", transform: "rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))", transition: "transform .35s cubic-bezier(.22,1,.36,1)", willChange: "transform" }}
      >
        <span className="absolute top-[4%] bottom-[4%] left-0 block" style={{ ...borde, width: grosor, transformOrigin: "left center", transform: "rotateY(90deg)" }} />
        <span className="absolute top-[4%] right-0 bottom-[4%] block" style={{ ...borde, width: grosor, transformOrigin: "right center", transform: "rotateY(-90deg)" }} />
        <span className="absolute inset-0 block rounded-[17%/7.9%]" style={{ background: "linear-gradient(145deg,#2C3266,#0A0D24)", transform: `translateZ(-${grosor}px)`, boxShadow: "0 50px 90px -30px rgba(0,0,0,.8)" }} />
        <TelefonoPro ancho={ancho}>{children}</TelefonoPro>
        {/* Reflejo que acompaña la inclinación y barre el vidrio al cambiar de paso. */}
        <span
          className="pointer-events-none absolute inset-0 block rounded-[17%/7.9%]"
          style={{ background: "linear-gradient(112deg, transparent 32%, rgba(255,255,255,.16) 44%, rgba(255,255,255,.05) 52%, transparent 62%)", backgroundSize: "260% 100%", backgroundPosition: "calc(var(--brillo, 50) * 1%) 0", mixBlendMode: "screen", transform: "translateZ(1px)" }}
        />
        <motion.span
          key={paso}
          className="pointer-events-none absolute inset-0 block rounded-[17%/7.9%]"
          style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,.28) 50%, transparent 60%)", backgroundSize: "300% 100%", mixBlendMode: "screen", transform: "translateZ(1px)" }}
          initial={{ backgroundPosition: "110% 0", opacity: 1 }}
          animate={{ backgroundPosition: "-10% 0", opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export function MotionApp({ app, ancho, grande = false, tresD = false }: { app: AppMotion; ancho: number; grande?: boolean; tresD?: boolean }) {
  const escenas = ESCENAS[app];
  const quieto = !!useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { amount: 0.35 });
  const [pausa, setPausa] = useState(false);
  const [i, setI] = useState(0);
  const [vuelta, setVuelta] = useState(0);
  const video = useVideo(app);
  const corre = visible && !pausa && !quieto && !video;
  useEffect(() => {
    if (!corre) return;
    const t = window.setTimeout(() => {
      if (i + 1 >= escenas.length) {
        setVuelta((v) => v + 1);
        setI(0);
      } else setI(i + 1);
    }, escenas[i].dur);
    return () => window.clearTimeout(t);
  }, [i, corre, escenas]);
  const ir = (k: number) => {
    setI(k);
    setVuelta((v) => v + 1);
  };
  const Pantalla = escenas[i].Pantalla;
  return (
    <MotionConfig reducedMotion="user">
      <div ref={ref} className="flex flex-col items-center">
        <div aria-hidden="true">
          {(() => {
            const contenido = video ? (
              <video src={video} className="absolute inset-0 size-full object-cover" autoPlay muted loop playsInline />
            ) : (
              // Cambio de paso como una app de verdad: la pantalla nueva entra desde la derecha y la anterior se va hacia atrás.
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={`${vuelta}-${i}`}
                  className="absolute inset-0 bg-[#F7F8FC]"
                  initial={{ opacity: 0, x: 46, scale: 1 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -30, scale: 0.95 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Pantalla />
                </motion.div>
              </AnimatePresence>
            );
            return tresD ? (
              <Telefono3D ancho={ancho} paso={vuelta * 10 + i}>
                {contenido}
              </Telefono3D>
            ) : (
              <TelefonoPro ancho={ancho}>{contenido}</TelefonoPro>
            );
          })()}
        </div>
        {!video && (
          <div className={`mt-10 w-full ${grande ? "max-w-[360px]" : "max-w-[300px]"}`}>
            <div className="flex gap-1.5" role="tablist" aria-label={`Pasos de ${app === "student" ? "Auxi Student" : "Auxi Vida"}`}>
              {escenas.map((e, k) => (
                <button key={e.titulo} type="button" role="tab" aria-selected={k === i} aria-label={`Paso ${k + 1}: ${e.titulo}`} onClick={() => ir(k)} className="flex min-h-11 flex-1 items-center">
                  <span className="block h-1 w-full overflow-hidden rounded-full bg-white/20">
                    {k < i && <span className="block h-full w-full rounded-full bg-white" />}
                    {k === i && (corre ? <motion.span key={`a${vuelta}-${i}`} className="block h-full rounded-full bg-white" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: e.dur / 1000, ease: "linear" }} /> : <span className="block h-full w-full rounded-full bg-white" />)}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex min-h-11 items-center justify-between gap-3">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p key={i} className="text-[18px] leading-[22px] font-black text-white" style={N} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }} aria-live="polite">
                  <span className="mr-1.5 text-white/55">{i + 1}.</span>
                  {escenas[i].titulo}
                </motion.p>
              </AnimatePresence>
              {!quieto && (
                <button type="button" onClick={() => setPausa(!pausa)} aria-pressed={pausa} aria-label={pausa ? "Seguir la animación" : "Pausar la animación"} className="grid size-11 shrink-0 place-items-center rounded-full text-white hover:bg-white/10">
                  <svg viewBox="0 0 20 20" className="size-4" aria-hidden="true">
                    {pausa ? <path d="M6 4l10 6-10 6z" fill="currentColor" /> : <path d="M6 4h3v12H6zM11 4h3v12h-3z" fill="currentColor" />}
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </MotionConfig>
  );
}

/** Pestaña «Motion» del boceto: los dos motion graphics solos, grandes, para revisarlos antes de usarlos en la landing. */
export function PanelMotion({ celular }: { celular: boolean }) {
  return (
    <div className="relative isolate overflow-hidden bg-[#070A22] px-5 py-14 text-white @4xl:px-12">
      <div className="absolute inset-0 -z-10 opacity-60" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.08) 1px, transparent 1px)", backgroundSize: "26px 26px" }} aria-hidden="true" />
      <h1 className="h2 text-center">Motion graphics: el camino de cada app</h1>
      <p className="mx-auto mt-3 max-w-[60ch] text-center text-[16px] text-white/70">Cuatro pasos por app, unos 15 segundos en bucle. Toca una barra para ir a ese paso. Esto mismo va dentro del celular de la landing.</p>
      <div className="mt-12 grid gap-14 @4xl:grid-cols-2">
        {(["student", "vida"] as AppMotion[]).map((a) => (
          <div key={a} className="relative flex flex-col items-center rounded-[36px] px-4 py-12" style={{ background: a === "student" ? "radial-gradient(110% 90% at 50% 0%, #3946F2 0%, #2430D9 40%, #10168A 100%)" : "radial-gradient(110% 90% at 50% 0%, #14857F 0%, #0E5B57 45%, #052B29 100%)" }}>
            <MotionApp app={a} ancho={celular ? 250 : 300} grande />
          </div>
        ))}
      </div>
    </div>
  );
}
