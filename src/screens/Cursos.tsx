import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useAviso } from "../components/Aviso";
import { Boton } from "../components/Boton";
import { Campo, Chips, COLORES_CURSO } from "../components/Formulario";
import { CaraDeLeon, Leon } from "../components/Leon";
import { Pantalla } from "../components/Navegacion";
import { Ventana } from "../components/Ventana";
import { borrarArchivo, guardarArchivo, leerArchivo, PESO_MAXIMO } from "../lib/archivos";
import { actualizar, cursosDesdeHorario, nuevoId, useEstado, type MiCurso } from "../lib/estado";
import { compartirOGuardar, dibujarHorario } from "../lib/exportarHorario";
import { leerFotoDeHorario } from "../lib/fotoHorario";
import { DIAS_CORTOS, DIAS_LARGOS, diaDeHoy, leerArchivoDeHorario, type Clase } from "../lib/horario";
import { entradaEnCascada } from "../lib/movimiento";
import { navegar } from "../lib/rutas";
import { sonidos } from "../lib/sonidos";

export function colorDe(cursos: MiCurso[], nombre: string) {
  const c = cursos.find((x) => x.nombre.toLowerCase() === nombre.toLowerCase());
  return COLORES_CURSO[c?.color ?? 0];
}

/** Próxima clase de un curso a partir de ahora. */
export function proximaClase(horario: Clase[], curso?: string) {
  const ahora = new Date();
  const hoy = diaDeHoy(ahora);
  const minutos = ahora.getHours() * 60 + ahora.getMinutes();
  const aMin = (h: string) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3));
  // Minutos que faltan para que termine cada clase (si ya terminó esta semana, la de la próxima).
  const falta = (c: Clase) => {
    const d = ((c.dia - hoy + 7) % 7) * 1440 + aMin(c.fin) - minutos;
    return d < 0 ? d + 7 * 1440 : d;
  };
  return horario
    .filter((c) => !curso || c.curso.toLowerCase() === curso.toLowerCase())
    .sort((a, b) => falta(a) - falta(b))[0];
}

/* ---------- Editor de una clase ---------- */

function EditorClase({ clase, cursos, alGuardar, alBorrar }: { clase: Clase; cursos: MiCurso[]; alGuardar: (c: Clase) => void; alBorrar?: () => void }) {
  const [c, setC] = useState(clase);
  return (
    <div className="flex flex-col gap-3">
      <Campo etiqueta="Curso" value={c.curso} list="lista-cursos" onChange={(e) => setC({ ...c, curso: e.target.value })} placeholder="Matemática, Biología…" />
      <datalist id="lista-cursos">
        {cursos.map((x) => (
          <option key={x.id} value={x.nombre} />
        ))}
      </datalist>
      <div>
        <p className="mb-1 font-bold">Día</p>
        <Chips etiqueta="Día" opciones={[0, 1, 2, 3, 4, 5, 6]} valor={c.dia} alCambiar={(dia) => setC({ ...c, dia })} render={(d) => DIAS_CORTOS[d]} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Campo etiqueta="Empieza" type="time" value={c.inicio} onChange={(e) => setC({ ...c, inicio: e.target.value })} />
        <Campo etiqueta="Termina" type="time" value={c.fin} onChange={(e) => setC({ ...c, fin: e.target.value })} />
      </div>
      <Campo etiqueta="Aula (opcional)" value={c.aula ?? ""} onChange={(e) => setC({ ...c, aula: e.target.value || undefined })} placeholder="A-204" />
      <Boton deshabilitado={!c.curso.trim() || !c.inicio || !c.fin || c.fin <= c.inicio} onClick={() => alGuardar({ ...c, curso: c.curso.trim() })}>
        Guardar clase
      </Boton>
      {alBorrar && (
        <button type="button" onClick={alBorrar} className="h-11 cursor-pointer font-extrabold text-error">
          Quitar esta clase
        </button>
      )}
    </div>
  );
}

/* ---------- Horario ---------- */

