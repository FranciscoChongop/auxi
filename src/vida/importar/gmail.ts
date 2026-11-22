/**
 * Conexión con Gmail mediante la autorización oficial de Google (OAuth, a través de Supabase).
 * Nunca se pide la contraseña del correo. El permiso es de solo lectura; Auxi Vida solo busca
 * y procesa correos que parecen comprobantes, en el rango de fechas elegido, dentro del celular,
 * y no guarda el texto de los correos.
 *
 * Está apagado hasta que el dueño complete la configuración (ver QUE_FALTA_GMAIL).
 */
import { supabase } from "../../lib/supabase";
import { actualizarVida, obtenerVida } from "../estado";
import { FallaImportar, marcarDuplicados } from "./importar";
import { leerComprobante, type Candidato } from "./leer";

export const ALCANCE_GMAIL = "https://www.googleapis.com/auth/gmail.readonly";

/** Solo se muestra como disponible si el dueño lo activó y hay cuentas configuradas. */
export const GMAIL_DISPONIBLE = import.meta.env.VITE_GMAIL_ACTIVO === "si" && !!supabase;

export const QUE_FALTA_GMAIL = [
  "En Google Cloud: activar la Gmail API y agregar el permiso gmail.readonly a la pantalla de consentimiento.",
  "Pasar la verificación de Google para ese permiso (es un permiso «restringido»). Mientras tanto, solo funciona con hasta 100 cuentas de prueba.",
  "En Supabase: el proveedor de Google ya activo y, si alguien entra con correo, permitir «vincular identidades».",
  "Actualizar la política de privacidad explicando el uso del correo.",
  "Poner VITE_GMAIL_ACTIVO=si en Vercel.",
];

const TOKEN = "auxi.vida.gmailToken";
const PIDIENDO = "auxi.vida.gmailPidiendo";

/** El permiso de Google dura poco (≈1 hora) y solo vive en esta pestaña: nunca se guarda en el celular. */
function token() {
  try {
    return sessionStorage.getItem(TOKEN);
  } catch {
    return null;
  }
}

let escuchando = false;
/** Al volver de Google, guarda el permiso recibido (solo si la persona lo pidió desde Vida). */
export function escucharRegresoDeGoogle() {
  if (!supabase || escuchando) return;
  escuchando = true;
  const tomar = async (providerToken?: string | null) => {
    try {
      if (!providerToken || sessionStorage.getItem(PIDIENDO) !== "1") return;
      sessionStorage.removeItem(PIDIENDO);
      sessionStorage.setItem(TOKEN, providerToken);
    } catch {
      return;
    }
    const perfil = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", { headers: { Authorization: `Bearer ${providerToken}` } })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
    if (perfil?.emailAddress) actualizarVida((s) => ({ gmail: { ...(s.gmail ?? {}), email: perfil.emailAddress, revocado: false } }));
  };
  supabase.auth.getSession().then(({ data }) => tomar(data.session?.provider_token));
  supabase.auth.onAuthStateChange((_e, session) => void tomar(session?.provider_token));
}

/** Abre la autorización de Google. Devuelve un mensaje si no se puede. */
export async function conectarGmail(): Promise<string | null> {
  if (!GMAIL_DISPONIBLE || !supabase) return "La conexión con Gmail aún no está activada.";
  const { data } = await supabase.auth.getSession();
  if (!data.session) return "Primero entra a tu cuenta Auxi.";
  try {
    sessionStorage.setItem(PIDIENDO, "1");
  } catch {
    return "Tu navegador no permite guardar el permiso. Prueba sin modo privado.";
  }
  const options = {
    scopes: ALCANCE_GMAIL,
    redirectTo: `${location.origin}/vida/importar?fuente=gmail`,
    queryParams: { prompt: "consent", include_granted_scopes: "true" },
  };
  const conGoogle = data.session.user.identities?.some((i) => i.provider === "google");
  const { error } = conGoogle ? await supabase.auth.signInWithOAuth({ provider: "google", options }) : await supabase.auth.linkIdentity({ provider: "google", options });
  if (error) {
    sessionStorage.removeItem(PIDIENDO);
    return "Google no abrió la autorización. Inténtalo de nuevo en un momento.";
  }
  return null;
}

