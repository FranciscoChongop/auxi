import { useSyncExternalStore } from "react";
import type { User } from "@supabase/supabase-js";
import { borrarTodoLocal, leerArchivoLocal, subirArchivoANube } from "./archivos";
import { actualizar, alCambiarEstado, completar, obtener, reiniciarTodo, type Estado } from "./estado";
import { supabase } from "./supabase";
import { reclamarSiAprobada } from "./apoyo";
import { unir } from "./unir";

/**
 * Cuenta y sincronización. Mientras no hay sesión, todo vive en el celular.
 * Al entrar: se trae el avance de la cuenta, se une con el del celular y se guarda en ambos.
 * Después, cada cambio se sube solo (con una pequeña espera para no gastar datos).
 */

export type EstadoCuenta = {
  modo: "sin-nube" | "cargando" | "invitado" | "conectado";
  email?: string;
  guardando: boolean;
  /** Ya se unió el avance del celular con el de la cuenta. */
  sincronizado?: boolean;
  ultimoGuardado?: number;
  error?: string;
};

let cuenta: EstadoCuenta = { modo: supabase ? "cargando" : "sin-nube", guardando: false };
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

async function conectar(u: User) {
  if (!supabase) return;
  usuario = u;
  cambiar({ modo: "conectado", email: u.email ?? undefined, sincronizado: false });
  const { data, error } = await supabase.from("perfiles").select("estado").eq("id", u.id).maybeSingle();
  if (error) {
    cambiar({ error: "No pude traer tu avance. Revisa tu internet.", sincronizado: true });
    return;
  }
  const local = obtener();
  const unido = data?.estado ? unir(local, completar(data.estado as Partial<Estado>)) : { ...local, avisoCuentaVisto: true };
  actualizar(() => unido);
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
  await borrarTodoLocal();
}

export function usuarioActual() {
  return usuario;
}
