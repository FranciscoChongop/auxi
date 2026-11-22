import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useAviso } from "../components/Aviso";
import { Boton } from "../components/Boton";
import { Leon } from "../components/Leon";
import { Pantalla } from "../components/Navegacion";
import { cursoDe, todasLasTarjetas } from "../lib/curso";
import { actualizar, obtener } from "../lib/estado";
import { sonidos } from "../lib/sonidos";
import { vibrar } from "../lib/vibrar";

const MODOS = [
  { id: "25", nombre: "25 + 5", foco: 25 * 60, descanso: 5 * 60 },
  { id: "15", nombre: "15 + 3", foco: 15 * 60, descanso: 3 * 60 },
  { id: "1", nombre: "Probar 1 min", foco: 60, descanso: 60 },
];

/** Mezcla dos colores hex de la paleta según el avance (0 a 1). */
function mezclarColor(a: string, b: string, t: number) {
  const n = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [n(a), n(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(",")})`;
}

function DibujoTomate({ madurez }: { madurez: number }) {
  const color = mezclarColor("#5FE3DC", "#C2412D", madurez);
  return (
    <svg viewBox="0 0 120 120" className="w-48" aria-hidden="true">
      <motion.circle cx="60" cy="66" r={38 + madurez * 8} fill={color} stroke="rgba(20,26,77,0.15)" strokeWidth="3" />
      <ellipse cx="46" cy="52" rx="8" ry="5" fill="white" opacity="0.35" />
      <path d="M60 30c-6-8-16-8-20-4 8 0 12 4 14 8M60 30c6-8 16-8 20-4-8 0-12 4-14 8M60 30v-10" fill="none" stroke="#2FB7B0" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

function formato(s: number) {
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

/* ---------- Minijuego del descanso: revienta burbujas ---------- */

function Burbujas({ palabras, alTerminar }: { palabras: string[]; alTerminar: (n: number) => void }) {
  const [burbujas, setBurbujas] = useState<{ id: number; texto: string; x: number; dur: number }[]>([]);
  const [reventadas, setReventadas] = useState(0);
  const [quedan, setQuedan] = useState(60);
  const id = useRef(0);
  const fin = useRef(Date.now() + 60_000);

  useEffect(() => {
    const crear = setInterval(() => {
      const texto = palabras[Math.floor(Math.random() * palabras.length)];
      setBurbujas((b) => [...b.slice(-10), { id: ++id.current, texto, x: 6 + Math.random() * 64, dur: 4 + Math.random() * 2.5 }]);
    }, 750);
    const reloj = setInterval(() => {
      const s = Math.max(0, Math.ceil((fin.current - Date.now()) / 1000));
      setQuedan(s);
      if (s === 0) clearInterval(reloj);
    }, 250);
    return () => {
      clearInterval(crear);
      clearInterval(reloj);
    };
  }, [palabras]);

  useEffect(() => {
    if (quedan === 0) alTerminar(reventadas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quedan]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between font-extrabold">
        <span>Revienta las palabras clave</span>
        <span className="numeros text-brand">{quedan} s</span>
      </div>
      <div className="relative h-[52dvh] overflow-hidden rounded-tarjeta bg-surface">
        <AnimatePresence>
          {burbujas.map((b) => (
            <motion.button
              key={b.id}
              type="button"
              initial={{ y: "52dvh", opacity: 0 }}
              animate={{ y: -90, opacity: 1 }}
              exit={{ scale: 1.6, opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: b.dur, ease: "linear" }}
              onAnimationComplete={() => setBurbujas((x) => x.filter((y) => y.id !== b.id))}
              onPointerDown={() => {
                sonidos.toque();
                vibrar("toque");
                setReventadas((n) => n + 1);
                setBurbujas((x) => x.filter((y) => y.id !== b.id));
              }}
              style={{ left: `${b.x}%` }}
              className="absolute top-0 grid min-h-16 min-w-16 cursor-pointer place-items-center rounded-full border-2 border-white/70 bg-card/80 px-3 text-[14px] font-extrabold text-brand shadow-[inset_0_-6px_0_rgba(36,48,217,0.08)]"
            >
              {b.texto}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
      <p className="numeros text-center font-bold text-text-soft">Reventadas: {reventadas}</p>
    </div>
  );
}

/* ---------- Pantalla ---------- */

export default function Tomate() {
  const aviso = useAviso();
  const [modo, setModo] = useState(MODOS[0]);
  const [fase, setFase] = useState<"foco" | "descanso" | "juego">("foco");
  const [corriendo, setCorriendo] = useState(false);
  const [restante, setRestante] = useState(MODOS[0].foco);
  const fin = useRef(0);
  const [palabras] = useState(() => todasLasTarjetas(cursoDe(obtener())).map((t) => t.frente.split(" (")[0]));

  const total = fase === "foco" ? modo.foco : modo.descanso;

  useEffect(() => {
    if (!corriendo) return;
    fin.current = Date.now() + restante * 1000;
    const t = setInterval(() => {
      const s = Math.max(0, (fin.current - Date.now()) / 1000);
      setRestante(s);
      if (s <= 0) {
        clearInterval(t);
        setCorriendo(false);
        sonidos.leccionCompleta();
        vibrar("acierto");
        if (fase === "foco") {
          actualizar((e) => ({ totales: { ...e.totales, minutos: e.totales.minutos + Math.round(modo.foco / 60) } }));
          aviso(`Tu tomate está listo, toma ${Math.round(modo.descanso / 60)} minutos.`, "exito");
          setFase("juego");
        } else {
          aviso("Descanso terminado. ¿Otro tomate?", "info");
          setFase("foco");
          setRestante(modo.foco);
        }
      }
    }, 250);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [corriendo]);

  function cambiarModo(m: (typeof MODOS)[number]) {
    setModo(m);
    setCorriendo(false);
    setFase("foco");
    setRestante(m.foco);
  }

  if (fase === "juego") {
    return (
      <Pantalla titulo="Descanso" atras="/studio/metodos" conBarra={false}>
        <Burbujas
          palabras={palabras}
          alTerminar={(n) => {
            aviso(`Reventaste ${n} burbujas. ¡Bien!`, "premio");
            if (modo.descanso <= 60) {
              setFase("foco");
              setRestante(modo.foco);
            } else {
              setFase("descanso");
              setRestante(modo.descanso - 60);
              setCorriendo(true);
            }
          }}
        />
        <Boton variante="secundario" onClick={() => { setFase("descanso"); setRestante(modo.descanso); }}>
          Solo descansar
        </Boton>
      </Pantalla>
    );
  }

  const madurez = fase === "foco" ? 1 - restante / total : 1;
  return (
    <Pantalla titulo="El tomate" atras="/studio/metodos" conBarra={false}>
      <div className="flex gap-2" role="radiogroup" aria-label="Duración">
        {MODOS.map((m) => (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={m.id === modo.id}
            onClick={() => cambiarModo(m)}
            className={`h-11 flex-1 cursor-pointer rounded-full border-2 text-[15px] font-extrabold ${m.id === modo.id ? "border-brand bg-surface text-brand" : "border-surface bg-card text-text-soft"}`}
          >
            {m.nombre}
          </button>
        ))}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
        {fase === "foco" && corriendo ? <Leon pose="concentrado" alto={150} /> : <DibujoTomate madurez={madurez} />}
        <p className="numeros text-[56px] leading-none font-black">{formato(restante)}</p>
        <p className="text-text-soft">
          {fase === "descanso" ? "Descanso. Estira, toma agua." : corriendo ? "Foco. León te acompaña en silencio." : "Tu tomate madura mientras estudias."}
        </p>
        {fase === "foco" && corriendo && (
          <div className="mt-2 w-full">
            <DibujoTomateMini madurez={madurez} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <Boton variante={corriendo ? "secundario" : "principal"} onClick={() => setCorriendo(!corriendo)}>
          {corriendo ? "Pausar" : restante < total ? "Seguir" : fase === "foco" ? "Empezar tomate" : "Empezar descanso"}
        </Boton>
        {restante < total && !corriendo && (
          <Boton variante="secundario" onClick={() => cambiarModo(modo)}>
            Reiniciar
          </Boton>
        )}
      </div>
    </Pantalla>
  );
}

function DibujoTomateMini({ madurez }: { madurez: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface">
        <motion.div
          className="h-full rounded-full"
          animate={{ width: `${madurez * 100}%` }}
          style={{ background: mezclarColor("#5FE3DC", "#C2412D", madurez) }}
        />
      </div>
      <span className="numeros text-ayuda font-bold text-text-soft">{Math.round(madurez * 100)} %</span>
    </div>
  );
}
