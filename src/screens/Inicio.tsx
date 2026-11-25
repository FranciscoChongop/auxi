import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Boton } from "../components/Boton";
import { esIphone, estaInstalada, GuiaIphone } from "../components/GuiaIphone";
import { CaraDeLeon } from "../components/Leon";
import { Icono, Pantalla } from "../components/Navegacion";
import { GuiaInicio } from "../components/GuiaInicio";
import { Recordatorios } from "../components/Recordatorios";
import { SinTema } from "../components/SinTema";
import { Accesos, Continuar, Hoy, MisTemas, ResumenCamino, Saludo, SemanaYMeta, TarjetaExamen } from "../components/Tablero";
import { Ventana } from "../components/Ventana";
import { avance, cursoDe, nodos, esVacio } from "../lib/curso";
import { actualizar, debidosDeRepaso, useEstado } from "../lib/estado";
import { hoy } from "../lib/fechas";
import { navegar } from "../lib/rutas";
import { sonidos } from "../lib/sonidos";

/** true en pantallas de computadora (desde 768 px); cambia si se redimensiona la ventana. */
function useComputadora() {
  const [si, setSi] = useState(() => window.matchMedia("(min-width: 768px)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const cambio = () => setSi(mq.matches);
    mq.addEventListener("change", cambio);
    return () => mq.removeEventListener("change", cambio);
  }, []);
  return si;
}

export default function Inicio() {
  const e = useEstado();
  const computadora = useComputadora();
  const curso = cursoDe(e);
  const lista = nodos(curso, e);
  const actual = lista.find((n) => n.abierto && !n.hecho);
  const errores = debidosDeRepaso(e, curso.id).length;

  const [tarjetaDia, setTarjetaDia] = useState(
    () => e.tarjetaDia !== hoy() && e.totales.lecciones > 0 && e.racha.ultimoDia !== hoy(),
  );
  const [guia, setGuia] = useState(() => esIphone && !estaInstalada && !e.guiaIphoneVista && e.totales.lecciones > 0);

  function cerrarTarjeta() {
    setTarjetaDia(false);
    actualizar(() => ({ tarjetaDia: hoy() }));
  }

  const principal = esVacio(curso) ? (
    <SinTema />
  ) : (
    <>
      <Continuar e={e} curso={curso} actual={actual} avance={avance(curso, e)} />
      <ResumenCamino curso={curso} lista={lista} />
    </>
  );

  return (
    <Pantalla amplio>
      <Saludo />
      {computadora ? (
        // Computadora: lo principal a la izquierda; examen, meta y entregas a la derecha.
        <div className="grid grid-cols-[minmax(0,1fr)_340px] items-start gap-6">
          <div className="flex min-w-0 flex-col gap-4">
            <GuiaInicio e={e} />
            <Recordatorios e={e} />
            {principal}
            <MisTemas e={e} />
            <Accesos errores={errores} />
          </div>
          <div className="sticky top-6 flex flex-col gap-4">
            <TarjetaExamen e={e} />
            <SemanaYMeta e={e} />
            <Hoy e={e} />
          </div>
        </div>
      ) : (
        <>
          <GuiaInicio e={e} />
          <Recordatorios e={e} />
          <TarjetaExamen e={e} />
          <SemanaYMeta e={e} />
          {principal}
          <MisTemas e={e} />
          <Hoy e={e} />
          <Accesos errores={errores} />
        </>
      )}

      {/* Botón flotante para subir material nuevo */}
      <motion.button
        type="button"
        aria-label="Subir material nuevo"
        onClick={() => navegar("/student/material")}
        onPointerDown={() => sonidos.toque()}
        whileTap={{ scale: 0.9 }}
        className="fixed right-5 z-20 grid size-14 cursor-pointer place-items-center rounded-full bg-brand text-white md:hidden"
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
              navegar(errores > 0 ? "/student/leccion?n=repaso" : actual ? `/student/leccion?n=${actual.clave}` : "/student/material");
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
