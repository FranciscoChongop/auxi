import { normalizar } from "../juegos/corregir";

/** Una clase del horario. dia: 0 = lunes … 6 = domingo. Horas en formato 24 h "08:00". */
export type Clase = { id: string; curso: string; dia: number; inicio: string; fin: string; aula?: string };

export const DIAS_LARGOS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
export const DIAS_CORTOS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

/** Día de hoy con lunes = 0. */
export function diaDeHoy(fecha = new Date()) {
  return (fecha.getDay() + 6) % 7;
}

function diaDe(texto: string): number | null {
  const t = normalizar(texto);
  const claves = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"];
  if (!t) return null;
  const i = claves.findIndex((c) => t.startsWith(c));
  // "martes" empieza con "mar"; evita confundir "materia" o similares.
  if (i < 0 || t.length > 10) return null;
  return i;
}

function dosDigitos(n: number) {
  return String(n).padStart(2, "0");
}

/** Convierte lo que venga en una celda (texto, número de Excel o fecha) a "HH:MM". */
function hora(valor: unknown): string | null {
  if (valor instanceof Date) return `${dosDigitos(valor.getUTCHours())}:${dosDigitos(valor.getUTCMinutes())}`;
  if (typeof valor === "number" && valor >= 0 && valor < 1) {
    const min = Math.round(valor * 24 * 60);
    return `${dosDigitos(Math.floor(min / 60))}:${dosDigitos(min % 60)}`;
  }
  const m = String(valor ?? "").match(/(\d{1,2})[:.h](\d{2})\s*(am|pm|a\.m\.|p\.m\.)?/i);
  if (!m) return null;
  let h = Number(m[1]);
  const ampm = m[3]?.toLowerCase();
  if (ampm?.startsWith("p") && h < 12) h += 12;
  if (ampm?.startsWith("a") && h === 12) h = 0;
  return `${dosDigitos(h)}:${m[2]}`;
}

/** "08:00 - 10:00" → ["08:00", "10:00"]. */
function rango(valor: unknown): [string, string | null] | null {
  if (valor instanceof Date || typeof valor === "number") {
    const h = hora(valor);
    return h ? [h, null] : null;
  }
  const partes = String(valor ?? "").split(/\s*[-–]\s*|\s+(?:a|al|hasta)\s+/i);
  const a = hora(partes[0]);
  if (!a) return null;
  return [a, partes[1] ? hora(partes[1]) : null];
}

function sumarHora(h: string, minutos: number) {
  const [a, b] = h.split(":").map(Number);
  const t = Math.min(23 * 60 + 59, a * 60 + b + minutos);
  return `${dosDigitos(Math.floor(t / 60))}:${dosDigitos(t % 60)}`;
}

const nuevoId = (i: number) => `h${Date.now().toString(36)}${i}`;

/**
 * Lee un horario desde las filas de un Excel o CSV. Entiende dos formas comunes:
 * 1) Cuadrícula: días en una fila de títulos y horas en la primera columna.
 * 2) Lista: columnas Día, Inicio/Hora, Fin y Curso.
 */
export function leerHorario(filas: unknown[][]): Clase[] {
  const texto = (v: unknown) => (v == null ? "" : v instanceof Date ? "" : String(v).trim());

  // Forma 2: lista con columnas con nombre.
  for (let r = 0; r < Math.min(filas.length, 10); r++) {
    const titulos = filas[r].map((c) => normalizar(texto(c)));
    const col = (...nombres: string[]) => titulos.findIndex((t) => nombres.some((n) => t.startsWith(n)));
    const cDia = col("dia");
    const cCurso = col("curso", "materia", "asignatura", "clase");
    const cInicio = col("inicio", "hora", "desde", "horario");
    if (cDia >= 0 && cCurso >= 0 && cInicio >= 0) {
      const cFin = col("fin", "hasta", "termina");
      const cAula = col("aula", "salon", "lugar");
      return filas.slice(r + 1).flatMap((f, i) => {
        const dia = diaDe(texto(f[cDia]));
        const curso = texto(f[cCurso]);
        const rg = rango(f[cInicio]);
        if (dia === null || !curso || !rg) return [];
        const fin = (cFin >= 0 ? hora(f[cFin]) : null) ?? rg[1] ?? sumarHora(rg[0], 90);
        return [{ id: nuevoId(i), curso, dia, inicio: rg[0], fin, aula: cAula >= 0 ? texto(f[cAula]) || undefined : undefined }];
      });
    }
  }

  // Forma 1: cuadrícula de días × horas.
  for (let r = 0; r < Math.min(filas.length, 10); r++) {
    const columnas = new Map<number, number>();
    filas[r].forEach((c, i) => {
      const d = diaDe(texto(c));
      if (d !== null) columnas.set(i, d);
    });
    if (columnas.size < 3) continue;
    const clases: Clase[] = [];
    const cuerpo = filas.slice(r + 1);
    cuerpo.forEach((f, fi) => {
      const rg = f.map(rango).find((x, ci) => x && !columnas.has(ci));
      if (!rg) return;
      const siguiente = cuerpo.slice(fi + 1).map((g) => g.map(rango).find((x) => x)).find((x) => x);
      const fin = rg[1] ?? siguiente?.[0] ?? sumarHora(rg[0], 60);
      columnas.forEach((dia, ci) => {
        const curso = texto(f[ci]).split(/\n/)[0].trim();
        if (!curso) return;
        // Une bloques seguidos del mismo curso el mismo día.
        const previo = clases.find((c) => c.dia === dia && c.curso === curso && c.fin === rg[0]);
        if (previo) previo.fin = fin;
        else clases.push({ id: nuevoId(clases.length), curso, dia, inicio: rg[0], fin });
      });
    });
    return clases;
  }
  return [];
}

/** CSV simple (comas o punto y coma). */
export function filasDeCsv(texto: string): string[][] {
  const sep = (texto.split("\n")[0].match(/;/g)?.length ?? 0) > (texto.split("\n")[0].match(/,/g)?.length ?? 0) ? ";" : ",";
  return texto
    .split(/\r?\n/)
    .filter((l) => l.trim())
    .map((l) => l.split(sep).map((c) => c.replace(/^"|"$/g, "").trim()));
}

export async function leerArchivoDeHorario(archivo: File): Promise<Clase[]> {
  if (/\.csv$/i.test(archivo.name) || archivo.type === "text/csv") return leerHorario(filasDeCsv(await archivo.text()));
  const { readSheet } = await import("read-excel-file/browser");
  const filas = (await readSheet(archivo)) as unknown[][];
  return leerHorario(filas);
}
