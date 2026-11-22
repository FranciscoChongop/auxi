import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { BarraProgreso } from "../../components/BarraProgreso";
import { Boton } from "../../components/Boton";
import { ContadorAnimado } from "../../components/ContadorAnimado";
import { Moneda } from "../../components/Navegacion";
import { Opcion, type EstadoOpcion } from "../../components/Opcion";
import { parametro, reemplazar, volver } from "../../lib/rutas";
import { sonidos } from "../../lib/sonidos";
import { vibrar } from "../../lib/vibrar";
import { actualizarVida } from "../estado";
import { buscarLeccion } from "../lecciones";
import { CaraLeonVida, confetiVida, LeonVida, Pagina, PieFijo } from "../ui";

export default function Leccion() {
  const leccion = buscarLeccion(parametro("id"));
  const [paso, setPaso] = useState(0);
  const [elegida, setElegida] = useState<number | null>(null);
  const [revisada, setRevisada] = useState(false);
  const [aciertos, setAciertos] = useState(0);
  const [seguidos, setSeguidos] = useState(0);
  const [fin, setFin] = useState<{ estrellas: 1 | 2 | 3; monedas: number } | null>(null);

  useEffect(() => {
    if (!leccion) reemplazar("/vida/aprender");
  }, [leccion]);
  if (!leccion) return null;

  const nIdeas = leccion.idea.length;
  const total = nIdeas + leccion.preguntas.length;
  const enIdeas = paso < nIdeas;
  const pregunta = enIdeas ? null : leccion.preguntas[paso - nIdeas];

  const revisar = () => {
    if (elegida === null || !pregunta) return;
    setRevisada(true);
    if (elegida === pregunta.correcta) {
      setAciertos((a) => a + 1);
      const s = seguidos + 1;
      setSeguidos(s);
      if (s > 1) sonidos.combo(s);
      else sonidos.acierto();
      vibrar("acierto");
    } else {
      setSeguidos(0);
      sonidos.error();
      vibrar("error");
    }
  };

  const seguir = () => {
    if (paso + 1 < total) {
      setPaso(paso + 1);
      setElegida(null);
      setRevisada(false);
      return;
    }
    const precision = aciertos / leccion.preguntas.length;
    const estrellas: 1 | 2 | 3 = precision >= 0.9 ? 3 : precision >= 0.6 ? 2 : 1;
    const monedas = 10 + (estrellas === 3 ? 5 : 0);
    actualizarVida((s) => ({ lecciones: { ...s.lecciones, [leccion.id]: Math.max(s.lecciones[leccion.id] ?? 1, estrellas) as 1 | 2 | 3 }, monedas: s.monedas + monedas }));
    setFin({ estrellas, monedas });
    sonidos.leccionCompleta();
    void confetiVida();
  };

  if (fin)
    return (
      <Pagina className="flex flex-col">
        <div className="flex flex-1 flex-col items-center px-5 text-center" style={{ paddingTop: "calc(env(safe-area-inset-top) + 40px)" }}>
          <LeonVida pose="celebra" alto={210} rebote />
          <h1 className="mt-4 text-titulo font-black">¡Lección lista!</h1>
          <p className="mt-1 text-text-soft">{leccion.titulo}</p>
          <div className="mt-4 flex gap-2 text-[40px]" aria-label={`${fin.estrellas} de 3 estrellas`}>
            {[1, 2, 3].map((i) => (
              <motion.span key={i} initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.2 + i * 0.15, type: "spring", stiffness: 420, damping: 12 }} className={i <= fin.estrellas ? "text-reward" : "text-surface"}>
                ★
              </motion.span>
            ))}
          </div>
          <p className="mt-3 flex items-center gap-1 text-tarjeta font-black">
            <Moneda /> +<ContadorAnimado valor={fin.monedas} />
          </p>
        </div>
        <PieFijo>
          <Boton onClick={() => reemplazar("/vida/aprender")}>Seguir</Boton>
        </PieFijo>
      </Pagina>
    );

  const correcta = revisada && pregunta && elegida === pregunta.correcta;
  return (
    <Pagina className="flex flex-col">
      <div className="flex items-center gap-3 px-4" style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)" }}>
        <button type="button" onClick={() => volver("/vida/aprender")} aria-label="Salir de la lección" className="grid size-11 cursor-pointer place-items-center rounded-full text-text-soft">
          <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </button>
        <BarraProgreso valor={paso / total} etiqueta="Avance de la lección" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={paso} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }} className="flex flex-1 flex-col px-5 pt-6">
          {enIdeas ? (
            <>
              <p className="text-ayuda font-extrabold text-brand">
                {leccion.titulo} · {paso + 1} de {nIdeas}
              </p>
              <div className="mt-4 flex items-start gap-3">
                <CaraLeonVida cara={paso === 0 ? "feliz" : paso === 1 ? "curioso" : "risa"} tamano={48} />
                <p className="rounded-[20px] rounded-tl-[6px] bg-card p-4 text-[19px] leading-[27px] font-bold">{leccion.idea[paso]}</p>
              </div>
            </>
          ) : (
            pregunta && (
              <>
                <h1 className="text-tarjeta font-black">{pregunta.enunciado}</h1>
                <div className="mt-5 flex flex-col gap-3">
                  {pregunta.opciones.map((o, i) => {
                    let est: EstadoOpcion = elegida === i ? "elegida" : "normal";
                    if (revisada) est = i === pregunta.correcta ? "correcta" : elegida === i ? "incorrecta" : "normal";
                    return (
                      <Opcion key={o} estado={est} bloqueada={revisada} onClick={() => setElegida(i)}>
                        {o}
                      </Opcion>
                    );
                  })}
                </div>
              </>
            )
          )}
        </motion.div>
      </AnimatePresence>

      <PieFijo>
        <AnimatePresence>
          {revisada && pregunta && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={`mb-3 rounded-[20px] p-4 ${correcta ? "bg-success/40" : "bg-surface"}`} role="status">
              <p className="font-black">{correcta ? "¡Bien!" : "Casi. La respuesta era otra."}</p>
              <p className="text-[15px] leading-[21px]">{pregunta.explicacion}</p>
            </motion.div>
          )}
        </AnimatePresence>
        {enIdeas ? (
          <Boton onClick={seguir}>Siguiente</Boton>
        ) : !revisada ? (
          <Boton deshabilitado={elegida === null} onClick={revisar}>
            Revisar
          </Boton>
        ) : (
          <Boton variante={correcta ? "exito" : "principal"} onClick={seguir}>
            Continuar
          </Boton>
        )}
      </PieFijo>
    </Pagina>
  );
}
