import { hoy, sumarDias } from "../lib/fechas";

/**
 * León entiende frases cortas como "almuerzo 12", "pasaje 2.50 y menú 10" o "me yapearon 50".
 * Funciona en el celular, sin internet ni IA: reglas simples con palabras de uso diario en Perú.
 * (En la Fase V3 se suma la IA para frases más libres.)
 */

export type Entendido = { tipo: "gasto" | "ingreso"; monto: number; categoria: string; nota: string; fecha: string };

export const CATEGORIAS_GASTO = ["Comida", "Transporte", "Casa y mercado", "Servicios", "Salud", "Gustos", "Deudas", "Estudios", "Familia", "Otros"] as const;
export const CATEGORIAS_INGRESO = ["Trabajo", "Ventas", "Me pagaron", "Otros ingresos"] as const;

const PALABRAS: [string, RegExp][] = [
  ["Comida", /almuerzo|desayuno|cena|lonche|men[uú]|pollo|chifa|caf[eé]|pan\b|snack|gaseosa|agua mineral|comida|ceviche|hamburguesa|pizza|salchipapa|jugo|galleta|fruta|helado|delivery|rappi|pedidosya/],
  ["Transporte", /pasaje|combi|micro|bus\b|taxi|mototaxi|moto\b|metro|metropolitano|corredor|uber|didi|indriver|cabify|gasolina|grifo|colectivo|peaje|estacionamiento|cochera/],
  ["Casa y mercado", /mercado|bodega|v[ií]veres|abarrotes|tienda|supermercado|plaza vea|tottus|metro\b|wong|mass\b|tambo|oxxo|limpieza|detergente|gas\b|balón/],
  ["Servicios", /\bluz\b|agua\b|internet|celular|recarga|plan\b|cable|netflix|spotify|alquiler|cuarto|renta/],
  ["Salud", /farmacia|pastilla|medicina|doctor|m[eé]dico|cl[ií]nica|consulta|inkafarma|mifarma|dentista|an[aá]lisis/],
  ["Gustos", /cine|chela|cerveza|trago|salida|juerga|fiesta|ropa|zapatilla|polo|regalo|juego|antojo|concierto|discoteca/],
  ["Deudas", /pr[eé]stamo|cuota|tarjeta|deuda|banco|caja\b|pagu[eé] a|interes/],
  ["Estudios", /copias|fotocopia|impresi[oó]n|libro|cuaderno|curso|matr[ií]cula|pensi[oó]n|universidad|instituto|colegio|[uú]tiles/],
  ["Familia", /mam[aá]|pap[aá]|hijo|hija|familia|abuel|hermano|hermana|propina para/],
];

const INGRESO = /me pagaron|me pag[oó]|me yape|me plin|me depositaron|me transfirieron|cobr[eé]|gan[eé]|vend[ií]|ingreso|sueldo|quincena|propina\b(?! para)|me dieron|me devolvieron|recib[ií]|entr[oó]/;

/** La palabra completa de ingreso ("me yapearon"), para quitarla de la nota. */
const INGRESO_PALABRA = new RegExp(String.raw`(?:${INGRESO.source})\p{L}*`, "u");

function categoriaIngreso(t: string) {
  if (/vend[ií]|venta/.test(t)) return "Ventas";
  if (/sueldo|quincena|trabajo|chamba|turno|cobr[eé]/.test(t)) return "Trabajo";
  if (/me pagaron|me pag[oó]|me yape|me plin|me depositaron|me transfirieron/.test(t)) return "Me pagaron";
  return "Otros ingresos";
}

export function categoriaGasto(t: string) {
  for (const [nombre, re] of PALABRAS) if (re.test(t)) return nombre;
  return "Otros";
}

function fechaDe(t: string) {
  if (/anteayer|antier/.test(t)) return sumarDias(hoy(), -2);
  if (/\bayer\b/.test(t)) return sumarDias(hoy(), -1);
  return hoy();
}

/** "12", "12.50", "12,50", "s/12", "S/. 1,200" → número. */
const MONTO = /(?:s\/\.?\s*)?(\d{1,3}(?:[.,]\d{3})+(?![\d])|\d+(?:[.,]\d{1,2})?)(?:\s*(?:soles|sol|lucas|luca|cocos))?/i;

function leerMonto(trozo: string): number | null {
  const m = trozo.match(MONTO);
  if (!m) return null;
  let n = m[1];
  if (/^\d{1,3}([.,]\d{3})+$/.test(n)) n = n.replace(/[.,]/g, "");
  else n = n.replace(",", ".");
  const v = Number(n);
  return Number.isFinite(v) && v > 0 && v < 1_000_000 ? Math.round(v * 100) / 100 : null;
}

function limpiarNota(trozo: string) {
  const sinMonto = trozo
    .replace(MONTO, "")
    .replace(/(?<!\p{L})(hoy|ayer|anteayer|antier|en|de|por|el|la|los|las|un|una|gast[eé]|pagu[eé]|compr[eé])(?!\p{L})/giu, " ")
    .replace(/\s+/g, " ")
    .trim();
  return sinMonto.charAt(0).toUpperCase() + sinMonto.slice(1, 40);
}

/** Devuelve lo que entendió (puede ser más de uno) o una lista vacía. */
export function entender(texto: string): Entendido[] {
  const t = texto.toLowerCase().normalize("NFC").trim();
  if (!t) return [];
  const fecha = fechaDe(t);
  const esIngreso = INGRESO.test(t);
  // Separa "menú 10 y pasaje 3" o "menú 10, pasaje 3".
  // La coma solo separa si no va entre números ("1,200" y "45,50" son montos).
  const trozos = t.split(/\s*(?:,(?!\d)|;|\sy\s|\+)\s*/).filter(Boolean);
  const salida: Entendido[] = [];
  let pendiente = "";
  for (const trozo of trozos) {
    const monto = leerMonto(trozo);
    if (monto === null) {
      pendiente = `${pendiente} ${trozo}`.trim();
      continue;
    }
    const frase = `${pendiente} ${trozo}`.trim();
    pendiente = "";
    const tipo = esIngreso ? "ingreso" : "gasto";
    const categoria = tipo === "ingreso" ? categoriaIngreso(frase) : categoriaGasto(frase);
    salida.push({
      tipo,
      monto,
      categoria,
      nota: limpiarNota(tipo === "ingreso" ? frase.replace(INGRESO_PALABRA, "") : frase) || categoria,
      fecha,
    });
  }
  return salida;
}
