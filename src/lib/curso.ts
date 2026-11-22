import { CURSOS, FOTOSINTESIS } from "../data/cursos";
import type { Curso, Ejercicio, TarjetaEstudio } from "../data/tipos";
import { mezclar } from "../juegos/corregir";
import type { Estado, Resultado } from "./estado";

export type Nodo = {
  u: number;
  l: number | "t";
  clave: string;
  titulo: string;
  prueba: boolean;
  hecho: boolean;
  abierto: boolean;
  resultado?: Resultado;
};

export function cursoDe(e: Estado): Curso {
  return (e.cursoId && CURSOS[e.cursoId]) || FOTOSINTESIS;
}

/** Lecciones y pruebas de unidad en orden. Cada una abre la siguiente. */
export function nodos(curso: Curso, e: Estado): Nodo[] {
  const prog = e.progreso[curso.id] ?? {};
  const lista: Nodo[] = [];
  curso.unidades.forEach((u, ui) => {
    u.lecciones.forEach((l, li) =>
      lista.push({ u: ui, l: li, clave: `${ui}-${li}`, titulo: l.titulo, prueba: false, hecho: false, abierto: false }),
    );
    lista.push({ u: ui, l: "t", clave: `${ui}-t`, titulo: "Prueba de la unidad", prueba: true, hecho: false, abierto: false });
  });
  let anterior = true;
  for (const n of lista) {
    n.resultado = prog[n.clave];
    n.hecho = !!n.resultado;
    n.abierto = anterior;
    anterior = n.hecho;
  }
  return lista;
}

export function avance(curso: Curso, e: Estado) {
  const ns = nodos(curso, e);
  return ns.filter((n) => n.hecho).length / ns.length;
}

export type Paso =
  | { tipo: "tarjeta"; tarjeta: TarjetaEstudio; id: string }
  | { tipo: "ej"; ej: Ejercicio; ref: string; id: string; reintento?: boolean };

function ejercicio(curso: Curso, ref: string): Ejercicio | undefined {
  const [u, l, i] = ref.split(".").map(Number);
  return curso.unidades[u]?.lecciones[l]?.ejercicios[i];
}

/** Arma la fila de pasos de una lección, una prueba o un repaso. */
export function armarCola(curso: Curso, clave: string, e: Estado): Paso[] {
  if (clave === "repaso") {
    let refs = mezclar(e.errores[curso.id] ?? []).slice(0, 8);
    if (refs.length < 5) {
      const hechos = nodos(curso, e).filter((n) => n.hecho && !n.prueba);
      const extra = hechos.flatMap((n) =>
        curso.unidades[n.u].lecciones[n.l as number].ejercicios.map((_, i) => `${n.u}.${n.l}.${i}`),
      );
      refs = [...refs, ...mezclar(extra.filter((r) => !refs.includes(r)))].slice(0, 6);
    }
    return refs.flatMap((ref) => {
      const ej = ejercicio(curso, ref);
      return ej ? [{ tipo: "ej" as const, ej, ref, id: ref }] : [];
    });
  }
  const [u, l] = clave.split("-");
  const unidad = curso.unidades[Number(u)];
  if (!unidad) return [];
  if (l === "t") {
    const todos = unidad.lecciones.flatMap((lec, li) =>
      lec.ejercicios.map((ej, i) => ({ tipo: "ej" as const, ej, ref: `${u}.${li}.${i}`, id: `${u}.${li}.${i}` })),
    );
    return mezclar(todos).slice(0, 8);
  }
  const leccion = unidad.lecciones[Number(l)];
  if (!leccion) return [];
  return [
    ...leccion.tarjetas.map((tarjeta, i) => ({ tipo: "tarjeta" as const, tarjeta, id: `t${i}` })),
    ...mezclar(leccion.ejercicios.map((ej, i) => ({ tipo: "ej" as const, ej, ref: `${u}.${l}.${i}`, id: `${u}.${l}.${i}` }))),
  ];
}

export function tituloDe(curso: Curso, clave: string) {
  if (clave === "repaso") return "Repaso de lo fallado";
  const [u, l] = clave.split("-");
  if (l === "t") return `Prueba: ${curso.unidades[Number(u)]?.titulo ?? ""}`;
  return curso.unidades[Number(u)]?.lecciones[Number(l)]?.titulo ?? "Lección";
}

/** Todas las tarjetas del curso, para Las 5 cajas. */
export function todasLasTarjetas(curso: Curso) {
  return curso.unidades.flatMap((u, ui) =>
    u.lecciones.flatMap((l, li) => l.tarjetas.map((t, ti) => ({ ...t, id: `${curso.id}:${ui}.${li}.${ti}` }))),
  );
}
