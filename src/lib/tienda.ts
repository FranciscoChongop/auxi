import type { Curso, Unidad } from "../data/tipos";
import type { InfoTema } from "./curso";
import { actualizar, nuevoId, obtener, type Estado, type MiCurso, type Tema } from "./estado";

/**
 * Economía de monedas. Todo lo básico es gratis; las monedas abren más temas importados.
 * Lo que ya importaste nunca se bloquea. Los precios se muestran tal cual.
 */
export const CUPO_GRATIS = 2;
export const PRECIO_CUPO = 60;
export const PRECIO_PASE = 500;
export const PRECIO_PROTECTOR = 50;

export const FORMAS_DE_GANAR = [
  { texto: "Terminar una lección", detalle: "10 monedas, y 5 más si la haces con 90 % o más", monedas: "10 a 15" },
  { texto: "Abrir el cofre del día", detalle: "Una vez al día, con las probabilidades a la vista", monedas: "10 a 50" },
  { texto: "Terminar un tomate", detalle: "5 monedas, hasta 3 tomates al día", monedas: "5" },
  { texto: "Explicárselo a León", detalle: "2 monedas por estrella", monedas: "2 a 6" },
  { texto: "Misiones de apoyo (opcionales)", detalle: "Seguir, comentar, compartir o invitar", monedas: "20 a 60" },
] as const;

export function importadosUsados(e: Estado) {
  return Object.keys(e.importados).length;
}

export function cupoTotal(e: Estado) {
  return CUPO_GRATIS + e.cupoExtra;
}

export function hayCupo(e: Estado) {
  return e.pasePorVida || importadosUsados(e) < cupoTotal(e);
}

export type ResultadoCompra = { ok: true } | { ok: false; faltan: number };

export function comprar(tipo: "cupo" | "pase" | "protector"): ResultadoCompra {
  const e = obtener();
  const precio = tipo === "cupo" ? PRECIO_CUPO : tipo === "pase" ? PRECIO_PASE : PRECIO_PROTECTOR;
  if (tipo === "pase" && e.pasePorVida) return { ok: true };
  if (e.monedas < precio) return { ok: false, faltan: precio - e.monedas };
  actualizar((s) => ({
    monedas: s.monedas - precio,
    ...(tipo === "cupo" ? { cupoExtra: s.cupoExtra + 1 } : {}),
    ...(tipo === "pase" ? { pasePorVida: true } : {}),
    ...(tipo === "protector" ? { racha: { ...s.racha, protectores: s.racha.protectores + 1 } } : {}),
  }));
  return { ok: true };
}

/** Guarda un curso importado dentro de un curso de "Mis cursos" (nuevo o existente). */
export function guardarImportacion(datos: { cursoId: string | null; cursoNombre: string; temaNombre: string; unidades: Unidad[]; temaId?: string | null }) {
  const e = obtener();
  const cursoId = datos.cursoId ?? nuevoId("c");
  const actual = e.misCursos.find((c) => c.id === cursoId);
  const existente = actual?.temas.find((t) => t.contenidoId && t.nombre.toLowerCase() === datos.temaNombre.toLowerCase());

  // "Sigue": si el tema ya existe, se agregan solo las unidades nuevas.
  if (existente?.contenidoId) {
    const previo = e.importados[existente.contenidoId];
    const titulos = new Set(previo.unidades.map((u) => u.titulo.toLowerCase()));
    const nuevas = datos.unidades.filter((u) => !titulos.has(u.titulo.toLowerCase()));
    actualizar((s) => ({
      importados: { ...s.importados, [previo.id]: { ...previo, unidades: [...previo.unidades, ...nuevas] } },
      cursoId: previo.id,
      estudiando: { cursoId, temaId: existente.id },
    }));
    return { cursoId, temaId: existente.id, contenidoId: previo.id, agregadas: nuevas.length, nuevo: false };
  }

  // Tema que ya existía pero sin lecciones (por ejemplo, creado con "Agregar tema").
  const vacio = datos.temaId ? actual?.temas.find((t) => t.id === datos.temaId && !t.contenidoId) : undefined;
  if (vacio) {
    const contenidoId = nuevoId("i");
    const curso: Curso = { id: contenidoId, titulo: vacio.nombre, materia: actual!.nombre, unidades: datos.unidades };
    actualizar((s) => ({
      importados: { ...s.importados, [contenidoId]: curso },
      misCursos: s.misCursos.map((c) => (c.id === cursoId ? { ...c, temas: c.temas.map((t) => (t.id === vacio.id ? { ...t, contenidoId } : t)) } : c)),
      cursoId: contenidoId,
      estudiando: { cursoId, temaId: vacio.id },
      bienvenidaVista: true,
    }));
    return { cursoId, temaId: vacio.id, contenidoId, agregadas: datos.unidades.length, nuevo: true };
  }

  const contenidoId = nuevoId("i");
  const temaId = nuevoId("t");
  const curso: Curso = { id: contenidoId, titulo: datos.temaNombre, materia: datos.cursoNombre, unidades: datos.unidades };
  const tema: Tema = { id: temaId, nombre: datos.temaNombre, archivos: [], contenidoId };
  actualizar((s) => {
    const cursos: MiCurso[] = s.misCursos.some((c) => c.id === cursoId)
      ? s.misCursos.map((c) => (c.id === cursoId ? { ...c, temas: [...c.temas, tema] } : c))
      : [...s.misCursos, { id: cursoId, nombre: datos.cursoNombre, color: s.misCursos.length % 6, temas: [tema] }];
    return {
      misCursos: cursos,
      importados: { ...s.importados, [contenidoId]: curso },
      cursoId: contenidoId,
      estudiando: { cursoId, temaId },
      bienvenidaVista: true,
    };
  });
  return { cursoId, temaId, contenidoId, agregadas: datos.unidades.length, nuevo: true };
}

