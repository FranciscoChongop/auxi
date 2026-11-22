/**
 * Sugerencias dentro de la app (marketing propio, sin terceros ni planes de pago).
 * Reglas:
 * - Como máximo una sugerencia por sesión.
 * - Una sugerencia descartada no vuelve en 7 días.
 * - No se promociona lo que la persona ya hizo.
 * - Solo se muestran en pantallas de reposo (Hoy), nunca durante una carga, revisión o confirmación.
 * - Se pueden apagar desde Perfil.
 * - Van separadas de los avisos operativos (errores, importación terminada).
 */
import { diasEntre, hoy, sumarDias } from "../lib/fechas";
import { actualizarVida, totalFrasco, type EstadoVida } from "./estado";
import { GMAIL_DISPONIBLE } from "./importar/gmail";
import { FORMATOS, FORMATOS_VERSION } from "./importar/importar";

export type Sugerencia = { id: string; titulo: string; texto: string; boton: string; ruta: string; tono: "suave" | "oro" };

/** La que ya salió en esta sesión (la única que puede volver a mostrarse mientras la app siga abierta). */
let deEstaSesion: string | null = null;

const descartadaHace7 = (e: EstadoVida, id: string) => {
  const f = e.sugerencias.descartes[id];
  return !!f && diasEntre(f, hoy()) < 7;
};

function candidatas(e: EstadoVida): Sugerencia[] {
  const h = hoy();
  const importo = e.importaciones.some((i) => !i.deshecha);
  const importoArchivo = e.importaciones.some((i) => !i.deshecha && i.fuente !== "gmail");
  const manualesRecientes = e.movimientos.filter((m) => (m.origen === "manual" || m.origen === "chat") && m.fecha >= sumarDias(h, -3)).length;
  const subioComprobante = e.importaciones.some((i) => !i.deshecha && (i.fuente === "comprobante" || i.fuente === "texto"));
  const ahorrado = e.frascos.reduce((s, f) => s + totalFrasco(f), 0);
  const lista: Sugerencia[] = [];

  if (manualesRecientes >= 3 && !subioComprobante)
    lista.push({ id: "comprobante", titulo: "¿Tienes el comprobante?", texto: "Súbelo y revisamos los datos por ti. Tú confirmas antes de guardar.", boton: "Subir comprobante", ruta: "/vida/importar?fuente=comprobante", tono: "suave" });
  if (e.iniciado && !importo)
    lista.push({ id: "importar", titulo: "Tus gastos, sin escribir uno por uno", texto: "Sube un reporte, una captura o pega un correo. León lo ordena y tú revisas.", boton: "Importar movimientos", ruta: "/vida/importar", tono: "suave" });
  if (GMAIL_DISPONIBLE && importoArchivo && !e.gmail?.email)
    lista.push({ id: "gmail", titulo: "También puedes conectar tu correo", texto: "Para traer tus comprobantes de Gmail cuando tú lo pidas.", boton: "Ver cómo funciona", ruta: "/vida/importar?fuente=gmail", tono: "suave" });
  if (e.primerAnotado && ahorrado === 0)
    lista.push({ id: "meta", titulo: "Ya comenzaste. ¿Quieres crear una meta?", texto: "Un frasco para tu colchón o para algo que quieras.", boton: "Crear una meta", ruta: "/vida/metas?nuevo=1", tono: "oro" });
  if (e.formatosVistos > 0 && e.formatosVistos < FORMATOS_VERSION)
    lista.push({ id: `novedad-${FORMATOS_VERSION}`, titulo: "Novedad", texto: `Ya puedo leer: ${FORMATOS[FORMATOS.length - 1].nombre}.`, boton: "Ver formatos", ruta: "/vida/importar", tono: "suave" });

  return lista.filter((s) => !descartadaHace7(e, s.id));
}

/** La sugerencia para Hoy, o ninguna. */
export function sugerenciaDeHoy(e: EstadoVida): Sugerencia | null {
  if (!e.sugerencias.activas) return null;
  const lista = candidatas(e);
  if (deEstaSesion) return lista.find((s) => s.id === deEstaSesion) ?? null;
  return lista[0] ?? null;
}

/** Se llama cuando la sugerencia realmente se ve: desde ahí, es la única de la sesión. */
export function marcarVista(id: string) {
  deEstaSesion = id;
}

export function descartarSugerencia(id: string) {
  actualizarVida((s) => ({ sugerencias: { ...s.sugerencias, descartes: { ...s.sugerencias.descartes, [id]: hoy() } } }));
}

export function activarSugerencias(activas: boolean) {
  actualizarVida((s) => ({ sugerencias: { ...s.sugerencias, activas } }));
}
