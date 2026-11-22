/**
 * Revisión rápida de León: busca señales típicas de estafa en un mensaje.
 * No es una IA ni da certeza: solo muestra señales y qué hacer. (La IA llega en la Fase V3.)
 */

export type Nivel = "bajo" | "medio" | "alto";
export type Senal = { id: string; titulo: string; detalle: string; peso: number };

const REGLAS: { id: string; re: RegExp; titulo: string; detalle: string; peso: number }[] = [
  {
    id: "clave",
    re: /clave|contrase[ñn]a|c[oó]digo (de )?(verificaci[oó]n|seguridad|sms)|token|\bpin\b|cvv|c[oó]digo que te (lleg|envi)/i,
    titulo: "Pide una clave o un código",
    detalle: "Ningún banco, Yape ni entidad te pide claves o códigos por mensaje.",
    peso: 4,
  },
  {
    id: "enlace",
    re: /https?:\/\/|www\.|bit\.ly|tinyurl|\.xyz|\.top|\.click|\.online|wa\.me\//i,
    titulo: "Trae un enlace",
    detalle: "Los enlaces pueden llevar a páginas falsas. Entra tú mismo a la app o web oficial.",
    peso: 2,
  },
  {
    id: "urgencia",
    re: /urgente|inmediat|hoy mismo|[uú]ltim[oa]s? (horas|aviso|oportunidad)|antes de las|ser[aá] (bloquead|suspendid|cancelad)|bloque(ad|amos)|suspend|caduca|vence hoy/i,
    titulo: "Te apura",
    detalle: "La prisa es un truco para que no pienses. Lo de verdad puede esperar a que lo revises.",
    peso: 2,
  },
  {
    id: "premio",
    re: /ganaste|ganador|premio|sorteo|felicidades|has sido seleccionad|regalo|bono de/i,
    titulo: "Promete un premio",
    detalle: "Si no participaste en un sorteo, no puedes haberlo ganado.",
    peso: 2,
  },
  {
    id: "pago",
    re: /yap[eé]a|yapea(me)?|pl[ií]n[eé]a|deposit|transfi[eé]r|adelanto|comisi[oó]n|garant[ií]a|pago (por|de) (env[ií]o|tr[aá]mite|liberaci)|desbloque/i,
    titulo: "Te pide pagar o depositar",
    detalle: "Pedir un pago previo para recibir algo es la señal más común de estafa.",
    peso: 3,
  },
  {
    id: "entidad",
    re: /\bbcp\b|interbank|bbva|scotiabank|banco de la naci[oó]n|\byape\b|\bplin\b|sunat|reniec|sunarp|essalud|sutran|serpost|olva|bitel|movistar|claro|entel/i,
    titulo: "Dice ser de una empresa o entidad",
    detalle: "Cualquiera puede poner ese nombre. Confirma llamando al número oficial.",
    peso: 1,
  },
  {
    id: "familiar",
    re: /cambi[eé] de n[uú]mero|este es mi nuevo n[uú]mero|estoy en (problemas|apuros)|me (robaron|asaltaron)|pr[eé]stame|no le digas a/i,
    titulo: "Un “familiar” con un número nuevo",
    detalle: "Llama al número de siempre de esa persona antes de mandar plata.",
    peso: 3,
  },
  {
    id: "facil",
    re: /gana(r)? desde (tu )?casa|dar like|tareas pagadas|inversi[oó]n|rentabilidad|duplica|triplica|ganancia (segura|garantizada)|cripto|trading/i,
    titulo: "Plata fácil o inversión milagrosa",
    detalle: "Nadie garantiza ganancias altas y rápidas. Si suena demasiado bueno, desconfía.",
    peso: 3,
  },
  {
    id: "comprobante",
    re: /te (yape|plin|deposit|transfer)[eé]|ya te (pagu|deposit|yape)|me equivoqu[eé]|devu[eé]lveme|por error/i,
    titulo: "Dice que te mandó plata “por error”",
    detalle: "Revisa tu app de Yape o del banco, no la captura que te mandan. Las capturas se pueden falsificar.",
    peso: 3,
  },
];

export type Resultado = { nivel: Nivel; senales: Senal[]; consejos: string[] };

export function revisar(texto: string): Resultado {
  const senales = REGLAS.filter((r) => r.re.test(texto)).map(({ id, titulo, detalle, peso }) => ({ id, titulo, detalle, peso }));
  const puntos = senales.reduce((s, x) => s + x.peso, 0);
  const nivel: Nivel = puntos >= 5 || senales.some((s) => s.id === "clave") ? "alto" : puntos >= 2 ? "medio" : "bajo";
  const consejos =
    nivel === "alto"
      ? ["No respondas ni toques los enlaces.", "No des claves, códigos ni datos de tu tarjeta.", "Si ya diste algún dato, llama de inmediato a tu banco al número oficial.", "Bloquea y reporta el número."]
      : nivel === "medio"
        ? ["No mandes plata ni datos todavía.", "Confirma por otro camino: llama al número oficial o a la persona de siempre.", "Si te apuran, más razón para esperar."]
        : ["No vi señales comunes de estafa, pero eso no lo hace seguro.", "Si te piden plata o datos, confirma por otro camino antes."];
  return { nivel, senales, consejos };
}
