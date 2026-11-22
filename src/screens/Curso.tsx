import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { useAviso } from "../components/Aviso";
import { Boton } from "../components/Boton";
import { Campo, Chips, COLORES_CURSO } from "../components/Formulario";
import { Leon } from "../components/Leon";
import { Pantalla } from "../components/Navegacion";
import { Ventana } from "../components/Ventana";
import { abrirArchivo, borrarArchivo, guardarArchivo, pesoBonito, PESO_MAXIMO } from "../lib/archivos";
import { actualizar, nuevoId, useEstado, type MiCurso, type Tema } from "../lib/estado";
import { bonita, diasEntre, hoy } from "../lib/fechas";
import { navegar, reemplazar, useRuta } from "../lib/rutas";
import { moverTema, quitarContenido, renombrarContenido } from "../lib/tienda";
import { sonidos } from "../lib/sonidos";

function IconoPdf() {
  return (
    <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-surface text-[11px] font-black text-error-dark">PDF</span>
  );
}

function TarjetaTema({ curso, tema, abierto, alAbrir }: { curso: MiCurso; tema: Tema; abierto: boolean; alAbrir: () => void }) {
  const aviso = useAviso();
  const entrada = useRef<HTMLInputElement>(null);
  const e = useEstado();
  const contenido = tema.contenidoId ? e.importados[tema.contenidoId] : undefined;
  const [editarContenido, setEditarContenido] = useState(false);
  const [mover, setMover] = useState(false);
  const [renombrar, setRenombrar] = useState(false);
  const [nombre, setNombre] = useState(tema.nombre);

  function cambiarTema(cambio: (t: Tema) => Tema | null) {
    actualizar((s) => ({
      misCursos: s.misCursos.map((c) =>
        c.id !== curso.id ? c : { ...c, temas: c.temas.flatMap((t) => (t.id !== tema.id ? [t] : cambio(t) ?? [])) },
      ),
    }));
  }

  async function subir(archivos: FileList | null) {
    if (!archivos?.length) return;
    const validos = [...archivos].filter((a) => a.size <= PESO_MAXIMO);
    if (validos.length < archivos.length) aviso("Algún PDF pesa más de 25 MB y no se guardó.", "error");
    const infos = await Promise.all(validos.map(guardarArchivo));
    cambiarTema((t) => ({ ...t, archivos: [...t.archivos, ...infos] }));
    if (infos.length) {
      sonidos.acierto();
      aviso(infos.length === 1 ? "PDF guardado." : `${infos.length} PDF guardados.`, "exito");
    }
  }

  function estudiar() {
    if (tema.contenidoId && contenido) {
      actualizar(() => ({ cursoId: contenido.id, estudiando: { cursoId: curso.id, temaId: tema.id } }));
      navegar("/studio/camino");
      return;
    }
    navegar(`/studio/importar?curso=${curso.id}`);
  }

  return (
    <motion.div layout className="overflow-hidden rounded-tarjeta border-2 border-surface bg-card">
      <button type="button" onClick={alAbrir} aria-expanded={abierto} className="flex min-h-16 w-full cursor-pointer items-center gap-3 p-4 text-left">
        <span className="flex-1">
          <span className="block text-[18px] leading-6 font-extrabold">{tema.nombre}</span>
          <span className="block text-ayuda text-text-soft">
            {contenido ? `${contenido.unidades.reduce((n, u) => n + u.lecciones.length, 0)} lecciones · ` : ""}
            {tema.archivos.length} PDF
          </span>
        </span>
        <motion.svg viewBox="0 0 24 24" className="size-5 text-text-soft" animate={{ rotate: abierto ? 180 : 0 }} aria-hidden="true">
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </motion.svg>
      </button>
      <AnimatePresence initial={false}>
        {abierto && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="flex flex-col gap-2 px-4 pb-4">
              {tema.archivos.map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-boton bg-bg p-2">
                  <IconoPdf />
                  <button type="button" onClick={() => void abrirArchivo(a.id)} className="min-h-11 min-w-0 flex-1 cursor-pointer text-left">
                    <span className="block truncate font-bold">{a.nombre}</span>
                    <span className="block text-ayuda text-text-soft">{pesoBonito(a.peso)} · Toca para abrir</span>
                  </button>
                  <button
                    type="button"
                    aria-label={`Quitar ${a.nombre}`}
                    onClick={() => {
                      void borrarArchivo(a.id);
                      cambiarTema((t) => ({ ...t, archivos: t.archivos.filter((x) => x.id !== a.id) }));
                    }}
                    className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full text-text-soft"
                  >
                    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
                      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              ))}
              <Boton variante="secundario" onClick={() => entrada.current?.click()}>
                Agregar PDF
              </Boton>
              <Boton onClick={estudiar}>{contenido ? "Estudiar este tema" : "Crear lección con mi IA"}</Boton>
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
              {!contenido && tema.archivos.length > 0 && <p className="text-ayuda text-text-soft">Sube este PDF a tu IA con el prompt de Auxi, y pega el resultado.</p>}
              <div className="flex justify-between">
                <button type="button" onClick={() => setRenombrar(true)} className="h-11 cursor-pointer font-extrabold text-brand">
                  Cambiar nombre
                </button>
                <button
                  type="button"
                  onClick={() => {
                    tema.archivos.forEach((a) => void borrarArchivo(a.id));
                    if (tema.contenidoId) quitarContenido(tema.contenidoId);
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

      <input ref={entrada} type="file" accept="application/pdf" multiple className="hidden" onChange={(ev) => { void subir(ev.target.files); ev.target.value = ""; }} />

      <Ventana abierta={mover} alCerrar={() => setMover(false)} titulo="Mover a otro curso">
        <p className="mb-3 text-text-soft">El tema se va con sus lecciones, sus PDF y tu avance.</p>
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
          {e.misCursos.length < 2 && <p className="text-text-soft">Crea otro curso en Mis cursos para poder mover el tema.</p>}
        </div>
      </Ventana>

      <Ventana abierta={editarContenido} alCerrar={() => setEditarContenido(false)} titulo="Nombres del tema">
        {contenido && (
          <div className="flex max-h-[55dvh] flex-col gap-4 overflow-y-auto pb-1">
            {contenido.unidades.map((u, ui) => (
              <div key={ui} className="flex flex-col gap-2">
                <Campo etiqueta={`Unidad ${ui + 1}`} defaultValue={u.titulo} onBlur={(ev) => ev.target.value.trim() && renombrarContenido(contenido.id, { unidad: [ui, ev.target.value.trim()] })} />
                {u.lecciones.map((l, li) => (
                  <Campo
                    key={li}
                    etiqueta={`Lección ${li + 1}`}
                    defaultValue={l.titulo}
                    onBlur={(ev) => ev.target.value.trim() && renombrarContenido(contenido.id, { leccion: [ui, li, ev.target.value.trim()] })}
                  />
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
  const [nuevoTema, setNuevoTema] = useState(false);
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

  const entregas = e.entregas.filter((x) => x.curso.toLowerCase() === curso.nombre.toLowerCase()).sort((a, b) => a.fecha.localeCompare(b.fecha));

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
          <p className="mb-1 font-extrabold">Entregas</p>
          {entregas.map((x) => (
            <p key={x.id} className="flex justify-between gap-2 text-[15px] font-bold">
              <span>{x.titulo}</span>
              <span className="text-text-soft">{diasEntre(hoy(), x.fecha) <= 1 ? "¡Ya!" : bonita(x.fecha)}</span>
            </p>
          ))}
        </div>
      )}

      <h2 className="text-tarjeta font-extrabold">Temas</h2>
      {curso.temas.length === 0 && (
        <div className="flex items-center gap-3 rounded-tarjeta border-2 border-dashed border-surface bg-card p-4">
          <Leon pose="anima" alto={90} />
          <p className="font-bold">Crea un tema y sube sus PDF. Luego León te arma la lección.</p>
        </div>
      )}
      {curso.temas.map((t) => (
        <TarjetaTema key={t.id} curso={curso} tema={t} abierto={abierto === t.id} alAbrir={() => setAbierto(abierto === t.id ? null : t.id)} />
      ))}
      <Boton variante="secundario" onClick={() => setNuevoTema(true)}>
        Agregar tema
      </Boton>

      <Ventana abierta={nuevoTema} alCerrar={() => setNuevoTema(false)} titulo="Nuevo tema">
        <Campo etiqueta="Nombre del tema" value={nombreTema} onChange={(ev) => setNombreTema(ev.target.value)} placeholder="Semana 3: La célula" autoFocus />
        <div className="mt-4">
          <Boton
            deshabilitado={!nombreTema.trim()}
            onClick={() => {
              const t: Tema = { id: nuevoId("t"), nombre: nombreTema.trim(), archivos: [] };
              actualizar((s) => ({ misCursos: s.misCursos.map((c) => (c.id === curso.id ? { ...c, temas: [...c.temas, t] } : c)) }));
              setNombreTema("");
              setNuevoTema(false);
              setAbierto(t.id);
            }}
          >
            Crear tema
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
                // Las entregas siguen al curso si cambia de nombre.
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
              curso.temas.forEach((t) => t.archivos.forEach((a) => void borrarArchivo(a.id)));
              actualizar((s) => ({ misCursos: s.misCursos.filter((c) => c.id !== curso.id) }));
              reemplazar("/studio/cursos");
            }}
            className="h-11 cursor-pointer font-extrabold text-error"
          >
            {confirmar ? "Toca otra vez para borrar. No se puede deshacer." : "Borrar curso y sus PDF"}
          </button>
        </div>
      </Ventana>
    </Pantalla>
  );
}
