import { motion } from "motion/react";
import { useState } from "react";
import { Boton } from "../components/Boton";
import { esIphone, estaInstalada, GuiaIphone } from "../components/GuiaIphone";
import { CaraDeLeon } from "../components/Leon";
import { Icono, Pantalla } from "../components/Navegacion";
import { Accesos, Continuar, Hoy, MisTemas, ResumenCamino, Saludo, SemanaYMeta, TarjetaExamen } from "../components/Tablero";
import { Ventana } from "../components/Ventana";
import { avance, cursoDe, nodos } from "../lib/curso";
import { actualizar, useEstado } from "../lib/estado";
import { hoy } from "../lib/fechas";
import { navegar } from "../lib/rutas";
import { sonidos } from "../lib/sonidos";

export default function Inicio() {
  const e = useEstado();
  const curso = cursoDe(e);
  const lista = nodos(curso, e);
  const actual = lista.find((n) => n.abierto && !n.hecho);
  const errores = e.errores[curso.id]?.length ?? 0;

  const [tarjetaDia, setTarjetaDia] = useState(
    () => e.tarjetaDia !== hoy() && e.totales.lecciones > 0 && e.racha.ultimoDia !== hoy(),
  );
  const [guia, setGuia] = useState(() => esIphone && !estaInstalada && !e.guiaIphoneVista && e.totales.lecciones > 0);

  function cerrarTarjeta() {
    setTarjetaDia(false);
    actualizar(() => ({ tarjetaDia: hoy() }));
  }

  return (
    <Pantalla>
      <Saludo />
      <TarjetaExamen e={e} />
      <SemanaYMeta e={e} />
      <Continuar e={e} curso={curso} actual={actual} avance={avance(curso, e)} />
      <MisTemas e={e} />
      <ResumenCamino curso={curso} lista={lista} />
      <Hoy e={e} />
      <Accesos errores={errores} />

      {/* Botón flotante para subir material nuevo */}
      <motion.button
        type="button"
        aria-label="Subir material nuevo"
        onClick={() => navegar("/studio/material")}
        onPointerDown={() => sonidos.toque()}
        whileTap={{ scale: 0.9 }}
        className="fixed right-5 z-20 grid size-14 cursor-pointer place-items-center rounded-full bg-brand text-white"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 84px)", boxShadow: "0 4px 0 var(--brand-dark)" }}
      >
        <Icono nombre="mas" className="size-7" />
      </motion.button>

      <Ventana abierta={tarjetaDia && !guia} alCerrar={cerrarTarjeta} titulo={errores > 0 ? "Repaso de hoy" : "Reto de hoy"}>
        <div className="flex items-center gap-3">
          <CaraDeLeon cara="guino" tamano={56} />
          <p className="font-bold">
            {errores > 0
              ? `Tienes ${errores} ${errores === 1 ? "pregunta" : "preguntas"} para repasar. Son 2 minutos.`
              : actual
                ? `Termina «${actual.titulo}» y abre tu cofre del día.`
                : "Sube un material nuevo y sigue tu racha."}
          </p>
        </div>
        <div className="mt-5">
          <Boton
            onClick={() => {
              cerrarTarjeta();
              navegar(errores > 0 ? "/studio/leccion?n=repaso" : actual ? `/studio/leccion?n=${actual.clave}` : "/studio/material");
            }}
          >
            Vamos
          </Boton>
        </div>
      </Ventana>

      <GuiaIphone
        abierta={guia}
        alCerrar={() => {
          setGuia(false);
          actualizar(() => ({ guiaIphoneVista: true }));
        }}
      />
    </Pantalla>
  );
}
