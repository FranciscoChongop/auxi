/**
 * Auxi Vida en la cuenta: con sesión, los datos de Vida se guardan también en Supabase (tabla
 * `vida_datos`, cada persona solo ve lo suyo) para seguir en otro equipo. Sin sesión, o si la tabla
 * aún no está instalada, Vida funciona solo en este equipo, como antes.
 *
 * Reglas: la primera vez que un equipo se enlaza con la cuenta se unen ambas copias sin repetir;
 * después manda la copia más nueva. Los cambios se suben 1,5 s después de hacerlos.
 */
import { alCambiarCuenta, cuentaActual } from "../lib/propietario";
import { supabase } from "../lib/supabase";
import { aplicarDesdeNube, cuentaDeVida, elegirCopia, obtenerVidaReal, suscribirVida, type EstadoVida } from "./estado";

const TABLA = "vida_datos";
const marcaEnlace = (uid: string) => `auxi.vida.enlazado.${uid}`;

/** Falta la tabla (migración sin correr): se apaga la copia en la cuenta sin molestar. */
const faltaTabla = (codigo?: string) => codigo === "PGRST205" || codigo === "42P01";

let activa = !!supabase;
let aplicando = false;
let pendiente = false;
let lista: string | null = null; // cuenta ya revisada al entrar: recién ahí se puede subir
let espera: ReturnType<typeof setTimeout> | null = null;

function leerMarca(uid: string) {
  try {
    return localStorage.getItem(marcaEnlace(uid));
  } catch {
    return null;
  }
}
function ponerMarca(uid: string) {
  try {
    localStorage.setItem(marcaEnlace(uid), "1");
  } catch {
    // nada
  }
}

async function subir(uid: string) {
  if (!supabase || !activa || lista !== uid || cuentaDeVida() !== uid) return;
  pendiente = false;
  const estado = obtenerVidaReal();
  const { error } = await supabase.from(TABLA).upsert({ user_id: uid, estado, actualizado: estado.editado ?? new Date().toISOString() });
  if (error) {
    if (faltaTabla(error.code)) activa = false;
    else pendiente = true; // sin internet u otro error: se reintenta al volver la conexión
  }
}

function programarSubida() {
  const uid = cuentaDeVida();
  if (!uid || aplicando || !activa || lista !== uid) return;
  pendiente = true;
  if (espera) clearTimeout(espera);
  espera = setTimeout(() => void subir(uid), 1500);
}

async function sincronizar(uid: string | null) {
  lista = null;
  if (!uid || !supabase || !activa) return;
  const { data, error } = await supabase.from(TABLA).select("estado").eq("user_id", uid).maybeSingle();
  if (error) {
    if (faltaTabla(error.code)) activa = false;
    return; // nunca se trata un error como «cuenta vacía»
  }
  if (cuentaDeVida() !== uid) return;
  const nube = (data?.estado ?? null) as EstadoVida | null;
  const resultado = elegirCopia(obtenerVidaReal(), nube, !!leerMarca(uid));
  if (resultado) {
    aplicando = true;
    aplicarDesdeNube(uid, resultado as unknown as Record<string, unknown>);
    aplicando = false;
  }
  ponerMarca(uid);
  lista = uid;
  if (!nube || resultado !== nube) await subir(uid);
}

if (typeof window !== "undefined") {
  suscribirVida(programarSubida);
  alCambiarCuenta((uid) => void sincronizar(uid));
  void sincronizar(cuentaActual());
  window.addEventListener("online", () => {
    const uid = cuentaDeVida();
    if (uid && pendiente) void subir(uid);
  });
  // Al volver a la app trae lo cambiado en otro equipo; al salir sube lo que falte.
  document.addEventListener("visibilitychange", () => {
    const uid = cuentaDeVida();
    if (!uid) return;
    if (document.visibilityState === "visible" && !pendiente) void sincronizar(uid);
    if (document.visibilityState === "hidden" && pendiente) void subir(uid);
  });
}
