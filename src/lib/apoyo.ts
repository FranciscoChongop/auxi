import { actualizar, obtener } from "./estado";
import { useEffect, useState } from "react";
import { useCuenta } from "./nube";
import { reclamarApoyoEnServidor } from "./billetera";
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

/**
 * Enlaces del dueño. Cada paso aparece SOLO cuando su enlace está lleno.
 * Pon aquí el enlace de tu TikTok y el del video donde deben comentar.
 */
export const TIKTOK_URL: string = "";
export const TIKTOK_USUARIO: string = "";
export const VIDEO_URL: string = "";

/** Pasos que se piden para el pase libre. */
export type Requisito = { id: string; titulo: string; detalle: string; enlace?: string; accion?: string; captura: string };
export const REQUISITOS: Requisito[] = [
  {
    id: "instagram",
    titulo: "Sigue a @soydanielchong en Instagram",
    detalle: "Toca el botón, sigue la cuenta y toma una captura que se vea que ya la sigues.",
    enlace: "https://www.instagram.com/soydanielchong/",
    accion: "Abrir Instagram",
    captura: "que ya sigues en Instagram",
  },
  ...(TIKTOK_URL
    ? [
        {
          id: "tiktok",
          titulo: `Sigue ${TIKTOK_USUARIO ? "a @" + TIKTOK_USUARIO.replace(/^@/, "") + " " : ""}en TikTok`,
          detalle: "Toca el botón, sigue la cuenta y toma una captura que se vea que ya la sigues.",
          enlace: TIKTOK_URL,
          accion: "Abrir TikTok",
          captura: "que ya sigues en TikTok",
        },
      ]
    : []),
  ...(VIDEO_URL
    ? [
        {
          id: "video",
          titulo: "Comenta el video",
          detalle: "Abre el video, deja un comentario con tus palabras y toma una captura donde se vea tu comentario.",
          enlace: VIDEO_URL,
          accion: "Abrir el video",
          captura: "que comentaste el video",
        },
      ]
    : []),
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

/**
 * ¿La cuenta con sesión es administradora? Lo decide el servidor (lista «administradores»).
 * Si la migración aún no está instalada, se usa la comprobación por correo de antes.
 * Ojo: esto solo muestra u oculta el panel; los permisos reales los aplica Supabase (RLS).
 */
export function useEsAdministrador(): boolean {
  const cuenta = useCuenta();
  const [admin, setAdmin] = useState(false);
  useEffect(() => {
    let vigente = true;
    if (cuenta.modo !== "conectado" || !supabase) {
      setAdmin(false);
      return;
    }
    void supabase.rpc("es_administrador").then(({ data, error }) => {
      if (!vigente) return;
      if (error) setAdmin(error.code === "PGRST202" ? esDueno(cuenta.email) : false);
      else setAdmin(data === true);
    });
    return () => {
      vigente = false;
    };
  }, [cuenta.modo, cuenta.email]);
  return admin;
}

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
  const servidor = await reclamarApoyoEnServidor();
  if (servidor) {
    if (servidor.entregado) {
      actualizar(() => ({ apoyoReclamado: servidor.solicitud ?? s.id }));
      window.dispatchEvent(new CustomEvent("auxi:apoyo-aprobado"));
    }
    return s;
  }
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
