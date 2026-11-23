import { motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { useAviso } from "../components/Aviso";
import { Boton } from "../components/Boton";
import { COLORES_CURSO } from "../components/Formulario";
import { CaraDeLeon } from "../components/Leon";
import { Pantalla } from "../components/Navegacion";
import { normalizar } from "../juegos/corregir";
import { lanzarConfeti } from "../lib/confeti";
import { actualizar, nuevoId, useEstado } from "../lib/estado";
import { bonita } from "../lib/fechas";
import { IAS } from "../lib/importar";
import { reemplazar } from "../lib/rutas";
import { importarSilabo, promptSilabo, type SilaboImportado } from "../lib/silabo";
import { sonidos } from "../lib/sonidos";

function Paso({ n, titulo, children }: { n: number; titulo: string; children: ReactNode }) {
  return (
    <section className="rounded-tarjeta border-2 border-surface bg-card p-4">
      <h2 className="mb-3 flex items-center gap-3 text-tarjeta font-extrabold">
        <span className="grid size-8 place-items-center rounded-full bg-brand text-[16px] font-black text-white">{n}</span>
        {titulo}
      </h2>
      {children}
    </section>
  );
}

export default function Silabo() {
  const e = useEstado();
  const aviso = useAviso();
  const [copiado, setCopiado] = useState(false);
  const [texto, setTexto] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [datos, setDatos] = useState<SilaboImportado | null>(null);
  const prompt = promptSilabo();

  async function copiar() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiado(true);
      sonidos.acierto();
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      aviso("No pude copiar. Mantén presionado el texto y cópialo.", "error");
    }
  }

  async function pegar() {
    try {
      setTexto(await navigator.clipboard.readText());
    } catch {
      aviso("Pega el texto con un toque largo en el cuadro.", "info");
    }
  }

  function revisar() {
    setError(null);
    try {
      setDatos(importarSilabo(texto));
      sonidos.acierto();
    } catch (err) {
      sonidos.error();
      setError((err as Error).message);
    }
  }

  const colorDe = (curso: string) => COLORES_CURSO[e.misCursos.find((c) => normalizar(c.nombre) === normalizar(curso))?.color ?? 0];

  function guardar() {
    if (!datos) return;
    const ya = new Set(e.entregas.map((x) => `${normalizar(x.curso)}|${normalizar(x.titulo)}|${x.fecha}`));
    const nuevas = datos.entregas.filter((x) => !ya.has(`${normalizar(x.curso)}|${normalizar(x.titulo)}|${x.fecha}`));
    actualizar((s) => ({ entregas: [...s.entregas, ...nuevas.map((x) => ({ id: nuevoId("e"), ...x }))] }));
    sonidos.leccionCompleta();
    void lanzarConfeti();
    aviso(nuevas.length ? `Agregué ${nuevas.length} ${nuevas.length === 1 ? "entrega" : "entregas"} a tu calendario.` : "Esas entregas ya estaban guardadas.", nuevas.length ? "exito" : "info");
    reemplazar("/teach/entregas?ver=calendario");
  }

  const cursos = datos ? [...new Set(datos.entregas.map((x) => x.curso))] : [];

  return (
    <Pantalla titulo="Importa tu sílabo" atras="/teach/entregas" conBarra={false}>
      <p className="-mt-2 text-text-soft">Tu IA lee el sílabo. Auxi arma tus entregas y tu calendario.</p>

      <Paso n={1} titulo="Copia el prompt">
        <p className="mb-3 text-text-soft">Ve a tu IA, adjunta tu sílabo y pega este texto.</p>
        <Boton variante={copiado ? "exito" : "principal"} onClick={copiar} sinSonido>
          {copiado ? "¡Copiado!" : "Copiar el prompt"}
        </Boton>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {IAS.map((ia) => (
            <a key={ia.nombre} href={ia.url} target="_blank" rel="noopener noreferrer" className="grid h-12 place-items-center rounded-boton border-2 border-surface bg-bg text-[15px] font-extrabold text-brand">
              {ia.nombre}
            </a>
          ))}
        </div>
        <details className="mt-3">
          <summary className="flex min-h-11 cursor-pointer items-center font-bold text-text-soft">Ver el prompt</summary>
          <pre className="mt-2 max-h-48 overflow-auto rounded-boton bg-bg p-3 text-[12px] leading-5 font-semibold whitespace-pre-wrap text-text-soft">{prompt}</pre>
        </details>
      </Paso>

      <Paso n={2} titulo="Pega lo que te respondió">
        <textarea
          value={texto}
          onChange={(ev) => {
            setTexto(ev.target.value);
            setDatos(null);
            setError(null);
          }}
          placeholder="Pega aquí la respuesta de la IA…"
          aria-label="Respuesta de la IA"
          className="h-40 w-full resize-none rounded-boton border-2 border-surface bg-bg p-3 text-[14px] font-semibold text-text outline-none focus:border-brand"
        />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Boton variante="secundario" onClick={pegar}>
            Pegar
          </Boton>
          <Boton deshabilitado={texto.trim().length < 20} onClick={revisar}>
            Revisar
          </Boton>
        </div>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} role="alert" className="mt-3 rounded-boton border-2 border-error bg-card px-4 py-3 font-bold text-error-dark">
            {error}
          </motion.p>
        )}
      </Paso>

      {datos && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
          <Paso n={3} titulo={`Encontré ${datos.entregas.length} ${datos.entregas.length === 1 ? "entrega" : "entregas"}`}>
            <div className="flex flex-col gap-4">
              {cursos.map((c) => (
                <div key={c}>
                  <p className="mb-1 flex items-center gap-2 font-extrabold">
                    <span className="size-3 rounded-full" style={{ background: colorDe(c) }} />
                    {c}
                  </p>
                  <ul className="flex flex-col gap-1">
                    {datos.entregas
                      .filter((x) => x.curso === c)
                      .map((x, i) => (
                        <li key={i} className="flex items-start justify-between gap-3 rounded-boton bg-bg px-3 py-2">
                          <span className="font-bold">
                            {x.titulo}
                            {x.tipo && <span className="block text-ayuda font-semibold text-text-soft">{x.tipo}</span>}
                          </span>
                          <span className="shrink-0 text-right text-ayuda font-extrabold text-brand">{bonita(x.fecha)}{x.hasta ? ` al ${bonita(x.hasta)}` : ""}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
            {datos.sinFecha.length > 0 && (
              <div className="mt-3 rounded-boton bg-surface p-3">
                <p className="font-extrabold">Sin fecha clara</p>
                <p className="text-ayuda text-text-soft">{datos.sinFecha.join(" · ")}. Agrégalas a mano cuando sepas la fecha.</p>
              </div>
            )}
            {datos.cortado && <p className="mt-3 rounded-boton bg-surface p-3 text-ayuda font-bold">La IA cortó su respuesta. Escríbele «sigue», pega lo que siga y se suma.</p>}
            {datos.descartadas > 0 && <p className="mt-3 text-ayuda text-text-soft">Dejé fuera {datos.descartadas} {datos.descartadas === 1 ? "fila" : "filas"} sin fecha válida.</p>}
          </Paso>
          <Boton onClick={guardar}>Guardar en mi calendario</Boton>
        </motion.div>
      )}

      <div className="flex items-center gap-3 rounded-tarjeta bg-surface p-3">
        <CaraDeLeon cara="lentes" tamano={44} />
        <p className="text-ayuda font-bold">Revisa las fechas antes de guardar: la IA a veces se equivoca. Puedes corregir cada una después.</p>
      </div>
    </Pantalla>
  );
}
