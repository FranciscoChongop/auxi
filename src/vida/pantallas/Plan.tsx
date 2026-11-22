import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { BarraProgreso } from "../../components/BarraProgreso";
import { Boton } from "../../components/Boton";
import { hoy } from "../../lib/fechas";
import { reemplazar, volver } from "../../lib/rutas";
import { sonidos } from "../../lib/sonidos";
import { actualizarVida, baseDiaria, ingresoMensual, obtenerVida, soles, type Periodo } from "../estado";
import { aNumero, CampoSoles, Chip, confetiVida, Encabezado, LeonVida, Pagina, PieFijo, Soles } from "../ui";

const PERIODOS: { id: Periodo; nombre: string; pregunta: string }[] = [
  { id: "dia", nombre: "Por día", pregunta: "en un día normal" },
  { id: "semana", nombre: "Por semana", pregunta: "en una semana normal" },
  { id: "mes", nombre: "Por mes", pregunta: "en un mes normal" },
];

const FIJOS = ["Alquiler", "Luz y agua", "Internet o celular", "Deudas", "Colegio o estudios", "Familia"];

/** Las 3 preguntas, una por pantalla, y el resultado: "Hoy puedes gastar S/ X". */
export default function Plan() {
  const previo = obtenerVida().plan;
  const [paso, setPaso] = useState(0);
  const [periodo, setPeriodo] = useState<Periodo>(previo?.periodo ?? "dia");
  const [ingreso, setIngreso] = useState(previo ? String(previo.ingreso) : "");
  const [diasSemana, setDiasSemana] = useState(previo?.diasSemana ?? 6);
  const [fijos, setFijos] = useState(previo ? String(previo.fijos) : "");
  const [fijosEn, setFijosEn] = useState<string[]>(previo?.fijosEn ?? []);
  const [ahorro, setAhorro] = useState(previo ? String(previo.ahorro) : "");

  const datos = { ingreso: aNumero(ingreso), periodo, diasSemana, fijos: aNumero(fijos), ahorro: aNumero(ahorro) };
  const mensual = ingresoMensual(datos);
  const libreSinAhorro = Math.max(0, mensual - datos.fijos);
  const sugerido = Math.round((libreSinAhorro * 0.1) / 5) * 5;
  const base = baseDiaria(datos);
  const ahorroAlto = datos.ahorro > 0 && datos.ahorro > libreSinAhorro * 0.5;

  const ir = (n: number) => {
    sonidos.toque();
    setPaso(n);
  };

  const guardar = () => {
    actualizarVida((s) => ({
      plan: { ...datos, fijosEn, desde: s.plan?.desde ?? hoy() },
      colchon: s.colchon.meta ? s.colchon : { ...s.colchon, meta: Math.max(50, Math.round((mensual - datos.fijos) / 4 / 10) * 10) },
    }));
    if (previo) reemplazar("/vida/inicio");
    else reemplazar("/vida/anotar?primero=1");
  };

  const atras = () => (paso === 0 ? volver(previo ? "/vida/perfil" : "/vida") : ir(paso - 1));

  return (
    <Pagina className="flex flex-col">
      <Encabezado titulo={paso < 3 ? "Arma tu presupuesto" : "Tu número del día"} alVolver={atras} />
      {paso < 3 && (
        <div className="px-5 pt-1">
          <BarraProgreso valor={(paso + 1) / 3} etiqueta={`Pregunta ${paso + 1} de 3`} />
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={paso}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.2 }}
          className="flex flex-1 flex-col px-5 pt-6"
        >
          {paso === 0 && (
            <>
              <h2 className="text-titulo font-black">¿Cuánto ganas?</h2>
              <p className="mt-1 text-text-soft">Lo de un tiempo normal, sin contar días raros. Puede ser aproximado.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {PERIODOS.map((p) => (
                  <Chip key={p.id} activo={periodo === p.id} onClick={() => setPeriodo(p.id)}>
                    {p.nombre}
                  </Chip>
                ))}
              </div>
              <div className="mt-4">
                <CampoSoles etiqueta={`Lo que ganas ${PERIODOS.find((p) => p.id === periodo)!.pregunta}`} valor={ingreso} alCambiar={setIngreso} autoFocus />
              </div>
              {periodo === "dia" && (
                <div className="mt-5">
                  <p className="text-ayuda font-extrabold text-text-soft">¿Cuántos días trabajas a la semana?</p>
                  <div className="mt-2 flex gap-2">
                    {[3, 4, 5, 6, 7].map((d) => (
                      <Chip key={d} activo={diasSemana === d} onClick={() => setDiasSemana(d)}>
                        {d}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}
              {datos.ingreso > 0 && periodo !== "mes" && (
                <p className="mt-4 text-ayuda text-text-soft">
                  Son unos <b className="text-text">{soles(Math.round(mensual))}</b> al mes.
                </p>
              )}
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
                <CampoSoles etiqueta="Total de pagos fijos al mes" valor={fijos} alCambiar={setFijos} autoFocus />
              </div>
              {datos.fijos > mensual && mensual > 0 && (
                <p className="mt-4 rounded-[16px] bg-surface p-3 text-ayuda">Tus fijos pasan lo que ganas. Lo vemos juntos: igual puedes anotar y ver por dónde ajustar.</p>
              )}
            </>
          )}

          {paso === 2 && (
            <>
              <h2 className="text-titulo font-black">¿Cuánto quieres guardar al mes?</h2>
              <p className="mt-1 text-text-soft">Para tu colchón. Poquito y seguido funciona mejor que mucho una vez.</p>
              {sugerido > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {[0.05, 0.1, 0.15].map((pct) => {
                    const v = Math.round((libreSinAhorro * pct) / 5) * 5;
                    return (
                      <Chip key={pct} activo={datos.ahorro === v} onClick={() => setAhorro(String(v))}>
                        {soles(v)}
                      </Chip>
                    );
                  })}
                  <Chip activo={ahorro === "0"} onClick={() => setAhorro("0")}>
                    Por ahora nada
                  </Chip>
                </div>
              )}
              <div className="mt-4">
                <CampoSoles etiqueta="Lo que quieres guardar al mes" valor={ahorro} alCambiar={setAhorro} />
              </div>
              <p className="mt-4 text-ayuda text-text-soft">
                {sugerido > 0 ? `León sugiere empezar con ${soles(sugerido)}: es un 10 % de lo que te queda libre.` : "Puedes empezar con S/ 0 y cambiarlo cuando quieras."}
              </p>
              {ahorroAlto && <p className="mt-2 text-ayuda font-bold">Es más de la mitad de lo libre. Si se hace pesado, bájalo sin culpa.</p>}
            </>
          )}

          {paso === 3 && <Resultado base={base} />}
        </motion.div>
      </AnimatePresence>

      <PieFijo>
        {paso === 0 && <Boton deshabilitado={!datos.ingreso} onClick={() => ir(1)}>Siguiente</Boton>}
        {paso === 1 && <Boton onClick={() => ir(2)}>{datos.fijos ? "Siguiente" : "No tengo fijos"}</Boton>}
        {paso === 2 && <Boton onClick={() => ir(3)}>Ver mi número</Boton>}
        {paso === 3 && <Boton onClick={guardar}>{previo ? "Guardar cambios" : "Anotar mi primer gasto"}</Boton>}
      </PieFijo>
    </Pagina>
  );
}

function Resultado({ base }: { base: number }) {
  const [valor, setValor] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      setValor(base);
      sonidos.leccionCompleta();
      if (base > 0) void confetiVida();
    }, 250);
    return () => clearTimeout(t);
  }, [base]);
  return (
    <div className="flex flex-col items-center text-center">
      <LeonVida pose={base > 0 ? "celebra" : "anima"} alto={190} rebote />
      <p className="mt-4 font-extrabold text-text-soft">Hoy puedes gastar</p>
      <Soles valor={valor} className="text-[56px] leading-[60px] font-black text-brand" />
      <p className="mt-3 max-w-xs text-text-soft">
        {base > 0
          ? "Cada vez que anotes un gasto o un ingreso, León vuelve a hacer la cuenta."
          : "Con estos números no queda libre para el día. Anota igual: verlo es el primer paso para ajustar."}
      </p>
    </div>
  );
}
