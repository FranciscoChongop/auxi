import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { BarraProgreso } from "../../components/BarraProgreso";
import { Boton } from "../../components/Boton";
import { hoy } from "../../lib/fechas";
import { reemplazar, volver } from "../../lib/rutas";
import { sonidos } from "../../lib/sonidos";
import { actualizarVida, baseDiaria, ID_COLCHON, ingresoMensual, obtenerVida, soles, type Periodo } from "../estado";
import { aNumero, CampoSoles, Chip, Encabezado, GrupoUnico, LeonVida, Pagina, PieFijo, Soles } from "../ui";

const PERIODOS: { id: Periodo; nombre: string; etiqueta: string }[] = [
  { id: "dia", nombre: "Por día", etiqueta: "Lo que ganas en un día normal" },
  { id: "semana", nombre: "Por semana", etiqueta: "Lo que ganas en una semana normal" },
  { id: "quincena", nombre: "Por quincena", etiqueta: "Lo que te pagan cada quincena" },
  { id: "mes", nombre: "Por mes", etiqueta: "Lo que ganas en un mes normal" },
  { id: "variable", nombre: "Cambia mucho", etiqueta: "Más o menos, en un mes (un promedio)" },
  { id: "ninguno", nombre: "Ahora no tengo ingresos", etiqueta: "¿Con cuánta plata cuentas para este mes?" },
];

const FIJOS = ["Alquiler", "Luz y agua", "Internet o celular", "Deudas", "Estudios", "Familia", "Suscripciones"];

function PorQue({ children }: { children: string }) {
  return (
    <details className="mt-4 rounded-[16px] bg-surface px-4 py-3 text-ayuda">
      <summary className="min-h-6 cursor-pointer font-extrabold text-brand">¿Por qué te lo pregunto?</summary>
      <p className="mt-1">{children}</p>
    </details>
  );
}

