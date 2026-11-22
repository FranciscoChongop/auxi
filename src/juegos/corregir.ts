import type { Ejercicio } from "../data/tipos";

export function mezclar<T>(lista: T[]): T[] {
  const a = lista.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Quita tildes, mayúsculas, signos y espacios de más. */
export function normalizar(t: string) {
  return t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9ñ₀-₉]+/g, " ")
    .trim();
}

function distancia(a: string, b: string) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

/** Acepta la respuesta escrita si coincide o tiene un error de tipeo (en palabras largas). */
export function escrituraAceptada(texto: string, aceptadas: string[]) {
  const t = normalizar(texto);
  if (!t) return { ok: false, casi: false };
  for (const a of aceptadas) {
    const n = normalizar(a);
    if (t === n) return { ok: true, casi: false };
    if (n.length >= 6 && distancia(t, n) <= 1) return { ok: true, casi: true };
  }
  return { ok: false, casi: false };
}

/** Valor que entrega cada juego. */
export type Valor =
  | { tipo: "opcion"; indice: number }
  | { tipo: "vf"; valor: boolean }
  | { tipo: "completar"; palabra: string }
  | { tipo: "escribir"; texto: string }
  | { tipo: "ordenar"; orden: number[] }
  | { tipo: "clasificar"; grupos: (0 | 1)[] }
  | { tipo: "parejas"; errores: number };

export function esCorrecto(ej: Ejercicio, v: Valor): boolean {
  switch (ej.tipo) {
    case "opcion":
      return v.tipo === "opcion" && v.indice === ej.correcta;
    case "vf":
      return v.tipo === "vf" && v.valor === ej.respuesta;
    case "completar":
      return v.tipo === "completar" && normalizar(v.palabra) === normalizar(ej.respuesta);
    case "escribir":
      return v.tipo === "escribir" && escrituraAceptada(v.texto, ej.respuestas).ok;
    case "ordenar":
      return v.tipo === "ordenar" && v.orden.every((x, i) => x === i) && v.orden.length === ej.pasos.length;
    case "clasificar":
      return v.tipo === "clasificar" && ej.items.every((it, i) => v.grupos[i] === it.grupo);
    case "parejas":
      return v.tipo === "parejas" && v.errores <= 1;
  }
}

/** La respuesta correcta en palabras, para mostrarla solo si la persona la pide. */
export function respuestaEnTexto(ej: Ejercicio): string {
  switch (ej.tipo) {
    case "opcion":
      return ej.opciones[ej.correcta];
    case "vf":
      return ej.respuesta ? "Verdadero" : "Falso";
    case "completar":
      return ej.frase.replace("___", ej.respuesta);
    case "escribir":
      return ej.respuestas[0];
    case "ordenar":
      return ej.pasos.join(" → ");
    case "clasificar":
      return ej.grupos
        .map((g, gi) => `${g}: ${ej.items.filter((i) => i.grupo === gi).map((i) => i.texto).join(", ")}`)
        .join(" · ");
    case "parejas":
      return ej.pares.map(([a, b]) => `${a} = ${b}`).join(" · ");
  }
}

/** Pista de respaldo si el ejercicio no trae una. Nunca dice la respuesta. */
export function pistaDe(ej: Ejercicio): string {
  if (ej.pista) return ej.pista;
  switch (ej.tipo) {
    case "opcion":
      return "Te quité una opción que no es.";
    case "escribir":
      return `Empieza con «${ej.respuestas[0].slice(0, 2)}».`;
    case "completar":
      return `Empieza con «${ej.respuesta.slice(0, 1)}».`;
    case "ordenar":
      return `El primer paso es: ${ej.pasos[0]}.`;
    default:
      return "Lee otra vez las tarjetas de la lección.";
  }
}