export const tienePermisoVigente = () => !!token();

function decodificar(b64: string) {
  const bin = atob(b64.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

type Parte = { mimeType?: string; body?: { data?: string }; parts?: Parte[] };
function textoDe(p: Parte): string {
  if (p.mimeType === "text/plain" && p.body?.data) return decodificar(p.body.data);
  const hijos = (p.parts ?? []).map(textoDe).filter(Boolean);
  if (hijos.length) return hijos[0];
  if (p.mimeType === "text/html" && p.body?.data) {
    const doc = new DOMParser().parseFromString(decodificar(p.body.data), "text/html");
    doc.querySelectorAll("br, p, div, tr, li").forEach((n) => n.append("\n"));
    return doc.body.textContent ?? "";
  }
  return "";
}

const aGmail = (f: string) => f.replace(/-/g, "/");

/**
 * Busca correos de comprobantes en el rango elegido y los lee. Solo procesa los que parecen
 * movimientos (con monto y tipo de operación); el resto se ignora y no se guarda.
 */
export async function sincronizarGmail(desde: string, hasta: string, alEtapa: (e: string) => void): Promise<Candidato[]> {
  const t = token();
  if (!t) throw new FallaImportar("permiso");
  if (!navigator.onLine) throw new FallaImportar("sin-conexion");
  const hastaMas = new Date(hasta);
  hastaMas.setDate(hastaMas.getDate() + 1);
  const fin = hastaMas.toISOString().slice(0, 10);
  const q = `after:${aGmail(desde)} before:${aGmail(fin)} (yape OR yapeaste OR plin OR "constancia" OR "operación" OR transferencia OR consumo OR "pago realizado" OR compra) -category:promotions -category:social`;
  const pedir = async (url: string) => {
    const r = await fetch(url, { headers: { Authorization: `Bearer ${t}` } });
    if (r.status === 401 || r.status === 403) {
      sessionStorage.removeItem(TOKEN);
      actualizarVida((s) => ({ gmail: s.gmail ? { ...s.gmail, revocado: true } : s.gmail }));
      throw new FallaImportar("permiso");
    }
    if (!r.ok) throw new FallaImportar("lectura");
    return r.json();
  };
  alEtapa("Buscando correos de comprobantes");
  const ids: string[] = [];
  let pagina: string | undefined;
  do {
    const r = await pedir(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=100&q=${encodeURIComponent(q)}${pagina ? `&pageToken=${pagina}` : ""}`);
    for (const m of r.messages ?? []) ids.push(m.id);
    pagina = r.nextPageToken;
  } while (pagina && ids.length < 300);
  alEtapa(ids.length ? `Leyendo ${ids.length} correos` : "Revisando movimientos");
  const reglas = obtenerVida().reglas;
  const candidatos: Candidato[] = [];
  for (const id of ids) {
    const m = await pedir(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`);
    const asunto = (m.payload?.headers ?? []).find((h: { name: string }) => h.name.toLowerCase() === "subject")?.value ?? "";
    const c = leerComprobante(`${asunto}\n${textoDe(m.payload ?? {})}`, reglas);
    if (c) {
      // Si el correo no trae fecha en el texto, la fecha del correo es un dato real (no inventado).
      if (!c.fecha && m.internalDate) {
        c.fecha = new Date(Number(m.internalDate)).toISOString().slice(0, 10);
        c.dudas = c.dudas.filter((d) => d !== "Falta la fecha").concat("Fecha del correo, no de la operación");
      }
      candidatos.push(c);
    }
  }
  alEtapa("Preparando vista previa");
  actualizarVida((s) => ({ gmail: { ...(s.gmail ?? {}), ultimaSync: new Date().toISOString(), desde, hasta, revocado: false } }));
  return marcarDuplicados(candidatos);
}

/** Quita el permiso en Google y olvida la conexión en Auxi. */
export async function desconectarGmail() {
  const t = token();
  if (t) await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(t)}`, { method: "POST" }).catch(() => null);
  try {
    sessionStorage.removeItem(TOKEN);
  } catch {
    // nada
  }
  actualizarVida(() => ({ gmail: null }));
}
