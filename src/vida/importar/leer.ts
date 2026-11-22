/**
 * Lector de movimientos para importar: correos, comprobantes, reportes y texto pegado.
 * Todo se lee en el celular con reglas (sin costo de API). Lo que no se encuentra queda vacío
 * y marcado «Por revisar»: nunca se inventa.
 */
import { categoriaGasto } from "../entender";

export type Clase = "normal" | "devolucion" | "propia";

export type Candidato = {
  clave: string;
  tipo: "gasto" | "ingreso";
  clase: Clase;
  monto: number | null;
  moneda: string;
  fecha: string | null;
  contraparte: string | null;
  operacion: string | null;
  descripcion: string;
  categoria: string;
  /** Motivos para revisar este movimiento. */
  dudas: string[];
  duplicado?: { nivel: "probable" | "posible"; detalle: string };
  incluir: boolean;
};

export type Regla = { id: string; contiene: string; categoria: string };

const sinTildes = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
let contador = 0;
const nuevaClave = () => `k${Date.now().toString(36)}${(contador++).toString(36)}`;

/* ---------- Monto y moneda ---------- */

const MONEDAS: [RegExp, string][] = [
  [/US\$|USD|\$\s?(?=\d)|d[oó]lares/i, "USD"],
  [/€|EUR/i, "EUR"],
  [/S\/\.?|PEN|soles/i, "PEN"],
];

const RE_MONTO = /(?:(S\/\.?|PEN|US\$|USD|\$|€|EUR)\s*)?(-?\d{1,3}(?:[.,\s]\d{3})*(?:[.,]\d{1,2})|-?\d+(?:[.,]\d{1,2})?)(?:\s*(soles|d[oó]lares|PEN|USD))?/gi;

function aNumero(t: string): number | null {
  let s = t.replace(/\s/g, "");
  const neg = s.startsWith("-");
  s = s.replace("-", "");
  const ultimoPunto = s.lastIndexOf(".");
  const ultimaComa = s.lastIndexOf(",");
  if (ultimoPunto > -1 && ultimaComa > -1) {
    // El separador que va al final es el decimal.
    if (ultimaComa > ultimoPunto) s = s.replace(/\./g, "").replace(",", ".");
    else s = s.replace(/,/g, "");
  } else if (ultimaComa > -1) {
    s = /,\d{1,2}$/.test(s) ? s.replace(",", ".") : s.replace(/,/g, "");
  } else if (ultimoPunto > -1 && !/\.\d{1,2}$/.test(s)) {
    s = s.replace(/\./g, "");
  }
  const n = Number(s);
  if (!Number.isFinite(n) || n === 0 || Math.abs(n) > 10_000_000) return null;
  return Math.round((neg ? -n : n) * 100) / 100;
}

/** Busca montos con moneda escrita; si no hay, montos con decimales. Devuelve el primero. */
function buscarMonto(texto: string): { monto: number; moneda: string | null; negativo: boolean } | null {
  const conMoneda: { monto: number; moneda: string; negativo: boolean }[] = [];
  const sueltos: { monto: number; negativo: boolean }[] = [];
  for (const m of texto.matchAll(RE_MONTO)) {
    const v = aNumero(m[2]);
    if (v === null) continue;
    // Evita confundir años, horas o números de operación con montos.
    const crudo = m[2].replace("-", "");
    if (!m[1] && !m[3] && (/^\d{4}$/.test(crudo) || /^\d{6,}$/.test(crudo))) continue;
    const signo = m[1] || m[3] || "";
    const moneda = MONEDAS.find(([re]) => re.test(signo))?.[1];
    if (moneda) conMoneda.push({ monto: Math.abs(v), moneda, negativo: v < 0 });
    else if (/[.,]\d{2}$/.test(crudo)) sueltos.push({ monto: Math.abs(v), negativo: v < 0 });
  }
  if (conMoneda.length) return conMoneda[0];
  if (sueltos.length) return { ...sueltos[0], moneda: null };
  return null;
}

