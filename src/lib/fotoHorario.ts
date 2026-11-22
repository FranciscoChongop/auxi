import type { Clase } from "./horario";

/** Achica la foto a lo justo para leerla bien (lado mayor 2000 px, JPEG). Ahorra datos móviles. */
async function comprimir(archivo: File): Promise<{ base64: string; tipo: string }> {
  const bitmap = await createImageBitmap(archivo);
  const escala = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
  const lienzo = document.createElement("canvas");
  lienzo.width = Math.round(bitmap.width * escala);
  lienzo.height = Math.round(bitmap.height * escala);
  lienzo.getContext("2d")!.drawImage(bitmap, 0, 0, lienzo.width, lienzo.height);
  bitmap.close();
  const url = lienzo.toDataURL("image/jpeg", 0.85);
  return { base64: url.slice(url.indexOf(",") + 1), tipo: "image/jpeg" };
}

export type ResultadoFoto =
  | { ok: true; clases: Clase[]; mensaje: string }
  | { ok: false; sinClave: boolean; mensaje: string };

/** Envía la foto a la función del servidor, que la lee con Claude y devuelve las clases. */
export async function leerFotoDeHorario(archivo: File): Promise<ResultadoFoto> {
  try {
    const { base64, tipo } = await comprimir(archivo);
    const r = await fetch("/api/leer-horario", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ imagen: base64, tipo }),
    });
    const datos = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, sinClave: datos.error === "sin_clave", mensaje: datos.mensaje ?? "No pude leer la foto." };
    if (!datos.legible) return { ok: false, sinClave: false, mensaje: datos.mensaje || "No encontré clases en esa foto." };
    const clases: Clase[] = (datos.clases as Omit<Clase, "id">[]).map((c, i) => ({ ...c, id: `f${Date.now().toString(36)}${i}` }));
    return { ok: true, clases, mensaje: datos.mensaje ?? "" };
  } catch {
    return { ok: false, sinClave: false, mensaje: navigator.onLine ? "No pude leer la foto. Inténtalo otra vez." : "Necesitas internet para leer la foto." };
  }
}
