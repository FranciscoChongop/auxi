import { actualizar, obtener } from "./estado";
import { metricas } from "./metricas";
import { supabase } from "./supabase";

/**
 * Camino al pase libre: apoyar al creador a cambio del pase libre de por vida.
 * No se puede comprobar un seguimiento desde la app, así que se verifica a mano:
 * la persona manda capturas por WhatsApp con un código y el dueño aprueba desde un panel.
 */

/** Correo de la cuenta del dueño (la única que ve el panel de revisión). */
export const CORREO_DUENO = "chongdaniel91@gmail.com";
export const WHATSAPP_REVISION = "https://wa.me/51960650372";
export const MONEDAS_BONO = 100;

/** Pasos que se piden. Para sumar TikTok o un video, agrega una fila con su enlace. */
export type Requisito = { id: string; titulo: string; detalle: string; enlace?: string; accion?: string };
export const REQUISITOS: Requisito[] = [
  {
    id: "instagram",
    titulo: "Sigue a @soydanielchong en Instagram",
    detalle: "Toca el botón, sigue la cuenta y toma una captura que se vea que ya la sigues.",
    enlace: "https://www.instagram.com/soydanielchong/",
    accion: "Abrir Instagram",
  },
];

export type Solicitud = {
  id: string;
  user_id: string;
  codigo: string;
  instagram: string | null;
  tiktok: string | null;
  comentario: string | null;
  correo: string | null;
  estado: "pendiente" | "aprobada" | "rechazada";
  nota: string | null;
  creado: string;
};

export function esDueno(email?: string) {
  return !!email && email.toLowerCase() === CORREO_DUENO;
}

function nuevoCodigo() {
  const letras = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return "AUXI-" + Array.from({ length: 4 }, () => letras[Math.floor(Math.random() * letras.length)]).join("");
}

export const limpiarUsuario = (u: string) => u.trim().replace(/^@+/, "").replace(/[^\w.]/g, "").slice(0, 40);

export async function miUltimaSolicitud(): Promise<Solicitud | null> {
  if (!supabase) return null;
  const { data: s } = await supabase.auth.getSession();
  const uid = s.session?.user.id;
  if (!uid) return null;
  const { data } = await supabase.from("solicitudes_apoyo").select("*").eq("user_id", uid).order("creado", { ascending: false }).limit(1);
  return (data?.[0] as Solicitud | undefined) ?? null;
}

export async function crearSolicitud(datos: { instagram: string; tiktok?: string; comentario?: string; correo?: string }) {
  if (!supabase) return { error: "Las cuentas aún no están activadas." as string, solicitud: null };
  const { data: s } = await supabase.auth.getSession();
  const uid = s.session?.user.id;
  if (!uid) return { error: "Primero entra a tu cuenta." as string, solicitud: null };
  const fila = {
    user_id: uid,
    codigo: nuevoCodigo(),
    instagram: limpiarUsuario(datos.instagram),
    tiktok: datos.tiktok ? limpiarUsuario(datos.tiktok) : null,
    comentario: datos.comentario?.trim().slice(0, 300) || null,
    correo: datos.correo ?? null,
  };
  const { data, error } = await supabase.from("solicitudes_apoyo").insert(fila).select().single();
  if (error) {
    return { error: error.code === "23505" ? "Ya tienes una solicitud en revisión." : "No pude enviar tu solicitud. Inténtalo otra vez.", solicitud: null };
  }
  metricas.apoyoSolicitado();
  return { error: null, solicitud: data as Solicitud };
}

/** Si el dueño aprobó la solicitud y todavía no se entregó el premio, se activa el pase libre. */
export async function reclamarSiAprobada(): Promise<Solicitud | null> {
  const s = await miUltimaSolicitud();
  if (!s) return null;
  if (s.estado === "aprobada" && obtener().apoyoReclamado !== s.id) {
    actualizar((e) => ({ pasePorVida: true, monedas: e.monedas + MONEDAS_BONO, apoyoReclamado: s.id }));
    window.dispatchEvent(new CustomEvent("auxi:apoyo-aprobado"));
  }
  return s;
}

/* ---------- Panel del dueño ---------- */

export async function solicitudesPendientes(): Promise<Solicitud[]> {
  if (!supabase) return [];
  const { data } = await supabase.from("solicitudes_apoyo").select("*").eq("estado", "pendiente").order("creado", { ascending: true });
  return (data as Solicitud[]) ?? [];
}

export async function resolverSolicitud(id: string, estado: "aprobada" | "rechazada", nota?: string) {
  if (!supabase) return false;
  const { error } = await supabase.from("solicitudes_apoyo").update({ estado, nota: nota ?? null, revisado: new Date().toISOString() }).eq("id", id);
  return !error;
}
