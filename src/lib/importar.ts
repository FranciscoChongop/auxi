import type { Ejercicio, Unidad } from "../data/tipos";
import { mezclar, normalizar } from "../juegos/corregir";

/**
 * Importar un curso armado por otra IA (ChatGPT, Claude o Gemini).
 * La persona copia el prompt, sube su PDF allá, copia la respuesta y la pega aquí.
 * Auxi no gasta nada: la lectura del PDF la hace la IA de la persona.
 */

export const PROMPT = `Eres un profesor experto y diseñador de juegos educativos. Te adjunto un material de estudio (PDF, apuntes o texto). PRIMERO léelo completo. Luego conviértelo en un curso para una app de estudio tipo juego.

Si no puedes abrir o leer el material, NO inventes nada: respóndeme solo "No pude leer el material".

Responde SOLO con un bloque de código JSON válido, sin texto antes ni después. Todo lo que está entre < > son instrucciones: REEMPLÁZALO por contenido real sacado del material. Nunca copies esas instrucciones.

{"curso":"<nombre real del curso>","tema":"<nombre real del tema>","unidades":[
 {"titulo":"<título real de la unidad>","resumen":"<2 frases con lo esencial de esa unidad>","lecciones":[
  {"titulo":"<título real de la lección>",
   "tarjetas":[{"frente":"<concepto clave del material>","reverso":"<su explicación en máximo 2 frases, con un ejemplo>"}],
   "ejercicios":[
    {"tipo":"opcion","pregunta":"<pregunta real>","opciones":["<a>","<b>","<c>","<d>"],"correcta":0,"explicacion":"<por qué>","pista":"<ayuda que no dé la respuesta>"},
    {"tipo":"vf","afirmacion":"<afirmación real>","respuesta":true,"explicacion":"<por qué>","pista":"<ayuda>"},
    {"tipo":"completar","frase":"<frase real con ___ donde va la palabra>","respuesta":"<palabra>","opciones":["<palabra>","<otra>","<otra>","<otra>"],"explicacion":"<por qué>","pista":"<ayuda>"},
    {"tipo":"escribir","pregunta":"<pregunta real>","respuestas":["<respuesta>","<variante válida>"],"explicacion":"<por qué>","pista":"<ayuda>"},
    {"tipo":"parejas","pares":[["<término>","<definición corta>"],["<término>","<definición corta>"],["<término>","<definición corta>"],["<término>","<definición corta>"]],"explicacion":"<por qué>"},
    {"tipo":"ordenar","instruccion":"<qué ordenar>","pasos":["<paso 1>","<paso 2>","<paso 3>"],"explicacion":"<por qué>","pista":"<ayuda>"},
    {"tipo":"clasificar","instruccion":"<qué clasificar>","grupos":["<grupo A>","<grupo B>"],"items":[{"texto":"<elemento>","grupo":0},{"texto":"<elemento>","grupo":1},{"texto":"<elemento>","grupo":0}],"explicacion":"<por qué>"}
   ]}
 ]}
]}

Reglas:
- Usa SOLO información del material. No inventes datos, fechas ni cifras.
- Haz entre 2 y 5 unidades, de lo básico a lo avanzado, en el orden del material. Cada unidad con 2 lecciones.
- Cada lección: 2 tarjetas para aprender y 8 ejercicios que mezclen los 7 tipos.
- "opcion": 4 opciones creíbles y una sola correcta. "correcta" es el número de la correcta, empezando en 0.
- "vf": "respuesta" es true o false. Que haya de los dos.
- "completar": la frase lleva ___ donde va la palabra; "opciones" trae esa palabra y 3 que confundan.
- "escribir": la respuesta es una o dos palabras; en "respuestas" pon variantes válidas.
- "parejas": 4 pares [término, definición de máximo 8 palabras].
- "ordenar": de 3 a 5 pasos en el orden correcto (la app los mezcla). Si el tema no tiene pasos, no uses este tipo.
- "clasificar": 4 a 6 elementos en 2 grupos; "grupo" es 0 o 1.
- "pista": nunca revela la respuesta, solo orienta.
- Español sencillo y frases cortas: se va a estudiar en el celular.
- Si te escribo "sigue", continúa con las unidades siguientes: mismo formato, mismo "curso" y mismo "tema".`;

