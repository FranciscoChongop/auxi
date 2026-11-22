import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useAviso } from "../components/Aviso";
import { Boton } from "../components/Boton";
import { Campo } from "../components/Formulario";
import { Leon } from "../components/Leon";
import { Pantalla } from "../components/Navegacion";
import { crearSolicitud, limpiarUsuario, miUltimaSolicitud, MONEDAS_BONO, reclamarSiAprobada, REQUISITOS, WHATSAPP_REVISION, type Solicitud } from "../lib/apoyo";
import { lanzarConfeti } from "../lib/confeti";
import { useEstado } from "../lib/estado";
import { useCuenta } from "../lib/nube";
import { navegar } from "../lib/rutas";
import { sonidos } from "../lib/sonidos";

function enlaceWhatsApp(s: { codigo: string; instagram: string | null }) {
  const texto = [
    "Hola, pedí el pase libre de Auxi Studio.",
    `Código: ${s.codigo}`,
    s.instagram ? `Instagram: @${s.instagram}` : "",
    "Te adjunto mis capturas.",
  ]
    .filter(Boolean)
    .join("\n");
  return `${WHATSAPP_REVISION}?text=${encodeURIComponent(texto)}`;
}

/** Camino al pase libre: apoyar al creador con capturas, aprobado a mano. */
export default function Apoyo() {
  const e = useEstado();
  const cuenta = useCuenta();
  const aviso = useAviso();
  const [solicitud, setSolicitud] = useState<Solicitud | null | undefined>(undefined);
  const [usuario, setUsuario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cargar() {
    const s = await reclamarSiAprobada();
    setSolicitud(s ?? (await miUltimaSolicitud()));
  }

  useEffect(() => {
    if (cuenta.modo === "conectado") void cargar();
    else if (cuenta.modo === "invitado" || cuenta.modo === "sin-nube") setSolicitud(null);
  }, [cuenta.modo]);

  useEffect(() => {
    const ok = () => {
      sonidos.leccionCompleta();
      void lanzarConfeti();
    };
    window.addEventListener("auxi:apoyo-aprobado", ok);
    return () => window.removeEventListener("auxi:apoyo-aprobado", ok);
  }, []);

  async function enviar() {
    setEnviando(true);
    setError(null);
    const r = await crearSolicitud({ instagram: usuario, correo: cuenta.email });
    setEnviando(false);
    if (r.error || !r.solicitud) {
      setError(r.error);
      return;
    }
    setSolicitud(r.solicitud);
    sonidos.acierto();
    window.open(enlaceWhatsApp(r.solicitud), "_blank", "noopener");
    aviso("Listo. Manda tus capturas por WhatsApp.", "exito");
  }

  /* ---------- Ya lo tiene ---------- */
  if (e.pasePorVida) {
    return (
      <Pantalla titulo="Pase libre" atras="/studio/perfil">
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <Leon pose="celebra" alto={200} rebote />
          <h2 className="text-titulo font-black">¡Tienes el pase libre!</h2>
          <p className="max-w-[32ch] text-text-soft">Temas importados sin límite, para siempre. Gracias por apoyar a @soydanielchong.</p>
        </div>
        <Boton onClick={() => navegar("/studio/cursos")}>Ir a Mis cursos</Boton>
      </Pantalla>
    );
  }

  /* ---------- Sin cuenta ---------- */
  if (cuenta.modo !== "conectado") {
    return (
      <Pantalla titulo="Pase libre" atras="/studio/perfil">
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <Leon pose="anima" alto={190} rebote />
          <h2 className="text-tarjeta font-extrabold">Primero crea tu cuenta</h2>
          <p className="max-w-[32ch] text-text-soft">La necesitamos para guardar tu solicitud y activarte el pase en cualquier celular.</p>
        </div>
        <Boton onClick={() => navegar("/studio/cuenta?volver=/studio/apoyo")}>Crear mi cuenta gratis</Boton>
      </Pantalla>
    );
  }

  const pendiente = solicitud?.estado === "pendiente";

  return (
    <Pantalla titulo="Camino al pase libre" atras="/studio/perfil">
      <div className="-mt-2 flex items-center gap-3 rounded-tarjeta bg-brand p-4 text-white" style={{ boxShadow: "0 4px 0 var(--brand-dark)" }}>
        <div className="flex-1">
          <p className="text-[20px] leading-6 font-black">Pase libre de por vida</p>
          <p className="mt-1 text-ayuda font-semibold opacity-90">Temas importados sin límite, para siempre, más {MONEDAS_BONO} monedas.</p>
        </div>
        <Leon pose="saluda" alto={84} />
      </div>

      {solicitud?.estado === "rechazada" && (
        <p role="alert" className="rounded-boton border-2 border-error bg-card px-4 py-3 font-bold text-error-dark">
          No pudimos confirmar tu apoyo{solicitud.nota ? `: ${solicitud.nota}` : "."} Puedes enviar otra solicitud con mejores capturas.
        </p>
      )}

      {pendiente ? (
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3 rounded-tarjeta border-2 border-reward-dark bg-card p-4">
          <h2 className="text-tarjeta font-extrabold">Solicitud en revisión</h2>
          <p className="text-text-soft">
            Tu código es <span className="numeros rounded-boton bg-surface px-3 py-1 font-black text-text">{solicitud!.codigo}</span>
          </p>
          <p className="text-text-soft">
            Si aún no mandaste tus capturas por WhatsApp, hazlo con este código. Cuando las revisemos, tu pase se activa solo al abrir la app.
          </p>
          <Boton onClick={() => window.open(enlaceWhatsApp(solicitud!), "_blank", "noopener")}>Abrir WhatsApp con mi código</Boton>
          <Boton variante="secundario" onClick={() => void cargar().then(() => aviso("Sigue en revisión.", "info"))}>
            Revisar si ya me aprobaron
          </Boton>
        </motion.section>
      ) : (
        <>
          <section className="flex flex-col gap-3">
            <h2 className="text-tarjeta font-extrabold">Pasos</h2>
            {REQUISITOS.map((r, i) => (
              <div key={r.id} className="rounded-tarjeta border-2 border-surface bg-card p-4">
                <p className="flex items-start gap-3 font-extrabold">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand text-[14px] font-black text-white">{i + 1}</span>
                  {r.titulo}
                </p>
                <p className="mt-1 text-ayuda text-text-soft">{r.detalle}</p>
                {r.enlace && (
                  <a href={r.enlace} target="_blank" rel="noopener noreferrer" className="mt-3 grid h-12 place-items-center rounded-boton border-2 border-surface bg-bg font-extrabold text-brand">
                    {r.accion ?? "Abrir"}
                  </a>
                )}
              </div>
            ))}
            <div className="rounded-tarjeta border-2 border-surface bg-card p-4">
              <p className="flex items-start gap-3 font-extrabold">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand text-[14px] font-black text-white">{REQUISITOS.length + 1}</span>
                Dinos tu usuario y manda tus capturas
              </p>
              <div className="mt-3">
                <Campo etiqueta="Tu usuario de Instagram" value={usuario} onChange={(ev) => setUsuario(ev.target.value)} placeholder="@tuusuario" autoCapitalize="none" autoCorrect="off" />
              </div>
              <p className="mt-2 text-ayuda text-text-soft">Al tocar el botón se abre WhatsApp con un código. Adjunta ahí tus capturas y envía.</p>
            </div>
          </section>

          {error && (
            <p role="alert" className="rounded-boton border-2 border-error bg-card px-4 py-3 font-bold text-error-dark">
              {error}
            </p>
          )}
          <Boton deshabilitado={limpiarUsuario(usuario).length < 2 || enviando} onClick={enviar}>
            {enviando ? "Enviando…" : "Pedir mi pase y abrir WhatsApp"}
          </Boton>
          <p className="text-center text-ayuda text-text-soft">Lo revisamos a mano para que sea justo. El premio es el mismo para todos.</p>
        </>
      )}
    </Pantalla>
  );
}
