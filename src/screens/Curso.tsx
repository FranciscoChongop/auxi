import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useAviso } from "../components/Aviso";
import { Boton } from "../components/Boton";
import { textoExamen } from "../components/FilaTema";
import { Campo, Chips, COLORES_CURSO } from "../components/Formulario";
import { Leon } from "../components/Leon";
import { Pantalla } from "../components/Navegacion";
import { Ventana } from "../components/Ventana";
import { borrarArchivo } from "../lib/archivos";
import { todosLosTemas } from "../lib/curso";
import { actualizar, useEstado, type MiCurso, type Tema } from "../lib/estado";
import { bonita, diasEntre, hoy, sumarDias } from "../lib/fechas";
import { navegar, parametro, reemplazar, useRuta } from "../lib/rutas";
import { crearTema, estudiarTema, moverTema, ponerExamen, quitarContenido, renombrarContenido } from "../lib/tienda";

function TarjetaTema({ curso, tema, abierto, alAbrir }: { curso: MiCurso; tema: Tema; abierto: boolean; alAbrir: () => void }) {
  const aviso = useAviso();
  const e = useEstado();
  const info = todosLosTemas(e).find((t) => t.tema.id === tema.id)!;
  const contenido = info.contenido;
  const [editarContenido, setEditarContenido] = useState(false);
  const [mover, setMover] = useState(false);
  const [renombrar, setRenombrar] = useState(false);
  const [examen, setExamen] = useState(false);
  const [fecha, setFecha] = useState(tema.examen ?? sumarDias(hoy(), 7));
  const [nombre, setNombre] = useState(tema.nombre);

  function cambiarTema(cambio: (t: Tema) => Tema | null) {
    actualizar((s) => ({
      misCursos: s.misCursos.map((c) => (c.id !== curso.id ? c : { ...c, temas: c.temas.flatMap((t) => (t.id !== tema.id ? [t] : cambio(t) ?? [])) })),
    }));
  }

  return (
    <motion.div layout className="overflow-hidden rounded-tarjeta border-2 border-surface bg-card">
      <button type="button" onClick={alAbrir} aria-expanded={abierto} className="flex min-h-16 w-full cursor-pointer items-center gap-3 p-4 text-left">
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[18px] leading-6 font-extrabold">{tema.nombre}</span>
          <span className="block text-ayuda text-text-soft">
            {contenido ? `${contenido.unidades.reduce((n, u) => n + u.lecciones.length, 0)} lecciones · ${Math.round(info.avance * 100)} %` : "Falta crear las lecciones"}
          </span>
        </span>
        {info.diasExamen !== undefined && (
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-extrabold ${info.diasExamen <= 3 ? "bg-error text-white" : "bg-surface text-text"}`}>{textoExamen(info.diasExamen)}</span>
        )}
        <motion.svg viewBox="0 0 24 24" className="size-5 shrink-0 text-text-soft" animate={{ rotate: abierto ? 180 : 0 }} aria-hidden="true">
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </motion.svg>
      </button>
      <AnimatePresence initial={false}>
        {abierto && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="flex flex-col gap-2 px-4 pb-4">
              <Boton onClick={() => estudiarTema(info, navegar)}>{contenido ? "Estudiar este tema" : "Crear lecciones con mi IA"}</Boton>
              <Boton variante="secundario" onClick={() => setExamen(true)}>
                {tema.examen ? `Examen: ${bonita(tema.examen)}` : "Tengo examen de este tema"}
              </Boton>
              {contenido && (
                <div className="grid grid-cols-2 gap-3">
                  <Boton variante="secundario" onClick={() => setEditarContenido(true)}>
                    Editar nombres
                  </Boton>
                  <Boton variante="secundario" onClick={() => setMover(true)}>
                    Mover
                  </Boton>
                </div>
              )}
              <div className="flex justify-between">
                <button type="button" onClick={() => setRenombrar(true)} className="h-11 cursor-pointer font-extrabold text-brand">
                  Cambiar nombre
                </button>
                <button
                  type="button"
                  onClick={() => {
                    tema.archivos.forEach((a) => void borrarArchivo(a.id));
                    if (tema.contenidoId) quitarContenido(tema.contenidoId);
                    ponerExamen(curso.id, tema.id, null);
                    cambiarTema(() => null);
                  }}
                  className="h-11 cursor-pointer font-extrabold text-error"
                >
                  Quitar tema
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Ventana abierta={examen} alCerrar={() => setExamen(false)} titulo="¿Cuándo es tu examen?">
        <Campo etiqueta="Fecha del examen" type="date" value={fecha} min={hoy()} onChange={(ev) => setFecha(ev.target.value)} />
        <p className="mt-2 text-ayuda text-text-soft">Este tema pasa al inicio de tu lista y el examen se suma a tu calendario.</p>
        <div className="mt-4 flex flex-col gap-3">
          <Boton
            deshabilitado={!fecha || diasEntre(hoy(), fecha) < 0}
            onClick={() => {
              ponerExamen(curso.id, tema.id, fecha);
              setExamen(false);
              aviso("Listo. Este tema va primero.", "exito");
            }}
          >
            Guardar examen
          </Boton>
          {tema.examen && (
            <button
              type="button"
              onClick={() => {
                ponerExamen(curso.id, tema.id, null);
                setExamen(false);
              }}
              className="h-11 cursor-pointer font-extrabold text-error"
            >
              Quitar el examen
            </button>
          )}
        </div>
      </Ventana>

      <Ventana abierta={mover} alCerrar={() => setMover(false)} titulo="Mover a otro curso">
        <p className="mb-3 text-text-soft">El tema se va con sus lecciones y tu avance.</p>
        <div className="flex flex-col gap-2">
          {e.misCursos
            .filter((c) => c.id !== curso.id)
            .map((c) => (
              <Boton
                key={c.id}
                variante="secundario"
                onClick={() => {
                  moverTema(tema.id, curso.id, c.id);
                  setMover(false);
                  aviso(`Lo moví a ${c.nombre}.`, "exito");
                }}
              >
                {c.nombre}
              </Boton>
            ))}
          {e.misCursos.length < 2 && <p className="text-text-soft">Crea otro curso para poder mover el tema.</p>}
        </div>
      </Ventana>

      <Ventana abierta={editarContenido} alCerrar={() => setEditarContenido(false)} titulo="Nombres del tema">
        {contenido && (
          <div className="flex max-h-[55dvh] flex-col gap-4 overflow-y-auto pb-1">
            {contenido.unidades.map((u, ui) => (
              <div key={ui} className="flex flex-col gap-2">
                <Campo etiqueta={`Unidad ${ui + 1}`} defaultValue={u.titulo} onBlur={(ev) => ev.target.value.trim() && renombrarContenido(contenido.id, { unidad: [ui, ev.target.value.trim()] })} />
                {u.lecciones.map((l, li) => (
                  <Campo key={li} etiqueta={`Lección ${li + 1}`} defaultValue={l.titulo} onBlur={(ev) => ev.target.value.trim() && renombrarContenido(contenido.id, { leccion: [ui, li, ev.target.value.trim()] })} />
                ))}
              </div>
            ))}
          </div>
        )}
        <div className="mt-4">
          <Boton onClick={() => setEditarContenido(false)}>Listo</Boton>
        </div>
      </Ventana>

      <Ventana abierta={renombrar} alCerrar={() => setRenombrar(false)} titulo="Nombre del tema">
        <Campo etiqueta="Tema" value={nombre} onChange={(ev) => setNombre(ev.target.value)} />
        <div className="mt-4">
          <Boton
            deshabilitado={!nombre.trim()}
            onClick={() => {
              cambiarTema((t) => ({ ...t, nombre: nombre.trim() }));
              if (tema.contenidoId) renombrarContenido(tema.contenidoId, { tema: nombre.trim() });
              setRenombrar(false);
            }}
          >
            Guardar
          </Boton>
        </div>
      </Ventana>
    </motion.div>
  );
}

export default function Curso() {
  const ruta = useRuta();
  const e = useEstado();
  const id = ruta.split("/")[3];
  const curso = e.misCursos.find((c) => c.id === id);
  const [abierto, setAbierto] = useState<string | null>(null);
  const [nuevoTema, setNuevoTema] = useState(() => parametro("nuevoTema") === "1");
  const [nombreTema, setNombreTema] = useState("");
  const [editar, setEditar] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  const [datos, setDatos] = useState({ nombre: curso?.nombre ?? "", profesor: curso?.profesor ?? "", color: curso?.color ?? 0 });

  if (!curso) {
    return (
      <Pantalla titulo="Curso" atras="/studio/cursos">
        <p className="text-text-soft">No encontré este curso.</p>
        <Boton onClick={() => reemplazar("/studio/cursos")}>Ver mis cursos</Boton>
      </Pantalla>
    );
  }

  const entregas = e.entregas.filter((x) => x.curso.toLowerCase() === curso.nombre.toLowerCase() && diasEntre(hoy(), x.fecha) >= 0).sort((a, b) => a.fecha.localeCompare(b.fecha));

  return (
    <Pantalla
      titulo={curso.nombre}
      atras="/studio/cursos"
      derecha={
        <button type="button" onClick={() => setEditar(true)} className="h-11 cursor-pointer px-2 font-extrabold text-brand">
          Editar
        </button>
      }
    >
      <div className="-mt-2 flex items-center gap-2 text-text-soft">
        <span className="size-3 rounded-full" style={{ background: COLORES_CURSO[curso.color] }} />
        {curso.profesor ? `Prof. ${curso.profesor}` : "Toca Editar para poner a tu profe"}
      </div>

      {entregas.length > 0 && (
        <div className="rounded-tarjeta bg-surface p-3">
          <p className="mb-1 font-extrabold">Próximas entregas</p>
          {entregas.slice(0, 4).map((x) => (
            <p key={x.id} className="flex justify-between gap-2 text-[15px] font-bold">
              <span>{x.titulo}</span>
              <span className="shrink-0 text-text-soft">{diasEntre(hoy(), x.fecha) <= 1 ? "¡Ya!" : bonita(x.fecha)}</span>
            </p>
          ))}
        </div>
      )}

      <h2 className="text-tarjeta font-extrabold">Temas</h2>
      {curso.temas.length === 0 && (
        <div className="flex items-center gap-3 rounded-tarjeta border-2 border-dashed border-surface bg-card p-4">
          <Leon pose="anima" alto={90} />
          <p className="font-bold">Agrega tu primer tema. Te paso el prompt para tu IA y armo las lecciones.</p>
        </div>
      )}
      {curso.temas.map((t) => (
        <TarjetaTema key={t.id} curso={curso} tema={t} abierto={abierto === t.id} alAbrir={() => setAbierto(abierto === t.id ? null : t.id)} />
      ))}
      <Boton variante={curso.temas.length ? "secundario" : "principal"} onClick={() => setNuevoTema(true)}>
        Agregar tema
      </Boton>

      <Ventana abierta={nuevoTema} alCerrar={() => setNuevoTema(false)} titulo="Nuevo tema">
        <Campo etiqueta="Nombre del tema" value={nombreTema} onChange={(ev) => setNombreTema(ev.target.value)} placeholder="Semana 3: La célula" autoFocus />
        <p className="mt-2 text-ayuda text-text-soft">Sigue el prompt: lo copias, subes tu material a ChatGPT, Claude o Gemini, y pegas el resultado.</p>
        <div className="mt-4">
          <Boton
            deshabilitado={!nombreTema.trim()}
            onClick={() => {
              const temaId = crearTema(curso.id, nombreTema);
              setNombreTema("");
              setNuevoTema(false);
              navegar(`/studio/importar?curso=${curso.id}&tema=${temaId}`);
            }}
          >
            Seguir
          </Boton>
        </div>
      </Ventana>

      <Ventana abierta={editar} alCerrar={() => { setEditar(false); setConfirmar(false); }} titulo="Editar curso">
        <div className="flex flex-col gap-3">
          <Campo etiqueta="Nombre" value={datos.nombre} onChange={(ev) => setDatos({ ...datos, nombre: ev.target.value })} />
          <Campo etiqueta="Profesor (opcional)" value={datos.profesor} onChange={(ev) => setDatos({ ...datos, profesor: ev.target.value })} />
          <div>
            <p className="mb-1 font-bold">Color</p>
            <Chips
              etiqueta="Color"
              opciones={[0, 1, 2, 3, 4, 5]}
              valor={datos.color}
              alCambiar={(color) => setDatos({ ...datos, color })}
              render={(c) => <span className="size-5 rounded-full" style={{ background: COLORES_CURSO[c] }} />}
            />
          </div>
          <Boton
            deshabilitado={!datos.nombre.trim()}
            onClick={() => {
              const antes = curso.nombre;
              const despues = datos.nombre.trim();
              actualizar((s) => ({
                misCursos: s.misCursos.map((c) => (c.id === curso.id ? { ...c, nombre: despues, profesor: datos.profesor.trim() || undefined, color: datos.color } : c)),
                entregas: s.entregas.map((x) => (x.curso.toLowerCase() === antes.toLowerCase() ? { ...x, curso: despues } : x)),
              }));
              setEditar(false);
            }}
          >
            Guardar
          </Boton>
          <button
            type="button"
            onClick={() => {
              if (!confirmar) return setConfirmar(true);
              curso.temas.forEach((t) => {
                if (t.contenidoId) quitarContenido(t.contenidoId);
                ponerExamen(curso.id, t.id, null);
              });
              actualizar((s) => ({ misCursos: s.misCursos.filter((c) => c.id !== curso.id) }));
              reemplazar("/studio/cursos");
            }}
            className="h-11 cursor-pointer font-extrabold text-error"
          >
            {confirmar ? "Toca otra vez para borrar. No se puede deshacer." : "Borrar curso y sus temas"}
          </button>
        </div>
      </Ventana>
    </Pantalla>
  );
}