export const IAS = [
  { nombre: "ChatGPT", url: "https://chatgpt.com/" },
  { nombre: "Claude", url: "https://claude.ai/new" },
  { nombre: "Gemini", url: "https://gemini.google.com/app" },
];

/* ---------- Leer lo que responde la IA ---------- */

function arreglar(s: string) {
  const dentro = (pos: number) => {
    let d = false;
    for (let i = 0; i < pos; i++) {
      const c = s.charAt(i);
      if (c === "\\") i++;
      else if (c === '"') d = !d;
    }
    return d;
  };
  return s.replace(/[“”„«»]/g, (m, off: number) => (dentro(off) ? m : '"')).replace(/,\s*([}\]])/g, "$1");
}

function cerrar(s: string) {
  const pila: string[] = [];
  let dentro = false;
  for (let i = 0; i < s.length; i++) {
    const c = s.charAt(i);
    if (dentro) {
      if (c === "\\") i++;
      else if (c === '"') dentro = false;
      continue;
    }
    if (c === '"') dentro = true;
    else if (c === "{" || c === "[") pila.push(c);
    else if (c === "}" || c === "]") pila.pop();
  }
  if (dentro) return null;
  let r = s.replace(/,\s*$/, "");
  while (pila.length) r += pila.pop() === "{" ? "}" : "]";
  return r;
}

