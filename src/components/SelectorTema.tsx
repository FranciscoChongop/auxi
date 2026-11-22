import { useState } from "react";
import { useAviso } from "./Aviso";
import { Boton } from "./Boton";
import { textoExamen } from "./FilaTema";
import { Ventana } from "./Ventana";
import { cursoDe, opcionesDeTema } from "../lib/curso";
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

      <Ventana abierta={abierto} alCerrar={() => setAbierto(false)} titulo="¿Qué tema estudias?">
        <p className="mb-3 text-ayuda text-text-soft">Primero los exámenes más cercanos, luego lo que ya empezaste. Lo terminado va al final.</p>
        <div className="flex max-h-[52dvh] flex-col gap-2 overflow-y-auto pb-1">
          {opciones.map((o) => (
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
              className={`flex min-h-16 w-full cursor-pointer items-center gap-3 rounded-boton border-2 p-3 text-left ${o.actual ? "border-brand bg-surface" : "border-surface bg-card"}`}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate font-extrabold">{o.titulo}</span>
                <span className="block truncate text-ayuda text-text-soft">{o.subtitulo}</span>
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
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Boton
            variante="secundario"
            onClick={() => {
              setAbierto(false);
              navegar("/studio/cursos");
            }}
          >
            Mis cursos
          </Boton>
          <Boton
            variante="secundario"
            onClick={() => {
              setAbierto(false);
              navegar("/studio/examen");
            }}
          >
            Tengo examen
          </Boton>
        </div>
      </Ventana>
    </>
  );
}
