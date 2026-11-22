import { normalizar } from "../juegos/corregir";
import { leerJson } from "./importar";

/**
 * Importar el sílabo armado por una IA externa. La persona sube su sílabo a ChatGPT, Claude o Gemini
 * con este prompt, copia la respuesta y la pega en Auxi: se arman las entregas y el calendario.
 */

export const TIPOS_SILABO = ["examen", "practica", "trabajo", "exposicion", "actividad", "feriado", "otro"] as const;

export function promptSilabo(anio = new Date().getFullYear()) {
  return `Eres un asistente académico. Te adjunto el sílabo de un curso (o varios). PRIMERO léelo completo, de principio a fin, incluido el cronograma semana por semana y las notas al pie. Luego saca TODAS las fechas del semestre, sin dejar ninguna: exámenes (parcial, final, sustitutorio), prácticas, trabajos, informes, proyectos, exposiciones, tareas, talleres, laboratorios, visitas, actividades, feriados, días sin clase, vacaciones, semanas de exámenes e inicio y fin de clases.

Si no puedes abrir o leer el sílabo, NO inventes nada: respóndeme solo "No pude leer el sílabo".

Responde SOLO con un bloque de código JSON válido, sin texto antes ni después. Todo lo que está entre < > son instrucciones: REEMPLÁZALO por datos reales del sílabo. Nunca copies esas instrucciones.

{"entregas":[
 {"curso":"<nombre real del curso>","titulo":"<qué se entrega, se rinde o pasa ese día>","tipo":"<examen, practica, trabajo, exposicion, actividad, feriado u otro>","fecha":"<AAAA-MM-DD>","fecha_fin":"<AAAA-MM-DD si dura varios días; si no, no pongas este campo>"}
],"sin_fecha":["<cosas importantes que no tienen fecha clara>"]}

Reglas:
- Revisa el sílabo dos veces para no dejar nada fuera. Es mejor incluir de más que de menos.
- Usa SOLO información del sílabo. No inventes fechas ni actividades.
- La fecha va en formato AAAA-MM-DD (ejemplo: ${anio}-05-23). Si no aparece el año, usa ${anio}.
- "tipo": examen (parciales, finales, sustitutorios), practica (prácticas o controles), trabajo (informes, tareas, proyectos), exposicion, actividad (talleres, laboratorios, visitas, eventos), feriado (feriados, días sin clase, suspensión de clases), otro (inicio o fin de clases y lo demás).
- Si algo dura varios días (vacaciones, semana de exámenes, receso), usa "fecha" para el primer día y "fecha_fin" para el último.
- Si el sílabo dice "semana 5" y da la fecha de inicio de clases, calcula la fecha de esa semana. Si no se puede saber con seguridad, ponla en "sin_fecha".
- Si hay varios cursos, repite "curso" en cada fila. Para feriados o fechas generales usa "curso":"General".
- Una fila por fecha. Título corto y claro (máximo 8 palabras), en español.
- Si te escribo "sigue", continúa con lo que falte: mismo formato.`;
}

export type EntregaImportada = { curso: string; titulo: string; tipo?: string; fecha: string; hasta?: string };
export type SilaboImportado = { entregas: EntregaImportada[]; sinFecha: string[]; descartadas: number; cortado: boolean };

const AVISO_PLANTILLA =
  "La IA te devolvió el ejemplo sin llenar: no leyó tu sílabo. Revisa que haya podido abrir el archivo y pídele: «Lee el sílabo y llena el JSON con sus datos reales».";

function fechaValida(texto: string): string | null {
  const t = texto.trim();
  let a: number, m: number, d: number;
  let r = t.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (r) [a, m, d] = [Number(r[1]), Number(r[2]), Number(r[3])];
  else {
    r = t.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (!r) return null;
    [d, m, a] = [Number(r[1]), Number(r[2]), Number(r[3])];
  }
  const f = new Date(a, m - 1, d);
  if (f.getFullYear() !== a || f.getMonth() !== m - 1 || f.getDate() !== d) return null;
  return `${a}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

const txt = (x: unknown, max = 80) => String(x ?? "").replace(/\s+/g, " ").trim().slice(0, max);

export function importarSilabo(texto: string): SilaboImportado {
  if (/no pude leer el s[ií]labo/i.test(texto) && !/\{/.test(texto)) {
    throw new Error("La IA dice que no pudo leer tu sílabo. Prueba subirlo otra vez, usar otra IA, o pegar su texto en el chat.");
  }
  const { datos, cortado } = leerJson(texto);
  const raw = (datos && typeof datos === "object" ? datos : {}) as Record<string, unknown>;
  const filas = Array.isArray(raw.entregas) ? raw.entregas : [];

  const crudo = normalizar(JSON.stringify(datos));
  if (crudo.includes("aaaa mm dd") || crudo.includes("que se entrega se rinde") || crudo.includes("nombre real del curso")) {
    throw new Error(AVISO_PLANTILLA);
  }

  let descartadas = 0;
  const vistos = new Set<string>();
  const entregas: EntregaImportada[] = [];
  for (const f of filas) {
    const o = (f && typeof f === "object" ? f : {}) as Record<string, unknown>;
    const fecha = fechaValida(txt(o.fecha ?? o.date, 20));
    const titulo = txt(o.titulo ?? o.title ?? o.nombre);
    if (!fecha || !titulo) {
      descartadas++;
      continue;
    }
    const curso = txt(o.curso ?? o.course) || "Sin curso";
    const clave = `${normalizar(curso)}|${normalizar(titulo)}|${fecha}`;
    if (vistos.has(clave)) continue;
    vistos.add(clave);
    const fin = fechaValida(txt(o.fecha_fin ?? o.hasta ?? o.end, 20));
    const tipo = normalizar(txt(o.tipo ?? o.type, 20)) || undefined;
    entregas.push({ curso, titulo, tipo, fecha, ...(fin && fin > fecha ? { hasta: fin } : {}) });
  }
  if (!entregas.length) throw new Error("No encontré entregas con fecha. Pídele a la IA que lea el sílabo y use fechas AAAA-MM-DD.");

  const sinFecha = (Array.isArray(raw.sin_fecha) ? raw.sin_fecha : []).map((x) => txt(x, 100)).filter(Boolean);
  entregas.sort((a, b) => a.fecha.localeCompare(b.fecha));
  return { entregas, sinFecha, descartadas, cortado };
}