/** Acepta ```json, comillas curvas, comas de más y respuestas cortadas a la mitad. */
export function leerJson(texto: string): { datos: unknown; cortado: boolean } {
  const t = texto.replace(/```(?:json|JSON)?/g, "").replace(/^﻿/, "");
  const i = t.indexOf("{");
  const j = t.lastIndexOf("}");
  if (i < 0) throw new Error("No encontré el curso. Copia toda la respuesta de la IA, desde la primera llave { .");
  const base = t.slice(i, j >= i ? j + 1 : t.length);
  for (const intento of [base, arreglar(base)]) {
    try {
      return { datos: JSON.parse(intento), cortado: false };
    } catch {
      // se prueba la siguiente forma
    }
  }
  const completo = arreglar(t.slice(i));
  for (let p = completo.length; p > 0 && completo.length - p < 200_000; p--) {
    const c = completo.charAt(p - 1);
    if (c !== "}" && c !== "]") continue;
    const cerrado = cerrar(completo.slice(0, p));
    if (!cerrado) continue;
    try {
      return { datos: JSON.parse(cerrado), cortado: true };
    } catch {
      // sigue buscando un punto donde cerrar
    }
  }
  throw new Error("No pude leer el curso. Pídele a la IA: «Dame solo el JSON completo, en un bloque de código» y pégalo otra vez.");
}

/* ---------- Dejar el curso limpio ---------- */

type Obj = Record<string, unknown>;
const lista = (x: unknown): unknown[] => (Array.isArray(x) ? x : []);
const obj = (x: unknown): Obj => (x && typeof x === "object" ? (x as Obj) : {});
const txt = (x: unknown, max = 400) => String(x ?? "").replace(/\s+/g, " ").trim().slice(0, max);
const campo = (o: Obj, nombres: string[]) => nombres.map((n) => o[n]).find((v) => v != null);

function ejercicio(raw: unknown): Ejercicio | null {
  const e = obj(raw);
  const tipo = normalizar(txt(campo(e, ["tipo", "type"])));
  const explicacion = txt(campo(e, ["explicacion", "explanation"]), 400);
  const pista = txt(campo(e, ["pista", "hint"]), 200) || undefined;
  const base = { explicacion: explicacion || "Revisa la tarjeta de la lección.", pista };

  if (/opcion|multiple|alternativa/.test(tipo)) {
    const opciones = lista(campo(e, ["opciones", "options"])).map((o) => txt(o, 160)).filter(Boolean);
    let correcta: unknown = campo(e, ["correcta", "answer", "correct"]);
    if (typeof correcta === "string" && !/^\d+$/.test(correcta)) {
      const porTexto = opciones.map(normalizar).indexOf(normalizar(correcta));
      correcta = porTexto >= 0 ? porTexto : "abcd".indexOf(correcta.trim().toLowerCase());
    }
    const n = Number(correcta);
    const pregunta = txt(campo(e, ["pregunta", "question"]), 300);
    if (!pregunta || opciones.length < 2 || !(n >= 0 && n < opciones.length)) return null;
    return { ...base, tipo: "opcion", pregunta, opciones, correcta: n };
  }
  if (/^vf$|verdadero|true|falso/.test(tipo)) {
    const afirmacion = txt(campo(e, ["afirmacion", "statement", "pregunta"]), 300);
    const r = campo(e, ["respuesta", "answer"]);
    const valor: boolean | null =
      typeof r === "boolean"
        ? r
        : typeof r === "string"
          ? /^(true|verdadero|v|si|sí)$/i.test(r.trim())
            ? true
            : /^(false|falso|f|no)$/i.test(r.trim())
              ? false
              : null
          : null;
    if (!afirmacion || valor === null) return null;
    return { ...base, tipo: "vf", afirmacion, respuesta: valor };
  }
  if (/complet|blank/.test(tipo)) {
    let frase = txt(campo(e, ["frase", "sentence"]), 300);
    const respuesta = txt(campo(e, ["respuesta", "answer"]), 60);
    if (!frase || !respuesta) return null;
    if (!/_{2,}/.test(frase)) {
      const pos = frase.toLowerCase().indexOf(respuesta.toLowerCase());
      if (pos < 0) return null;
      frase = frase.slice(0, pos) + "___" + frase.slice(pos + respuesta.length);
    }
    const opciones = lista(campo(e, ["opciones", "options"])).map((o) => txt(o, 60)).filter(Boolean);
    return { ...base, tipo: "completar", frase: frase.replace(/_{2,}/, "___"), respuesta, opciones };
  }
  if (/escrib|abierta|corta/.test(tipo)) {
    const pregunta = txt(campo(e, ["pregunta", "question"]), 300);
    const unica = campo(e, ["respuesta", "answer"]);
    const respuestas = [...lista(campo(e, ["respuestas", "answers"])), ...(unica ? [unica] : [])].map((r) => txt(r, 80)).filter(Boolean);
    if (!pregunta || !respuestas.length) return null;
    return { ...base, tipo: "escribir", pregunta, respuestas: [...new Set(respuestas)] };
  }
  if (/pareja|match|relaciona|une/.test(tipo)) {
    const pares = lista(campo(e, ["pares", "pairs"]))
      .map((p): [string, string] => {
        if (Array.isArray(p)) return [txt(p[0], 90), txt(p[1], 120)];
        const o = obj(p);
        return [txt(campo(o, ["termino", "a", "izquierda"]), 90), txt(campo(o, ["definicion", "b", "derecha"]), 120)];
      })
      .filter((p) => p[0] && p[1])
      .slice(0, 5);
    const izq = pares.map((p) => normalizar(p[0]));
    const der = pares.map((p) => normalizar(p[1]));
    if (pares.length < 2 || new Set(izq).size < izq.length || new Set(der).size < der.length) return null;
    return { ...base, tipo: "parejas", pares };
  }
  if (/orden|secuencia|sequence/.test(tipo)) {
    const pasos = lista(campo(e, ["pasos", "steps"])).map((p) => txt(p, 140)).filter(Boolean).slice(0, 6);
    if (pasos.length < 3 || new Set(pasos.map(normalizar)).size < pasos.length) return null;
    return { ...base, tipo: "ordenar", instruccion: txt(campo(e, ["instruccion", "instruction"]), 160) || "Ordena los pasos", pasos };
  }
  if (/clasific|categor|grupo/.test(tipo)) {
    const grupos = lista(campo(e, ["grupos", "groups"])).map((g) => txt(g, 40)).filter(Boolean);
    const items = lista(campo(e, ["items", "elementos"]))
      .map((i) => {
        const o = obj(i);
        const g = Number(campo(o, ["grupo", "group"]));
        return { texto: txt(campo(o, ["texto", "text"]), 60), grupo: (g === 1 ? 1 : 0) as 0 | 1 };
      })
      .filter((i) => i.texto)
      .slice(0, 6);
    if (grupos.length < 2 || items.length < 3 || !items.some((i) => i.grupo === 0) || !items.some((i) => i.grupo === 1)) return null;
    return {
      ...base,
      tipo: "clasificar",
      instruccion: txt(campo(e, ["instruccion", "instruction"]), 160) || "Clasifica",
      grupos: [grupos[0], grupos[1]],
      items,
    };
  }
  return null;
}

export type CursoImportado = { curso: string; tema: string; unidades: Unidad[]; cortado: boolean; descartados: number };

/** Frases del ejemplo del prompt. Si llegan tal cual, la IA no leyó el material. */
const DE_PLANTILLA = [
  "idea clave corta",
  "nombre de la leccion",
  "nombre de la unidad",
  "nombre del curso",
  "nombre del tema",
  "explicacion en maximo 2 frases",
  "lo esencial en 2 frases",
  "concepto clave del material",
  "titulo real",
  "pregunta real",
  "afirmacion real",
  "frase real",
  "nombre real",
];

export function parecePlantilla(texto: string) {
  const t = normalizar(texto);
  const golpes = DE_PLANTILLA.filter((f) => t.includes(f)).length;
  return golpes >= 2 || /<\s*(nombre|titulo|pregunta|afirmacion|frase|concepto)[^>]{0,40}>/i.test(texto.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
}

const AVISO_PLANTILLA =
  "La IA te devolvió el ejemplo sin llenar: no leyó tu material. Revisa que haya podido abrir el archivo (si es muy pesado, pega el texto en el chat) y pídele: «Lee el material y llena el JSON con su contenido real».";

export function importarDeTexto(texto: string): CursoImportado {
  if (/no pude leer el material/i.test(texto) && !/\{/.test(texto)) throw new Error("La IA dice que no pudo leer tu material. Prueba subirlo de nuevo, usar otra IA, o pegar el texto en el chat.");
  const { datos, cortado } = leerJson(texto);
  if (parecePlantilla(JSON.stringify(datos))) throw new Error(AVISO_PLANTILLA);
  const raw = obj(datos);
  const todasRespuestas: string[] = [];
  let descartados = 0;
  const unidades: Unidad[] = [];

  for (const u of lista(campo(raw, ["unidades", "units"]))) {
    const uo = obj(u);
    const lecciones: Unidad["lecciones"] = [];
    for (const l of lista(campo(uo, ["lecciones", "lessons"]))) {
      const lo = obj(l);
      const tarjetas = lista(campo(lo, ["tarjetas", "cards"]))
        .map((t) => ({ frente: txt(obj(t).frente ?? obj(t).front, 120), reverso: txt(obj(t).reverso ?? obj(t).back, 500) }))
        .filter((t) => t.frente && t.reverso);
      const ejercicios: Ejercicio[] = [];
      for (const e of lista(campo(lo, ["ejercicios", "exercises"]))) {
        const x = ejercicio(e);
        if (!x) {
          descartados++;
          continue;
        }
        ejercicios.push(x);
        if (x.tipo === "completar") todasRespuestas.push(x.respuesta);
      }
      if (ejercicios.length >= 2) lecciones.push({ titulo: txt(campo(lo, ["titulo", "title"]), 90) || "Lección", tarjetas, ejercicios });
    }
    if (lecciones.length) unidades.push({ titulo: txt(campo(uo, ["titulo", "title"]), 90) || "Unidad", resumen: txt(campo(uo, ["resumen", "summary"]), 600), lecciones });
  }

  // "Completar" sin opciones suficientes: se completan con respuestas de otros ejercicios.
  for (const u of unidades)
    for (const l of u.lecciones)
      for (const e of l.ejercicios) {
        if (e.tipo !== "completar") continue;
        const ops = e.opciones.filter((o) => normalizar(o) !== normalizar(e.respuesta));
        const extra = mezclar(todasRespuestas.filter((o) => normalizar(o) !== normalizar(e.respuesta)));
        while (ops.length < 3 && extra.length) {
          const o = extra.pop()!;
          if (!ops.map(normalizar).includes(normalizar(o))) ops.push(o);
        }
        e.opciones = mezclar([e.respuesta, ...ops.slice(0, 3)]);
      }

  if (!unidades.length) throw new Error("El curso vino vacío o sin ejercicios. Pídele a la IA que lo haga de nuevo con el prompt.");
  return {
    curso: txt(campo(raw, ["curso", "materia", "course"]), 80) || "Mi curso",
    tema: txt(campo(raw, ["tema", "titulo", "title"]), 80) || "Mi tema",
    unidades,
    cortado,
    descartados,
  };
}