function Horario() {
  const e = useEstado();
  const aviso = useAviso();
  const excel = useRef<HTMLInputElement>(null);
  const foto = useRef<HTMLInputElement>(null);
  const [dia, setDia] = useState(diaDeHoy());
  const [editando, setEditando] = useState<Clase | null>(null);
  const [nueva, setNueva] = useState(false);
  const [verFoto, setVerFoto] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const [leyendo, setLeyendo] = useState(false);
  const [propuesta, setPropuesta] = useState<{ clases: Clase[]; mensaje: string } | null>(null);
  const [exportada, setExportada] = useState<{ blob: Blob; url: string } | null>(null);
  const clasesDia = e.horario.filter((c) => c.dia === dia).sort((a, b) => a.inicio.localeCompare(b.inicio));
  const vacio = e.horario.length === 0 && !e.horarioImagen;

  async function subirExcel(archivo?: File) {
    if (!archivo) return;
    setMenu(false);
    try {
      const clases = await leerArchivoDeHorario(archivo);
      if (!clases.length) {
        aviso("No encontré clases. Revisa que tenga días y horas.", "error");
        return;
      }
      actualizar(() => ({ horario: clases }));
      cursosDesdeHorario(clases);
      sonidos.acierto();
      aviso(`Listo: ${clases.length} clases en tu horario.`, "exito");
    } catch {
      aviso("No pude abrir ese archivo. Prueba con .xlsx o .csv.", "error");
    }
  }

  async function subirFoto(archivo?: File) {
    if (!archivo) return;
    setMenu(false);
    if (archivo.size > PESO_MAXIMO) return aviso("La foto pesa mucho. Prueba con una más liviana.", "error");
    if (e.horarioImagen) await borrarArchivo(e.horarioImagen.id);
    const info = await guardarArchivo(archivo);
    actualizar(() => ({ horarioImagen: info }));
    // León lee la foto y propone el horario; la persona confirma antes de reemplazar nada.
    setLeyendo(true);
    const r = await leerFotoDeHorario(archivo);
    setLeyendo(false);
    if (r.ok) {
      sonidos.acierto();
      setPropuesta({ clases: r.clases, mensaje: r.mensaje });
    } else if (r.sinClave) {
      aviso("Guardé la foto. La lectura automática se activa pronto.", "info");
    } else {
      aviso(r.mensaje, "error");
    }
  }

  async function exportar() {
    try {
      const blob = await dibujarHorario(e.horario, e.misCursos, COLORES_CURSO);
      setExportada({ blob, url: URL.createObjectURL(blob) });
    } catch {
      aviso("No pude crear la imagen. Inténtalo otra vez.", "error");
    }
  }

  async function abrirFoto() {
    if (!e.horarioImagen) return;
    const blob = await leerArchivo(e.horarioImagen.id);
    if (blob) setVerFoto(URL.createObjectURL(blob));
  }

  useEffect(() => () => void (verFoto && URL.revokeObjectURL(verFoto)), [verFoto]);
  useEffect(() => () => void (exportada && URL.revokeObjectURL(exportada.url)), [exportada]);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-tarjeta font-extrabold">Mi horario</h2>
        {!vacio && (
          <button type="button" onClick={() => setMenu(true)} className="h-11 cursor-pointer px-2 font-extrabold text-brand">
            Cambiar
          </button>
        )}
      </div>

      {vacio ? (
        <div className="flex flex-col gap-3 rounded-tarjeta border-2 border-dashed border-surface bg-card p-4">
          <div className="flex items-center gap-3">
            <CaraDeLeon cara="lentes" tamano={48} />
            <p className="font-bold">Tómale foto a tu horario y lo armo por ti.</p>
          </div>
          <Boton onClick={() => foto.current?.click()}>Subir foto del horario</Boton>
          <div className="grid grid-cols-2 gap-3">
            <Boton variante="secundario" onClick={() => excel.current?.click()}>
              Excel
            </Boton>
            <Boton variante="secundario" onClick={() => setNueva(true)}>
              A mano
            </Boton>
          </div>
        </div>
      ) : (
        <>
          {e.horario.length > 0 && (
            <>
              <div className="flex gap-1" role="tablist" aria-label="Día">
                {DIAS_CORTOS.map((d, i) => {
                  const n = e.horario.filter((c) => c.dia === i).length;
                  return (
                    <button
                      key={d}
                      type="button"
                      role="tab"
                      aria-selected={dia === i}
                      onClick={() => setDia(i)}
                      className={`relative flex h-14 min-w-0 flex-1 cursor-pointer flex-col items-center justify-center rounded-[12px] text-[14px] font-extrabold ${dia === i ? "bg-brand text-white" : "bg-card text-text-soft"}`}
                    >
                      {d}
                      <span className={`mt-1 size-1.5 rounded-full ${n ? (dia === i ? "bg-white" : "bg-brand") : "bg-transparent"}`} />
                      {i === diaDeHoy() && dia !== i && <span className="absolute top-1 right-1 size-1.5 rounded-full bg-success-dark" />}
                    </button>
                  );
                })}
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={dia} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.16 }} className="flex flex-col gap-2">
                  {clasesDia.length === 0 && <p className="rounded-tarjeta bg-surface p-4 text-center text-text-soft">{DIAS_LARGOS[dia]} libre.</p>}
                  {clasesDia.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setEditando(c)}
                      className="flex cursor-pointer items-center gap-3 overflow-hidden rounded-tarjeta border-2 border-surface bg-card py-3 pr-3 text-left"
                    >
                      <span className="w-1.5 self-stretch rounded-r-full" style={{ background: colorDe(e.misCursos, c.curso) }} />
                      <span className="numeros w-24 shrink-0 text-[15px] font-black">
                        {c.inicio}
                        <span className="block text-ayuda font-bold text-text-soft">{c.fin}</span>
                      </span>
                      <span className="flex-1">
                        <span className="block font-extrabold">{c.curso}</span>
                        {c.aula && <span className="block text-ayuda text-text-soft">Aula {c.aula}</span>}
                      </span>
                    </button>
                  ))}
                </motion.div>
              </AnimatePresence>
            </>
          )}
          {e.horarioImagen && (
            <button type="button" onClick={abrirFoto} className="flex cursor-pointer items-center gap-3 rounded-tarjeta border-2 border-surface bg-card p-3 text-left">
              <span className="grid size-12 place-items-center rounded-[12px] bg-surface text-brand">
                <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
                  <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
                    <circle cx="9" cy="10" r="1.8" />
                    <path d="M20.5 16l-5-5-8 8.5" />
                  </g>
                </svg>
              </span>
              <span className="flex-1">
                <span className="block font-extrabold">Foto de tu horario</span>
                <span className="block text-ayuda text-text-soft">Toca para verla</span>
              </span>
            </button>
          )}
          {e.horarioImagen && e.horario.length === 0 && (
            <p className="text-ayuda text-text-soft">Pronto León leerá la foto y armará tus clases. Mientras, puedes agregarlas a mano.</p>
          )}
          <div className={`grid gap-3 ${e.horario.length ? "grid-cols-2" : ""}`}>
            {e.horario.length > 0 && <Boton onClick={exportar}>Exportar</Boton>}
            <Boton variante="secundario" onClick={() => setNueva(true)}>
              Agregar clase
            </Boton>
          </div>
        </>
      )}

      <input ref={excel} type="file" accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv" className="hidden" onChange={(ev) => { void subirExcel(ev.target.files?.[0]); ev.target.value = ""; }} />
      <input ref={foto} type="file" accept="image/*" className="hidden" onChange={(ev) => { void subirFoto(ev.target.files?.[0]); ev.target.value = ""; }} />

      <Ventana abierta={menu} alCerrar={() => setMenu(false)} titulo="Cambiar horario">
        <div className="flex flex-col gap-3">
          <Boton onClick={() => foto.current?.click()}>Subir otra foto</Boton>
          <Boton variante="secundario" onClick={() => excel.current?.click()}>
            Subir Excel
          </Boton>
          <p className="text-ayuda text-text-soft">Excel: días en una fila y horas en la primera columna, o columnas Día, Inicio, Fin y Curso.</p>
          <button
            type="button"
            onClick={() => {
              if (e.horarioImagen) void borrarArchivo(e.horarioImagen.id);
              actualizar(() => ({ horario: [], horarioImagen: null }));
              setMenu(false);
            }}
            className="h-11 cursor-pointer font-extrabold text-error"
          >
            Borrar horario
          </button>
        </div>
      </Ventana>

      <Ventana abierta={nueva} alCerrar={() => setNueva(false)} titulo="Nueva clase">
        <EditorClase
          clase={{ id: nuevoId("h"), curso: "", dia, inicio: "08:00", fin: "09:30" }}
          cursos={e.misCursos}
          alGuardar={(c) => {
            actualizar((s) => ({ horario: [...s.horario, c] }));
            cursosDesdeHorario([c]);
            setDia(c.dia);
            setNueva(false);
            aviso("Clase agregada.", "exito");
          }}
        />
      </Ventana>

      <Ventana abierta={!!editando} alCerrar={() => setEditando(null)} titulo="Editar clase">
        {editando && (
          <EditorClase
            key={editando.id}
            clase={editando}
            cursos={e.misCursos}
            alGuardar={(c) => {
              actualizar((s) => ({ horario: s.horario.map((x) => (x.id === c.id ? c : x)) }));
              cursosDesdeHorario([c]);
              setEditando(null);
            }}
            alBorrar={() => {
              actualizar((s) => ({ horario: s.horario.filter((x) => x.id !== editando.id) }));
              setEditando(null);
            }}
          />
        )}
      </Ventana>

      {/* León leyendo la foto */}
      <AnimatePresence>
        {leyendo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-5 bg-bg px-8 text-center"
            role="status"
            aria-live="polite"
          >
            <Leon pose="pensativo" alto={220} rebote />
            <p className="text-tarjeta font-extrabold">Leyendo tu horario…</p>
            <div className="w-full max-w-xs">
              <BarraIndeterminada />
            </div>
            <p className="text-ayuda text-text-soft">Busco cursos, días y horas. Toma unos segundos.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <Ventana abierta={!!propuesta} alCerrar={() => setPropuesta(null)} titulo={`Encontré ${propuesta?.clases.length ?? 0} clases`}>
        {propuesta && (
          <>
            {propuesta.mensaje && <p className="mb-3 text-text-soft">{propuesta.mensaje}</p>}
            <div className="flex max-h-[42dvh] flex-col gap-2 overflow-y-auto">
              {[0, 1, 2, 3, 4, 5, 6].map((d) => {
                const del = propuesta.clases.filter((c) => c.dia === d).sort((a, b) => a.inicio.localeCompare(b.inicio));
                if (!del.length) return null;
                return (
                  <div key={d}>
                    <p className="text-ayuda font-extrabold text-text-soft">{DIAS_LARGOS[d]}</p>
                    {del.map((c) => (
                      <p key={c.id} className="numeros flex gap-3 py-1 font-bold">
                        <span className="w-28 shrink-0 text-text-soft">
                          {c.inicio}–{c.fin}
                        </span>
                        <span>
                          {c.curso}
                          {c.aula ? ` · ${c.aula}` : ""}
                        </span>
                      </p>
                    ))}
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-ayuda text-text-soft">Revisa que esté bien. Luego puedes corregir cualquier clase tocándola.</p>
            <div className="mt-4 flex flex-col gap-3">
              <Boton
                onClick={() => {
                  actualizar(() => ({ horario: propuesta.clases }));
                  cursosDesdeHorario(propuesta.clases);
                  setDia(propuesta.clases.some((c) => c.dia === diaDeHoy()) ? diaDeHoy() : propuesta.clases[0].dia);
                  setPropuesta(null);
                  aviso("Horario listo. Tus cursos ya están creados.", "exito");
                }}
              >
                Usar este horario
              </Boton>
              <Boton variante="secundario" onClick={() => setPropuesta(null)}>
                No, lo hago a mano
              </Boton>
            </div>
          </>
        )}
      </Ventana>

      <Ventana abierta={!!exportada} alCerrar={() => setExportada(null)} titulo="Tu horario en imagen">
        {exportada && (
          <>
            <img src={exportada.url} alt="Tu horario ordenado" className="max-h-[52dvh] w-full rounded-tarjeta border-2 border-surface object-contain" />
            <div className="mt-4">
              <Boton
                onClick={async () => {
                  const r = await compartirOGuardar(exportada.blob);
                  if (r === "descargado") aviso("Imagen guardada en tus descargas.", "exito");
                }}
              >
                Compartir o guardar
              </Boton>
            </div>
          </>
        )}
      </Ventana>

      <Ventana abierta={!!verFoto} alCerrar={() => setVerFoto(null)} titulo="Tu horario">
        {verFoto && <img src={verFoto} alt="Foto de tu horario" className="max-h-[60dvh] w-full rounded-tarjeta object-contain" />}
      </Ventana>
    </section>
  );
}

function BarraIndeterminada() {
  return (
    <div className="h-4 w-full overflow-hidden rounded-full bg-surface" aria-hidden="true">
      <motion.div
        className="h-full w-1/3 rounded-full bg-success"
        animate={{ x: ["-100%", "300%"] }}
        transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
      />
    </div>
  );
}

/* ---------- Pantalla ---------- */

export default function Cursos() {
  const e = useEstado();
  const [nuevo, setNuevo] = useState(false);
  const [nombre, setNombre] = useState("");

  return (
    <Pantalla titulo="Mis cursos">
      <Horario />

      <section className="flex flex-col gap-3">
        <h2 className="text-tarjeta font-extrabold">Cursos</h2>
        {e.misCursos.length === 0 && <p className="text-text-soft">Aún no tienes cursos. Sube tu horario o agrega uno.</p>}
        {e.misCursos.map((c, i) => {
          const pdfs = c.temas.reduce((n, t) => n + t.archivos.length, 0);
          const prox = proximaClase(e.horario, c.nombre);
          return (
            <motion.button
              key={c.id}
              {...entradaEnCascada(i)}
              type="button"
              onClick={() => navegar(`/studio/cursos/${c.id}`)}
              onPointerDown={() => sonidos.toque()}
              whileTap={{ y: 3, boxShadow: "0 1px 0 var(--surface)", transition: { duration: 0.06 } }}
              style={{ boxShadow: "0 4px 0 var(--surface)" }}
              className="flex cursor-pointer items-center gap-3 overflow-hidden rounded-tarjeta border-2 border-surface bg-card py-4 pr-4 text-left"
            >
              <span className="w-1.5 self-stretch rounded-r-full" style={{ background: COLORES_CURSO[c.color] }} />
              <span className="flex-1">
                <span className="block text-[18px] leading-6 font-extrabold">{c.nombre}</span>
                <span className="block text-ayuda text-text-soft">
                  {c.temas.length} {c.temas.length === 1 ? "tema" : "temas"} · {pdfs} PDF
                  {prox ? ` · ${DIAS_CORTOS[prox.dia]} ${prox.inicio}` : ""}
                </span>
              </span>
              <svg viewBox="0 0 24 24" className="size-5 text-text-soft" aria-hidden="true">
                <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.button>
          );
        })}
        <Boton variante="secundario" onClick={() => setNuevo(true)}>
          Agregar curso
        </Boton>
      </section>

      <Ventana abierta={nuevo} alCerrar={() => setNuevo(false)} titulo="Nuevo curso">
        <Campo etiqueta="Nombre del curso" value={nombre} onChange={(ev) => setNombre(ev.target.value)} placeholder="Matemática I" autoFocus />
        <div className="mt-4">
          <Boton
            deshabilitado={!nombre.trim()}
            onClick={() => {
              const id = nuevoId("c");
              actualizar((s) => ({ misCursos: [...s.misCursos, { id, nombre: nombre.trim(), color: s.misCursos.length % 6, temas: [] }] }));
              setNombre("");
              setNuevo(false);
              navegar(`/studio/cursos/${id}`);
            }}
          >
            Crear curso
          </Boton>
        </div>
      </Ventana>
    </Pantalla>
  );
}