/* ---------- Fecha ---------- */

const MESES: Record<string, number> = { ene: 1, feb: 2, mar: 3, abr: 4, may: 5, jun: 6, jul: 7, ago: 8, set: 9, sep: 9, oct: 10, nov: 11, dic: 12 };

const dosDigitos = (n: number) => String(n).padStart(2, "0");
function valida(a: number, m: number, d: number) {
  const f = new Date(a, m - 1, d);
  return f.getFullYear() === a && f.getMonth() === m - 1 && f.getDate() === d ? `${a}-${dosDigitos(m)}-${dosDigitos(d)}` : null;
}

/** Devuelve la fecha AAAA-MM-DD y si el año se supuso (para marcarlo «Por revisar»). */
export function buscarFecha(texto: string): { fecha: string; anioSupuesto: boolean } | null {
  const t = sinTildes(texto);
  let m = t.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
  if (m) {
    const f = valida(+m[1], +m[2], +m[3]);
    if (f) return { fecha: f, anioSupuesto: false };
  }
  m = t.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/);
  if (m) {
    const a = m[3].length === 2 ? 2000 + +m[3] : +m[3];
    const f = valida(a, +m[2], +m[1]);
    if (f) return { fecha: f, anioSupuesto: false };
  }
  m = t.match(/\b(\d{1,2})\s*(?:de\s+)?(ene|feb|mar|abr|may|jun|jul|ago|set|sep|oct|nov|dic)[a-z]*\.?\s*(?:de\s+|del\s+)?(\d{4})?/);
  if (m) {
    const anioSupuesto = !m[3];
    const a = m[3] ? +m[3] : new Date().getFullYear();
    const f = valida(a, MESES[m[2]], +m[1]);
    if (f) return { fecha: f, anioSupuesto };
  }
  return null;
}

/** Fecha de una celda de Excel (número de serie) o de texto. */
function fechaDeCelda(v: string) {
  const n = Number(v);
  if (/^\d{5}(\.\d+)?$/.test(v) && n > 20000 && n < 80000) {
    const d = new Date(Date.UTC(1899, 11, 30) + Math.floor(n) * 86_400_000);
    return { fecha: `${d.getUTCFullYear()}-${dosDigitos(d.getUTCMonth() + 1)}-${dosDigitos(d.getUTCDate())}`, anioSupuesto: false };
  }
  return buscarFecha(v);
}

/* ---------- Tipo, contraparte y operación ---------- */

function clasificar(texto: string): { tipo: "gasto" | "ingreso" | null; clase: Clase } {
  const t = sinTildes(texto);
  if (/entre (tus|mis) cuentas|cuentas? propias?|a (tu|mi) cuenta (de ahorros|corriente)? ?propia|transferencia propia/.test(t)) return { tipo: "gasto", clase: "propia" };
  if (/devolucion|extorno|reembolso|reversion|te devolvieron|anulacion de (compra|consumo)/.test(t)) return { tipo: "ingreso", clase: "devolucion" };
  if (/te yape|te pago|te plineo|recibiste|te transfiri|te envi|abono|deposito recibido|te depositaron|ingreso|yape recibido|cobraste/.test(t)) return { tipo: "ingreso", clase: "normal" };
  if (/yapeaste|plineaste|pagaste|consumo|compra|transferiste|enviaste|cargo|retiro|pago de servicio|pago a |pago realizado|yape enviado|debito/.test(t)) return { tipo: "gasto", clase: "normal" };
  return { tipo: null, clase: "normal" };
}

