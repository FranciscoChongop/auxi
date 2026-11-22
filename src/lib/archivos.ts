/**
 * Archivos de la persona (los PDF de cada tema) guardados en el celular con IndexedDB.
 * Solo viven en este dispositivo hasta que llegue la cuenta (Fase 3).
 */
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

export async function guardarArchivo(archivo: File): Promise<InfoArchivo> {
  const id = `a${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  await con("readwrite", (t) => t.put(archivo, id));
  return { id, nombre: archivo.name, tipo: archivo.type, peso: archivo.size };
}

export function leerArchivo(id: string) {
  return con<Blob | undefined>("readonly", (t) => t.get(id));
}

export function borrarArchivo(id: string) {
  return con("readwrite", (t) => t.delete(id)).catch(() => undefined);
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
