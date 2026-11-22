/** Forma de un curso. Es la misma que generará la IA en la Fase 4. */

type Base = {
  /** Por qué es así, en una frase. Se muestra después de responder. */
  explicacion: string;
  /** Ayuda que NO revela la respuesta. Se ofrece antes de la respuesta. */
  pista?: string;
};

export type EjOpcion = Base & { tipo: "opcion"; pregunta: string; opciones: string[]; correcta: number };
export type EjVF = Base & { tipo: "vf"; afirmacion: string; respuesta: boolean };
export type EjCompletar = Base & { tipo: "completar"; frase: string; respuesta: string; opciones: string[] };
export type EjParejas = Base & { tipo: "parejas"; pares: [string, string][] };
export type EjOrdenar = Base & { tipo: "ordenar"; instruccion: string; pasos: string[] };
export type EjEscribir = Base & { tipo: "escribir"; pregunta: string; respuestas: string[] };
export type EjClasificar = Base & {
  tipo: "clasificar";
  instruccion: string;
  grupos: [string, string];
  items: { texto: string; grupo: 0 | 1 }[];
};

export type Ejercicio = EjOpcion | EjVF | EjCompletar | EjParejas | EjOrdenar | EjEscribir | EjClasificar;
export type TipoEjercicio = Ejercicio["tipo"];

export type TarjetaEstudio = { frente: string; reverso: string };

export type Leccion = { titulo: string; tarjetas: TarjetaEstudio[]; ejercicios: Ejercicio[] };
export type Unidad = { titulo: string; resumen: string; lecciones: Leccion[] };
export type Curso = { id: string; titulo: string; materia: string; unidades: Unidad[] };

export const NOMBRE_TIPO: Record<TipoEjercicio, string> = {
  opcion: "Elige la respuesta",
  vf: "¿Verdadero o falso?",
  completar: "Completa la frase",
  parejas: "Une las parejas",
  ordenar: "Ordena los pasos",
  escribir: "Escribe la respuesta",
  clasificar: "Clasifica",
};
