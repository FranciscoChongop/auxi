/**
 * Métricas de uso (activación, retención, invitaciones y clics a Vendoe), cada una con la mini app de origen.
 * Se envían a PostHog solo si VITE_POSTHOG_KEY está configurada; sin clave no se envía nada.
 * No se manda ningún dato personal: solo un identificador aleatorio de este celular.
 */
const CLAVE = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const SERVIDOR = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? "https://us.i.posthog.com";

export type MiniApp = "studio" | "vida" | "negocio";

function idAnonimo() {
  try {
    let id = localStorage.getItem("auxi.anon");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("auxi.anon", id);
    }
    return id;
  } catch {
    return "sin-almacenamiento";
  }
}

export function registrar(evento: string, propiedades: Record<string, unknown> = {}, miniApp: MiniApp = "studio") {
  if (!CLAVE) return;
  try {
    void fetch(`${SERVIDOR}/capture/`, {
      method: "POST",
      keepalive: true,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        api_key: CLAVE,
        event: evento,
        distinct_id: idAnonimo(),
        properties: { ...propiedades, mini_app: miniApp, $current_url: location.pathname },
        timestamp: new Date().toISOString(),
      }),
    });
  } catch {
    // Las métricas nunca deben romper la app.
  }
}

/** Eventos del día 1. */
export const metricas = {
  appAbierta: () => {
    // Una vez por día: sirve para medir retención de día 7 y día 30.
    const hoy = new Date().toISOString().slice(0, 10);
    try {
      if (localStorage.getItem("auxi.ultimaApertura") === hoy) return;
      localStorage.setItem("auxi.ultimaApertura", hoy);
      if (!localStorage.getItem("auxi.primeraApertura")) localStorage.setItem("auxi.primeraApertura", hoy);
    } catch {
      // sin almacenamiento
    }
    registrar("app_abierta", { primera: localStorage.getItem("auxi.primeraApertura") });
  },
  leccionCompletada: (datos: { precision: number; primera: boolean; primerDia: boolean }) => {
    registrar("leccion_completada", { precision: datos.precision });
    if (datos.primera) registrar("activacion", { primer_dia: datos.primerDia });
  },
  invitacion: (via: string) => registrar("invitacion", { via }),
  clicVendoe: (desde: string) => registrar("clic_vendoe", { desde }, "negocio"),
  apoyoSolicitado: () => registrar("apoyo_solicitado"),
};

export const primerDiaDeUso = () => {
  try {
    return localStorage.getItem("auxi.primeraApertura") === new Date().toISOString().slice(0, 10);
  } catch {
    return false;
  }
};
