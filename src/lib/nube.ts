import { useSyncExternalStore } from "react";
import type { User } from "@supabase/supabase-js";
import { borrarTodoLocal, leerArchivoLocal, subirArchivoANube } from "./archivos";
import { actualizar, alCambiarEstado, completar, obtener, reiniciarTodo, type Estado } from "./estado";
import { supabase } from "./supabase";
import { reclamarSiAprobada } from "./apoyo";
import { unir } from "./unir";
import { apartarRespaldo, avisarCambioDeCuenta, decidir, guardarPropietario, leerPropietario, tomarRespaldo } from "./propietario";

/**
 * Cuenta y sincronización. Mientras no hay sesión, todo vive en el celular.
 * Al entrar: se trae el avance de la cuenta, se une con el del celular y se guarda en ambos.
 * Después, cada cambio se sube solo (con una pequeña espera para no gastar datos).
 */

export type EstadoCuenta = {
  /**
   * sin-nube: solo en desarrollo (sin Supabase o con VITE_SIN_LOGIN). sin-configuracion: en producción
   * faltan los datos de Supabase; la app no deja entrar sin cuenta (falla de forma segura).
   */
  modo: "sin-nube" | "sin-configuracion" | "cargando" | "invitado" | "conectado";
  email?: string;
  guardando: boolean;
  /** Ya se unió el avance del celular con el de la cuenta. */
  sincronizado?: boolean;
  ultimoGuardado?: number;
  error?: string;
};

let cuenta: EstadoCuenta = { modo: supabase ? "cargando" : import.meta.env.PROD ? "sin-configuracion" : "sin-nube", guardando: false };
const oyentes = new Set<() => void>();

function cambiar(c: Partial<EstadoCuenta>) {
  cuenta = { ...cuenta, ...c };
  oyentes.forEach((o) => o());
}

export function useCuenta() {
  return useSyncExternalStore(
    (o) => {
      oyentes.add(o);
      return () => oyentes.delete(o);
    },
    () => cuenta,
  );
}

let usuario: User | null = null;
let dejarDeEscuchar: (() => void) | null = null;
let espera: ReturnType<typeof setTimeout> | undefined;

async function subir() {
  if (!supabase || !usuario) return;
  cambiar({ guardando: true });
  const { error } = await supabase.from("perfiles").upsert({ id: usuario.id, estado: obtener(), actualizado: new Date().toISOString() });
  cambiar({ guardando: false, ...(error ? { error: "No se pudo guardar en tu cuenta. Lo intento de nuevo." } : { error: undefined, ultimoGuardado: Date.now() }) });
  if (error) espera = setTimeout(subir, 15_000);
}

function programarSubida() {
  clearTimeout(espera);
  espera = setTimeout(subir, 1500);
}

/** Sube los PDF que solo están en este celular. */
async function subirArchivosPendientes(e: Estado) {
  for (const curso of e.misCursos)
    for (const tema of curso.temas)
      for (const a of tema.archivos) {
        const blob = await leerArchivoLocal(a.id);
        if (blob) await subirArchivoANube(a.id, blob);
      }
}

function apagarGuardadoAutomatico() {
  const quitar = dejarDeEscuchar as (() => void) | null;
  quitar?.();
  dejarDeEscuchar = null;
  clearTimeout(espera);
}

async function conectar(u: User) {
  if (!supabase) return;
  // Antes de nada, se apaga el guardado automático anterior: así nunca se sube a esta cuenta
  // un estado a medio cargar ni el de otra persona.
  apagarGuardadoAutomatico();
  usuario = u;
  cambiar({ modo: "conectado", email: u.email ?? undefined, sincronizado: false, error: undefined });

  // Equipo compartido: si lo guardado aquí es de otra cuenta, se aparta y no se mezcla con esta.
  const dueno = leerPropietario();
  if (decidir(dueno, u.id) === "apartar" && dueno) {
    apartarRespaldo(dueno, obtener());
    reiniciarTodo();
  }
  avisarCambioDeCuenta(u.id);

  const { data, error } = await supabase.from("perfiles").select("estado").eq("id", u.id).maybeSingle();
  if (error) {
    // Un error de lectura NUNCA se trata como cuenta vacía: no se sube nada hasta poder leer.
    cambiar({ error: "No pude traer tu avance. Lo intento de nuevo en unos segundos.", sincronizado: true });
    setTimeout(() => {
      if (usuario?.id === u.id) void conectar(u);
    }, 15_000);
    return;
  }
  // Si esta misma cuenta dejó avance apartado en este equipo, se recupera.
  const respaldo = tomarRespaldo(u.id);
  const local = respaldo ? unir(obtener(), completar(respaldo as Partial<Estado>)) : obtener();
  const unido = data?.estado ? unir(local, completar(data.estado as Partial<Estado>)) : { ...local, avisoCuentaVisto: true };
  actualizar(() => unido);
  guardarPropietario(u.id);
  cambiar({ sincronizado: true });
  await subir();
  dejarDeEscuchar?.();
  dejarDeEscuchar = alCambiarEstado(programarSubida);
  void subirArchivosPendientes(unido);
  void reclamarSiAprobada();
}

/** Si Google (u otro proveedor) devolvió un error, lo guarda para mostrarlo en la pantalla de entrada. */
function capturarErrorDeEntrada() {
  try {
    const q = new URLSearchParams(location.search.slice(1) + "&" + location.hash.slice(1));
    const err = q.get("error_description") ?? q.get("error");
    if (!err) return;
    sessionStorage.setItem("auxi.errorEntrada", err.replace(/\+/g, " "));
    history.replaceState(null, "", location.pathname.startsWith("/vida") ? "/vida/cuenta" : location.pathname.startsWith("/student") ? "/student/entrada" : "/entrar");
  } catch {
    // sin almacenamiento
  }
}

