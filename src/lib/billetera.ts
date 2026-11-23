/**
 * Monedas protegidas en el servidor (supabase/migraciones/2026-11-23-seguridad.sql).
 * El servidor decide cuánto se gana (con topes diarios), cobra las compras y sortea el cofre.
 * La app solo muestra lo que el servidor confirma.
 *
 * Si la migración aún no está instalada (o en pruebas locales sin cuenta), todo sigue funcionando
 * en el navegador como antes: cada función devuelve null y la pantalla usa su lógica local.
 */
import { actualizar } from "./estado";
import { cuentaActual } from "./propietario";
import { supabase } from "./supabase";

export type Billetera = { monedas: number; cupo_extra: number; pase_por_vida: boolean; protectores: number; cofre_dia: string | null };

/** null = aún no se sabe; false = migración no instalada; true = el servidor manda. */
let enServidor: boolean | null = null;
export const monedasEnServidor = () => enServidor === true;

/** Refleja en la app lo que el servidor confirma. */
export function aplicarBilletera(b: Billetera | null | undefined) {
  if (!b) return;
  actualizar((s) => ({
    monedas: b.monedas,
    cupoExtra: b.cupo_extra,
    pasePorVida: b.pase_por_vida,
    racha: { ...s.racha, protectores: b.protectores },
    ...(b.cofre_dia ? { cofreDia: b.cofre_dia } : {}),
  }));
}

type Resultado<T> = { ok: true; data: T } | { ok: false; motivo: "sin-servidor" | "red" | "error" };

async function llamar<T>(fn: string, args: Record<string, unknown> = {}): Promise<Resultado<T>> {
  if (!supabase || !cuentaActual() || enServidor === false) return { ok: false, motivo: "sin-servidor" };
  const { data, error } = await supabase.rpc(fn, args);
  if (!error) {
    enServidor = true;
    return { ok: true, data: data as T };
  }
  // Función inexistente: la migración aún no se corrió.
  if (error.code === "PGRST202" || error.code === "42883") {
    enServidor = false;
    return { ok: false, motivo: "sin-servidor" };
  }
  if (!navigator.onLine || /fetch|network|Failed/i.test(error.message)) return { ok: false, motivo: "red" };
  return { ok: false, motivo: "error" };
}

/* ---------- Cola para lo ganado sin internet (cada acción tiene su clave: no se suma dos veces) ---------- */

type Pendiente = { uid: string; fn: "ganar_monedas" | "usar_protector"; args: Record<string, unknown> };
const COLA = "auxi.monedas.pendientes";

function leerCola(): Pendiente[] {
  try {
    return JSON.parse(localStorage.getItem(COLA) ?? "[]") as Pendiente[];
  } catch {
    return [];
  }
}
function guardarCola(c: Pendiente[]) {
  try {
    localStorage.setItem(COLA, JSON.stringify(c.slice(-100)));
  } catch {
    // nada
  }
}
function encolar(fn: Pendiente["fn"], args: Record<string, unknown>) {
  const uid = cuentaActual();
  if (uid) guardarCola([...leerCola(), { uid, fn, args }]);
}

async function vaciarCola() {
  const uid = cuentaActual();
  if (!uid) return;
  const resto: Pendiente[] = [];
  for (const p of leerCola()) {
    if (p.uid !== uid) {
      resto.push(p);
      continue;
    }
    const r = await llamar<Billetera>(p.fn, p.args);
    if (r.ok) aplicarBilletera(r.data);
    else if (r.motivo === "red") resto.push(p);
  }
  guardarCola(resto);
}

if (typeof window !== "undefined") window.addEventListener("online", () => void vaciarCola());

/* ---------- Acciones ---------- */

/** Al entrar a la cuenta: trae la billetera real y envía lo pendiente. */
export async function cargarBilletera() {
  const r = await llamar<Billetera>("mi_billetera");
  if (r.ok) {
    aplicarBilletera(r.data);
    await vaciarCola();
  }
}

/** motivo: leccion (valor = precisión), tomate, explica (valor = estrellas), mision:compartir|invitar|opinar. */
export async function ganarMonedas(motivo: string, valor: number, clave: string) {
  const r = await llamar<Billetera>("ganar_monedas", { motivo, valor, clave });
  if (r.ok) aplicarBilletera(r.data);
  else if (r.motivo === "red") encolar("ganar_monedas", { motivo, valor, clave });
}

export async function usarProtector(clave: string) {
  const r = await llamar<Billetera>("usar_protector", { clave });
  if (r.ok) aplicarBilletera(r.data);
  else if (r.motivo === "red") encolar("usar_protector", { clave });
}

export type CompraServidor = { ok: true } | { ok: false; faltan: number } | { ok: false; sinRed: true };

/** null si el servidor no está (se compra en el navegador como antes). */
export async function comprarEnServidor(item: "cupo" | "pase" | "protector", clave: string): Promise<CompraServidor | null> {
  const r = await llamar<{ ok: boolean; faltan?: number; billetera: Billetera }>("comprar_con_monedas", { item, clave });
  if (!r.ok) return r.motivo === "sin-servidor" ? null : { ok: false, sinRed: true };
  aplicarBilletera(r.data.billetera);
  return r.data.ok ? { ok: true } : { ok: false, faltan: r.data.faltan ?? 0 };
}

/** null si el servidor no está. premio: m10, m20, p1 o m50; ok=false si ya se abrió hoy. */
export async function abrirCofreEnServidor(): Promise<{ ok: boolean; premio?: string } | { sinRed: true } | null> {
  const r = await llamar<{ ok: boolean; premio?: string; billetera: Billetera }>("abrir_cofre");
  if (!r.ok) return r.motivo === "sin-servidor" ? null : { sinRed: true };
  aplicarBilletera(r.data.billetera);
  return { ok: r.data.ok, premio: r.data.premio };
}

/** null si el servidor no está. */
export async function reclamarApoyoEnServidor(): Promise<{ entregado: boolean; solicitud?: string } | null> {
  const r = await llamar<{ entregado: boolean; solicitud?: string; billetera: Billetera }>("reclamar_apoyo");
  if (!r.ok) return r.motivo === "sin-servidor" ? null : { entregado: false };
  aplicarBilletera(r.data.billetera);
  return { entregado: r.data.entregado, solicitud: r.data.solicitud };
}

/** Borra la cuenta en el servidor. Devuelve un mensaje de error o null si se borró. */
export async function borrarCuentaEnServidor(): Promise<string | null> {
  const r = await llamar<null>("borrar_mi_cuenta");
  if (r.ok) return null;
  if (r.motivo === "sin-servidor") return "El borrado de cuentas aún no está activado. Escríbenos por WhatsApp y la borramos por ti.";
  if (r.motivo === "red") return "Necesitas internet para borrar tu cuenta.";
  return "No se pudo borrar la cuenta. Inténtalo de nuevo o escríbenos.";
}
