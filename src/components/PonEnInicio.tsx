import { useState } from "react";
import { esAndroid, instalarDirecto, usePuedeInstalarDirecto } from "../lib/instalar";
import { esIphone, estaInstalada, GuiaIphone } from "./GuiaIphone";

/**
 * «Pon Auxi en tu inicio»: instala la app que se está viendo (Student, Vida o la plataforma).
 * - Android con Chrome listo para instalar: abre el aviso de instalación con un toque.
 * - iPhone, o Android sin ese aviso: abre la guía de 3 pasos.
 * No se muestra si ya está instalada, ni en computadoras (ahí no aporta).
 */
export function PonEnInicio({ nombre, variante = "fila" }: { nombre: string; variante?: "fila" | "tarjeta" }) {
  const directo = usePuedeInstalarDirecto();
  const [guia, setGuia] = useState(false);
  if (estaInstalada || !(esIphone || esAndroid || directo)) return null;

  const alTocar = async () => {
    if (directo && (await instalarDirecto())) return;
    if (!directo) setGuia(true);
  };

  return (
    <>
      {variante === "fila" ? (
        <button type="button" onClick={alTocar} className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 text-left font-bold">
          <span>
            Pon {nombre} en tu inicio
            <span className="block text-ayuda font-bold text-text-soft">Se abre como una app, a pantalla completa.</span>
          </span>
          <span className="text-ayuda font-extrabold text-brand">{directo ? "Instalar" : "Ver cómo"}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={alTocar}
          className="flex w-full cursor-pointer items-center gap-4 rounded-tarjeta bg-card p-4 text-left"
          style={{ boxShadow: "0 4px 0 var(--surface)", border: "2px solid var(--surface)" }}
        >
          <img src="/icons/icon-192.png" alt="" width={48} height={48} className="size-12 shrink-0 rounded-[22%]" />
          <span className="flex-1">
            <span className="block font-extrabold">Pon {nombre} en tu inicio</span>
            <span className="block text-ayuda text-text-soft">Se abre como una app, sin la barra del navegador.</span>
          </span>
          <span className="text-ayuda font-extrabold text-brand">{directo ? "Instalar" : "Ver cómo"}</span>
        </button>
      )}
      <GuiaIphone abierta={guia} alCerrar={() => setGuia(false)} sistema={esIphone ? "iphone" : "android"} titulo={`Pon ${nombre} en tu inicio`} />
    </>
  );
}
