import type { InputHTMLAttributes, ReactNode } from "react";

/** Campo de texto con etiqueta, alto de 48 px y foco visible. */
export function Campo({ etiqueta, ...props }: { etiqueta: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block font-bold">
      {etiqueta}
      <input
        {...props}
        className="mt-1 h-12 w-full rounded-boton border-2 border-surface bg-card px-3 font-semibold text-text outline-none placeholder:text-text-soft focus:border-brand"
      />
    </label>
  );
}

/** Grupo de opciones tipo "chips" (días, colores…). */
export function Chips<T extends string | number>({
  opciones,
  valor,
  alCambiar,
  etiqueta,
  render,
}: {
  opciones: T[];
  valor: T;
  alCambiar: (v: T) => void;
  etiqueta: string;
  render?: (v: T, activo: boolean) => ReactNode;
}) {
  return (
    <div role="radiogroup" aria-label={etiqueta} className="flex flex-wrap gap-2">
      {opciones.map((o) => {
        const activo = o === valor;
        return (
          <button
            key={String(o)}
            type="button"
            role="radio"
            aria-checked={activo}
            onClick={() => alCambiar(o)}
            className={`grid h-11 min-w-11 cursor-pointer place-items-center rounded-full border-2 px-3 text-[15px] font-extrabold ${activo ? "border-brand bg-surface text-brand" : "border-surface bg-card text-text-soft"}`}
          >
            {render ? render(o, activo) : String(o)}
          </button>
        );
      })}
    </div>
  );
}

/** Colores discretos para distinguir cursos (franjas y puntos, nunca fondos grandes). */
export const COLORES_CURSO = [
  "var(--brand)",
  "var(--success-dark)",
  "var(--negocio)",
  "var(--reward-dark)",
  "var(--text-soft)",
  "var(--error-dark)",
];
