import { hoy } from "../../lib/fechas";
import { actualizarVida, nuevoId, obtenerVida, type FuenteImportacion, type Importacion, type Movimiento } from "../estado";
import { leerComprobante, leerCsv, leerImagen, leerPdf, leerTabla, leerTexto, leerXlsx, type Candidato } from "./leer";

/** Formatos compatibles. Al sumar uno, sube FORMATOS_VERSION para avisar la novedad (con discreción). */
export const FORMATOS = [
  { id: "csv", nombre: "CSV", detalle: "Reportes exportados como tabla (por ejemplo, desde Excel)." },
  { id: "xlsx", nombre: "Excel (.xlsx)", detalle: "Se lee la primera hoja." },
  { id: "pdf", nombre: "PDF con texto", detalle: "Comprobantes o estados de cuenta. Los PDF escaneados se leen como imagen." },
  { id: "imagen", nombre: "Capturas (JPG, PNG, WebP)", detalle: "Se leen en tu celular. La primera vez se descargan unos MB." },
  { id: "texto", nombre: "Texto pegado", detalle: "De un correo, un SMS o un comprobante." },
];
export const FORMATOS_VERSION = 1;

export const NOMBRE_FUENTE: Record<FuenteImportacion, string> = {
  gmail: "Gmail",
  reporte: "Reporte de movimientos",
  comprobante: "Captura o comprobante",
  texto: "Texto pegado",
};

export type ErrorImportar = "incompatible" | "vacio" | "lectura" | "sin-conexion" | "grande" | "permiso";

export class FallaImportar extends Error {
  constructor(public tipo: ErrorImportar) {
    super(tipo);
  }
}

export const MENSAJE_ERROR: Record<ErrorImportar, { titulo: string; texto: string }> = {
  incompatible: { titulo: "No puedo abrir ese archivo", texto: "Sube un CSV, un Excel (.xlsx), un PDF o una imagen. También puedes pegar el texto." },
  vacio: { titulo: "No encontré movimientos", texto: "El archivo se abrió, pero no vi montos con fecha. Si es un comprobante, prueba pegando su texto." },
  lectura: { titulo: "No pude leerlo bien", texto: "Puede estar dañado o protegido con clave. Prueba con otro archivo o pega el texto." },
  "sin-conexion": { titulo: "Necesito internet para esto", texto: "La primera vez que leo una imagen descargo el lector. Conéctate e inténtalo de nuevo; también puedes pegar el texto." },
  grande: { titulo: "El archivo es muy pesado", texto: "Sube uno de menos de 10 MB, o divide el reporte por meses." },
  permiso: { titulo: "Google ya no me deja leer tu correo", texto: "El permiso venció o lo quitaste. Si quieres seguir, vuelve a conectar Gmail; lo que ya importaste se queda." },
};

/** Etapas reales del procesamiento (sin porcentajes inventados). */
export type Etapa = "Leyendo archivo" | "Revisando movimientos" | "Preparando vista previa" | string;

const pausa = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Lee un archivo y devuelve los movimientos encontrados (sin guardar nada). */
export async function procesarArchivo(archivo: File, alEtapa: (e: Etapa) => void): Promise<{ candidatos: Candidato[]; fuente: FuenteImportacion }> {
  if (archivo.size > 10 * 1024 * 1024) throw new FallaImportar("grande");
  if (archivo.size === 0) throw new FallaImportar("vacio");
  const reglas = obtenerVida().reglas;
  const nombre = archivo.name.toLowerCase();
  alEtapa("Leyendo archivo");
  let candidatos: Candidato[] = [];
  let fuente: FuenteImportacion = "comprobante";
  try {
    if (nombre.endsWith(".csv") || archivo.type === "text/csv") {
      fuente = "reporte";
      candidatos = leerTabla(leerCsv(await archivo.text()), reglas).candidatos;
    } else if (nombre.endsWith(".xlsx")) {
      fuente = "reporte";
      candidatos = leerTabla(await leerXlsx(await archivo.arrayBuffer()), reglas).candidatos;
    } else if (nombre.endsWith(".pdf") || archivo.type === "application/pdf") {
      const texto = await leerPdf(await archivo.arrayBuffer());
      alEtapa("Revisando movimientos");
      candidatos = leerTexto(texto, reglas);
      fuente = candidatos.length > 1 ? "reporte" : "comprobante";
    } else if (archivo.type.startsWith("image/")) {
      if (!navigator.onLine && !localStorage.getItem("auxi.vida.ocrListo")) throw new FallaImportar("sin-conexion");
      const texto = await leerImagen(archivo, alEtapa);
      try {
        localStorage.setItem("auxi.vida.ocrListo", "1");
      } catch {
        // nada
      }
      alEtapa("Revisando movimientos");
      candidatos = leerTexto(texto, reglas);
      if (!candidatos.length) {
        const uno = leerComprobante(texto, reglas);
        if (uno) candidatos = [uno];
      }
    } else if (nombre.endsWith(".txt") || archivo.type.startsWith("text/")) {
      fuente = "texto";
      candidatos = leerTexto(await archivo.text(), reglas);
    } else if (nombre.endsWith(".xls")) {
      throw new FallaImportar("incompatible");
    } else throw new FallaImportar("incompatible");
  } catch (e) {
    if (e instanceof FallaImportar) throw e;
    if (!navigator.onLine) throw new FallaImportar("sin-conexion");
    throw new FallaImportar(e instanceof Error && e.message === "incompatible" ? "incompatible" : "lectura");
  }
  alEtapa("Revisando movimientos");
  await pausa(250);
  if (!candidatos.length) throw new FallaImportar("vacio");
  alEtapa("Preparando vista previa");
  await pausa(250);
  return { candidatos: marcarDuplicados(candidatos), fuente };
}

