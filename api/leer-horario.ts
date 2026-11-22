/**
 * Función del servidor: recibe la foto de un horario y devuelve las clases ordenadas.
 * La clave de la API vive solo aquí (variable ANTHROPIC_API_KEY), nunca en el navegador.
 *
 * En Vercel se publica sola como /api/leer-horario. En desarrollo la sirve vite.config.ts.
 */
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";

const DIAS = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"] as const;
const TIPOS = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
const PESO_MAXIMO = 4_000_000; // caracteres de base64 (~3 MB de imagen)

const Horario = z.object({
  legible: z.boolean().describe("false si la foto no es un horario o no se puede leer"),
  mensaje: z.string().describe("Una frase corta en español para la persona: qué encontraste o qué faltó"),
  clases: z.array(
    z.object({
      curso: z.string().describe("Nombre del curso tal como aparece, sin códigos de sección si no son parte del nombre"),
      dia: z.enum(DIAS),
      inicio: z.string().describe("Hora de inicio en formato 24 h HH:MM"),
      fin: z.string().describe("Hora de fin en formato 24 h HH:MM"),
      aula: z.string().nullable().describe("Aula o salón si aparece; si no, null"),
    }),
  ),
});

const INSTRUCCIONES = `Lees fotos de horarios de clases de estudiantes (colegio, instituto o universidad) en Perú.
Devuelve cada clase como un bloque: curso, día, hora de inicio, hora de fin y aula si aparece.
- Si un curso ocupa varias filas seguidas el mismo día, devuélvelo como un solo bloque continuo.
- Usa formato de 24 horas. Si el horario usa am/pm o solo dice "7-8", conviértelo con sentido común (las clases de tarde y noche van después de las 12).
- No inventes clases, cursos ni horas que no se vean. Si algo es ilegible, déjalo fuera y dilo en "mensaje".
- Si la foto no es un horario, responde legible=false y clases vacío.`;

function respuesta(cuerpo: unknown, estado = 200) {
  return new Response(JSON.stringify(cuerpo), { status: estado, headers: { "content-type": "application/json" } });
}

const aMinutos = (h: string) => {
  const m = h.match(/^(\d{1,2}):(\d{2})$/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : NaN;
};
const normalizarHora = (h: string) => {
  const m = h.match(/^(\d{1,2}):(\d{2})$/);
  return m ? `${m[1].padStart(2, "0")}:${m[2]}` : null;
};

export async function POST(request: Request): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return respuesta({ error: "sin_clave", mensaje: "La lectura de fotos aún no está activada." }, 503);
  }

  let datos: { imagen?: unknown; tipo?: unknown };
  try {
    datos = await request.json();
  } catch {
    return respuesta({ error: "formato", mensaje: "No llegó la foto. Inténtalo otra vez." }, 400);
  }
  const imagen = typeof datos.imagen === "string" ? datos.imagen : "";
  const tipo = TIPOS.find((t) => t === datos.tipo);
  if (!imagen || !tipo || !/^[A-Za-z0-9+/=]+$/.test(imagen)) {
    return respuesta({ error: "formato", mensaje: "Esa foto no se pudo leer. Prueba con JPG o PNG." }, 400);
  }
  if (imagen.length > PESO_MAXIMO) {
    return respuesta({ error: "peso", mensaje: "La foto pesa mucho. Prueba con una más liviana." }, 413);
  }

  const client = new Anthropic();
  try {
    const r = await client.beta.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      // Si el modelo declina, el servidor de Anthropic reintenta con otro modelo adecuado.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: INSTRUCCIONES,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: tipo, data: imagen } },
            { type: "text", text: "Este es mi horario. Arma la lista de clases." },
          ],
        },
      ],
      output_config: { format: betaZodOutputFormat(Horario) },
    });

    if (r.stop_reason === "refusal" || !r.parsed_output) {
      return respuesta({ error: "ilegible", mensaje: "No pude leer este horario. Prueba con otra foto." }, 422);
    }
    const salida = r.parsed_output;
    // Se limpian horas raras antes de devolverlas.
    const clases = salida.clases.flatMap((c) => {
      const inicio = normalizarHora(c.inicio);
      const fin = normalizarHora(c.fin);
      if (!inicio || !fin || aMinutos(fin) <= aMinutos(inicio) || !c.curso.trim()) return [];
      return [{ curso: c.curso.trim(), dia: DIAS.indexOf(c.dia), inicio, fin, aula: c.aula?.trim() || undefined }];
    });
    return respuesta({ legible: salida.legible && clases.length > 0, mensaje: salida.mensaje, clases });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return respuesta({ error: "ocupado", mensaje: "Mucha gente leyendo horarios. Prueba en un minuto." }, 429);
    }
    if (error instanceof Anthropic.APIError) {
      console.error("leer-horario", error.status, error.message);
      return respuesta({ error: "api", mensaje: "No pude leer la foto ahora. Inténtalo otra vez." }, 502);
    }
    console.error("leer-horario", error);
    return respuesta({ error: "interno", mensaje: "Algo falló al leer la foto. Inténtalo otra vez." }, 500);
  }
}