function limpiarNombre(s: string) {
  const n = s
    .replace(/\s*(S\/\.?|PEN|US\$|USD)\s*[\d.,]+.*$/i, "")
    .replace(/\s+(el|por|con|de|del)\s+\d.*$/i, "")
    .replace(/[|:*•·]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return n.length >= 2 && n.length <= 45 && /[a-záéíóúñ]/i.test(n) ? n : null;
}

function buscarContraparte(texto: string, tipo: "gasto" | "ingreso" | null) {
  const lineas = texto.split(/\n/);
  const patronesGasto = /(?:yapeaste a|plineaste a|pagaste a|transferiste a|enviaste a|pago a|destinatario|destino|beneficiario|comercio|establecimiento|para|(?:consumo|compra)(?: realizad[oa])?(?: en)?)\s*:?\s+(.+)/i;
  const patronesIngreso = /(?:te yape[oó]|te pag[oó]|te plin[eo]+[oó]?|te transfiri[oó]|te envi[oó]|remitente|ordenante|origen|de parte de)\s*:?\s*(.+)/i;
  const re = tipo === "ingreso" ? patronesIngreso : patronesGasto;
  for (const l of lineas) {
    const m = l.match(re);
    if (m) {
      const n = limpiarNombre(m[1]);
      if (n) return n;
    }
  }
  // Pantallas tipo Yape: el nombre va solo, en una línea después del monto.
  const iMonto = lineas.findIndex((l) => /S\/|PEN|US\$|USD/i.test(l));
  for (const l of lineas.slice(iMonto + 1, iMonto + 4)) {
    const t = l.trim();
    if (!t || /\d{2}|operaci|yape|plin|fecha|hora|monto|constancia|destino|origen/i.test(t)) continue;
    const n = limpiarNombre(t);
    if (n && /^[A-ZÁÉÍÓÚÑ]/.test(n)) return n;
  }
  return null;
}

function buscarOperacion(texto: string) {
  const m = texto.match(/(?:n(?:[°ºo]|ro|um(?:ero)?)\.?\s*(?:de\s*)?operaci[oó]n|c[oó]digo de operaci[oó]n|operaci[oó]n\s*n[°ºo]?\.?|id de transacci[oó]n|n[°º]\s*de\s*transacci[oó]n)\s*:?\s*#?\s*([A-Z0-9-]{4,24})/i);
  return m ? m[1] : null;
}

/* ---------- Categoría y reglas ---------- */

export function sugerirCategoria(c: Pick<Candidato, "tipo" | "clase" | "contraparte" | "descripcion">, reglas: Regla[]) {
  const texto = sinTildes(`${c.contraparte ?? ""} ${c.descripcion}`);
  const regla = reglas.find((r) => r.contiene && texto.includes(sinTildes(r.contiene)));
  if (regla) return regla.categoria;
  if (c.clase === "devolucion") return "Devolución";
  if (c.clase === "propia") return "Entre mis cuentas";
  if (c.tipo === "ingreso") return "Me pagaron";
  return categoriaGasto(texto);
}

/* ---------- Un comprobante o correo → un movimiento ---------- */

/** Lee un comprobante o correo. Devuelve null si no parece un movimiento (así no se procesa de más). */
export function leerComprobante(texto: string, reglas: Regla[]): Candidato | null {
  const monto = buscarMonto(texto);
  const { tipo, clase } = clasificar(texto);
  const operacion = buscarOperacion(texto);
  if (!monto || (!tipo && !operacion)) return null;
  const tipoFinal = tipo ?? "gasto";
  const fecha = buscarFecha(texto);
  const contraparte = buscarContraparte(texto, tipoFinal);
  const dudas: string[] = [];
  if (!tipo) dudas.push("¿Es gasto o ingreso?");
  if (!fecha) dudas.push("Falta la fecha");
  else if (fecha.anioSupuesto) dudas.push("Revisa el año");
  if (!monto.moneda) dudas.push("Revisa la moneda");
  if (monto.moneda && monto.moneda !== "PEN") dudas.push(`En ${monto.moneda}: no suma a tu presupuesto en soles`);
  const primera = texto.split("\n").map((l) => l.trim()).find((l) => l.length > 3) ?? "";
  const descripcion = (contraparte ?? primera).slice(0, 60);
  const c: Candidato = {
    clave: nuevaClave(),
    tipo: tipoFinal,
    clase,
    monto: monto.monto,
    moneda: monto.moneda ?? "PEN",
    fecha: fecha?.fecha ?? null,
    contraparte,
    operacion,
    descripcion,
    categoria: "",
    dudas,
    incluir: true,
  };
  c.categoria = sugerirCategoria(c, reglas);
  return c;
}

/* ---------- Varios movimientos en un texto (estado de cuenta pegado) ---------- */

export function leerTexto(texto: string, reglas: Regla[]): Candidato[] {
  const lineas = texto.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const filas = lineas.filter((l) => buscarFecha(l) && buscarMonto(l));
  // Si hay varias líneas con fecha y monto, cada una es un movimiento.
  if (filas.length >= 2) {
    return filas
      .map((l) => {
        const c = leerComprobante(l, reglas) ?? filaSinTipo(l, reglas);
        return c;
      })
      .filter((c): c is Candidato => !!c);
  }
  // Si no, puede ser uno o varios comprobantes separados por líneas en blanco.
  const bloques = texto.split(/\n\s*\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return bloques.map((b) => leerComprobante(b, reglas)).filter((c): c is Candidato => !!c);
}

function filaSinTipo(l: string, reglas: Regla[]): Candidato | null {
  const monto = buscarMonto(l);
  const fecha = buscarFecha(l);
  if (!monto) return null;
  const descripcion = l.replace(RE_MONTO, " ").replace(/\s+/g, " ").trim().slice(0, 60);
  const c: Candidato = {
    clave: nuevaClave(),
    tipo: "gasto",
    clase: "normal",
    monto: monto.monto,
    moneda: monto.moneda ?? "PEN",
    fecha: fecha?.fecha ?? null,
    contraparte: null,
    operacion: buscarOperacion(l),
    descripcion,
    categoria: "",
    dudas: [monto.negativo ? "" : "¿Es gasto o ingreso?", fecha ? "" : "Falta la fecha"].filter(Boolean),
    incluir: true,
  };
  c.categoria = sugerirCategoria(c, reglas);
  return c;
}

/* ---------- Tablas: reportes CSV o Excel ---------- */

const COLUMNAS: Record<string, RegExp> = {
  fecha: /^fecha|fecha de operaci|fecha y hora|^dia$/,
  monto: /^monto|importe|^valor|cantidad|total/,
  tipo: /^tipo|tipo de (operaci|transacci|movimiento)|^operaci[oó]n$|movimiento/,
  origen: /^origen|^de$|remitente|ordenante|enviado por/,
  destino: /^destino|^para$|beneficiario|destinatario|comercio|nombre/,
  mensaje: /mensaje|descripci|concepto|detalle|glosa|referencia/,
  operacion: /n.{0,6}operaci|c[oó]digo|id de transacci|^nro/,
  moneda: /^moneda|divisa/,
};

export function leerTabla(filas: string[][], reglas: Regla[]): { candidatos: Candidato[]; reconocida: boolean } {
  const limpia = filas.map((f) => f.map((c) => (c ?? "").toString().trim())).filter((f) => f.some(Boolean));
  const iCab = limpia.findIndex((f) => f.some((c) => COLUMNAS.fecha.test(sinTildes(c))) && f.some((c) => COLUMNAS.monto.test(sinTildes(c))));
  if (iCab === -1) {
    // Sin encabezados reconocibles: se intenta leer cada fila como texto.
    const cs = leerTexto(limpia.map((f) => f.join("  ")).join("\n"), reglas);
    return { candidatos: cs, reconocida: false };
  }
  const cab = limpia[iCab].map((c) => sinTildes(c));
  const col = (k: string) => cab.findIndex((c) => COLUMNAS[k].test(c));
  const ix = { fecha: col("fecha"), monto: col("monto"), tipo: col("tipo"), origen: col("origen"), destino: col("destino"), mensaje: col("mensaje"), operacion: col("operacion"), moneda: col("moneda") };
  const salida: Candidato[] = [];
  for (const f of limpia.slice(iCab + 1)) {
    const v = (i: number) => (i >= 0 ? (f[i] ?? "") : "");
    const crudo = v(ix.monto);
    const n = aNumero(crudo.replace(/[^\d.,-]/g, ""));
    if (n === null) continue;
    const textoTipo = `${v(ix.tipo)} ${v(ix.mensaje)}`;
    let { tipo, clase } = clasificar(textoTipo);
    if (!tipo) tipo = n < 0 ? "gasto" : null;
    const fecha = fechaDeCelda(v(ix.fecha));
    const moneda = MONEDAS.find(([re]) => re.test(`${v(ix.moneda)} ${crudo}`))?.[1] ?? (ix.moneda >= 0 ? null : "PEN");
    const contraparte = limpiarNombre(tipo === "ingreso" ? v(ix.origen) || v(ix.destino) : v(ix.destino) || v(ix.origen)) ?? null;
    const dudas: string[] = [];
    if (!tipo) dudas.push("¿Es gasto o ingreso?");
    if (!fecha) dudas.push("Falta la fecha");
    if (!moneda) dudas.push("Revisa la moneda");
    else if (moneda !== "PEN") dudas.push(`En ${moneda}: no suma a tu presupuesto en soles`);
    const c: Candidato = {
      clave: nuevaClave(),
      tipo: tipo ?? "gasto",
      clase,
      monto: Math.abs(n),
      moneda: moneda ?? "PEN",
      fecha: fecha?.fecha ?? null,
      contraparte,
      operacion: v(ix.operacion) || null,
      descripcion: (v(ix.mensaje) || contraparte || v(ix.tipo) || "Movimiento").slice(0, 60),
      categoria: "",
      dudas,
      incluir: true,
    };
    c.categoria = sugerirCategoria(c, reglas);
    salida.push(c);
  }
  return { candidatos: salida, reconocida: true };
}

/* ---------- Archivos ---------- */

export function leerCsv(texto: string): string[][] {
  const primera = texto.split(/\r?\n/)[0] ?? "";
  const sep = [";", "\t", ","].sort((a, b) => primera.split(b).length - primera.split(a).length)[0];
  const filas: string[][] = [];
  let fila: string[] = [];
  let campo = "";
  let comillas = false;
  for (let i = 0; i < texto.length; i++) {
    const ch = texto[i];
    if (comillas) {
      if (ch === '"' && texto[i + 1] === '"') {
        campo += '"';
        i++;
      } else if (ch === '"') comillas = false;
      else campo += ch;
    } else if (ch === '"') comillas = true;
    else if (ch === sep) {
      fila.push(campo);
      campo = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && texto[i + 1] === "\n") i++;
      fila.push(campo);
      filas.push(fila);
      fila = [];
      campo = "";
    } else campo += ch;
  }
  if (campo || fila.length) {
    fila.push(campo);
    filas.push(fila);
  }
  return filas;
}

/** Excel (.xlsx) sin librerías: es un ZIP con XML. Lee la primera hoja. */
export async function leerXlsx(buf: ArrayBuffer): Promise<string[][]> {
  const v = new DataView(buf);
  let fin = -1;
  for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 70000); i--) {
    if (v.getUint32(i, true) === 0x06054b50) {
      fin = i;
      break;
    }
  }
  if (fin < 0) throw new Error("incompatible");
  const total = v.getUint16(fin + 10, true);
  let p = v.getUint32(fin + 16, true);
  const archivos: Record<string, { metodo: number; tam: number; local: number }> = {};
  const dec = new TextDecoder();
  for (let i = 0; i < total; i++) {
    if (v.getUint32(p, true) !== 0x02014b50) break;
    const metodo = v.getUint16(p + 10, true);
    const tam = v.getUint32(p + 20, true);
    const nLen = v.getUint16(p + 28, true);
    const eLen = v.getUint16(p + 30, true);
    const cLen = v.getUint16(p + 32, true);
    const local = v.getUint32(p + 42, true);
    const nombre = dec.decode(new Uint8Array(buf, p + 46, nLen));
    archivos[nombre] = { metodo, tam, local };
    p += 46 + nLen + eLen + cLen;
  }
  const leer = async (nombre: string) => {
    const a = archivos[nombre];
    if (!a) return null;
    const nLen = v.getUint16(a.local + 26, true);
    const eLen = v.getUint16(a.local + 28, true);
    const datos = new Uint8Array(buf, a.local + 30 + nLen + eLen, a.tam);
    if (a.metodo === 0) return dec.decode(datos);
    const flujo = new Blob([datos]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
    return await new Response(flujo).text();
  };
  const hoja = Object.keys(archivos).filter((n) => /^xl\/worksheets\/sheet\d+\.xml$/.test(n)).sort()[0];
  if (!hoja) throw new Error("incompatible");
  const xmlHoja = await leer(hoja);
  const xmlTextos = await leer("xl/sharedStrings.xml");
  const parser = new DOMParser();
  const textos = xmlTextos ? [...parser.parseFromString(xmlTextos, "application/xml").getElementsByTagName("si")].map((si) => [...si.getElementsByTagName("t")].map((t) => t.textContent ?? "").join("")) : [];
  const doc = parser.parseFromString(xmlHoja ?? "", "application/xml");
  const filas: string[][] = [];
  for (const row of doc.getElementsByTagName("row")) {
    const fila: string[] = [];
    for (const c of row.getElementsByTagName("c")) {
      const ref = c.getAttribute("r") ?? "";
      const letras = ref.replace(/\d/g, "");
      let col = 0;
      for (const ch of letras) col = col * 26 + (ch.charCodeAt(0) - 64);
      const t = c.getAttribute("t");
      let valor = c.getElementsByTagName("v")[0]?.textContent ?? "";
      if (t === "s") valor = textos[Number(valor)] ?? "";
      if (t === "inlineStr") valor = [...c.getElementsByTagName("t")].map((x) => x.textContent ?? "").join("");
      fila[Math.max(0, col - 1)] = valor;
    }
    filas.push(Array.from(fila, (x) => x ?? ""));
  }
  return filas;
}

/** PDF con texto (no escaneado): se lee en el celular con pdf.js, que se descarga solo si hace falta. */
export async function leerPdf(buf: ArrayBuffer): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  const { default: worker } = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = worker;
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buf) }).promise;
  const partes: string[] = [];
  for (let i = 1; i <= Math.min(doc.numPages, 30); i++) {
    const pagina = await doc.getPage(i);
    const contenido = await pagina.getTextContent();
    const porLinea = new Map<number, { x: number; s: string }[]>();
    for (const it of contenido.items as { str: string; transform: number[] }[]) {
      if (!it.str?.trim()) continue;
      const y = Math.round(it.transform[5] / 3) * 3;
      (porLinea.get(y) ?? porLinea.set(y, []).get(y)!).push({ x: it.transform[4], s: it.str });
    }
    const lineas = [...porLinea.entries()].sort((a, b) => b[0] - a[0]).map(([, xs]) => xs.sort((a, b) => a.x - b.x).map((x) => x.s).join("  "));
    partes.push(lineas.join("\n"));
  }
  return partes.join("\n\n\n");
}

/** Imagen → texto con OCR en el celular (tesseract.js). La primera vez descarga sus datos. */
export async function leerImagen(archivo: File, alAvanzar?: (estado: string) => void): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  alAvanzar?.("Preparando el lector de imágenes");
  const w = await createWorker("spa");
  try {
    alAvanzar?.("Leyendo la imagen");
    const { data } = await w.recognize(archivo);
    return data.text;
  } finally {
    await w.terminate();
  }
}

