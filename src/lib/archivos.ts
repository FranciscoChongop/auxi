/**
 * Archivos de la persona (los PDF de cada tema) guardados en el celular con IndexedDB.
 * Con cuenta, también se suben a una carpeta privada en Supabase Storage.
 */
import { BUCKET_ARCHIVOS, supabase } from "./supabase";

const BD = "auxi-archivos";
const TABLA = "archivos";

function abrir(): Promise<IDBDatabase> {
  return new Promise((ok, mal) => {
    const pedido = indexedDB.open(BD, 1);
    pedido.onupgradeneeded = () => pedido.result.createObjectStore(TABLA);
    pedido.onsuccess = () => ok(pedido.result);
    pedido.onerror = () => mal(pedido.error);
  });
}

async function con<T>(modo: IDBTransactionMode, fn: (t: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const bd = await abrir();
  return new Promise((ok, mal) => {
    const pedido = fn(bd.transaction(TABLA, modo).objectStore(TABLA));
    pedido.onsuccess = () => ok(pedido.result);
    pedido.onerror = () => mal(pedido.error);
  });
}

export type InfoArchivo = { id: string; nombre: string; tipo: string; peso: number };

/** Carpeta privada de la persona en el almacenamiento de Supabase: archivos/<id de usuario>/<id de archivo>. */
async function rutaEnNube(id: string) {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  const uid = data.session?.user.id;
  return uid ? `${uid}/${id}` : null;
}

export async function subirArchivoANube(id: string, blob: Blob) {
  const ruta = await rutaEnNube(id);
  if (!ruta || !supabase) return false;
  const { error } = await supabase.storage.from(BUCKET_ARCHIVOS).upload(ruta, blob, { upsert: true, contentType: blob.type || "application/pdf" });
  return !error;
}

export async function guardarArchivo(archivo: File): Promise<InfoArchivo> {
  const id = `a${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  await con("readwrite", (t) => t.put(archivo, id));
  void subirArchivoANube(id, archivo);
  return { id, nombre: archivo.name, tipo: archivo.type, peso: archivo.size };
}

export function leerArchivoLocal(id: string) {
  return con<Blob | undefined>("readonly", (t) => t.get(id));
}

/** Busca el archivo en el celular; si no está (otro celular), lo baja de la cuenta y lo guarda. */
export async function leerArchivo(id: string) {
  const local = await leerArchivoLocal(id);
  if (local) return local;
  const ruta = await rutaEnNube(id);
  if (!ruta || !supabase) return undefined;
  const { data } = await supabase.storage.from(BUCKET_ARCHIVOS).download(ruta);
  if (data) await con("readwrite", (t) => t.put(data, id));
  return data ?? undefined;
}

export async function borrarArchivo(id: string) {
  await con("readwrite", (t) => t.delete(id)).catch(() => undefined);
  const ruta = await rutaEnNube(id);
  if (ruta && supabase) await supabase.storage.from(BUCKET_ARCHIVOS).remove([ruta]);
}

export async function abrirArchivo(id: string) {
  const blob = await leerArchivo(id);
  if (!blob) return false;
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return true;
}

export function pesoBonito(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
}

export const PESO_MAXIMO = 25 * 1024 * 1024;

/** Al cerrar sesión: borra los PDF guardados en este celular (siguen en la cuenta). */
export function borrarTodoLocal() {
  return new Promise<void>((ok) => {
    const pedido = indexedDB.deleteDatabase(BD);
    pedido.onsuccess = pedido.onerror = pedido.onblocked = () => ok();
  });
}