export function renombrarContenido(contenidoId: string, cambio: { tema?: string; unidad?: [number, string]; leccion?: [number, number, string] }) {
  actualizar((s) => {
    const c = s.importados[contenidoId];
    if (!c) return {};
    const unidades = c.unidades.map((u, ui) => ({
      ...u,
      titulo: cambio.unidad && cambio.unidad[0] === ui ? cambio.unidad[1] : u.titulo,
      lecciones: u.lecciones.map((l, li) => (cambio.leccion && cambio.leccion[0] === ui && cambio.leccion[1] === li ? { ...l, titulo: cambio.leccion[2] } : l)),
    }));
    return {
      importados: { ...s.importados, [contenidoId]: { ...c, unidades, titulo: cambio.tema ?? c.titulo } },
      misCursos: cambio.tema
        ? s.misCursos.map((m) => ({ ...m, temas: m.temas.map((t) => (t.contenidoId === contenidoId ? { ...t, nombre: cambio.tema! } : t)) }))
        : s.misCursos,
    };
  });
}

/** Mueve un tema (con su contenido y sus PDF) a otro curso. El avance se conserva. */
export function moverTema(temaId: string, desdeCursoId: string, haciaCursoId: string) {
  if (desdeCursoId === haciaCursoId) return;
  actualizar((s) => {
    const tema = s.misCursos.find((c) => c.id === desdeCursoId)?.temas.find((t) => t.id === temaId);
    const destino = s.misCursos.find((c) => c.id === haciaCursoId);
    if (!tema || !destino) return {};
    const importados = { ...s.importados };
    if (tema.contenidoId && importados[tema.contenidoId]) importados[tema.contenidoId] = { ...importados[tema.contenidoId], materia: destino.nombre };
    return {
      importados,
      misCursos: s.misCursos.map((c) =>
        c.id === desdeCursoId ? { ...c, temas: c.temas.filter((t) => t.id !== temaId) } : c.id === haciaCursoId ? { ...c, temas: [...c.temas, tema] } : c,
      ),
      estudiando: s.estudiando?.temaId === temaId ? { cursoId: haciaCursoId, temaId } : s.estudiando,
    };
  });
}

/** Quita las lecciones importadas de un tema (libera un cupo). */
export function quitarContenido(contenidoId: string) {
  actualizar((s) => {
    const resto = { ...s.importados };
    delete resto[contenidoId];
    const progreso = { ...s.progreso };
    delete progreso[contenidoId];
    return {
      importados: resto,
      progreso,
      cursoId: s.cursoId === contenidoId ? null : s.cursoId,
      misCursos: s.misCursos.map((m) => ({ ...m, temas: m.temas.map((t) => (t.contenidoId === contenidoId ? { ...t, contenidoId: undefined } : t)) })),
    };
  });
}

/** Crea un curso vacío y devuelve su id. */
export function crearCurso(nombre: string) {
  const id = nuevoId("c");
  actualizar((s) => ({ misCursos: [...s.misCursos, { id, nombre: nombre.trim(), color: s.misCursos.length % 6, temas: [] }] }));
  return id;
}

/** Crea un tema vacío dentro de un curso y devuelve su id. */
export function crearTema(cursoId: string, nombre: string) {
  const id = nuevoId("t");
  const tema: Tema = { id, nombre: nombre.trim(), archivos: [] };
  actualizar((s) => ({ misCursos: s.misCursos.map((c) => (c.id === cursoId ? { ...c, temas: [...c.temas, tema] } : c)) }));
  return id;
}

/** Pone (o quita) la fecha del examen de un tema. También la agrega al calendario de entregas. */
export function ponerExamen(cursoId: string, temaId: string, fecha: string | null) {
  actualizar((s) => {
    const curso = s.misCursos.find((c) => c.id === cursoId);
    const tema = curso?.temas.find((t) => t.id === temaId);
    if (!curso || !tema) return {};
    const idEntrega = `ex-${temaId}`;
    const sin = s.entregas.filter((x) => x.id !== idEntrega);
    return {
      misCursos: s.misCursos.map((c) =>
        c.id === cursoId ? { ...c, temas: c.temas.map((t) => (t.id === temaId ? { ...t, examen: fecha ?? undefined } : t)) } : c,
      ),
      entregas: fecha ? [...sin, { id: idEntrega, titulo: `Examen: ${tema.nombre}`, curso: curso.nombre, fecha, tipo: "examen" }] : sin,
    };
  });
}

/** Empieza a estudiar un tema: si ya tiene lecciones abre Tu camino; si no, lleva al prompt para crearlas. */
export function estudiarTema(info: InfoTema, navegar: (ruta: string) => void) {
  if (info.contenido) {
    actualizar(() => ({ cursoId: info.contenido!.id, estudiando: { cursoId: info.curso.id, temaId: info.tema.id } }));
    navegar("/studio/camino");
  } else {
    navegar(`/studio/importar?curso=${info.curso.id}&tema=${info.tema.id}`);
  }
}

/** Cambia el tema que se estudia en Tu camino, Métodos y el inicio. */
export function elegirTema(contenidoId: string) {
  actualizar((s) => {
    const dueno = s.misCursos.find((c) => c.temas.some((t) => t.contenidoId === contenidoId));
    const tema = dueno?.temas.find((t) => t.contenidoId === contenidoId);
    return { cursoId: contenidoId, estudiando: dueno && tema ? { cursoId: dueno.id, temaId: tema.id } : null };
  });
}
