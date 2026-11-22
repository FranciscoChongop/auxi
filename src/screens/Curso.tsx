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
import { DIAS_CORTOS } from "../lib/horario";
import { navegar, reemplazar, useRuta } from "../lib/rutas";
import { sonidos } from "../lib/sonidos";

function IconoPdf() {
  return (
    <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-surface text-[11px] font-black text-error-dark">PDF</span>
  );
}

function TarjetaTema({ curso, tema, abierto, alAbrir }: { curso: MiCurso; tema: Tema; abierto: boolean; alAbrir: () => void }) {
  const aviso = useAviso();
  const entrada = useRef<HTMLInputElement>(null);
  const [elegir, setElegir] = useState(false);
  const [elegidos, setElegidos] = useState<string[]>([]);
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
    if (!tema.archivos.length) return entrada.current?.click();
    setElegidos(tema.archivos.map((a) => a.id));
    setElegir(true);
  }

  return (
    <motion.div layout className="overflow-hidden rounded-tarjeta border-2 border-surface bg-card">
      <button type="button" onClick={alAbrir} aria-expanded={abierto} className="flex min-h-16 w-full cursor-pointer items-center gap-3 p-4 text-left">
        <span className="flex-1">
          <span className="block text-[18px] leading-6 font-extrabold">{tema.nombre}</span>
          <span className="block text-ayuda text-text-soft">
            {tema.archivos.length} {tema.archivos.length === 1 ? "PDF" : "PDF"}
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
              <Boton onClick={estudiar}>{tema.archivos.length ? "Estudiar este tema" : "Sube un PDF para estudiar"}</Boton>
              <div className="flex justify-between">
                <button type="button" onClick={() => setRenombrar(true)} className="h-11 cursor-pointer font-extrabold text-brand">
                  Cambiar nombre
                </button>
                <button
                  type="button"
                  onClick={() => {
                    tema.archivos.forEach((a) => void borrarArchivo(a.id));
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

      <Ventana abierta={elegir} alCerrar={() => setElegir(false)} titulo="¿Qué PDF estudias?">
        <div className="flex flex-col gap-2">
          {tema.archivos.map((a) => {
            const marcado = elegidos.includes(a.id);
            return (
              <label key={a.id} className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-boton border-2 p-2 ${marcado ? "border-brand bg-surface" : "border-surface bg-card"}`}>
                <input
                  type="checkbox"
                  checked={marcado}
                  onChange={() => setElegidos((x) => (marcado ? x.filter((y) => y !== a.id) : [...x, a.id]))}
                  className="size-5 accent-[var(--brand)]"
                />
                <IconoPdf />
                <span className="min-w-0 flex-1 truncate font-bold">{a.nombre}</span>
              </label>
            );
          })}
        </div>
        <div className="mt-4">
          <Boton
            deshabilitado={!elegidos.length}
            onClick={() => {
              actualizar(() => ({ estudiando: { cursoId: curso.id, temaId: tema.id } }));
              setElegir(false);
              navegar(`/studio/material?curso=${curso.id}&tema=${tema.id}&pdfs=${elegidos.length}`);
            }}
          >
            Crear lección
          </Boton>
        </div>
      </Ventana>

      <Ventana abierta={renombrar} alCerrar={() => setRenombrar(false)} titulo="Nombre del tema">
        <Campo etiqueta="Tema" value={nombre} onChange={(ev) => setNombre(ev.target.value)} />
        <div className="mt-4">
          <Boton
            deshabilitado={!nombre.trim()}
            onClick={() => {
              cambiarTema((t) => ({ ...t, nombre: nombre.trim() }));
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

  const clases = e.horario.filter((c) => c.curso.toLowerCase() === curso.nombre.toLowerCase()).sort((a, b) => a.dia - b.dia || a.inicio.localeCompare(b.inicio));
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

      {clases.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {clases.map((c) => (
            <span key={c.id} className="numeros rounded-full bg-surface px-3 py-2 text-ayuda font-extrabold">
              {DIAS_CORTOS[c.dia]} {c.inicio}–{c.fin}
              {c.aula ? ` · ${c.aula}` : ""}
            </span>
          ))}
        </div>
      )}

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
                // El horario y las entregas siguen al curso si cambia de nombre.
                horario: s.horario.map((h) => (h.curso.toLowerCase() === antes.toLowerCase() ? { ...h, curso: despues } : h)),
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
