import { useState } from "react";
import { useAviso } from "./Aviso";
import { Boton } from "./Boton";
import { textoExamen } from "./FilaTema";
import { Ventana } from "./Ventana";
import { cursoDe, opcionesDeTema, esVacio } from "../lib/curso";
import { useEstado } from "../lib/estado";
import { navegar } from "../lib/rutas";
import { sonidos } from "../lib/sonidos";
import { elegirTema } from "../lib/tienda";

/**
 * Dice qué tema estás estudiando y deja cambiarlo en un toque.
 * Orden: exámenes más cercanos, lo que ya empezaste, lo que falta y, al final, lo terminado.
 */
export function SelectorTema({ variante = "tarjeta", etiqueta = "Estudiando" }: { variante?: "tarjeta" | "enlace" | "enlace-claro"; etiqueta?: string }) {
  const e = useEstado();
  const aviso = useAviso();
  const [abierto, setAbierto] = useState(false);
  const actual = cursoDe(e);
  const opciones = opcionesDeTema(e);
  const detalle = opciones.find((o) => o.actual);
  // Cursos con sus temas, en el orden de prioridad de los temas (examen más cercano primero).
  const grupos = [...new Set(opciones.map((o) => o.subtitulo))].map((nombre) => {
    const temas = opciones.filter((o) => o.subtitulo === nombre);
    const examenes = temas.map((o) => o.diasExamen).filter((d): d is number => d !== undefined);
    return { nombre, temas, diasExamen: examenes.length ? Math.min(...examenes) : undefined };
  });
  const [cursoAbierto, setCursoAbierto] = useState<string | null>(() => opciones.find((o) => o.actual)?.subtitulo ?? null);

  if (esVacio(actual)) {
    return (
      <button type="button" onClick={() => navegar("/student/cursos")} className="flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-tarjeta border-2 border-dashed border-brand bg-card px-4 py-2 text-left">
        <span className="min-w-0 flex-1 font-extrabold">Aún no tienes temas</span>
        <span className="shrink-0 font-extrabold text-brand">Agregar el primero</span>
      </button>
    );
  }

  return (
    <>
      {variante === "tarjeta" ? (
        <button
          type="button"
          onClick={() => {
            sonidos.toque();
            setAbierto(true);
          }}
          className="flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-tarjeta border-2 border-surface bg-card px-4 py-2 text-left"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-ayuda font-bold text-text-soft">
              {etiqueta} · {detalle?.subtitulo ?? actual.materia}
            </span>
            <span className="block truncate text-[18px] leading-6 font-extrabold">{actual.titulo}</span>
          </span>
          <span className="shrink-0 font-extrabold text-brand">Cambiar</span>
          <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-text-soft" aria-hidden="true">
            <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setAbierto(true)}
          className={`h-11 cursor-pointer font-extrabold underline underline-offset-4 ${variante === "enlace-claro" ? "text-white" : "text-brand"}`}
        >
          Cambiar de tema
        </button>
      )}

      <Ventana abierta={abierto} alCerrar={() => setAbierto(false)} titulo="¿Qué estudias?">
        <p className="mb-3 text-ayuda text-text-soft">Elige un curso y, dentro, su tema. Los exámenes más cercanos van primero.</p>
        <div className="flex max-h-[54dvh] flex-col gap-2 overflow-y-auto pb-1">
          {grupos.map((g) => {
            const abiertoG = cursoAbierto === g.nombre;
            return (
              <div key={g.nombre} className={`overflow-hidden rounded-tarjeta border-2 ${abiertoG ? "border-brand" : "border-surface"} bg-card`}>
                <button
                  type="button"
                  onClick={() => setCursoAbierto(abiertoG ? null : g.nombre)}
                  aria-expanded={abiertoG}
                  className="flex min-h-14 w-full cursor-pointer items-center gap-3 px-4 py-2 text-left"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-extrabold">{g.nombre}</span>
                    <span className="block text-ayuda text-text-soft">
                      {g.temas.length} {g.temas.length === 1 ? "tema" : "temas"}
                      {g.temas.some((o) => o.actual) ? " · tu tema actual" : ""}
                    </span>
                  </span>
                  {g.diasExamen !== undefined && (
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[12px] font-extrabold ${g.diasExamen <= 3 ? "bg-error text-white" : "bg-surface text-text"}`}>{textoExamen(g.diasExamen)}</span>
                  )}
                  <svg viewBox="0 0 24 24" className={`size-4 shrink-0 text-text-soft transition-transform ${abiertoG ? "rotate-180" : ""}`} aria-hidden="true">
                    <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </button>
                {abiertoG && (
                  <div className="flex flex-col gap-2 border-t-2 border-surface p-2">
                    {g.temas.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => {
                          if (!o.actual) {
                            elegirTema(o.id);
                            sonidos.acierto();
                            aviso(`Ahora estudias «${o.titulo}».`, "exito");
                          }
                          setAbierto(false);
                        }}
                        aria-current={o.actual ? "true" : undefined}
                        className={`flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-boton p-3 text-left ${o.actual ? "bg-surface" : "bg-bg"}`}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-extrabold">{o.titulo}</span>
                          <span className="mt-1 flex items-center gap-2">
                            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface">
                              <span className="block h-full rounded-full bg-success" style={{ width: `${Math.round(o.avance * 100)}%` }} />
                            </span>
                            <span className="numeros text-[12px] font-extrabold text-text-soft">{Math.round(o.avance * 100)} %</span>
                          </span>
                        </span>
                        <span className="flex shrink-0 flex-col items-end gap-1">
                          {o.diasExamen !== undefined && (
                            <span className={`rounded-full px-2 py-0.5 text-[12px] font-extrabold ${o.diasExamen <= 3 ? "bg-error text-white" : "bg-surface text-text"}`}>{textoExamen(o.diasExamen)}</span>
                          )}
                          {o.actual ? (
                            <span className="text-ayuda font-extrabold text-brand">Actual</span>
                          ) : o.avance >= 1 ? (
                            <span className="rounded-full bg-success px-2 py-0.5 text-[12px] font-extrabold text-text">Terminado</span>
                          ) : null}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Boton
            variante="secundario"
            onClick={() => {
              setAbierto(false);
              navegar("/student/cursos");
            }}
          >
            Mis cursos
          </Boton>
          <Boton
            variante="secundario"
            onClick={() => {
              setAbierto(false);
              navegar("/student/examen");
            }}
          >
            Tengo examen
          </Boton>
        </div>
      </Ventana>
    </>
  );
}
