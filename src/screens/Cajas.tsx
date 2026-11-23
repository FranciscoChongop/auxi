import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { Boton } from "../components/Boton";
import { Leon } from "../components/Leon";
import { Pantalla } from "../components/Navegacion";
import { SinTema } from "../components/SinTema";
import { SelectorTema } from "../components/SelectorTema";
import { TarjetaVolteable } from "../juegos/TarjetaVolteable";
import { lanzarConfeti } from "../lib/confeti";
import { cursoDe, todasLasTarjetas } from "../lib/curso";
import { actualizar, useEstado } from "../lib/estado";
import { sonidos } from "../lib/sonidos";
import { vibrar } from "../lib/vibrar";

const RONDA = 8;

/** Las 5 cajas (Leitner): lo que recuerdas sube de caja; lo que no, vuelve a la 1. */
export default function Cajas() {
  const e = useEstado();
  const tarjetas = useMemo(() => todasLasTarjetas(cursoDe(e)), [e.cursoId]); // eslint-disable-line react-hooks/exhaustive-deps
  const caja = (id: string) => e.cajas[id] ?? 1;
  const sinTarjetas = tarjetas.length === 0;
  const [vistas, setVistas] = useState<string[]>([]);
  const [volteada, setVolteada] = useState(false);
  const [salto, setSalto] = useState<number | null>(null);

  // Siguiente tarjeta: la de la caja más baja que no viste en esta ronda.
  const pendientes = tarjetas.filter((t) => !vistas.includes(t.id)).sort((a, b) => caja(a.id) - caja(b.id));
  const actual = vistas.length < RONDA ? pendientes[0] : undefined;
  const conteo = [1, 2, 3, 4, 5].map((n) => tarjetas.filter((t) => caja(t.id) === n).length);
  const llenas = conteo[4];

  function responder(recorde: boolean) {
    if (!actual) return;
    const nueva = recorde ? Math.min(5, caja(actual.id) + 1) : 1;
    actualizar((s) => ({ cajas: { ...s.cajas, [actual.id]: nueva } }));
    if (recorde) {
      sonidos.acierto();
      vibrar("acierto");
    } else sonidos.toque();
    if (recorde && nueva === 5) void lanzarConfeti();
    setSalto(nueva);
    setVistas((v) => [...v, actual.id]);
    setVolteada(false);
  }

  if (sinTarjetas) {
    return (
      <Pantalla titulo="Las 5 cajas" atras="/teach/metodos" conBarra={false}>
        <SinTema texto="Las 5 cajas usan las tarjetas de tus temas. Agrega uno para empezar." />
      </Pantalla>
    );
  }

  return (
    <Pantalla titulo="Las 5 cajas" atras="/teach/metodos" conBarra={false}>
      <SelectorTema etiqueta="Repasas" />
      {/* Las cajas se llenan */}
      <div className="grid grid-cols-5 gap-2" aria-label="Tarjetas por caja">
        {conteo.map((n, i) => (
          <motion.div
            key={i}
            animate={salto === i + 1 ? { y: [0, -8, 0], scale: [1, 1.08, 1] } : {}}
            transition={{ duration: 0.35 }}
            onAnimationComplete={() => setSalto(null)}
            className="flex flex-col items-center gap-1"
          >
            <div className="relative flex h-20 w-full items-end overflow-hidden rounded-[12px] border-2 border-surface bg-card">
              <motion.div
                className={`w-full ${i === 4 ? "bg-reward" : "bg-success"}`}
                animate={{ height: `${tarjetas.length ? (n / tarjetas.length) * 100 : 0}%` }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              />
              <span className="numeros absolute inset-x-0 top-1 text-center text-[15px] font-black">{n}</span>
            </div>
            <span className="text-ayuda font-bold text-text-soft">Caja {i + 1}</span>
          </motion.div>
        ))}
      </div>

      {actual ? (
        <>
          <p className="text-ayuda font-bold text-text-soft">
            Tarjeta {vistas.length + 1} de {Math.min(RONDA, tarjetas.length)} · está en la caja {caja(actual.id)}
          </p>
          <TarjetaVolteable tarjeta={actual} volteada={volteada} alVoltear={() => setVolteada((v) => !v)} />
          <div className="mt-auto flex flex-col gap-3">
            {volteada ? (
              <>
                <Boton variante="exito" sinSonido onClick={() => responder(true)}>
                  Me acordé
                </Boton>
                <Boton variante="secundario" onClick={() => responder(false)}>
                  No me acordaba
                </Boton>
              </>
            ) : (
              <Boton onClick={() => setVolteada(true)}>Ver la respuesta</Boton>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <Leon pose="anima" alto={180} rebote />
          <p className="text-tarjeta font-extrabold">Ronda terminada</p>
          <p className="text-text-soft">
            {llenas === tarjetas.length
              ? "Todas tus tarjetas llegaron a la caja 5."
              : `${llenas} de ${tarjetas.length} tarjetas ya están en la caja 5.`}
          </p>
          <div className="mt-4 w-full">
            <Boton onClick={() => setVistas([])}>Otra ronda</Boton>
          </div>
        </div>
      )}
    </Pantalla>
  );
}