/** Las 3 preguntas, una por pantalla, y el resultado. Lo que respondes se guarda al toque. */
export default function Plan() {
  const e = obtenerVida();
  const previo = e.plan;
  const b = { ...previo, ...e.borrador };
  const [paso, setPaso] = useState(previo ? 0 : (e.borrador.paso ?? 0));
  const [periodo, setPeriodo] = useState<Periodo>(b.periodo ?? "dia");
  const [ingreso, setIngreso] = useState(b.ingreso !== undefined ? String(b.ingreso) : "");
  const [diasSemana, setDiasSemana] = useState(b.diasSemana ?? 6);
  const [fijos, setFijos] = useState(b.fijos !== undefined ? String(b.fijos) : "");
  const [fijosEn, setFijosEn] = useState<string[]>(b.fijosEn ?? []);
  const [ahorro, setAhorro] = useState(b.ahorro !== undefined ? String(b.ahorro) : "");

  const datos = { ingreso: aNumero(ingreso), periodo, diasSemana, fijos: aNumero(fijos), ahorro: aNumero(ahorro) };
  const mensual = ingresoMensual(datos);
  const libreSinAhorro = Math.max(0, mensual - datos.fijos);
  const sugerido = Math.round((libreSinAhorro * 0.1) / 5) * 5;
  const base = baseDiaria(datos);
  const info = PERIODOS.find((p) => p.id === periodo)!;

  // Guardado del avance: si sales a medias, retomas donde ibas.
  useEffect(() => {
    if (previo) return;
    actualizarVida(() => ({ borrador: { ...datos, fijosEn, paso } }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodo, ingreso, diasSemana, fijos, fijosEn, ahorro, paso]);

  const ir = (n: number) => {
    sonidos.toque();
    setPaso(n);
  };

  const guardar = () => {
    actualizarVida((s) => ({
      iniciado: true,
      plan: { ...datos, fijosEn, desde: s.plan?.desde ?? hoy() },
      borrador: {},
      frascos: s.frascos.map((f) => (f.id === ID_COLCHON && !f.meta ? { ...f, meta: Math.max(50, Math.round(Math.max(0, mensual - datos.fijos) / 4 / 10) * 10) } : f)),
    }));
    reemplazar(previo || obtenerVida().primerAnotado ? "/vida/hoy" : "/vida/registrar?primero=1");
  };

  const atras = () => (paso === 0 ? volver(previo ? "/vida/hoy" : "/vida/empezar") : ir(paso - 1));
  const sinIngreso = periodo === "ninguno";

  return (
    <Pagina className="flex flex-col">
      <Encabezado titulo={paso < 3 ? "Arma tu número del día" : "Tu número del día"} alVolver={atras} />
      {paso < 3 && (
        <div className="px-5 pt-1">
          <BarraProgreso valor={(paso + 1) / 3} etiqueta={`Pregunta ${paso + 1} de 3`} />
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={paso} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }} className="flex flex-1 flex-col px-5 pt-6">
          {paso === 0 && (
            <>
              <h2 className="text-titulo font-black">¿Cómo te llega la plata?</h2>
              <p className="mt-1 text-text-soft">Puede ser aproximado. Lo corriges cuando quieras.</p>
              <div className="mt-5">
                <GrupoUnico etiqueta="Cómo te llega la plata">
                  {PERIODOS.map((p) => (
                    <Chip key={p.id} radio activo={periodo === p.id} onClick={() => setPeriodo(p.id)}>
                      {p.nombre}
                    </Chip>
                  ))}
                </GrupoUnico>
              </div>
              <div className="mt-4">
                <CampoSoles etiqueta={info.etiqueta} valor={ingreso} alCambiar={setIngreso} />
              </div>
              {periodo === "dia" && (
                <div className="mt-5">
                  <p id="dias-semana" className="text-ayuda font-extrabold text-text-soft">
                    ¿Cuántos días trabajas a la semana?
                  </p>
                  <div className="mt-2">
                    <GrupoUnico etiqueta="Días que trabajas a la semana">
                      {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                        <Chip key={d} radio activo={diasSemana === d} onClick={() => setDiasSemana(d)}>
                          {d}
                        </Chip>
                      ))}
                    </GrupoUnico>
                  </div>
                </div>
              )}
              {datos.ingreso > 0 && !["mes", "variable", "ninguno"].includes(periodo) && (
                <p className="mt-4 text-ayuda text-text-soft">
                  Son unos <b className="text-text">{soles(Math.round(mensual))}</b> al mes.
                </p>
              )}
              {sinIngreso && <p className="mt-4 text-ayuda text-text-soft">Si hoy no entra nada, igual te ayudo a que te alcance lo que tienes. Puedes poner S/ 0.</p>}
              <PorQue>Con esto calculo cuánto entra en un mes. No se lo mostramos a nadie y no lo necesitamos exacto.</PorQue>
            </>
          )}

          {paso === 1 && (
            <>
              <h2 className="text-titulo font-black">¿Cuánto pagas fijo al mes?</h2>
              <p className="mt-1 text-text-soft">Lo que pagas sí o sí. Toca lo que tengas y escribe el total.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {FIJOS.map((f) => (
                  <Chip key={f} activo={fijosEn.includes(f)} onClick={() => setFijosEn((a) => (a.includes(f) ? a.filter((x) => x !== f) : [...a, f]))}>
                    {f}
                  </Chip>
                ))}
              </div>
              <div className="mt-4">
                <CampoSoles etiqueta="Total de pagos fijos al mes" valor={fijos} alCambiar={setFijos} />
              </div>
              {datos.fijos > mensual && mensual > 0 && <p className="mt-4 rounded-[16px] bg-surface p-3 text-ayuda">Tus fijos pasan lo que entra. Igual anota: verlo es el primer paso para ajustar.</p>}
              <PorQue>Lo separo antes de calcular tu número del día, para que no gastes la plata del alquiler o de la luz sin darte cuenta.</PorQue>
            </>
          )}

          {paso === 2 && (
            <>
              <h2 className="text-titulo font-black">¿Cuánto quieres guardar al mes?</h2>
              <p className="mt-1 text-text-soft">Para tu colchón. Poquito y seguido funciona mejor que mucho una vez.</p>
              <div className="mt-5">
                <GrupoUnico etiqueta="Cuánto guardar al mes">
                  {sugerido > 0 &&
                    [0.05, 0.1, 0.15].map((pct) => {
                      const v = Math.round((libreSinAhorro * pct) / 5) * 5;
                      return (
                        <Chip key={pct} radio activo={datos.ahorro === v && ahorro !== ""} onClick={() => setAhorro(String(v))}>
                          {soles(v)}
                        </Chip>
                      );
                    })}
                  <Chip radio activo={ahorro === "0"} onClick={() => setAhorro("0")}>
                    Por ahora nada
                  </Chip>
                </GrupoUnico>
              </div>
              <div className="mt-4">
                <CampoSoles etiqueta="Lo que quieres guardar al mes" valor={ahorro} alCambiar={setAhorro} />
              </div>
              <p className="mt-4 text-ayuda text-text-soft">
                {sugerido > 0 ? `León sugiere empezar con ${soles(sugerido)}: es un 10 % de lo que te queda libre.` : "Puedes empezar con S/ 0 y cambiarlo cuando quieras."}
              </p>
              <PorQue>Esa plata la reservo cada mes y no la cuento como disponible. Auxi Vida no la mueve: solo te ayuda a no gastarla.</PorQue>
            </>
          )}

          {paso === 3 && <Resultado base={base} />}
        </motion.div>
      </AnimatePresence>

      <PieFijo>
        {paso === 0 && (
          <Boton deshabilitado={!datos.ingreso && !sinIngreso} onClick={() => ir(1)}>
            Siguiente
          </Boton>
        )}
        {paso === 1 && <Boton onClick={() => ir(2)}>{datos.fijos ? "Siguiente" : "No tengo fijos"}</Boton>}
        {paso === 2 && <Boton onClick={() => ir(3)}>Ver mi número</Boton>}
        {paso === 3 && (
          <div className="flex flex-col gap-3">
            <Boton onClick={guardar}>{previo ? "Guardar cambios" : "Listo, registrar mi primer gasto"}</Boton>
            <Boton variante="secundario" onClick={() => ir(0)}>
              Corregir respuestas
            </Boton>
          </div>
        )}
      </PieFijo>
    </Pagina>
  );
}

function Resultado({ base }: { base: number }) {
  const [valor, setValor] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      setValor(base);
      sonidos.acierto();
    }, 250);
    return () => clearTimeout(t);
  }, [base]);
  return (
    <div className="flex flex-col items-center text-center">
      <LeonVida pose={base > 0 ? "celebra" : "anima"} alto={180} rebote />
      <p className="mt-4 font-extrabold text-text-soft">Disponible estimado para hoy</p>
      <Soles valor={valor} className="text-[56px] leading-[60px] font-black text-brand" />
      <p className="mt-3 max-w-xs text-text-soft">
        {base > 0
          ? "Es un estimado con lo que me contaste, no el saldo de tu banco. Cada vez que registres algo, rehago la cuenta."
          : "Con estos números no queda libre para el día. Registra igual: verlo es el primer paso para ajustar."}
      </p>
    </div>
  );
}
