import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useAviso } from "../components/Aviso";
import { Boton } from "../components/Boton";
import { Pantalla } from "../components/Navegacion";
import { esDueno, resolverSolicitud, solicitudesPendientes, type Solicitud } from "../lib/apoyo";
import { useCuenta } from "../lib/nube";
import { sonidos } from "../lib/sonidos";

/** Panel solo para el dueño: compara el código con lo que llegó a tu WhatsApp y aprueba o rechaza. */
export default function Revision() {
  const cuenta = useCuenta();
  const aviso = useAviso();
  const [lista, setLista] = useState<Solicitud[] | null>(null);
  const permitido = cuenta.modo === "conectado" && esDueno(cuenta.email);

  async function cargar() {
    setLista(await solicitudesPendientes());
  }

  useEffect(() => {
    if (permitido) void cargar();
  }, [permitido]);

  async function resolver(s: Solicitud, estado: "aprobada" | "rechazada") {
    const ok = await resolverSolicitud(s.id, estado, estado === "rechazada" ? "No vimos tus capturas o no se veía el seguimiento" : undefined);
    if (!ok) return aviso("No pude guardar. Inténtalo otra vez.", "error");
    sonidos.acierto();
    setLista((l) => (l ? l.filter((x) => x.id !== s.id) : l));
    aviso(estado === "aprobada" ? "Aprobada. Su pase se activa al abrir la app." : "Rechazada.", estado === "aprobada" ? "exito" : "info");
  }

  if (!permitido) {
    return (
      <Pantalla titulo="Panel de revisión" atras="/teach/perfil">
        <p className="rounded-tarjeta bg-surface p-4 text-center font-bold text-text-soft">Este panel es solo para el dueño de Auxi. Entra con su cuenta.</p>
      </Pantalla>
    );
  }

  return (
    <Pantalla titulo="Panel de revisión" atras="/teach/perfil">
      <p className="-mt-2 text-text-soft">Busca el código en tu WhatsApp, mira las capturas y aprueba con un toque.</p>
      <Boton variante="secundario" onClick={() => void cargar()}>
        Actualizar lista
      </Boton>
      {lista === null && <p className="text-center text-text-soft">Cargando…</p>}
      {lista?.length === 0 && <p className="rounded-tarjeta bg-surface p-4 text-center font-bold text-text-soft">No hay solicitudes pendientes.</p>}
      <AnimatePresence initial={false}>
        {lista?.map((s) => (
          <motion.div key={s.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 60 }} className="rounded-tarjeta border-2 border-surface bg-card p-4">
            <p className="numeros text-[22px] font-black">{s.codigo}</p>
            <p className="mt-1 font-bold">
              Instagram:{" "}
              {s.instagram ? (
                <a href={`https://www.instagram.com/${s.instagram}/`} target="_blank" rel="noopener noreferrer" className="text-brand underline">
                  @{s.instagram}
                </a>
              ) : (
                "—"
              )}
            </p>
            {s.tiktok && <p className="font-bold">TikTok: @{s.tiktok}</p>}
            {s.comentario && <p className="text-text-soft">Comentó: {s.comentario}</p>}
            <p className="mt-1 text-ayuda text-text-soft">
              {s.correo ?? "sin correo"} · {new Date(s.creado).toLocaleString("es-PE")}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Boton variante="exito" onClick={() => void resolver(s, "aprobada")}>
                Aprobar
              </Boton>
              <Boton variante="secundario" onClick={() => void resolver(s, "rechazada")}>
                Rechazar
              </Boton>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </Pantalla>
  );
}
