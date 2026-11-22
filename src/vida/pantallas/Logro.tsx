import { motion } from "motion/react";
import { useEffect } from "react";
import { Boton } from "../../components/Boton";
import { ContadorAnimado } from "../../components/ContadorAnimado";
import { Llama, Moneda } from "../../components/Navegacion";
import { reemplazar } from "../../lib/rutas";
import { sonidos } from "../../lib/sonidos";
import { obtenerVida, soles } from "../estado";
import { leerLogro } from "../logro";
import { confetiVida, LeonVida, Pagina, PieFijo } from "../ui";

/** Después de anotar: lo primero del día se celebra (racha, monedas y cofre). */
export function despuesDelLogro() {
  const e = obtenerVida();
  if (!e.cuentaOfrecida) reemplazar("/vida/cuenta");
  else reemplazar("/vida/inicio");
}

export default function Logro() {
  const l = leerLogro();
  useEffect(() => {
    if (!l) {
      reemplazar("/vida/inicio");
      return;
    }
    sonidos.leccionCompleta();
    void confetiVida();
  }, [l]);
  if (!l) return null;

  const pasado = l.quedan < 0;
  return (
    <Pagina className="flex flex-col">
      <div className="flex flex-1 flex-col items-center px-5 text-center" style={{ paddingTop: "calc(env(safe-area-inset-top) + 32px)" }}>
        <LeonVida pose={pasado ? "anima" : "celebra"} alto={220} rebote />
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }} className="mt-4 text-titulo font-black">
          {l.primero ? "¡Tu primer gasto anotado!" : "¡Ya anotaste hoy!"}
        </motion.h1>
        <p className="mt-2 max-w-xs text-text-soft">
          {pasado ? `Hoy te pasaste ${soles(-l.quedan)}. Mañana ajustamos juntos.` : `Hoy te quedan ${soles(l.quedan)}. Así de fácil es saberlo.`}
        </p>

        <div className="mt-6 grid w-full grid-cols-2 gap-3">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1, transition: { delay: 0.35, type: "spring", stiffness: 420, damping: 16 } }} className="rounded-[20px] bg-card p-4">
            <span className="flex items-center justify-center gap-1 text-[32px] font-black text-reward-dark">
              <Llama activa className="size-8" />
              <ContadorAnimado valor={l.rachaDias} />
            </span>
            <p className="text-ayuda font-extrabold text-text-soft">{l.rachaDias === 1 ? "día anotando" : "días anotando"}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1, transition: { delay: 0.5, type: "spring", stiffness: 420, damping: 16 } }} className="rounded-[20px] bg-card p-4">
            <span className="flex items-center justify-center gap-1 text-[32px] font-black">
              <Moneda className="size-8" />+<ContadorAnimado valor={l.monedas} />
            </span>
            <p className="text-ayuda font-extrabold text-text-soft">monedas</p>
          </motion.div>
        </div>
        {l.usoProtector && <p className="mt-3 text-ayuda font-bold">Tu protector cuidó la racha del día que faltó.</p>}
      </div>

      <PieFijo>
        {l.cofre ? (
          <div className="flex flex-col gap-3">
            <Boton variante="premio" onClick={() => reemplazar("/vida/cofre")}>
              Abrir el cofre del día
            </Boton>
            <Boton variante="secundario" onClick={despuesDelLogro}>
              Ahora no
            </Boton>
          </div>
        ) : (
          <Boton onClick={despuesDelLogro}>Seguir</Boton>
        )}
      </PieFijo>
    </Pagina>
  );
}
