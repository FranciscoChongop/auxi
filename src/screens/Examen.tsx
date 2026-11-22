import { motion } from "motion/react";
import { useState } from "react";
import { Boton } from "../components/Boton";
import { Campo } from "../components/Formulario";
import { Leon } from "../components/Leon";
import { Pantalla } from "../components/Navegacion";
import { lanzarConfeti } from "../lib/confeti";
import { todosLosTemas } from "../lib/curso";
import { useEstado } from "../lib/estado";
import { bonita, diasEntre, hoy, sumarDias } from "../lib/fechas";
import { navegar, parametro } from "../lib/rutas";
import { sonidos } from "../lib/sonidos";
import { crearCurso, crearTema, estudiarTema, ponerExamen } from "../lib/tienda";

function Seccion({ n, titulo, children }: { n: number; titulo: string; children: React.ReactNode }) {
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

function Opciones({ valor, items, nuevo, alElegir, etiqueta }: { valor: string; items: { id: string; texto: string }[]; nuevo: string; alElegir: (id: string) => void; etiqueta: string }) {
  return (
    <div role="radiogroup" aria-label={etiqueta} className="flex flex-wrap gap-2">
      {[...items, { id: "nuevo", texto: nuevo }].map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={valor === o.id}
          onClick={() => {
            sonidos.toque();
            alElegir(o.id);
          }}
          className={`min-h-11 cursor-pointer rounded-full border-2 px-4 text-[15px] font-extrabold ${valor === o.id ? "border-brand bg-surface text-brand" : "border-surface bg-card text-text-soft"}`}
        >
          {o.texto}
        </button>
      ))}
    </div>
  );
}

/** "¿Tienes un examen? Cuéntame": curso → tema → fecha. Pone ese tema primero y lleva a estudiar. */
export default function Examen() {
  const e = useEstado();
  const [cursoId, setCursoId] = useState<string>(() => parametro("curso") ?? (e.misCursos.length ? e.misCursos[0].id : "nuevo"));
  const [cursoNuevo, setCursoNuevo] = useState("");
  const [temaId, setTemaId] = useState<string>(() => parametro("tema") ?? "");
  const [temaNuevo, setTemaNuevo] = useState("");
  const [fecha, setFecha] = useState(sumarDias(hoy(), 7));
  const [listo, setListo] = useState<{ curso: string; tema: string; idCurso: string; idTema: string } | null>(null);

  const curso = e.misCursos.find((c) => c.id === cursoId);
  const temas = curso?.temas ?? [];
  const temaElegido = temaId === "" ? (temas[0]?.id ?? "nuevo") : temaId;
  const puedeGuardar =
    (cursoId !== "nuevo" || cursoNuevo.trim()) && (temaElegido !== "nuevo" || temaNuevo.trim()) && fecha && diasEntre(hoy(), fecha) >= 0;

  function guardar() {
    const idCurso = cursoId === "nuevo" ? crearCurso(cursoNuevo) : cursoId;
    const idTema = temaElegido === "nuevo" ? crearTema(idCurso, temaNuevo) : temaElegido;
    ponerExamen(idCurso, idTema, fecha);
    sonidos.leccionCompleta();
    void lanzarConfeti();
    const c = e.misCursos.find((x) => x.id === idCurso);
    setListo({
      curso: c?.nombre ?? cursoNuevo.trim(),
      tema: c?.temas.find((t) => t.id === idTema)?.nombre ?? temaNuevo.trim(),
      idCurso,
      idTema,
    });
  }

  if (listo) {
    const info = todosLosTemas(e).find((t) => t.tema.id === listo.idTema);
    const d = diasEntre(hoy(), fecha);
    return (
      <Pantalla titulo="Examen anotado" atras="/studio/inicio" conBarra={false}>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <Leon pose="anima" alto={200} rebote />
          <h2 className="text-titulo font-black">¡Vamos con todo!</h2>
          <p className="text-text-soft">
            <span className="font-extrabold text-text">{listo.tema}</span> ({listo.curso}) va primero.
            <br />
            Examen: {bonita(fecha)} · {d === 0 ? "hoy" : d === 1 ? "mañana" : `en ${d} días`}
          </p>
          <p className="max-w-[32ch] text-ayuda text-text-soft">Ya está en tu calendario, con avisos 7, 3 y 1 día antes.</p>
        </div>
        <div className="flex flex-col gap-3">
          {info ? (
            <Boton onClick={() => estudiarTema(info, navegar)}>{info.contenido ? "Empezar a estudiar" : "Subir mi material y crear lecciones"}</Boton>
          ) : (
            <Boton onClick={() => navegar(`/studio/importar?curso=${listo.idCurso}&tema=${listo.idTema}`)}>Subir mi material y crear lecciones</Boton>
          )}
          <Boton variante="secundario" onClick={() => navegar("/studio/inicio")}>
            Ahora no
          </Boton>
        </div>
      </Pantalla>
    );
  }

  return (
    <Pantalla titulo="¿Tienes un examen?" atras="/studio/inicio" conBarra={false}>
      <p className="-mt-2 text-text-soft">Cuéntame de qué es y cuándo. Lo pongo primero y armo tu plan.</p>

      <Seccion n={1} titulo="¿De qué curso?">
        <Opciones
          etiqueta="Curso"
          valor={cursoId}
          items={e.misCursos.map((c) => ({ id: c.id, texto: c.nombre }))}
          nuevo="+ Curso nuevo"
          alElegir={(id) => {
            setCursoId(id);
            setTemaId("");
          }}
        />
        {cursoId === "nuevo" && (
          <div className="mt-3">
            <Campo etiqueta="Nombre del curso" value={cursoNuevo} onChange={(ev) => setCursoNuevo(ev.target.value)} placeholder="Matemática I" />
          </div>
        )}
      </Seccion>

      <Seccion n={2} titulo="¿Qué tema entra?">
        <Opciones etiqueta="Tema" valor={temaElegido} items={temas.map((t) => ({ id: t.id, texto: t.nombre }))} nuevo="+ Tema nuevo" alElegir={setTemaId} />
        {temaElegido === "nuevo" && (
          <div className="mt-3">
            <Campo etiqueta="Nombre del tema" value={temaNuevo} onChange={(ev) => setTemaNuevo(ev.target.value)} placeholder="Derivadas" />
          </div>
        )}
      </Seccion>

      <Seccion n={3} titulo="¿Cuándo es?">
        <div className="mb-3 flex flex-wrap gap-2">
          {[
            ["Mañana", 1],
            ["En 3 días", 3],
            ["En 1 semana", 7],
            ["En 2 semanas", 14],
          ].map(([t, d]) => (
            <button
              key={t}
              type="button"
              onClick={() => setFecha(sumarDias(hoy(), d as number))}
              className={`min-h-11 cursor-pointer rounded-full border-2 px-4 text-[15px] font-extrabold ${fecha === sumarDias(hoy(), d as number) ? "border-brand bg-surface text-brand" : "border-surface bg-card text-text-soft"}`}
            >
              {t}
            </button>
          ))}
        </div>
        <Campo etiqueta="Fecha del examen" type="date" value={fecha} min={hoy()} onChange={(ev) => setFecha(ev.target.value)} />
      </Seccion>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-auto">
        <Boton deshabilitado={!puedeGuardar} onClick={guardar}>
          Anotar mi examen
        </Boton>
      </motion.div>
    </Pantalla>
  );
}
