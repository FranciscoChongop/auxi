/**
 * Protégete: un solo asistente que revisa una situación antes de actuar.
 * León busca señales comunes en lo que cuenta la persona y en sus respuestas.
 * No abre enlaces ni lee imágenes todavía (la IA llega en la Fase V3), y lo dice.
 * Nunca da porcentajes ni dice "100 % seguro".
 */

export type TipoCaso = "mensaje" | "enlace" | "compra" | "pago" | "inversion" | "otro";

export const TIPOS: { id: TipoCaso; titulo: string; detalle: string; icono: string }[] = [
  { id: "mensaje", titulo: "Mensaje o llamada", detalle: "WhatsApp, SMS, correo o lo que te dijeron por teléfono.", icono: "M4 5.5h16v10H9l-5 4z" },
  { id: "enlace", titulo: "Enlace o página", detalle: "Una tienda, un enlace de pago o un formulario.", icono: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" },
  { id: "compra", titulo: "Compra o vendedor", detalle: "Una publicación, un perfil o una conversación de compra.", icono: "M5 8h14l-1.2 11H6.2zM9 8a3 3 0 0 1 6 0" },
  { id: "pago", titulo: "Pago o comprobante", detalle: "Una captura de Yape, Plin o transferencia que te mandaron.", icono: "M3.5 6.5h17v11h-17zM3.5 10.5h17M7 14.5h3" },
  { id: "inversion", titulo: "Inversión, préstamo o trabajo", detalle: "Ganancias prometidas, cobros por adelantado o pedidos raros.", icono: "M4 18l5-5 3 3 7-8M15 8h4v4" },
  { id: "otro", titulo: "Otra situación", detalle: "Cuéntalo con tus palabras, sin elegir categoría.", icono: "M12 17h.01M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14" },
];

export type Pregunta = { id: string; texto: string; opciones: string[]; multiple?: boolean; libre?: boolean };

const COMUNES: Pregunta[] = [
  { id: "pagaste", texto: "¿Ya pagaste o compartiste algo?", opciones: ["No", "Sí, pagué", "Sí, di datos", "No sé"] },
  { id: "apuro", texto: "¿Te están apurando?", opciones: ["Sí", "No", "No sé"] },
  { id: "pidieron", texto: "¿Qué te pidieron?", opciones: ["Plata o un adelanto", "Una clave", "Un código que me llegó", "Datos de mi tarjeta", "DNI o fotos", "Instalar una app", "Nada todavía"], multiple: true },
];

const PROPIAS: Record<TipoCaso, Pregunta[]> = {
  mensaje: [
    { id: "entidad", texto: "¿Dicen ser de un banco, Yape o una entidad?", opciones: ["Sí", "No", "No sé"] },
    { id: "familiar", texto: "¿Dicen ser un familiar o amigo con número nuevo?", opciones: ["Sí", "No"] },
  ],
  enlace: [
    { id: "llego", texto: "¿Cómo te llegó el enlace?", opciones: ["Por mensaje", "Por un anuncio", "Lo busqué yo", "No sé"] },
    { id: "parecido", texto: "¿La dirección se parece a una marca, pero con letras o palabras raras?", opciones: ["Sí", "No", "No sé"] },
  ],
  compra: [
    { id: "adelanto", texto: "¿Te piden pagar por adelantado?", opciones: ["Sí, todo", "Sí, una parte", "No, pago al recibir"] },
    { id: "negocio", texto: "¿Cómo se llama el negocio o vendedor?", opciones: [], libre: true },
    { id: "titular", texto: "¿A nombre de quién está la cuenta o el Yape donde pagarías?", opciones: [], libre: true },
    { id: "verlo", texto: "¿Puedes ver el producto o recogerlo en persona?", opciones: ["Sí", "No", "No me dejan"] },
  ],
  pago: [
    { id: "revisaste", texto: "¿Revisaste tu app (no la captura) y la plata está ahí?", opciones: ["Sí, llegó", "No llegó", "Todavía no reviso"] },
    { id: "devolver", texto: "¿Te piden devolver plata o entregar algo ya?", opciones: ["Sí", "No"] },
  ],
  inversion: [
    { id: "ganancia", texto: "¿Te prometen ganancias seguras o muy altas?", opciones: ["Sí", "No", "No sé"] },
    { id: "cobro", texto: "¿Te cobran antes para darte el préstamo, el trabajo o la ganancia?", opciones: ["Sí", "No"] },
    { id: "reclutar", texto: "¿Te piden traer a más personas?", opciones: ["Sí", "No"] },
  ],
  otro: [],
};

export const preguntasDe = (tipo: TipoCaso) => [...COMUNES, ...PROPIAS[tipo]];

/* ---------- Señales en el texto ---------- */

const REGLAS: { id: string; re: RegExp; titulo: string; detalle: string; peso: number }[] = [
  { id: "clave", re: /clave|contrase[ñn]a|c[oó]digo (de )?(verificaci[oó]n|seguridad|sms)|token|\bpin\b|cvv|c[oó]digo que te (lleg|envi)/i, titulo: "Piden una clave o un código", detalle: "Ningún banco, Yape ni entidad te pide claves o códigos por mensaje.", peso: 4 },
  { id: "enlace", re: /https?:\/\/|www\.|bit\.ly|tinyurl|\.xyz|\.top|\.click|\.online|\.site|wa\.me\//i, titulo: "Trae un enlace", detalle: "Puede llevar a una página falsa. Entra tú mismo a la app o web oficial.", peso: 2 },
  { id: "urgencia", re: /urgente|inmediat|hoy mismo|[uú]ltim[oa]s? (horas|aviso|oportunidad)|antes de las|ser[aá] (bloquead|suspendid|cancelad)|bloque(ad|amos)|suspend|caduca|vence hoy/i, titulo: "Te apuran", detalle: "La prisa es un truco para que no pienses.", peso: 2 },
  { id: "premio", re: /ganaste|ganador|premio|sorteo|felicidades|has sido seleccionad|bono de/i, titulo: "Prometen un premio", detalle: "Si no participaste en un sorteo, no puedes haberlo ganado.", peso: 2 },
  { id: "pago", re: /yap[eé]a|plin[eé]a|deposit|transfi[eé]r|adelanto|comisi[oó]n|garant[ií]a|pago (por|de) (env[ií]o|tr[aá]mite|liberaci)|desbloque/i, titulo: "Piden pagar o depositar", detalle: "Pagar antes para recibir algo es la señal más común de estafa.", peso: 3 },
  { id: "entidad", re: /\bbcp\b|interbank|bbva|scotiabank|banco de la naci[oó]n|\byape\b|\bplin\b|sunat|reniec|sunarp|essalud|sutran|serpost|olva|bitel|movistar|claro|entel/i, titulo: "Usan el nombre de una empresa o entidad", detalle: "Cualquiera puede poner ese nombre. Confirma por el canal oficial.", peso: 1 },
  { id: "familiar", re: /cambi[eé] de n[uú]mero|este es mi nuevo n[uú]mero|estoy en (problemas|apuros)|me (robaron|asaltaron)|pr[eé]stame|no le digas a/i, titulo: "Un “familiar” con número nuevo", detalle: "Llama al número de siempre de esa persona antes de mandar plata.", peso: 3 },
  { id: "facil", re: /gana(r)? desde (tu )?casa|dar like|tareas pagadas|inversi[oó]n|rentabilidad|duplica|triplica|ganancia (segura|garantizada)|cripto|trading/i, titulo: "Plata fácil o inversión milagrosa", detalle: "Nadie garantiza ganancias altas y rápidas.", peso: 3 },
  { id: "porerror", re: /te (yape|plin|deposit|transfer)[eé]|ya te (pagu|deposit|yape)|me equivoqu[eé]|devu[eé]lveme|por error/i, titulo: "Dicen que te mandaron plata “por error”", detalle: "Revisa tu app, no la captura. Las capturas se pueden editar.", peso: 3 },
];

export type Senal = { id: string; titulo: string; detalle: string; peso: number };

/** Oculta números de tarjeta, códigos y claves antes de guardar lo que pegó la persona. */
export function ocultarSensibles(t: string) {
  return t
    .replace(/\b(?:\d[ -]?){13,19}\b/g, "[tarjeta oculta]")
    .replace(/((?:clave|contrase[ñn]a|pin|c[oó]digo|token|cvv)\s*(?:es|:)?\s*)\S+/gi, "$1[oculto]")
    .replace(/\b\d{8}\b/g, "[número oculto]");
}

export type Analisis = {
  nivel: "alto" | "medio" | "bajo";
  titulo: string;
  resumen: string;
  senales: Senal[];
  noComprobado: string[];
  pasos: string[];
  urgente: boolean;
};

const r = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? [v] : []);
const normal = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

export function analizar(tipo: TipoCaso, textos: string[], respuestas: Record<string, string | string[]>, conImagen: boolean): Analisis {
  const todo = textos.join("\n");
  const senales: Senal[] = REGLAS.filter((x) => x.re.test(todo)).map(({ id, titulo, detalle, peso }) => ({ id, titulo, detalle, peso }));
  const suma = (s: Senal) => {
    if (!senales.some((x) => x.id === s.id)) senales.push(s);
  };
  const pidieron = r(respuestas.pidieron);

  if (respuestas.apuro === "Sí") suma({ id: "urgencia", titulo: "Te apuran", detalle: "La prisa es un truco para que no pienses.", peso: 2 });
  if (pidieron.includes("Una clave") || pidieron.includes("Un código que me llegó") || pidieron.includes("Datos de mi tarjeta"))
    suma({ id: "clave", titulo: "Piden claves, códigos o datos de tu tarjeta", detalle: "Nadie de verdad te los pedirá por mensaje.", peso: 4 });
  if (pidieron.includes("Instalar una app")) suma({ id: "app", titulo: "Piden instalar una app", detalle: "Algunas apps dejan que otro controle tu celular o lea tus códigos.", peso: 4 });
  if (pidieron.includes("Plata o un adelanto")) suma({ id: "pago", titulo: "Piden plata o un adelanto", detalle: "Pagar antes para recibir algo es la señal más común de estafa.", peso: 3 });
  if (respuestas.familiar === "Sí") suma({ id: "familiar", titulo: "Un “familiar” con número nuevo", detalle: "Llama al número de siempre antes de mandar plata.", peso: 3 });
  if (respuestas.parecido === "Sí") suma({ id: "parecido", titulo: "La dirección imita a una marca", detalle: "Las páginas falsas usan nombres casi iguales a los reales.", peso: 3 });
  if (respuestas.adelanto === "Sí, todo") suma({ id: "adelanto", titulo: "Exigen pagar todo por adelantado", detalle: "Si no hay forma de ver o recibir el producto antes, el riesgo es tuyo.", peso: 3 });
  if (respuestas.verlo === "No me dejan") suma({ id: "verlo", titulo: "No te dejan ver ni recoger el producto", detalle: "Un vendedor real suele aceptar que lo veas.", peso: 2 });
  if (respuestas.revisaste === "No llegó") suma({ id: "nollego", titulo: "La plata no está en tu app", detalle: "Lo que cuenta es tu app, no la captura que te mandaron.", peso: 4 });
  if (respuestas.devolver === "Sí") suma({ id: "devolver", titulo: "Te piden devolver o entregar algo rápido", detalle: "Es el truco del “te pagué de más”.", peso: 3 });
  if (respuestas.ganancia === "Sí") suma({ id: "facil", titulo: "Prometen ganancias seguras o muy altas", detalle: "Nadie puede garantizarlas.", peso: 3 });
  if (respuestas.cobro === "Sí") suma({ id: "cobro", titulo: "Cobran antes de darte el préstamo o el trabajo", detalle: "Un préstamo o trabajo real no te cobra por adelantado para dártelo.", peso: 4 });
  if (respuestas.reclutar === "Sí") suma({ id: "reclutar", titulo: "Piden traer a más personas", detalle: "Si ganas por sumar gente, puede ser un esquema piramidal.", peso: 3 });

  // Información que se contradice: el titular de la cuenta no es el negocio.
  const negocio = normal(String(respuestas.negocio ?? ""));
  const titular = normal(String(respuestas.titular ?? ""));
  if (negocio && titular) {
    const comparten = negocio.split(" ").some((p) => p.length > 2 && titular.includes(p));
    if (!comparten)
      suma({ id: "titular", titulo: "El titular de la cuenta no coincide con el negocio", detalle: `Dices que el negocio es «${String(respuestas.negocio).slice(0, 40)}», pero pagarías a «${String(respuestas.titular).slice(0, 40)}».`, peso: 3 });
  }

  const puntos = senales.reduce((s, x) => s + x.peso, 0);
  const nivel: Analisis["nivel"] = puntos >= 5 || senales.some((s) => s.peso >= 4) ? "alto" : puntos >= 2 ? "medio" : "bajo";
  const urgente = respuestas.pagaste === "Sí, pagué" || respuestas.pagaste === "Sí, di datos";

  const noComprobado = [
    ...(tipo === "enlace" || senales.some((s) => s.id === "enlace") ? ["León no abrió el enlace: solo leyó el texto que pegaste."] : []),
    ...(conImagen ? ["León todavía no lee imágenes: solo usó lo que escribiste."] : []),
    ...(tipo === "compra" ? ["Quién controla realmente el perfil o la cuenta.", "Si entregará el producto."] : []),
    ...(tipo === "pago" ? ["Una captura no confirma que la plata llegó. Solo tu app o tu banco lo confirman."] : []),
    ...(tipo === "mensaje" ? ["Quién envió el mensaje de verdad: el nombre que aparece se puede falsificar."] : []),
    ...(tipo === "inversion" ? ["Si la empresa está autorizada. Puedes consultarlo en la web oficial de la SBS o la SMV."] : []),
  ];

  const pasos =
    nivel === "alto"
      ? [
          "No pagues ni compartas nada más por ahora.",
          ...(senales.some((s) => s.id === "titular") ? ["Antes de pagar, verifica esa diferencia de nombres por un canal independiente (la web o tienda oficial)."] : []),
          "Confirma por tu cuenta: entra a la app o web oficial, o llama al número que tú buscaste, no al del mensaje.",
          "Si puedes, bloquea y reporta el número o el perfil.",
        ]
      : nivel === "medio"
        ? ["Espera antes de actuar: lo real puede esperar a que lo revises.", "Confirma por otro camino lo que te dicen.", "Si te piden plata o datos, más razón para verificar primero."]
        : ["No vimos señales comunes, pero eso no lo hace seguro.", "Si en algún momento te piden plata, claves o códigos, vuelve a revisarlo aquí."];

  const titulo = nivel === "alto" ? "Hay señales de riesgo" : nivel === "medio" ? "Hay cosas que conviene revisar" : "No vimos señales comunes";
  const resumen = senales.length
    ? senales
        .slice(0, 2)
        .map((s) => s.titulo)
        .join(" y ") + "."
    : "Con lo que contaste no encontramos señales típicas de estafa.";
  return { nivel, titulo, resumen, senales: senales.sort((a, b) => b.peso - a.peso), noComprobado, pasos, urgente };
}

/** Resumen para compartir: sin el texto pegado ni datos personales. */
export function textoParaCompartir(tipo: TipoCaso, a: Analisis) {
  const t = TIPOS.find((x) => x.id === tipo)?.titulo ?? "Situación";
  return [`Revisé un caso con León (Auxi Vida): ${t}.`, `${a.titulo}.`, ...a.senales.slice(0, 4).map((s) => `• ${s.titulo}`), "", "Antes de actuar:", ...a.pasos.slice(0, 3).map((p) => `• ${p}`)].join("\n");
}

/* ---------- Ya pagué o compartí mis datos ---------- */

export const INCIDENTES: { id: string; titulo: string; pasos: string[] }[] = [
  {
    id: "transferencia",
    titulo: "Hice una transferencia o un Yape/Plin",
    pasos: [
      "Entra ya a tu app o llama a tu banco al número de su web oficial o de tu tarjeta. Cuenta lo que pasó y pregunta si pueden detener la operación (no siempre se puede).",
      "Guarda capturas: el chat, el número, el nombre de la cuenta a la que pagaste, la fecha y el monto.",
      "Haz la denuncia en una comisaría. Lleva tus capturas.",
      "Desconfía de quien te ofrezca “recuperar tu plata” cobrando: es otra estafa común.",
    ],
  },
  {
    id: "tarjeta",
    titulo: "Di los datos de mi tarjeta",
    pasos: [
      "Bloquea la tarjeta desde la app de tu banco o llamando al número que está detrás de la tarjeta.",
      "Revisa tus movimientos y avisa al banco de los que no hiciste.",
      "Pide una tarjeta nueva.",
    ],
  },
  {
    id: "clave",
    titulo: "Di mi contraseña o clave",
    pasos: [
      "Cámbiala ya desde la app o web oficial (no desde el enlace que te mandaron).",
      "Si usas esa misma clave en otros lados, cámbiala ahí también.",
      "Si era la clave de tu banco, avísale al banco.",
      "Activa la verificación en dos pasos donde se pueda.",
    ],
  },
  {
    id: "codigo",
    titulo: "Di un código que me llegó",
    pasos: [
      "Si el código era del banco o de Yape, llama a tu banco ya: ese código pudo servir para entrar a tu cuenta o afiliar otro celular.",
      "Si era de WhatsApp, entra a WhatsApp y activa la verificación en dos pasos. Avisa a tus contactos que no respondan pedidos de plata a tu nombre.",
      "Revisa tus movimientos y tus sesiones abiertas.",
    ],
  },
  {
    id: "app",
    titulo: "Instalé una app que me pidieron",
    pasos: [
      "Apaga el internet del celular y desinstala esa app.",
      "No entres a tu banco desde ese celular hasta revisarlo.",
      "Desde otro equipo, cambia las claves de tu banco y de tu correo.",
      "Avisa a tu banco de lo que pasó.",
    ],
  },
  {
    id: "dni",
    titulo: "Di mi DNI o fotos de mi documento",
    pasos: [
      "Haz la denuncia en una comisaría para dejar constancia.",
      "Revisa de vez en cuando si aparecen deudas a tu nombre: el reporte de deudas de la SBS es gratuito.",
      "Si te llaman cobrando algo que no pediste, no pagues: pide todo por escrito.",
    ],
  },
];
