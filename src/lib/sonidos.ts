import { obtenerAjustes } from "./ajustes";

/**
 * Sonidos cortos generados con Web Audio API (no hay archivos que descargar).
 * En iPhone el audio solo arranca después de un toque, y el interruptor de
 * silencio del teléfono los apaga.
 */

let ctx: AudioContext | null = null;
let maestro: GainNode | null = null;
const VOLUMEN = 0.22;

function contexto(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    maestro = ctx.createGain();
    maestro.gain.value = VOLUMEN;
    maestro.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

type Nota = {
  frecuencia: number;
  hasta?: number; // frecuencia final (deslizamiento)
  inicio?: number; // segundos desde ahora
  duracion: number;
  tipo?: OscillatorType;
  volumen?: number;
};

function nota(c: AudioContext, n: Nota) {
  const t0 = c.currentTime + (n.inicio ?? 0);
  const osc = c.createOscillator();
  const env = c.createGain();
  osc.type = n.tipo ?? "triangle";
  osc.frequency.setValueAtTime(n.frecuencia, t0);
  if (n.hasta) osc.frequency.exponentialRampToValueAtTime(n.hasta, t0 + n.duracion);
  const v = n.volumen ?? 1;
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.exponentialRampToValueAtTime(v, t0 + 0.008);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + n.duracion);
  osc.connect(env).connect(maestro!);
  osc.start(t0);
  osc.stop(t0 + n.duracion + 0.02);
}

function ruido(c: AudioContext, inicio: number, duracion: number, volumen: number) {
  const largo = Math.floor(c.sampleRate * duracion);
  const buffer = c.createBuffer(1, largo, c.sampleRate);
  const datos = buffer.getChannelData(0);
  for (let i = 0; i < largo; i++) datos[i] = (Math.random() * 2 - 1) * (1 - i / largo);
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filtro = c.createBiquadFilter();
  filtro.type = "bandpass";
  filtro.frequency.value = 1800;
  const env = c.createGain();
  env.gain.value = volumen;
  src.connect(filtro).connect(env).connect(maestro!);
  src.start(c.currentTime + inicio);
}

const semitono = (base: number, pasos: number) => base * Math.pow(2, pasos / 12);

function tocar(fn: (c: AudioContext) => void) {
  if (!obtenerAjustes().sonido) return;
  const c = contexto();
  if (c) fn(c);
}

export const sonidos = {
  /** Pop suave al tocar un botón u opción. */
  toque: () =>
    tocar((c) => nota(c, { frecuencia: 620, hasta: 380, duracion: 0.07, tipo: "sine", volumen: 0.7 })),

  /** Dos notas que suben. */
  acierto: () =>
    tocar((c) => {
      nota(c, { frecuencia: 659, duracion: 0.11 });
      nota(c, { frecuencia: 988, inicio: 0.09, duracion: 0.18 });
    }),

  /** La misma idea del acierto, un tono más arriba por cada acierto seguido. */
  combo: (racha: number) =>
    tocar((c) => {
      const pasos = Math.min(racha - 1, 8) * 2;
      nota(c, { frecuencia: semitono(659, pasos), duracion: 0.1 });
      nota(c, { frecuencia: semitono(988, pasos), inicio: 0.08, duracion: 0.2 });
    }),

  /** Nota grave y corta. */
  error: () =>
    tocar((c) => {
      nota(c, { frecuencia: 196, hasta: 147, duracion: 0.24, tipo: "triangle", volumen: 0.9 });
      nota(c, { frecuencia: 98, duracion: 0.2, tipo: "sine", volumen: 0.5 });
    }),

  /** Fanfarria de 1 segundo. */
  leccionCompleta: () =>
    tocar((c) => {
      [523, 659, 784].forEach((f, i) => nota(c, { frecuencia: f, inicio: i * 0.11, duracion: 0.16 }));
      [523, 659, 784, 1047].forEach((f) =>
        nota(c, { frecuencia: f, inicio: 0.36, duracion: 0.62, volumen: 0.45 }),
      );
    }),

  /** Redoble corto y destello. */
  cofre: () =>
    tocar((c) => {
      for (let i = 0; i < 7; i++) ruido(c, i * 0.045, 0.04, 0.5 + i * 0.07);
      nota(c, { frecuencia: 1568, inicio: 0.34, duracion: 0.14, tipo: "sine", volumen: 0.6 });
      nota(c, { frecuencia: 2093, inicio: 0.4, duracion: 0.1, tipo: "sine", volumen: 0.5 });
    }),
};

export type NombreSonido = keyof typeof sonidos;
