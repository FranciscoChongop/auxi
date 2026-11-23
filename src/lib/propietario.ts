/**
 * A qué cuenta pertenecen los datos guardados en este navegador.
 * Sirve para no mezclar cuentas en un equipo compartido: si entra otra persona,
 * los datos de la anterior se apartan (no se borran ni se suben a la cuenta nueva).
 */
const CLAVE = "auxi.propietario";
const RESPALDO = (uid: string) => `auxi.student.respaldo.${uid}`;

export type Decision = "unir" | "apartar";

/**
 * unir: los datos locales son de esta misma cuenta (o no tienen dueño, como los de antes de esta versión).
 * apartar: son de otra cuenta; no deben mezclarse ni subirse a la cuenta que entra.
 */
export function decidir(propietarioLocal: string | null, uid: string): Decision {
  return propietarioLocal && propietarioLocal !== uid ? "apartar" : "unir";
}

function leer(clave: string) {
  try {
    return localStorage.getItem(clave);
  } catch {
    return null;
  }
}

export function leerPropietario(): string | null {
  return leer(CLAVE);
}

export function guardarPropietario(uid: string | null) {
  try {
    if (uid) localStorage.setItem(CLAVE, uid);
    else localStorage.removeItem(CLAVE);
  } catch {
    // Sin almacenamiento: no hay nada que mezclar entre sesiones.
  }
}

/** Guarda aparte el avance de otra cuenta (lo recupera esa misma cuenta si vuelve a entrar aquí). */
export function apartarRespaldo(uid: string, estado: unknown) {
  try {
    localStorage.setItem(RESPALDO(uid), JSON.stringify(estado));
  } catch {
    // Si no cabe, se pierde solo lo no sincronizado; la nube conserva lo demás.
  }
}

/** Devuelve (y quita) el avance apartado de esta cuenta, si existe. */
export function tomarRespaldo(uid: string): unknown | null {
  const crudo = leer(RESPALDO(uid));
  if (!crudo) return null;
  try {
    localStorage.removeItem(RESPALDO(uid));
    return JSON.parse(crudo);
  } catch {
    return null;
  }
}

/* ---------- Aviso de cambio de cuenta (para que cada mini app cambie su espacio local) ---------- */

const oyentes = new Set<(uid: string | null) => void>();
let cuenta: string | null = null;

/** La cuenta con sesión ahora mismo (null si no hay). */
export const cuentaActual = () => cuenta;

export function alCambiarCuenta(fn: (uid: string | null) => void) {
  oyentes.add(fn);
  return () => oyentes.delete(fn);
}

export function avisarCambioDeCuenta(uid: string | null) {
  if (uid === cuenta) return;
  cuenta = uid;
  oyentes.forEach((fn) => fn(uid));
}
