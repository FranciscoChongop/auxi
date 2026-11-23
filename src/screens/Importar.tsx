import { motion } from "motion/react";
import { useState } from "react";
import { useAviso } from "../components/Aviso";
import { Boton } from "../components/Boton";
import { Campo } from "../components/Formulario";
import { CaraDeLeon } from "../components/Leon";
import { Moneda, Pantalla } from "../components/Navegacion";
import { normalizar } from "../juegos/corregir";
import { lanzarConfeti } from "../lib/confeti";
import { useEstado } from "../lib/estado";
import { IAS, importarDeTexto, PROMPT, type CursoImportado } from "../lib/importar";
import { parametro, reemplazar, navegar } from "../lib/rutas";
import { sonidos } from "../lib/sonidos";
import { comprar, guardarImportacion, hayCupo, importadosUsados, PRECIO_CUPO, cupoTotal } from "../lib/tienda";

function Paso({ n, titulo, children }: { n: number; titulo: string; children: React.ReactNode }) {
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

export default function Importar() {
  const e = useEstado();
  const aviso = useAviso();
  const [copiado, setCopiado] = useState(false);
  const [texto, setTexto] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [datos, setDatos] = useState<CursoImportado | null>(null);
  const [cursoNombre, setCursoNombre] = useState("");
  const [temaNombre, setTemaNombre] = useState("");
  const [destino, setDestino] = useState<string>(() => parametro("curso") ?? "nuevo");
  const [temaFijo] = useState(() => parametro("tema"));

  async function copiar() {
    try {
      await navigator.clipboard.writeText(PROMPT);
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
      const r = importarDeTexto(texto);
      setDatos(r);
      setCursoNombre(r.curso);
      const fijo = e.misCursos.find((c) => c.id === parametro("curso"))?.temas.find((t) => t.id === temaFijo);
      setTemaNombre(fijo ? fijo.nombre : r.tema);
      const igual = e.misCursos.find((c) => normalizar(c.nombre) === normalizar(r.curso));
      if (igual && !parametro("curso")) setDestino(igual.id);
      sonidos.acierto();
    } catch (err) {
      sonidos.error();
      setError((err as Error).message);
    }
  }

  const cursoElegido = e.misCursos.find((c) => c.id === destino) ?? null;
  const yaExiste = !!cursoElegido?.temas.some((t) => t.contenidoId && normalizar(t.nombre) === normalizar(temaNombre));
  const sinCupo = !!datos && !yaExiste && !hayCupo(e);
  const alcanza = e.monedas >= PRECIO_CUPO;
  const lecciones = datos?.unidades.reduce((n, u) => n + u.lecciones.length, 0) ?? 0;

  function guardar() {
    if (!datos) return;
    if (sinCupo) {
      const c = comprar("cupo");
      if (!c.ok) return;
    }
    const r = guardarImportacion({
      cursoId: cursoElegido?.id ?? null,
      cursoNombre: cursoElegido?.nombre ?? cursoNombre.trim(),
      temaNombre: temaNombre.trim(),
      unidades: datos.unidades,
      temaId: temaFijo,
    });
    sonidos.leccionCompleta();
    void lanzarConfeti();
    aviso(r.nuevo ? "¡Listo! Tu tema ya está en Mis cursos." : `Agregué ${r.agregadas} ${r.agregadas === 1 ? "unidad" : "unidades"} a tu tema.`, "exito");
    reemplazar("/teach/camino");
  }

  return (
    <Pantalla titulo="Crea tu lección" atras="/teach/cursos" conBarra={false}>
      <p className="-mt-2 text-text-soft">Tu IA favorita lee tu material. Auxi lo convierte en juego. Gratis.</p>

      <Paso n={1} titulo="Copia el prompt">
        <p className="mb-3 text-text-soft">Ve a tu IA, adjunta tu PDF o tus apuntes y pega este texto.</p>
        <Boton variante={copiado ? "exito" : "principal"} onClick={copiar} sinSonido>
          {copiado ? "¡Copiado!" : "Copiar el prompt"}
        </Boton>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {IAS.map((ia) => (
            <a
              key={ia.nombre}
              href={ia.url}
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-12 place-items-center rounded-boton border-2 border-surface bg-bg text-[15px] font-extrabold text-brand"
            >
              {ia.nombre}
            </a>
          ))}
        </div>
        <details className="mt-3">
          <summary className="flex min-h-11 cursor-pointer items-center font-bold text-text-soft">Ver el prompt</summary>
          <pre className="mt-2 max-h-48 overflow-auto rounded-boton bg-bg p-3 text-[12px] leading-5 font-semibold whitespace-pre-wrap text-text-soft">{PROMPT}</pre>
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
          <Boton deshabilitado={texto.trim().length < 30} onClick={revisar}>
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
          <Paso n={3} titulo={`Encontré ${datos.unidades.length} ${datos.unidades.length === 1 ? "unidad" : "unidades"} y ${lecciones} ${lecciones === 1 ? "lección" : "lecciones"}`}>
            <ul className="mb-4 flex flex-col gap-2">
              {datos.unidades.map((u, i) => (
                <li key={i} className="rounded-boton bg-bg px-3 py-2">
                  <p className="font-extrabold">{u.titulo}</p>
                  <p className="text-ayuda text-text-soft">{u.lecciones.map((l) => l.titulo).join(" · ")}</p>
                </li>
              ))}
            </ul>
            {datos.cortado && (
              <p className="mb-3 rounded-boton bg-surface p-3 text-ayuda font-bold">
                La IA cortó su respuesta. Escríbele «sigue», pega lo que siga y se agrega al mismo tema.
              </p>
            )}
            {datos.descartados > 0 && (
              <p className="mb-3 text-ayuda text-text-soft">Dejé fuera {datos.descartados} {datos.descartados === 1 ? "pregunta" : "preguntas"} que venían mal escritas.</p>
            )}

            <div className="flex flex-col gap-3">
              <div>
                <p className="mb-2 font-bold">¿En qué curso lo pongo?</p>
                <div role="radiogroup" aria-label="Curso" className="flex flex-wrap gap-2">
                  {e.misCursos.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      role="radio"
                      aria-checked={destino === c.id}
                      onClick={() => setDestino(c.id)}
                      className={`min-h-11 cursor-pointer rounded-full border-2 px-4 text-[15px] font-extrabold ${destino === c.id ? "border-brand bg-surface text-brand" : "border-surface bg-card text-text-soft"}`}
                    >
                      {c.nombre}
                    </button>
                  ))}
                  <button
                    type="button"
                    role="radio"
                    aria-checked={destino === "nuevo"}
                    onClick={() => setDestino("nuevo")}
                    className={`min-h-11 cursor-pointer rounded-full border-2 px-4 text-[15px] font-extrabold ${destino === "nuevo" ? "border-brand bg-surface text-brand" : "border-surface bg-card text-text-soft"}`}
                  >
                    + Curso nuevo
                  </button>
                </div>
              </div>
              {destino === "nuevo" && <Campo etiqueta="Nombre del curso" value={cursoNombre} onChange={(ev) => setCursoNombre(ev.target.value)} />}
              <Campo etiqueta="Nombre del tema" value={temaNombre} onChange={(ev) => setTemaNombre(ev.target.value)} />
              {yaExiste && <p className="text-ayuda font-bold text-text-soft">Ese tema ya existe: voy a agregar solo las unidades nuevas.</p>}
            </div>
          </Paso>

          {sinCupo && (
            <section className="rounded-tarjeta border-2 border-reward-dark bg-card p-4">
              <p className="flex items-center gap-2 text-tarjeta font-extrabold">
                <Moneda /> Ya usaste tus {cupoTotal(e)} temas
              </p>
              <p className="mt-1 text-text-soft">
                Tienes {importadosUsados(e)} temas importados. Para otro tema nuevo necesitas un cupo: cuesta {PRECIO_CUPO} monedas. Tus temas de antes siguen abiertos.
              </p>
              <button type="button" onClick={() => navegar("/teach/monedas")} className="mt-2 h-11 cursor-pointer font-extrabold text-brand">
                Ver cómo conseguir monedas
              </button>
            </section>
          )}

          <Boton
            variante={sinCupo ? "premio" : "principal"}
            deshabilitado={!temaNombre.trim() || (destino === "nuevo" && !cursoNombre.trim()) || (sinCupo && !alcanza)}
            onClick={guardar}
          >
            {sinCupo ? (alcanza ? `Usar ${PRECIO_CUPO} monedas y guardar` : `Te faltan ${PRECIO_CUPO - e.monedas} monedas`) : "Guardar en Mis cursos"}
          </Boton>
        </motion.div>
      )}

      <div className="flex items-center gap-3 rounded-tarjeta bg-surface p-3">
        <CaraDeLeon cara="lentes" tamano={44} />
        <p className="text-ayuda font-bold">Consejo: pídele a la IA un tema a la vez. Si se corta, escríbele «sigue».</p>
      </div>
    </Pantalla>
  );
}