export async function procesarTexto(texto: string, alEtapa: (e: Etapa) => void) {
  alEtapa("Revisando movimientos");
  await pausa(300);
  const candidatos = leerTexto(texto, obtenerVida().reglas);
  if (!candidatos.length) throw new FallaImportar("vacio");
  alEtapa("Preparando vista previa");
  await pausa(250);
  return marcarDuplicados(candidatos);
}

const normal = (s?: string | null) => (s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");

/**
 * Marca posibles duplicados frente a lo ya guardado y dentro del mismo lote.
 * Mismo número de operación = probable duplicado. Mismo monto, fecha y contraparte = posible.
 * Mismo monto solo NO se marca: dos menús de S/ 12 el mismo día son gastos reales.
 */
export function marcarDuplicados(cs: Candidato[]): Candidato[] {
  const existentes = obtenerVida().movimientos;
  const vistos: Candidato[] = [];
  return cs.map((c) => {
    const igualOp = (op?: string | null) => !!c.operacion && !!op && normal(op) === normal(c.operacion);
    const parecido = (m: { monto: number | null; fecha: string | null; contraparte?: string | null }) => {
      if (m.monto !== c.monto || !c.fecha || m.fecha !== c.fecha) return false;
      const a = normal(m.contraparte);
      const b = normal(c.contraparte);
      return !!a && !!b && (a.includes(b) || b.includes(a));
    };
    let duplicado: Candidato["duplicado"];
    const ex = existentes.find((m) => igualOp(m.operacion));
    const lote = vistos.find((v) => igualOp(v.operacion));
    if (ex || lote) duplicado = { nivel: "probable", detalle: `Mismo número de operación que «${ex?.nota ?? lote?.descripcion}».` };
    else {
      const ex2 = existentes.find((m) => parecido({ monto: m.monto, fecha: m.fecha, contraparte: m.contraparte ?? m.nota }));
      const lote2 = vistos.find((v) => parecido(v));
      if (ex2 || lote2) duplicado = { nivel: "posible", detalle: `Se parece a «${ex2?.nota ?? lote2?.descripcion}»: mismo día, monto y nombre.` };
    }
    const r = { ...c, duplicado, incluir: c.incluir && !duplicado };
    vistos.push(r);
    return r;
  });
}

/** Guarda los movimientos elegidos. No suma racha ni monedas: importar no es «gastar». */
export function guardarImportacion(cs: Candidato[], fuente: FuenteImportacion, detalle: string): Importacion {
  const id = nuevoId("i");
  const movimientos: Movimiento[] = cs.map((c) => ({
    id: nuevoId("m"),
    tipo: c.tipo,
    monto: c.monto ?? 0,
    categoria: c.categoria,
    nota: (c.contraparte ?? c.descripcion ?? c.categoria).slice(0, 40),
    fecha: c.fecha ?? hoy(),
    origen: fuente,
    moneda: c.moneda,
    contraparte: c.contraparte ?? undefined,
    operacion: c.operacion ?? undefined,
    clase: c.clase === "normal" ? undefined : c.clase,
    importacion: id,
  }));
  const imp: Importacion = { id, fecha: hoy(), fuente, detalle, ids: movimientos.map((m) => m.id) };
  actualizarVida((s) => ({ movimientos: [...s.movimientos, ...movimientos], importaciones: [...s.importaciones, imp] }));
  return imp;
}

export function deshacerImportacion(id: string) {
  const imp = obtenerVida().importaciones.find((i) => i.id === id);
  if (!imp) return 0;
  const ids = new Set(imp.ids);
  const quedaban = obtenerVida().movimientos.filter((m) => ids.has(m.id)).length;
  actualizarVida((s) => ({
    movimientos: s.movimientos.filter((m) => !ids.has(m.id)),
    importaciones: s.importaciones.map((i) => (i.id === id ? { ...i, deshecha: true } : i)),
  }));
  return quedaban;
}

/** Borra todo lo importado desde una fuente (por ejemplo, al desconectar Gmail). */
export function borrarImportadosDe(fuente: FuenteImportacion) {
  const n = obtenerVida().movimientos.filter((m) => m.origen === fuente).length;
  actualizarVida((s) => ({
    movimientos: s.movimientos.filter((m) => m.origen !== fuente),
    importaciones: s.importaciones.map((i) => (i.fuente === fuente ? { ...i, deshecha: true } : i)),
  }));
  return n;
}

export const listoParaGuardar = (c: Candidato) => c.monto !== null && c.monto > 0 && !!c.fecha;
