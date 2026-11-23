/**
 * Métricas de uso (activación, retención, invitaciones y clics a Vendoe), cada una con la mini app de origen.
 * Se envían a PostHog solo si VITE_POSTHOG_KEY está configurada; sin clave no se envía nada.
 * No se manda ningún dato personal: solo un identificador aleatorio de este celular.
 */
const CLAVE = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const SERVIDOR = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? "https://us.i.posthog.com";

export type MiniApp = "teach" | "vida" | "negocio" | "plataforma";

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

export function registrar(evento: string, propiedades: Record<string, unknown> = {}, miniApp: MiniApp = "teach") {
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
  appAbierta: (miniApp: MiniApp = location.pathname.startsWith("/vida") ? "vida" : location.pathname.startsWith("/teach") ? "teach" : "plataforma") => {
    // Una vez por día y por mini app: sirve para medir retención de día 7 y día 30.
    const hoy = new Date().toISOString().slice(0, 10);
    const sufijo = miniApp === "teach" ? "" : `.${miniApp}`;
    try {
      if (localStorage.getItem(`auxi.ultimaApertura${sufijo}`) === hoy) return;
      localStorage.setItem(`auxi.ultimaApertura${sufijo}`, hoy);
      if (!localStorage.getItem(`auxi.primeraApertura${sufijo}`)) localStorage.setItem(`auxi.primeraApertura${sufijo}`, hoy);
      registrar("app_abierta", { primera: localStorage.getItem(`auxi.primeraApertura${sufijo}`) }, miniApp);
    } catch {
      registrar("app_abierta", {}, miniApp);
    }
  },
  leccionCompletada: (datos: { precision: number; primera: boolean; primerDia: boolean }) => {
    registrar("leccion_completada", { precision: datos.precision });
    if (datos.primera) registrar("activacion", { primer_dia: datos.primerDia });
  },
  invitacion: (via: string) => registrar("invitacion", { via }),
  clicVendoe: (desde: string) => registrar("clic_vendoe", { desde }, "negocio"),
  apoyoSolicitado: () => registrar("apoyo_solicitado"),
  /** Sin nombre ni correo: solo datos para saber a qué público llegar. */
  /** Vida: activación = primer gasto anotado el primer día. */
  vidaAnotado: (datos: { tipo: string; origen: string; primero: boolean; primerDia: boolean }) => {
    registrar("vida_anotado", { tipo: datos.tipo, origen: datos.origen }, "vida");
    if (datos.primero) registrar("activacion", { primer_dia: datos.primerDia }, "vida");
  },
  vidaRevisionEstafa: (nivel: string) => registrar("vida_revision_estafa", { nivel }, "vida"),
  vidaDiaRespetado: () => registrar("vida_dia_respetado", {}, "vida"),
  perfilCompletado: (d: { pais: string; carrera: string; universidad: string; edad: string }) => registrar("perfil_completado", d),
};

export const primerDiaDeUso = (miniApp: MiniApp = "teach") => {
  try {
    const sufijo = miniApp === "teach" ? "" : `.${miniApp}`;
    return localStorage.getItem(`auxi.primeraApertura${sufijo}`) === new Date().toISOString().slice(0, 10);
  } catch {
    return false;
  }
};
