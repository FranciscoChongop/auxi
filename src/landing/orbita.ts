/**
 * Geometría compartida de la órbita del ecosistema (héroe y cierre de la landing v6):
 * dónde van la mano digital, la mano humana, las órbitas y los cuadritos según el tamaño del escenario.
 */
import type { Geometria } from "./particulas";

/* ---------- Geometría: dónde va cada cosa según el tamaño del escenario ---------- */
export function geometria(W: number, H: number, celular: boolean, aspectoMano: number) {
  const ASP_HUMANA = 1774 / 879;
  const PUNTA_HUMANA = [0.15, 0.345]; // punta del índice dentro de la foto (fracción)
  const PUNTA_DIGITAL = [0.955, 0.1]; // punta del índice dentro de la plantilla
  if (celular) {
    const k = Math.min(1, H / 760);
    const mw = W * 0.64 * k;
    const mh = mw / aspectoMano;
    const punta: [number, number] = [W * 0.335, H * 0.75];
    const hw = W * 0.78 * k;
    const g: Geometria = {
      mano: { x: punta[0] - PUNTA_DIGITAL[0] * mw, y: punta[1] - PUNTA_DIGITAL[1] * mh, w: mw, h: mh },
      centro0: [W * 0.5, punta[1] - 26 * k],
      centro1: [W * 0.5, H * 0.6],
      escala0: 1 * k,
      escala1: 1.12,
      anillos: [
        { rx: W * 0.36, ry: 44, giro: -0.2 },
        { rx: W * 0.29, ry: 58, giro: 0.34 },
      ],
    };
    return { g, humana: { left: W * 0.665 - PUNTA_HUMANA[0] * hw, top: punta[1] - PUNTA_HUMANA[1] * (hw / ASP_HUMANA), width: hw }, nodo: 46 };
  }
  const k = Math.min(1, H / 820);
  const mw = W * 0.42 * k;
  const mh = mw / aspectoMano;
  const punta: [number, number] = [W * 0.37, H - mh * 0.6];
  const hw = W * 0.5 * k;
  const g: Geometria = {
    mano: { x: punta[0] - PUNTA_DIGITAL[0] * mw, y: punta[1] - PUNTA_DIGITAL[1] * mh, w: mw, h: mh },
    centro0: [W * 0.5, punta[1] - 16 * k],
    centro1: [W * 0.5, H * 0.58],
    escala0: 1 * k,
    escala1: 1.3,
    anillos: [
      { rx: W * 0.205, ry: 78, giro: -0.19 },
      { rx: W * 0.17, ry: 104, giro: 0.33 },
    ],
  };
  return { g, humana: { left: W * 0.63 - PUNTA_HUMANA[0] * hw, top: punta[1] - PUNTA_HUMANA[1] * (hw / ASP_HUMANA), width: hw }, nodo: 64 };
}

/** Nodos de la órbita: anillo (0 = A, 1 = B) y ángulo. Los «f» son herramientas en exploración (borrosas, sin nombre). */
export const NODOS: { id: "student" | "vida" | "f1" | "f2" | "f3" | "f4"; anillo: 0 | 1; theta: number }[] = [
  { id: "student", anillo: 0, theta: -2.25 },
  { id: "vida", anillo: 1, theta: -1.12 },
  { id: "f1", anillo: 1, theta: -1.85 },
  { id: "f2", anillo: 1, theta: 1.72 },
  { id: "f3", anillo: 0, theta: 2.5 },
  { id: "f4", anillo: 0, theta: 1.25 },
];

export const suave = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

