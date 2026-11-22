import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Conexión con Supabase (cuentas y datos). La "anon key" es pública por diseño:
 * lo que protege los datos son las reglas RLS de supabase/esquema.sql.
 * Si faltan las variables, la app funciona igual pero solo guarda en este celular.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const clave = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null =
  url && clave ? createClient(url, clave, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }) : null;

export const BUCKET_ARCHIVOS = "archivos";