export function errorDeEntrada() {
  try {
    const e = sessionStorage.getItem("auxi.errorEntrada");
    if (e) sessionStorage.removeItem("auxi.errorEntrada");
    return e;
  } catch {
    return null;
  }
}

let iniciada = false;
export function iniciarNube() {
  if (!supabase || iniciada) return;
  iniciada = true;
  capturarErrorDeEntrada();
  supabase.auth.getSession().then(({ data }) => {
    if (data.session?.user) void conectar(data.session.user);
    else cambiar({ modo: "invitado" });
  });
  supabase.auth.onAuthStateChange((evento, sesion) => {
    if (evento === "SIGNED_IN" && sesion?.user && sesion.user.id !== usuario?.id) void conectar(sesion.user);
    if (evento === "SIGNED_OUT") {
      usuario = null;
      limpiarSesionTemporal();
      avisarCambioDeCuenta(null);
      dejarDeEscuchar?.();
      dejarDeEscuchar = null;
      cambiar({ modo: "invitado", email: undefined, sincronizado: undefined });
    }
  });
  // Antes de cerrar o esconder la app, sube lo pendiente.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && usuario) {
      clearTimeout(espera);
      void subir();
    }
    if (document.visibilityState === "visible" && usuario) void reclamarSiAprobada();
  });
}

/* ---------- Acciones de la pantalla de cuenta ---------- */

/** Vuelve a la mini app desde donde se entró (Studio o Vida). */
const urlDeVuelta = () => `${location.origin}${location.pathname.startsWith("/vida") ? "/vida/inicio" : location.pathname.startsWith("/student") ? "/student" : "/"}`;

export async function entrarConGoogle() {
  if (!supabase) return "Las cuentas aún no están activadas.";
  const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: urlDeVuelta() } });
  return error ? "No se pudo abrir Google. Prueba con tu correo." : null;
}

function traducir(error: { message?: string; status?: number; code?: string }) {
  const m = (error.message ?? "").toLowerCase();
  if (error.status === 429 || m.includes("rate limit")) return "Demasiados intentos. Espera un minuto.";
  if (m.includes("invalid login")) return "Correo o contraseña incorrectos.";
  if (m.includes("already registered") || m.includes("already been registered")) return "Ese correo ya tiene cuenta. Toca Entrar.";
  if (m.includes("password") && m.includes("characters")) return "La contraseña debe tener al menos 8 caracteres.";
  if (m.includes("email not confirmed")) return "Falta confirmar tu correo. Revisa tu bandeja.";
  return "No pude hacerlo. Revisa tu internet e inténtalo otra vez.";
}

export async function entrarConClave(email: string, clave: string) {
  if (!supabase) return "Las cuentas aún no están activadas.";
  const { error } = await supabase.auth.signInWithPassword({ email, password: clave });
  return error ? traducir(error) : null;
}

/** Crea la cuenta. Devuelve "confirmar" si hay que abrir un enlace del correo antes de entrar. */
export async function crearCuentaConClave(email: string, clave: string): Promise<string | null> {
  if (!supabase) return "Las cuentas aún no están activadas.";
  const { data, error } = await supabase.auth.signUp({ email, password: clave, options: { emailRedirectTo: urlDeVuelta() } });
  if (error) return traducir(error);
  // Si el correo ya tenía cuenta (por ejemplo, entró antes con código), Supabase no crea otra ni envía nada.
  if (!data.session && data.user && data.user.identities?.length === 0) return "existe";
  if (!data.session) return "confirmar";
  return null;
}

/** Pone o cambia la contraseña de la cuenta que tiene la sesión abierta. */
export async function ponerClave(clave: string) {
  if (!supabase) return "Las cuentas aún no están activadas.";
  const { error } = await supabase.auth.updateUser({ password: clave });
  return error ? "No pude guardar la contraseña. Prueba con otra de 8 o más caracteres." : null;
}

export async function pedirCodigo(email: string) {
  if (!supabase) return "Las cuentas aún no están activadas.";
  const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true, emailRedirectTo: urlDeVuelta() } });
  if (!error) return null;
  if (error.status === 429) return "Pediste muchos códigos. Espera un minuto.";
  return "No pude enviar el código. Revisa tu correo.";
}

export async function verificarCodigo(email: string, codigo: string) {
  if (!supabase) return "Las cuentas aún no están activadas.";
  const { error } = await supabase.auth.verifyOtp({ email, token: codigo, type: "email" });
  return error ? "Ese código no funciona. Revisa o pide otro." : null;
}

/** Cierra sesión: guarda lo último y limpia este celular (puede ser compartido). */
export async function salir() {
  if (!supabase) return;
  clearTimeout(espera);
  await subir();
  await supabase.auth.signOut();
  reiniciarTodo();
  guardarPropietario(null);
  limpiarSesionTemporal();
  avisarCambioDeCuenta(null);
  await borrarTodoLocal();
}

/** Permisos temporales de esta pestaña (por ejemplo, el de Gmail): no deben pasar a otra cuenta. */
function limpiarSesionTemporal() {
  try {
    sessionStorage.removeItem("auxi.vida.gmailToken");
    sessionStorage.removeItem("auxi.vida.gmailPidiendo");
  } catch {
    // nada
  }
}

export function usuarioActual() {
  return usuario;
}
